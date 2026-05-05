import type { Career } from '../../types';

export const merchant: Career = {
  id: 'merchant',
  name: 'Merchant',
  flavour: 'Members of a commercial enterprise — corporate cargo haulers or independent free traders.',
  qualification: { check: { kind: 'char', char: 'INT', target: 4 }, perPreviousCareer: -1 },
  assignments: [
    {
      id: 'merchant_marine',
      name: 'Merchant Marine',
      description: 'Crew on massive cargo haulers run by the Imperium or a megacorporation.',
      survival: { kind: 'char', char: 'EDU', target: 5 },
      advancement: { kind: 'char', char: 'INT', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
      ],
    },
    {
      id: 'free_trader',
      name: 'Free Trader',
      description: 'Crew of a tramp trader.',
      survival: { kind: 'char', char: 'DEX', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Pilot', spec: 'spacecraft' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
      ],
    },
    {
      id: 'broker',
      name: 'Broker',
      description: 'Planetside brokerage or starport.',
      survival: { kind: 'char', char: 'EDU', target: 5 },
      advancement: { kind: 'char', char: 'INT', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Broker' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
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
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Broker' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Steward' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Pilot' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
      ],
    },
  ],
  ranks: {
    merchant_marine: [
      { rank: 0, title: 'Crewman' },
      { rank: 1, title: 'Senior Crewman', bonus: { type: 'gain_skill', skill: { name: 'Mechanic' }, level: 1 } },
      { rank: 2, title: '4th Officer' },
      { rank: 3, title: '3rd Officer' },
      { rank: 4, title: '2nd Officer', bonus: { type: 'gain_skill', skill: { name: 'Pilot' }, level: 1 } },
      { rank: 5, title: '1st Officer', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { rank: 6, title: 'Captain' },
    ],
    free_trader: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 } },
      { rank: 2 },
      { rank: 3, title: 'Experienced Trader', bonus: { type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' }, level: 1 } },
      { rank: 4 },
      { rank: 5 },
      { rank: 6 },
    ],
    broker: [
      { rank: 0 },
      { rank: 1, bonus: { type: 'gain_skill', skill: { name: 'Broker' }, level: 1 } },
      { rank: 2 },
      { rank: 3, title: 'Experienced Broker', bonus: { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 } },
      { rank: 4 },
      { rank: 5 },
      { rank: 6 },
    ],
  },
  mishaps: [
    { roll: 1, text: 'Severely injured.', effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }] },
    {
      roll: 2,
      text: 'Bankrupted by a rival. Lose all Benefits from this career, gain Rival.',
      effects: [
        { type: 'lose_benefit_rolls', count: 'all' },
        { type: 'gain_connection', connection: 'rival' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 3,
      text: 'War destroys trade routes. +1 Gun Combat or Pilot.',
      effects: [
        { type: 'gain_skill_choice', level: 1, from: [{ name: 'Gun Combat' }, { name: 'Pilot' }] },
        { type: 'eject_career' },
      ],
    },
    { roll: 4, text: 'Ship/starport destroyed. Gain Enemy.', effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'eject_career' }] },
    {
      roll: 5,
      text: 'Imperial trade restrictions. May take Rogue next term without qualification.',
      effects: [
        { type: 'allow_career_without_qualification', career: 'rogue', nextTerm: true },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 6,
      text: 'Bankruptcy. Salvage one extra Benefit roll for this term.',
      effects: [
        { type: 'gain_benefit_rolls', count: 1 },
        { type: 'eject_career' },
      ],
    },
  ],
  events: [
    { roll: 2, text: 'Disaster!', effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'merchant' }, ejectionPolicy: 'no_eject' }] },
    {
      roll: 3,
      text: 'Smuggle illegal items? Accept → Deception 8+ or Persuade 8+ → Streetwise 1 + extra Benefit roll. Refuse → criminal Enemy.',
      effects: [
        {
          type: 'choice',
          prompt: 'Smuggle?',
          options: [
            {
              label: 'Yes — Deception 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Deception' }, target: 8 },
                  onSuccess: [
                    { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 },
                    { type: 'gain_benefit_rolls', count: 1 },
                  ],
                  onFailure: [],
                },
              ],
            },
            {
              label: 'Yes — Persuade 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Persuade' }, target: 8 },
                  onSuccess: [
                    { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 },
                    { type: 'gain_benefit_rolls', count: 1 },
                  ],
                  onFailure: [],
                },
              ],
            },
            { label: 'Refuse', effects: [{ type: 'gain_connection', connection: 'enemy' }] },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Time with suppliers. +1 Profession, Electronics, Engineer, Animals, or Science.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Profession' }, { name: 'Electronics' }, { name: 'Engineer' }, { name: 'Animals' }, { name: 'Science' }],
        },
      ],
    },
    {
      roll: 5,
      text: 'Wager Benefit rolls. Roll Gambler or Broker 8+. Win → half wagered (round up). Lose → all. +1 to whichever skill used.',
      effects: [
        {
          type: 'choice',
          prompt: 'Roll which?',
          options: [
            {
              label: 'Gambler 8+',
              effects: [
                {
                  type: 'wager_benefit_rolls',
                  check: { kind: 'skill', skill: { name: 'Gambler' }, target: 8 },
                  onSuccessMultiplier: 0.5,
                  onSuccessRoundUp: true,
                  onFailureLoseAll: true,
                  grantSkillEither: 'Gambler',
                },
              ],
            },
            {
              label: 'Broker 8+',
              effects: [
                {
                  type: 'wager_benefit_rolls',
                  check: { kind: 'skill', skill: { name: 'Broker' }, target: 8 },
                  onSuccessMultiplier: 0.5,
                  onSuccessRoundUp: true,
                  onFailureLoseAll: true,
                  grantSkillEither: 'Broker',
                },
              ],
            },
          ],
        },
      ],
    },
    { roll: 6, text: 'Unexpected connection. Gain Contact.', effects: [{ type: 'gain_connection', connection: 'contact' }] },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Legal trouble. +1 Advocate, Admin, Diplomat, or Investigate. Roll 2D = 2 → Prisoner next term.',
      effects: [
        { type: 'gain_skill_choice', level: 1, from: [{ name: 'Advocate' }, { name: 'Admin' }, { name: 'Diplomat' }, { name: 'Investigate' }] },
        { type: 'prisoner_on_natural_two' },
      ],
    },
    {
      roll: 9,
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
    { roll: 10, text: 'Good deal — high life. DM+1 to a Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 11,
      text: 'Befriend a useful Ally. Gain Ally; +1 Carouse OR DM+4 to advancement.',
      effects: [
        { type: 'gain_connection', connection: 'ally' },
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Carouse 1', effects: [{ type: 'gain_skill', skill: { name: 'Carouse' }, level: 1 }] },
            { label: 'DM+4 next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    { roll: 12, text: 'Business thrives. Auto-promote.', effects: [{ type: 'auto_promote' }] },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 1000 },
      { roll: 2, cash: 5000 },
      { roll: 3, cash: 10000 },
      { roll: 4, cash: 20000 },
      { roll: 5, cash: 20000 },
      { roll: 6, cash: 40000 },
      { roll: 7, cash: 40000 },
    ],
    benefits: [
      { roll: 1, label: 'Blade', effect: { type: 'gain_benefit', benefit: { type: 'blade', crLimit: 1000, tlLimit: 12 } } },
      { roll: 2, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 3, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 4, label: 'Gun', effect: { type: 'gain_benefit', benefit: { type: 'gun', crLimit: 3000, tlLimit: 12 } } },
      { roll: 5, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      { roll: 6, label: 'Free Trader', effect: { type: 'gain_benefit', benefit: { type: 'free_trader' } } },
      { roll: 7, label: 'Free Trader', effect: { type: 'gain_benefit', benefit: { type: 'free_trader' } } },
    ],
  },
};
