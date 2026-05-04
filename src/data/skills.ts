import type { SkillDef, SkillName } from '../types';

/** Background skill list (page 9). */
export const BACKGROUND_SKILLS: readonly SkillName[] = [
  'Admin',
  'Animals',
  'Art',
  'Athletics',
  'Carouse',
  'Drive',
  'Electronics',
  'Flyer',
  'Language',
  'Mechanic',
  'Medic',
  'Profession',
  'Science',
  'Seafarer',
  'Streetwise',
  'Survival',
  'Vacc Suit',
] as const;

/**
 * Specialization metadata — derived from the rulebook's career skill tables and prose.
 * The list is conservative: parent forms are allowed where the rulebook uses them
 * unspecified, and known specializations from the careers data are listed.
 */
export const SKILLS: Record<SkillName, SkillDef> = {
  Admin: { name: 'Admin', specs: [], hasParent: true },
  Advocate: { name: 'Advocate', specs: [], hasParent: true },
  Animals: { name: 'Animals', specs: ['handling', 'training', 'veterinary', 'riding'], hasParent: true },
  Art: { name: 'Art', specs: ['holography', 'instrument', 'performer', 'sculpting', 'visual', 'write'], hasParent: true },
  Astrogation: { name: 'Astrogation', specs: [], hasParent: true },
  Athletics: { name: 'Athletics', specs: ['dexterity', 'endurance', 'strength'], hasParent: true },
  Broker: { name: 'Broker', specs: [], hasParent: true },
  Carouse: { name: 'Carouse', specs: [], hasParent: true },
  Deception: { name: 'Deception', specs: [], hasParent: true },
  Diplomat: { name: 'Diplomat', specs: [], hasParent: true },
  Drive: { name: 'Drive', specs: ['hovercraft', 'mole', 'tracked', 'walker', 'wheeled'], hasParent: true },
  Electronics: { name: 'Electronics', specs: ['comms', 'computers', 'remote ops', 'sensors'], hasParent: true },
  Engineer: { name: 'Engineer', specs: ['j-drive', 'life support', 'm-drive', 'power'], hasParent: true },
  Explosives: { name: 'Explosives', specs: [], hasParent: true },
  Flyer: { name: 'Flyer', specs: ['airship', 'grav', 'ornithopter', 'rotor', 'wing'], hasParent: true },
  Gambler: { name: 'Gambler', specs: [], hasParent: true },
  'Gun Combat': {
    name: 'Gun Combat',
    specs: ['archaic', 'energy pistol', 'energy rifle', 'slug pistol', 'slug rifle'],
    hasParent: true,
  },
  Gunner: { name: 'Gunner', specs: ['capital', 'ortillery', 'screen', 'turret'], hasParent: true },
  'Heavy Weapons': {
    name: 'Heavy Weapons',
    specs: ['artillery', 'man portable', 'vehicle'],
    hasParent: true,
  },
  Investigate: { name: 'Investigate', specs: [], hasParent: true },
  'Jack-of-all-Trades': {
    name: 'Jack-of-all-Trades',
    specs: [],
    hasParent: true,
    notTrainable: true,
    description: 'Cannot be improved through study or via the Connections rule.',
  },
  Language: {
    name: 'Language',
    specs: ['anglic', 'aslan', 'vargr', 'vilani', 'zdetl'],
    hasParent: true,
    description: 'Specialization typically tied to a specific language.',
  },
  Leadership: { name: 'Leadership', specs: [], hasParent: true },
  Mechanic: { name: 'Mechanic', specs: [], hasParent: true },
  Medic: { name: 'Medic', specs: [], hasParent: true },
  Melee: { name: 'Melee', specs: ['blade', 'bludgeon', 'natural', 'unarmed'], hasParent: true },
  Navigation: { name: 'Navigation', specs: [], hasParent: true },
  Persuade: { name: 'Persuade', specs: [], hasParent: true },
  Pilot: {
    name: 'Pilot',
    specs: ['capital ship', 'small craft', 'spacecraft'],
    hasParent: true,
  },
  Profession: {
    name: 'Profession',
    specs: ['belter', 'biologicals', 'civil engineering', 'construction', 'hydroponics', 'polymers'],
    hasParent: true,
  },
  Recon: { name: 'Recon', specs: [], hasParent: true },
  Science: {
    name: 'Science',
    specs: ['archaeology', 'astronomy', 'biology', 'chemistry', 'cosmology', 'cybernetics', 'economics', 'genetics', 'history', 'linguistics', 'philosophy', 'physics', 'planetology', 'psionicology', 'psychology', 'robotics', 'sophontology', 'xenology'],
    hasParent: true,
  },
  Seafarer: { name: 'Seafarer', specs: ['ocean ships', 'personal', 'sail', 'submarine'], hasParent: true },
  Stealth: { name: 'Stealth', specs: [], hasParent: true },
  Steward: { name: 'Steward', specs: [], hasParent: true },
  Streetwise: { name: 'Streetwise', specs: [], hasParent: true },
  Survival: { name: 'Survival', specs: [], hasParent: true },
  Tactics: { name: 'Tactics', specs: ['military', 'naval'], hasParent: true },
  'Vacc Suit': { name: 'Vacc Suit', specs: [], hasParent: true },
};

/** Cap during character creation. */
export const SKILL_CAP_DURING_CREATION = 4;

/** Connections rule: max free skills per character. */
export const CONNECTIONS_RULE_MAX_BONUSES = 2;

/** Connections rule cap on skill level when granted via the connections rule. */
export const CONNECTIONS_RULE_SKILL_CAP = 3;
