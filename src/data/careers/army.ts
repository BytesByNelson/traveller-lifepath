import type { Career } from '../../types';

export const army: Career = {
  id: 'army',
  name: 'Army',
  flavour: 'Members of the planetary armed fighting forces — soldiers, mercenaries, and the Poor Bloody Infantry.',
  qualification: {
    check: { kind: 'char', char: 'END', target: 5 },
    perPreviousCareer: -1,
    ageDM: { atLeastAge: 30, dm: -2 },
  },
  commission: {
    check: { kind: 'char', char: 'SOC', target: 8 },
    socRelaxAtLeast: 9,
    perTermAfterFirst: -1,
  },
  flags: { military: true },
  assignments: [
    {
      id: 'support',
      name: 'Support',
      description: 'Engineer, cook, or other role behind the front lines.',
      survival: { kind: 'char', char: 'END', target: 5 },
      advancement: { kind: 'char', char: 'EDU', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        {
          roll: 2,
          effect: {
            type: 'choice',
            prompt: 'Drive or Flyer',
            options: [
              { label: 'Drive', effects: [{ type: 'gain_skill', skill: { name: 'Drive' } }] },
              { label: 'Flyer', effects: [{ type: 'gain_skill', skill: { name: 'Flyer' } }] },
            ],
          },
        },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Profession' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Explosives' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'comms' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
      ],
    },
    {
      id: 'infantry',
      name: 'Infantry',
      description: 'One of the Poor Bloody Infantry on the ground.',
      survival: { kind: 'char', char: 'STR', target: 6 },
      advancement: { kind: 'char', char: 'EDU', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Heavy Weapons' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Stealth' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
      ],
    },
    {
      id: 'cavalry',
      name: 'Cavalry',
      description: 'Crew of a gunship or tank.',
      survival: { kind: 'char', char: 'DEX', target: 7 },
      advancement: { kind: 'char', char: 'INT', target: 5 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Drive' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Heavy Weapons', spec: 'vehicle' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'sensors' } } },
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
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Medic' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        {
          roll: 1,
          effect: {
            type: 'choice',
            prompt: 'Drive or Vacc Suit',
            options: [
              { label: 'Drive', effects: [{ type: 'gain_skill', skill: { name: 'Drive' } }] },
              { label: 'Vacc Suit', effects: [{ type: 'gain_skill', skill: { name: 'Vacc Suit' } }] },
            ],
          },
        },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Athletics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Recon' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Heavy Weapons' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'military' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Navigation' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Explosives' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Engineer' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Survival' } } },
      ],
    },
    {
      id: 'officer',
      commissionedOnly: true,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'military' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
      ],
    },
  ],
  ranks: {
    enlisted: [
      { rank: 0, title: 'Private', bonus: { type: 'gain_skill', skill: { name: 'Gun Combat' }, level: 1 } },
      { rank: 1, title: 'Lance Corporal', bonus: { type: 'gain_skill', skill: { name: 'Recon' }, level: 1 } },
      { rank: 2, title: 'Corporal' },
      { rank: 3, title: 'Lance Sergeant', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 4, title: 'Sergeant' },
      { rank: 5, title: 'Gunnery Sergeant' },
      { rank: 6, title: 'Sergeant Major' },
    ],
    officer: [
      { rank: 1, title: 'Lieutenant', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 2, title: 'Captain' },
      { rank: 3, title: 'Major', bonus: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'military' }, level: 1 } },
      { rank: 4, title: 'Lieutenant Colonel' },
      { rank: 5, title: 'Colonel' },
      { rank: 6, title: 'General', bonus: { type: 'raise_char_to_or_bump', char: 'SOC', minimum: 10 } },
    ],
  },
  mishaps: [
    {
      roll: 1,
      text: 'Severely injured. Roll on Injury (=2) or roll twice and take lower.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
    {
      roll: 2,
      text: 'Unit slaughtered. Gain commander as Enemy as they remove you from service.',
      effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'eject_career' }],
    },
    {
      roll: 3,
      text: 'Sent to a hostile region; discharged. Increase Recon or Survival by 1, gain rebels as Enemy.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Recon' }, { name: 'Survival' }],
        },
        { type: 'gain_connection', connection: 'enemy' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'Commander engaged in illegal activity. Join (Ally, then discharged) or co-operate (keep Benefit roll, then discharged).',
      effects: [
        {
          type: 'choice',
          prompt: 'Join the ring or cooperate?',
          options: [
            {
              label: 'Join — gain commander as Ally before the investigation gets you discharged.',
              // Standard mishap penalty: lose this term's benefit roll.
              effects: [
                { type: 'gain_connection', connection: 'ally' },
                { type: 'lose_benefit_rolls', count: 1 },
                { type: 'eject_career' },
              ],
            },
            {
              label: 'Cooperate — discharged but keep this term\'s Benefit roll.',
              // The "keep benefit roll" phrasing means no benefit penalty applied.
              effects: [{ type: 'eject_career' }],
            },
          ],
        },
      ],
    },
    {
      roll: 5,
      text: 'Quarrel with an officer or fellow soldier. Gain them as Rival as they drive you out.',
      effects: [{ type: 'gain_connection', connection: 'rival' }, { type: 'eject_career' }],
    },
    {
      roll: 6,
      text: 'Injured. Roll on Injury.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
  ],
  events: [
    {
      roll: 2,
      text: 'Disaster! Roll on the Mishap table — not ejected.',
      effects: [{ type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'army' }, ejectionPolicy: 'no_eject' }],
    },
    {
      roll: 3,
      text: 'Hostile environment world. Gain one of Vacc Suit 1, Engineer 1, Animals (riding or training) 1, Recon 1.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [
            { name: 'Vacc Suit' },
            { name: 'Engineer' },
            { name: 'Animals', spec: 'riding' },
            { name: 'Animals', spec: 'training' },
            { name: 'Recon' },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Urbanised war. Gain one of Stealth 1, Streetwise 1, Persuade 1, Recon 1.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Stealth' }, { name: 'Streetwise' }, { name: 'Persuade' }, { name: 'Recon' }],
        },
      ],
    },
    { roll: 5, text: 'Special assignment in your unit. DM+1 to one Benefit roll.', effects: [{ type: 'next_benefit_roll_dm', dm: 1 }] },
    {
      roll: 6,
      text: 'Brutal ground war. EDU 8+ to avoid injury; success → +1 Gun Combat or Leadership.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'EDU', target: 8 },
          onSuccess: [
            { type: 'gain_skill_choice', level: 1, from: [{ name: 'Gun Combat' }, { name: 'Leadership' }] },
          ],
          onFailure: [{ type: 'roll_on_table', table: { kind: 'injury' } }],
        },
      ],
    },
    { roll: 7, text: 'Life Event.', effects: [{ type: 'roll_on_table', table: { kind: 'life_events' } }] },
    {
      roll: 8,
      text: 'Specialist training. EDU 8+ to increase any one skill you already have by +1.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'EDU', target: 8 },
          onSuccess: [{ type: 'gain_skill_choice', existingOnly: true }],
          onFailure: [],
        },
      ],
    },
    { roll: 9, text: 'Hold out under siege. DM+2 to your next advancement roll.', effects: [{ type: 'next_advancement_dm', dm: 2 }] },
    {
      roll: 10,
      text: 'Peacekeeping role. Gain one of Admin 1, Investigate 1, Deception 1, Recon 1.',
      effects: [
        { type: 'gain_skill_choice', level: 1, from: [{ name: 'Admin' }, { name: 'Investigate' }, { name: 'Deception' }, { name: 'Recon' }] },
      ],
    },
    {
      roll: 11,
      text: 'Commanding officer takes interest. Tactics (military) 1 OR DM+4 to next advancement.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'Tactics (military) 1', effects: [{ type: 'gain_skill', skill: { name: 'Tactics', spec: 'military' }, level: 1 }] },
            { label: 'DM+4 to next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    {
      roll: 12,
      text: 'Heroism. May gain a promotion or commission automatically.',
      effects: [
        {
          type: 'choice',
          prompt: 'Heroism — pick one',
          options: [
            { label: 'Auto-promote', effects: [{ type: 'auto_promote' }] },
            { label: 'Auto-commission (if not yet commissioned)', effects: [{ type: 'auto_commission' }] },
          ],
        },
      ],
    },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 2000 },
      { roll: 2, cash: 5000 },
      { roll: 3, cash: 10000 },
      { roll: 4, cash: 10000 },
      { roll: 5, cash: 10000 },
      { roll: 6, cash: 20000 },
      { roll: 7, cash: 30000 },
    ],
    benefits: [
      { roll: 1, label: 'Cybernetic Implant', effect: { type: 'gain_benefit', benefit: { type: 'cybernetic_implant', crLimit: 75000, tlLimit: 12 } } },
      { roll: 2, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 3, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 4, label: 'Weapon', effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } } },
      { roll: 5, label: 'Armour', effect: { type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } } },
      {
        roll: 6,
        label: 'END +1 or Cybernetic Implant',
        effect: {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: 'END +1', effects: [{ type: 'modify_char', char: 'END', delta: 1 }] },
            { label: 'Cybernetic Implant', effects: [{ type: 'gain_benefit', benefit: { type: 'cybernetic_implant', crLimit: 75000, tlLimit: 12 } }] },
          ],
        },
      },
      { roll: 7, label: 'SOC +1', effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
    ],
  },
};
