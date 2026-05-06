// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, themeIsDark, __THEME_STORAGE_KEY, __THEME_DEFAULT } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    // Default to light OS preference unless a test overrides.
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to LBB when nothing is stored', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(__THEME_DEFAULT);
    expect(__THEME_DEFAULT).toBe('lbb');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reads a stored Imperial preference and applies the dark class on mount', () => {
    localStorage.setItem(__THEME_STORAGE_KEY, 'imperial');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('imperial');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists the choice and toggles the class when switching to Imperial', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('imperial'));
    expect(localStorage.getItem(__THEME_STORAGE_KEY)).toBe('imperial');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => result.current.setTheme('lbb'));
    expect(localStorage.getItem(__THEME_STORAGE_KEY)).toBe('lbb');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('rejects garbage stored values and falls back to default', () => {
    localStorage.setItem(__THEME_STORAGE_KEY, 'something_unexpected');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(__THEME_DEFAULT);
  });

  it('System mode follows OS — light OS → no dark class', () => {
    localStorage.setItem(__THEME_STORAGE_KEY, 'system');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('System mode follows OS — dark OS → dark class applied', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('dark'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    localStorage.setItem(__THEME_STORAGE_KEY, 'system');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('themeIsDark', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });
  afterEach(() => vi.restoreAllMocks());

  it('lbb → false, imperial → true', () => {
    expect(themeIsDark('lbb')).toBe(false);
    expect(themeIsDark('imperial')).toBe(true);
  });
  it('system follows OS preference', () => {
    expect(themeIsDark('system')).toBe(false);
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('dark'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    expect(themeIsDark('system')).toBe(true);
  });
});
