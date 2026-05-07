import {
  CHAR_CODES,
  type Career,
  type CareerId,
  type CareerTerm,
  type Character,
  type CharCode,
  type Effect,
  type SkillEntry,
  type SkillName,
  type SkillRef,
  type SpeciesId,
} from '../types';
import {
  AGING_AGE_THRESHOLD,
  CAREERS,
  characteristicDM,
  computePension,
  DRAFT_TABLE,
  MAX_CASH_BENEFIT_ROLLS_TOTAL,
  MEDICAL_BILLS,
  NO_PENSION_CAREERS,
  PRE_CAREER_EVENTS,
  rankBenefits,
  SKILLS,
  UNIVERSITY,
  MILITARY_ACADEMY,
} from '../data';
import { applySpeciesModifiers, charDM, getAge } from './selectors';
import {
  blankEngineState,
  drain,
  enqueue,
  pushContext,
  type EngineState,
} from './effects';
import { roll1d, roll2d, rollSpec, type Rng } from './dice';

export const DEFAULT_CHAR_VALUES: Record<CharCode, number> = {
  STR: 7,
  DEX: 7,
  END: 7,
  INT: 7,
  EDU: 7,
  SOC: 7,
};

/** Build a fresh, valid Character ready for the wizard. */
export const newCharacter = (id: string, name: string, species: SpeciesId): Character => {
  const base = { ...DEFAULT_CHAR_VALUES };
  const characteristics = applySpeciesModifiers(base, species);
  return {
    schemaVersion: 1,
    id,
    name,
    species,
    characteristics,
    baseCharacteristics: base,
    backgroundSkills: [],
    careerHistory: [],
    connections: { contacts: [], allies: [], rivals: [], enemies: [] },
    connectionsUsed: 0,
    benefits: [],
    injuries: [],
    cashRollsUsed: 0,
    currentCash: 0,
    equipment: [],
    weapons: [],
    armor: [],
    augments: [],
    studyPeriods: [],
    notes: '',
    rollLog: [],
    wizardState: { step: 'basics' },
  };
};

/**
 * Roll all six characteristics with a single RNG. Applies species modifiers.
 * Each individual 2D roll is logged. When the wizard's psionicsEnabled flag is
 * set, also rolls PSI (2D − terms served, which is just 2D at creation since
 * terms = 0) and stores it as the seventh characteristic.
 */
export const rollAllCharacteristics = (
  c: Character,
  rng: Rng,
): Character => {
  const base: Record<CharCode, number> = { ...DEFAULT_CHAR_VALUES };
  const log = [...c.rollLog];
  for (const code of CHAR_CODES) {
    const { total } = roll2d(rng);
    base[code] = total;
    log.push({
      id: crypto.randomUUID(),
      ts: Date.now(),
      context: `Roll ${code}`,
      result: total,
      source: 'rng',
    });
  }

  const psionicsEnabled = c.wizardState?.psionicsEnabled === true;
  let psi = c.psi;
  if (psionicsEnabled) {
    const { total } = roll2d(rng);
    const terms = c.careerHistory.length;
    const value = Math.max(0, total - terms);
    psi = { max: value, current: value };
    log.push({
      id: crypto.randomUUID(),
      ts: Date.now(),
      context: terms > 0 ? `Roll PSI (2D − ${terms} terms)` : 'Roll PSI',
      result: value,
      source: 'rng',
    });
  }

  return {
    ...c,
    baseCharacteristics: base,
    characteristics: applySpeciesModifiers(base, c.species),
    ...(psi !== undefined ? { psi } : {}),
    rollLog: log,
  };
};

/** Point-buy budget — total of 6 × 7 (the average 2D roll) = 42, distributed among the
 *  six characteristics with each in [2, 12]. Used by the point-buy stat method. */
export const POINT_BUY_BUDGET = 42;
export const POINT_BUY_MIN = 2;
export const POINT_BUY_MAX = 12;

/** Mark a characteristic as explicitly assigned by the player (idempotent). */
const markAssigned = (c: Character, code: CharCode): Character['wizardState'] => {
  const ws = c.wizardState ?? { step: 'characteristics' as const };
  const cur = ws.assignedChars ?? [];
  if (cur.includes(code)) return ws;
  return { ...ws, assignedChars: [...cur, code] };
};

/** Remove a characteristic from the assigned list. */
const markUnassigned = (c: Character, code: CharCode): Character['wizardState'] => {
  const ws = c.wizardState ?? { step: 'characteristics' as const };
  const cur = ws.assignedChars ?? [];
  if (!cur.includes(code)) return ws;
  return { ...ws, assignedChars: cur.filter((x) => x !== code) };
};

/** Whether the player has explicitly set this characteristic during the wizard.
 *  Falls back to "value differs from default 7" for characters created before
 *  the assignedChars tracking landed (otherwise their already-set 7s would
 *  read as unassigned on revisit). */
export const isCharacteristicAssigned = (c: Character, code: CharCode): boolean => {
  const list = c.wizardState?.assignedChars;
  if (list) return list.includes(code);
  return c.baseCharacteristics[code] !== DEFAULT_CHAR_VALUES[code];
};

/** Set a characteristic's base value via the point-buy method. Replaces (rather than
 *  appends) the per-char log entry so adjusting the slider many times doesn't bloat the
 *  audit trail; one final entry per stat lands in the log. */
export const setPointBuyCharacteristic = (c: Character, code: CharCode, base: number): Character => {
  const newBase = { ...c.baseCharacteristics, [code]: base };
  const log = c.rollLog.filter((e) => e.context !== `Set ${code} (point-buy)`);
  log.push({
    id: crypto.randomUUID(),
    ts: Date.now(),
    context: `Set ${code} (point-buy)`,
    result: base,
    source: 'manual',
  });
  return {
    ...c,
    baseCharacteristics: newBase,
    characteristics: applySpeciesModifiers(newBase, c.species),
    rollLog: log,
  };
};

/** Manually enter a single rolled characteristic value (with species modifier still applied). */
export const setCharacteristic = (c: Character, code: CharCode, base: number): Character => {
  const newBase = { ...c.baseCharacteristics, [code]: base };
  return {
    ...c,
    baseCharacteristics: newBase,
    characteristics: applySpeciesModifiers(newBase, c.species),
    rollLog: [
      ...c.rollLog,
      {
        id: crypto.randomUUID(),
        ts: Date.now(),
        context: `Roll ${code}`,
        result: base,
        source: 'manual',
      },
    ],
    wizardState: markAssigned(c, code),
  };
};

/**
 * Roll six 2D values into wizardState.unassignedRolls without auto-assigning them
 * to characteristics. The player then assigns each pooled value to a chosen
 * characteristic via assignFromPool. PSI is rolled separately (psionics players
 * still get a single PSI roll, kept off the main pool).
 *
 * Resets baseCharacteristics to defaults so any prior assignments are cleared
 * before the new pool — calling this twice in a row is a clean re-roll.
 */
export const rollCharacteristicsPool = (c: Character, rng: Rng): Character => {
  const pool: number[] = [];
  const log = [...c.rollLog];
  // Drop any existing pool-context entries from a prior unfinished pool roll.
  const filteredLog = log.filter((e) => e.context !== 'Roll pool');
  for (let i = 0; i < CHAR_CODES.length; i++) {
    const { total } = roll2d(rng);
    pool.push(total);
    filteredLog.push({
      id: crypto.randomUUID(),
      ts: Date.now(),
      context: 'Roll pool',
      result: total,
      source: 'rng',
    });
  }
  // Strip prior "Roll {code}" entries from earlier assignments so the pool re-roll
  // starts the log clean for these chars.
  const cleanLog = filteredLog.filter(
    (e) => !CHAR_CODES.some((code) => e.context === `Roll ${code}` || e.context === `Roll ${code} (re-roll)`),
  );
  const base = { ...DEFAULT_CHAR_VALUES };

  const psionicsEnabled = c.wizardState?.psionicsEnabled === true;
  let psi = c.psi;
  if (psionicsEnabled) {
    const { total } = roll2d(rng);
    const terms = c.careerHistory.length;
    const value = Math.max(0, total - terms);
    psi = { max: value, current: value };
    cleanLog.push({
      id: crypto.randomUUID(),
      ts: Date.now(),
      context: terms > 0 ? `Roll PSI (2D − ${terms} terms)` : 'Roll PSI',
      result: value,
      source: 'rng',
    });
  }

  return {
    ...c,
    baseCharacteristics: base,
    characteristics: applySpeciesModifiers(base, c.species),
    ...(psi !== undefined ? { psi } : {}),
    rollLog: cleanLog,
    // Reset the assigned-chars list too — a fresh pool means nothing is assigned yet.
    wizardState: {
      ...(c.wizardState ?? { step: 'characteristics' }),
      unassignedRolls: pool,
      assignedChars: [],
    },
  };
};

/**
 * Take a value out of the unassigned pool and set it as the base value for
 * `code`. Updates the matching "Roll pool" log entry to "Roll {code}" so the
 * roll log reads naturally afterwards. No-op if the value isn't in the pool.
 */
export const assignFromPool = (c: Character, code: CharCode, value: number): Character => {
  const pool = c.wizardState?.unassignedRolls ?? [];
  const idx = pool.indexOf(value);
  if (idx < 0) return c;
  const newPool = [...pool.slice(0, idx), ...pool.slice(idx + 1)];
  const newBase = { ...c.baseCharacteristics, [code]: value };
  const log = [...c.rollLog];
  const logIdx = log.findIndex((e) => e.context === 'Roll pool' && e.result === value);
  if (logIdx >= 0) log[logIdx] = { ...log[logIdx]!, context: `Roll ${code}` };
  const ws = markAssigned(c, code);
  return {
    ...c,
    baseCharacteristics: newBase,
    characteristics: applySpeciesModifiers(newBase, c.species),
    rollLog: log,
    wizardState: { ...(ws ?? { step: 'characteristics' }), unassignedRolls: newPool },
  };
};

/**
 * Push the currently-assigned value of `code` back into the unassigned pool and
 * reset that characteristic to its default (7). Mirrors the log-context update
 * from assignFromPool: the matching "Roll {code}" entry returns to "Roll pool".
 */
export const unassignToPool = (c: Character, code: CharCode): Character => {
  if (!isCharacteristicAssigned(c, code)) return c;
  const value = c.baseCharacteristics[code];
  const pool = [...(c.wizardState?.unassignedRolls ?? []), value];
  const newBase = { ...c.baseCharacteristics, [code]: DEFAULT_CHAR_VALUES[code] };
  const log = [...c.rollLog];
  const logIdx = log.findIndex((e) => e.context === `Roll ${code}` && e.result === value);
  if (logIdx >= 0) log[logIdx] = { ...log[logIdx]!, context: 'Roll pool' };
  const ws = markUnassigned(c, code);
  return {
    ...c,
    baseCharacteristics: newBase,
    characteristics: applySpeciesModifiers(newBase, c.species),
    rollLog: log,
    wizardState: { ...(ws ?? { step: 'characteristics' }), unassignedRolls: pool },
  };
};

/** Drain the entire pool into characteristics in CHAR_CODES order — the classic
 *  "take them as rolled" assignment. Skips any characteristic that's already been
 *  assigned. */
export const assignPoolInOrder = (c: Character): Character => {
  let next = c;
  for (const code of CHAR_CODES) {
    const pool = next.wizardState?.unassignedRolls ?? [];
    if (pool.length === 0) break;
    if (isCharacteristicAssigned(next, code)) continue;
    next = assignFromPool(next, code, pool[0]!);
  }
  return next;
};

/** Number of background skills the character may pick: max(0, EDU DM) + 3, capped at 6. */
export const backgroundSkillCount = (c: Character): number =>
  Math.min(6, Math.max(0, characteristicDM(c.characteristics.EDU)) + 3);

/** Add a background skill at level 0. Idempotent — duplicate names are no-ops. */
export const addBackgroundSkill = (c: Character, name: SkillName): Character => {
  if (c.backgroundSkills.some((s) => s.name === name)) return c;
  const entry: SkillEntry = {
    name,
    level: 0,
    source: { kind: 'background' },
  };
  return { ...c, backgroundSkills: [...c.backgroundSkills, entry] };
};

export const removeBackgroundSkill = (c: Character, name: SkillName): Character => ({
  ...c,
  backgroundSkills: c.backgroundSkills.filter((s) => s.name !== name),
});

/* ─────────────── Career-term flow ─────────────── */

/**
 * Start a qualification check by enqueueing the relevant `check` effect into a fresh
 * engine state and draining. The result will pause on the check prompt unless the career
 * has automatic qualification.
 */
export const startQualification = (
  c: Character,
  careerId: CareerId,
  rng: Rng,
): { state: EngineState; auto: boolean } => {
  const career = CAREERS[careerId];
  if (career.qualification.special === 'automatic' || career.qualification.special === 'sentenced') {
    return { state: blankEngineState(c), auto: true };
  }
  // Military academy graduates auto-qualify into the tied career on the next term.
  if (c.wizardState?.preCareerBonus?.autoEntry?.career === careerId) {
    return { state: blankEngineState(c), auto: true };
  }
  const dmsOnQual: Effect[] = [];
  // Per-previous-career penalty
  if (career.qualification.perPreviousCareer && c.careerHistory.length > 0) {
    const dm = career.qualification.perPreviousCareer * c.careerHistory.length;
    if (dm !== 0) dmsOnQual.push({ type: 'next_qualification_dm', dm });
  }
  // Age DM
  const age = getAge(c);
  if (career.qualification.ageDM && age >= career.qualification.ageDM.atLeastAge) {
    dmsOnQual.push({ type: 'next_qualification_dm', dm: career.qualification.ageDM.dm });
  }

  let state = blankEngineState(c);
  state = pushContext(state, `${career.name} qualification`);
  state = enqueue(state, [
    ...dmsOnQual,
    { type: 'check', roll: career.qualification.check, onSuccess: [], onFailure: [], category: 'qualification' },
  ]);
  state = drain(state, rng);
  return { state, auto: false };
};

/**
 * Apply basic training. First career: gain ALL service skills at level 0
 * (or assignment skills at level 0 for Citizen/Drifter). Subsequent careers:
 * pick one service-table skill at level 0.
 */
export const applyBasicTraining = (
  c: Character,
  careerId: CareerId,
  assignmentId: string,
  termIndex: number,
  pickedSkillForLaterTerm?: SkillRef,
): Character => {
  const career = CAREERS[careerId];
  const isFirst = termIndex === 0;
  const tableRows = career.flags?.basicTrainingFromAssignment
    ? career.assignments.find((a) => a.id === assignmentId)?.skillTable ?? []
    : career.skillTables.find((t) => t.id === 'service_skills')?.rows ?? [];

  const skillEntries: SkillEntry[] = [];
  const seen = new Set<string>();
  if (isFirst) {
    for (const row of tableRows) {
      // Apply only the gain_skill effects (skip stat bumps in service table — there usually are none in service_skills).
      const eff = row.effect;
      if (eff.type === 'gain_skill') {
        const key = `${eff.skill.name}|${eff.skill.spec ?? ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          skillEntries.push({
            name: eff.skill.name,
            ...(eff.skill.spec !== undefined ? { spec: eff.skill.spec } : {}),
            level: 0,
            source: { kind: 'basic_training', career: careerId, termIndex },
          });
        }
      }
    }
  } else if (pickedSkillForLaterTerm) {
    // Subsequent careers / terms grant ONE service skill at level 0. Preserve the
    // spec so that, e.g., picking the "Melee (unarmed)" row in Drifter's service
    // skills lands as Melee (unarmed) and not just generic Melee.
    skillEntries.push({
      name: pickedSkillForLaterTerm.name,
      ...(pickedSkillForLaterTerm.spec !== undefined ? { spec: pickedSkillForLaterTerm.spec } : {}),
      level: 0,
      source: { kind: 'basic_training', career: careerId, termIndex },
    });
  }

  let next = c;
  for (const e of skillEntries) {
    if (!next.backgroundSkills.some((s) => s.name === e.name && (s.spec ?? '') === (e.spec ?? ''))) {
      next = { ...next, backgroundSkills: [...next.backgroundSkills, e] };
    }
  }
  return next;
};

/** Roll a survival check for a specific assignment, applying any pending DM. */
export const startSurvival = (
  c: Character,
  career: Career,
  assignmentId: string,
  pendingDM: number,
  rng: Rng,
): EngineState => {
  const assignment = career.assignments.find((a) => a.id === assignmentId);
  if (!assignment) throw new Error(`Unknown assignment: ${assignmentId}`);

  let state = blankEngineState(c);
  state = pushContext(state, `${career.name} (${assignment.name}) — Survival`);
  const effects: Effect[] = [];
  if (pendingDM !== 0) effects.push({ type: 'next_survival_dm', dm: pendingDM });
  effects.push({
    type: 'check',
    roll: assignment.survival,
    onSuccess: [],
    onFailure: [
      { type: 'roll_on_table', table: { kind: 'career_mishaps', career: career.id } },
    ],
    category: 'survival',
  });
  state = enqueue(state, effects);
  state = drain(state, rng);
  return state;
};

/** Roll an event for the career. */
export const startEvent = (c: Character, career: Career, rng: Rng): EngineState => {
  let state = blankEngineState(c);
  state = pushContext(state, `${career.name} — Event`);
  state = enqueue(state, [
    { type: 'roll_on_table', table: { kind: 'career_events', career: career.id } },
  ]);
  state = drain(state, rng);
  return state;
};

/** Roll an advancement check. */
export const startAdvancement = (
  c: Character,
  career: Career,
  assignmentId: string,
  pendingDM: number,
  rng: Rng,
): EngineState => {
  const assignment = career.assignments.find((a) => a.id === assignmentId);
  if (!assignment) throw new Error(`Unknown assignment: ${assignmentId}`);
  let state = blankEngineState(c);
  state = pushContext(state, `${career.name} (${assignment.name}) — Advancement`);
  const effects: Effect[] = [];
  if (pendingDM !== 0) effects.push({ type: 'next_advancement_dm', dm: pendingDM });
  effects.push({
    type: 'check',
    roll: assignment.advancement,
    onSuccess: [],
    onFailure: [],
    category: 'advancement',
  });
  state = enqueue(state, effects);
  state = drain(state, rng);
  return state;
};

/**
 * Apply a rank bonus when advancement succeeds (and any auto-promote flag).
 * Looks up the appropriate rank table for the assignment and pushes its bonus
 * effect (if any) onto a fresh engine state.
 */
export const startRankBonus = (
  c: Character,
  career: Career,
  assignmentId: string,
  rankIndex: number,
  isOfficer: boolean,
  rng: Rng,
): EngineState => {
  const list =
    isOfficer && career.ranks.officer
      ? career.ranks.officer
      : career.ranks[assignmentId] ?? career.ranks.enlisted ?? [];
  const row = list.find((r) => r.rank === rankIndex);
  if (!row?.bonus) return blankEngineState(c);
  let state = blankEngineState(c);
  // Some careers (Drifter, Prisoner) have rankless ranks — row.title is empty.
  // Don't render the parens in that case, otherwise the log shows "Drifter rank 1 ()".
  const rankLabel = row.title ? `${career.name} rank ${rankIndex} (${row.title})` : `${career.name} rank ${rankIndex}`;
  state = pushContext(state, rankLabel);
  state = enqueue(state, [row.bonus]);
  state = drain(state, rng);
  return state;
};

/* ─────────────── Skill validation ─────────────── */

/** Whether a skill can be selected for `gain_skill_choice` based on the prompt's constraints. */
export const isSkillSelectable = (
  skillName: SkillName,
  options: { existingOnly?: boolean; excludeJoat?: boolean; alreadyHave: Set<SkillName> },
): boolean => {
  if (options.excludeJoat && skillName === 'Jack-of-all-Trades') return false;
  if (SKILLS[skillName].notTrainable) return false; // JoaT
  if (options.existingOnly && !options.alreadyHave.has(skillName)) return false;
  return true;
};

/* ─────────────── Diagnostics ─────────────── */

/** All current DMs that apply to the qualification roll into the named career. */
export const qualificationDMs = (
  c: Character,
  careerId: CareerId,
): { source: string; value: number }[] => {
  const career = CAREERS[careerId];
  const dms: { source: string; value: number }[] = [];
  if (career.qualification.special) return dms;
  const dm = charDM(c, career.qualification.check.char);
  if (dm !== 0) dms.push({ source: `${career.qualification.check.char} DM`, value: dm });
  if (career.qualification.perPreviousCareer && c.careerHistory.length > 0) {
    dms.push({
      source: `Previous careers (${c.careerHistory.length})`,
      value: career.qualification.perPreviousCareer * c.careerHistory.length,
    });
  }
  const age = getAge(c);
  if (career.qualification.ageDM && age >= career.qualification.ageDM.atLeastAge) {
    dms.push({ source: `Age ${age}`, value: career.qualification.ageDM.dm });
  }
  // Pre-career graduation bonuses
  const bonus = c.wizardState?.preCareerBonus?.qualifyDM;
  if (bonus) {
    if (bonus.careers.includes(careerId)) {
      dms.push({ source: 'Pre-career graduation', value: bonus.dm });
    }
  }
  return dms;
};

/* ─────────────── Career-term commit ─────────────── */

/** Push a fully-resolved term onto the character's careerHistory. */
export const commitCareerTerm = (c: Character, term: CareerTerm): Character => ({
  ...c,
  careerHistory: [...c.careerHistory, term],
});

/** Number of full terms the character has spent in the given career so far. */
export const termsInCareer = (c: Character, careerId: CareerId): number =>
  c.careerHistory.filter((t) => t.career === careerId).length;

/* ─────────────── Within-term skill table ─────────────── */

export type SkillTableId = 'personal_development' | 'service_skills' | 'advanced_education' | 'officer' | 'assignment';

/** Available skill tables for the character on this term. */
export const availableSkillTables = (
  c: Character,
  careerId: CareerId,
  isOfficer: boolean,
): { id: SkillTableId; label: string; locked?: string }[] => {
  const career = CAREERS[careerId];
  const tables: { id: SkillTableId; label: string; locked?: string }[] = [];
  tables.push({ id: 'personal_development', label: 'Personal Development' });
  tables.push({ id: 'service_skills', label: 'Service Skills' });
  tables.push({ id: 'assignment', label: 'Assignment Skills' });
  const adv = career.skillTables.find((t) => t.id === 'advanced_education');
  if (adv) {
    const minEdu = adv.minEdu ?? 8;
    if (c.characteristics.EDU >= minEdu) {
      tables.push({ id: 'advanced_education', label: `Advanced Education (EDU ${minEdu}+)` });
    } else {
      tables.push({
        id: 'advanced_education',
        label: `Advanced Education (EDU ${minEdu}+)`,
        locked: `Requires EDU ${minEdu}+ — you have ${c.characteristics.EDU}`,
      });
    }
  }
  const officer = career.skillTables.find((t) => t.id === 'officer');
  if (officer) {
    if (isOfficer) tables.push({ id: 'officer', label: 'Officer' });
    else tables.push({ id: 'officer', label: 'Officer', locked: 'Commissioned officers only' });
  }
  return tables;
};

/** Roll 1D on the chosen skill table and queue the row's effect. */
export const startSkillTableRoll = (
  c: Character,
  careerId: CareerId,
  assignmentId: string,
  tableId: SkillTableId,
  rng: Rng,
): { state: EngineState; tableLabel: string; rolled: number } => {
  const career = CAREERS[careerId];
  let rows;
  let label;
  if (tableId === 'assignment') {
    const assignment = career.assignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error('Bad assignment');
    rows = assignment.skillTable;
    label = `${assignment.name} (assignment)`;
  } else {
    const table = career.skillTables.find((t) => t.id === tableId);
    if (!table) throw new Error(`Career ${careerId} has no ${tableId} table`);
    rows = table.rows;
    label = tableId.replace(/_/g, ' ');
  }
  const r = roll1d(rng);
  const row = rows.find((x) => x.roll === r);
  let state = blankEngineState(c);
  state = pushContext(state, `${career.name} skill roll on ${label} → ${r}`);
  if (row) state = enqueue(state, [row.effect]);
  state = drain(state, rng);
  return { state, tableLabel: label, rolled: r };
};

/* ─────────────── Commission ─────────────── */

/** Determine whether a commission attempt is even available right now. */
export const canAttemptCommission = (
  c: Character,
  career: Career,
  termsInThisCareer: number,
  alreadyOfficer: boolean,
): boolean => {
  if (!career.flags?.military || !career.commission) return false;
  if (alreadyOfficer) return false;
  // First term, OR SOC 9+ relaxation.
  if (termsInThisCareer === 0) return true;
  return (career.commission.socRelaxAtLeast ?? 99) <= c.characteristics.SOC;
};

export const startCommission = (
  c: Character,
  career: Career,
  termsInThisCareer: number,
  rng: Rng,
): EngineState => {
  if (!career.commission) throw new Error('No commission rules for this career');
  const dm = (career.commission.perTermAfterFirst ?? 0) * Math.max(0, termsInThisCareer);
  const effects: Effect[] = [];
  if (dm !== 0) effects.push({ type: 'next_qualification_dm', dm });
  // Pre-career grad bonus to first commission. University grad: +DM on any military
  // career. Military Academy grad: +DM on the tied career only. Auto-commission case
  // is handled at the wizard layer (skips this engine entry-point entirely).
  const preBonus = c.wizardState?.preCareerBonus?.commission;
  if (preBonus && termsInThisCareer === 0 && !preBonus.auto) {
    const tiedOk = !preBonus.tiedTo || preBonus.tiedTo === career.id;
    if (tiedOk && preBonus.dm !== 0) {
      effects.push({ type: 'next_qualification_dm', dm: preBonus.dm });
    }
  }
  effects.push({
    type: 'check',
    roll: career.commission.check,
    onSuccess: [],
    onFailure: [],
    category: 'commission',
  });
  let state = blankEngineState(c);
  state = pushContext(state, `${career.name} commission`);
  state = enqueue(state, effects);
  state = drain(state, rng);
  return state;
};

/**
 * Whether the player's pre-career grad bonus auto-commissions them on the first
 * term of this career. Returns false when no bonus, when already attempted in a
 * prior term, or when a Military Academy bonus is tied to a different career.
 */
export const isAutoCommissioned = (c: Character, careerId: CareerId, termsInThisCareer: number): boolean => {
  if (termsInThisCareer !== 0) return false;
  const bonus = c.wizardState?.preCareerBonus?.commission;
  if (!bonus?.auto) return false;
  return !bonus.tiedTo || bonus.tiedTo === careerId;
};

/* ─────────────── Aging ─────────────── */

export const isAgingDue = (c: Character): boolean => {
  // Aging fires at the end of term 4 onward (when entering term 5).
  // Equivalent to: number of completed terms ≥ 4.
  const completed = c.careerHistory.length;
  return completed >= AGING_AGE_THRESHOLD / 4 - 0.5; // 4 terms = age 34 = aging starts
};

export const startAging = (c: Character, rng: Rng): EngineState => {
  let state = blankEngineState(c);
  state = pushContext(state, `Aging (terms: ${c.careerHistory.length})`);
  state = enqueue(state, [{ type: 'roll_on_table', table: { kind: 'aging' } }]);
  state = drain(state, rng);
  return state;
};

/** Detect aging crisis: any characteristic at 0. */
export const agingCrisisChars = (c: Character): CharCode[] =>
  CHAR_CODES.filter((code) => c.characteristics[code] === 0);

/* ─────────────── Pre-career education ─────────────── */

export const startUniversityEntry = (c: Character, termIndex: number, rng: Rng): EngineState => {
  const dms: Effect[] = [];
  const perTerm = UNIVERSITY.entryDMs.perTerm[`term${termIndex + 1}`];
  if (typeof perTerm === 'number' && perTerm !== 0) dms.push({ type: 'next_qualification_dm', dm: perTerm });
  if (c.characteristics.SOC >= 9) dms.push({ type: 'next_qualification_dm', dm: UNIVERSITY.entryDMs.socAtLeast9 });
  let state = blankEngineState(c);
  state = pushContext(state, 'University entry');
  state = enqueue(state, [
    ...dms,
    // Per Mongoose 2022: passing the entry check immediately grants the onEnter effects
    // (EDU +1 from attending). A separate +1 is granted on graduation.
    { type: 'check', roll: UNIVERSITY.entry.check, onSuccess: [...UNIVERSITY.onEnter], onFailure: [] },
  ]);
  state = drain(state, rng);
  return state;
};

export const startMilitaryAcademyEntry = (
  c: Character,
  branch: 'army' | 'marine' | 'navy',
  termIndex: number,
  rng: Rng,
): EngineState => {
  const entry = MILITARY_ACADEMY.entry[branch];
  const dms: Effect[] = [];
  const perTerm = MILITARY_ACADEMY.entryDMs.perTerm[`term${termIndex + 1}`];
  if (typeof perTerm === 'number' && perTerm !== 0) dms.push({ type: 'next_qualification_dm', dm: perTerm });
  let state = blankEngineState(c);
  state = pushContext(state, `${branch} Academy entry`);
  state = enqueue(state, [...dms, { type: 'check', roll: entry.check, onSuccess: [], onFailure: [] }]);
  state = drain(state, rng);
  return state;
};

export const startPreCareerEvent = (c: Character, rng: Rng): EngineState => {
  const { total } = roll2d(rng);
  const row = PRE_CAREER_EVENTS.find((r) => r.roll === total);
  const c2: Character = {
    ...c,
    rollLog: [
      ...c.rollLog,
      {
        id: crypto.randomUUID(),
        ts: Date.now(),
        context: `Pre-career event → ${total}`,
        natural: total,
        result: total,
        source: 'rng',
      },
    ],
  };
  let state = blankEngineState(c2);
  state = pushContext(state, `Pre-career event → ${total}`);
  if (row) state = enqueue(state, row.effects);
  state = drain(state, rng);
  return state;
};

export const startUniversityGraduation = (c: Character, rng: Rng): EngineState => {
  let state = blankEngineState(c);
  state = pushContext(state, 'University graduation');
  state = enqueue(state, [
    { type: 'check', roll: UNIVERSITY.graduation.check, onSuccess: [], onFailure: [] },
  ]);
  state = drain(state, rng);
  return state;
};

export const startMilitaryAcademyGraduation = (c: Character, rng: Rng): EngineState => {
  const dms: Effect[] = [];
  if (c.characteristics.END >= 8) dms.push({ type: 'next_qualification_dm', dm: MILITARY_ACADEMY.graduationDMs.endAtLeast8 });
  if (c.characteristics.SOC >= 8) dms.push({ type: 'next_qualification_dm', dm: MILITARY_ACADEMY.graduationDMs.socAtLeast8 });
  let state = blankEngineState(c);
  state = pushContext(state, 'Military Academy graduation');
  state = enqueue(state, [
    ...dms,
    { type: 'check', roll: MILITARY_ACADEMY.graduation.check, onSuccess: [], onFailure: [] },
  ]);
  state = drain(state, rng);
  return state;
};

/* ─────────────── Mustering out ─────────────── */

/** Total benefit rolls earned by the character across their career history. */
export const totalBenefitRolls = (c: Character): number => {
  let total = 0;
  // Group terms by career, then by highest rank reached.
  const byCareer = new Map<CareerId, CareerTerm[]>();
  for (const t of c.careerHistory) {
    const list = byCareer.get(t.career) ?? [];
    list.push(t);
    byCareer.set(t.career, list);
  }
  for (const [, terms] of byCareer) {
    total += terms.length; // 1 per full term
    const highest = Math.max(0, ...terms.map((t) => t.rankAtEnd));
    const bonus = rankBenefits(highest);
    if (bonus) total += bonus.bonusBenefitRolls;
  }
  return total;
};

/** Apply a single mustering-out benefit roll. Caller decides cash vs benefit. */
export const startMusteringOutRoll = (
  c: Character,
  career: Career,
  column: 'cash' | 'benefits',
  pendingDM: number,
  rng: Rng,
): { state: EngineState; rolled: number; row: number } => {
  const r = roll1d(rng);
  const final = Math.max(1, Math.min(7, r + pendingDM));
  const row = career.musteringOut[column].find((b) => b.roll === final);
  let state = blankEngineState(c);
  state = pushContext(state, `${career.name} mustering-out ${column} → ${final}`);
  if (row?.cash !== undefined) {
    // Cash benefit — record on character.
    state = {
      ...state,
      character: { ...state.character, currentCash: state.character.currentCash + row.cash },
    };
  } else if (row?.effect) {
    state = enqueue(state, [row.effect]);
  }
  state = drain(state, rng);
  return { state, rolled: r, row: final };
};

/** Compute the pension the character is entitled to upon mustering out. */
export const computeCharacterPension = (c: Character): number => {
  // Find last career; pension is paid only for non-disqualified careers with 5+ terms.
  const last = c.careerHistory.at(-1);
  if (!last) return 0;
  if (NO_PENSION_CAREERS.includes(last.career)) return 0;
  const sameCareerTerms = c.careerHistory.filter((t) => t.career === last.career).length;
  return computePension(sameCareerTerms);
};

/** Look up the medical bill coverage row for the given career. */
export const medicalCoverageFor = (careerId: CareerId) =>
  MEDICAL_BILLS.find((row) => row.careers.includes(careerId));

export const totalCashRollsUsed = (c: Character) => c.cashRollsUsed;
export const cashRollsRemaining = (c: Character) => Math.max(0, MAX_CASH_BENEFIT_ROLLS_TOTAL - c.cashRollsUsed);

/* ─────────────── Forced career routing ─────────────── */

export const rollDraft = (rng: Rng) => {
  const r = roll1d(rng);
  return DRAFT_TABLE.find((row) => row.roll === r);
};

/* ─────────────── Skill packages ─────────────── */

export const applySkillPackage = (c: Character, packageSkills: { name: SkillName; spec?: string }[]): Character => {
  let next = c;
  for (const skill of packageSkills) {
    const idx = next.backgroundSkills.findIndex(
      (s) => s.name === skill.name && (s.spec ?? '') === (skill.spec ?? ''),
    );
    const cur = idx >= 0 ? next.backgroundSkills[idx]!.level : 0;
    const nextLevel = Math.max(cur, 1);
    if (nextLevel === cur) continue;
    const entry: SkillEntry = {
      name: skill.name,
      ...(skill.spec ? { spec: skill.spec } : {}),
      level: nextLevel,
      source: { kind: 'manual' },
    };
    const list = [...next.backgroundSkills];
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    next = { ...next, backgroundSkills: list };
  }
  return next;
};

/* ─────────────── Misc helpers ─────────────── */

void rollSpec; // re-export for potential UI use elsewhere
