import type { Career } from '../../types';

export const agent: Career = {
  id: 'agent',
  name: 'Agent',
  flavour: 'Law enforcement agencies, corporate operatives, spies and others who work in the shadows.',
  qualification: {
    check: { kind: 'char', char: 'INT', target: 6 },
    perPreviousCareer: -1,
  },
  assignments: [
    {
      id: 'law_enforcement',
      name: 'Law Enforcement',
      description: 'You are a police officer or detective.',
      survival: { kind: 'char', char: 'END', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
      ],
    },
    {
      id: 'intelligence',
      name: 'Intelligence',
      description: 'You work as a spy or saboteur.',
      survival: { kind: 'char', char: 'INT', target: 7 },
      advancement: { kind: 'char', char: 'INT', target: 5 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'comms' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
      ],
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'You work for a corporation, spying on rival organisations.',
      survival: { kind: 'char', char: 'INT', target: 5 },
      advancement: { kind: 'char', char: 'INT', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 2, effect: { type: 'modify_char', char: 'DEX', delta: 1 } },
        { roll: 3, effect: { type: 'modify_char', char: 'END', delta: 1 } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 5, effect: { type: 'modify_char', char: 'INT', delta: 1 } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Explosives' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
      ],
    },
  ],
  ranks: {
    law_enforcement: [
      { rank: 0, title: 'Rookie' },
      { rank: 1, title: 'Corporal', bonus: { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 } },
      { rank: 2, title: 'Sergeant' },
      { rank: 3, title: 'Detective' },
      { rank: 4, title: 'Lieutenant', bonus: { type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 } },
      { rank: 5, title: 'Chief', bonus: { type: 'gain_skill', skill: { name: 'Admin' }, level: 1 } },
      { rank: 6, title: 'Commissioner', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
    ],
    // Intelligence and Corporate share the same rank table.
    intelligence: [
      { rank: 0 },
      { rank: 1, title: 'Agent', bonus: { type: 'gain_skill', skill: { name: 'Deception' }, level: 1 } },
      { rank: 2, title: 'Field Agent', bonus: { type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Special Agent', bonus: { type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 } },
      { rank: 5, title: 'Assistant Director' },
      { rank: 6, title: 'Director' },
    ],
    corporate: [
      { rank: 0 },
      { rank: 1, title: 'Agent', bonus: { type: 'gain_skill', skill: { name: 'Deception' }, level: 1 } },
      { rank: 2, title: 'Field Agent', bonus: { type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 } },
      { rank: 3 },
      { rank: 4, title: 'Special Agent', bonus: { type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 } },
      { rank: 5, title: 'Assistant Director' },
      { rank: 6, title: 'Director' },
    ],
  },
  mishaps: [
    {
      roll: 1,
      text: 'Severely injured (=2 on Injury table) — alternatively, roll twice on Injury and take the lower.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
    {
      roll: 2,
      text: 'A figure under investigation offers you a deal.',
      effects: [
        {
          type: 'choice',
          prompt: 'Accept the deal?',
          options: [
            {
              label: 'Accept — leave the career without further penalty (lose this term\'s Benefit roll).',
              // Engine auto-applies lose_benefit_rolls for any mishap.
              effects: [{ type: 'eject_career' }],
            },
            {
              label: 'Refuse — Injury (twice, lower), gain an Enemy and one level in any skill.',
              effects: [
                { type: 'roll_on_table', table: { kind: 'injury' } },
                { type: 'gain_connection', connection: 'enemy' },
                { type: 'gain_skill_choice', level: 1, excludeJoat: true },
                { type: 'eject_career' },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 3,
      text: 'Investigation goes critically wrong. Roll Advocate 8+ — success keeps Benefit roll. Natural 2 → Prisoner next term.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'skill', skill: { name: 'Advocate' }, target: 8 },
          // Engine's mishap fold already deducts 1 benefit roll. Success offsets that.
          onSuccess: [{ type: 'gain_benefit_rolls', count: 1 }],
          onFailure: [],
          onNaturalTwo: [{ type: 'force_career', career: 'prisoner', nextTerm: true }],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'You learn something you should not know. Gain an Enemy and Deception 1.',
      effects: [
        { type: 'gain_connection', connection: 'enemy' },
        { type: 'gain_skill', skill: { name: 'Deception' }, level: 1 },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 5,
      text: 'Your work comes home with you. Pick a Contact, Ally or family member; roll Injury twice, take the lower for them.',
      effects: [
        { type: 'note', text: 'Roll Injury twice and take the lower result for the chosen NPC.' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 6,
      text: 'Injured. Roll on the Injury table.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
  ],
  events: [
    {
      roll: 2,
      text: 'Disaster! Roll on the Mishap table — you are not ejected from this career.',
      effects: [
        {
          type: 'roll_on_table',
          table: { kind: 'career_mishaps', career: 'agent' },
          ejectionPolicy: 'no_eject',
        },
      ],
    },
    {
      roll: 3,
      text: 'An investigation takes a dangerous turn. Investigate 8+ or Streetwise 8+. Fail → Mishap. Success → +1 to one of Deception, Jack-of-all-Trades, Persuade, Tactics.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll Investigate 8+ or Streetwise 8+',
          options: [
            {
              label: 'Roll Investigate 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Investigate' }, target: 8 },
                  onSuccess: [
                    {
                      type: 'gain_skill_choice',
                      level: 1,
                      from: [
                        { name: 'Deception' },
                        { name: 'Jack-of-all-Trades' },
                        { name: 'Persuade' },
                        { name: 'Tactics' },
                      ],
                    },
                  ],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'agent' } }],
                },
              ],
            },
            {
              label: 'Roll Streetwise 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Streetwise' }, target: 8 },
                  onSuccess: [
                    {
                      type: 'gain_skill_choice',
                      level: 1,
                      from: [
                        { name: 'Deception' },
                        { name: 'Jack-of-all-Trades' },
                        { name: 'Persuade' },
                        { name: 'Tactics' },
                      ],
                    },
                  ],
                  onFailure: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'agent' } }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'You complete a mission for your superiors. DM+1 to any one Benefit roll from this career.',
      effects: [{ type: 'next_benefit_roll_dm', dm: 1 }],
    },
    {
      roll: 5,
      text: 'You establish a network of contacts. Gain D3 Contacts.',
      effects: [{ type: 'gain_connection', connection: 'contact', count: { dice: 'D3' } }],
    },
    {
      roll: 6,
      text: 'Advanced training. Roll EDU 8+ to increase any one skill you already have by one level.',
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
      roll: 7,
      text: 'Life Event. Roll on the Life Events table.',
      effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }],
    },
    {
      roll: 8,
      text: 'You go undercover to investigate an enemy. Roll Deception 8+. Success → roll on Rogue or Citizen Events table AND make one roll on any Specialist skill table for that career. Fail → roll on Rogue or Citizen Mishap table.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'skill', skill: { name: 'Deception' }, target: 8 },
          onSuccess: [
            {
              type: 'choice',
              prompt: 'Roll on which career\'s tables?',
              options: [
                {
                  label: 'Rogue',
                  effects: [
                    { type: 'roll_on_other_career_events', career: 'rogue', ejectionPolicy: 'no_eject' },
                    { type: 'roll_on_other_career_assignment_skill_table', career: 'rogue' },
                  ],
                },
                {
                  label: 'Citizen',
                  effects: [
                    { type: 'roll_on_other_career_events', career: 'citizen', ejectionPolicy: 'no_eject' },
                    { type: 'roll_on_other_career_assignment_skill_table', career: 'citizen' },
                  ],
                },
              ],
            },
          ],
          onFailure: [
            {
              type: 'choice',
              prompt: 'Roll on which career\'s mishap table?',
              options: [
                {
                  label: 'Rogue',
                  effects: [{ type: 'roll_on_other_career_mishap', career: 'rogue', ejectionPolicy: 'no_eject' }],
                },
                {
                  label: 'Citizen',
                  effects: [{ type: 'roll_on_other_career_mishap', career: 'citizen', ejectionPolicy: 'no_eject' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      roll: 9,
      text: 'You go above and beyond the call of duty. DM+2 to your next advancement roll.',
      effects: [{ type: 'next_advancement_dm', dm: 2 }],
    },
    {
      roll: 10,
      text: 'Specialist vehicle training. Gain one of Drive 1, Flyer 1, Pilot 1 or Gunner 1.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Drive' }, { name: 'Flyer' }, { name: 'Pilot' }, { name: 'Gunner' }],
        },
      ],
    },
    {
      roll: 11,
      text: 'Befriended by a senior agent. Either +1 Investigate or DM+4 to an advancement roll thanks to their aid.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: '+1 Investigate', effects: [{ type: 'gain_skill', skill: { name: 'Investigate' }, level: 1 }] },
            { label: 'DM+4 to next advancement roll', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    {
      roll: 12,
      text: 'Your efforts uncover a major conspiracy against your employers. You are automatically promoted.',
      effects: [{ type: 'auto_promote' }],
    },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 1000 },
      { roll: 2, cash: 2000 },
      { roll: 3, cash: 5000 },
      { roll: 4, cash: 7500 },
      { roll: 5, cash: 10000 },
      { roll: 6, cash: 25000 },
      { roll: 7, cash: 50000 },
    ],
    benefits: [
      {
        roll: 1,
        label: 'Scientific Equipment',
        effect: { type: 'gain_benefit', benefit: { type: 'scientific_equipment', crLimit: 2000, tlLimit: 12 } },
      },
      { roll: 2, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 3, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      {
        roll: 4,
        label: 'Weapon',
        effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } },
      },
      {
        roll: 5,
        label: 'Cybernetic Implant',
        effect: { type: 'gain_benefit', benefit: { type: 'cybernetic_implant', crLimit: 75000, tlLimit: 12 } },
      },
      {
        roll: 6,
        label: 'SOC +1 or Cybernetic Implant',
        effect: {
          type: 'choice',
          prompt: 'SOC +1 or Cybernetic Implant',
          options: [
            { label: 'SOC +1', effects: [{ type: 'modify_char', char: 'SOC', delta: 1 }] },
            {
              label: 'Cybernetic Implant',
              effects: [
                { type: 'gain_benefit', benefit: { type: 'cybernetic_implant', crLimit: 75000, tlLimit: 12 } },
              ],
            },
          ],
        },
      },
      { roll: 7, label: 'TAS Membership', effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } } },
    ],
  },
};
