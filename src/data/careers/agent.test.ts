import { describe, it, expect } from 'vitest';
import type { Effect } from '../../types';
import { agent } from './agent';

describe('Agent career data', () => {
  describe('assignment survival/advancement targets', () => {
    it('Law Enforcement: survival END 6+, advancement INT 6+', () => {
      const a = agent.assignments.find((x) => x.id === 'law_enforcement');
      expect(a).toBeDefined();
      expect(a!.survival).toEqual({ kind: 'char', char: 'END', target: 6 });
      expect(a!.advancement).toEqual({ kind: 'char', char: 'INT', target: 6 });
    });

    it('Intelligence: survival INT 7+, advancement INT 5+', () => {
      const a = agent.assignments.find((x) => x.id === 'intelligence');
      expect(a).toBeDefined();
      expect(a!.survival).toEqual({ kind: 'char', char: 'INT', target: 7 });
      expect(a!.advancement).toEqual({ kind: 'char', char: 'INT', target: 5 });
    });

    it('Corporate: survival INT 5+, advancement INT 7+', () => {
      const a = agent.assignments.find((x) => x.id === 'corporate');
      expect(a).toBeDefined();
      expect(a!.survival).toEqual({ kind: 'char', char: 'INT', target: 5 });
      expect(a!.advancement).toEqual({ kind: 'char', char: 'INT', target: 7 });
    });
  });

  describe('mishap row 3 (investigation goes wrong)', () => {
    const row3 = agent.mishaps.find((m) => m.roll === 3);

    it('exists', () => {
      expect(row3).toBeDefined();
    });

    it('Prisoner career is gated behind a natural-2 on the Advocate check (not unconditional)', () => {
      const advocateCheck = row3!.effects.find(
        (e): e is Extract<Effect, { type: 'check' }> =>
          e.type === 'check' && e.roll.kind === 'skill' && e.roll.skill.name === 'Advocate',
      );
      expect(advocateCheck, 'Advocate check').toBeDefined();
      expect(advocateCheck!.onNaturalTwo, 'onNaturalTwo branch').toBeDefined();

      const force = advocateCheck!.onNaturalTwo!.find(
        (e): e is Extract<Effect, { type: 'force_career' }> => e.type === 'force_career',
      );
      expect(force, 'force_career in onNaturalTwo').toBeDefined();
      expect(force!.career).toBe('prisoner');
      expect(force!.nextTerm).toBe(true);

      // It must NOT also appear unconditionally elsewhere (regression guard).
      const unconditionalForces = row3!.effects.filter(
        (e): e is Extract<Effect, { type: 'force_career' }> => e.type === 'force_career',
      );
      expect(unconditionalForces).toHaveLength(0);
    });
  });

  describe('event row 8 (undercover) cross-table reference', () => {
    const row8 = agent.events.find((e) => e.roll === 8);

    it('exists', () => {
      expect(row8).toBeDefined();
    });

    it('top-level effect is a Deception 8+ check', () => {
      expect(row8!.effects).toHaveLength(1);
      const top = row8!.effects[0]!;
      expect(top.type).toBe('check');
      if (top.type !== 'check') return;
      expect(top.roll.kind).toBe('skill');
      if (top.roll.kind !== 'skill') return;
      expect(top.roll.skill.name).toBe('Deception');
      expect(top.roll.target).toBe(8);
    });

    it('on success: choice between Rogue and Citizen, each branch contains BOTH events roll AND assignment skill table roll for the chosen career', () => {
      const top = row8!.effects[0]!;
      if (top.type !== 'check') throw new Error('expected check');

      // Success branch is wrapped in a single Choice between Rogue and Citizen.
      expect(top.onSuccess).toHaveLength(1);
      const choice = top.onSuccess[0]!;
      expect(choice.type).toBe('choice');
      if (choice.type !== 'choice') return;

      const labels = choice.options.map((o) => o.label);
      expect(labels).toEqual(expect.arrayContaining(['Rogue', 'Citizen']));

      for (const career of ['rogue', 'citizen'] as const) {
        const opt = choice.options.find((o) => o.label.toLowerCase() === career);
        expect(opt, `option for ${career}`).toBeDefined();

        const types = opt!.effects.map((e) => e.type);
        // Compound flow: events roll + assignment skill table roll, both bound to the same chosen career.
        expect(types).toContain('roll_on_other_career_events');
        expect(types).toContain('roll_on_other_career_assignment_skill_table');

        const eventsEffect = opt!.effects.find(
          (e): e is Extract<Effect, { type: 'roll_on_other_career_events' }> =>
            e.type === 'roll_on_other_career_events',
        )!;
        const skillsEffect = opt!.effects.find(
          (e): e is Extract<Effect, { type: 'roll_on_other_career_assignment_skill_table' }> =>
            e.type === 'roll_on_other_career_assignment_skill_table',
        )!;
        expect(eventsEffect.career).toBe(career);
        expect(skillsEffect.career).toBe(career);
      }
    });

    it('on failure: choice between Rogue and Citizen, each branch routes to that career\'s mishap table', () => {
      const top = row8!.effects[0]!;
      if (top.type !== 'check') throw new Error('expected check');

      expect(top.onFailure).toHaveLength(1);
      const choice = top.onFailure[0]!;
      expect(choice.type).toBe('choice');
      if (choice.type !== 'choice') return;

      for (const career of ['rogue', 'citizen'] as const) {
        const opt = choice.options.find((o) => o.label.toLowerCase() === career);
        expect(opt, `option for ${career}`).toBeDefined();

        const mishapEffect = opt!.effects.find(
          (e): e is Extract<Effect, { type: 'roll_on_other_career_mishap' }> =>
            e.type === 'roll_on_other_career_mishap',
        );
        expect(mishapEffect, 'mishap effect for ' + career).toBeDefined();
        expect(mishapEffect!.career).toBe(career);
      }
    });
  });
});

/**
 * Recursively flatten effects, descending into the branches of choices and checks
 * so we can assert on what's reachable anywhere in the resolution tree.
 */
// (helper removed — current tests assert on structure directly)
export {};
