import { useCallback, useEffect, useState } from 'react';

/**
 * Visual theme. Persisted to localStorage as `traveller:theme`.
 *  - 'lbb'      Classic Little Black Books — light cream-ish bg, deep red primary, near-black text.
 *  - 'imperial' Dark — Imperial computer terminal feel; saturated red on stone-near-black.
 *  - 'system'   Follow the OS preference (prefers-color-scheme).
 */
export type Theme = 'lbb' | 'imperial' | 'system';

const STORAGE_KEY = 'traveller:theme';
const DEFAULT_THEME: Theme = 'lbb';

const isValidTheme = (v: unknown): v is Theme =>
  v === 'lbb' || v === 'imperial' || v === 'system';

const loadTheme = (): Theme => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isValidTheme(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const prefersDark = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

/** Whether the given theme should resolve to dark right now (system follows OS). */
export const themeIsDark = (theme: Theme): boolean => {
  if (theme === 'imperial') return true;
  if (theme === 'lbb') return false;
  return prefersDark();
};

const applyClass = (dark: boolean) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (dark) root.classList.add('dark');
  else root.classList.remove('dark');
};

/**
 * Theme state hook. Reads the stored preference on mount, applies the `.dark`
 * class to <html> for Tailwind/CSS overrides, persists changes back to
 * localStorage, and (for 'system') reacts to OS-level dark-mode flips.
 */
export const useTheme = (): { theme: Theme; setTheme: (t: Theme) => void } => {
  const [theme, setThemeState] = useState<Theme>(loadTheme);

  useEffect(() => {
    applyClass(themeIsDark(theme));
  }, [theme]);

  // Live OS preference updates only matter when the user picked 'system'.
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyClass(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore — private mode etc. */
    }
    setThemeState(next);
  }, []);

  return { theme, setTheme };
};

// Exported for tests / the pre-React init script.
export const __THEME_STORAGE_KEY = STORAGE_KEY;
export const __THEME_DEFAULT = DEFAULT_THEME;
