import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FontSizeSwitcher } from './FontSizeSwitcher';
import { __FS_STORAGE_KEY } from '../theme/useFontSize';

describe('FontSizeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('font-large', 'font-larger');
  });
  afterEach(() => {
    document.documentElement.classList.remove('font-large', 'font-larger');
  });

  it('renders a single cycle button labelled with the current state', () => {
    render(<FontSizeSwitcher />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAccessibleName(/normal/i);
  });

  it('cycling clicks advance normal → large → larger → normal and update <html>', async () => {
    const user = userEvent.setup();
    render(<FontSizeSwitcher />);
    const btn = screen.getByRole('button');

    await user.click(btn);
    expect(document.documentElement.classList.contains('font-large')).toBe(true);
    expect(localStorage.getItem(__FS_STORAGE_KEY)).toBe('large');

    await user.click(btn);
    expect(document.documentElement.classList.contains('font-larger')).toBe(true);
    expect(document.documentElement.classList.contains('font-large')).toBe(false);
    expect(localStorage.getItem(__FS_STORAGE_KEY)).toBe('larger');

    await user.click(btn);
    expect(document.documentElement.classList.contains('font-large')).toBe(false);
    expect(document.documentElement.classList.contains('font-larger')).toBe(false);
    expect(localStorage.getItem(__FS_STORAGE_KEY)).toBe('normal');
  });
});
