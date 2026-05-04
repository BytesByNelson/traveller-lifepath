import type { Career } from '../../types';

export const prisoner: Career = {
  id: 'prisoner',
  name: 'Prisoner',
  flavour: 'A special career — you got sentenced. Cannot be entered voluntarily.',
  qualification: { check: { kind: 'char', char: 'END', target: 0 }, special: 'sentenced' },
  flags: { enforcedEntry: true, noPension: true },
  assignments: [
    {
      id: 'inmate',
      name: 'Inmate',
      description: 'Try to get through your time without trouble.',
      survival: { kind: 'char', char: 'END', target: 7 },
      advancement: { kind: 'char', char: 'STR', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Athletics', spec: 'strength' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
      ],
    },
    {
      id: 'thug',
      name: 'Thug',
      description: 'Part of a gang in prison.',
      survival: { kind: 'char', char: 'STR', target: 8 },
      advancement: { kind: 'char', char: 'END', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'blade' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Athletics', spec: 'strength' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Athletics', spec: 'strength' } } },
      ],
    },
    {
      id: 'fixer',
      name: 'Fixer',
      description: 'Can arrange anything for the right price.',
      survival: { kind: 'char', char: 'INT', target: 9 },
      advancement: { kind: 'char', char: 'END', target: 5 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Broker' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'modify_char', char: 'STR', delta: 1 } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' } } },
        { roll: 3, effect: { type: 'modify_char', char: 'END', delta: 1 } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
        { roll: 5, effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gambler' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Profession' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
      ],
    },
  ],
  ranks: {
    enlisted: [
      { rank: 0, bonus: { type: 'gain_skill', skill: { name: 'Melee', spec: 'unarmed' }, level: 1 } },
      { rank: 1 },
      { rank: 2, bonus: { type: 'gain_skill', skill: { name: 'Athletics' }, level: 1 } },
      { rank: 3 },
      { rank: 4, bonus: { type: 'gain_skill', skill: { name: 'Advocate' }, level: 1 } },
      { rank: 5 },
      { rank: 6, bonus: { type: 'modify_char', char: 'END', delta: 1 } },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }] },
    { roll: 2, text: 'Accused of assaulting a guard. Parole Threshold +2.', effects: [{ type: 'modify_parole_threshold', delta: 2 }] },
    {
      roll: 3,
      text: 'Prison gang persecution. Fight back (Melee unarmed 8+) or take it (lose all Benefit rolls from career).',
      effects: [
        {
          type: 'choice',
          prompt: 'Fight back or submit?',
          options: [
            {
              label: 'Fight back — Melee (unarmed) 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Melee', spec: 'unarmed' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'modify_parole_threshold', delta: 1 }],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }],
                },
              ],
            },
            { label: 'Submit', effects: [{ type: 'lose_benefit_rolls', count: 'all' }] },
          ],
        },
      ],
    },
    { roll: 4, text: 'Guard dislikes you. Gain Enemy; Parole Threshold +1.', effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'modify_parole_threshold', delta: 1 }] },
    { roll: 5, text: 'Disgraced — SOC -1.', effects: [{ type: 'modify_char', char: 'SOC', delta: -1 }] },
    { roll: 6, text: 'Injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'prisoner' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Escape opportunity. Stealth 10+ or Deception 10+. Success → leave. Fail → Parole Threshold +2.',
      effects: [
        {
          type: 'choice',
          prompt: 'Take the chance?',
          options: [
            {
              label: 'Stealth 10+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Stealth' }, target: 10 },
                  onSuccess: [{ type: 'eject_career' }],
                  onFailure: [{ type: 'modify_parole_threshold', delta: 2 }],
                },
              ],
            },
            {
              label: 'Deception 10+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Deception' }, target: 10 },
                  onSuccess: [{ type: 'eject_career' }],
                  onFailure: [{ type: 'modify_parole_threshold', delta: 2 }],
                },
              ],
            },
            { label: 'Stay', effects: [] },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Backbreaking labour. END 8+: success → Parole -1, +1 Athletics, Mechanic, or Melee (unarmed). Fail → Parole +1.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'END', target: 8 },
          onSuccess: [
            { type: 'modify_parole_threshold', delta: -1 },
            {
              type: 'gain_skill_choice',
              level: 1,
              from: [{ name: 'Athletics' }, { name: 'Mechanic' }, { name: 'Melee', spec: 'unarmed' }],
            },
          ],
          onFailure: [{ type: 'modify_parole_threshold', delta: 1 }],
        },
      ],
    },
    {
      roll: 5,
      text: 'Join a gang. Persuade or Melee 8+. Fail → Enemy. Success → Parole +1, DM+1 survival, +1 to a relevant skill.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Persuade 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Persuade' }, target: 8 },
                  onSuccess: [
                    { type: 'modify_parole_threshold', delta: 1 },
                    { type: 'next_survival_dm', dm: 1 },
                    { type: 'gain_skill_choice', level: 1, from: [{ name: 'Deception' }, { name: 'Persuade' }, { name: 'Melee', spec: 'unarmed' }, { name: 'Stealth' }] },
                  ],
                  onFailure: [{ type: 'gain_connection', connection: 'enemy' }],
                },
              ],
            },
            {
              label: 'Melee 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Melee' }, target: 8 },
                  onSuccess: [
                    { type: 'modify_parole_threshold', delta: 1 },
                    { type: 'next_survival_dm', dm: 1 },
                    { type: 'gain_skill_choice', level: 1, from: [{ name: 'Deception' }, { name: 'Persuade' }, { name: 'Melee', spec: 'unarmed' }, { name: 'Stealth' }] },
                  ],
                  onFailure: [{ type: 'gain_connection', connection: 'enemy' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 6,
      text: 'Vocational training. EDU 8+ → any skill except Jack-of-all-Trades.',
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
      roll: 7,
      text: 'Prison Event sub-roll (1D).',
      effects: [
        {
          type: 'choice',
          prompt: 'Prison event 1D',
          options: [
            { label: '1 — Riot', effects: [{ type: 'note', text: '1D — 1-2 injured (Injury), 5-6 extra Benefit roll.' }] },
            { label: '2 — New Contact', effects: [{ type: 'gain_connection', connection: 'contact' }] },
            { label: '3 — New Rival', effects: [{ type: 'gain_connection', connection: 'rival' }] },
            { label: '4 — Transferred', effects: [{ type: 'reroll_parole_threshold' }] },
            { label: '5 — Good Behaviour', effects: [{ type: 'modify_parole_threshold', delta: -2 }] },
            {
              label: '6 — Attacked',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Melee', spec: 'unarmed' }, target: 8 },
                  onSuccess: [],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }],
                },
              ],
            },
          ],
        },
      ],
    },
    { roll: 8, text: 'Parole hearing. Parole -1.', effects: [{ type: 'modify_parole_threshold', delta: -1 }] },
    {
      roll: 9,
      text: 'Hire a lawyer. Cost Cr1000 × Advocate level squared. Roll 2D + Advocate; 8+ → Parole -1D.',
      effects: [{ type: 'note', text: 'Manual: pick lawyer skill, pay cost, roll 2D + skill 8+ → Parole -1D.' }],
    },
    {
      roll: 10,
      text: 'Special duty. +1 Admin, Advocate, Electronics (computers), or Steward.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Admin' }, { name: 'Advocate' }, { name: 'Electronics', spec: 'computers' }, { name: 'Steward' }],
        },
      ],
    },
    { roll: 11, text: 'Warden\'s interest. Parole -2.', effects: [{ type: 'modify_parole_threshold', delta: -2 }] },
    {
      roll: 12,
      text: 'Heroism. 2D: 7- → Injury; 8+ → Ally and Parole -2.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'INT', target: 8 },
          onSuccess: [{ type: 'gain_connection', connection: 'ally' }, { type: 'modify_parole_threshold', delta: -2 }],
          onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }],
        },
      ],
    },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 0 },
      { roll: 2, cash: 0 },
      { roll: 3, cash: 100 },
      { roll: 4, cash: 200 },
      { roll: 5, cash: 500 },
      { roll: 6, cash: 1000 },
      { roll: 7, cash: 2500 },
    ],
    benefits: [
      { roll: 1, label: 'Contact', effect: { type: 'gain_connection', connection: 'contact' } },
      { roll: 2, label: 'Blade', effect: { type: 'gain_benefit', benefit: { type: 'blade', crLimit: 1000, tlLimit: 12 } } },
      {
        roll: 3,
        label: 'Deception, Persuade, or Stealth',
        effect: {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Deception' }, { name: 'Persuade' }, { name: 'Stealth' }],
        },
      },
      { roll: 4, label: 'Ally', effect: { type: 'gain_connection', connection: 'ally' } },
      {
        roll: 5,
        label: 'Melee, Recon, or Streetwise',
        effect: {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Melee' }, { name: 'Recon' }, { name: 'Streetwise' }],
        },
      },
      {
        roll: 6,
        label: 'STR +1 or END +1',
        effect: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'STR +1', effects: [{ type: 'modify_char', char: 'STR', delta: 1 }] },
            { label: 'END +1', effects: [{ type: 'modify_char', char: 'END', delta: 1 }] },
          ],
        },
      },
      {
        roll: 7,
        label: 'Deception, Persuade, and Stealth',
        effect: {
          type: 'choice',
          prompt: 'Apply all three',
          options: [
            {
              label: 'Apply',
              effects: [
                { type: 'gain_skill', skill: { name: 'Deception' }, level: 1 },
                { type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 },
                { type: 'gain_skill', skill: { name: 'Stealth' }, level: 1 },
              ],
            },
          ],
        },
      },
    ],
  },
};
