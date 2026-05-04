import type { Career } from '../../types';

export const drifter: Career = {
  id: 'drifter',
  name: 'Drifter',
  flavour: 'Wanderers, hitchhikers and travellers without obvious purpose or direction.',
  qualification: { check: { kind: 'char', char: 'STR', target: 0 }, special: 'automatic' },
  flags: { basicTrainingFromAssignment: true, noPension: true },
  assignments: [
    {
      id: 'barbarian',
      name: 'Barbarian',
      description: 'Living on a primitive world without the benefits of technology.',
      survival: { kind: 'char', char: 'END', target: 7 },
      advancement: { kind: 'char', char: 'STR', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Animals' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        {
          roll: 5,
          effect: {
            type: 'choice',
            prompt: 'Seafarer (personal or sail)',
            options: [
              { label: 'personal', effects: [{ type: 'gain_skill', skill: { name: 'Seafarer', spec: 'personal' } }] },
              { label: 'sail', effects: [{ type: 'gain_skill', skill: { name: 'Seafarer', spec: 'sail' } }] },
            ],
          },
        },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
      ],
    },
    {
      id: 'wanderer',
      name: 'Wanderer',
      description: 'A space bum, living hand-to-mouth in slums and spaceports.',
      survival: { kind: 'char', char: 'END', target: 7 },
      advancement: { kind: 'char', char: 'INT', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
      ],
    },
    {
      id: 'scavenger',
      name: 'Scavenger',
      description: 'Belter or salvage crew.',
      survival: { kind: 'char', char: 'DEX', target: 7 },
      advancement: { kind: 'char', char: 'END', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Pilot', spec: 'small craft' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Profession' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'modify_char', char: 'STR', delta: 1 } },
        { roll: 2, effect: { type: 'modify_char', char: 'END', delta: 1 } },
        { roll: 3, effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Profession' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
      ],
    },
  ],
  ranks: {
    barbarian: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Survival' }, level: 1 } },
      { rank: 2, title: 'Warrior', bonus: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Chieftain', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 5 },
      { rank: 6, title: 'Warlord' },
    ],
    wanderer: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 } },
      { rank: 2 },
      { rank: 3, bonus: { type: 'gain_skill', skill: { name: 'Deception' }, level: 1 } },
      { rank: 4 },
      { rank: 5 },
      { rank: 6 },
    ],
    scavenger: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Vacc Suit' }, level: 1 } },
      { rank: 2 },
      {
        rank: 3,
        bonus: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Profession (belter) 1', effects: [{ type: 'gain_skill', skill: { name: 'Profession', spec: 'belter' }, level: 1 }] },
            { label: 'Mechanic 1', effects: [{ type: 'gain_skill', skill: { name: 'Mechanic' }, level: 1 }] },
          ],
        },
      },
      { rank: 4 },
      { rank: 5 },
      { rank: 6 },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    { roll: 2, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    { roll: 3, text: 'Foe — gain an Enemy.', effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'eject_career' }] },
    { roll: 4, text: 'Life-threatening illness — END -1.', effects: [{ type: 'modify_char', char: 'END', delta: -1 }, { type: 'eject_career' }] },
    {
      roll: 5,
      text: 'Betrayed by a friend. Convert a Contact/Ally to Rival/Enemy. 2D = 2 → Prisoner next term.',
      effects: [
        { type: 'convert_connection', from: ['contact', 'ally'], to: ['rival', 'enemy'], orGainNew: true },
        { type: 'note', text: 'Roll 2D — on a 2, take Prisoner career next term.' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 6,
      text: 'You do not know what happened. Gap in memory.',
      effects: [{ type: 'note', text: 'Amnesia — gap in memory.' }, { type: 'eject_career' }],
    },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'drifter' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Patron offers a job. Accept → DM+4 to next qualification but owe a favour.',
      effects: [
        {
          type: 'choice',
          prompt: 'Accept?',
          options: [
            { label: 'Yes', effects: [{ type: 'next_qualification_dm', dm: 4 }, { type: 'note', text: 'Owe the patron a favour.' }] },
            { label: 'No', effects: [] },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Pick up skills. +1 Jack-of-all-Trades, Survival, Streetwise, or Melee (any).',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Jack-of-all-Trades' }, { name: 'Survival' }, { name: 'Streetwise' }, { name: 'Melee' }],
        },
      ],
    },
    { roll: 5, text: 'Scavenge something useful. DM+1 to one Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    { roll: 6, text: 'Encounter unusual. Roll on Unusual Events.', effects: [{ type: 'roll_on_table', table: { kind: 'unusual_events' } }] },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Attacked by enemies. Gain an Enemy if you do not have one. Roll Melee 8+, Gun Combat 8+, or Stealth 8+ to avoid Injury.',
      effects: [
        { type: 'gain_connection', connection: 'enemy' },
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Melee 8+',
              effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Melee' }, target: 8 }, onSuccess: [], onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }] }],
            },
            {
              label: 'Gun Combat 8+',
              effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Gun Combat' }, target: 8 }, onSuccess: [], onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }] }],
            },
            {
              label: 'Stealth 8+',
              effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Stealth' }, target: 8 }, onSuccess: [], onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }] }],
            },
          ],
        },
      ],
    },
    {
      roll: 9,
      text: 'Risky adventure. 1D: 1-2 injured/Prisoner; 3-4 nothing; 5-6 DM+4 to one Benefit roll.',
      effects: [
        {
          type: 'choice',
          prompt: 'Take the risk?',
          options: [
            { label: 'Yes — engine rolls 1D', effects: [{ type: 'note', text: '1-2 injured or Prisoner; 3-4 nothing; 5-6 DM+4 to one Benefit roll.' }] },
            { label: 'No', effects: [] },
          ],
        },
      ],
    },
    { roll: 10, text: 'Edge hones abilities. +1 to a skill you already have.', effects: [{ type: 'gain_skill_choice', existingOnly: true }] },
    { roll: 11, text: 'Forcibly drafted. Roll for the Draft next term.', effects: [{ type: 'force_draft', nextTerm: true }] },
    { roll: 12, text: 'Thrive on adversity. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 0 },
      { roll: 2, cash: 0 },
      { roll: 3, cash: 1000 },
      { roll: 4, cash: 2000 },
      { roll: 5, cash: 3000 },
      { roll: 6, cash: 4000 },
      { roll: 7, cash: 8000 },
    ],
    benefits: [
      { roll: 1, label: 'Contact', effect: { type: 'gain_connection', connection: 'contact' } },
      { roll: 2, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 3, label: 'Ally', effect: { type: 'gain_connection', connection: 'ally' } },
      { roll: 4, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 5, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 6, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      { roll: 7, label: 'Two Ship Shares', effect: { type: 'gain_ship_share', count: { fixed: 2 } } },
    ],
  },
};
