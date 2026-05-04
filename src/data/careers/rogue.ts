import type { Career } from '../../types';

export const rogue: Career = {
  id: 'rogue',
  name: 'Rogue',
  flavour: 'Criminal elements familiar with the rougher or more illegal methods of attaining goals.',
  qualification: { check: { kind: 'char', char: 'DEX', target: 6 }, perPreviousCareer: -1 },
  flags: { noPension: true },
  assignments: [
    {
      id: 'thief',
      name: 'Thief',
      description: 'You steal from the rich and give to yourself.',
      survival: { kind: 'char', char: 'INT', target: 6 },
      advancement: { kind: 'char', char: 'DEX', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
      ],
    },
    {
      id: 'enforcer',
      name: 'Enforcer',
      description: 'Leg breaker, thug, or assassin for a criminal group.',
      survival: { kind: 'char', char: 'END', target: 6 },
      advancement: { kind: 'char', char: 'STR', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
      ],
    },
    {
      id: 'pirate',
      name: 'Pirate',
      description: 'Space-going corsair.',
      survival: { kind: 'char', char: 'DEX', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 2, effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
        { roll: 3, effect: { type: 'modify_char', char: 'END', delta: 1 } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Gambler' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 10,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Navigation' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Broker' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
      ],
    },
  ],
  ranks: {
    thief: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Stealth' }, level: 1 } },
      { rank: 2 },
      { rank: 3, bonus: { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 } },
      { rank: 4 },
      { rank: 5, bonus: { type: 'gain_skill', skill: { name: 'Recon' }, level: 1 } },
      { rank: 6 },
    ],
    enforcer: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 } },
      { rank: 2 },
      {
        rank: 3,
        bonus: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Gun Combat 1', effects: [{ type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 }] },
            { label: 'Melee 1', effects: [{ type: 'gain_skill', skill: { name: 'Melee' }, level: 1 }] },
          ],
        },
      },
      { rank: 4 },
      { rank: 5, bonus: { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 } },
      { rank: 6 },
    ],
    pirate: [
      { rank: 0, title: 'Lackey' },
      {
        rank: 1,
        title: 'Henchman',
        bonus: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Pilot 1', effects: [{ type: 'gain_skill', skill: { name: 'Pilot' }, level: 1 }] },
            { label: 'Gunner 1', effects: [{ type: 'gain_skill', skill: { name: 'Gunner' }, level: 1 }] },
          ],
        },
      },
      { rank: 2, title: 'Corporal' },
      {
        rank: 3,
        title: 'Sergeant',
        bonus: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Gun Combat 1', effects: [{ type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 }] },
            { label: 'Melee 1', effects: [{ type: 'gain_skill', skill: { name: 'Melee' }, level: 1 }] },
          ],
        },
      },
      { rank: 4, title: 'Lieutenant' },
      { rank: 5, title: 'Leader', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 6, title: 'Captain' },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    { roll: 2, text: 'Arrested. Take Prisoner career next term.', effects: [{ type: 'force_career', career: 'prisoner', nextTerm: true }, { type: 'eject_career' }] },
    {
      roll: 3,
      text: 'Betrayed. Convert Contact/Ally to Rival/Enemy. 2D = 2 → Prisoner next term.',
      effects: [
        { type: 'convert_connection', from: ['contact', 'ally'], to: ['rival', 'enemy'], orGainNew: true },
        { type: 'note', text: 'Roll 2D — on natural 2, take Prisoner career next term.' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'Job goes wrong; flee off-planet. +1 Deception, Pilot (small craft or spacecraft), Athletics (dexterity), or Gunner.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [
            { name: 'Deception' },
            { name: 'Pilot', spec: 'small craft' },
            { name: 'Pilot', spec: 'spacecraft' },
            { name: 'Athletics', spec: 'dexterity' },
            { name: 'Gunner' },
          ],
        },
        { type: 'eject_career' },
      ],
    },
    { roll: 5, text: 'Forced to flee — gain Enemy.', effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'eject_career' }] },
    { roll: 6, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'rogue' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Arrested and charged. Defend yourself (Advocate 8+) or hire a lawyer.',
      effects: [
        {
          type: 'choice',
          prompt: 'Defend or hire?',
          options: [
            {
              label: 'Defend yourself — Advocate 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Advocate' }, target: 8 },
                  onSuccess: [{ type: 'note', text: 'Charges dropped.' }],
                  onFailure: [
                    { type: 'gain_connection', connection: 'enemy' },
                    { type: 'force_career', career: 'prisoner', nextTerm: true },
                  ],
                },
              ],
            },
            {
              label: 'Hire a lawyer — gain Contact, lose a Benefit roll.',
              effects: [{ type: 'gain_connection', connection: 'contact' }, { type: 'lose_benefit_rolls', count: 1 }],
            },
          ],
        },
      ],
    },
    { roll: 4, text: 'Heist planning. +1 Electronics or Mechanic.', effects: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Electronics' }, { name: 'Mechanic' }] }] },
    { roll: 5, text: 'Crime pays. DM+2 to one Benefit roll, gain victim as Enemy.', effects: [{ type: 'next_benefit_roll_dm', dm: 2 }, { type: 'gain_connection', connection: 'enemy' }] },
    {
      roll: 6,
      text: 'Backstab? Yes → DM+4 to advancement; No → gain Ally.',
      effects: [
        {
          type: 'choice',
          prompt: 'Backstab?',
          options: [
            { label: 'Yes', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
            { label: 'No', effects: [{ type: 'gain_connection', connection: 'ally' }] },
          ],
        },
      ],
    },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Underworld. +1 Streetwise, Stealth, Melee, or Gun Combat.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Streetwise' }, { name: 'Stealth' }, { name: 'Melee' }, { name: 'Gun Combat' }],
        },
      ],
    },
    {
      roll: 9,
      text: 'Feud with rival group. Stealth or Gun Combat 8+. Fail → Injury. Success → extra Benefit roll.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Stealth 8+',
              effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Stealth' }, target: 8 }, onSuccess: [{ type: 'gain_benefit_rolls', count: 1 }], onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }] }],
            },
            {
              label: 'Gun Combat 8+',
              effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Gun Combat' }, target: 8 }, onSuccess: [{ type: 'gain_benefit_rolls', count: 1 }], onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }] }],
            },
          ],
        },
      ],
    },
    {
      roll: 10,
      text: 'Gambling ring. Gambler 1; wager Benefit rolls on Gambler 8+.',
      effects: [
        { type: 'gain_skill', skill: { name: 'Gambler' }, level: 1 },
        {
          type: 'choice',
          prompt: 'Wager Benefit rolls?',
          options: [
            {
              label: 'Yes',
              effects: [
                {
                  type: 'wager_benefit_rolls',
                  check: { kind: 'skill', skill: { name: 'Gambler' }, target: 8 },
                  onSuccessMultiplier: 0.5,
                  onSuccessRoundUp: true,
                  onFailureLoseAll: true,
                },
              ],
            },
            { label: 'No', effects: [] },
          ],
        },
      ],
    },
    {
      roll: 11,
      text: 'Crime lord protégé. +1 Tactics (military) OR DM+4 to advancement.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Tactics (military) 1', effects: [{ type: 'gain_skill', skill: { name: 'Tactics', spec: 'military' }, level: 1 }] },
            { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    { roll: 12, text: 'Legendary crime. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 0 },
      { roll: 2, cash: 0 },
      { roll: 3, cash: 10000 },
      { roll: 4, cash: 10000 },
      { roll: 5, cash: 50000 },
      { roll: 6, cash: 100000 },
      { roll: 7, cash: 100000 },
    ],
    benefits: [
      { roll: 1, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      { roll: 2, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 3, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 4, label: '1D Ship Shares', effect: { type: 'gain_ship_share', count: { dice: '1D' } } },
      { roll: 5, label: 'Armour', effect: { type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } } },
      { roll: 6, label: 'DEX +1', effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
      { roll: 7, label: '2D Ship Shares', effect: { type: 'gain_ship_share', count: { dice: '2D' } } },
    ],
  },
};
