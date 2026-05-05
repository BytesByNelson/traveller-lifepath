import type { Career } from '../../types';

export const scholar: Career = {
  id: 'scholar',
  name: 'Scholar',
  flavour: 'Researchers, scientists, and physicians.',
  qualification: { check: { kind: 'char', char: 'INT', target: 6 }, perPreviousCareer: -1 },
  assignments: [
    {
      id: 'field_researcher',
      name: 'Field Researcher',
      description: 'Explorer or field researcher.',
      survival: { kind: 'char', char: 'END', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Navigation' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
      ],
    },
    {
      id: 'scientist',
      name: 'Scientist',
      description: 'Researcher in a corporation, institution, or orbiting laboratory.',
      survival: { kind: 'char', char: 'EDU', target: 4 },
      advancement: { kind: 'char', char: 'INT', target: 8 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
      ],
    },
    {
      id: 'physician',
      name: 'Physician',
      description: 'Doctor, healer, or medical researcher.',
      survival: { kind: 'char', char: 'EDU', target: 4 },
      advancement: { kind: 'char', char: 'EDU', target: 8 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'modify_char', char: 'INT', delta: 1 } },
        { roll: 2, effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
        { roll: 3, effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
        { roll: 4, effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
        { roll: 5, effect: { type: 'modify_char', char: 'END', delta: 1 } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        {
          roll: 1,
          effect: {
            type: 'choice',
            prompt: 'Drive or Flyer',
            options: [
              { label: 'Drive', effects: [{ type: 'gain_skill', skill: { name: 'Drive' } }] },
              { label: 'Flyer', effects: [{ type: 'gain_skill', skill: { name: 'Flyer' } }] },
            ],
          },
        },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 10,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Art' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
      ],
    },
  ],
  ranks: {
    field_researcher: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Science' }, level: 1 } },
      { rank: 2, bonus: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' }, level: 1 } },
      { rank: 3, bonus: { type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 } },
      { rank: 4 },
      { rank: 5, bonus: { type: 'gain_skill', skill: { name: 'Science' }, level: 2 } },
      { rank: 6 },
    ],
    scientist: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Science' }, level: 1 } },
      { rank: 2, bonus: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' }, level: 1 } },
      { rank: 3, bonus: { type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 } },
      { rank: 4 },
      { rank: 5, bonus: { type: 'gain_skill', skill: { name: 'Science' }, level: 2 } },
      { rank: 6 },
    ],
    physician: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Medic' }, level: 1 } },
      { rank: 2 },
      { rank: 3, bonus: { type: 'gain_skill', skill: { name: 'Science' }, level: 1 } },
      { rank: 4 },
      { rank: 5, bonus: { type: 'gain_skill', skill: { name: 'Science' }, level: 2 } },
      { rank: 6 },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    {
      roll: 2,
      text: 'Disaster blamed on you. Roll Injury twice, take higher; gain Rival.',
      effects: [
        { type: 'roll_on_table', table: { kind: 'injury' } },
        { type: 'gain_connection', connection: 'rival' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 3,
      text: 'Government interferes. Continue openly (+1 Science, gain Enemy) or secretly (+1 Science, SOC -2). Not ejected.',
      effects: [
        {
          type: 'choice',
          prompt: 'Continue openly or secretly?',
          options: [
            {
              label: 'Openly',
              effects: [
                { type: 'gain_skill', skill: { name: 'Science' }, level: 1 },
                { type: 'gain_connection', connection: 'enemy' },
              ],
            },
            {
              label: 'Secretly',
              effects: [
                { type: 'gain_skill', skill: { name: 'Science' }, level: 1 },
                { type: 'modify_char', char: 'SOC', delta: -2 },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Stranded in wilderness. +1 Survival or Athletics (dexterity or endurance). Job is gone.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Survival' }, { name: 'Athletics', spec: 'dexterity' }, { name: 'Athletics', spec: 'endurance' }],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 5,
      text: 'Work sabotaged. Salvage and leave (keep Benefit roll), or restart (lose Benefit rolls, stay).',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            // Mishap auto-deducted 1 benefit roll; "keep Benefit roll" path offsets that.
            { label: 'Salvage and leave', effects: [{ type: 'gain_benefit_rolls', count: 1 }, { type: 'eject_career' }] },
            { label: 'Restart', effects: [{ type: 'lose_benefit_rolls', count: 'all' }] },
          ],
        },
      ],
    },
    {
      roll: 6,
      text: 'Rival researcher steals your work. Gain Rival; not ejected.',
      effects: [{ type: 'gain_connection', connection: 'rival' }],
    },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'scholar' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Research against your conscience. Accept → extra Benefit roll, +1 to two Science specialties, D3 Enemies.',
      effects: [
        {
          type: 'choice',
          prompt: 'Accept the work?',
          options: [
            {
              label: 'Yes',
              effects: [
                { type: 'gain_benefit_rolls', count: 1 },
                { type: 'gain_skill', skill: { name: 'Science' }, level: 1 },
                { type: 'gain_skill', skill: { name: 'Science' }, level: 1 },
                { type: 'gain_connection', connection: 'enemy', count: { dice: 'D3' } },
              ],
            },
            { label: 'No', effects: [] },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Secret project. +1 Medic, Science, Engineer, Electronics, or Investigate.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Medic' }, { name: 'Science' }, { name: 'Engineer' }, { name: 'Electronics' }, { name: 'Investigate' }],
        },
      ],
    },
    { roll: 5, text: 'Prestigious prize. DM+1 to a Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 6,
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
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Cheat? Yes → Deception or Admin 8+: success → DM+2 to Benefit roll, +1 a skill, gain Enemy. Fail → gain Enemy and lose a Benefit roll.',
      effects: [
        {
          type: 'choice',
          prompt: 'Cheat?',
          options: [
            { label: 'No', effects: [] },
            {
              label: 'Yes — Deception 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Deception' }, target: 8 },
                  onSuccess: [
                    { type: 'next_benefit_roll_dm', dm: 2 },
                    { type: 'gain_skill_choice', level: 1, excludeJoat: true },
                    { type: 'gain_connection', connection: 'enemy' },
                  ],
                  onFailure: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'lose_benefit_rolls', count: 1 }],
                },
              ],
            },
            {
              label: 'Yes — Admin 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Admin' }, target: 8 },
                  onSuccess: [
                    { type: 'next_benefit_roll_dm', dm: 2 },
                    { type: 'gain_skill_choice', level: 1, excludeJoat: true },
                    { type: 'gain_connection', connection: 'enemy' },
                  ],
                  onFailure: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'lose_benefit_rolls', count: 1 }],
                },
              ],
            },
          ],
        },
      ],
    },
    { roll: 9, text: 'Breakthrough. DM+2 to next advancement.', effects: [{ type: 'next_advancement_dm', dm: 2 }] },
    {
      roll: 10,
      text: 'Bureaucratic morass. +1 Admin, Advocate, Persuade, or Diplomat.',
      effects: [
        { type: 'gain_skill_choice', level: 1, from: [{ name: 'Admin' }, { name: 'Advocate' }, { name: 'Persuade' }, { name: 'Diplomat' }] },
      ],
    },
    {
      roll: 11,
      text: 'Eccentric mentor. Gain Ally; +1 Science OR DM+4 to advancement.',
      effects: [
        { type: 'gain_connection', connection: 'ally' },
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Science 1', effects: [{ type: 'gain_skill', skill: { name: 'Science' }, level: 1 }] },
            { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    { roll: 12, text: 'Major breakthrough. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 5000 },
      { roll: 2, cash: 10000 },
      { roll: 3, cash: 20000 },
      { roll: 4, cash: 30000 },
      { roll: 5, cash: 40000 },
      { roll: 6, cash: 60000 },
      { roll: 7, cash: 100000 },
    ],
    benefits: [
      { roll: 1, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 2, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 3, label: 'Two Ship Shares', effect: { type: 'gain_ship_share', count: { fixed: 2 } } },
      { roll: 4, label: 'SOC +1', effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
      {
        roll: 5,
        label: 'Scientific Equipment',
        effect: { type: 'gain_benefit', benefit: { type: 'scientific_equipment', crLimit: 2000, tlLimit: 12 } },
      },
      { roll: 6, label: 'Lab Ship', effect: { type: 'gain_benefit', benefit: { type: 'lab_ship' } } },
      { roll: 7, label: 'Lab Ship', effect: { type: 'gain_benefit', benefit: { type: 'lab_ship' } } },
    ],
  },
};
