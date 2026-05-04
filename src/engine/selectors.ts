import type { Character, CharCode, SkillEntry, SkillRef, SpeciesId } from '../types';
import { SPECIES, characteristicDM } from '../data';

const skillKey = (s: SkillRef): string => `${s.name}|${s.spec ?? ''}`;

/** Age in years given career history. */
export const getAge = (c: Character): number => 18 + 4 * c.careerHistory.length;

/** Apply species modifiers to base rolled characteristics. May raise alien stats above 15. */
export const applySpeciesModifiers = (
  baseValues: Record<CharCode, number>,
  species: SpeciesId,
): Record<CharCode, number> => {
  const out = { ...baseValues };
  const mods = SPECIES[species].charModifiers;
  for (const [k, v] of Object.entries(mods)) {
    if (v == null) continue;
    out[k as CharCode] = Math.max(1, out[k as CharCode] + v);
  }
  return out;
};

/** A characteristic's DM. */
export const charDM = (c: Character, code: CharCode): number => characteristicDM(c.characteristics[code]);

/**
 * Derive the current skill list by replaying every entry in `backgroundSkills`,
 * pre-career education, and `careerHistory` in order. The Character does NOT
 * store derived skills — this is the single source of truth.
 *
 * Skills are keyed by `${name}|${spec ?? ''}` — Pilot 1 and Pilot (small craft) 1
 * are distinct entries.
 */
export const getSkills = (c: Character): SkillEntry[] => {
  const map = new Map<string, SkillEntry>();
  for (const s of c.backgroundSkills) {
    set(map, s);
  }
  // Pre-career education + career history both contribute via their resolved skill rolls,
  // which are *already* SkillEntry-equivalent records merged into the character at apply time.
  // For now we just include backgroundSkills; the engine's effect resolver pushes new
  // entries directly onto a working list and the wizard merges them on commit.
  return Array.from(map.values());
};

const set = (map: Map<string, SkillEntry>, entry: SkillEntry) => {
  const key = skillKey(entry);
  const existing = map.get(key);
  if (!existing) {
    map.set(key, { ...entry });
    return;
  }
  // Highest level wins for the cached view; sources are kept on the latest entry.
  if (entry.level > existing.level) {
    map.set(key, { ...entry });
  }
};

/**
 * Total skill levels across all skills — used to enforce the 3 × (INT + EDU) cap.
 * Specializations count separately from their parent skill (Pilot 1 + Pilot (small craft) 1 = 2).
 */
export const getTotalSkillLevels = (c: Character): number => {
  let total = 0;
  for (const s of getSkills(c)) total += s.level;
  return total;
};

export const getSkillCapTotal = (c: Character): number =>
  3 * (c.characteristics.INT + c.characteristics.EDU);

/** Find a skill entry by ref (exact match on name + spec). */
export const findSkill = (c: Character, ref: SkillRef): SkillEntry | undefined =>
  getSkills(c).find((s) => s.name === ref.name && (s.spec ?? '') === (ref.spec ?? ''));

export const getSkillLevel = (c: Character, ref: SkillRef): number => findSkill(c, ref)?.level ?? 0;
