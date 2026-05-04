import type { Character, PsionicTalentId, SkillEntry } from '../types';
import { TALENT_LEARNING_DMS, TALENT_NAMES } from '../types';
import { roll2d, type Rng } from './dice';
import { characteristicDM } from '../data';

const TALENT_TO_SKILL: Record<PsionicTalentId, SkillEntry['name']> = {
  telepathy: 'Telepathy',
  clairvoyance: 'Clairvoyance',
  telekinesis: 'Telekinesis',
  awareness: 'Awareness',
  teleportation: 'Teleportation',
};

/**
 * Roll PSI: 2D minus terms served, floored at 0. PSI 0 means no potential.
 * Per the rulebook, the test takes two weeks and costs Cr5,000.
 */
export const rollPSI = (rng: Rng, terms: number): { rolled: number; psi: number } => {
  const { total } = roll2d(rng);
  const psi = Math.max(0, total - terms);
  return { rolled: total, psi };
};

/** PSI DM mirrors a regular characteristic DM. */
export const psiDM = (psi: number): number => characteristicDM(psi);

/**
 * Attempt to learn a talent during institute training. Returns the result —
 * the caller is responsible for committing the talent skill (level 0) on success.
 */
export const attemptLearnTalent = (
  character: Character,
  talent: PsionicTalentId,
  priorAttempts: number,
  rng: Rng,
): { rolled: number; total: number; success: boolean; psiDM: number; talentDM: number; priorPenalty: number } => {
  if (!character.psi) {
    throw new Error('Cannot learn talent without PSI');
  }
  const baseDM = TALENT_LEARNING_DMS.find((t) => t.talent === talent)?.baseDM ?? 0;
  const priorPenalty = priorAttempts === 0 ? 0 : -priorAttempts;
  const dm = psiDM(character.psi.current) + baseDM + priorPenalty;
  const { total: rolled } = roll2d(rng);
  const total = rolled + dm;
  // Per the rulebook, training requires "make a PSI check" — Average (8+).
  return {
    rolled,
    total,
    success: total >= 8,
    psiDM: psiDM(character.psi.current),
    talentDM: baseDM,
    priorPenalty,
  };
};

/** True if the Traveller has the named talent at level 0+. */
export const knowsTalent = (character: Character, talent: PsionicTalentId): boolean => {
  return character.backgroundSkills.some((s) => s.name === TALENT_NAMES[talent] && (s.level ?? 0) >= 0);
};

/** Returns talent ids the Traveller knows. */
export const learnedTalents = (character: Character): PsionicTalentId[] => {
  const out: PsionicTalentId[] = [];
  for (const id of Object.keys(TALENT_NAMES) as PsionicTalentId[]) {
    if (knowsTalent(character, id)) out.push(id);
  }
  return out;
};

/** Grant a talent at level 0 (or the higher of current / 0). */
export const grantTalent = (character: Character, talent: PsionicTalentId): Character => {
  const skill = TALENT_TO_SKILL[talent];
  if (character.backgroundSkills.some((s) => s.name === skill && !s.spec)) return character;
  return {
    ...character,
    backgroundSkills: [
      ...character.backgroundSkills,
      { name: skill, level: 0, source: { kind: 'manual' } },
    ],
  };
};

/** Set or update PSI on a character. */
export const setPSI = (character: Character, max: number, current: number = max): Character => ({
  ...character,
  psi: { max, current: Math.min(current, max) },
});

void roll2d; // re-export-friendly
void TALENT_TO_SKILL; // referenced via grantTalent
