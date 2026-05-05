import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setSaveDebounceForTesting } from '../store/characters';

// Tests assert against localStorage / store state synchronously after upsertCharacter.
// Debouncing is purely a runtime optimisation; turn it off in tests so writes are
// flushed immediately and assertions see the persisted value.
setSaveDebounceForTesting(false);

afterEach(() => {
  cleanup();
});
