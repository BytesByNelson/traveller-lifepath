/**
 * NPC autopilot: build a complete Character end-to-end without user interaction.
 *
 * GMs need NPCs fast — full lifepath chargen is too many decisions per Traveller.
 * generateNpc() drives the same engine the wizard uses, but auto-resolves every
 * prompt with a sensible default policy (random/biased picks that produce
 * believable characters, not optimal ones). The resulting Character has the same
 * shape as a player-built one — full roll log, career history, mustering-out
 * benefits — so the GM can riff off the random history at the table.
 *
 * The generator is INTENTIONALLY scrappy at v1: it will sometimes produce dead
 * NPCs (aging crisis with no funds), career paths that feel weird, etc. The UI
 * exposes a Re-roll button so GMs can discard and try again until they get one
 * they like.
 */
import type { CareerId, CharCode, Character, SkillName, SkillRef, SocietyId, SpeciesId } from '../types';
import { generateNpcName } from './npc-names';
import { BACKGROUND_SKILLS, CAREERS, CAREER_LIST, SKILLS } from '../data';
import { ARMOUR, AUGMENTS, GEAR, WEAPONS } from '../data/equipment';
import { roll2d, type Rng } from './dice';
import { drain, type EngineState } from './effects';
import {
  resolveChoice,
  resolveCheck,
  resolveConvertConnection,
  resolveNameConnection,
  resolvePickCatalogueItem,
  resolvePickChar,
  resolvePickConnectionType,
  resolvePickSkill,
  resolveWager,
} from './effects';
import { candidateSkillsForPrompt } from './effects';
import {
  addBackgroundSkill,
  applyBasicTraining,
  backgroundSkillCount,
  commitCareerTerm,
  isAgingDue,
  isAutoCommissioned,
  newCharacter,
  rollAllCharacteristics,
  startAdvancement,
  startAging,
  startCommission,
  startEvent,
  startMusteringOutRoll,
  startQualification,
  startRankBonus,
  startSkillTableRoll,
  startSurvival,
} from './wizard';
import { charDM } from './selectors';
import type { CareerTerm } from '../types';

export type NpcOptions = {
  /** Display name. Empty/undefined gets a placeholder ("Unnamed Traveller"). */
  name?: string;
  /** Species. Defaults to 'human'. */
  species?: SpeciesId;
  /** Society / interstellar polity. Defaults to 'third_imperium'. Shapes
   *  name flavour, available faction-specific careers, and the NPC's
   *  political context on the resulting sheet. */
  society?: SocietyId;
  /** Number of career terms to attempt. Defaults to 3 (≈30 years old). */
  terms?: number;
  /** Optional career hint — will try this career first each time. Otherwise random. */
  careerHint?: CareerId;
  /** Whether to enable psionics. */
  psionics?: boolean;
  /** Stable id. Defaults to a fresh UUID. */
  id?: string;
};

/**
 * Generate a complete NPC. Pure function — same rng + opts → same character.
 */
export function generateNpc(opts: NpcOptions, rng: Rng = Math.random): Character {
  const id = opts.id ?? crypto.randomUUID();
  const species = opts.species ?? 'human';
  const society = opts.society ?? 'third_imperium';
  // Generate a species + society-appropriate name when blank — Solomani
  // Confederation humans pull from a Terran-heritage pool, Zhodani humans
  // from a Zhodani-flavoured pool, and aliens always use their own.
  const name = (opts.name ?? '').trim() || generateNpcName(species, society, rng);
  const targetTerms = Math.max(1, Math.min(7, opts.terms ?? 3));

  let c = newCharacter(id, name, species);
  c = { ...c, society };
  if (opts.psionics) {
    c = {
      ...c,
      wizardState: { ...(c.wizardState ?? { step: 'basics' }), psionicsEnabled: true },
    };
  }

  // Stats: roll all six (and PSI if enabled).
  c = rollAllCharacteristics(c, rng);

  // Background skills: pick allowed count from the pool, biased toward common ones.
  c = autoPickBackgroundSkills(c, rng);

  // Career loop. Stops at targetTerms or on death/Drifter chain.
  // When the player asked for psionics, default the first term to Psion so
  // that toggling "Include PSI" actually steers the NPC down the psionic
  // path (instead of just rolling a PSI score and ignoring it). The user
  // can still override via opts.careerHint.
  const firstCareerHint = opts.careerHint ?? (opts.psionics ? 'psion' : undefined);
  const careerSequence = pickCareerSequence(c, targetTerms, firstCareerHint, !!opts.psionics, rng);
  for (const wantedCareer of careerSequence) {
    if (c.deceased) break;
    if (c.careerHistory.length >= targetTerms) break;
    c = runOneTerm(c, wantedCareer, rng);
  }

  // Mustering out.
  if (!c.deceased) c = autoMusterOut(c, rng);

  // Mark wizard as done so the SheetPage doesn't redirect anywhere.
  c = { ...c, wizardState: { ...(c.wizardState ?? { step: 'basics' }), step: 'done' } };
  return c;
}

/* ─────────────── Auto-resolution policy ─────────────── */

/** Drive an EngineState to no-prompt by auto-resolving every prompt. */
function runUntilNoPrompt(state: EngineState, rng: Rng): EngineState {
  let safety = 200;
  while (state.prompt && safety-- > 0) {
    state = autoResolve(state, rng);
  }
  return state;
}

/** Auto-resolve any prompt the engine pauses on. Sensible defaults — not optimal play. */
function autoResolve(state: EngineState, rng: Rng): EngineState {
  const p = state.prompt;
  if (!p) return state;
  switch (p.kind) {
    case 'check': {
      const { total: natural } = roll2d(rng);
      const dmTotal = (p.dms ?? []).reduce((s, d) => s + d.value, 0);
      return resolveCheck(state, natural, natural + dmTotal, rng, 'rng');
    }
    case 'choice': {
      // Default to the first labelled option. The data tends to put the "easy"
      // / non-punitive branch first (e.g. Cooperate before Refuse).
      return resolveChoice(state, 0, rng);
    }
    case 'pick_skill': {
      const candidates = candidateSkillsForPrompt(state);
      const picked = candidates[Math.floor(rng() * candidates.length)] ?? candidates[0];
      if (!picked) return drain({ ...state, prompt: undefined }, rng);
      // Resolve any required spec.
      const def = SKILLS[picked.name];
      const ref: SkillRef = picked.spec
        ? { name: picked.name, spec: picked.spec }
        : def && def.specs.length > 0
        ? { name: picked.name, spec: def.specs[Math.floor(rng() * def.specs.length)]! }
        : { name: picked.name };
      return resolvePickSkill(state, ref, rng);
    }
    case 'pick_char': {
      // For positive deltas: bump the highest stat (boost a strength).
      // For negative deltas: hit the highest stat that can absorb the loss.
      const code = pickCharForPrompt(state.character, p.chars, p.delta);
      return resolvePickChar(state, code, rng);
    }
    case 'pick_connection_type': {
      // Pick the first allowed type.
      const choice = p.choices[0];
      if (!choice) return { ...state, prompt: undefined };
      return resolvePickConnectionType(state, choice, rng);
    }
    case 'name_connection': {
      const desc = `${p.type === 'contact' ? 'Contact' : p.type === 'ally' ? 'Ally' : p.type === 'rival' ? 'Rival' : 'Enemy'} (NPC)`;
      return resolveNameConnection(state, desc, rng);
    }
    case 'convert_connection': {
      const target = p.convertibles[0];
      const toType = p.targetTypes[0];
      if (!target || !toType) return { ...state, prompt: undefined };
      return resolveConvertConnection(state, target.id, toType, rng);
    }
    case 'wager_benefit_rolls': {
      // Conservative wager: 1 benefit roll. Roll the embedded check.
      const { total: natural } = roll2d(rng);
      return resolveWager(state, 1, natural, natural, rng);
    }
    case 'pick_catalogue_item': {
      // Pick a real catalogue id matching the prompt's category + filters.
      const pool: { id: string; tl: number; cost: number }[] =
        p.category === 'armour' ? ARMOUR
        : p.category === 'weapon' ? WEAPONS
        : p.category === 'augment' ? AUGMENTS
        : GEAR;
      const filtered = pool.filter(
        (i) => (p.tlMax === undefined || i.tl <= p.tlMax) && (p.costMax === undefined || i.cost <= p.costMax),
      );
      const candidates = filtered.length > 0 ? filtered : pool;
      const pick = candidates[Math.floor(rng() * candidates.length)] ?? candidates[0];
      if (!pick) return { ...state, prompt: undefined };
      return resolvePickCatalogueItem(state, pick.id, rng);
    }
    case 'note':
      // Just dismiss.
      return { ...state, prompt: undefined };
  }
}

function pickCharForPrompt(c: Character, chars: CharCode[], delta: number): CharCode {
  if (delta >= 0) {
    // Bumps go to the highest stat to push it past a DM threshold.
    return chars.reduce(
      (best, code) => (c.characteristics[code] > c.characteristics[best] ? code : best),
      chars[0]!,
    );
  }
  // Reductions go to the highest stat in the allowed list (most resilient to absorbing the hit).
  return chars.reduce(
    (best, code) => (c.characteristics[code] > c.characteristics[best] ? code : best),
    chars[0]!,
  );
}

/* ─────────────── Background skills ─────────────── */

function autoPickBackgroundSkills(c: Character, rng: Rng): Character {
  const allowed = backgroundSkillCount(c);
  const pool = [...BACKGROUND_SKILLS];
  // Shuffle so we don't always grab Admin/Advocate first.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  let next = c;
  for (let i = 0; i < allowed && i < pool.length; i++) {
    next = addBackgroundSkill(next, pool[i] as SkillName);
  }
  return next;
}

/* ─────────────── Career sequence selection ─────────────── */

/** Build a target sequence of careers to attempt. Falls back to Drifter when
 *  qualification fails repeatedly; runOneTerm handles actual qualification. */
function pickCareerSequence(
  c: Character,
  terms: number,
  hint: CareerId | undefined,
  includePsion: boolean,
  rng: Rng,
): CareerId[] {
  const out: CareerId[] = [];
  // Prisoner is reserved for forced routing via in-game events. Psion is
  // gated behind the "Include PSI" option — randomly handing out psionic
  // careers to mundane NPCs would be lore-breaking. Faction careers (with
  // availableInSocieties set) are filtered to match the NPC's society —
  // a Solomani Confederation NPC can roll into Solomani Party, but an
  // Imperial Traveller cannot.
  const society = c.society ?? 'third_imperium';
  const allCareers = CAREER_LIST.filter((career) => {
    if (career.id === 'prisoner') return false;
    if (career.id === 'psion' && !includePsion) return false;
    if (career.availableInSocieties && career.availableInSocieties.length > 0) {
      return career.availableInSocieties.includes(society);
    }
    return true;
  });
  for (let i = 0; i < terms; i++) {
    if (i === 0 && hint) {
      out.push(hint);
      continue;
    }
    // Bias selection toward careers the character is plausibly qualified for —
    // i.e. char DM on the qualification stat is ≥ 0.
    const eligible = allCareers.filter((career) => {
      if (!career.qualification?.check) return true;
      if (career.qualification.check.kind !== 'char') return true;
      return charDM(c, career.qualification.check.char) >= 0;
    });
    const pool = eligible.length > 0 ? eligible : allCareers;
    const pick = pool[Math.floor(rng() * pool.length)]!;
    out.push(pick.id);
  }
  return out;
}

/* ─────────────── One full term ─────────────── */

/** Run one full career term: qualification, basic training, skill roll,
 *  survival (or mishap), events, commission/advancement, aging. Commits the
 *  resulting CareerTerm to careerHistory. */
function runOneTerm(c: Character, wantedCareer: CareerId, rng: Rng): Character {
  const career = CAREERS[wantedCareer];
  const assignment = career.assignments[Math.floor(rng() * career.assignments.length)]!;

  // 1. Qualification.
  let auto = isAutoCommissioned(c, wantedCareer, 0);
  let { state, auto: autoQual } = startQualification(c, wantedCareer, rng);
  let qualified = autoQual;
  let rolled = 0;
  if (!autoQual) {
    state = runUntilNoPrompt(state, rng);
    const lastCheck = state.character.rollLog
      .filter((e) => e.context.startsWith(`${career.name} qualification`))
      .at(-1);
    qualified = !!lastCheck?.success;
    rolled = lastCheck?.result ?? 0;
    c = state.character;
  } else {
    c = state.character;
  }

  if (!qualified) {
    // Failed qualification: take Drifter for this term per RAW p13.
    if (wantedCareer !== 'drifter') return runOneTerm(c, 'drifter', rng);
    // Already trying Drifter — just commit a wash term.
  }

  // 2. Basic training. First career grants all service/assignment skills at level 0;
  //    later careers grant one (we pick a random row).
  const isFirstCareer = c.careerHistory.length === 0;
  if (isFirstCareer) {
    c = applyBasicTraining(c, wantedCareer, assignment.id, 0);
  } else {
    // Pick one service-skill row at random.
    const tableRows = career.flags?.basicTrainingFromAssignment
      ? career.assignments.find((a) => a.id === assignment.id)?.skillTable ?? []
      : career.skillTables.find((t) => t.id === 'service_skills')?.rows ?? [];
    const row = tableRows[Math.floor(rng() * tableRows.length)];
    if (row?.effect.type === 'gain_skill') {
      c = applyBasicTraining(c, wantedCareer, assignment.id, c.careerHistory.length, row.effect.skill);
    }
  }

  // 3. Skill table roll.
  const tableId = pickSkillTable(c, career, rng, /* isOfficer */ false);
  const skillResult = startSkillTableRoll(c, wantedCareer, assignment.id, tableId, rng);
  state = runUntilNoPrompt(skillResult.state, rng);
  c = state.character;

  // 4. Survival.
  state = startSurvival(c, career, assignment.id, 0, rng);
  state = runUntilNoPrompt(state, rng);
  c = state.character;

  const survivalLog = c.rollLog
    .filter((e) => e.context.startsWith(`${career.name} (${assignment.name}) — Survival`))
    .at(-1);
  const survived = !!survivalLog?.success;

  let commission: CareerTerm['commission'] | undefined;
  let advancement: CareerTerm['advancement'] | undefined;
  let rankAtEnd = 0;
  let isOfficer = false;
  let termOutcome: CareerTerm['termOutcome'] = survived ? 'continued' : 'ejected';
  let mishap: CareerTerm['mishap'] | undefined;

  if (survived) {
    // 5. Event.
    state = startEvent(c, career, rng);
    state = runUntilNoPrompt(state, rng);
    c = state.character;

    // 6. Commission / Advancement.
    if (career.commission && !auto) {
      auto = isAutoCommissioned(c, wantedCareer, 0);
    }
    if (career.commission) {
      state = startCommission(c, career, 0, rng);
      state = runUntilNoPrompt(state, rng);
      c = state.character;
      const commLog = c.rollLog
        .filter((e) => e.context.startsWith(`${career.name} commission`))
        .at(-1);
      commission = { attempted: true, success: !!commLog?.success, rolled: commLog?.result ?? 0 };
      if (commLog?.success) {
        isOfficer = true;
        rankAtEnd = 1;
        // Apply rank-1 officer bonus.
        const ranked = startRankBonus(c, career, assignment.id, 1, true, rng);
        state = runUntilNoPrompt(ranked, rng);
        c = state.character;
      }
    }
    state = startAdvancement(c, career, assignment.id, 0, rng);
    state = runUntilNoPrompt(state, rng);
    c = state.character;
    const advLog = c.rollLog
      .filter((e) => e.context.startsWith(`${career.name} (${assignment.name}) — Advancement`))
      .at(-1);
    advancement = { attempted: true, success: !!advLog?.success, rolled: advLog?.result ?? 0 };
    if (advLog?.success) {
      rankAtEnd = Math.max(rankAtEnd, isOfficer ? 2 : 1);
      const ranked = startRankBonus(c, career, assignment.id, rankAtEnd, isOfficer, rng);
      state = runUntilNoPrompt(ranked, rng);
      c = state.character;
    }
  }

  // 7. Commit term.
  const term: CareerTerm = {
    index: c.careerHistory.length,
    career: wantedCareer,
    assignment: assignment.id,
    qualified,
    skillRolls: [],
    survival: { rolled: survivalLog?.result ?? rolled, target: survivalLog?.target ?? 0, success: survived },
    rankAtEnd,
    isOfficer,
    termOutcome,
    ...(commission ? { commission } : {}),
    ...(advancement ? { advancement } : {}),
    ...(mishap ? { mishap } : {}),
  };
  c = commitCareerTerm(c, term);

  // 8. Aging (after term 3).
  if (isAgingDue(c)) {
    state = startAging(c, rng);
    state = runUntilNoPrompt(state, rng);
    c = state.character;
  }

  return c;
}

function pickSkillTable(c: Character, career: { skillTables: { id: string }[] }, rng: Rng, isOfficer: boolean): import('./wizard').SkillTableId {
  // Available tables vary; pick something reasonable.
  const ids = career.skillTables.map((t) => t.id).filter((id) =>
    isOfficer || id !== 'officer',
  );
  // Bias toward personal_development on first term (boosts stats), then variety.
  const preferred = c.careerHistory.length === 0 ? 'personal_development' : ids[Math.floor(rng() * ids.length)];
  if (preferred && ids.includes(preferred)) return preferred as import('./wizard').SkillTableId;
  return (ids[0] ?? 'personal_development') as import('./wizard').SkillTableId;
}

/* ─────────────── Mustering out ─────────────── */

function autoMusterOut(c: Character, rng: Rng): Character {
  // Total benefit rolls = number of completed terms (rank bonuses ignored for v1).
  const totalRolls = c.careerHistory.length;
  let next = c;
  for (let i = 0; i < totalRolls; i++) {
    const lastCareer = next.careerHistory.at(-1);
    if (!lastCareer) break;
    // Alternate cash and benefit columns; cap cash rolls at 3.
    const useCash = i % 2 === 0 && next.cashRollsUsed < 3;
    const column: 'cash' | 'benefits' = useCash ? 'cash' : 'benefits';
    const career = CAREERS[lastCareer.career];
    const { state: rolled } = startMusteringOutRoll(next, career, column, 0, rng);
    const drained = runUntilNoPrompt(rolled, rng);
    next = drained.character;
  }
  return next;
}
