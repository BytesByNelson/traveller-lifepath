import type { CharCheck, Effect } from './effects';

export type CareerId =
  | 'agent'
  | 'army'
  | 'citizen'
  | 'drifter'
  | 'entertainer'
  | 'marine'
  | 'merchant'
  | 'navy'
  | 'noble'
  | 'rogue'
  | 'scholar'
  | 'scout'
  | 'prisoner';

export type SkillTableId =
  | 'personal_development'
  | 'service_skills'
  | 'advanced_education'
  | 'officer'
  | 'assignment';

/** A single 1D row on a skill-gain table. The effect typically grants a skill or a stat bump. */
export type SkillTableRow = {
  /** 1..6 */
  roll: number;
  effect: Effect;
};

export type SkillTable = {
  id: SkillTableId;
  rows: SkillTableRow[];
  /** Required EDU for Advanced Education tables. */
  minEdu?: number;
  /** Required commission rank for Officer tables. */
  commissionedOnly?: boolean;
};

export type RankRow = {
  rank: number;
  title?: string;
  /** Skill or characteristic granted on reaching this rank. */
  bonus?: Effect;
};

export type Assignment = {
  id: string;
  name: string;
  description: string;
  survival: CharCheck;
  advancement: CharCheck;
  skillTable: SkillTableRow[];
};

export type EventRow = {
  /** 2..12 */
  roll: number;
  text: string;
  effects: Effect[];
};

export type MishapRow = {
  /** 1..6 */
  roll: number;
  text: string;
  effects: Effect[];
};

export type BenefitRow = {
  /** 1..7 */
  roll: number;
  /** Cash benefit rows: list the credits. Empty for benefit rolls. */
  cash?: number;
  /** Other-benefits column: an effect to apply (e.g. a SOC bump or a weapon). */
  effect?: Effect;
  /** Display text from the rulebook (e.g. "SOC +1 or Cybernetic Implant"). */
  label?: string;
};

export type Career = {
  id: CareerId;
  name: string;
  flavour: string;
  qualification: {
    /** The base check. */
    check: CharCheck;
    /** Special: a string instead of check (Drifter "Automatic", Prisoner "Special"). */
    special?: 'automatic' | 'sentenced';
    /** -1 per previous career. */
    perPreviousCareer?: number;
    /** Additional age-based DM (e.g. Army DM-2 if 30+). */
    ageDM?: { atLeastAge: number; dm: number };
    /** Auto-pass condition (e.g. Noble: SOC 10+). */
    autoQualifyIf?: { char: 'STR' | 'DEX' | 'END' | 'INT' | 'EDU' | 'SOC'; atLeast: number };
  };
  commission?: {
    check: CharCheck;
    /** Term-1 only, unless auto-relaxed by SOC. */
    socRelaxAtLeast?: number;
    /** -1 per term after the first. */
    perTermAfterFirst?: number;
  };
  assignments: Assignment[];
  /** Personal Development, Service Skills, optional Advanced Education, optional Officer (military only). */
  skillTables: SkillTable[];
  /**
   * Rank tables. Indexed by `assignment` id when ranks differ across assignments
   * (Agent: Law Enforcement vs Intelligence/Corporate share, Citizen: separate per assignment, Drifter: separate per assignment),
   * or 'enlisted'/'officer' for military.
   *
   * Lookup order in the engine:
   *   1) ranks[assignmentId] (if present and not officer)
   *   2) ranks.enlisted / ranks.officer
   */
  ranks: {
    enlisted?: RankRow[];
    officer?: RankRow[];
  } & Record<string, RankRow[] | undefined>;
  mishaps: MishapRow[];
  events: EventRow[];
  musteringOut: {
    cash: BenefitRow[];
    benefits: BenefitRow[];
  };
  flags?: {
    /** Military careers can attempt commission. */
    military?: boolean;
    /** Citizen and Drifter use assignment skill table for basic training. */
    basicTrainingFromAssignment?: boolean;
    /** Pension excluded (Scout, Rogue, Prisoner, Drifter). */
    noPension?: boolean;
    /** Cannot voluntarily enter (Prisoner). */
    enforcedEntry?: boolean;
  };
};
