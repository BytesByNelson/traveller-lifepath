import type { CharCode } from './characteristics';

export type SkillName =
  | 'Admin'
  | 'Advocate'
  | 'Animals'
  | 'Art'
  | 'Astrogation'
  | 'Athletics'
  | 'Broker'
  | 'Carouse'
  | 'Deception'
  | 'Diplomat'
  | 'Drive'
  | 'Electronics'
  | 'Engineer'
  | 'Explosives'
  | 'Flyer'
  | 'Gambler'
  | 'Gun Combat'
  | 'Gunner'
  | 'Heavy Weapons'
  | 'Investigate'
  | 'Jack-of-all-Trades'
  | 'Language'
  | 'Leadership'
  | 'Mechanic'
  | 'Medic'
  | 'Melee'
  | 'Navigation'
  | 'Persuade'
  | 'Pilot'
  | 'Profession'
  | 'Recon'
  | 'Science'
  | 'Seafarer'
  | 'Stealth'
  | 'Steward'
  | 'Streetwise'
  | 'Survival'
  | 'Tactics'
  | 'Vacc Suit'
  // Psionic talents — treated as skills, each with associated powers.
  | 'Telepathy'
  | 'Clairvoyance'
  | 'Telekinesis'
  | 'Awareness'
  | 'Teleportation';

/** A reference to a skill, optionally narrowed to a specialization. */
export type SkillRef = {
  name: SkillName;
  /** Specialization name. Optional — when absent, refers to the parent skill. */
  spec?: string;
};

/** Source tag for a skill entry — useful for transparency and undo. */
export type SkillSource =
  | { kind: 'background' }
  | { kind: 'pre_career_education'; institution: 'university' | 'military_academy' }
  | { kind: 'basic_training'; career: string; termIndex: number }
  | { kind: 'career_skill_table'; career: string; termIndex: number; table: string; roll: number }
  | { kind: 'rank_bonus'; career: string; rank: number; termIndex: number }
  | { kind: 'event'; career: string; termIndex: number; eventRoll: number }
  | { kind: 'mishap'; career: string; termIndex: number; mishapRoll: number }
  | { kind: 'connection'; otherTraveller?: string }
  | { kind: 'graduation_bonus'; institution: 'university' | 'military_academy' }
  | { kind: 'study_period' }
  | { kind: 'manual' };

export type SkillEntry = SkillRef & {
  level: number;
  source: SkillSource;
};

/** Difficulty band per the task table on p.61 of the rulebook. */
export type TaskDifficulty =
  | 'simple'        // 2+
  | 'easy'          // 4+
  | 'routine'       // 6+
  | 'average'       // 8+
  | 'difficult'     // 10+
  | 'very_difficult' // 12+
  | 'formidable'    // 14+
  | 'impossible';   // 16+

/** Target number for a difficulty band. */
export const DIFFICULTY_TARGETS: Record<TaskDifficulty, number> = {
  simple: 2,
  easy: 4,
  routine: 6,
  average: 8,
  difficult: 10,
  very_difficult: 12,
  formidable: 14,
  impossible: 16,
};

/** A worked example of a check using the skill, drawn from the rulebook. */
export type TaskExample = {
  name: string;
  difficulty: TaskDifficulty;
  /** Either a single characteristic or an "or" choice. Empty when the rule says e.g. "no characteristic". */
  characteristic?: CharCode | CharCode[];
  /** Free-form timeframe string from the rulebook ("1D minutes", "1D x 10 seconds"…). */
  timeframe: string;
  /** Some checks are opposed; record the opposing skill if so. */
  opposed?: SkillName;
  /** Specialization the example applies to, when relevant. */
  spec?: string;
};

/** Static metadata about a skill — what specializations exist, when an example check might apply. */
export type SkillDef = {
  name: SkillName;
  /** Empty array means no specializations. */
  specs: readonly string[];
  /** When true, the skill is gained in the parent form (e.g. Admin) without a spec. */
  hasParent: boolean;
  /** Skills that may not be raised via training (or, for JoaT, ever). */
  notTrainable?: boolean;
  /** Plain-English description from the rulebook. */
  description: string;
  /** Per-spec descriptions, when the rulebook elaborates on each specialization. */
  specDescriptions?: Record<string, string>;
  /** A few example checks from the rulebook to help players understand what the skill covers. */
  tasks?: TaskExample[];
};
