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
  | 'Vacc Suit';

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

/** Static metadata about a skill — what specializations exist, whether it caps differently, etc. */
export type SkillDef = {
  name: SkillName;
  /** Empty array means no specializations. */
  specs: readonly string[];
  /** When true, the skill is gained in the parent form (e.g. Admin) without a spec. */
  hasParent: boolean;
  /** Skills that may not be raised via training (or, for JoaT, ever). */
  notTrainable?: boolean;
  description?: string;
};
