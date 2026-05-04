import type { CharCode } from './characteristics';
import type { SkillName, SkillRef } from './skills';
import type { DiceSpec } from './util';

/** Connection types per the Connections, Allies, Rivals, Enemies rule. */
export type ConnectionType = 'contact' | 'ally' | 'rival' | 'enemy';

/** A check the player rolls during effect resolution. */
export type CharCheck = { kind: 'char'; char: CharCode; target: number };
export type SkillCheck = { kind: 'skill'; skill: SkillRef; target: number };
export type RollCheck = CharCheck | SkillCheck;

/**
 * Refers to a specific table elsewhere in the rules.
 * The engine knows how to look these up and roll on them.
 */
export type TableRef =
  | { kind: 'life_events' }
  | { kind: 'unusual_events' }
  | { kind: 'injury' }
  | { kind: 'aging' }
  | { kind: 'draft' }
  | { kind: 'career_events'; career: string }
  | { kind: 'career_mishaps'; career: string }
  | { kind: 'career_assignment_skills'; career: string };

/**
 * Cross-table reference flag controlling whether a roll on another career's
 * mishap or events table also ejects the Traveller from their *current* career.
 *
 * Default rule: Disasters (event 2 in every career) say "you are not ejected from
 * this career" so we keep an explicit flag rather than implicit behavior.
 */
export type EjectionPolicy = 'eject' | 'no_eject';

/** A weapon/armour/etc. acquired as a benefit. */
export type BenefitKind =
  | { type: 'armour'; crLimit: number; tlLimit: number }
  | { type: 'blade'; crLimit: number; tlLimit: number }
  | { type: 'gun'; crLimit: number; tlLimit: number }
  | { type: 'weapon'; crLimit: number; tlLimit: number }
  | { type: 'cybernetic_implant'; crLimit: number; tlLimit: number }
  | { type: 'scientific_equipment'; crLimit: number; tlLimit: number }
  | { type: 'free_trader' }
  | { type: 'lab_ship' }
  | { type: 'scout_ship' }
  | { type: 'ships_boat' }
  | { type: 'yacht' }
  | { type: 'personal_vehicle' }
  | { type: 'tas_membership' };

/**
 * A count, possibly rolled on a die.
 *  - { fixed: 3 }            → exactly 3
 *  - { dice: 'D3' }          → roll D3
 *  - { dice: '1D' }          → roll 1D
 */
export type Count =
  | { fixed: number }
  | { dice: DiceSpec };

/**
 * Discriminated union of every effect the rules can produce.
 *
 * Adding a new variant must trigger a compile error in the resolver
 * (see assertNever default branch).
 */
export type Effect =
  // ─── direct grants ────────────────────────────────────────────────
  | { type: 'gain_skill'; skill: SkillRef; level?: number }
  /**
   * "Increase any skill you already have by one level" or "Gain any skill of your
   * choice at level 1, except Jack-of-all-Trades" — `from` constrains options;
   * `existingOnly: true` means must already have it; `excludeJoat` excludes JoaT.
   */
  | {
      type: 'gain_skill_choice';
      /** Target level. Undefined means "+1 bump" (if you have it, +1; if not, gain at level 1). */
      level?: number;
      from?: SkillRef[];
      existingOnly?: boolean;
      excludeJoat?: boolean;
      /**
       * After the player picks a skill, run a SkillCheck on that skill with the given target
       * and queue onSuccess/onFailure effects. Used for events like "pick a skill, then roll
       * 8+ on it: success → DM+2 next advancement, fail → DM-2 next survival."
       */
      followUpCheck?: {
        target: number;
        description?: string;
        onSuccess: Effect[];
        onFailure: Effect[];
      };
    }
  | { type: 'modify_char'; char: CharCode; delta: number }
  /**
   * Set characteristic to at least `minimum`. If already at or above, +1 instead.
   * Encodes the Mongoose 2022 rank-promotion rule "SOC raised to 10, or +1 if already higher."
   */
  | { type: 'raise_char_to_or_bump'; char: CharCode; minimum: number }
  | { type: 'modify_char_choice'; chars: CharCode[]; delta: number }
  /**
   * Like modify_char_choice but the delta is rolled (1D / 2D / D3) at apply
   * time and applied as a negative reduction to the chosen characteristic.
   * Used by Injury rows 1 and 2 ("reduce one physical char by 1D").
   */
  | { type: 'modify_char_choice_rolled'; chars: CharCode[]; dice: '1D' | '2D' | 'D3'; sign: 'minus' | 'plus' }
  /**
   * Adjusts the Traveller's PSI maximum by `delta`. Current PSI is clamped to
   * the new max. No-op if the character has no PSI rating yet.
   */
  | { type: 'modify_psi'; delta: number }
  /**
   * Record a wound on the character. Appended to character.injuries[].
   * Char reductions emitted as separate `modify_char` / `modify_char_choice` effects;
   * this only captures the human-readable wound entry that appears on the sheet.
   */
  | {
      type: 'gain_injury';
      description: string;
      severity: 'nearly_killed' | 'severely_injured' | 'missing_eye_or_limb' | 'scarred' | 'injured' | 'lightly_injured';
    }
  | {
      type: 'gain_connection';
      connection: ConnectionType;
      count?: Count;
      /** Internal: original resolved total when recursing for multi-grants. Don't set in data. */
      _totalCount?: number;
    }
  | { type: 'gain_connection_choice'; choices: ConnectionType[]; count?: Count }
  | {
      type: 'convert_connection';
      from: ConnectionType[];
      to: ConnectionType[];
      /**
       * When true and no matching connection exists, fall through to gaining a brand-new
       * one of the target type (used by Life Event 8, Entertainer mishap, etc. whose
       * rulebook text explicitly says "or gain a new"). When false, the event has no
       * effect if there's nothing to convert (matching strict RAW for events like Psion
       * event 3 that lack an "otherwise" clause).
       */
      orGainNew: boolean;
    }

  // ─── benefit roll modifications ───────────────────────────────────
  | { type: 'gain_benefit_rolls'; count: number }
  | { type: 'lose_benefit_rolls'; count: number | 'all' }
  | { type: 'next_benefit_roll_dm'; dm: number }

  // ─── future-roll DMs ─────────────────────────────────────────────
  | { type: 'next_advancement_dm'; dm: number }
  | { type: 'next_qualification_dm'; dm: number }
  | { type: 'next_survival_dm'; dm: number }

  // ─── benefit kind shortcuts (for mustering-out) ──────────────────
  | { type: 'gain_benefit'; benefit: BenefitKind }
  | { type: 'gain_ship_share'; count?: Count }

  // ─── career flow control ─────────────────────────────────────────
  | { type: 'auto_promote' }
  | { type: 'auto_commission' }
  | { type: 'eject_career' }
  | { type: 'must_continue_career' }
  /** Forces the Traveller into a specific career next term (e.g. Prisoner). */
  | { type: 'force_career'; career: string; nextTerm: true }
  /** Forces a draft roll next term. */
  | { type: 'force_draft'; nextTerm: true }
  /** Bonus skill rolls on the current career's skill tables this term. */
  | { type: 'extra_skill_roll'; count: number; tables?: 'any' }

  // ─── prisoner-specific ───────────────────────────────────────────
  | { type: 'modify_parole_threshold'; delta: number }
  | { type: 'reroll_parole_threshold' }

  // ─── roll on another table ──────────────────────────────────────
  | { type: 'roll_on_table'; table: TableRef; ejectionPolicy?: EjectionPolicy }
  /**
   * Cross-career roll: the player picks a career via a wrapping `choice`,
   * then this effect rolls on that career's events/mishap/assignment-skill table.
   * Modeled as separate effects per the Agent ev.8 nuance: events + assignment-skill
   * roll for the same chosen career.
   */
  | {
      type: 'roll_on_other_career_events';
      career: string;
      ejectionPolicy?: EjectionPolicy;
    }
  | {
      type: 'roll_on_other_career_mishap';
      career: string;
      ejectionPolicy?: EjectionPolicy;
    }
  | {
      type: 'roll_on_other_career_assignment_skill_table';
      career: string;
      /** When omitted, player picks the assignment. */
      assignment?: string;
    }

  // ─── flavor ──────────────────────────────────────────────────────
  | { type: 'note'; text: string }
  | { type: 'gain_psion_eligibility' }
  | { type: 'allow_career_without_qualification'; career: string; nextTerm: true }

  // ─── control flow (engine pauses) ────────────────────────────────
  | { type: 'choice'; prompt: string; options: { label: string; effects: Effect[] }[] }
  /**
   * A check on a skill or characteristic. The optional `onNaturalTwo` branch fires when
   * the unmodified 2D roll was exactly 2 — used by rules like Agent mishap 3 ("If you roll 2,
   * you must take the Prisoner career"). If the natural 2 also fails the check, both
   * `onFailure` and `onNaturalTwo` apply, in that order.
   */
  | {
      type: 'check';
      roll: RollCheck;
      onSuccess: Effect[];
      onFailure: Effect[];
      onNaturalTwo?: Effect[];
      description?: string;
    }
  /**
   * Player wagers any number of a specific resource (typically benefit rolls)
   * up to a cap, then a check decides outcome.
   */
  | {
      type: 'wager_benefit_rolls';
      check: RollCheck;
      /** "gain half as many Benefit rolls as you wagered" */
      onSuccessMultiplier: number; // e.g. 0.5
      onSuccessRoundUp?: boolean;
      onFailureLoseAll: true;
      grantSkillEither?: SkillName; // some events grant the skill regardless
    };
