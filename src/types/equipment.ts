import type { SkillName, SkillRef } from './skills';

/**
 * Weapon traits per the Equipment chapter. Each trait has a short rules-text
 * effect; the engine treats them as opaque tags but the sheet renders them
 * with hover tooltips.
 */
export type EquipmentTraitId =
  | 'AP'
  | 'Auto'
  | 'Artillery'
  | 'Blast'
  | 'Bulky'
  | 'Very Bulky'
  | 'Dangerous'
  | 'Lo-Pen'
  | 'Radiation'
  | 'Scope'
  | 'Smart'
  | 'Stun'
  | 'Zero-G';

export type EquipmentTrait = {
  id: EquipmentTraitId;
  /** Short label shown in tables, often with a numeric rating ("AP 3", "Auto 4"). */
  shortName: string;
  description: string;
  /** When true, this trait carries a numeric rating that is encoded as part of the WeaponDef.traits entry. */
  hasRating?: boolean;
};

/** Weapons / armour / gear / augments share a `category` and a few common stat fields. */
export type EquipmentCategory =
  | 'armour'
  | 'augment'
  | 'melee_weapon'
  | 'slug_weapon'
  | 'energy_weapon'
  | 'grenade'
  | 'heavy_weapon'
  | 'medical'
  | 'sensor'
  | 'communications'
  | 'computer'
  | 'survival'
  | 'tool'
  | 'drug';

export type ArmourDef = {
  id: string;
  name: string;
  /** Display variant (e.g. "TL10 Combat Armour" vs "TL12 Combat Armour"). */
  variant?: string;
  category: 'armour';
  tl: number;
  protection: number;
  /** Special note like "+10 vs lasers only" for Reflec. */
  protectionNote?: string;
  /** Radiation reduction. Undefined for armour with no rad rating. */
  rad?: number;
  /** Mass in kg. May be 0 (very light advanced armour) or marked as "powered" via the note. */
  mass: number;
  /** Cost in Credits. */
  cost: number;
  /** Vacc-suit skill level required to wear without penalties. */
  requiredSkill?: SkillRef & { level: number };
  /** Free-text caveat printed alongside the row (e.g. "powered armour, mass doesn't count vs encumbrance"). */
  notes?: string;
  description: string;
};

/** Each weapon has a `category` matching its trainer skill. */
export type WeaponCategory = 'melee_weapon' | 'slug_weapon' | 'energy_weapon' | 'grenade' | 'heavy_weapon';

/** A trait reference on a weapon — optionally with a rating. */
export type WeaponTraitRef = {
  trait: EquipmentTraitId;
  rating?: number;
};

export type WeaponDef = {
  id: string;
  name: string;
  variant?: string;
  category: WeaponCategory;
  /** Trainer skill — e.g. Gun Combat (slug) for the autopistol. */
  skill: SkillName;
  /** Specialty under the trainer skill, when applicable. */
  skillSpec?: string;
  tl: number;
  /** Range in metres for ranged weapons; "Melee" for melee weapons. */
  range: string;
  /** Damage dice expression as printed ("3D", "2D+3", "1DD", "As grenade"…). */
  damage: string;
  /** Mass in kg — may be 0 for very light weapons. */
  mass: number;
  /** Cost in Credits. */
  cost: number;
  /** Magazine capacity (where relevant). */
  magazine?: number;
  /** Cost of one full magazine in Credits. */
  magazineCost?: number;
  /** For energy weapons, the cost of a power pack. */
  powerPackCost?: number;
  traits: WeaponTraitRef[];
  description?: string;
};

export type AugmentDef = {
  id: string;
  name: string;
  variant?: string;
  category: 'augment';
  tl: number;
  cost: number;
  /** Effect summary ("INT +1", "STR +3", "Audio only", "Skill DM+1"…). */
  improvement: string;
  description?: string;
};

/** General gear category — covers medical kits, sensors, comms, computers, survival, tools, drugs. */
export type GearDef = {
  id: string;
  name: string;
  variant?: string;
  category: Exclude<EquipmentCategory, 'armour' | 'augment' | WeaponCategory>;
  tl: number;
  /** Mass in kg — may be 0 / undefined for very small or wearable gear. */
  mass?: number;
  cost: number;
  description?: string;
  /** Auxiliary stats — e.g. range/features for comms, computer Processing rating, dose count. */
  details?: string;
};

/** Catalogue entry returned by the master list. */
export type CatalogueEntry =
  | { kind: 'armour'; item: ArmourDef }
  | { kind: 'weapon'; item: WeaponDef }
  | { kind: 'augment'; item: AugmentDef }
  | { kind: 'gear'; item: GearDef };
