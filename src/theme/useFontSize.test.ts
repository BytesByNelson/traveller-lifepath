// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFontSize, __FS_STORAGE_KEY, __FS_DEFAULT, __FS_ORDER } from './useFontSize';

describe('useFontSize', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('font-large', 'font-larger');
  });
  afterEach(() => {
    document.documentElement.classList.remove('font-large', 'font-larger');
  });

  it('defaults to normal when nothing is stored', () => {
    const { result } = renderHook(() => useFontSize());
    expect(result.current.fontSize).toBe(__FS_DEFAULT);
    expect(__FS_DEFAULT).toBe('normal');
    expect(document.documentElement.classList.contains('font-large')).toBe(false);
    expect(document.documentElement.classList.contains('font-larger')).toBe(false);
  });

  it('reads a stored "large" preference and applies the class on mount', () => {
    localStorage.setItem(__FS_STORAGE_KEY, 'large');
    const { result } = renderHook(() => useFontSize());
    expect(result.current.fontSize).toBe('large');
    expect(document.documentElement.classList.contains('font-large')).toBe(true);
    expect(document.documentElement.classList.contains('font-larger')).toBe(false);
  });

  it('cycle() advances Normal → Large → Larger → Normal', () => {
    const { result } = renderHook(() => useFontSize());
    expect(result.current.fontSize).toBe('normal');

    act(() => result.current.cycle());
    expect(result.current.fontSize).toBe('large');
    expect(document.documentElement.classList.contains('font-large')).toBe(true);

    act(() => result.current.cycle());
    expect(result.current.fontSize).toBe('larger');
    expect(document.documentElement.classList.contains('font-larger')).toBe(true);
    expect(document.documentElement.classList.contains('font-large')).toBe(false);

    act(() => result.current.cycle());
    expect(result.current.fontSize).toBe('normal');
    expect(document.documentElement.classList.contains('font-large')).toBe(false);
    expect(document.documentElement.classList.contains('font-larger')).toBe(false);
  });

  it('persists the choice to localStorage', () => {
    const { result } = renderHook(() => useFontSize());
    act(() => result.current.setFontSize('larger'));
    expect(localStorage.getItem(__FS_STORAGE_KEY)).toBe('larger');
  });

  it('rejects garbage stored values and falls back to default', () => {
    localStorage.setItem(__FS_STORAGE_KEY, 'gigantic');
    const { result } = renderHook(() => useFontSize());
    expect(result.current.fontSize).toBe(__FS_DEFAULT);
  });

  it('exports a three-step cycle order', () => {
    expect(__FS_ORDER).toEqual(['normal', 'large', 'larger']);
  });
});
