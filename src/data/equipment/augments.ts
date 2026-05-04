import type { AugmentDef } from '../../types';

/**
 * Augments from the Equipment Core Collection table (p.106). Augments can take
 * characteristics above species maximums but interfere with medical care from
 * lower-TL facilities.
 */
export const AUGMENTS: AugmentDef[] = [
  { id: 'cognitive_aug_tl12', name: 'Cognitive Augmentation', variant: 'INT +1', category: 'augment', tl: 12, cost: 500000, improvement: 'INT +1', description: 'Replaces slow nerve cells with synthetic substrates and adds optoelectronic boosters, increasing thought speed.' },
  { id: 'cognitive_aug_tl14', name: 'Cognitive Augmentation', variant: 'INT +2', category: 'augment', tl: 14, cost: 1000000, improvement: 'INT +2', description: 'Higher-grade cognitive enhancement.' },
  { id: 'cognitive_aug_tl16', name: 'Cognitive Augmentation', variant: 'INT +3', category: 'augment', tl: 16, cost: 5000000, improvement: 'INT +3', description: 'Top-tier cognitive enhancement.' },
  { id: 'dexterity_aug_tl11', name: 'Dexterity Augmentation', variant: 'DEX +1', category: 'augment', tl: 11, cost: 500000, improvement: 'DEX +1', description: 'Faster motor neurons and synthetic-muscle integration.' },
  { id: 'dexterity_aug_tl12', name: 'Dexterity Augmentation', variant: 'DEX +2', category: 'augment', tl: 12, cost: 1000000, improvement: 'DEX +2' },
  { id: 'dexterity_aug_tl15', name: 'Dexterity Augmentation', variant: 'DEX +3', category: 'augment', tl: 15, cost: 5000000, improvement: 'DEX +3' },
  { id: 'endurance_aug_tl11', name: 'Endurance Augmentation', variant: 'END +1', category: 'augment', tl: 11, cost: 500000, improvement: 'END +1' },
  { id: 'endurance_aug_tl12', name: 'Endurance Augmentation', variant: 'END +2', category: 'augment', tl: 12, cost: 1000000, improvement: 'END +2' },
  { id: 'endurance_aug_tl15', name: 'Endurance Augmentation', variant: 'END +3', category: 'augment', tl: 15, cost: 5000000, improvement: 'END +3' },
  { id: 'enhanced_vision', name: 'Enhanced Vision', category: 'augment', tl: 13, cost: 25000, improvement: 'Binoculars + IR/light-intensification built into the eye', description: 'Cybernetic eye replacement with built-in optics.' },
  { id: 'neural_comm_tl10', name: 'Neural Comm', variant: 'TL10', category: 'augment', tl: 10, cost: 1000, improvement: 'Audio only', description: 'Identical capacities to a standard comm; activated by thought.' },
  { id: 'neural_comm_tl12', name: 'Neural Comm', variant: 'TL12', category: 'augment', tl: 12, cost: 5000, improvement: 'Audio + visual, Computer/0' },
  { id: 'neural_comm_tl14', name: 'Neural Comm', variant: 'TL14', category: 'augment', tl: 14, cost: 20000, improvement: 'Multi-format data, Computer/1' },
  { id: 'skill_augmentation', name: 'Skill Augmentation', category: 'augment', tl: 12, cost: 50000, improvement: 'Skill DM+1', description: 'Nervous system rewired for one specific skill. Must already have the skill at level 0+. Only one skill augmentation per Traveller.' },
  { id: 'strength_aug_tl11', name: 'Strength Augmentation', variant: 'STR +1', category: 'augment', tl: 11, cost: 500000, improvement: 'STR +1' },
  { id: 'strength_aug_tl12', name: 'Strength Augmentation', variant: 'STR +2', category: 'augment', tl: 12, cost: 1000000, improvement: 'STR +2' },
  { id: 'strength_aug_tl15', name: 'Strength Augmentation', variant: 'STR +3', category: 'augment', tl: 15, cost: 5000000, improvement: 'STR +3' },
  { id: 'subdermal_armour_tl10', name: 'Subdermal Armour', variant: 'TL10', category: 'augment', tl: 10, cost: 50000, improvement: 'Protection +1', description: 'A mesh of ballistic fibres in the skin. Stacks with worn protection.' },
  { id: 'subdermal_armour_tl11', name: 'Subdermal Armour', variant: 'TL11', category: 'augment', tl: 11, cost: 100000, improvement: 'Protection +3' },
  { id: 'wafer_jack_tl12', name: 'Wafer Jack', variant: 'TL12', category: 'augment', tl: 12, cost: 10000, improvement: 'Capacity Bandwidth/4', description: 'Skull-implanted computer — runs Expert programs for INT/EDU tasks. Computer/2 dedicated to Expert software.' },
  { id: 'wafer_jack_tl13', name: 'Wafer Jack', variant: 'TL13', category: 'augment', tl: 13, cost: 15000, improvement: 'Capacity Bandwidth/8' },
];
