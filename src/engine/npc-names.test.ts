// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generateNpcName } from './npc-names';

describe('generateNpcName — species + society aware', () => {
  // Deterministic rng: always picks the first entry in every pool.
  const firstPick = () => 0;

  it('Vargr species always gets Vargr names regardless of society', () => {
    const a = generateNpcName('vargr', 'third_imperium', firstPick);
    const b = generateNpcName('vargr', 'solomani_confederation', firstPick);
    const c = generateNpcName('vargr', 'vargr_extents', firstPick);
    // All Vargr names use the documented heavy-consonant pattern.
    expect(a).toMatch(/\w+ \w+/);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('Aslan species always gets Aslan clan names', () => {
    const name = generateNpcName('aslan', 'third_imperium', firstPick);
    expect(name).toMatch(/\w+ \w+/);
  });

  it('Vilani species gets long-syllable Vilani names', () => {
    const name = generateNpcName('vilani', 'third_imperium', firstPick);
    expect(name).toMatch(/\w+ \w+/);
    // First entry of each pool is documented above; deterministic check.
    expect(name).toBe('Akar Akarish');
  });

  it('Sword Worlder species gets Norse-flavoured names', () => {
    const name = generateNpcName('sword_worlder', 'third_imperium', firstPick);
    expect(name).toBe('Aksel Aslaksen');
  });

  it('Bwap species gets a single-name', () => {
    const name = generateNpcName('bwap', 'third_imperium', firstPick);
    // Bwap names are single-token (no space).
    expect(name).not.toContain(' ');
  });

  it('human species in Solomani Confederation gets Terran-heritage names', () => {
    const name = generateNpcName('human', 'solomani_confederation', firstPick);
    expect(name).toBe('Alexandra Alvarez');
  });

  it('human species in Zhodani Consulate gets Zhodani-pattern names', () => {
    const name = generateNpcName('human', 'zhodani_consulate', firstPick);
    expect(name).toBe('Aplats Aplatiezr');
  });

  it('human species in Third Imperium gets the Imperial polyglot stew', () => {
    const name = generateNpcName('human', 'third_imperium', firstPick);
    expect(name).toBe('Alric Aalto');
  });

  it('human species with undefined society falls back to Imperial', () => {
    const name = generateNpcName('human', undefined, firstPick);
    expect(name).toBe('Alric Aalto');
  });

  it('Solomani species ignores society — always Terran-heritage', () => {
    const a = generateNpcName('solomani', 'solomani_confederation', firstPick);
    const b = generateNpcName('solomani', 'third_imperium', firstPick);
    expect(a).toBe(b);
    expect(a).toBe('Alexandra Alvarez');
  });

  it('human species in Aslan Hierate borrows Aslan clan name as last-name', () => {
    // Hierate-resident humans get an Imperial first name + Aslan clan
    // affiliation as a flavour cue.
    const name = generateNpcName('human', 'aslan_hierate', firstPick);
    expect(name.split(' ')[1]).toBe('Aroa'); // first Aslan clan in pool
  });

  it('different rng seeds yield different names', () => {
    const a = generateNpcName('human', 'third_imperium', () => 0);
    const b = generateNpcName('human', 'third_imperium', () => 0.99);
    expect(a).not.toBe(b);
  });
});
