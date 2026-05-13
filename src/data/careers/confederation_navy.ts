import type { Career } from '../../types';

/**
 * Confederation Navy — the spacefaring military arm of the Solomani
 * Confederation. Structurally similar to the Imperial Navy (military
 * career, commission track, three assignments) but with Solomani-
 * specific events, mishaps, and a political-commissar overlay that
 * checks loyalty alongside competence. Gated to society =
 * 'solomani_confederation'.
 *
 * Source: Mongoose Traveller — Solomani Confederation sourcebook.
 * Numbers calibrated against the sourcebook's career layout where
 * specific values are known; otherwise approximated against the
 * Imperial Navy's standard chargen targets. Event/mishap text is
 * reworded from rulebook flavour to avoid reproducing source verbatim
 * under fair use.
 *
 * TODO: refine specific qualification / survival / advancement targets
 * + the official skill table rows + the rank table titles against the
 * Solomani Confederation sourcebook when added to rules/. The current
 * shape mirrors Imperial Navy and is canon-credible but not canon-exact.
 */
export const confederation_navy: Career = {
  id: 'confederation_navy',
  name: 'Confederation Navy',
  flavour:
    'The spacefaring military of the Solomani Confederation. Fleet crews mix conventional naval service with mandatory ideological reviews, political commissar oversight, and a uniquely Confederation focus on rapid jump-capable strike groups.',
  qualification: {
    check: { kind: 'char', char: 'INT', target: 6 },
    perPreviousCareer: -1,
    ageDM: { atLeastAge: 34, dm: -2 },
  },
  availableInSocieties: ['solomani_confederation'],
  commission: { check: { kind: 'char', char: 'SOC', target: 8 }, socRelaxAtLeast: 9, perTermAfterFirst: -1 },
  flags: { military: true },
  assignments: [
    {
      id: 'fleet',
      name: 'Fleet',
      description: 'Crew or officer on a line ship of the Confederation Fleet.',
      survival: { kind: 'char', char: 'INT', target: 5 },
      advancement: { kind: 'char', char: 'EDU', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Electronics' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Gun Combat' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Vacc Suit' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
      ],
    },
    {
      id: 'aerospace',
      name: 'Aerospace Corps',
      description: 'Pilot of a Confederation fighter, gunboat, or other small craft. The Confederation maintains a much heavier small-craft doctrine than the Imperium.',
      survival: { kind: 'char', char: 'DEX', target: 7 },
      advancement: { kind: 'char', char: 'EDU', target: 5 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Pilot', spec: 'small craft' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Flyer' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Gunner' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Pilot', spec: 'spacecraft' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Astrogation' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'sensors' } } },
      ],
    },
    {
      id: 'engineering',
      name: 'Engineering Corps',
      description: 'Specialist technician keeping Confederation drives, power plants, and life support running under wartime conditions.',
      survival: { kind: 'char', char: 'INT', target: 6 },
      advancement: { kind: 'char', char: 'EDU', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Engineer', spec: 'j-drive' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Mechanic' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Engineer', spec: 'power' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Engineer', spec: 'life support' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Engineer', spec: 'm-drive' } } },
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
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' } } },
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
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
      ],
    },
  ],
  ranks: {
    enlisted: [
      { rank: 0, title: 'Starman' },
      { rank: 1, title: 'Able Spaceman', bonus: { type: 'gain_skill', skill: { name: 'Mechanic' }, level: 1 } },
      { rank: 2, title: 'Petty Officer 3rd Class', bonus: { type: 'gain_skill', skill: { name: 'Vacc Suit' }, level: 1 } },
      { rank: 3, title: 'Petty Officer 2nd Class' },
      { rank: 4, title: 'Petty Officer 1st Class', bonus: { type: 'modify_char', char: 'END', delta: 1 } },
      { rank: 5, title: 'Chief Petty Officer' },
      { rank: 6, title: 'Master Chief Petty Officer' },
    ],
    officer: [
      { rank: 1, title: 'Ensign', bonus: { type: 'gain_skill', skill: { name: 'Admin' }, level: 1 } },
      { rank: 2, title: 'Lieutenant (jg)', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 3, title: 'Lieutenant' },
      { rank: 4, title: 'Commander', bonus: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' }, level: 1 } },
      { rank: 5, title: 'Captain', bonus: { type: 'raise_char_to_or_bump', char: 'SOC', minimum: 10 } },
      { rank: 6, title: 'Admiral', bonus: { type: 'raise_char_to_or_bump', char: 'SOC', minimum: 12 } },
    ],
  },
  mishaps: [
    {
      roll: 1,
      text: 'Severely injured during a fleet engagement.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
    {
      roll: 2,
      text: 'A political commissar flags you for review. END 7+ to weather the interrogation. Failure → reduce SOC by 1 and gain a Rival in Political Affairs.',
      effects: [
        {
          type: 'check',
          roll: { kind: 'char', char: 'END', target: 7 },
          onSuccess: [{ type: 'note', text: 'Cleared. The commissar files you under "loyal."' }],
          onFailure: [
            { type: 'modify_char', char: 'SOC', delta: -1 },
            { type: 'gain_connection', connection: 'rival' },
          ],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 3,
      text: 'Accused of harbouring sympathy for the Imperium. Advocate 8+ to clear your name. Natural 2 → sentenced (Prisoner next term).',
      effects: [
        {
          type: 'check',
          roll: { kind: 'skill', skill: { name: 'Advocate' }, target: 8 },
          onSuccess: [
            { type: 'note', text: 'Cleared honourably.' },
            { type: 'gain_benefit_rolls', count: 1 },
          ],
          onFailure: [{ type: 'note', text: 'Discharged under a cloud of suspicion.' }],
          onNaturalTwo: [{ type: 'force_career', career: 'prisoner', nextTerm: true }],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'A friendly-fire incident or supply-chain failure on your watch leaves casualties. Reduce SOC by 1; gain an Enemy in the affected unit.',
      effects: [
        { type: 'modify_char', char: 'SOC', delta: -1 },
        { type: 'gain_connection', connection: 'enemy' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 5,
      text: 'A quarrel with a fellow officer escalates. Gain a Rival.',
      effects: [{ type: 'gain_connection', connection: 'rival' }, { type: 'eject_career' }],
    },
    {
      roll: 6,
      text: 'Injured in the line of duty.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
  ],
  events: [
    {
      roll: 2,
      text: 'Disaster aboard ship!',
      effects: [
        {
          type: 'roll_on_table',
          table: { kind: 'career_mishaps', career: 'confederation_navy' },
          ejectionPolicy: 'no_eject',
        },
      ],
    },
    {
      roll: 3,
      text: 'You are seconded to a propaganda detail. Gain +1 Persuade or Deception; optional Diplomat 8+ for a Contact in the Party.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Persuade' }, { name: 'Deception' }],
        },
        {
          type: 'choice',
          prompt: 'Cultivate a Party contact?',
          options: [
            {
              label: 'Yes — Diplomat 8+',
              effects: [
                {
                  type: 'check',
                  roll: { kind: 'skill', skill: { name: 'Diplomat' }, target: 8 },
                  onSuccess: [{ type: 'gain_connection', connection: 'contact' }],
                  onFailure: [],
                },
              ],
            },
            { label: 'Decline', effects: [] },
          ],
        },
      ],
    },
    {
      roll: 4,
      text: 'Posted to a fleet HQ on a strategic world. DM+1 to one Benefit roll for connections made in port.',
      effects: [{ type: 'next_benefit_roll_dm', dm: 1 }],
    },
    {
      roll: 5,
      text: 'Advanced training course at a Confederation naval academy. EDU 8+ to bump one skill you already have by +1.',
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
      text: 'Notable fleet engagement. Gain +1 to one of Electronics, Engineer, Gunner, or Pilot.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [
            { name: 'Electronics' },
            { name: 'Engineer' },
            { name: 'Gunner' },
            { name: 'Pilot' },
          ],
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
      text: 'Diplomatic exchange with a friendly polity. Pick one: Recon 1, Diplomat 1, Steward 1, or gain a Contact.',
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
    {
      roll: 9,
      text: 'You expose a fellow officer\'s disloyalty. Gain an Enemy in their faction; DM+2 to your next advancement roll.',
      effects: [
        { type: 'gain_connection', connection: 'enemy' },
        { type: 'next_advancement_dm', dm: 2 },
      ],
    },
    {
      roll: 10,
      text: 'Frontier patrol against pirates or Imperial encroachment. Pick: +1 Tactics (naval), +1 Gunner, or an extra Benefit roll on muster-out.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: '+1 Tactics (naval)', effects: [{ type: 'gain_skill', skill: { name: 'Tactics', spec: 'naval' }, level: 1 }] },
            { label: '+1 Gunner', effects: [{ type: 'gain_skill', skill: { name: 'Gunner' }, level: 1 }] },
            { label: 'Extra Benefit roll', effects: [{ type: 'gain_benefit_rolls', count: 1 }] },
          ],
        },
      ],
    },
    {
      roll: 11,
      text: 'A senior admiral takes an interest in your career. +1 Leadership or DM+4 to a future advancement roll thanks to their backing.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: '+1 Leadership', effects: [{ type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 }] },
            { label: 'DM+4 to next advancement', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    {
      roll: 12,
      text: 'Distinguished service in a major Confederation operation. You are automatically promoted.',
      effects: [{ type: 'auto_promote' }],
    },
  ],
  musteringOut: {
    cash: [
      { roll: 1, cash: 1000 },
      { roll: 2, cash: 5000 },
      { roll: 3, cash: 10000 },
      { roll: 4, cash: 20000 },
      { roll: 5, cash: 50000 },
      { roll: 6, cash: 50000 },
      { roll: 7, cash: 100000 },
    ],
    benefits: [
      {
        roll: 1,
        label: 'Weapon',
        effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } },
      },
      { roll: 2, label: 'INT +1', effect: { type: 'modify_char', char: 'INT', delta: 1 } },
      { roll: 3, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      {
        roll: 4,
        label: 'Weapon',
        effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } },
      },
      {
        roll: 5,
        label: 'Confederation TAS-equivalent membership',
        effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } },
      },
      { roll: 6, label: 'Ship Share', effect: { type: 'gain_ship_share', count: { fixed: 1 } } },
      { roll: 7, label: 'SOC +2', effect: { type: 'modify_char', char: 'SOC', delta: 2 } },
    ],
  },
};
