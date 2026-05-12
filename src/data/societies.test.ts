// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SOCIETIES } from './societies';
import type { SocietyId } from '../types';

describe('Society roster', () => {
  it('includes every SocietyId the type allows', () => {
    const ids: SocietyId[] = [
      'third_imperium', 'solomani_confederation', 'aslan_hierate',
      'hiver_federation', 'zhodani_consulate', 'two_thousand_worlds',
      'vargr_extents', 'other',
    ];
    for (const id of ids) {
      expect(SOCIETIES[id], `${id} missing`).toBeDefined();
      expect(SOCIETIES[id].id).toBe(id);
    }
  });

  it('every published society has a source; "other" is allowed to skip it', () => {
    for (const [id, s] of Object.entries(SOCIETIES)) {
      if (id === 'other') continue;
      expect(s.source, `${id} missing source`).toBeTruthy();
    }
  });

  it('every society has a non-empty description', () => {
    for (const [id, s] of Object.entries(SOCIETIES)) {
      expect(s.description.length, `${id} description too short`).toBeGreaterThan(40);
    }
  });
});
