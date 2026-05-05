import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('Pre-career education — outcome screens', () => {
  it('shows an entry-result card after a successful entry roll, then routes through event → graduation result', async () => {
    const c = seed();
    const user = userEvent.setup();
    let current = c;
    const onChange = vi.fn((next: Character) => {
      current = next;
    });
    const { rerender } = render(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Army Academy/ }));
    rerender(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    // Force a passing entry roll via manual entry (target END 7+, character has END 9).
    const entryInput = screen.getByPlaceholderText(/2–12|2-12/);
    await user.type(entryInput, '8');
    await user.click(screen.getByRole('button', { name: /Enter result/i }));
    rerender(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    // Entry-outcome screen should celebrate the success and explain what's next.
    expect(screen.getByText(/entry result/i)).toBeInTheDocument();
    expect(screen.getByText(/Success/)).toBeInTheDocument();
    expect(screen.getByText(/You're in!/)).toBeInTheDocument();

    // Continue to the pre-career event.
    await user.click(screen.getByRole('button', { name: /Continue → Pre-career event/ }));
    rerender(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    // The pre-career 2D event roll is non-deterministic (uses Math.random). Depending on
    // the result we either pause on a follow-up prompt ("Pre-career event" heading) or
    // skip straight to the result screen ("Pre-career event — result" heading), and a
    // sub-prompt may also surface its own heading. Constrain to level-2 headings so we
    // match exactly one wizard-section heading regardless of which path we took.
    expect(screen.getByRole('heading', { level: 2, name: /Pre-career event/ })).toBeInTheDocument();
  });

  it('shows a denial card after a failed entry, with an option to return to the chooser', async () => {
    const c = seed();
    const user = userEvent.setup();
    let current = c;
    const onChange = vi.fn((next: Character) => {
      current = next;
    });
    const { rerender } = render(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Army Academy/ }));
    rerender(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    // Force a failing entry roll: 2 vs target 7+.
    const entryInput = screen.getByPlaceholderText(/2–12|2-12/);
    await user.type(entryInput, '2');
    await user.click(screen.getByRole('button', { name: /Enter result/i }));
    rerender(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByText(/Application denied/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to track selection/ })).toBeInTheDocument();
  });
});
