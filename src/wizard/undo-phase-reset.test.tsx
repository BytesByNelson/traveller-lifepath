import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreCareerEducationStep } from './PreCareerEducationStep';
import { newCharacter } from '../engine';
import type { Character } from '../types';

const seed = (overrides: Partial<Character['characteristics']> = {}): Character => ({
  ...newCharacter('id', 'Cadet', 'human'),
  characteristics: {
    STR: 7,
    DEX: 7,
    END: 9,
    INT: 9,
    EDU: 9,
    SOC: 7,
    ...overrides,
  },
});

describe('Undo across wizard local state', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random called without scripted value');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resets PreCareerEducationStep to the chooser when the character is undone', async () => {
    const c = seed();
    const user = userEvent.setup();
    let current = c;
    const onChange = vi.fn((next: Character) => {
      current = next;
    });
    const { rerender } = render(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // Walk into Army Academy entry, fail the roll, land on entry_outcome (failure card).
    await user.click(screen.getByRole('button', { name: /Army Academy/ }));
    rerender(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    const entryInput = screen.getByPlaceholderText(/2–12|2-12/);
    await user.type(entryInput, '2');
    await user.click(screen.getByRole('button', { name: /Enter result/i }));
    rerender(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // entry_outcome failure card is up.
    expect(screen.getByText(/Application denied/)).toBeInTheDocument();
    // Roll log has the failed entry roll.
    expect(current.rollLog.length).toBeGreaterThan(0);

    // Simulate Undo: parent rewinds to a snapshot taken before the entry roll.
    // We reproduce that by handing the wizard a character whose rollLog is empty.
    const undone: Character = { ...current, rollLog: [] };
    current = undone;
    await act(async () => {
      rerender(
        <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
      );
    });

    // The "Application denied" card should be gone — the hook noticed rollLog
    // shrank and reset phase to choose, so the academy chooser is back on screen.
    expect(screen.queryByText(/Application denied/)).not.toBeInTheDocument();
    expect(screen.getByText(/Pre-career education/)).toBeInTheDocument();
    // Track buttons should be visible again.
    expect(screen.getByRole('button', { name: /Army Academy/ })).toBeInTheDocument();
  });

  it('does NOT reset when character data grows (normal forward navigation)', async () => {
    const c = seed();
    const user = userEvent.setup();
    let current = c;
    const onChange = vi.fn((next: Character) => {
      current = next;
    });
    const { rerender } = render(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /Army Academy/ }));
    rerender(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // Make the entry roll succeed.
    const entryInput = screen.getByPlaceholderText(/2–12|2-12/);
    await user.type(entryInput, '8');
    await user.click(screen.getByRole('button', { name: /Enter result/i }));
    rerender(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // Forward navigation: rollLog grew. The success card should stay on screen,
    // not reset to the chooser.
    expect(screen.getByText(/You're in!/)).toBeInTheDocument();
  });
});
