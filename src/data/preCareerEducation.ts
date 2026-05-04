import type { Effect, SkillName } from '../types';

/** University entry/skills/graduation — page 16. */
export const UNIVERSITY = {
  entry: { check: { kind: 'char' as const, char: 'EDU' as const, target: 6 } },
  entryDMs: {
    perTerm: { term2: -1, term3: -2 } as Record<string, number>,
    socAtLeast9: 1,
  },
  /**
   * Graduation: INT 7+ (note: PDF says "INT 6+" once and "INT 7+" elsewhere — using the strict
   * Mongoose 2022 reading of INT 7+ for graduation; honours at 11+).
   * Re-reading: the PDF text of UNIVERSITY says "Graduation: INT 6+. If 10+ is rolled, graduate with honours."
   * — so we go with INT 6+ / 10+.
   */
  graduation: { check: { kind: 'char' as const, char: 'INT' as const, target: 6 } },
  graduationHonoursAtLeast: 10,

  /** Choose a level-0 skill and a level-1 skill from this list. */
  skillPickList: [
    'Admin',
    'Advocate',
    'Animals',
    'Art',
    'Astrogation',
    'Electronics',
    'Engineer',
    'Language',
    'Medic',
    'Navigation',
    'Profession',
    'Science',
  ] as SkillName[],

  /** Effects applied immediately on entry (before any events). */
  onEnter: [{ type: 'modify_char', char: 'EDU', delta: 1 }] as Effect[],

  /** Graduation benefits applied on success. */
  onGraduate: [
    /* +1 to each of the two skills chosen on entry */
    { type: 'note', text: 'Increase each of the two skills chosen on entry by +1.' },
    { type: 'modify_char', char: 'EDU', delta: 1 },
  ] as Effect[],

  /** DM granted to qualification rolls for these careers if you graduated. +2 if honours. */
  graduationCareerBonusDM: 1,
  graduationCareerBonusDMHonours: 2,
  bonusCareers: ['agent', 'army', 'marine', 'navy', 'scholar', 'scout'] as const,
  /**
   * Per the rulebook: "Citizen (corporate)" and "Entertainer (journalist)" — assignment-specific.
   * Engine should respect the assignment when applying.
   */
  bonusAssignmentSpecific: [
    { career: 'citizen', assignment: 'corporate' },
    { career: 'entertainer', assignment: 'journalist' },
  ] as const,

  /** Successful graduation also allows a commission roll on first military career, DM+2 (auto if honours). */
  commissionDM: 2,
  commissionAutoOnHonours: true,
};

/** Military Academy — page 16. */
export const MILITARY_ACADEMY = {
  entry: {
    army: { check: { kind: 'char' as const, char: 'END' as const, target: 7 } },
    marine: { check: { kind: 'char' as const, char: 'END' as const, target: 8 } },
    navy: { check: { kind: 'char' as const, char: 'INT' as const, target: 8 } },
  },
  entryDMs: {
    perTerm: { term2: -2, term3: -4 } as Record<string, number>,
  },

  /** Graduation: INT 7+; honours at 11+. */
  graduation: { check: { kind: 'char' as const, char: 'INT' as const, target: 7 } },
  graduationHonoursAtLeast: 11,
  graduationDMs: {
    endAtLeast8: 1,
    socAtLeast8: 1,
  },

  /** Failing graduation but not rolling 2 or less still grants automatic entry — without first-term commission. */
  failsafeAutoEntry: true,
  failsafeAutoEntryFloor: 3, // i.e. roll 2 or less = no auto-entry

  /** Skills: gain all Service Skills of the tied military career at level 0 as basic training. */
  graduationBenefits: {
    pickAdvancedServiceSkillsAtLevel1: 3,
    eduPlusOne: true,
    socPlusOneOnHonours: true,
    autoEntryToTiedCareer: true,
    /** Allows commission roll DM+2 (auto if honours) on first term of the tied military career. */
    commissionDM: 2,
    commissionAutoOnHonours: true,
  },
};

/** Pre-career events — page 17. */
export type PreCareerEventRow = {
  roll: number;
  text: string;
  effects: Effect[];
};

export const PRE_CAREER_EVENTS: PreCareerEventRow[] = [
  {
    roll: 2,
    text: 'Approached by an underground psionic group; you may test PSI and attempt the Psion career later.',
    effects: [{ type: 'gain_psion_eligibility' }],
  },
  {
    roll: 3,
    text: 'Deep tragedy. You crash and fail to graduate.',
    effects: [{ type: 'note', text: 'Fail to graduate this term.' }],
  },
  {
    roll: 4,
    text: 'A prank goes wrong. SOC 8+: success → Rival; fail → Enemy. Roll 2 → fail to graduate and Prisoner next term.',
    effects: [
      {
        type: 'check',
        roll: { kind: 'char', char: 'SOC', target: 8 },
        onSuccess: [{ type: 'gain_connection', connection: 'rival' }],
        onFailure: [{ type: 'gain_connection', connection: 'enemy' }],
      },
      {
        type: 'note',
        text: 'If natural roll on the SOC check was exactly 2, fail to graduate and take Prisoner next term.',
      },
    ],
  },
  {
    roll: 5,
    text: 'Taking advantage of youth, you party as much as you study. Gain Carouse 1.',
    effects: [{ type: 'gain_skill', skill: { name: 'Carouse' }, level: 1 }],
  },
  {
    roll: 6,
    text: 'You make a tightly-knit clique pact. Gain D3 Allies.',
    effects: [{ type: 'gain_connection', connection: 'ally', count: { dice: 'D3' } }],
  },
  {
    roll: 7,
    text: 'Life Event. Roll on the Life Events table.',
    effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }],
  },
  {
    roll: 8,
    text: 'You join a political movement. SOC 8+ → leading figure: Ally within movement, Enemy in wider society.',
    effects: [
      {
        type: 'check',
        roll: { kind: 'char', char: 'SOC', target: 8 },
        onSuccess: [
          { type: 'gain_connection', connection: 'ally' },
          { type: 'gain_connection', connection: 'enemy' },
        ],
        onFailure: [],
      },
    ],
  },
  {
    roll: 9,
    text: 'You develop a hobby. Gain any skill (except Jack-of-all-Trades) at level 0.',
    effects: [{ type: 'gain_skill_choice', level: 0, excludeJoat: true }],
  },
  {
    roll: 10,
    text: 'You overturn a tutor. Roll 9+ on a skill from this term; on success, +1 to that skill and gain the tutor as a Rival.',
    effects: [
      { type: 'note', text: 'Player picks a skill learned this term and rolls 9+ on it.' },
      { type: 'gain_connection', connection: 'rival' },
    ],
  },
  {
    roll: 11,
    text: 'War — wide-ranging draft. Flee to Drifter, or be drafted (1D: 1-3 Army, 4-5 Marine, 6 Navy). SOC 9+ → avoid.',
    effects: [
      {
        type: 'check',
        roll: { kind: 'char', char: 'SOC', target: 9 },
        onSuccess: [{ type: 'note', text: 'Strings pulled — avoid the draft and complete education.' }],
        onFailure: [
          {
            type: 'choice',
            prompt: 'War draft',
            options: [
              {
                label: 'Flee to Drifter next term',
                effects: [{ type: 'force_career', career: 'drifter', nextTerm: true }],
              },
              {
                label: 'Be drafted (engine rolls 1D)',
                effects: [{ type: 'force_draft', nextTerm: true }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    roll: 12,
    text: 'Recognition for your initiative. Increase SOC by +1.',
    effects: [{ type: 'modify_char', char: 'SOC', delta: 1 }],
  },
];
