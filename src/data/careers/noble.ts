import type { Career } from '../../types';

export const noble: Career = {
  id: 'noble',
  name: 'Noble',
  flavour: 'Individuals of the upper class with little consistent function but ample ready money.',
  qualification: {
    check: { kind: 'char', char: 'SOC', target: 10 },
    perPreviousCareer: -1,
    autoQualifyIf: { char: 'SOC', atLeast: 10 },
  },
  assignments: [
    {
      id: 'administrator',
      name: 'Administrator',
      description: 'Serves in the planetary government or rules over a fiefdom.',
      survival: { kind: 'char', char: 'INT', target: 4 },
      advancement: { kind: 'char', char: 'EDU', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Broker' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
      ],
    },
    {
      id: 'diplomat',
      name: 'Diplomat',
      description: 'Diplomat or other state official.',
      survival: { kind: 'char', char: 'INT', target: 5 },
      advancement: { kind: 'char', char: 'SOC', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Steward' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
      ],
    },
    {
      id: 'dilettante',
      name: 'Dilettante',
      description: 'Known for being known with no useful function in society.',
      survival: { kind: 'char', char: 'SOC', target: 5 },
      advancement: { kind: 'char', char: 'INT', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Gambler' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'modify_char', char: 'STR', delta: 1 } },
        { roll: 2, effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
        { roll: 3, effect: { type: 'modify_char', char: 'END', delta: 1 } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Gambler' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Art' } } },
      ],
    },
  ],
  ranks: {
    administrator: [
      { rank: 0, title: 'Assistant' },
      { rank: 1, title: 'Clerk', bonus: { type: 'gain_skill', skill: { name: 'Admin' }, level: 1 } },
      { rank: 2, title: 'Supervisor' },
      { rank: 3, title: 'Manager', bonus: { type: 'gain_skill', skill: { name: 'Advocate' }, level: 1 } },
      { rank: 4, title: 'Chief' },
      { rank: 5, title: 'Director', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 6, title: 'Minister' },
    ],
    diplomat: [
      { rank: 0, title: 'Intern' },
      { rank: 1, title: '3rd Secretary', bonus: { type: 'gain_skill', skill: { name: 'Admin' }, level: 1 } },
      { rank: 2, title: '2nd Secretary' },
      { rank: 3, title: '1st Secretary', bonus: { type: 'gain_skill', skill: { name: 'Advocate' }, level: 1 } },
      { rank: 4, title: 'Counsellor' },
      { rank: 5, title: 'Minister', bonus: { type: 'gain_skill', skill: { name: 'Diplomat' }, level: 1 } },
      { rank: 6, title: 'Ambassador' },
    ],
    dilettante: [
      { rank: 0, title: 'Wastrel' },
      { rank: 1 },
      { rank: 2, title: 'Ingrate', bonus: { type: 'gain_skill', skill: { name: 'Carouse' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Black Sheep', bonus: { type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 } },
      { rank: 5 },
      { rank: 6, title: 'Scoundrel', bonus: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' }, level: 1 } },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    { roll: 2, text: 'Family scandal — SOC -1.', effects: [{ type: 'modify_char', char: 'SOC', delta: -1 }, { type: 'eject_career' }] },
    {
      roll: 3,
      text: 'Disaster or war. Stealth 8+ or Deception 8+ to escape; fail → Injury.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            { label: 'Stealth 8+', effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Stealth' }, target: 8 }, onSuccess: [], onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }] }] },
            { label: 'Deception 8+', effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Deception' }, target: 8 }, onSuccess: [], onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }] }] },
          ],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'Political manoeuvring. +1 Diplomat or Advocate; gain Rival.',
      effects: [
        { type: 'gain_skill_choice', level: 1, from: [{ name: 'Diplomat' }, { name: 'Advocate' }] },
        { type: 'gain_connection', connection: 'rival' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 5,
      text: 'Assassin. END 8+. Fail → Injury.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'END', target: 8 },
          onSuccess: [],
          onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }],
        },
        { type: 'eject_career' },
      ],
    },
    { roll: 6, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'noble' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Duel for honour. Refuse → -1 SOC. Accept → Melee (blade) 8+: success → +1 SOC; fail → Injury and -1 SOC. Either way, +1 to a relevant skill.',
      effects: [
        {
          type: 'choice',
          prompt: 'Refuse or accept the duel?',
          options: [
            { label: 'Refuse', effects: [{ type: 'modify_char', char: 'SOC', delta: -1 }] },
            {
              label: 'Accept',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Melee', spec: 'blade' }, target: 8 },
                  onSuccess: [{ type: 'modify_char', char: 'SOC', delta: 1 }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'modify_char', char: 'SOC', delta: -1 }],
                },
                {
                  type: 'gain_skill_choice',
                  level: 1,
                  from: [{ name: 'Melee', spec: 'blade' }, { name: 'Leadership' }, { name: 'Tactics' }, { name: 'Deception' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Wide experiences. +1 Animals (handling), Art, Carouse, or Streetwise.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Animals', spec: 'handling' }, { name: 'Art' }, { name: 'Carouse' }, { name: 'Streetwise' }],
        },
      ],
    },
    { roll: 5, text: 'Gift from a relative. DM+1 to a Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 6,
      text: 'Politics. +1 Advocate, Admin, Diplomat, or Persuade; gain Rival.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Advocate' }, { name: 'Admin' }, { name: 'Diplomat' }, { name: 'Persuade' }],
        },
        { type: 'gain_connection', connection: 'rival' },
      ],
    },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Conspiracy. Refuse → Enemy. Accept → Deception or Persuade 8+; success → +1 to a relevant skill; fail → Mishap.',
      effects: [
        {
          type: 'choice',
          prompt: 'Refuse or accept?',
          options: [
            { label: 'Refuse', effects: [{ type: 'gain_connection', connection: 'enemy' }] },
            {
              label: 'Accept — Deception 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Deception' }, target: 8 },
                  onSuccess: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Deception' }, { name: 'Persuade' }, { name: 'Tactics' }, { name: 'Carouse' }] }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'noble' } }],
                },
              ],
            },
            {
              label: 'Accept — Persuade 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Persuade' }, target: 8 },
                  onSuccess: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Deception' }, { name: 'Persuade' }, { name: 'Tactics' }, { name: 'Carouse' }] }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'noble' } }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 9,
      text: 'Acclaimed reign. Gain Enemy; DM+2 to next advancement.',
      effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'next_advancement_dm', dm: 2 }],
    },
    {
      roll: 10,
      text: 'High society. +1 Carouse, Diplomat, Persuade, or Steward; gain Rival and Ally.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Carouse' }, { name: 'Diplomat' }, { name: 'Persuade' }, { name: 'Steward' }],
        },
        { type: 'gain_connection', connection: 'rival' },
        { type: 'gain_connection', connection: 'ally' },
      ],
    },
    {
      roll: 11,
      text: 'Powerful Ally. +1 Leadership OR DM+4 to advancement.',
      effects: [
        { type: 'gain_connection', connection: 'ally' },
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Leadership 1', effects: [{ type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 }] },
            { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    { roll: 12, text: 'Imperial recognition. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 10000 },
      { roll: 2, cash: 10000 },
      { roll: 3, cash: 50000 },
      { roll: 4, cash: 50000 },
      { roll: 5, cash: 100000 },
      { roll: 6, cash: 100000 },
      { roll: 7, cash: 200000 },
    ],
    benefits: [
      { roll: 1, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      { roll: 2, label: 'Two Ship Shares', effect: { type: 'gain_ship_share', count: { fixed: 2 } } },
      { roll: 3, label: 'Blade', effect: { type: 'gain_benefit', benefit: { type: 'blade', crLimit: 1000, tlLimit: 12 } } },
      { roll: 4, label: 'SOC +1', effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { roll: 5, label: 'TAS Membership', effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } } },
      { roll: 6, label: 'Yacht', effect: { type: 'gain_benefit', benefit: { type: 'yacht' } } },
      {
        roll: 7,
        label: 'SOC +1 and Yacht',
        effect: {
          type: 'choice',
          prompt: 'Apply',
          options: [
            { label: 'Apply', effects: [{ type: 'modify_char', char: 'SOC', delta: 1 }, { type: 'gain_benefit', benefit: { type: 'yacht' } }] },
          ],
        },
      },
    ],
  },
};
