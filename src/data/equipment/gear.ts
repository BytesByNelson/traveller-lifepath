import type { GearDef } from '../../types';

/**
 * General gear from across the Equipment chapter — medikits, sensors, comms,
 * computers, survival gear, and tools. Drugs sit in their own category.
 */
export const GEAR: GearDef[] = [
  // ─── Medical ───
  { id: 'cryoberth', name: 'Cryoberth', category: 'medical', tl: 10, mass: 200, cost: 50000, description: 'Coffin-like stasis pod that freezes occupants almost instantly. Internal power lasts a week unconnected to a ship\'s power supply.' },
  { id: 'medikit_tl8', name: 'Medikit', variant: 'TL8', category: 'medical', tl: 8, mass: 1, cost: 1000, description: 'Diagnostic devices, surgical tools, and a panoply of drugs. Standard field issue.' },
  { id: 'medikit_tl10', name: 'Medikit', variant: 'TL10', category: 'medical', tl: 10, mass: 1, cost: 1500, description: 'Grants DM+1 on first-aid Medic checks.' },
  { id: 'medikit_tl12', name: 'Medikit', variant: 'TL12', category: 'medical', tl: 12, mass: 1, cost: 5000, description: 'Grants DM+2 on first-aid Medic checks.' },
  { id: 'medikit_tl14', name: 'Medikit', variant: 'TL14', category: 'medical', tl: 14, mass: 0, cost: 10000, description: 'Grants DM+3 on first-aid Medic checks. Effectively zero mass.' },

  // ─── Drugs ───
  { id: 'anagathics', name: 'Anagathics', category: 'drug', tl: 15, cost: 20000, description: 'Slows ageing. One dose per month maintains the anti-ageing effect. Illegal or heavily controlled on many worlds.' },
  { id: 'anti_rad', name: 'Anti-Rad', category: 'drug', tl: 8, cost: 1000, description: 'Absorbs up to 100 rads per dose. Limit one per day; overdose causes 1D END damage.' },
  { id: 'combat_drugs', name: 'Combat Drugs', category: 'drug', tl: 10, cost: 1000, description: 'DM+4 to Initiative. One free Reaction per round. Damage taken reduced by -2. Lasts ~10 minutes; user is Fatigued afterwards.' },
  { id: 'fast_drug', name: 'Fast Drug', category: 'drug', tl: 10, cost: 200, description: 'Suspended-animation drug — slows metabolism 60:1. A subjective day = two months. Used to extend life support reserves.' },
  { id: 'metabolic_accelerator', name: 'Metabolic Accelerator', category: 'drug', tl: 10, cost: 500, description: 'DM+8 to Initiative. Two free Reactions per round. Lasts ~10 minutes. Crash: 2D damage and Fatigued.' },
  { id: 'panaceas', name: 'Panaceas', category: 'drug', tl: 8, cost: 200, description: 'Wide-spectrum medicinal drugs. Allows Medic 0 untrained checks for infections/diseases.' },
  { id: 'slow_drug', name: 'Slow Drug', category: 'drug', tl: 11, cost: 500, description: 'Speeds healing 30× — a month of healing in a day. Only safe in a hospital with cryotech; lethal otherwise.' },
  { id: 'stims', name: 'Stims', category: 'drug', tl: 8, cost: 50, description: 'Removes Fatigue, costs 1 damage. Repeated use without rest is cumulatively damaging.' },

  // ─── Sensors ───
  { id: 'binoculars_tl3', name: 'Binoculars', variant: 'TL3', category: 'sensor', tl: 3, mass: 1, cost: 75, description: 'Optical zoom.' },
  { id: 'binoculars_tl8', name: 'Binoculars', variant: 'TL8', category: 'sensor', tl: 8, mass: 1, cost: 750, description: 'Light-intensification + image capture.' },
  { id: 'binoculars_tl12', name: 'Binoculars', variant: 'TL12 (PRIS)', category: 'sensor', tl: 12, mass: 1, cost: 3500, description: 'Portable Radiation Imaging System — covers IR through gamma rays.' },
  { id: 'bioscanner', name: 'Bioscanner', category: 'sensor', tl: 15, mass: 3.5, cost: 350000, description: 'Sniffs for organic molecules and tests chemical samples. Detects poisons, life signs, and classifies organisms.' },
  { id: 'densitometer', name: 'Densitometer', category: 'sensor', tl: 14, mass: 5, cost: 20000, description: 'Uses an object\'s natural gravity to map its density, building a 3D image of its inside and outside.' },
  { id: 'em_probe', name: 'EM Probe', category: 'sensor', tl: 10, mass: 1, cost: 1000, description: 'Detects electromagnetic emissions. Useful for diagnosing equipment or finding hidden bugs.' },
  { id: 'geiger_counter_tl5', name: 'Geiger Counter', variant: 'TL5', category: 'sensor', tl: 5, mass: 2, cost: 250, description: 'Detects radiation.' },
  { id: 'geiger_counter_tl10', name: 'Geiger Counter', variant: 'TL10', category: 'sensor', tl: 10, mass: 0, cost: 150 },
  { id: 'ir_goggles', name: 'IR Goggles', category: 'sensor', tl: 6, mass: 0, cost: 500, description: 'See exothermic sources in the dark.' },
  { id: 'light_intensifier_tl7', name: 'Light Intensifier Goggles', variant: 'TL7', category: 'sensor', tl: 7, mass: 1, cost: 500 },
  { id: 'light_intensifier_tl9', name: 'Light Intensifier Goggles', variant: 'TL9 combined', category: 'sensor', tl: 9, mass: 0, cost: 1250, description: 'Combines with IR goggles into a single unit.' },
  { id: 'nas', name: 'Neural Activity Scanner', category: 'sensor', tl: 15, mass: 10, cost: 35000, description: 'Detects neural activity up to 500m away. Estimates intelligence from brainwave patterns.' },

  // ─── Communications ───
  { id: 'commdot', name: 'Commdot', category: 'communications', tl: 10, mass: 0, cost: 10, description: 'Tiny microphone/speaker/transmitter — interfaces with another comm. Range a few metres; doubles as an improvised bug.' },
  { id: 'mobile_comm_tl6', name: 'Mobile Comm', variant: 'TL6', category: 'communications', tl: 6, cost: 50, description: 'Audio only.' },
  { id: 'mobile_comm_tl8', name: 'Mobile Comm', variant: 'TL8', category: 'communications', tl: 8, cost: 150, description: 'Audio + visual, Computer/0.' },
  { id: 'mobile_comm_tl10', name: 'Mobile Comm', variant: 'TL10', category: 'communications', tl: 10, cost: 500, description: 'Multiple data formats, Computer/1.' },
  { id: 'transceiver_tl5_5km', name: 'Radio Transceiver', variant: 'TL5 (5km)', category: 'communications', tl: 5, mass: 20, cost: 225, description: '5 km range.' },
  { id: 'transceiver_tl8_50km', name: 'Radio Transceiver', variant: 'TL8 (50km)', category: 'communications', tl: 8, cost: 75, description: '50 km range; pocket-sized.' },
  { id: 'transceiver_tl9_500km', name: 'Radio Transceiver', variant: 'TL9 (500km)', category: 'communications', tl: 9, cost: 500, description: '500 km range — reaches orbit.' },
  { id: 'laser_transceiver_tl9', name: 'Laser Transceiver', variant: 'TL9', category: 'communications', tl: 9, mass: 1.5, cost: 2500, description: 'Tightbeam laser comms; harder to intercept than radio.' },

  // ─── Survival ───
  { id: 'artificial_gill', name: 'Artificial Gill', category: 'survival', tl: 8, mass: 4, cost: 4000, description: 'Extracts oxygen from water; works only in breathable atmospheres.' },
  { id: 'breather_mask_tl8', name: 'Breather Mask', variant: 'TL8', category: 'survival', tl: 8, cost: 150, description: 'Combined filter and respirator.' },
  { id: 'breather_mask_tl10', name: 'Breather Mask', variant: 'TL10', category: 'survival', tl: 10, cost: 2000, description: 'Lung-implant or nostril-fitted variant.' },
  { id: 'climbing_kit_tl4', name: 'Climbing Kit', variant: 'TL4', category: 'survival', tl: 4, mass: 4, cost: 100 },
  { id: 'climbing_kit_tl8', name: 'Climbing Kit', variant: 'TL8', category: 'survival', tl: 8, mass: 2, cost: 500 },
  { id: 'environment_suit', name: 'Environment Suit', category: 'survival', tl: 8, mass: 1, cost: 500, description: 'Light environmental sealing — for noxious atmospheres, not vacuum.' },
  { id: 'filter_mask', name: 'Filter Mask', category: 'survival', tl: 7, cost: 100, description: 'Removes airborne contaminants; does not provide oxygen.' },
  { id: 'grav_belt', name: 'Grav Belt', category: 'survival', tl: 12, mass: 6, cost: 100000, description: 'Personal anti-gravity for short flights.' },
  { id: 'habitat_module_tl8', name: 'Habitat Module', variant: 'TL8', category: 'survival', tl: 8, mass: 1000, cost: 10000, description: 'Unpressurised modular quarters for six. Battery for one week. 12 person-hours to assemble.' },
  { id: 'habitat_module_tl10', name: 'Habitat Module', variant: 'TL10', category: 'survival', tl: 10, mass: 500, cost: 20000, description: 'Pressurised version; one week life support for six.' },
  { id: 'portable_fusion_generator', name: 'Portable Fusion Generator', category: 'survival', tl: 10, mass: 20, cost: 500000 },
  { id: 'radiation_suit', name: 'Radiation Suit', category: 'survival', tl: 6, mass: 10, cost: 5000, description: 'Heavy lead-lined suit.' },
  { id: 'rescue_bubble', name: 'Rescue Bubble', category: 'survival', tl: 9, mass: 2, cost: 600, description: 'Inflatable emergency vacuum-rated pod.' },
  { id: 'respirator_tl6', name: 'Respirator', variant: 'TL6', category: 'survival', tl: 6, cost: 100, description: 'Breathes for the user in thin atmospheres.' },
  { id: 'respirator_tl10', name: 'Respirator', variant: 'TL10', category: 'survival', tl: 10, cost: 2000 },
  { id: 'tent_tl3', name: 'Tent', variant: 'TL3', category: 'survival', tl: 3, mass: 6, cost: 200 },
  { id: 'tent_tl7', name: 'Tent', variant: 'TL7', category: 'survival', tl: 7, mass: 5, cost: 2000, description: 'Smart-fabric tent with integrated insulation.' },

  // ─── Computers ───
  { id: 'computer_terminal', name: 'Computer Terminal', category: 'computer', tl: 8, mass: 1, cost: 100, description: 'A "dumb" terminal — keyboard, screen, network connectivity. No local processing.' },
  { id: 'hand_computer_tl9', name: 'Hand Computer', variant: 'TL9', category: 'computer', tl: 9, mass: 1, cost: 500, description: 'Computer/0; runs Bandwidth-0 software.' },
  { id: 'hand_computer_tl11', name: 'Hand Computer', variant: 'TL11', category: 'computer', tl: 11, cost: 1000, description: 'Computer/1.' },
  { id: 'portable_computer_tl9', name: 'Portable Computer', variant: 'TL9', category: 'computer', tl: 9, mass: 6, cost: 1500, description: 'Computer/1 in a briefcase form factor.' },
  { id: 'portable_computer_tl11', name: 'Portable Computer', variant: 'TL11', category: 'computer', tl: 11, mass: 2, cost: 5000, description: 'Computer/2.' },
];
