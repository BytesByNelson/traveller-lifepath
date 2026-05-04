import type { Career } from '../../types';

/**
 * Psion career — only enterable after acquiring PSI > 0 via institute testing
 * (typically triggered by Life Events 12.1 or pre-career events 2). The Psion
 * uses specialist skill tables for basic training rather than service skills.
 */
export const psion: Career = {
  id: 'psion',
  name: 'Psion',
  flavour: 'Travellers who choose to focus on their psionic potential instead of more conventional lifestyles.',
  qualification: { check: { kind: 'char', char: 'INT', target: 6 }, perPreviousCareer: -1 },
  flags: { basicTrainingFromAssignment: true, noPension: true },
  assignments: [
    {
      id: 'wild_talent',
      name: 'Wild Talent',
      description: 'You developed your powers without formal training.',
      survival: { kind: 'char', char: 'SOC', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 8 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Telepathy' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Telekinesis' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        {
          roll: 6,
          effect: {
            type: 'choice',
            prompt: 'Melee or Gun Combat',
            options: [
              { label: 'Melee', effects: [{ type: 'gain_skill', skill: { name: 'Melee' } }] },
              { label: 'Gun Combat', effects: [{ type: 'gain_skill', skill: { name: 'Gun Combat' } }] },
            ],
          },
        },
      ],
    },
    {
      id: 'adept',
      name: 'Adept',
      description: 'You are a scholar of the psionic disciplines.',
      survival: { kind: 'char', char: 'EDU', target: 4 },
      advancement: { kind: 'char', char: 'EDU', target: 8 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Telepathy' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Clairvoyance' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Awareness' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
      ],
    },
    {
      id: 'psi_warrior',
      name: 'Psi-Warrior',
      description: 'You combine combat training with psionic warfare.',
      survival: { kind: 'char', char: 'END', target: 6 },
      advancement: { kind: 'char', char: 'END', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Telepathy' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Awareness' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Teleportation' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
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
        { roll: 3, effect: { type: 'modify_char', char: 'STR', delta: 1 } },
        { roll: 4, effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
        { roll: 5, effect: { type: 'modify_char', char: 'END', delta: 1 } },
        { roll: 6, effect: { type: 'modify_psi', delta: 1 } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Telepathy' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Clairvoyance' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Telekinesis' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Awareness' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Teleportation' } } },
        {
          roll: 6,
          effect: {
            type: 'choice',
            prompt: 'Any Talent',
            options: [
              { label: 'Telepathy', effects: [{ type: 'gain_skill', skill: { name: 'Telepathy' } }] },
              { label: 'Clairvoyance', effects: [{ type: 'gain_skill', skill: { name: 'Clairvoyance' } }] },
              { label: 'Telekinesis', effects: [{ type: 'gain_skill', skill: { name: 'Telekinesis' } }] },
              { label: 'Awareness', effects: [{ type: 'gain_skill', skill: { name: 'Awareness' } }] },
              { label: 'Teleportation', effects: [{ type: 'gain_skill', skill: { name: 'Teleportation' } }] },
            ],
          },
        },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Art' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Science' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
      ],
    },
  ],
  ranks: {
    wild_talent: [
      { rank: 0 },
      {
        rank: 1,
        title: 'Survivor',
        bonus: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Survival 1', effects: [{ type: 'gain_skill', skill: { name: 'Survival' }, level: 1 }] },
            { label: 'Streetwise 1', effects: [{ type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 }] },
          ],
        },
      },
      { rank: 2 },
      { rank: 3, title: 'Witch', bonus: { type: 'gain_skill', skill: { name: 'Deception' }, level: 1 } },
      { rank: 4 },
      { rank: 5 },
      { rank: 6 },
    ],
    adept: [
      { rank: 0 },
      { rank: 1, title: 'Initiate', bonus: { type: 'gain_skill', skill: { name: 'Science', spec: 'psionicology' }, level: 1 } },
      { rank: 2 },
      {
        rank: 3,
        title: 'Acolyte',
        bonus: {
          type: 'choice',
          prompt: 'Pick a talent skill at level 1',
          options: [
            { label: 'Telepathy', effects: [{ type: 'gain_skill', skill: { name: 'Telepathy' }, level: 1 }] },
            { label: 'Clairvoyance', effects: [{ type: 'gain_skill', skill: { name: 'Clairvoyance' }, level: 1 }] },
            { label: 'Telekinesis', effects: [{ type: 'gain_skill', skill: { name: 'Telekinesis' }, level: 1 }] },
            { label: 'Awareness', effects: [{ type: 'gain_skill', skill: { name: 'Awareness' }, level: 1 }] },
            { label: 'Teleportation', effects: [{ type: 'gain_skill', skill: { name: 'Teleportation' }, level: 1 }] },
          ],
        },
      },
      { rank: 4 },
      { rank: 5 },
      {
        rank: 6,
        title: 'Master',
        bonus: {
          type: 'choice',
          prompt: 'Pick a talent skill at level 1',
          options: [
            { label: 'Telepathy', effects: [{ type: 'gain_skill', skill: { name: 'Telepathy' }, level: 1 }] },
            { label: 'Clairvoyance', effects: [{ type: 'gain_skill', skill: { name: 'Clairvoyance' }, level: 1 }] },
            { label: 'Telekinesis', effects: [{ type: 'gain_skill', skill: { name: 'Telekinesis' }, level: 1 }] },
            { label: 'Awareness', effects: [{ type: 'gain_skill', skill: { name: 'Awareness' }, level: 1 }] },
            { label: 'Teleportation', effects: [{ type: 'gain_skill', skill: { name: 'Teleportation' }, level: 1 }] },
          ],
        },
      },
    ],
    psi_warrior: [
      { rank: 0, title: 'Psi-Soldier' },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 } },
      { rank: 2, title: 'Knight', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 3 },
      { rank: 4 },
      { rank: 5, title: 'Master of Wills', bonus: { type: 'gain_skill', skill: { name: 'Tactics' }, level: 1 } },
      { rank: 6 },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    {
      roll: 2,
      text: 'You telepathically contact something dangerous. Lose one PSI and suffer persistent terrifying nightmares.',
      effects: [
        { type: 'modify_psi', delta: -1 },
        { type: 'note', text: 'Persistent nightmares.' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 3,
      text: 'Anti-psi cult attacks. 1D: 1-2 Injury. 3-4 -1 SOC. 5-6 nothing — but you must leave.',
      effects: [
        { type: 'note', text: 'Roll 1D and resolve: 1-2 Injury, 3-4 -1 SOC, 5-6 no extra effect.' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'Asked to use your powers unethically. Accept (gain Enemy, stay) or refuse (leave career).',
      effects: [
        {
          type: 'choice',
          prompt: 'Accept or refuse?',
          options: [
            { label: 'Accept', effects: [{ type: 'gain_connection', connection: 'enemy' }] },
            { label: 'Refuse', effects: [{ type: 'eject_career' }] },
          ],
        },
      ],
    },
    {
      roll: 5,
      text: 'Experimented on by a corporation or government. You escape but must leave the career.',
      effects: [{ type: 'eject_career' }],
    },
    {
      roll: 6,
      text: 'A former friend turns and betrays you. One Ally or Contact becomes an Enemy.',
      effects: [
        { type: 'convert_connection', from: ['contact', 'ally'], to: ['enemy'], orGainNew: true },
        { type: 'eject_career' },
      ],
    },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'psion' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Your psionic abilities make you uncomfortable to be around. One Contact or Ally becomes a Rival. (RAW: no effect if you have no Contacts or Allies.)',
      effects: [{ type: 'convert_connection', from: ['contact', 'ally'], to: ['rival'], orGainNew: false }],
    },
    {
      roll: 4,
      text: 'Time spent mastering mind and body. Gain one of Athletics 1, Stealth 1, Survival 1, or Art 1.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Athletics' }, { name: 'Stealth' }, { name: 'Survival' }, { name: 'Art' }],
        },
      ],
    },
    {
      roll: 5,
      text: 'Use powers unethically? PSI 8+: success → extra Benefit roll or +1 SOC. Failure → -1 SOC.',
      effects: [
        {
          type: 'choice',
          prompt: 'Use powers unethically?',
          options: [
            {
              label: 'Yes',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'char', char: 'INT', target: 8 }, // PSI is checked manually until engine PSI support lands
                  onSuccess: [
                    {
                      type: 'choice',
                      prompt: 'Pick reward',
                      options: [
                        { label: 'Extra Benefit roll', effects: [{ type: 'gain_benefit_rolls', count: 1 }] },
                        { label: '+1 SOC', effects: [{ type: 'modify_char', char: 'SOC', delta: 1 }] },
                      ],
                    },
                  ],
                  onFailure: [{ type: 'modify_char', char: 'SOC', delta: -1 }],
                },
              ],
            },
            { label: 'No', effects: [] },
          ],
        },
      ],
    },
    { roll: 6, text: 'Unexpected connection. Gain a Contact.', effects: [{ type: 'gain_connection', connection: 'contact' }] },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'You achieve a new level of psionic strength. Increase your PSI by +1.',
      effects: [{ type: 'modify_psi', delta: 1 }],
    },
    {
      roll: 9,
      text: 'Advanced training. EDU 8+ → any one skill except Jack-of-all-Trades.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'EDU', target: 8 },
          onSuccess: [{ type: 'gain_skill_choice', level: 1, excludeJoat: true }],
          onFailure: [],
        },
      ],
    },
    { roll: 10, text: 'Useful information. DM+1 to one Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 11,
      text: 'Mentor. Gain Ally and DM+4 to your next advancement roll thanks to their aid.',
      effects: [
        { type: 'gain_connection', connection: 'ally' },
        { type: 'next_advancement_dm', dm: 4 },
      ],
    },
    { roll: 12, text: 'New level of discipline. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 1000 },
      { roll: 2, cash: 2000 },
      { roll: 3, cash: 4000 },
      { roll: 4, cash: 4000 },
      { roll: 5, cash: 8000 },
      { roll: 6, cash: 8000 },
      { roll: 7, cash: 16000 },
    ],
    benefits: [
      { roll: 1, label: 'Gun', effect: { type: 'gain_benefit', benefit: { type: 'gun', crLimit: 3000, tlLimit: 12 } } },
      { roll: 2, label: 'Two Ship Shares', effect: { type: 'gain_ship_share', count: { fixed: 2 } } },
      { roll: 3, label: 'Contact', effect: { type: 'gain_connection', connection: 'contact' } },
      { roll: 4, label: 'TAS Membership', effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } } },
      { roll: 5, label: 'Contact', effect: { type: 'gain_connection', connection: 'contact' } },
      {
        roll: 6,
        label: 'Combat Implant',
        effect: { type: 'gain_benefit', benefit: { type: 'cybernetic_implant', crLimit: 75000, tlLimit: 12 } },
      },
      { roll: 7, label: '10 Ship Shares', effect: { type: 'gain_ship_share', count: { fixed: 10 } } },
    ],
  },
};
