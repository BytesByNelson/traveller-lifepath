import type { Character, SpeciesId } from '../types';
import { CHAR_CODES } from '../types';

export type MigrationResult =
  | { ok: true; character: Character }
  | { ok: false; reason: string };

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

const isInteger = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x);

const validSpecies: SpeciesId[] = [
  'human', 'aslan', 'vargr',
  'solomani', 'vilani', 'sword_worlder',
  'bwap', 'luriani', 'jonkeereen',
];

/**
 * Walk a parsed-JSON value through any registered migrations and return a Character
 * (or an error reason). v1 is a structural validation pass — it doesn't transform
 * anything, but it produces clear errors when the shape is wrong.
 *
 * Future versions: branch on `json.schemaVersion`, run a chain of upgraders ending
 * at the current shape. The contract is forward-only — older app versions cannot
 * load newer schemas.
 */
export function migrate(json: unknown): MigrationResult {
  if (!isObject(json)) return { ok: false, reason: 'Top-level value must be an object' };

  if (!('schemaVersion' in json)) return { ok: false, reason: 'Missing schemaVersion' };
  if (json.schemaVersion === 1) return validateV1(json);

  return { ok: false, reason: `Unsupported schemaVersion: ${json.schemaVersion}` };
}

function validateV1(json: Record<string, unknown>): MigrationResult {
  const errors: string[] = [];

  if (typeof json.id !== 'string' || json.id.length === 0) errors.push('id must be a non-empty string');
  if (typeof json.name !== 'string') errors.push('name must be a string');
  if (typeof json.species !== 'string' || !validSpecies.includes(json.species as SpeciesId)) {
    errors.push(`species must be one of ${validSpecies.join(', ')}`);
  }

  if (!isObject(json.characteristics)) {
    errors.push('characteristics must be an object');
  } else {
    for (const code of CHAR_CODES) {
      if (!isInteger((json.characteristics as Record<string, unknown>)[code])) {
        errors.push(`characteristics.${code} must be an integer`);
      }
    }
  }

  if (!isObject(json.baseCharacteristics)) {
    errors.push('baseCharacteristics must be an object');
  } else {
    for (const code of CHAR_CODES) {
      if (!isInteger((json.baseCharacteristics as Record<string, unknown>)[code])) {
        errors.push(`baseCharacteristics.${code} must be an integer`);
      }
    }
  }

  if (!Array.isArray(json.backgroundSkills)) errors.push('backgroundSkills must be an array');
  if (!Array.isArray(json.careerHistory)) errors.push('careerHistory must be an array');
  if (!Array.isArray(json.benefits)) errors.push('benefits must be an array');
  if (!Array.isArray(json.injuries)) errors.push('injuries must be an array');
  if (!Array.isArray(json.equipment)) errors.push('equipment must be an array');
  if (!Array.isArray(json.weapons)) errors.push('weapons must be an array');
  if (!Array.isArray(json.armor)) errors.push('armor must be an array');
  if (!Array.isArray(json.augments)) errors.push('augments must be an array');
  if (!Array.isArray(json.studyPeriods)) errors.push('studyPeriods must be an array');
  if (!Array.isArray(json.rollLog)) errors.push('rollLog must be an array');

  if (!isObject(json.connections)) {
    errors.push('connections must be an object');
  } else {
    for (const k of ['contacts', 'allies', 'rivals', 'enemies'] as const) {
      if (!Array.isArray((json.connections as Record<string, unknown>)[k])) {
        errors.push(`connections.${k} must be an array`);
      }
    }
  }

  if (!isInteger(json.cashRollsUsed)) errors.push('cashRollsUsed must be an integer');
  if (!isInteger(json.currentCash)) errors.push('currentCash must be an integer');
  if (typeof json.notes !== 'string') errors.push('notes must be a string');

  if (errors.length > 0) {
    return { ok: false, reason: errors.join('; ') };
  }

  // All checks passed. We trust the shape — cast through unknown to satisfy TS.
  return { ok: true, character: json as unknown as Character };
}

/** Slugify a character name for filenames. */
export function slugifyForFilename(name: string, fallback: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || fallback;
}
