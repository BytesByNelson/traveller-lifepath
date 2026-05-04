// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { psion } from './psion';
import { CAREERS } from './index';

describe('Psion career data', () => {
  it('is registered in the CAREERS map', () => {
    expect(CAREERS.psion).toBe(psion);
  });

  it('has three assignments matching the rulebook', () => {
    const ids = psion.assignments.map((a) => a.id).sort();
    expect(ids).toEqual(['adept', 'psi_warrior', 'wild_talent']);
  });

  it('Wild Talent: SOC 6+ survival, INT 8+ advancement', () => {
    const wt = psion.assignments.find((a) => a.id === 'wild_talent')!;
    expect(wt.survival).toEqual({ kind: 'char', char: 'SOC', target: 6 });
    expect(wt.advancement).toEqual({ kind: 'char', char: 'INT', target: 8 });
  });

  it('Adept: EDU 4+ / EDU 8+', () => {
    const a = psion.assignments.find((x) => x.id === 'adept')!;
    expect(a.survival).toEqual({ kind: 'char', char: 'EDU', target: 4 });
    expect(a.advancement).toEqual({ kind: 'char', char: 'EDU', target: 8 });
  });

  it('Psi-Warrior: END 6+ / END 6+', () => {
    const a = psion.assignments.find((x) => x.id === 'psi_warrior')!;
    expect(a.survival).toEqual({ kind: 'char', char: 'END', target: 6 });
    expect(a.advancement).toEqual({ kind: 'char', char: 'END', target: 6 });
  });

  it('uses assignment skill table for basic training (not service skills)', () => {
    expect(psion.flags?.basicTrainingFromAssignment).toBe(true);
    expect(psion.flags?.noPension).toBe(true);
  });

  it('service skills include all five talents and "Any Talent" choice', () => {
    const service = psion.skillTables.find((t) => t.id === 'service_skills')!;
    expect(service.rows).toHaveLength(6);
    // Rows 1-5 are individual talents.
    const talentRows = service.rows.slice(0, 5).map((r) => {
      if (r.effect.type === 'gain_skill') return r.effect.skill.name;
      throw new Error('expected gain_skill');
    });
    expect(talentRows).toEqual(['Telepathy', 'Clairvoyance', 'Telekinesis', 'Awareness', 'Teleportation']);
    // Row 6 is a choice.
    expect(service.rows[5]!.effect.type).toBe('choice');
  });

  it('mustering-out cash row 7 = Cr16,000, benefit row 7 = 10 Ship Shares', () => {
    const cash7 = psion.musteringOut.cash.find((b) => b.roll === 7);
    const ben7 = psion.musteringOut.benefits.find((b) => b.roll === 7);
    expect(cash7?.cash).toBe(16000);
    expect(ben7?.label).toMatch(/10 Ship Shares/);
  });
});
