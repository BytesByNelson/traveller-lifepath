import type { Career } from '../../types';

export const scout: Career = {
  id: 'scout',
  name: 'Scout',
  flavour: 'Members of the exploratory service — couriers, surveyors, and explorers.',
  qualification: { check: { kind: 'char', char: 'INT', target: 5 }, perPreviousCareer: -1 },
  flags: { noPension: true },
  assignments: [
    {
      id: 'courier',
      name: 'Courier',
      description: 'Shuttle messages and high-value packages around the galaxy.',
      survival: { kind: 'char', char: 'END', target: 5 },
      advancement: { kind: 'char', char: 'EDU', target: 9 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Pilot', spec: 'spacecraft' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
      ],
    },
    {
      id: 'surveyor',
      name: 'Surveyor',
      description: 'Visit border worlds and assess their worth.',
      survival: { kind: 'char', char: 'END', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 8 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Navigation' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
      ],
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Wherever the map is blank — uncharted space.',
      survival: { kind: 'char', char: 'END', target: 7 },
      advancement: { kind: 'char', char: 'EDU', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
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
        { roll: 4, effect: { type: 'modify_char', char: 'INT', delta: 1 } },
        { roll: 5, effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        {
          roll: 1,
          effect: {
            type: 'choice',
            prompt: 'Pilot (small craft or spacecraft)',
            options: [
              { label: 'Small craft', effects: [{ type: 'gain_skill', skill: { name: 'Pilot', spec: 'small craft' } }] },
              { label: 'Spacecraft', effects: [{ type: 'gain_skill', skill: { name: 'Pilot', spec: 'spacecraft' } }] },
            ],
          },
        },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Seafarer' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Explosives' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
      ],
    },
  ],
  ranks: {
    enlisted: [
      { rank: 0 },
      { rank: 1, title: 'Scout', bonus: { type: 'gain_skill', skill: { name: 'Vacc Suit' }, level: 1 } },
      { rank: 2 },
      { rank: 3, title: 'Senior Scout', bonus: { type: 'gain_skill', skill: { name: 'Pilot' }, level: 1 } },
      { rank: 4 },
      { rank: 5 },
      { rank: 6 },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    { roll: 2, text: 'Psychologically damaged. INT or SOC -1.', effects: [{ type: 'modify_char_choice', chars: ['INT', 'SOC'], delta: -1 }, { type: 'eject_career' }] },
    {
      roll: 3,
      text: 'Ship damaged; hitch-hike home. Gain 1D Contacts and D3 Enemies.',
      effects: [
        { type: 'gain_connection', connection: 'contact', count: { dice: '1D' } },
        { type: 'gain_connection', connection: 'enemy', count: { dice: 'D3' } },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'Caused a conflict. Gain Rival and Diplomat 1.',
      effects: [
        { type: 'gain_connection', connection: 'rival' },
        { type: 'gain_skill', skill: { name: 'Diplomat' }, level: 1 },
        { type: 'eject_career' },
      ],
    },
    { roll: 5, text: 'No idea what happened to you. Ship found drifting.', effects: [{ type: 'note', text: 'Memory gap.' }, { type: 'eject_career' }] },
    { roll: 6, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'scout' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Ship ambushed. Pilot 8+ to escape, or Persuade 10+ to bargain. Fail → ship destroyed, can\'t re-enlist this term. Gain Enemy.',
      effects: [
        {
          type: 'choice',
          prompt: 'Run or treat?',
          options: [
            {
              label: 'Run — Pilot 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Pilot' }, target: 8 },
                  onSuccess: [{ type: 'gain_skill', skill: { name: 'Electronics', spec: 'sensors' }, level: 1 }],
                  onFailure: [{ type: 'eject_career' }],
                },
              ],
            },
            {
              label: 'Treat — Persuade 10+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Persuade' }, target: 10 },
                  onSuccess: [{ type: 'gain_skill', skill: { name: 'Electronics', spec: 'sensors' }, level: 1 }],
                  onFailure: [{ type: 'eject_career' }],
                },
              ],
            },
          ],
        },
        { type: 'gain_connection', connection: 'enemy' },
      ],
    },
    {
      roll: 4,
      text: 'Survey alien world. +1 Animals (riding or training), Survival, Recon, or Science.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [
            { name: 'Animals', spec: 'riding' },
            { name: 'Animals', spec: 'training' },
            { name: 'Survival' },
            { name: 'Recon' },
            { name: 'Science' },
          ],
        },
      ],
    },
    { roll: 5, text: 'Exemplary service. DM+1 to a Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 6,
      text: 'Years of jumps. +1 Astrogation, Electronics, Navigation, Pilot (small craft), or Mechanic.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [
            { name: 'Astrogation' },
            { name: 'Electronics' },
            { name: 'Navigation' },
            { name: 'Pilot', spec: 'small craft' },
            { name: 'Mechanic' },
          ],
        },
      ],
    },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Alien intelligence. Electronics 8+ or Deception 8+. Success → Imperium Ally + DM+2 advancement. Fail → Mishap (no eject).',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Electronics 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Electronics' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'ally' }, { type: 'next_advancement_dm', dm: 2 }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'scout' }, ejectionPolicy: 'no_eject' }],
                },
              ],
            },
            {
              label: 'Deception 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Deception' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'ally' }, { type: 'next_advancement_dm', dm: 2 }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'scout' }, ejectionPolicy: 'no_eject' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 9,
      text: 'Disaster rescue. Medic 8+ or Engineer 8+. Success → Contact + DM+2 advancement. Fail → Enemy.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Medic 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Medic' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'contact' }, { type: 'next_advancement_dm', dm: 2 }],
                  onFailure: [{ type: 'gain_connection', connection: 'enemy' }],
                },
              ],
            },
            {
              label: 'Engineer 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Engineer' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'contact' }, { type: 'next_advancement_dm', dm: 2 }],
                  onFailure: [{ type: 'gain_connection', connection: 'enemy' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 10,
      text: 'Fringes of Charted Space. Survival 8+ or Pilot 8+. Success → alien Contact + +1 to a skill. Fail → Mishap (no eject).',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Survival 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Survival' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'contact' }, { type: 'gain_skill_choice', level: 1, excludeJoat: true }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'scout' }, ejectionPolicy: 'no_eject' }],
                },
              ],
            },
            {
              label: 'Pilot 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Pilot' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'contact' }, { type: 'gain_skill_choice', level: 1, excludeJoat: true }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'scout' }, ejectionPolicy: 'no_eject' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 11,
      text: 'Important courier. +1 Diplomat OR DM+4 to advancement.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Diplomat 1', effects: [{ type: 'gain_skill', skill: { name: 'Diplomat' }, level: 1 }] },
            { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    { roll: 12, text: 'Discovery of worth to the Imperium. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 20000 },
      { roll: 2, cash: 20000 },
      { roll: 3, cash: 30000 },
      { roll: 4, cash: 30000 },
      { roll: 5, cash: 50000 },
      { roll: 6, cash: 50000 },
      { roll: 7, cash: 50000 },
    ],
    benefits: [
      { roll: 1, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      { roll: 2, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 3, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 4, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 5, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 6, label: 'Scout Ship', effect: { type: 'gain_benefit', benefit: { type: 'scout_ship' } } },
      { roll: 7, label: 'Scout Ship', effect: { type: 'gain_benefit', benefit: { type: 'scout_ship' } } },
    ],
  },
};
