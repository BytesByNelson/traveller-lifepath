import type { SkillRef } from '../types';

export type SkillPackage = {
  id: string;
  name: string;
  description: string;
  /** Each entry is a single skill the package grants at level 1. Some packages list a skill twice. */
  skills: SkillRef[];
};

export const SKILL_PACKAGES: SkillPackage[] = [
  {
    id: 'traveller',
    name: 'Traveller',
    description: 'All-round skill package; trading one week and blowing things up the next.',
    skills: [
      { name: 'Deception' },
      { name: 'Electronics' },
      { name: 'Gun Combat' },
      { name: 'Gunner' },
      { name: 'Medic' },
      { name: 'Persuade' },
      { name: 'Pilot' },
      { name: 'Stealth' },
    ],
  },
  {
    id: 'trader',
    name: 'Trader',
    description: 'Trading and commerce as the primary activities.',
    skills: [
      { name: 'Advocate' },
      { name: 'Astrogation' },
      { name: 'Broker' },
      { name: 'Diplomat' },
      { name: 'Electronics' },
      { name: 'Medic' },
      { name: 'Pilot' },
      { name: 'Streetwise' },
    ],
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Operating on the fringe of Charted Space.',
    skills: [
      { name: 'Astrogation' },
      { name: 'Electronics' },
      { name: 'Gun Combat' },
      { name: 'Medic' },
      { name: 'Pilot' },
      { name: 'Recon' },
      { name: 'Stealth' },
      { name: 'Survival' },
    ],
  },
  {
    id: 'investigator',
    name: 'Investigator',
    description: 'Solving crimes and investigating mysteries.',
    skills: [
      { name: 'Admin' },
      { name: 'Advocate' },
      { name: 'Deception' },
      { name: 'Electronics' },
      { name: 'Gun Combat' },
      { name: 'Investigate' },
      { name: 'Persuade' },
      { name: 'Stealth' },
      { name: 'Streetwise' },
    ],
  },
  {
    id: 'mercenary',
    name: 'Mercenary',
    description: 'Combat-heavy ground operations.',
    // Gun Combat appears twice in the rulebook listing.
    skills: [
      { name: 'Electronics' },
      { name: 'Medic' },
      { name: 'Leadership' },
      { name: 'Heavy Weapons' },
      { name: 'Gun Combat' },
      { name: 'Gun Combat' },
      { name: 'Stealth' },
      { name: 'Recon' },
    ],
  },
  {
    id: 'starship',
    name: 'Starship',
    description: 'Almost all action takes place on spacecraft.',
    skills: [
      { name: 'Astrogation' },
      { name: 'Electronics' },
      { name: 'Engineer' },
      { name: 'Gunner' },
      { name: 'Mechanic' },
      { name: 'Medic' },
      { name: 'Pilot' },
      { name: 'Tactics', spec: 'naval' },
    ],
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    description: 'Government operatives and ambassadors.',
    skills: [
      { name: 'Admin' },
      { name: 'Advocate' },
      { name: 'Deception' },
      { name: 'Diplomat' },
      { name: 'Electronics' },
      { name: 'Persuade' },
      { name: 'Stealth' },
      { name: 'Streetwise' },
    ],
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description: 'Crime and elaborate heists.',
    skills: [
      { name: 'Broker' },
      { name: 'Deception' },
      { name: 'Electronics' },
      { name: 'Medic' },
      { name: 'Persuade' },
      { name: 'Pilot' },
      { name: 'Stealth' },
      { name: 'Streetwise' },
    ],
  },
];
