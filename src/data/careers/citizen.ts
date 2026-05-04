import type { Career } from '../../types';

export const citizen: Career = {
  id: 'citizen',
  name: 'Citizen',
  flavour: 'Individuals serving in a corporation, bureaucracy or industry, or making a new life on an untamed planet.',
  qualification: {
    check: { kind: 'char', char: 'EDU', target: 5 },
    perPreviousCareer: -1,
  },
  flags: { basicTrainingFromAssignment: true },
  assignments: [
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Executive or manager in a large corporation.',
      survival: { kind: 'char', char: 'SOC', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Broker' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
      ],
    },
    {
      id: 'worker',
      name: 'Worker',
      description: 'Blue collar worker on an industrial world.',
      survival: { kind: 'char', char: 'END', target: 4 },
      advancement: { kind: 'char', char: 'EDU', target: 8 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Profession' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
      ],
    },
    {
      id: 'colonist',
      name: 'Colonist',
      description: 'Building a new life on a recently settled world.',
      survival: { kind: 'char', char: 'INT', target: 7 },
      advancement: { kind: 'char', char: 'END', target: 5 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Animals' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
        { roll: 2, effect: { type: 'modify_char', char: 'INT', delta: 1 } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Gambler' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Steward' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Profession' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 10,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Art' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
      ],
    },
  ],
  ranks: {
    corporate: [
      { rank: 0 },
      { rank: 1 },
      { rank: 2, title: 'Manager', bonus: { type: 'gain_skill', skill: { name: 'Admin' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Senior Manager', bonus: { type: 'gain_skill', skill: { name: 'Advocate' }, level: 1 } },
      { rank: 5 },
      { rank: 6, title: 'Director', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
    ],
    worker: [
      { rank: 0 },
      { rank: 1 },
      { rank: 2, title: 'Technician', bonus: { type: 'gain_skill', skill: { name: 'Profession' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Craftsman', bonus: { type: 'gain_skill', skill: { name: 'Mechanic' }, level: 1 } },
      { rank: 5 },
      { rank: 6, title: 'Master Technician', bonus: { type: 'gain_skill', skill: { name: 'Engineer' }, level: 1 } },
    ],
    colonist: [
      { rank: 0 },
      { rank: 1 },
      { rank: 2, title: 'Settler', bonus: { type: 'gain_skill', skill: { name: 'Survival' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Explorer', bonus: { type: 'gain_skill', skill: { name: 'Navigation' }, level: 1 } },
      { rank: 5 },
      { rank: 6, bonus: { type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 } },
    ],
  },
  mishaps: [
    {
      roll: 1,
      text: 'Severely injured.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
    {
      roll: 2,
      text: 'Harassed by a criminal gang. Gain the gang as Enemy.',
      effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'eject_career' }],
    },
    {
      roll: 3,
      text: 'Hard times — lose 1 SOC.',
      effects: [{ type: 'modify_char', char: 'SOC', delta: -1 }, { type: 'eject_career' }],
    },
    {
      roll: 4,
      text: 'Investigated by authorities. Co-operate (DM+2 to next qualification, business shuts) or refuse (gain Ally).',
      effects: [
        {
          type: 'choice',
          prompt: 'Cooperate or refuse?',
          options: [
            { label: 'Cooperate', effects: [{ type: 'next_qualification_dm', dm: 2 }] },
            { label: 'Refuse', effects: [{ type: 'gain_connection', connection: 'ally' }] },
          ],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 5,
      text: 'Revolution forces you off-planet. Streetwise 8+ → +1 to a skill you have.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'skill', skill: { name: 'Streetwise' }, target: 8 },
          onSuccess: [{ type: 'gain_skill_choice', existingOnly: true }],
          onFailure: [],
        },
        { type: 'eject_career' },
      ],
    },
    { roll: 6, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'citizen' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Political upheaval. Gain Advocate 1, Persuade 1, Explosives 1, or Streetwise 1; roll 8+ on it. Success → DM+2 to next advancement. Fail → DM-2 to next survival.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Advocate' }, { name: 'Persuade' }, { name: 'Explosives' }, { name: 'Streetwise' }],
        },
        { type: 'note', text: 'Roll 8+ on the chosen skill: success → DM+2 to next advancement; failure → DM-2 to next survival.' },
      ],
    },
    {
      roll: 4,
      text: 'Heavy vehicles. +1 to Mechanic, Drive, Electronics, Flyer or Engineer.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Mechanic' }, { name: 'Drive' }, { name: 'Electronics' }, { name: 'Flyer' }, { name: 'Engineer' }],
        },
      ],
    },
    { roll: 5, text: 'Business expands. DM+1 to one Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 6,
      text: 'Advanced training. EDU 10+ → any skill at level 1.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'EDU', target: 10 },
          onSuccess: [{ type: 'gain_skill_choice', level: 1, excludeJoat: true }],
          onFailure: [],
        },
      ],
    },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Profit illegally? DM+1 to a Benefit roll and Streetwise 1, Deception 1, or a criminal Contact.',
      effects: [
        {
          type: 'choice',
          prompt: 'Profit illegally?',
          options: [
            {
              label: 'Yes',
              effects: [
                { type: 'next_benefit_roll_dm', dm: 1 },
                {
                  type: 'choice',
                  prompt: 'Pick one',
                  options: [
                    { label: 'Streetwise 1', effects: [{ type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 }] },
                    { label: 'Deception 1', effects: [{ type: 'gain_skill', skill: { name: 'Deception' }, level: 1 }] },
                    { label: 'Criminal Contact', effects: [{ type: 'gain_connection', connection: 'contact' }] },
                  ],
                },
              ],
            },
            { label: 'No', effects: [] },
          ],
        },
      ],
    },
    { roll: 9, text: 'Rewarded for diligence. DM+2 to next advancement.', effects: [{ type: 'next_advancement_dm', dm: 2 }] },
    {
      roll: 10,
      text: 'Technical experience. +1 Electronics or Engineer.',
      effects: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Electronics' }, { name: 'Engineer' }] }],
    },
    { roll: 11, text: 'Befriended by superior. Gain Ally; +1 Diplomat or DM+4 to next advancement.', effects: [
      { type: 'gain_connection', connection: 'ally' },
      {
        type: 'choice', prompt: 'Pick one', options: [
          { label: 'Diplomat 1', effects: [{ type: 'gain_skill', skill: { name: 'Diplomat' }, level: 1 }] },
          { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
        ],
      },
    ] },
    { roll: 12, text: 'Rise to a position of power. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 2000 },
      { roll: 2, cash: 5000 },
      { roll: 3, cash: 10000 },
      { roll: 4, cash: 10000 },
      { roll: 5, cash: 10000 },
      { roll: 6, cash: 50000 },
      { roll: 7, cash: 100000 },
    ],
    benefits: [
      { roll: 1, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      { roll: 2, label: 'Ally', effect: { type: 'gain_connection', connection: 'ally' } },
      { roll: 3, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 4, label: 'Gun', effect: { type: 'gain_benefit', benefit: { type: 'gun', crLimit: 3000, tlLimit: 12 } } },
      { roll: 5, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 6, label: 'Two Ship Shares', effect: { type: 'gain_ship_share', count: { fixed: 2 } } },
      { roll: 7, label: 'TAS Membership', effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } } },
    ],
  },
};
