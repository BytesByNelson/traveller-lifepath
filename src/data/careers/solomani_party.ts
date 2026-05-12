import type { Career } from '../../types';

/**
 * Solomani Party — the ruling political organisation of the Solomani
 * Confederation. Membership and advancement track ideological fervour, family
 * lineage, and political reliability rather than military rank or commercial
 * success. Gated to society = 'solomani_confederation' so the career only
 * appears for Confederation citizens.
 *
 * Source: Mongoose Traveller — Solomani Confederation sourcebook.
 * Numbers are calibrated against the sourcebook's career layout but tuned
 * for the broader chargen flow; specific event/mishap text is reworded to
 * avoid reproducing the rulebook verbatim per fair use.
 */
export const solomani_party: Career = {
  id: 'solomani_party',
  name: 'Solomani Party',
  flavour:
    'The single legal political party of the Solomani Confederation. Party members keep the Confederation running, root out subversives, and shape public opinion in service of the Solomani Cause.',
  qualification: {
    check: { kind: 'char', char: 'SOC', target: 6 },
    perPreviousCareer: -1,
  },
  availableInSocieties: ['solomani_confederation'],
  assignments: [
    {
      id: 'functionary',
      name: 'Functionary',
      description: 'Day-to-day Party administrator — files, paperwork, meetings, reports up the chain.',
      survival: { kind: 'char', char: 'EDU', target: 6 },
      advancement: { kind: 'char', char: 'INT', target: 6 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' } } },
      ],
    },
    {
      id: 'agitator',
      name: 'Agitator',
      description: 'Street-level propaganda, rallies, recruitment, occasional unpleasantness with anti-Party elements.',
      survival: { kind: 'char', char: 'END', target: 7 },
      advancement: { kind: 'char', char: 'SOC', target: 7 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Streetwise' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Deception' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Melee' } } },
      ],
    },
    {
      id: 'officer',
      name: 'Officer',
      description: 'Senior Party official with budget, staff, and direct policy authority within their bureau.',
      survival: { kind: 'char', char: 'INT', target: 7 },
      advancement: { kind: 'char', char: 'SOC', target: 8 },
      skillTable: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Tactics' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
      ],
    },
  ],
  skillTables: [
    {
      id: 'personal_development',
      rows: [
        { roll: 1, effect: { type: 'modify_char', char: 'STR', delta: 1 } },
        { roll: 2, effect: { type: 'modify_char', char: 'INT', delta: 1 } },
        { roll: 3, effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
        { roll: 4, effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Carouse' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
      ],
    },
    {
      id: 'service_skills',
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Admin' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Persuade' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Investigate' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Leadership' } } },
      ],
    },
    {
      id: 'advanced_education',
      minEdu: 8,
      rows: [
        { roll: 1, effect: { type: 'gain_skill', skill: { name: 'Advocate' } } },
        { roll: 2, effect: { type: 'gain_skill', skill: { name: 'Diplomat' } } },
        { roll: 3, effect: { type: 'gain_skill', skill: { name: 'Tactics', spec: 'military' } } },
        { roll: 4, effect: { type: 'gain_skill', skill: { name: 'Electronics', spec: 'computers' } } },
        { roll: 5, effect: { type: 'gain_skill', skill: { name: 'Language' } } },
        { roll: 6, effect: { type: 'gain_skill', skill: { name: 'Science', spec: 'history' } } },
      ],
    },
  ],
  ranks: {
    functionary: [
      { rank: 0, title: 'Member' },
      { rank: 1, title: 'Local Officer', bonus: { type: 'gain_skill', skill: { name: 'Admin' }, level: 1 } },
      { rank: 2, title: 'District Officer' },
      { rank: 3, title: 'Sub-Sector Officer', bonus: { type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 } },
      { rank: 4, title: 'Sector Officer' },
      { rank: 5, title: 'Sub-Sector Councillor', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { rank: 6, title: 'Party Councillor', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
    ],
    agitator: [
      { rank: 0, title: 'Member' },
      { rank: 1, title: 'Cell Leader', bonus: { type: 'gain_skill', skill: { name: 'Streetwise' }, level: 1 } },
      { rank: 2, title: 'Section Leader' },
      { rank: 3, title: 'Regional Organiser', bonus: { type: 'gain_skill', skill: { name: 'Persuade' }, level: 1 } },
      { rank: 4, title: 'Senior Organiser' },
      { rank: 5, title: 'Director of Propaganda', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { rank: 6, title: 'Voice of the Party' },
    ],
    officer: [
      { rank: 0, title: 'Member' },
      { rank: 1, title: 'Aide', bonus: { type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 } },
      { rank: 2, title: 'Deputy' },
      { rank: 3, title: 'Sub-Sector Officer', bonus: { type: 'gain_skill', skill: { name: 'Admin' }, level: 1 } },
      { rank: 4, title: 'Sector Officer' },
      { rank: 5, title: 'Sub-Sector Councillor', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
      { rank: 6, title: 'Party Councillor', bonus: { type: 'modify_char', char: 'SOC', delta: 1 } },
    ],
  },
  mishaps: [
    {
      roll: 1,
      text: 'Severely injured during a confrontation with anti-Party elements. Roll twice on the Injury table and take the lower.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
    {
      roll: 2,
      text: 'You uncover corruption within the Party. Pursue it (gain an Enemy at the top of your chain) or bury it (gain a Rival who knows).',
      effects: [
        {
          type: 'choice',
          prompt: 'Pursue the corruption or bury it?',
          options: [
            {
              label: 'Pursue — gain an Enemy in senior Party ranks.',
              effects: [{ type: 'gain_connection', connection: 'enemy' }, { type: 'eject_career' }],
            },
            {
              label: 'Bury it — gain a Rival who knows what you did.',
              effects: [{ type: 'gain_connection', connection: 'rival' }, { type: 'eject_career' }],
            },
          ],
        },
      ],
    },
    {
      roll: 3,
      text: 'Denounced by a rival faction inside the Party. Advocate 8+ to clear your name. Natural 2 → sentenced to a re-education camp (Prisoner next term).',
      effects: [
        {
          type: 'check',
          roll: { kind: 'skill', skill: { name: 'Advocate' }, target: 8 },
          onSuccess: [{ type: 'gain_benefit_rolls', count: 1 }],
          onFailure: [],
          onNaturalTwo: [{ type: 'force_career', career: 'prisoner', nextTerm: true }],
        },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 4,
      text: 'A propaganda campaign you oversaw lands badly. SOC -1; gain an Enemy in the Office of Public Information.',
      effects: [
        { type: 'modify_char', char: 'SOC', delta: -1 },
        { type: 'gain_connection', connection: 'enemy' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 5,
      text: 'A family member or close Contact is exposed as a sympathiser of the Imperium. Your loyalty is questioned.',
      effects: [
        { type: 'note', text: 'GM\'s choice — pick a Contact, Ally, or family member. They are detained for questioning.' },
        { type: 'eject_career' },
      ],
    },
    {
      roll: 6,
      text: 'Injured in a public incident. Roll on the Injury table.',
      effects: [{ type: 'roll_on_table', table: { kind: 'injury' } }, { type: 'eject_career' }],
    },
  ],
  events: [
    {
      roll: 2,
      text: 'Political disaster. Roll on the Mishap table — you are not ejected from this career.',
      effects: [
        {
          type: 'roll_on_table',
          table: { kind: 'career_mishaps', career: 'solomani_party' },
          ejectionPolicy: 'no_eject',
        },
      ],
    },
    {
      roll: 3,
      text: 'A senior Party member takes you under their wing. Gain a Contact in Party leadership and DM+2 to your next advancement roll.',
      effects: [
        { type: 'gain_connection', connection: 'contact' },
        { type: 'next_advancement_dm', dm: 2 },
      ],
    },
    {
      roll: 4,
      text: 'You author a well-received Party tract. Gain Advocate 1 or Persuade 1.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Advocate' }, { name: 'Persuade' }],
        },
      ],
    },
    {
      roll: 5,
      text: 'Public-affairs success. You build a network of useful Contacts. Gain D3 Contacts.',
      effects: [{ type: 'gain_connection', connection: 'contact', count: { dice: 'D3' } }],
    },
    {
      roll: 6,
      text: 'Specialised political training. Roll EDU 8+ to increase one skill you already have by +1.',
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
      text: 'Internal investigation. Investigate 8+ — success uncovers wrongdoing and DM+1 on a Benefit roll; failure draws unwanted attention (Rival).',
      effects: [
        {
          type: 'check',
          roll: { kind: 'skill', skill: { name: 'Investigate' }, target: 8 },
          onSuccess: [{ type: 'next_benefit_roll_dm', dm: 1 }],
          onFailure: [{ type: 'gain_connection', connection: 'rival' }],
        },
      ],
    },
    {
      roll: 9,
      text: 'Loyalty rewarded. DM+2 to your next advancement roll.',
      effects: [{ type: 'next_advancement_dm', dm: 2 }],
    },
    {
      roll: 10,
      text: 'Foreign assignment. Gain Language 1 (any) or Diplomat 1.',
      effects: [
        {
          type: 'gain_skill_choice',
          level: 1,
          from: [{ name: 'Language' }, { name: 'Diplomat' }],
        },
      ],
    },
    {
      roll: 11,
      text: 'You are selected for the Inner Council\'s observation list. Either Leadership 1 or DM+4 to a future advancement roll thanks to a senior patron.',
      effects: [
        {
          type: 'choice',
          prompt: 'Pick one',
          options: [
            { label: '+1 Leadership', effects: [{ type: 'gain_skill', skill: { name: 'Leadership' }, level: 1 }] },
            { label: 'DM+4 to next advancement roll', effects: [{ type: 'next_advancement_dm', dm: 4 }] },
          ],
        },
      ],
    },
    {
      roll: 12,
      text: 'You shape a major piece of Confederation policy. You are automatically promoted.',
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
      { roll: 6, cash: 75000 },
      { roll: 7, cash: 100000 },
    ],
    benefits: [
      { roll: 1, label: 'Contact in Party leadership', effect: { type: 'gain_connection', connection: 'contact' } },
      { roll: 2, label: 'EDU +1', effect: { type: 'modify_char', char: 'EDU', delta: 1 } },
      { roll: 3, label: 'SOC +1', effect: { type: 'modify_char', char: 'SOC', delta: 1 } },
      {
        roll: 4,
        label: 'Weapon',
        effect: { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } },
      },
      {
        roll: 5,
        label: 'TAS Membership (Solomani equivalent — Confederation Travellers\' Aid)',
        effect: { type: 'gain_benefit', benefit: { type: 'tas_membership' } },
      },
      { roll: 6, label: 'SOC +2', effect: { type: 'modify_char', char: 'SOC', delta: 2 } },
      {
        roll: 7,
        label: 'Inherited estate or Party-issued residence',
        effect: { type: 'note', text: 'Property holding — flavour-dependent. GM and player negotiate the specifics.' },
      },
    ],
  },
};
