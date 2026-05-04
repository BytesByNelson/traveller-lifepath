import { CHAR_MAX, type SkillEntry } from '../types';
import { SKILL_CAP_DURING_CREATION } from '../data';

/**
 * Apply the creation-time skill cap (level 4) when raising a skill.
 * Returns the level that should actually be applied — current level if already at the cap.
 */
export const capCreationSkillLevel = (currentLevel: number, proposed: number): number =>
  Math.min(proposed, Math.max(currentLevel, SKILL_CAP_DURING_CREATION));

/**
 * Apply the characteristic cap (15 for humans). Returns the new value, with
 * any overflow on SOC turned into ship-share excess (handled elsewhere).
 */
export const capCharValue = (current: number, delta: number): { value: number; overflow: number } => {
  const proposed = current + delta;
  if (proposed > CHAR_MAX) {
    return { value: CHAR_MAX, overflow: proposed - CHAR_MAX };
  }
  return { value: Math.max(0, proposed), overflow: 0 };
};

/**
 * Decide what level a `gain_skill` action ends up at given the current level
 * and the rule's level field.
 *
 *  - rule level undefined → "+1 if has, else 1"
 *  - rule level N        → "set to max(current, N)"
 */
export const computeNewSkillLevel = (currentLevel: number | undefined, ruleLevel: number | undefined): number => {
  const cur = currentLevel ?? 0;
  let proposed: number;
  if (ruleLevel === undefined) {
    proposed = cur === 0 ? 1 : cur + 1;
  } else {
    proposed = Math.max(cur, ruleLevel);
  }
  return capCreationSkillLevel(cur, proposed);
};

/** Filter a list of skill entries down to a sane representation, dropping zero-levels. */
export const pruneSkills = (skills: SkillEntry[]): SkillEntry[] => skills.filter((s) => s.level > 0);
