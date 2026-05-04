import type { Career } from '../../types';

export const marine: Career = {
  id: 'marine',
  name: 'Marine',
  flavour: 'Members of the armed fighting forces carried aboard starships — boarding actions and planetary assaults.',
  qualification: {
    check: { kind: 'char', char: 'END', target: 6 },
    perPreviousCareer: -1,
    ageDM: { atLeastAge: 30, dm: -2 },
  },
  commission: { check: { kind: 'char', char: 'SOC', target: 8 }, socRelaxAtLeast: 9, perTermAfterFirst: -1 },
  flags: { military: true },
  assignments: [
    {
      id: 'support',
      name: 'Support',
      description: 'Quartermaster, engineer, or battlefield medic in the marines.',
      survival: { kind: 'char', char: 'END', target: 5 },
      advancement: { kind: 'char', char: 'EDU', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        {
          roll: 3,
          effect: {
            type: 'choice',
            prompt: 'Drive or Flyer',
            options: [
              { label: 'Drive', effects: [{ type: 'gain_skill', skill: { name: 'Drive' } }] },
              { label: 'Flyer', effects: [{ type: 'gain_skill', skill: { name: 'Flyer' } }] },
            ],
          },
        },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Heavy Weapons' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
      ],
    },
    {
      id: 'star_marine',
      name: 'Star Marine',
      description: 'Trained to fight boarding actions and capture enemy vessels.',
      survival: { kind: 'char', char: 'END', target: 6 },
      advancement: { kind: 'char', char: 'EDU', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
      ],
    },
    {
      id: 'ground_assault',
      name: 'Ground Assault',
      description: 'Kicked out of a spacecraft in high orbit and told to capture that planet.',
      survival: { kind: 'char', char: 'END', target: 7 },
      advancement: { kind: 'char', char: 'EDU', target: 5 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Heavy Weapons' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'military' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
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
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Tactics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Heavy Weapons' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Explosives' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Navigation' } } },
      ],
    },
    {
      id: 'officer',
      commissionedOnly: true,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Tactics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
      ],
    },
  ],
  ranks: {
    enlisted: [
      {
        rank: 0,
        title: 'Marine',
        bonus: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Gun Combat (any) 1', effects: [{ type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 }] },
            { label: 'Melee (blade) 1', effects: [{ type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' }, level: 1 }] },
          ],
        },
      },
      { rank: 1, title: 'Lance Corporal', bonus: { type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 } },
      { rank: 2, title: 'Corporal' },
      { rank: 3, title: 'Lance Sergeant', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 4, title: 'Sergeant' },
      { rank: 5, title: 'Gunnery Sergeant', bonus: { type: 'modify_char', char: 'END', delta: 1 } },
      { rank: 6, title: 'Sergeant Major' },
    ],
    officer: [
      { rank: 1, title: 'Lieutenant', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 2, title: 'Captain' },
      { rank: 3, title: 'Force Commander', bonus: { type: 'gain_skill', skill: { name: 'Tactics' }, level: 1 } },
      { rank: 4, title: 'Lieutenant Colonel' },
      { rank: 5, title: 'Colonel', bonus: { type: 'raise_char_to_or_bump', char: 'SOC', minimum: 10 } },
      { rank: 6, title: 'Brigadier' },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    {
      roll: 2,
      text: 'Captured by enemy. Discharged early. Gain jailer as Enemy. STR -1, DEX -1.',
      effects: [
        { type: 'gain_connection', connection: 'enemy' },
        { type: 'modify_char', char: 'STR', delta: -1 },
        { type: 'modify_char', char: 'DEX', delta: -1 },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 3,
      text: 'Stranded behind enemy lines. +1 Stealth or Survival. Ejected.',
      effects: [
        { type: 'gain_skill_choice', level: 1, from: [{ name: 'Stealth' }, { name: 'Survival' }] },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'Black ops mission against your conscience. Refuse → ejected. Accept → stay, gain lone survivor as Enemy.',
      effects: [
        {
          type: 'choice',
          prompt: 'Refuse or accept?',
          options: [
            { label: 'Refuse', effects: [{ type: 'eject_career' }] },
            { label: 'Accept', effects: [{ type: 'gain_connection', connection: 'enemy' }] },
          ],
        },
      ],
    },
    { roll: 5, text: 'Quarrel with officer. Gain Rival; driven out.', effects: [{ type: 'gain_connection', connection: 'rival' }, { type: 'eject_career' }] },
    { roll: 6, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'marine' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Trapped behind enemy lines. +1 Survival, Stealth, Deception, or Streetwise.',
      effects: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Survival' }, { name: 'Stealth' }, { name: 'Deception' }, { name: 'Streetwise' }] }],
    },
    {
      roll: 4,
      text: 'Space station security. +1 Vacc Suit or Athletics (dexterity).',
      effects: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Vacc Suit' }, { name: 'Athletics', spec: 'dexterity' }] }],
    },
    {
      roll: 5,
      text: 'Specialist training. EDU 8+ → any skill at level 1.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'EDU', target: 8 },
          onSuccess: [{ type: 'gain_skill_choice', level: 1, excludeJoat: true }],
          onFailure: [],
        },
      ],
    },
    {
      roll: 6,
      text: 'Assault on enemy fortress. Melee or Gun Combat 8+ → +1 Tactics (military) or Leadership; fail → -1 to a physical char.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Melee 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Melee' }, target: 8 },
                  onSuccess: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Tactics', spec: 'military' }, { name: 'Leadership' }] }],
                  onFailure: [{ type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 }],
                },
              ],
            },
            {
              label: 'Gun Combat 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Gun Combat' }, target: 8 },
                  onSuccess: [{ type: 'gain_skill_choice', level: 1, from: [{ name: 'Tactics', spec: 'military' }, { name: 'Leadership' }] }],
                  onFailure: [{ type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 }],
                },
              ],
            },
          ],
        },
      ],
    },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Planetary assault and occupation. +1 Recon, Gun Combat, Leadership, or Electronics (comms).',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Recon' }, { name: 'Gun Combat' }, { name: 'Leadership' }, { name: 'Electronics', spec: 'comms' }],
        },
      ],
    },
    {
      roll: 9,
      text: 'Bad CO. Report (DM+2 advancement, gain Enemy) or stay silent (gain Ally).',
      effects: [
        {
          type: 'choice',
          prompt: 'Report or protect?',
          options: [
            { label: 'Report', effects: [{ type: 'next_advancement_dm', dm: 2 }, { type: 'gain_connection', connection: 'enemy' }] },
            { label: 'Protect', effects: [{ type: 'gain_connection', connection: 'ally' }] },
          ],
        },
      ],
    },
    { roll: 10, text: 'Black ops. DM+2 to next advancement.', effects: [{ type: 'next_advancement_dm', dm: 2 }] },
    {
      roll: 11,
      text: 'CO interest. +1 Tactics OR DM+4 to advancement.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Tactics 1', effects: [{ type: 'gain_skill', skill: { name: 'Tactics' }, level: 1 }] },
            { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    {
      roll: 12,
      text: 'Heroism. Auto-promote or auto-commission.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Auto-promote', effects: [{ type: 'auto_promote' }] },
            { label: 'Auto-commission', effects: [{ type: 'auto_commission' }] },
          ],
        },
      ],
    },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 2000 },
      { roll: 2, cash: 5000 },
      { roll: 3, cash: 5000 },
      { roll: 4, cash: 10000 },
      { roll: 5, cash: 20000 },
      { roll: 6, cash: 30000 },
      { roll: 7, cash: 40000 },
    ],
    benefits: [
      { roll: 1, label: 'Armour', effect: { type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } } },
      { roll: 2, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 3, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 4, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 5, label: 'TAS Membership', effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } } },
      {
        roll: 6,
        label: 'Armour or END +1',
        effect: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Armour', effects: [{ type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } }] },
            { label: 'END +1', effects: [{ type: 'modify_char', char: 'END', delta: 1 }] },
          ],
        },
      },
      {
        roll: 7,
        label: 'SOC +2',
        effect: {
          type: 'choice',
          prompt: 'Apply',
          options: [
            {
              label: 'Apply',
              effects: [{ type: 'modify_char', char: 'SOC', delta: 2 }],
            },
          ],
        },
      },
    ],
  },
};
