// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { CAREERS, CAREER_LIST } from './index';
import { confederation_navy } from './confederation_navy';

describe('Confederation Navy career', () => {
  it('is registered in CAREERS under id "confederation_navy"', () => {
    expect(CAREERS.confederation_navy).toBeDefined();
    expect(CAREERS.confederation_navy).toBe(confederation_navy);
  });

  it('declares availability only in the Solomani Confederation', () => {
    expect(confederation_navy.availableInSocieties).toEqual(['solomani_confederation']);
  });

  it('has three assignments (Fleet, Aerospace, Engineering)', () => {
    const ids = confederation_navy.assignments.map((a) => a.id).sort();
    expect(ids).toEqual(['aerospace', 'engineering', 'fleet']);
  });

  it('is a military career with commission rules', () => {
    expect(confederation_navy.flags?.military).toBe(true);
    expect(confederation_navy.commission).toBeDefined();
    expect(confederation_navy.commission?.check.target).toBe(8);
  });

  it('has standard chargen tables (mishaps, events, mustering)', () => {
    expect(confederation_navy.skillTables.length).toBeGreaterThanOrEqual(4);
    expect(confederation_navy.mishaps.length).toBe(6);
    expect(confederation_navy.events.length).toBe(11);
    expect(confederation_navy.musteringOut.cash.length).toBe(7);
    expect(confederation_navy.musteringOut.benefits.length).toBe(7);
  });

  it('has both enlisted and officer rank tables', () => {
    expect(confederation_navy.ranks.enlisted).toBeDefined();
    expect(confederation_navy.ranks.officer).toBeDefined();
    expect(confederation_navy.ranks.enlisted!.length).toBeGreaterThanOrEqual(6);
    expect(confederation_navy.ranks.officer!.length).toBeGreaterThanOrEqual(6);
  });

  it('Imperial Traveller does NOT see Confederation Navy in their career pool', () => {
    const visible = CAREER_LIST.filter((c) => {
      if (!c.availableInSocieties || c.availableInSocieties.length === 0) return true;
      return c.availableInSocieties.includes('third_imperium');
    });
    expect(visible.map((c) => c.id)).not.toContain('confederation_navy');
  });

  it('Confederation Traveller has BOTH Solomani Party and Confederation Navy available', () => {
    const visible = CAREER_LIST.filter((c) => {
      if (!c.availableInSocieties || c.availableInSocieties.length === 0) return true;
      return c.availableInSocieties.includes('solomani_confederation');
    });
    const ids = visible.map((c) => c.id);
    expect(ids).toContain('solomani_party');
    expect(ids).toContain('confederation_navy');
    // Core careers still available too.
    expect(ids).toContain('army');
    expect(ids).toContain('agent');
  });
});
