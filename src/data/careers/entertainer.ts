import type { Career } from '../../types';

export const entertainer: Career = {
  id: 'entertainer',
  name: 'Entertainer',
  flavour: 'Reporters, artists or celebrities — individuals involved with media.',
  qualification: {
    // The rulebook lists "DEX or INT 5+" — modeled as INT 5+; UI offers swap to DEX.
    check: { kind: 'char', char: 'INT', target: 5 },
    perPreviousCareer: -1,
  },
  assignments: [
    {
      id: 'artist',
      name: 'Artist',
      description: 'Writer, holographer, or other creative.',
      survival: { kind: 'char', char: 'SOC', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Art' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Gambler' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Profession' } } },
      ],
    },
    {
      id: 'journalist',
      name: 'Journalist',
      description: 'Reports on local or galactic events.',
      survival: { kind: 'char', char: 'EDU', target: 7 },
      advancement: { kind: 'char', char: 'INT', target: 5 },
      skillTable: [
        {
          roll: 1,
          effect: {
            type: 'choice',
            prompt: 'Art (holography or write)',
            options: [
              { label: 'Holography', effects: [{ type: 'gain_skill', skill: { name: 'Art', spec: 'holography' } }] },
              { label: 'Write', effects: [{ type: 'gain_skill', skill: { name: 'Art', spec: 'write' } }] },
            ],
          },
        },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
      ],
    },
    {
      id: 'performer',
      name: 'Performer',
      description: 'Actor, dancer, acrobat, professional athlete, or other public performer.',
      survival: { kind: 'char', char: 'INT', target: 5 },
      advancement: { kind: 'char', char: 'DEX', target: 7 },
      skillTable: [
        {
          roll: 1,
          effect: {
            type: 'choice',
            prompt: 'Art (performer or instrument)',
            options: [
              { label: 'Performer', effects: [{ type: 'gain_skill', skill: { name: 'Art', spec: 'performer' } }] },
              { label: 'Instrument', effects: [{ type: 'gain_skill', skill: { name: 'Art', spec: 'instrument' } }] },
            ],
          },
        },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
        { roll: 2, effect: { type: 'modify_char', char: 'INT', delta: 1 } },
        { roll: 3, effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Art' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Steward' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 10,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Broker' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
      ],
    },
  ],
  ranks: {
    artist: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Art' }, level: 1 } },
      { rank: 2 },
      { rank: 3, bonus: { type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 } },
      { rank: 4 },
      { rank: 5, title: 'Famous Artist', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { rank: 6 },
    ],
    journalist: [
      { rank: 0 },
      { rank: 1, title: 'Freelancer', bonus: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'comms' }, level: 1 } },
      { rank: 2, title: 'Staff Writer', bonus: { type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Correspondent', bonus: { type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 } },
      { rank: 5 },
      { rank: 6, title: 'Senior Correspondent', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
    ],
    performer: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'modify_char', char: 'DEX', delta: 1 } },
      { rank: 2 },
      { rank: 3, bonus: { type: 'modify_char', char: 'STR', delta: 1 } },
      { rank: 4 },
      { rank: 5, title: 'Famous Performer', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { rank: 6 },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    { roll: 2, text: 'Scandal.', effects: [{ type: 'note', text: 'You expose or are involved in a scandal.' }, { type: 'eject_career' }] },
    { roll: 3, text: 'Public opinion turns. SOC -1.', effects: [{ type: 'modify_char', char: 'SOC', delta: -1 }, { type: 'eject_career' }] },
    {
      roll: 4,
      text: 'Betrayed by a peer. Convert Contact/Ally to Rival/Enemy or gain new.',
      effects: [{ type: 'convert_connection', from: ['contact', 'ally'], to: ['rival', 'enemy'], orGainNew: true }, { type: 'eject_career' }],
    },
    {
      roll: 5,
      text: 'Stranded. Gain one of Survival 1, Pilot 1, Persuade 1, Streetwise 1.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Survival' }, { name: 'Pilot' }, { name: 'Persuade' }, { name: 'Streetwise' }],
        },
        { type: 'eject_career' },
      ],
    },
    { roll: 6, text: 'Censored — DM+2 to next career qualification.', effects: [{ type: 'next_qualification_dm', dm: 2 }, { type: 'eject_career' }] },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'entertainer' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Controversial event. Roll Art or Investigate 8+: success → +1 SOC; fail → -1 SOC.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Art 8+',
              effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Art' }, target: 8 }, onSuccess: [{ type: 'modify_char', char: 'SOC', delta: 1 }], onFailure: [{ type: 'modify_char', char: 'SOC', delta: -1 }] }],
            },
            {
              label: 'Investigate 8+',
              effects: [{ type: 'check', roll: { kind: 'skill', skill: { name: 'Investigate' }, target: 8 }, onSuccess: [{ type: 'modify_char', char: 'SOC', delta: 1 }], onFailure: [{ type: 'modify_char', char: 'SOC', delta: -1 }] }],
            },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Celebrity circles. +1 Carouse, Persuade, Steward, or a Contact.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Carouse 1', effects: [{ type: 'gain_skill', skill: { name: 'Carouse' }, level: 1 }] },
            { label: 'Persuade 1', effects: [{ type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 }] },
            { label: 'Steward 1', effects: [{ type: 'gain_skill', skill: { name: 'Steward' }, level: 1 }] },
            { label: 'Contact', effects: [{ type: 'gain_connection', connection: 'contact' }] },
          ],
        },
      ],
    },
    { roll: 5, text: 'Popular work. DM+1 to one Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    { roll: 6, text: 'Patron in the arts. DM+2 to next advancement, gain Ally.', effects: [{ type: 'next_advancement_dm', dm: 2 }, { type: 'gain_connection', connection: 'ally' }] },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Bring down a leader? Refuse → nothing. Accept → Enemy and roll Art or Persuade 8+; success → +1 to a skill you have; fail → +1 anyway and roll Mishap.',
      effects: [
        {
          type: 'choice',
          prompt: 'Bring down the leader?',
          options: [
            { label: 'Refuse', effects: [] },
            {
              label: 'Accept',
              effects: [
                { type: 'gain_connection', connection: 'enemy' },
                {
                  type: 'choice',
                  prompt: 'Roll Art or Persuade 8+',
                  options: [
                    {
                      label: 'Art 8+',
                      effects: [
                        {
                          type: 'check',
                          roll: { kind: 'skill', skill: { name: 'Art' }, target: 8 },
                          onSuccess: [{ type: 'gain_skill_choice', level: 1, existingOnly: true }],
                          onFailure: [{ type: 'gain_skill_choice', level: 1, existingOnly: true }, { type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'entertainer' } }],
                        },
                      ],
                    },
                    {
                      label: 'Persuade 8+',
                      effects: [
                        {
                          type: 'check',
                          roll: { kind: 'skill', skill: { name: 'Persuade' }, target: 8 },
                          onSuccess: [{ type: 'gain_skill_choice', level: 1, existingOnly: true }],
                          onFailure: [{ type: 'gain_skill_choice', level: 1, existingOnly: true }, { type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'entertainer' } }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { roll: 9, text: 'Tour of the sector. Gain D3 Contacts.', effects: [{ type: 'gain_connection', connection: 'contact', count: { dice: 'D3' } }] },
    {
      roll: 10,
      text: 'Stolen art investigation. +1 Streetwise, Investigate, Recon, or Stealth.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Streetwise' }, { name: 'Investigate' }, { name: 'Recon' }, { name: 'Stealth' }],
        },
      ],
    },
    { roll: 11, text: 'Strange and charmed life. Roll on Unusual Events.', effects: [{ type: 'roll_on_table', table: { kind: 'unusual_events' } }] },
    { roll: 12, text: 'Prestigious prize. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 0 },
      { roll: 2, cash: 0 },
      { roll: 3, cash: 10000 },
      { roll: 4, cash: 10000 },
      { roll: 5, cash: 40000 },
      { roll: 6, cash: 40000 },
      { roll: 7, cash: 80000 },
    ],
    benefits: [
      { roll: 1, label: 'Contact', effect: { type: 'gain_connection', connection: 'contact' } },
      { roll: 2, label: 'SOC +1', effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { roll: 3, label: 'Contact', effect: { type: 'gain_connection', connection: 'contact' } },
      { roll: 4, label: 'SOC +1', effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { roll: 5, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 6, label: 'Two Ship Shares', effect: { type: 'gain_ship_share', count: { fixed: 2 } } },
      {
        roll: 7,
        label: 'SOC +1 and EDU +1',
        effect: {
          type: 'choice',
          prompt: 'Apply both',
          options: [
            {
              label: 'Apply',
              effects: [
                { type: 'modify_char', char: 'SOC', delta: 1 },
                { type: 'modify_char', char: 'EDU', delta: 1 },
              ],
            },
          ],
        },
      },
    ],
  },
};
