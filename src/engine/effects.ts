import type {
  Character,
  CharCode,
  Connection,
  ConnectionType,
  Effect,
  RollCheck,
  RollLogEntry,
  SkillEntry,
  SkillName,
  SkillRef,
  TableRef,
} from '../types';
import { assertNever } from '../types';
import { computeNewSkillLevel, capCharValue } from './cap';
import { charDM } from './selectors';
import { roll1d, roll2d, rollSpec, type Rng, defaultRng } from './dice';
import {
  AGING_TABLE,
  CAREERS,
  INJURY_TABLE,
  LIFE_EVENTS,
  UNUSUAL_EVENTS,
} from '../data';

/* ─────────────── State ─────────────── */

export type EngineState = {
  character: Character;
  queue: Effect[];
  prompt?: Prompt;
  context: string[];
  /** DMs queued for the next future roll of each kind. */
  pendingDMs: {
    nextSurvival?: number;
    nextAdvancement?: number;
    nextQualification?: number;
    /** DM applied to whichever benefit roll the player decides to spend it on. */
    benefitRollDMs: number[];
  };
  /** Career-flow signals collected during the term. */
  flags: {
    ejected?: boolean;
    forcedNextCareer?: string;
    forcedDraft?: boolean;
    autoPromote?: boolean;
    autoCommission?: boolean;
    mustContinue?: boolean;
    extraSkillRolls?: number;
    benefitRollsDelta?: number; // gain - lose (across this resolution)
    paroleThresholdDelta?: number;
    paroleRerolled?: boolean;
    psionEligibility?: boolean;
  };
  /** "Current career being resolved" — set by the wizard before pushing effects. */
  currentCareerId?: string;
};

export type Prompt =
  | {
      kind: 'choice';
      effect: Extract<Effect, { type: 'choice' }>;
      /** A title for the prompt — derived from context. */
      title: string;
    }
  | {
      kind: 'check';
      effect: Extract<Effect, { type: 'check' }>;
      title: string;
      /** Pre-computed DM breakdown from current state. */
      dms: { source: string; value: number }[];
    }
  | {
      kind: 'pick_skill';
      level: number;
      from?: SkillRef[];
      existingOnly?: boolean;
      excludeJoat?: boolean;
      /** Optional source tag attached to the granted SkillEntry. */
      source: SkillEntry['source'];
      title: string;
    }
  | {
      kind: 'pick_char';
      chars: CharCode[];
      delta: number;
      title: string;
    }
  | {
      kind: 'pick_connection_type';
      choices: ConnectionType[];
      count: number;
      title: string;
    }
  | {
      kind: 'name_connection';
      type: ConnectionType;
      title: string;
    }
  | {
      kind: 'wager_benefit_rolls';
      effect: Extract<Effect, { type: 'wager_benefit_rolls' }>;
      title: string;
    }
  | {
      kind: 'note';
      text: string;
    };

export const blankEngineState = (character: Character): EngineState => ({
  character,
  queue: [],
  context: [],
  pendingDMs: { benefitRollDMs: [] },
  flags: {},
});

/* ─────────────── Public API ─────────────── */

export const enqueue = (s: EngineState, effects: Effect[]): EngineState => ({
  ...s,
  queue: [...effects, ...s.queue],
});

export const pushContext = (s: EngineState, ctx: string): EngineState => ({
  ...s,
  context: [...s.context, ctx],
});

export const popContext = (s: EngineState): EngineState => ({
  ...s,
  context: s.context.slice(0, -1),
});

/** Drive the engine until it finishes the queue or pauses on a prompt. */
export const drain = (state: EngineState, rng: Rng = defaultRng): EngineState => {
  let s = state;
  while (!s.prompt && s.queue.length > 0) {
    s = step(s, rng);
  }
  return s;
};

/** Advance by one effect. Caller must resolve prompts before stepping again. */
export const step = (state: EngineState, rng: Rng = defaultRng): EngineState => {
  if (state.prompt) throw new Error('Cannot step while a prompt is pending');
  const [head, ...rest] = state.queue;
  if (!head) return state;
  const s: EngineState = { ...state, queue: rest };
  return apply(s, head, rng);
};

/* ─────────────── Prompt resolution ─────────────── */

/** Resolve a `choice` prompt by selecting one option's effects to enqueue at the front. */
export const resolveChoice = (state: EngineState, optionIndex: number, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'choice') throw new Error('Not waiting on a choice');
  const option = state.prompt.effect.options[optionIndex];
  if (!option) throw new Error(`Bad option index ${optionIndex}`);
  const after: EngineState = { ...state, prompt: undefined, queue: [...option.effects, ...state.queue] };
  return drain(after, rng);
};

/**
 * Resolve a `check` prompt. The caller supplies the natural 2D total (the actual dice)
 * AND the modified total used to compare to the target. The engine doesn't apply DMs
 * itself — the UI computes them from the prompt.dms breakdown and shows them to the player.
 *
 * The natural roll matters for the onNaturalTwo branch.
 */
export const resolveCheck = (
  state: EngineState,
  natural: number,
  modifiedTotal: number,
  rng: Rng = defaultRng,
  source: 'rng' | 'manual' = 'manual',
): EngineState => {
  if (state.prompt?.kind !== 'check') throw new Error('Not waiting on a check');
  const effect = state.prompt.effect;
  const success = modifiedTotal >= effect.roll.target;
  const log: RollLogEntry = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    context: [...state.context, state.prompt.title].join(' / '),
    target: effect.roll.target,
    dms: state.prompt.dms,
    natural,
    result: modifiedTotal,
    success,
    source,
  };
  const branch: Effect[] = [];
  if (success) branch.push(...effect.onSuccess);
  else branch.push(...effect.onFailure);
  if (natural === 2 && effect.onNaturalTwo) branch.push(...effect.onNaturalTwo);

  const after: EngineState = {
    ...state,
    character: { ...state.character, rollLog: [...state.character.rollLog, log] },
    prompt: undefined,
    queue: [...branch, ...state.queue],
  };
  return drain(after, rng);
};

/** Resolve a pick_skill prompt by committing a SkillEntry. */
export const resolvePickSkill = (state: EngineState, ref: SkillRef, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'pick_skill') throw new Error('Not waiting on pick_skill');
  const p = state.prompt;
  const after = grantSkill({ ...state, prompt: undefined }, ref, p.level, p.source);
  return drain(after, rng);
};

/** Resolve a pick_char prompt by committing a characteristic delta. */
export const resolvePickChar = (state: EngineState, char: CharCode, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'pick_char') throw new Error('Not waiting on pick_char');
  const after = applyCharDelta({ ...state, prompt: undefined }, char, state.prompt.delta);
  return drain(after, rng);
};

/** Resolve a pick_connection_type prompt by stating the desired type. Engine then prompts to name it. */
export const resolvePickConnectionType = (
  state: EngineState,
  type: ConnectionType,
  rng: Rng = defaultRng,
): EngineState => {
  if (state.prompt?.kind !== 'pick_connection_type') throw new Error('Not waiting on pick_connection_type');
  // Replace prompt with a name_connection prompt for the first one; remaining count handled via re-enqueue.
  const remaining = state.prompt.count - 1;
  const after: EngineState = {
    ...state,
    prompt: { kind: 'name_connection', type, title: state.prompt.title },
  };
  if (remaining > 0) {
    return enqueue(after, [
      { type: 'gain_connection', connection: type, count: { fixed: remaining } },
    ]);
  }
  return drain(after, rng);
};

/**
 * Resolve a name_connection prompt by committing the named NPC.
 * The wizard may opt to skip naming and supply '' — connection is recorded with description ''.
 */
export const resolveNameConnection = (state: EngineState, description: string, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'name_connection') throw new Error('Not waiting on name_connection');
  const conn: Connection = {
    id: crypto.randomUUID(),
    type: state.prompt.type,
    description,
  };
  const after: EngineState = {
    ...state,
    prompt: undefined,
    character: addConnection(state.character, conn),
  };
  return drain(after, rng);
};

/** Acknowledge a `note` prompt. */
export const acknowledgeNote = (state: EngineState, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'note') throw new Error('Not waiting on note');
  const after: EngineState = { ...state, prompt: undefined };
  return drain(after, rng);
};

/** Resolve a wager prompt by stating how many benefit rolls were wagered + the natural/total. */
export const resolveWager = (
  state: EngineState,
  wagered: number,
  natural: number,
  modifiedTotal: number,
  rng: Rng = defaultRng,
): EngineState => {
  if (state.prompt?.kind !== 'wager_benefit_rolls') throw new Error('Not waiting on wager');
  const e = state.prompt.effect;
  const success = modifiedTotal >= e.check.target;
  void natural; // not used; reserved for future "natural 2" rules on wagers.
  const log: RollLogEntry = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    context: [...state.context, state.prompt.title].join(' / '),
    target: e.check.target,
    result: modifiedTotal,
    success,
    source: 'manual',
  };
  let benefitDelta = -wagered;
  if (success) {
    const reward = e.onSuccessRoundUp ? Math.ceil(wagered * e.onSuccessMultiplier) : Math.floor(wagered * e.onSuccessMultiplier);
    benefitDelta += reward;
  }
  const queue = [...state.queue];
  if (e.grantSkillEither) {
    queue.unshift({ type: 'gain_skill', skill: { name: e.grantSkillEither }, level: 1 });
  }
  const after: EngineState = {
    ...state,
    prompt: undefined,
    queue,
    character: { ...state.character, rollLog: [...state.character.rollLog, log] },
    flags: {
      ...state.flags,
      benefitRollsDelta: (state.flags.benefitRollsDelta ?? 0) + benefitDelta,
    },
  };
  return drain(after, rng);
};

/* ─────────────── Apply ─────────────── */

const apply = (state: EngineState, e: Effect, rng: Rng): EngineState => {
  switch (e.type) {
    case 'gain_skill':
      return grantSkill(state, e.skill, e.level, { kind: 'manual' });
    case 'gain_skill_choice':
      return {
        ...state,
        prompt: {
          kind: 'pick_skill',
          level: e.level,
          from: e.from,
          existingOnly: e.existingOnly,
          excludeJoat: e.excludeJoat,
          source: { kind: 'manual' },
          title: state.context.at(-1) ?? 'Choose a skill',
        },
      };
    case 'modify_char':
      return applyCharDelta(state, e.char, e.delta);
    case 'modify_char_choice':
      return {
        ...state,
        prompt: { kind: 'pick_char', chars: e.chars, delta: e.delta, title: state.context.at(-1) ?? 'Choose a characteristic' },
      };
    case 'gain_injury': {
      const injury: Character['injuries'][number] = {
        id: crypto.randomUUID(),
        description: e.description,
        termIndex: state.character.careerHistory.length,
        charReductions: {},
      };
      return {
        ...state,
        character: { ...state.character, injuries: [...state.character.injuries, injury] },
      };
    }
    case 'gain_connection': {
      const count = resolveCount(e.count, rng);
      if (count <= 0) return state;
      return {
        ...state,
        prompt: { kind: 'name_connection', type: e.connection, title: state.context.at(-1) ?? 'Name the connection' },
        queue: count > 1
          ? [{ type: 'gain_connection', connection: e.connection, count: { fixed: count - 1 } }, ...state.queue]
          : state.queue,
      };
    }
    case 'gain_connection_choice':
      return {
        ...state,
        prompt: {
          kind: 'pick_connection_type',
          choices: e.choices,
          count: resolveCount(e.count, rng),
          title: state.context.at(-1) ?? 'Choose connection type',
        },
      };
    case 'convert_connection':
      // Surfaced as a UI step; for the engine, leave it as a manual NOP that the wizard handles.
      return { ...state, prompt: { kind: 'note', text: 'Manually convert one Contact/Ally to a Rival/Enemy (or gain a new one if none).' } };
    case 'gain_benefit_rolls':
      return { ...state, flags: { ...state.flags, benefitRollsDelta: (state.flags.benefitRollsDelta ?? 0) + e.count } };
    case 'lose_benefit_rolls':
      return {
        ...state,
        flags: {
          ...state.flags,
          benefitRollsDelta: (state.flags.benefitRollsDelta ?? 0) - (e.count === 'all' ? 999 : e.count),
        },
      };
    case 'next_benefit_roll_dm':
      return { ...state, pendingDMs: { ...state.pendingDMs, benefitRollDMs: [...state.pendingDMs.benefitRollDMs, e.dm] } };
    case 'next_advancement_dm':
      return { ...state, pendingDMs: { ...state.pendingDMs, nextAdvancement: (state.pendingDMs.nextAdvancement ?? 0) + e.dm } };
    case 'next_qualification_dm':
      return { ...state, pendingDMs: { ...state.pendingDMs, nextQualification: (state.pendingDMs.nextQualification ?? 0) + e.dm } };
    case 'next_survival_dm':
      return { ...state, pendingDMs: { ...state.pendingDMs, nextSurvival: (state.pendingDMs.nextSurvival ?? 0) + e.dm } };
    case 'gain_benefit':
    case 'gain_ship_share':
      return { ...state, prompt: { kind: 'note', text: `Benefit acquired: ${describeBenefit(e)}.` } };
    case 'auto_promote':
      return { ...state, flags: { ...state.flags, autoPromote: true } };
    case 'auto_commission':
      return { ...state, flags: { ...state.flags, autoCommission: true } };
    case 'eject_career':
      return { ...state, flags: { ...state.flags, ejected: true } };
    case 'must_continue_career':
      return { ...state, flags: { ...state.flags, mustContinue: true } };
    case 'force_career':
      return { ...state, flags: { ...state.flags, forcedNextCareer: e.career } };
    case 'force_draft':
      return { ...state, flags: { ...state.flags, forcedDraft: true } };
    case 'extra_skill_roll':
      return { ...state, flags: { ...state.flags, extraSkillRolls: (state.flags.extraSkillRolls ?? 0) + e.count } };
    case 'modify_parole_threshold':
      return { ...state, flags: { ...state.flags, paroleThresholdDelta: (state.flags.paroleThresholdDelta ?? 0) + e.delta } };
    case 'reroll_parole_threshold':
      return { ...state, flags: { ...state.flags, paroleRerolled: true } };
    case 'roll_on_table':
      return rollOnTable(state, e.table, rng);
    case 'roll_on_other_career_events':
      return rollOnTable(state, { kind: 'career_events', career: e.career }, rng);
    case 'roll_on_other_career_mishap':
      return rollOnTable(state, { kind: 'career_mishaps', career: e.career }, rng);
    case 'roll_on_other_career_assignment_skill_table': {
      const career = CAREERS[e.career as keyof typeof CAREERS];
      if (!career) throw new Error(`Unknown career: ${e.career}`);
      // If assignment fixed, roll directly; else prompt the player to pick.
      const assignment = e.assignment
        ? career.assignments.find((a) => a.id === e.assignment)
        : undefined;
      if (assignment) {
        const r = roll1d(rng);
        const row = assignment.skillTable.find((x) => x.roll === r);
        if (!row) return state;
        return enqueue({ ...state }, [row.effect]);
      }
      const choiceEffect: Extract<Effect, { type: 'choice' }> = {
        type: 'choice',
        prompt: `Pick a ${career.name} assignment skill table to roll on`,
        options: career.assignments.map((a) => ({
          label: a.name,
          effects: [
            { type: 'roll_on_other_career_assignment_skill_table', career: e.career, assignment: a.id },
          ],
        })),
      };
      return apply(state, choiceEffect, rng);
    }
    case 'note':
      return { ...state, prompt: { kind: 'note', text: e.text } };
    case 'gain_psion_eligibility':
      return { ...state, flags: { ...state.flags, psionEligibility: true } };
    case 'allow_career_without_qualification':
      // Track via note for now; engine allows the wizard to bypass qualification next term if set.
      return { ...state, prompt: { kind: 'note', text: `Next term you may take ${e.career} without a qualification roll.` } };
    case 'choice':
      return { ...state, prompt: { kind: 'choice', effect: e, title: e.prompt } };
    case 'check': {
      const dms = computeCheckDMs(state, e.roll);
      return { ...state, prompt: { kind: 'check', effect: e, dms, title: state.context.at(-1) ?? checkTitle(e.roll) } };
    }
    case 'wager_benefit_rolls':
      return { ...state, prompt: { kind: 'wager_benefit_rolls', effect: e, title: state.context.at(-1) ?? 'Wager benefit rolls' } };
    default:
      return assertNever(e);
  }
};

/* ─────────────── Helpers ─────────────── */

const grantSkill = (state: EngineState, ref: SkillRef, level: number | undefined, source: SkillEntry['source']): EngineState => {
  const newLevel = computeNewSkillLevel(getCurrentLevel(state.character, ref), level);
  if (newLevel <= 0) return state;
  const character = upsertSkill(state.character, { ...ref, level: newLevel, source });
  return { ...state, character };
};

const upsertSkill = (c: Character, entry: SkillEntry): Character => {
  const list = [...c.backgroundSkills];
  const idx = list.findIndex((s) => s.name === entry.name && (s.spec ?? '') === (entry.spec ?? ''));
  if (idx === -1) list.push(entry);
  else if (entry.level > list[idx]!.level) list[idx] = entry;
  return { ...c, backgroundSkills: list };
};

const getCurrentLevel = (c: Character, ref: SkillRef): number => {
  const e = c.backgroundSkills.find((s) => s.name === ref.name && (s.spec ?? '') === (ref.spec ?? ''));
  return e?.level ?? 0;
};

const applyCharDelta = (state: EngineState, char: CharCode, delta: number): EngineState => {
  const cur = state.character.characteristics[char];
  const { value } = capCharValue(cur, delta);
  return {
    ...state,
    character: { ...state.character, characteristics: { ...state.character.characteristics, [char]: value } },
  };
};

const addConnection = (c: Character, conn: Connection): Character => {
  const key = (`${conn.type}s` as 'contacts' | 'allies' | 'rivals' | 'enemies');
  return { ...c, connections: { ...c.connections, [key]: [...c.connections[key], conn] } };
};

const resolveCount = (count: { fixed: number } | { dice: '1D' | '2D' | 'D3' } | undefined, rng: Rng): number => {
  if (!count) return 1;
  if ('fixed' in count) return count.fixed;
  return rollSpec(count.dice, rng);
};

const computeCheckDMs = (state: EngineState, roll: RollCheck): { source: string; value: number }[] => {
  // During creation, no skill DMs are added except where rules explicitly do (they don't on character-creation checks).
  // We surface only the queued situational DMs where they're relevant.
  const dms: { source: string; value: number }[] = [];
  if (roll.kind === 'char') {
    const dm = charDM(state.character, roll.char);
    if (dm !== 0) dms.push({ source: `${roll.char} DM`, value: dm });
  }
  return dms;
};

const checkTitle = (roll: RollCheck): string => {
  if (roll.kind === 'char') return `${roll.char} ${roll.target}+`;
  return `${roll.skill.name}${roll.skill.spec ? ` (${roll.skill.spec})` : ''} ${roll.target}+`;
};

const rollOnTable = (state: EngineState, table: TableRef, rng: Rng): EngineState => {
  switch (table.kind) {
    case 'injury': {
      const r = roll1d(rng);
      const row = INJURY_TABLE.find((x) => x.roll === r);
      if (!row) return state;
      return enqueue(pushContext(state, `Injury → ${r}`), row.effects);
    }
    case 'life_events': {
      const { total } = roll2d(rng);
      const row = LIFE_EVENTS.find((x) => x.roll === total);
      if (!row) return state;
      return enqueue(pushContext(state, `Life Event → ${total}`), row.effects);
    }
    case 'unusual_events': {
      const r = roll1d(rng);
      const row = UNUSUAL_EVENTS.find((x) => x.roll === r);
      if (!row) return state;
      return enqueue(pushContext(state, `Unusual Event → ${r}`), row.effects);
    }
    case 'aging': {
      const { total } = roll2d(rng);
      const terms = state.character.careerHistory.length;
      const net = total - terms;
      const row = AGING_TABLE.find((r) => (typeof r.result === 'number' ? r.result === net : net <= r.result.atMost));
      if (!row) return state;
      return enqueue(pushContext(state, `Aging → ${net}`), row.effects);
    }
    case 'draft':
      // Engine shouldn't fully resolve drafts — they affect the wizard's career flow. Mark the flag.
      return { ...state, flags: { ...state.flags, forcedDraft: true } };
    case 'career_events': {
      const career = CAREERS[table.career as keyof typeof CAREERS];
      if (!career) return state;
      const { total } = roll2d(rng);
      const row = career.events.find((e) => e.roll === total);
      if (!row) return state;
      return enqueue(pushContext(state, `${career.name} Event → ${total}`), row.effects);
    }
    case 'career_mishaps': {
      const career = CAREERS[table.career as keyof typeof CAREERS];
      if (!career) return state;
      const r = roll1d(rng);
      const row = career.mishaps.find((m) => m.roll === r);
      if (!row) return state;
      return enqueue(pushContext(state, `${career.name} Mishap → ${r}`), row.effects);
    }
    case 'career_assignment_skills': {
      const career = CAREERS[table.career as keyof typeof CAREERS];
      if (!career) return state;
      // Player picks an assignment.
      const choiceEffect: Extract<Effect, { type: 'choice' }> = {
        type: 'choice',
        prompt: `Pick a ${career.name} assignment skill table`,
        options: career.assignments.map((a) => ({
          label: a.name,
          effects: [
            { type: 'roll_on_other_career_assignment_skill_table', career: career.id, assignment: a.id },
          ],
        })),
      };
      return apply(state, choiceEffect, rng);
    }
  }
};

const describeBenefit = (e: Extract<Effect, { type: 'gain_benefit' } | { type: 'gain_ship_share' }>): string => {
  if (e.type === 'gain_ship_share') {
    const c = e.count;
    if (!c) return '1 Ship Share';
    if ('fixed' in c) return `${c.fixed} Ship Share${c.fixed === 1 ? '' : 's'}`;
    return `${c.dice} Ship Shares`;
  }
  return e.benefit.type.replace(/_/g, ' ');
};

/* ─────────────── Skill picker resolution ─────────────── */

/**
 * Resolve a `pick_skill` prompt without an explicit ref by listing all candidate skills.
 * UI consumes this to render a select.
 */
export const candidateSkillsForPrompt = (state: EngineState): SkillRef[] => {
  if (state.prompt?.kind !== 'pick_skill') return [];
  const p = state.prompt;
  if (p.from && p.from.length > 0) return p.from;
  if (p.existingOnly) {
    return state.character.backgroundSkills.map(({ name, spec }) => ({ name, ...(spec ? { spec } : {}) }));
  }
  // All skills, optionally excluding JoaT.
  const names: SkillName[] = [
    'Admin', 'Advocate', 'Animals', 'Art', 'Astrogation', 'Athletics', 'Broker', 'Carouse', 'Deception',
    'Diplomat', 'Drive', 'Electronics', 'Engineer', 'Explosives', 'Flyer', 'Gambler', 'Gun Combat',
    'Gunner', 'Heavy Weapons', 'Investigate', 'Jack-of-all-Trades', 'Language', 'Leadership', 'Mechanic',
    'Medic', 'Melee', 'Navigation', 'Persuade', 'Pilot', 'Profession', 'Recon', 'Science', 'Seafarer',
    'Stealth', 'Steward', 'Streetwise', 'Survival', 'Tactics', 'Vacc Suit',
  ];
  return names
    .filter((n) => !(p.excludeJoat && n === 'Jack-of-all-Trades'))
    .map((name) => ({ name }));
};
