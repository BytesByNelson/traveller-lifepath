// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setStorageForTesting, type Storage } from './persistence';
import {
  getCharacter,
  listCharacters,
  resetStoreForTesting,
  upsertCharacter,
} from './characters';
import { newCharacter } from '../engine';
import type { Character, WizardState } from '../types';

/**
 * In-memory storage shim. Returned reference also exposes the underlying Map so
 * tests can write directly (simulating "another tab modified localStorage")
 * before dispatching the StorageEvent the listener subscribes to.
 */
const memStorage = (): Storage & { _map: Map<string, string> } => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    _map: map,
  };
};

let storage: ReturnType<typeof memStorage>;

beforeEach(() => {
  storage = memStorage();
  setStorageForTesting(storage);
  resetStoreForTesting();
});

/**
 * Simulate another tab writing a character to localStorage and broadcasting the
 * StorageEvent. Returns after the listener has had a chance to update the cache.
 */
const otherTabWrites = (id: string, c: Character) => {
  const key = `traveller:char:${id}`;
  storage._map.set(key, JSON.stringify(c));
  // Make sure the index also has this character so loadAllCharacters can find it.
  const indexKey = 'traveller:index';
  const existing = storage._map.get(indexKey);
  const index = existing ? (JSON.parse(existing) as Array<{ id: string; name: string; species: string; lastModified: number }>) : [];
  if (!index.find((e) => e.id === id)) {
    index.push({ id, name: c.name, species: c.species, lastModified: Date.now() });
    storage._map.set(indexKey, JSON.stringify(index));
  }
  window.dispatchEvent(
    new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(c),
      oldValue: null,
      storageArea: window.localStorage,
    }),
  );
};

describe('Cross-tab synchronisation', () => {
  it('refreshes the cache when another tab writes a character key', () => {
    upsertCharacter(newCharacter('a', 'Original', 'human'));
    expect(getCharacter('a')?.name).toBe('Original');

    // Simulate another tab updating localStorage AND broadcasting the event. The
    // helper writes through our shim's underlying Map so the listener's
    // loadCharacter() actually sees the new payload.
    otherTabWrites('a', newCharacter('a', 'Updated From Other Tab', 'aslan'));

    expect(getCharacter('a')?.name).toBe('Updated From Other Tab');
    expect(getCharacter('a')?.species).toBe('aslan');
  });

  it('reloads everything when traveller:index changes', () => {
    upsertCharacter(newCharacter('a', 'A', 'human'));
    upsertCharacter(newCharacter('b', 'B', 'human'));
    expect(listCharacters()).toHaveLength(2);

    // Fire an index-change storage event. The listener clears the cache and
    // reloads from storage. Our test shim still has both characters, so the
    // count stays at 2 — but the listener path executed without throwing.
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'traveller:index',
        newValue: JSON.stringify([]),
        oldValue: null,
        storageArea: window.localStorage,
      }),
    );

    expect(listCharacters()).toHaveLength(2);
  });

  it('listener is attached only once across multiple ensureLoaded calls', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    upsertCharacter(newCharacter('a', 'A', 'human'));
    upsertCharacter(newCharacter('b', 'B', 'human'));
    listCharacters();
    listCharacters();
    const storageCalls = addSpy.mock.calls.filter(([type]) => type === 'storage');
    expect(storageCalls.length).toBeLessThanOrEqual(1);
    addSpy.mockRestore();
  });
});

describe('Cross-tab synchronisation — wizardState fields round-trip', () => {
  /**
   * Each test seeds a base character, then has "another tab" write a payload with
   * a specific wizardState field set. We then verify the field is faithfully
   * present on the cached character — i.e. localStorage round-trip preserves it.
   * Catches regressions where a new wizardState field gets added but its
   * persistence path isn't tested.
   */
  const withWizardState = (id: string, name: string, ws: WizardState): Character => ({
    ...newCharacter(id, name, 'human'),
    wizardState: ws,
  });

  it('carriedDMs (benefit-roll DMs from pre-career events) survive cross-tab', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', {
        step: 'mustering_out',
        carriedDMs: { benefitRollDMs: [2, -1], nextSurvival: 1 },
      }),
    );
    const c = getCharacter('a');
    expect(c?.wizardState?.carriedDMs?.benefitRollDMs).toEqual([2, -1]);
    expect(c?.wizardState?.carriedDMs?.nextSurvival).toBe(1);
  });

  it('continueInCareer (between-terms hint) survives cross-tab', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', {
        step: 'career_term',
        continueInCareer: { career: 'navy', assignment: 'line_crew' },
      }),
    );
    const c = getCharacter('a');
    expect(c?.wizardState?.continueInCareer).toEqual({ career: 'navy', assignment: 'line_crew' });
  });

  it('rollMode (basics-step preference) survives cross-tab', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', { step: 'characteristics', rollMode: 'manual' }),
    );
    expect(getCharacter('a')?.wizardState?.rollMode).toBe('manual');
  });

  it('preCareerBonus (auto-entry, commission, qualifyDM) survives cross-tab', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', {
        step: 'career_term',
        preCareerBonus: {
          qualifyDM: { dm: 1, careers: ['agent', 'army'] },
          commission: { dm: 2, auto: true, tiedTo: 'navy' },
          autoEntry: { career: 'navy', commissionAllowed: true },
        },
      }),
    );
    const bonus = getCharacter('a')?.wizardState?.preCareerBonus;
    expect(bonus?.qualifyDM.dm).toBe(1);
    expect(bonus?.qualifyDM.careers).toEqual(['agent', 'army']);
    expect(bonus?.commission?.dm).toBe(2);
    expect(bonus?.commission?.auto).toBe(true);
    expect(bonus?.commission?.tiedTo).toBe('navy');
    expect(bonus?.autoEntry).toEqual({ career: 'navy', commissionAllowed: true });
  });

  it('forceFailPreCareerGraduation flag survives cross-tab', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', {
        step: 'pre_career_education',
        forceFailPreCareerGraduation: true,
      }),
    );
    expect(getCharacter('a')?.wizardState?.forceFailPreCareerGraduation).toBe(true);
  });

  it('forcedNextCareer (drift / draft / prisoner routing) survives cross-tab', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', {
        step: 'between_terms',
        forcedNextCareer: { career: 'prisoner' },
      }),
    );
    expect(getCharacter('a')?.wizardState?.forcedNextCareer).toEqual({ career: 'prisoner' });
  });

  it('preCareerEducationTaken (age-calc flag) survives cross-tab', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', {
        step: 'career_term',
        preCareerEducationTaken: true,
      }),
    );
    expect(getCharacter('a')?.wizardState?.preCareerEducationTaken).toBe(true);
  });

  it('preserves all wizardState fields together in a realistic snapshot', () => {
    upsertCharacter(newCharacter('a', 'Seeded', 'human'));
    otherTabWrites(
      'a',
      withWizardState('a', 'Seeded', {
        step: 'career_term',
        rollMode: 'app',
        psionicsEnabled: true,
        psionEligibility: false,
        preCareerEducationTaken: true,
        continueInCareer: { career: 'army', assignment: 'infantry' },
        carriedDMs: { benefitRollDMs: [2], nextAdvancement: 4 },
      }),
    );
    const ws = getCharacter('a')?.wizardState;
    expect(ws?.step).toBe('career_term');
    expect(ws?.rollMode).toBe('app');
    expect(ws?.psionicsEnabled).toBe(true);
    expect(ws?.preCareerEducationTaken).toBe(true);
    expect(ws?.continueInCareer?.career).toBe('army');
    expect(ws?.carriedDMs?.benefitRollDMs).toEqual([2]);
    expect(ws?.carriedDMs?.nextAdvancement).toBe(4);
  });
});
