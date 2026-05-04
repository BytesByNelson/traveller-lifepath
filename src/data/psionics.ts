import type { PsionicPower, PsionicTalentId } from '../types';

/**
 * Psionic powers from the Psionics chapter. Each power belongs to a talent
 * (treated as a skill on the Traveller). Activation requires a check using
 * the talent's skill plus the PSI DM. Failed activations cost 1 PSI;
 * successful ones cost the listed amount. Reach can be boosted by paying 2× /
 * 4× cost for one / two range bands.
 */
export const PSIONIC_POWERS: PsionicPower[] = [
  /* ─────────────── Telepathy ─────────────── */
  {
    id: 'tp_life_detection',
    name: 'Life Detection',
    talent: 'telepathy',
    difficulty: 'easy',
    range: 'distant',
    psiCost: 1,
    description:
      'Sense the presence of other minds, their number, general type (animal/human/alien), and approximate location. Distinguishes intelligent beings from background life. Shielded minds are undetectable.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'tp_mind_link',
    name: 'Mind Link',
    talent: 'telepathy',
    difficulty: 'easy',
    range: 'distant',
    psiCost: 1,
    description:
      'Communicate silently with another telepath who must also use this power. Lasts a number of minutes equal to the combined Effects.',
    timeframe: '1D seconds',
  },
  {
    id: 'tp_telempathy',
    name: 'Telempathy',
    talent: 'telepathy',
    difficulty: 'routine',
    range: 'long',
    psiCost: 1,
    description:
      'Sense and project emotions. The Effect determines the strength of the projected feeling. Other telepaths recognise the manipulation; mundanes ascribe it to mood swings.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'tp_read_surface_thoughts',
    name: 'Read Surface Thoughts',
    talent: 'telepathy',
    difficulty: 'average',
    range: 'long',
    psiCost: 2,
    description:
      'Read the active thoughts of an unshielded subject. Other telepaths can lower their shields willingly to allow it.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'tp_send_thoughts',
    name: 'Send Thoughts',
    talent: 'telepathy',
    difficulty: 'difficult',
    range: 'distant',
    psiCost: 2,
    description:
      'Project thoughts to others, who need not be telepathic. Telepaths may shield against unwanted transmissions.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'tp_suggestion',
    name: 'Suggestion',
    talent: 'telepathy',
    difficulty: 'very_difficult',
    range: 'short',
    psiCost: 3,
    description:
      'Implant a thought, idea, or command which the subject interprets as their own. Effect 6+ overrides even self-harming commands.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'tp_probe',
    name: 'Probe',
    talent: 'telepathy',
    difficulty: 'very_difficult',
    range: 'close',
    psiCost: 4,
    description:
      'Delve into a subject\'s mind to read innermost thoughts and force divulgence. Cannot be used on shielded minds.',
    timeframe: '1D minutes',
  },
  {
    id: 'tp_assault',
    name: 'Assault',
    talent: 'telepathy',
    difficulty: 'formidable',
    range: 'short',
    psiCost: 8,
    damage: 'Effect × 3',
    description:
      'A psychic attack on a target\'s mind. Unshielded minds are rendered unconscious immediately and take Effect × 3 damage; shielded minds enter an opposed Telepathy duel.',
    timeframe: '1D seconds',
  },

  /* ─────────────── Clairvoyance ─────────────── */
  {
    id: 'cv_sense',
    name: 'Sense',
    talent: 'clairvoyance',
    difficulty: 'routine',
    range: 'very_distant',
    psiCost: 1,
    description:
      'Sense rudimentary characteristics of a remote location — "a room with four dogs" or "an open plain". The Effect determines accuracy.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'cv_tactical_awareness',
    name: 'Tactical Awareness',
    talent: 'clairvoyance',
    difficulty: 'average',
    range: 'long',
    psiCost: 2,
    description:
      'Perceive dangers and foes around you, ignoring darkness/smoke/fog and detecting hidden enemies. Lasts a number of combat rounds equal to the Effect.',
    timeframe: '1D seconds',
  },
  {
    id: 'cv_clairvoyance',
    name: 'Clairvoyance',
    talent: 'clairvoyance',
    difficulty: 'average',
    range: 'very_distant',
    psiCost: 1,
    description:
      'View a situation at a displaced point. Effect determines clarity.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'cv_clairaudience',
    name: 'Clairaudience',
    talent: 'clairvoyance',
    difficulty: 'average',
    range: 'very_distant',
    psiCost: 1,
    description: 'As Clairvoyance but for hearing.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'cv_clairsentience',
    name: 'Clairsentience',
    talent: 'clairvoyance',
    difficulty: 'difficult',
    range: 'very_distant',
    psiCost: 1,
    description: 'See and hear a remote situation simultaneously.',
    timeframe: '1D × 10 seconds',
  },

  /* ─────────────── Telekinesis ─────────────── */
  {
    id: 'tk_telekinesis',
    name: 'Telekinesis',
    talent: 'telekinesis',
    difficulty: 'average',
    range: 'short',
    psiCost: 1,
    description:
      'Move objects at range. The Effect is the duration in combat rounds; PSI spent is 1 per 10 kg moved.',
    timeframe: '1D seconds',
  },
  {
    id: 'tk_flight',
    name: 'Flight',
    talent: 'telekinesis',
    difficulty: 'difficult',
    range: 'personal',
    psiCost: 5,
    description:
      'Levitate / fly your own body for Effect rounds at 15 m/round.',
    timeframe: '1D seconds',
  },
  {
    id: 'tk_telekinetic_punch',
    name: 'Telekinetic Punch',
    talent: 'telekinesis',
    difficulty: 'average',
    range: 'short',
    psiCost: 1,
    damage: 'Effect',
    description:
      'A direct telekinetic strike. Damage equals the Effect; armour applies normally.',
    timeframe: '1D seconds',
  },
  {
    id: 'tk_microkinesis',
    name: 'Microkinesis',
    talent: 'telekinesis',
    difficulty: 'difficult',
    range: 'close',
    psiCost: 3,
    description:
      'Fine manipulation of very small or microscopic objects — pick locks, perform microsurgery, sabotage circuit boards.',
    timeframe: '1D × 10 seconds',
  },
  {
    id: 'tk_pyrokinesis',
    name: 'Pyrokinesis',
    talent: 'telekinesis',
    difficulty: 'routine',
    range: 'short',
    psiCost: 3,
    damage: 'Effect 5–8: 1D · Effect 9+: 2D',
    description:
      'Excite an object\'s temperature. Effect 0–4: warmer, no damage. 5–8: 1D damage. 9+: 2D and may catch fire if flammable.',
    timeframe: '1D × 10 seconds',
  },

  /* ─────────────── Awareness ─────────────── */
  {
    id: 'aw_suspended_animation',
    name: 'Suspended Animation',
    talent: 'awareness',
    difficulty: 'average',
    range: 'personal',
    psiCost: 3,
    description:
      'Enter a stasis-like state for seven days without food, water, or significant air. Equivalent to a cold-sleep berth without its hazards.',
    timeframe: '1D minutes',
  },
  {
    id: 'aw_enhanced_strength',
    name: 'Enhanced Strength',
    talent: 'awareness',
    difficulty: 'average',
    range: 'personal',
    psiCost: 0,
    description:
      'Convert PSI to STR temporarily. Lasts Effect × 10 minutes at peak, then declines 1 STR/minute. PSI cost equals STR increase.',
    timeframe: '1D seconds',
  },
  {
    id: 'aw_enhanced_endurance',
    name: 'Enhanced Endurance',
    talent: 'awareness',
    difficulty: 'average',
    range: 'personal',
    psiCost: 0,
    description:
      'Convert PSI to END temporarily. Lasts Effect × 10 minutes at peak, then declines 1 END/minute. PSI cost equals END increase.',
    timeframe: '1D seconds',
  },
  {
    id: 'aw_fortitude',
    name: 'Fortitude',
    talent: 'awareness',
    difficulty: 'difficult',
    range: 'personal',
    psiCost: 0,
    description:
      'Channel PSI for skeletal reinforcement. Lasts Effect rounds. Provides Protection equal to PSI spent. Stacks with worn armour.',
    timeframe: '1D seconds',
  },
  {
    id: 'aw_inspiration',
    name: 'Inspiration',
    talent: 'awareness',
    difficulty: 'average',
    range: 'personal',
    psiCost: 1,
    description:
      'Brief flash of insight — adds DM+2 to any one check made within the next minute.',
    timeframe: '1D seconds',
  },
  {
    id: 'aw_regeneration',
    name: 'Regeneration',
    talent: 'awareness',
    difficulty: 'difficult',
    range: 'personal',
    psiCost: 0,
    description:
      'Heal wounds — 1 PSI restores 1 lost characteristic point. May regrow limbs or organs over multiple sessions. Cannot counter ageing or restore SOC.',
    timeframe: '1D × 10 seconds',
  },

  /* ─────────────── Teleportation ─────────────── */
  {
    id: 'tt_teleportation',
    name: 'Teleportation',
    talent: 'teleportation',
    difficulty: 'average',
    range: 'distant',
    psiCost: 2,
    description:
      'Instantly move your body. Movement only — no objects or other people. Requires pre-known destination. Limited to Very Distant range on a planet, with elevation changes capped at 400 m to avoid lethal energy/momentum effects.',
    timeframe: '1D seconds',
  },
];

/** Powers grouped by talent — useful for the talent panel UI. */
export const POWERS_BY_TALENT: Record<PsionicTalentId, PsionicPower[]> = {
  telepathy: PSIONIC_POWERS.filter((p) => p.talent === 'telepathy'),
  clairvoyance: PSIONIC_POWERS.filter((p) => p.talent === 'clairvoyance'),
  telekinesis: PSIONIC_POWERS.filter((p) => p.talent === 'telekinesis'),
  awareness: PSIONIC_POWERS.filter((p) => p.talent === 'awareness'),
  teleportation: PSIONIC_POWERS.filter((p) => p.talent === 'teleportation'),
};

export const findPsionicPower = (id: string): PsionicPower | undefined =>
  PSIONIC_POWERS.find((p) => p.id === id);
