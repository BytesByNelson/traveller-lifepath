import type { CharCode } from './characteristics';
import type { SkillEntry, SkillRef } from './skills';
import type { CareerId } from './careers';
import type { SpeciesId } from './species';
import type { BenefitKind, ConnectionType, Effect } from './effects';

export type Connection = {
  id: string;
  type: ConnectionType;
  description: string;
  /** Other Traveller's name, when this connection was established via the Connections rule. */
  linkedTraveller?: string;
};

export type Injury = {
  id: string;
  description: string;
  /** When the injury occurred. */
  termIndex: number;
  /** Stat reductions applied at injury time (positive number = reduction). */
  charReductions: Partial<Record<CharCode, number>>;
  /** Whether the loss has been medically restored. */
  restored?: boolean;
};

export type GrantedBenefit = {
  id: string;
  source: { career: CareerId; termIndex: number; rollColumn: 'cash' | 'benefit'; roll: number };
  benefit:
    | { kind: 'cash'; amount: number }
    | { kind: 'item'; benefit: BenefitKind; details?: string }
    | { kind: 'char_increase'; char: CharCode; delta: number }
    | { kind: 'ship_share'; count: number }
    | { kind: 'connection'; connectionId: string };
};

export type RollLogEntry = {
  id: string;
  ts: number;
  context: string;
  target?: number;
  dms?: { source: string; value: number }[];
  /** The unmodified 2D (or 1D) roll. Useful for natural-2 / natural-12 rules. */
  natural?: number;
  result: number;
  success?: boolean;
  source: 'rng' | 'manual';
};

export type StudyProgress = {
  skill: SkillRef;
  targetLevel: number;
  weeksAccumulated: number;
  successfulPeriods: number;
};

export type Item = { id: string; name: string; description?: string; cost?: number; tl?: number };
export type Weapon = Item & { damage?: string; range?: string };
export type Armor = Item & { protection?: number };
export type Augment = Item & { improvement?: number };

export type PreCareerEducation = {
  institution: 'university' | 'military_academy';
  /** For military academy, which branch. */
  militaryBranch?: 'army' | 'marines' | 'navy';
  termIndex: number;
  qualified: boolean;
  graduated: boolean;
  graduatedWithHonours: boolean;
  /** The pre-career events table roll for this term. */
  eventRoll?: { roll: number; resolved: ResolvedEffect[] };
};

/** A snapshot of a resolved effect — how the player chose to apply it. */
export type ResolvedEffect = {
  effect: Effect;
  /** Player's choices, sub-rolls, etc. */
  outcome: unknown;
};

export type CareerTerm = {
  index: number; // 0-based across all careers
  career: CareerId;
  assignment: string;
  qualified: boolean; // false → forced (drafted/forced into Drifter or Prisoner)
  basicTraining?: { skills: SkillRef[] };
  skillRolls: { tableId: string; roll: number; resolved: SkillRef }[];
  survival: { rolled: number; target: number; success: boolean };
  mishap?: { row: number; resolutionLog: ResolvedEffect[] };
  events?: { roll: number; resolutionLog: ResolvedEffect[]; wasConnection: boolean };
  commission?: { attempted: true; success: boolean; rolled: number };
  advancement?: { attempted: boolean; success: boolean; rolled: number };
  rankAtEnd: number;
  isOfficer: boolean;
  agingRoll?: { rolled: number; effects: Effect[] };
  termOutcome: 'continued' | 'mustered_out' | 'ejected' | 'forced_to_continue';
  parole?: { thresholdAtStart: number; thresholdAtEnd: number };
};

export type WizardStep =
  | 'basics'
  | 'characteristics'
  | 'background_skills'
  | 'pre_career_education'
  | 'career_term'
  | 'between_terms'
  | 'mustering_out'
  | 'skill_package'
  | 'review'
  | 'done';

export type WizardState = {
  step: WizardStep;
  /**
   * Set during the Basics step. When true, the wizard rolls PSI as a 7th
   * characteristic and the Psion career is selectable. When false (default),
   * the Psion career is hidden until something else (pre-career events row 2,
   * Life Events 12.1, or a referee-permitted in-play test) sets the
   * `psionEligibility` flag below.
   */
  psionicsEnabled?: boolean;
  /**
   * Set by pre-career event 3 ("Deep tragedy") via the force_fail_pre_career_graduation
   * effect. When true, the wizard's graduation step skips the roll and treats it as a
   * failure. Cleared after graduation resolves.
   */
  forceFailPreCareerGraduation?: boolean;
  /**
   * True once the Traveller has entered any pre-career track (university or any
   * military academy). Per Mongoose 2022 the academy / university takes a 4-year
   * term whether the player passes or fails, so age calculations need to count
   * this in addition to careerHistory.length.
   */
  preCareerEducationTaken?: boolean;
  /**
   * How characteristics + downstream rolls are handled. Chosen on the Basics step.
   * - 'app': the wizard rolls 2D for stats and every later check.
   * - 'manual': the player rolls their own dice and enters the results.
   * - 'point_buy': the player distributes a 42-point budget across the six stats
   *    (2..12 each); downstream rolls in the wizard still happen via 'app'.
   * Persisted so subsequent rolls during the wizard default to the same control.
   * Undefined means "ask before showing controls."
   */
  rollMode?: 'app' | 'manual' | 'point_buy';
  /**
   * Pool of 2D rolls awaiting assignment to characteristics. Used in app mode on the
   * Characteristics step: the player rolls all six into the pool, then picks which
   * value goes to which characteristic. Cleared once every value has been assigned.
   */
  unassignedRolls?: number[];
  /**
   * Set by gain_psion_eligibility effects (pre-career events / unusual events).
   * Once true, the Psion career becomes selectable even if psionics weren't
   * enabled at creation, and the in-play PSI test button on the sheet activates.
   */
  psionEligibility?: boolean;
  /** Current career term index when on career_term step. */
  currentTermIndex?: number;
  /** Most recent pending prompt for the engine — choice, check, sub-roll, etc. */
  pendingPrompt?: unknown;
  /** When set, the next career-term phase is forced to this career (no qualification roll). */
  forcedNextCareer?: { career: string; assignment?: string };
  /**
   * When set, the next career-term phase continues the same career + assignment without
   * a qualification roll (per rulebook: continuing in the same career skips qualification).
   * Cleared once that term commits.
   */
  continueInCareer?: { career: string; assignment: string };
  /** When set, the next career-term phase routes through the draft. */
  forcedDraft?: boolean;
  /** Carry-forward DMs from the previous term. */
  carriedDMs?: {
    nextSurvival?: number;
    nextAdvancement?: number;
    nextQualification?: number;
    benefitRollDMs?: number[];
  };
  /** Pre-career graduation flags that affect the first career attempted afterwards. */
  preCareerBonus?: {
    /** Bonus DM to qualification rolls for these careers. */
    qualifyDM: { careers: string[]; dm: number; assignmentSpecific?: { career: string; assignment: string }[] };
    /** Allowed first-term commission roll DM (and auto-pass if true). */
    commission?: { dm: number; auto: boolean; tiedTo?: 'army' | 'marine' | 'navy' };
    /** Auto-entry to a tied military career (bypasses qualification). */
    autoEntry?: { career: 'army' | 'marine' | 'navy'; commissionAllowed: boolean };
  };
};

export type Character = {
  schemaVersion: 1;
  id: string;
  name: string;
  species: SpeciesId;
  homeworld?: string;

  /** Live values — modified by aging, injury, benefits, etc. */
  characteristics: Record<CharCode, number>;
  /** The post-species-modifier rolled values from creation. Immutable after step 2. */
  baseCharacteristics: Record<CharCode, number>;

  backgroundSkills: SkillEntry[];
  preCareerEducation?: PreCareerEducation;
  careerHistory: CareerTerm[];

  connections: { contacts: Connection[]; allies: Connection[]; rivals: Connection[]; enemies: Connection[] };
  /** Up to 2 connection bonus skills granted via the Connections rule. */
  connectionsUsed: 0 | 1 | 2;

  benefits: GrantedBenefit[];
  injuries: Injury[];
  /** Cap of 3 across ALL careers. */
  cashRollsUsed: number;

  /** PSI characteristic — only present for psionics-tested Travellers. Treated like a 7th char during play. */
  psi?: { max: number; current: number };
  /** IDs of powers the Traveller knows. Talents themselves are tracked as skills (Telepathy, etc.). */
  psionicPowersKnown?: string[];

  /**
   * Set when an aging crisis killed the Traveller (declined to pay medical
   * bills) — the wizard refuses to advance past the death screen.
   */
  deceased?: { reason: string; termIndex: number };
  /**
   * Outstanding medical debt accumulated when the Traveller couldn't pay an
   * aging-crisis bill in full. Persists into play.
   */
  medicalDebt?: number;

  // in-play tracking
  currentCash: number;
  equipment: Item[];
  weapons: Weapon[];
  armor: Armor[];
  augments: Augment[];
  studyPeriods: StudyProgress[];
  monthlyShipPayment?: number;
  pension?: number;
  livingCost?: number;

  notes: string;
  rollLog: RollLogEntry[];
  wizardState?: WizardState;
};
