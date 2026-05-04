// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { migrate, slugifyForFilename } from './migrations';
import { newCharacter } from '../engine';

describe('migrate', () => {
  it('passes a valid v1 character through', () => {
    const c = newCharacter('id', 'Erik', 'human');
    const result = migrate(c);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.character.id).toBe('id');
  });

  it('rejects missing schemaVersion', () => {
    const result = migrate({ id: 'x', name: 'Erik' });
    expect(result).toEqual({ ok: false, reason: 'Missing schemaVersion' });
  });

  it('rejects unknown schemaVersion with the version in the reason', () => {
    const result = migrate({ schemaVersion: 99, id: 'x' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/99/);
  });

  it('rejects non-objects', () => {
    expect(migrate(null).ok).toBe(false);
    expect(migrate('string').ok).toBe(false);
    expect(migrate([]).ok).toBe(false);
  });

  it('reports specific missing fields', () => {
    const result = migrate({ schemaVersion: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/id/);
      expect(result.reason).toMatch(/name/);
      expect(result.reason).toMatch(/species/);
      expect(result.reason).toMatch(/characteristics/);
    }
  });

  it('rejects bad species', () => {
    const c = { ...newCharacter('id', 'x', 'human'), species: 'klingon' };
    const result = migrate(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/species/);
  });

  it('rejects bad characteristics shape', () => {
    const c = newCharacter('id', 'x', 'human');
    const broken = { ...c, characteristics: { STR: 'oops', DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 } };
    const result = migrate(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/STR/);
  });

  it('round-trips through JSON cleanly', () => {
    const c = newCharacter('id', 'Erik', 'aslan');
    const json = JSON.parse(JSON.stringify(c));
    const result = migrate(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.character.species).toBe('aslan');
      // Aslan's STR+2 / DEX-2 already applied by newCharacter
      expect(result.character.characteristics.STR).toBe(c.characteristics.STR);
    }
  });
});

describe('slugifyForFilename', () => {
  it('lowercases and dasherizes', () => {
    expect(slugifyForFilename('Captain Erik Reign', 'fb')).toBe('captain-erik-reign');
  });
  it('trims edge dashes', () => {
    expect(slugifyForFilename('!!!Erik!!!', 'fb')).toBe('erik');
  });
  it('falls back when result would be empty', () => {
    expect(slugifyForFilename('   ', 'fb-id')).toBe('fb-id');
    expect(slugifyForFilename('!!!', 'fb-id')).toBe('fb-id');
  });
  it('caps length', () => {
    const result = slugifyForFilename('a'.repeat(100), 'fb');
    expect(result.length).toBeLessThanOrEqual(40);
  });
});
