import type { Effect } from '../types';

/** A single row on the Life Events 2D table. */
export type LifeEventRow = {
  roll: number;
  text: string;
  effects: Effect[];
};

export const LIFE_EVENTS: LifeEventRow[] = [
  {
    roll: 2,
    text: 'Sickness or Injury: roll on the Injury table.',
    effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }],
  },
  {
    roll: 3,
    text: 'Birth or Death: someone close to you dies, or someone close to you gives birth (or is born).',
    effects: [{ type: 'note', text: 'Birth or death of someone close.' }],
  },
  {
    roll: 4,
    text: 'Ending of Relationship: badly. Gain a Rival or Enemy.',
    effects: [{ type: 'gain_connection_choice', choices: ['rival', 'enemy'] }],
  },
  {
    roll: 5,
    text: 'Improved Relationship: deepens, possibly leading to marriage. Gain an Ally.',
    effects: [{ type: 'gain_connection', connection: 'ally' }],
  },
  {
    roll: 6,
    text: 'New Relationship: you become involved in a romantic relationship. Gain an Ally.',
    effects: [{ type: 'gain_connection', connection: 'ally' }],
  },
  {
    roll: 7,
    text: 'New Contact: you gain a new Contact.',
    effects: [{ type: 'gain_connection', connection: 'contact' }],
  },
  {
    roll: 8,
    text: 'Betrayal: convert one Contact or Ally into a Rival or Enemy. Otherwise gain a Rival or Enemy.',
    effects: [
      {
        type: 'convert_connection',
        from: ['contact', 'ally'],
        to: ['rival', 'enemy'],
        orGainNew: true,
      },
    ],
  },
  {
    roll: 9,
    text: 'Travel: you move to another world. DM+2 to your next qualification roll.',
    effects: [{ type: 'next_qualification_dm', dm: 2 }],
  },
  {
    roll: 10,
    text: 'Good Fortune: gain DM+2 to any one Benefit roll.',
    effects: [{ type: 'next_benefit_roll_dm', dm: 2 }],
  },
  {
    roll: 11,
    text: 'Crime: lose one Benefit roll or take the Prisoner career in your next term.',
    effects: [
      {
        type: 'choice',
        prompt: 'Crime!',
        options: [
          { label: 'Lose one Benefit roll', effects: [{ type: 'lose_benefit_rolls', count: 1 }] },
          { label: 'Take the Prisoner career next term', effects: [{ type: 'force_career', career: 'prisoner', nextTerm: true }] },
        ],
      },
    ],
  },
  {
    roll: 12,
    text: 'Unusual Event: roll on the Unusual Events sub-table.',
    effects: [{ type: 'roll_on_table', table: { kind: 'unusual_events' } }],
  },
];

/** Unusual Events 1D sub-table, referenced by Life Events 12 and several career events. */
export type UnusualEventRow = {
  roll: number;
  text: string;
  effects: Effect[];
};

export const UNUSUAL_EVENTS: UnusualEventRow[] = [
  {
    roll: 1,
    text: 'Psionics: you encounter a Psionic institute. Test your Psionic Strength and may take the Psion career.',
    effects: [{ type: 'gain_psion_eligibility' }],
  },
  {
    roll: 2,
    text: 'Aliens: you spend time among an alien species. Gain Science 1 and a Contact in that species.',
    effects: [
      { type: 'gain_skill', skill: { name: 'Science' }, level: 1 },
      { type: 'gain_connection', connection: 'contact' },
    ],
  },
  {
    roll: 3,
    text: 'Alien Artefact: you have a strange and unusual device from an alien culture.',
    effects: [{ type: 'note', text: 'Acquire alien artefact (GM specifies).' }],
  },
  {
    roll: 4,
    text: 'Amnesia: something happened to you, but you do not know what.',
    effects: [{ type: 'note', text: 'Amnesia — gap in memory.' }],
  },
  {
    roll: 5,
    text: 'Contact with Government: brief encounter with the highest echelons of the Imperium.',
    effects: [{ type: 'note', text: 'Imperial contact at the highest levels.' }],
  },
  {
    roll: 6,
    text: 'Ancient Technology: you have something older than the Imperium or even older than humanity.',
    effects: [{ type: 'note', text: 'Acquire Ancient technology (GM specifies).' }],
  },
];
