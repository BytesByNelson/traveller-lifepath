import { useCallback, useEffect, useState } from 'react';

/**
 * Font-size scaling for accessibility. Sets a class on <html> which the CSS
 * picks up to bump the root font-size — Tailwind's rem-based utilities
 * (text-sm, text-base, etc.) all scale proportionally. Persisted to
 * localStorage so the choice survives reloads.
 */
export type FontSize = 'normal' | 'large' | 'larger';

const STORAGE_KEY = 'traveller:fontSize';
const DEFAULT_SIZE: FontSize = 'normal';
const ORDER: FontSize[] = ['normal', 'large', 'larger'];

const isValid = (v: unknown): v is FontSize =>
  v === 'normal' || v === 'large' || v === 'larger';

const load = (): FontSize => {
  if (typeof window === 'undefined') return DEFAULT_SIZE;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isValid(v) ? v : DEFAULT_SIZE;
  } catch {
    return DEFAULT_SIZE;
  }
};

const applyClass = (size: FontSize) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('font-large', 'font-larger');
  if (size === 'large') root.classList.add('font-large');
  if (size === 'larger') root.classList.add('font-larger');
};

export const useFontSize = (): {
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  cycle: () => void;
} => {
  const [fontSize, setFontSizeState] = useState<FontSize>(load);

  useEffect(() => {
    applyClass(fontSize);
  }, [fontSize]);

  const setFontSize = useCallback((next: FontSize) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode etc. */
    }
    setFontSizeState(next);
  }, []);

  const cycle = useCallback(() => {
    setFontSize(ORDER[(ORDER.indexOf(fontSize) + 1) % ORDER.length]!);
  }, [fontSize, setFontSize]);

  return { fontSize, setFontSize, cycle };
};

// Exported for tests and the pre-React bootstrap script in index.html.
export const __FS_STORAGE_KEY = STORAGE_KEY;
export const __FS_DEFAULT = DEFAULT_SIZE;
export const __FS_ORDER = ORDER;
