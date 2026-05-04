import type { Career } from '../../types';

export const navy: Career = {
  id: 'navy',
  name: 'Navy',
  flavour: 'Members of the interstellar navy that patrols space between the stars.',
  qualification: {
    check: { kind: 'char', char: 'INT', target: 6 },
    perPreviousCareer: -1,
    ageDM: { atLeastAge: 34, dm: -2 },
  },
  commission: { check: { kind: 'char', char: 'SOC', target: 8 }, socRelaxAtLeast: 9, perTermAfterFirst: -1 },
  flags: { military: true },
  assignments: [
    {
      id: 'line_crew',
      name: 'Line/Crew',
      description: 'General crewman or officer on a ship of the line.',
      survival: { kind: 'char', char: 'INT', target: 5 },
      advancement: { kind: 'char', char: 'EDU', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
      ],
    },
    {
      id: 'engineer_gunner',
      name: 'Engineer/Gunner',
      description: 'Specialist technician on a starship.',
      survival: { kind: 'char', char: 'INT', target: 6 },
      advancement: { kind: 'char', char: 'EDU', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
      ],
    },
    {
      id: 'flight',
      name: 'Flight',
      description: 'Pilot of a shuttle, fighter, or other light craft.',
      survival: { kind: 'char', char: 'DEX', target: 7 },
      advancement: { kind: 'char', char: 'EDU', target: 5 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Pilot', spec: 'small craft' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
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
        { roll: 6, effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
      ],
    },
    {
      id: 'officer',
      commissionedOnly: true,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' } } },
      ],
    },
  ],
  ranks: {
    enlisted: [
      { rank: 0, title: 'Crewman' },
      { rank: 1, title: 'Able Spacehand', bonus: { type: 'gain_skill', skill: { name: 'Mechanic' }, level: 1 } },
      { rank: 2, title: 'Petty Officer, 3rd class', bonus: { type: 'gain_skill', skill: { name: 'Vacc Suit' }, level: 1 } },
      { rank: 3, title: 'Petty Officer, 2nd class' },
      { rank: 4, title: 'Petty Officer, 1st class', bonus: { type: 'modify_char', char: 'END', delta: 1 } },
      { rank: 5, title: 'Chief Petty Officer' },
      { rank: 6, title: 'Master Chief' },
    ],
    officer: [
      { rank: 1, title: 'Ensign', bonus: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' }, level: 1 } },
      { rank: 2, title: 'Sublieutenant', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 3, title: 'Lieutenant' },
      { rank: 4, title: 'Commander', bonus: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' }, level: 1 } },
      { rank: 5, title: 'Captain', bonus: { type: 'raise_char_to_or_bump', char: 'SOC', minimum: 10 } },
      { rank: 6, title: 'Admiral', bonus: { type: 'raise_char_to_or_bump', char: 'SOC', minimum: 12 } },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    {
      roll: 2,
      text: 'Frozen watch — bad revival. Reduce STR, DEX, or END by 1. Not ejected.',
      effects: [{ type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 }],
    },
    {
      roll: 3,
      text: 'Battle hinges on you. 8+ on a branch-relevant skill: success → keep Benefit roll, leave career honourably; failure → court-martialled.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'INT', target: 8 },
          onSuccess: [{ type: 'note', text: 'Honourably discharged; keep this term\'s Benefit roll.' }],
          onFailure: [{ type: 'note', text: 'Court-martialled and discharged.' }],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'Blamed for fatal accident. If responsible: extra free skill roll then ejected. If not: gain Enemy, keep Benefit roll, ejected.',
      effects: [
        {
          type: 'choice',
          prompt: 'Were you responsible?',
          options: [
            { label: 'Yes', effects: [{ type: 'extra_skill_roll', count: 1, tables: 'any' }] },
            { label: 'No', effects: [{ type: 'gain_connection', connection: 'enemy' }] },
          ],
        },
        { type: 'eject_career' },
      ],
    },
    { roll: 5, text: 'Quarrel with officer/crewman. Gain Rival.', effects: [{ type: 'gain_connection', connection: 'rival' }, { type: 'eject_career' }] },
    { roll: 6, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'navy' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Gambling circle. +1 Gambler or Deception. Optional: Gambler 8+ → extra Benefit roll; fail → lose one.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Gambler' }, { name: 'Deception' }],
        },
        {
          type: 'choice',
          prompt: 'Try your luck?',
          options: [
            {
              label: 'Yes — Gambler 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Gambler' }, target: 8 },
                  onSuccess: [{ type: 'gain_benefit_rolls', count: 1 }],
                  onFailure: [{ type: 'lose_benefit_rolls', count: 1 }],
                },
              ],
            },
            { label: 'No', effects: [] },
          ],
        },
      ],
    },
    { roll: 4, text: 'Special assignment. DM+1 to one Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 5,
      text: 'Specialist training. EDU 8+ → +1 to a skill you have.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'EDU', target: 8 },
          onSuccess: [{ type: 'gain_skill_choice', existingOnly: true }],
          onFailure: [],
        },
      ],
    },
    {
      roll: 6,
      text: 'Notable engagement. +1 Electronics, Engineer, Gunner, or Pilot.',
      effects: [
        { type: 'gain_skill_choice', level: 1, from: [{ name: 'Electronics' }, { name: 'Engineer' }, { name: 'Gunner' }, { name: 'Pilot' }] },
      ],
    },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Diplomatic mission. +1 Recon, Diplomat, Steward, or a Contact.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Recon 1', effects: [{ type: 'gain_skill', skill: { name: 'Recon' }, level: 1 }] },
            { label: 'Diplomat 1', effects: [{ type: 'gain_skill', skill: { name: 'Diplomat' }, level: 1 }] },
            { label: 'Steward 1', effects: [{ type: 'gain_skill', skill: { name: 'Steward' }, level: 1 }] },
            { label: 'Contact', effects: [{ type: 'gain_connection', connection: 'contact' }] },
          ],
        },
      ],
    },
    { roll: 9, text: 'Foil mutiny. Gain Enemy; DM+2 to next advancement.', effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'next_advancement_dm', dm: 2 }] },
    {
      roll: 10,
      text: 'Abuse position? Yes → extra Benefit roll. No → DM+2 advancement.',
      effects: [
        {
          type: 'choice',
          prompt: 'Abuse position?',
          options: [
            { label: 'Yes', effects: [{ type: 'gain_benefit_rolls', count: 1 }] },
            { label: 'No', effects: [{ type: 'next_advancement_dm', dm: 2 }] },
          ],
        },
      ],
    },
    {
      roll: 11,
      text: 'CO interest. +1 Tactics (naval) OR DM+4 to advancement.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Tactics (naval) 1', effects: [{ type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' }, level: 1 }] },
            { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    {
      roll: 12,
      text: 'Heroism — automatically pass next promotion or commission roll.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Auto-pass next promotion', effects: [{ type: 'auto_promote' }] },
            { label: 'Auto-pass next commission', effects: [{ type: 'auto_commission' }] },
          ],
        },
      ],
    },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 1000 },
      { roll: 2, cash: 5000 },
      { roll: 3, cash: 5000 },
      { roll: 4, cash: 10000 },
      { roll: 5, cash: 20000 },
      { roll: 6, cash: 50000 },
      { roll: 7, cash: 50000 },
    ],
    benefits: [
      {
        roll: 1,
        label: 'Personal Vehicle or Ship Share',
        effect: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Personal Vehicle', effects: [{ type: 'gain_benefit', benefit: { type: 'personal_vehicle' } }] },
            { label: 'Ship Share', effects: [{ type: 'gain_ship_share', count: { fixed: 1 } }] },
          ],
        },
      },
      { roll: 2, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      {
        roll: 3,
        label: 'EDU +1 or two Ship Shares',
        effect: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'EDU +1', effects: [{ type: 'modify_char', char: 'EDU', delta: 1 }] },
            { label: 'Two Ship Shares', effects: [{ type: 'gain_ship_share', count: { fixed: 2 } }] },
          ],
        },
      },
      { roll: 4, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 5, label: 'TAS Membership', effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } } },
      {
        roll: 6,
        label: 'Ship\'s Boat or two Ship Shares',
        effect: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Ship\'s Boat', effects: [{ type: 'gain_benefit', benefit: { type: 'ships_boat' } }] },
            { label: 'Two Ship Shares', effects: [{ type: 'gain_ship_share', count: { fixed: 2 } }] },
          ],
        },
      },
      { roll: 7, label: 'SOC +2', effect: { type: 'modify_char', char: 'SOC', delta: 2 } },
    ],
  },
};
