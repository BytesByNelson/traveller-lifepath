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
import { debug } from '../debug';
import {
  AGING_TABLE,
  CAREERS,
  CATALOGUE,
  INJURY_TABLE,
  LIFE_EVENTS,
  SKILLS,
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
      /** Target level. Undefined means "+1 bump" (if you have it, +1; if not, gain at level 1). */
      level?: number;
      from?: SkillRef[];
      existingOnly?: boolean;
      excludeJoat?: boolean;
      /** Optional source tag attached to the granted SkillEntry. */
      source: SkillEntry['source'];
      title: string;
      /** Forwarded from the gain_skill_choice effect — see Effect type for semantics. */
      followUpCheck?: {
        target: number;
        description?: string;
        onSuccess: Effect[];
        onFailure: Effect[];
      };
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
      /** When the same event grants multiple of the same connection type (e.g. D3 Allies). */
      progress?: { current: number; total: number };
    }
  | {
      kind: 'convert_connection';
      title: string;
      /** Connections currently held that can be converted (filtered by `from` type). */
      convertibles: Connection[];
      /** Types the player can convert to. */
      targetTypes: ConnectionType[];
    }
  | {
      kind: 'wager_benefit_rolls';
      effect: Extract<Effect, { type: 'wager_benefit_rolls' }>;
      title: string;
    }
  /**
   * Pick an item from the catalogue to fulfil a typed mustering-out benefit.
   * The category and filters tell the UI which catalogue to open.
   */
  | {
      kind: 'pick_catalogue_item';
      category: 'armour' | 'weapon' | 'augment' | 'gear';
      tlMax?: number;
      costMax?: number;
      /** Restrict weapon picks to particular WeaponCategory values. */
      weaponCategories?: ('melee_weapon' | 'slug_weapon' | 'energy_weapon' | 'grenade' | 'heavy_weapon')[];
      /** Restrict melee picks to a specific Melee specialty (e.g. 'blade'). */
      weaponSpec?: string;
      title: string;
    }
  | {
      kind: 'note';
      text: string;
    };

export const blankEngineState = (character: Character): EngineState => {
  // Hydrate pendingDMs from any carried-forward DMs left on the character — these come
  // from previous engine sessions (e.g. a pre-career event grants DM+2 to next benefit
  // roll, but mustering-out happens many sessions later).
  const carried = character.wizardState?.carriedDMs;
  return {
    character,
    queue: [],
    context: [],
    pendingDMs: {
      benefitRollDMs: carried?.benefitRollDMs ? [...carried.benefitRollDMs] : [],
      ...(typeof carried?.nextSurvival === 'number' ? { nextSurvival: carried.nextSurvival } : {}),
      ...(typeof carried?.nextAdvancement === 'number' ? { nextAdvancement: carried.nextAdvancement } : {}),
      ...(typeof carried?.nextQualification === 'number' ? { nextQualification: carried.nextQualification } : {}),
    },
    flags: {},
  };
};

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
  // Mirror pendingDMs back onto the character so they survive when this engine state is
  // discarded — e.g., a DM+2 from a pre-career life event needs to wait until mustering-out.
  s = { ...s, character: writeCarriedDMs(s.character, s.pendingDMs) };
  debug('engine', 'drain →', {
    context: s.context.at(-1),
    prompt: s.prompt?.kind,
    queueLength: s.queue.length,
    pendingDMs: s.pendingDMs,
    rollLogTail: s.character.rollLog.slice(-3).map((r) => ({ context: r.context, natural: r.natural, result: r.result, success: r.success })),
  });
  return s;
};

/** Write pendingDMs onto character.wizardState.carriedDMs so they persist across engine sessions. */
const writeCarriedDMs = (c: Character, pending: EngineState['pendingDMs']): Character => {
  const existing = c.wizardState ?? { step: 'basics' };
  const carriedDMs: NonNullable<Character['wizardState']>['carriedDMs'] = {};
  if (typeof pending.nextSurvival === 'number') carriedDMs.nextSurvival = pending.nextSurvival;
  if (typeof pending.nextAdvancement === 'number') carriedDMs.nextAdvancement = pending.nextAdvancement;
  if (typeof pending.nextQualification === 'number') carriedDMs.nextQualification = pending.nextQualification;
  if (pending.benefitRollDMs.length > 0) carriedDMs.benefitRollDMs = [...pending.benefitRollDMs];
  return { ...c, wizardState: { ...existing, carriedDMs } };
};

/** Advance by one effect. Caller must resolve prompts before stepping again. */
export const step = (state: EngineState, rng: Rng = defaultRng): EngineState => {
  if (state.prompt) throw new Error('Cannot step while a prompt is pending');
  const [head, ...rest] = state.queue;
  if (!head) return state;
  debug('engine', 'apply', head.type, 'context:', state.context.at(-1));
  const s: EngineState = { ...state, queue: rest };
  return apply(s, head, rng);
};

/* ─────────────── Prompt resolution ─────────────── */

/** Resolve a `choice` prompt by selecting one option's effects to enqueue at the front. */
export const resolveChoice = (state: EngineState, optionIndex: number, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'choice') throw new Error('Not waiting on a choice');
  const option = state.prompt.effect.options[optionIndex];
  if (!option) throw new Error(`Bad option index ${optionIndex}`);
  debug('resolve', 'choice', { picked: option.label });
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
  debug('resolve', 'check', { natural, total: modifiedTotal, target: effect.roll.target, success, source, context: state.context.at(-1) });
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

  // Consume any pending DM that just applied to this check, so it doesn't carry forward.
  const ctx = state.context.at(-1) ?? '';
  const pendingAfter = { ...state.pendingDMs };
  if (/qualification/i.test(ctx)) delete pendingAfter.nextQualification;
  else if (/survival/i.test(ctx)) delete pendingAfter.nextSurvival;
  else if (/advancement/i.test(ctx)) delete pendingAfter.nextAdvancement;

  const after: EngineState = {
    ...state,
    character: { ...state.character, rollLog: [...state.character.rollLog, log] },
    pendingDMs: pendingAfter,
    prompt: undefined,
    queue: [...branch, ...state.queue],
  };
  return drain(after, rng);
};

/**
 * Resolve a convert_connection prompt by moving the chosen connection from its
 * current bucket to the chosen target bucket and updating its type.
 */
export const resolveConvertConnection = (
  state: EngineState,
  connectionId: string,
  to: ConnectionType,
  rng: Rng = defaultRng,
): EngineState => {
  if (state.prompt?.kind !== 'convert_connection') throw new Error('Not waiting on convert_connection');
  debug('resolve', 'convert_connection', { connectionId, to });
  const after: EngineState = {
    ...state,
    character: autoConvertConnection(state.character, connectionId, to),
    prompt: undefined,
  };
  return drain(after, rng);
};

const autoConvertConnection = (c: Character, connectionId: string, to: ConnectionType): Character => {
  let connection: Connection | undefined;
  let nextConns = c.connections;
  for (const bucket of ['contacts', 'allies', 'rivals', 'enemies'] as const) {
    const found = nextConns[bucket].find((x) => x.id === connectionId);
    if (found) {
      connection = found;
      nextConns = { ...nextConns, [bucket]: nextConns[bucket].filter((x) => x.id !== connectionId) };
      break;
    }
  }
  if (!connection) throw new Error(`Connection ${connectionId} not found`);
  const moved: Connection = { ...connection, type: to };
  const targetBucket = bucketFor(to);
  nextConns = { ...nextConns, [targetBucket]: [...nextConns[targetBucket], moved] };
  return { ...c, connections: nextConns };
};

const bucketFor = (t: ConnectionType): 'contacts' | 'allies' | 'rivals' | 'enemies' =>
  t === 'contact' ? 'contacts' : t === 'ally' ? 'allies' : t === 'rival' ? 'rivals' : 'enemies';

const listConvertibleConnections = (c: Character, fromTypes: readonly ConnectionType[]): Connection[] => {
  const all: Connection[] = [
    ...c.connections.contacts,
    ...c.connections.allies,
    ...c.connections.rivals,
    ...c.connections.enemies,
  ];
  return all.filter((x) => fromTypes.includes(x.type));
};

/** Resolve a pick_skill prompt by committing a SkillEntry. */
export const resolvePickSkill = (state: EngineState, ref: SkillRef, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'pick_skill') throw new Error('Not waiting on pick_skill');
  const p = state.prompt;
  debug('resolve', 'pick_skill', { picked: ref, level: p.level, hasFollowUp: !!p.followUpCheck });
  const granted = grantSkill({ ...state, prompt: undefined }, ref, p.level, p.source);
  // If the prompt asked for a follow-up check on the picked skill, queue it now so the
  // engine pauses on the check next.
  const after = p.followUpCheck
    ? {
        ...granted,
        queue: [
          {
            type: 'check' as const,
            ...(p.followUpCheck.description ? { description: p.followUpCheck.description } : {}),
            roll: { kind: 'skill' as const, skill: ref, target: p.followUpCheck.target },
            onSuccess: p.followUpCheck.onSuccess,
            onFailure: p.followUpCheck.onFailure,
          },
          ...granted.queue,
        ],
      }
    : granted;
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

/**
 * Resolve a pick_catalogue_item prompt. The selected item is appended to
 * the appropriate character array (weapons / armor / augments / equipment).
 */
export const resolvePickCatalogueItem = (
  state: EngineState,
  itemId: string,
  rng: Rng = defaultRng,
): EngineState => {
  if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('Not waiting on pick_catalogue_item');
  const entry = CATALOGUE.get(itemId);
  if (!entry) throw new Error(`Unknown catalogue id: ${itemId}`);

  const c = state.character;
  const baseId = crypto.randomUUID();
  let next = c;
  switch (entry.kind) {
    case 'armour':
      next = {
        ...c,
        armor: [
          ...c.armor,
          {
            id: baseId,
            name: entry.item.name + (entry.item.variant ? ` (${entry.item.variant})` : ''),
            description: [entry.item.description, entry.item.protectionNote].filter(Boolean).join(' · '),
            protection: entry.item.protection,
            tl: entry.item.tl,
          },
        ],
      };
      break;
    case 'weapon':
      next = {
        ...c,
        weapons: [
          ...c.weapons,
          {
            id: baseId,
            name: entry.item.name + (entry.item.variant ? ` (${entry.item.variant})` : ''),
            description: entry.item.description ?? '',
            tl: entry.item.tl,
            range: entry.item.range,
            damage: entry.item.damage,
          },
        ],
      };
      break;
    case 'augment':
      next = {
        ...c,
        augments: [
          ...c.augments,
          {
            id: baseId,
            name: entry.item.name + (entry.item.variant ? ` (${entry.item.variant})` : ''),
            description: entry.item.improvement + (entry.item.description ? ` — ${entry.item.description}` : ''),
            tl: entry.item.tl,
          },
        ],
      };
      break;
    case 'gear':
      next = {
        ...c,
        equipment: [
          ...c.equipment,
          {
            id: baseId,
            name: entry.item.name + (entry.item.variant ? ` (${entry.item.variant})` : ''),
            description: entry.item.description ?? '',
            tl: entry.item.tl,
          },
        ],
      };
      break;
  }
  const after: EngineState = { ...state, prompt: undefined, character: next };
  return drain(after, rng);
};

/**
 * Skip the catalogue pick — record it as a generic note instead. Useful when
 * the player would rather pick the specific item later via the editable sheet.
 */
export const skipPickCatalogueItem = (state: EngineState, rng: Rng = defaultRng): EngineState => {
  if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('Not waiting on pick_catalogue_item');
  const after: EngineState = {
    ...state,
    prompt: { kind: 'note', text: `${state.prompt.title} — skipped, record on the sheet manually.` },
  };
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
    case 'gain_skill': {
      // For specRequired parent skills (Profession, Science), gain at level 1+ has no
      // meaning without a specialization — prompt the player to pick one. Other parent
      // skills (Gun Combat, Athletics, Tactics, Melee) grant the parent at the resolved
      // level, which is meaningful per the rulebook.
      const def = SKILLS[e.skill.name];
      if (def?.specRequired && def.specs.length > 0 && !e.skill.spec) {
        return {
          ...state,
          prompt: {
            kind: 'pick_skill',
            level: e.level,
            from: def.specs.map((spec) => ({ name: e.skill.name, spec })),
            source: { kind: 'manual' },
            title: `${e.skill.name} — pick specialization`,
          },
        };
      }
      return grantSkill(state, e.skill, e.level, { kind: 'manual' });
    }
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
          followUpCheck: e.followUpCheck,
        },
      };
    case 'modify_char':
      return applyCharDelta(state, e.char, e.delta);
    case 'raise_char_to_or_bump': {
      const cur = state.character.characteristics[e.char];
      const target = cur < e.minimum ? e.minimum : cur + 1;
      return applyCharDelta(state, e.char, target - cur);
    }
    case 'modify_char_choice':
      return {
        ...state,
        prompt: { kind: 'pick_char', chars: e.chars, delta: e.delta, title: state.context.at(-1) ?? 'Choose a characteristic' },
      };
    case 'modify_char_choice_rolled': {
      const rolled = rollSpec(e.dice, rng);
      const delta = e.sign === 'minus' ? -rolled : rolled;
      const log: RollLogEntry = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        context: `${state.context.at(-1) ?? 'Reduce char'} (${e.dice} → ${rolled})`,
        result: rolled,
        source: 'rng',
      };
      return {
        ...state,
        character: { ...state.character, rollLog: [...state.character.rollLog, log] },
        prompt: {
          kind: 'pick_char',
          chars: e.chars,
          delta,
          title: `${state.context.at(-1) ?? 'Reduce'} — ${e.sign === 'minus' ? '−' : '+'}${rolled} (${e.dice})`,
        },
      };
    }
    case 'modify_psi': {
      const c = state.character;
      if (!c.psi) return state;
      const wasFull = c.psi.current >= c.psi.max;
      const max = Math.max(0, c.psi.max + e.delta);
      // If the Traveller was at full PSI, gaining a point raises current too.
      // Otherwise current stays put (clamped to the new max if max went down).
      const current = wasFull ? max : Math.min(c.psi.current, max);
      return { ...state, character: { ...c, psi: { max, current } } };
    }
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
      // Track progress when an event grants multiple connections (e.g. D3 Allies).
      const total = e._totalCount ?? count;
      const current = total - count + 1;
      return {
        ...state,
        prompt: {
          kind: 'name_connection',
          type: e.connection,
          title: state.context.at(-1) ?? 'Name the connection',
          ...(total > 1 ? { progress: { current, total } } : {}),
        },
        queue: count > 1
          ? [
              { type: 'gain_connection', connection: e.connection, count: { fixed: count - 1 }, _totalCount: total },
              ...state.queue,
            ]
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
    case 'convert_connection': {
      const convertibles = listConvertibleConnections(state.character, e.from);
      if (convertibles.length === 0) {
        if (!e.orGainNew) {
          // RAW: no Contact/Ally to convert and no "otherwise" clause → no effect.
          return {
            ...state,
            prompt: {
              kind: 'note',
              text: `No ${e.from.join(' or ')} to convert — this event has no effect.`,
            },
          };
        }
        // Fall through to gaining a new connection of the target type.
        return {
          ...state,
          prompt: {
            kind: 'pick_connection_type',
            choices: [...e.to],
            count: 1,
            title: state.context.at(-1) ?? 'Gain a new connection',
          },
        };
      }
      // Single convertible + single target type → no choice to make; auto-convert and
      // surface a note so the player sees what happened.
      if (convertibles.length === 1 && e.to.length === 1) {
        const conn = convertibles[0]!;
        const target = e.to[0]!;
        const moved = autoConvertConnection(state.character, conn.id, target);
        const name = conn.description?.trim() || conn.linkedTraveller?.trim() || `your ${conn.type}`;
        const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        return {
          ...state,
          character: moved,
          prompt: {
            kind: 'note',
            text: `${name} (${capitalize(conn.type)}) has become a ${capitalize(target)}.`,
          },
        };
      }
      return {
        ...state,
        prompt: {
          kind: 'convert_connection',
          title: state.context.at(-1) ?? 'Convert a connection',
          convertibles,
          targetTypes: [...e.to],
        },
      };
    }
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
      return applyGainBenefit(state, e);
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
      return {
        ...state,
        flags: { ...state.flags, psionEligibility: true },
        character: {
          ...state.character,
          wizardState: { ...(state.character.wizardState ?? { step: 'career_term' }), psionEligibility: true },
        },
      };
    case 'force_fail_pre_career_graduation':
      return {
        ...state,
        character: {
          ...state.character,
          wizardState: {
            ...(state.character.wizardState ?? { step: 'pre_career_education' }),
            forceFailPreCareerGraduation: true,
          },
        },
      };
    case 'prisoner_on_natural_two': {
      const { total } = roll2d(rng);
      const log: RollLogEntry = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        context: `${state.context.at(-1) ?? 'Prisoner chance'} — Prisoner-on-2 roll → ${total}`,
        natural: total,
        result: total,
        source: 'rng',
      };
      const next = { ...state, character: { ...state.character, rollLog: [...state.character.rollLog, log] } };
      if (total === 2) {
        return { ...next, flags: { ...next.flags, forcedNextCareer: 'prisoner' } };
      }
      return next;
    }
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
  const currentLevel = getCurrentLevel(state.character, ref);
  const newLevel = computeNewSkillLevel(currentLevel, level);
  if (newLevel <= 0) return state;

  // 3 × (INT + EDU) total cap. The level-4 cap is enforced inside
  // computeNewSkillLevel; this is the aggregate cap from p.18.
  const intent = newLevel - currentLevel;
  if (intent > 0) {
    const total = totalSkillLevels(state.character);
    const cap = 3 * (state.character.characteristics.INT + state.character.characteristics.EDU);
    if (total + intent > cap) {
      const refLabel = ref.name + (ref.spec ? ` (${ref.spec})` : '');
      return {
        ...state,
        prompt: {
          kind: 'note',
          text: `Skill cap reached. Total skill levels (${total}) would exceed 3 × (INT + EDU) = ${cap} after ${refLabel}. The increase is lost.`,
        },
      };
    }
  }

  const character = upsertSkill(state.character, { ...ref, level: newLevel, source });
  return { ...state, character };
};

const totalSkillLevels = (c: Character): number =>
  c.backgroundSkills.reduce((sum, s) => sum + s.level, 0);

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
  const key = bucketFor(conn.type);
  return { ...c, connections: { ...c.connections, [key]: [...c.connections[key], conn] } };
};

const resolveCount = (count: { fixed: number } | { dice: '1D' | '2D' | 'D3' } | undefined, rng: Rng): number => {
  if (!count) return 1;
  if ('fixed' in count) return count.fixed;
  return rollSpec(count.dice, rng);
};

const computeCheckDMs = (state: EngineState, roll: RollCheck): { source: string; value: number }[] => {
  // During creation, no skill DMs are added except where rules explicitly do (they don't on character-creation checks).
  // We surface the relevant char DM plus any queued situational DM that matches this check.
  const dms: { source: string; value: number }[] = [];
  if (roll.kind === 'char') {
    const dm = charDM(state.character, roll.char);
    if (dm !== 0) dms.push({ source: `${roll.char} DM`, value: dm });
  }
  const ctx = state.context.at(-1) ?? '';
  const pending = state.pendingDMs;
  if (/qualification/i.test(ctx) && typeof pending.nextQualification === 'number' && pending.nextQualification !== 0) {
    dms.push({ source: 'Carried DM', value: pending.nextQualification });
  } else if (/survival/i.test(ctx) && typeof pending.nextSurvival === 'number' && pending.nextSurvival !== 0) {
    dms.push({ source: 'Carried DM', value: pending.nextSurvival });
  } else if (/advancement/i.test(ctx) && typeof pending.nextAdvancement === 'number' && pending.nextAdvancement !== 0) {
    dms.push({ source: 'Carried DM', value: pending.nextAdvancement });
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

/**
 * Routes a `gain_benefit` to the catalogue picker for the kinds we have data
 * for. Falls back to a note for ships, vehicles, and TAS membership.
 */
const applyGainBenefit = (state: EngineState, e: Extract<Effect, { type: 'gain_benefit' }>): EngineState => {
  const b = e.benefit;
  switch (b.type) {
    case 'armour':
      return {
        ...state,
        prompt: {
          kind: 'pick_catalogue_item',
          category: 'armour',
          tlMax: b.tlLimit,
          costMax: b.crLimit,
          title: `Pick armour (≤ TL${b.tlLimit}, ≤ Cr${b.crLimit.toLocaleString()})`,
        },
      };
    case 'blade':
      return {
        ...state,
        prompt: {
          kind: 'pick_catalogue_item',
          category: 'weapon',
          tlMax: b.tlLimit,
          costMax: b.crLimit,
          weaponCategories: ['melee_weapon'],
          weaponSpec: 'blade',
          title: `Pick a blade (≤ TL${b.tlLimit}, ≤ Cr${b.crLimit.toLocaleString()})`,
        },
      };
    case 'gun':
      return {
        ...state,
        prompt: {
          kind: 'pick_catalogue_item',
          category: 'weapon',
          tlMax: b.tlLimit,
          costMax: b.crLimit,
          weaponCategories: ['slug_weapon', 'energy_weapon'],
          title: `Pick a gun (≤ TL${b.tlLimit}, ≤ Cr${b.crLimit.toLocaleString()})`,
        },
      };
    case 'weapon':
      return {
        ...state,
        prompt: {
          kind: 'pick_catalogue_item',
          category: 'weapon',
          tlMax: b.tlLimit,
          costMax: b.crLimit,
          weaponCategories: ['melee_weapon', 'slug_weapon', 'energy_weapon'],
          title: `Pick a weapon (≤ TL${b.tlLimit}, ≤ Cr${b.crLimit.toLocaleString()})`,
        },
      };
    case 'cybernetic_implant':
      return {
        ...state,
        prompt: {
          kind: 'pick_catalogue_item',
          category: 'augment',
          tlMax: b.tlLimit,
          costMax: b.crLimit,
          title: `Pick an augment (≤ TL${b.tlLimit}, ≤ Cr${b.crLimit.toLocaleString()})`,
        },
      };
    case 'scientific_equipment':
      return {
        ...state,
        prompt: {
          kind: 'pick_catalogue_item',
          category: 'gear',
          tlMax: b.tlLimit,
          costMax: b.crLimit,
          title: `Pick scientific gear (≤ TL${b.tlLimit}, ≤ Cr${b.crLimit.toLocaleString()})`,
        },
      };
    default:
      // Ships, vehicles, TAS membership — record as a note for now.
      return { ...state, prompt: { kind: 'note', text: `Benefit acquired: ${describeBenefit({ type: 'gain_benefit', benefit: b })}.` } };
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
