import type { WeaponDef } from '../../types';

/* ─────────────── Melee weapons ─────────────── */

export const MELEE_WEAPONS: WeaponDef[] = [
  { id: 'blade', name: 'Blade', category: 'melee_weapon', skill: 'Melee', skillSpec: 'blade', tl: 2, range: 'Melee', damage: '2D', mass: 1, cost: 100, traits: [], description: 'A small blade weapon, between a dagger and a cutlass.' },
  { id: 'broadsword', name: 'Broadsword', category: 'melee_weapon', skill: 'Melee', skillSpec: 'blade', tl: 2, range: 'Melee', damage: '4D', mass: 2, cost: 500, traits: [{ trait: 'Bulky' }], description: 'A heavy two-handed sword.' },
  { id: 'club', name: 'Club', category: 'melee_weapon', skill: 'Melee', skillSpec: 'bludgeon', tl: 1, range: 'Melee', damage: '2D', mass: 2, cost: 0, traits: [], description: 'The first weapon emerging civilisations usually discover.' },
  { id: 'cutlass', name: 'Cutlass', category: 'melee_weapon', skill: 'Melee', skillSpec: 'blade', tl: 2, range: 'Melee', damage: '3D', mass: 0.5, cost: 200, traits: [], description: 'The standard shipboard blade weapon — often kept near airlocks to repel boarders.' },
  { id: 'dagger', name: 'Dagger', category: 'melee_weapon', skill: 'Melee', skillSpec: 'blade', tl: 1, range: 'Melee', damage: '1D+2', mass: 0.5, cost: 10, traits: [], description: 'A small knife weapon, approximately 20–30 cm in length.' },
  { id: 'rapier', name: 'Rapier', category: 'melee_weapon', skill: 'Melee', skillSpec: 'blade', tl: 3, range: 'Melee', damage: '2D', mass: 0.5, cost: 200, traits: [], description: 'A duelling foil. Grants DM+1 for parrying.' },
  { id: 'shield', name: 'Shield', category: 'melee_weapon', skill: 'Melee', skillSpec: 'bludgeon', tl: 1, range: 'Melee', damage: '1D', mass: 2, cost: 150, traits: [], description: 'Effective Melee skill +1 when parrying. A Traveller without Melee counts as Melee 1 when using a shield to parry.' },
  { id: 'staff', name: 'Staff', category: 'melee_weapon', skill: 'Melee', skillSpec: 'bludgeon', tl: 1, range: 'Melee', damage: '2D', mass: 2, cost: 0, traits: [], description: 'A length of wood or metal.' },
  { id: 'stunstick', name: 'Stunstick', category: 'melee_weapon', skill: 'Melee', skillSpec: 'bludgeon', tl: 8, range: 'Melee', damage: '2D', mass: 0.5, cost: 300, traits: [{ trait: 'Stun' }], description: 'A short ceramic stick that delivers a debilitating shock.' },
];

/* ─────────────── Slug throwers (pistols + rifles) ─────────────── */

export const SLUG_WEAPONS: WeaponDef[] = [
  // Pistols
  { id: 'antique_pistol', name: 'Antique Pistol', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 2, range: '5m', damage: '2D-3', mass: 0.5, cost: 100, magazine: 1, magazineCost: 5, traits: [] },
  { id: 'autopistol', name: 'Autopistol', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 5, range: '10m', damage: '3D-3', mass: 1, cost: 200, magazine: 15, magazineCost: 10, traits: [], description: 'Conventional semi-automatic handgun.' },
  { id: 'body_pistol', name: 'Body Pistol', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 8, range: '5m', damage: '2D', mass: 0, cost: 500, magazine: 6, magazineCost: 10, traits: [], description: 'A small pistol designed to elude security scans — often built from polymers.' },
  { id: 'gauss_pistol', name: 'Gauss Pistol', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 13, range: '20m', damage: '3D', mass: 1, cost: 500, magazine: 40, magazineCost: 20, traits: [{ trait: 'AP', rating: 3 }, { trait: 'Auto', rating: 2 }], description: 'High-velocity rounds via electromagnetic rails.' },
  { id: 'revolver', name: 'Revolver', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 4, range: '10m', damage: '3D-3', mass: 0.5, cost: 150, magazine: 6, magazineCost: 5, traits: [], description: 'Conventional six-shooter handgun.' },
  { id: 'snub_pistol', name: 'Snub Pistol', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 8, range: '5m', damage: '3D-3', mass: 0, cost: 150, magazine: 6, magazineCost: 10, traits: [{ trait: 'Zero-G' }], description: 'Designed for shipboard use; minimal recoil.' },
  // Rifles
  { id: 'accelerator_rifle', name: 'Accelerator Rifle', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 9, range: '250m', damage: '3D', mass: 2, cost: 900, magazine: 15, magazineCost: 30, traits: [{ trait: 'Zero-G' }], description: 'Fires tiny self-propelled missiles. Designed for zero-G combat.' },
  { id: 'advanced_combat_rifle', name: 'Advanced Combat Rifle', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 10, range: '450m', damage: '3D', mass: 3, cost: 1000, magazine: 40, magazineCost: 15, traits: [{ trait: 'Auto', rating: 3 }, { trait: 'Scope' }], description: 'The ultimate evolution of the conventional firearm; standard-issue for many militaries.' },
  { id: 'antique_rifle', name: 'Antique Rifle', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 2, range: '25m', damage: '3D-3', mass: 3, cost: 150, magazine: 1, magazineCost: 10, traits: [] },
  { id: 'assault_rifle', name: 'Assault Rifle', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 7, range: '200m', damage: '3D', mass: 4, cost: 500, magazine: 30, magazineCost: 15, traits: [{ trait: 'Auto', rating: 2 }] },
  { id: 'autorifle', name: 'Autorifle', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 6, range: '300m', damage: '3D', mass: 5, cost: 750, magazine: 20, magazineCost: 10, traits: [{ trait: 'Auto', rating: 2 }] },
  { id: 'gauss_rifle', name: 'Gauss Rifle', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 12, range: '600m', damage: '4D', mass: 4, cost: 1500, magazine: 80, magazineCost: 40, traits: [{ trait: 'AP', rating: 5 }, { trait: 'Auto', rating: 3 }, { trait: 'Scope' }] },
  { id: 'rifle', name: 'Rifle', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 5, range: '250m', damage: '3D', mass: 3, cost: 200, magazine: 5, magazineCost: 10, traits: [], description: 'A long-range hunting rifle or light infantry weapon.' },
  { id: 'shotgun', name: 'Shotgun', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 4, range: '50m', damage: '4D', mass: 4, cost: 200, magazine: 6, magazineCost: 10, traits: [{ trait: 'Bulky' }], description: 'Smoothbore weapon firing pellets. Most effective at short range; armour gives double Protection against pellets.' },
  { id: 'submachine_gun', name: 'Submachine Gun', category: 'slug_weapon', skill: 'Gun Combat', skillSpec: 'slug', tl: 6, range: '25m', damage: '3D', mass: 3, cost: 400, magazine: 20, magazineCost: 10, traits: [{ trait: 'Auto', rating: 3 }] },
];

/* ─────────────── Energy weapons ─────────────── */

export const ENERGY_WEAPONS: WeaponDef[] = [
  // Pistols
  { id: 'laser_pistol_tl9', name: 'Laser Pistol', variant: 'TL9', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 9, range: '20m', damage: '3D', mass: 2, cost: 2000, magazine: 100, magazineCost: 1000, powerPackCost: 1000, traits: [{ trait: 'Zero-G' }] },
  { id: 'laser_pistol_tl11', name: 'Laser Pistol', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 11, range: '30m', damage: '3D+3', mass: 1, cost: 3000, magazine: 100, magazineCost: 1200, traits: [{ trait: 'Zero-G' }] },
  { id: 'stunner_tl8', name: 'Stunner', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 8, range: '5m', damage: '2D', mass: 0.5, cost: 500, magazine: 100, magazineCost: 200, traits: [{ trait: 'Stun' }, { trait: 'Zero-G' }] },
  { id: 'stunner_tl10', name: 'Stunner', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 10, range: '5m', damage: '2D+3', mass: 0, cost: 750, magazine: 100, magazineCost: 200, traits: [{ trait: 'Stun' }, { trait: 'Zero-G' }] },
  { id: 'stunner_tl12', name: 'Stunner', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 12, range: '10m', damage: '3D', mass: 0, cost: 1000, magazine: 100, magazineCost: 200, traits: [{ trait: 'Stun' }, { trait: 'Zero-G' }] },
  // Rifles
  { id: 'laser_carbine_tl9', name: 'Laser Carbine', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 9, range: '150m', damage: '4D', mass: 4, cost: 2500, magazine: 50, magazineCost: 1000, traits: [{ trait: 'Zero-G' }] },
  { id: 'laser_carbine_tl11', name: 'Laser Carbine', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 11, range: '200m', damage: '4D+3', mass: 2, cost: 4000, magazine: 50, magazineCost: 3000, traits: [{ trait: 'Zero-G' }] },
  { id: 'laser_rifle_tl9', name: 'Laser Rifle', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 9, range: '200m', damage: '5D', mass: 5, cost: 3500, magazine: 100, magazineCost: 1500, traits: [{ trait: 'Zero-G' }] },
  { id: 'laser_rifle_tl11', name: 'Laser Rifle', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 11, range: '400m', damage: '5D+3', mass: 3, cost: 8000, magazine: 100, magazineCost: 3500, traits: [{ trait: 'Zero-G' }] },
  { id: 'laser_sniper_rifle', name: 'Laser Sniper Rifle', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 12, range: '600m', damage: '5D+3', mass: 4, cost: 9000, magazine: 6, magazineCost: 250, traits: [{ trait: 'Scope' }, { trait: 'Zero-G' }], description: 'Six-shot mobile sniping model with integrated power pack.' },
  { id: 'plasma_rifle', name: 'Plasma Rifle', category: 'energy_weapon', skill: 'Gun Combat', skillSpec: 'energy', tl: 16, range: '300m', damage: '6D', mass: 4, cost: 100000, traits: [], description: 'A miniaturised PGHP designed to crack battle dress.' },
];

/* ─────────────── Grenades ─────────────── */

export const GRENADES: WeaponDef[] = [
  { id: 'aerosol_grenade', name: 'Aerosol Grenade', category: 'grenade', skill: 'Athletics', skillSpec: 'dexterity', tl: 9, range: '20m', damage: '—', mass: 0.5, cost: 15, traits: [{ trait: 'Blast', rating: 9 }], description: 'Diffuses lasers — laser damage through the cloud reduced by -10. Lasts 1D × 3 rounds.' },
  { id: 'frag_grenade', name: 'Frag Grenade', category: 'grenade', skill: 'Athletics', skillSpec: 'dexterity', tl: 6, range: '20m', damage: '5D', mass: 0.5, cost: 30, traits: [{ trait: 'Blast', rating: 9 }] },
  { id: 'smoke_grenade', name: 'Smoke Grenade', category: 'grenade', skill: 'Athletics', skillSpec: 'dexterity', tl: 6, range: '20m', damage: '—', mass: 0.5, cost: 15, traits: [{ trait: 'Blast', rating: 9 }], description: 'DM-2 to attacks on targets within the cloud. IR vision bypasses it. Lasts 1D × 3 rounds.' },
  { id: 'stun_grenade', name: 'Stun Grenade', category: 'grenade', skill: 'Athletics', skillSpec: 'dexterity', tl: 7, range: '20m', damage: '3D', mass: 0.5, cost: 30, traits: [{ trait: 'Blast', rating: 9 }, { trait: 'Stun' }] },
];

/* ─────────────── Heavy weapons ─────────────── */

export const HEAVY_WEAPONS: WeaponDef[] = [
  { id: 'fghp_14', name: 'FGHP-14', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 14, range: '450m', damage: '2DD', mass: 12, cost: 100000, traits: [{ trait: 'Radiation' }, { trait: 'Very Bulky' }], description: 'Fusion Gun, Human Portable. Like a piece of artillery.' },
  { id: 'fghp_15', name: 'FGHP-15', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 15, range: '450m', damage: '2DD', mass: 12, cost: 400000, traits: [{ trait: 'Bulky' }, { trait: 'Radiation' }] },
  { id: 'fghp_16', name: 'FGHP-16', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 16, range: '450m', damage: '2DD', mass: 15, cost: 500000, traits: [{ trait: 'Radiation' }] },
  { id: 'grenade_launcher', name: 'Grenade Launcher', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 7, range: '100m', damage: 'As grenade', mass: 6, cost: 400, magazine: 6, traits: [{ trait: 'Bulky' }], description: 'Fires grenades over long distances; equips any normal grenade type.' },
  { id: 'machinegun', name: 'Machinegun', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'vehicle', tl: 6, range: '500m', damage: '3D', mass: 10, cost: 1500, magazine: 60, magazineCost: 100, traits: [{ trait: 'Auto', rating: 4 }] },
  { id: 'pghp_12', name: 'PGHP-12', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 12, range: '250m', damage: '1DD', mass: 10, cost: 20000, traits: [{ trait: 'Very Bulky' }], description: 'Plasma Gun, Human Portable. The standard assault weapon of the marines.' },
  { id: 'pghp_13', name: 'PGHP-13', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 13, range: '450m', damage: '1DD', mass: 10, cost: 65000, traits: [{ trait: 'Bulky' }] },
  { id: 'pghp_14', name: 'PGHP-14', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 14, range: '450m', damage: '1DD', mass: 10, cost: 100000, traits: [] },
  { id: 'ram_grenade_launcher', name: 'RAM Grenade Launcher', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 8, range: '250m', damage: 'As grenade', mass: 2, cost: 800, magazine: 6, traits: [{ trait: 'Auto', rating: 3 }, { trait: 'Bulky' }], description: 'Rocket-Assisted Multi-purpose grenade launcher — longer range, can fire up to three grenades at once.' },
  { id: 'rocket_launcher_tl6', name: 'Rocket Launcher', variant: 'TL6', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 6, range: '120m', damage: '4D', mass: 8, cost: 2000, magazine: 1, magazineCost: 300, traits: [{ trait: 'Blast', rating: 6 }] },
  { id: 'rocket_launcher_tl7', name: 'Rocket Launcher', variant: 'TL7', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 7, range: '150m', damage: '4D+3', mass: 8, cost: 2000, magazine: 1, magazineCost: 400, traits: [{ trait: 'Blast', rating: 6 }, { trait: 'Smart' }] },
  { id: 'rocket_launcher_tl8', name: 'Rocket Launcher', variant: 'TL8', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 8, range: '200m', damage: '5D', mass: 8, cost: 2000, magazine: 2, magazineCost: 600, traits: [{ trait: 'Blast', rating: 6 }, { trait: 'Scope' }, { trait: 'Smart' }] },
  { id: 'rocket_launcher_tl9', name: 'Rocket Launcher', variant: 'TL9', category: 'heavy_weapon', skill: 'Heavy Weapons', skillSpec: 'portable', tl: 9, range: '250m', damage: '5D+6', mass: 8, cost: 2000, magazine: 2, magazineCost: 800, traits: [{ trait: 'Blast', rating: 6 }, { trait: 'Scope' }, { trait: 'Smart' }] },
];

/** All weapons combined for the catalogue picker. */
export const WEAPONS: WeaponDef[] = [
  ...MELEE_WEAPONS,
  ...SLUG_WEAPONS,
  ...ENERGY_WEAPONS,
  ...GRENADES,
  ...HEAVY_WEAPONS,
];
