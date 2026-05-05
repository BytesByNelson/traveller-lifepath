import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreCareerEducationStep } from './PreCareerEducationStep';
import { dieValue, newCharacter } from '../engine';
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

/**
 * Stub Math.random to return a scripted sequence so the 2D event roll inside
 * startPreCareerEvent is deterministic. Each die is `1 + floor(rng() * 6)`, so
 * passing dieValue(n) makes the next die land on n.
 */
const useScriptedRandom = (values: number[]) => {
  let i = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    if (i >= values.length) throw new Error('scripted Math.random exhausted');
    return values[i++]!;
  });
};

describe('Pre-career education — outcome screens', () => {
  beforeEach(() => {
    // Default: no random calls expected. Tests that need rolls override with their own script.
    vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random called without a scripted value');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an entry-result card after a successful entry roll, then routes through event → graduation result', async () => {
    // Entry is entered manually — no rng calls. Pre-career event then rolls 2D = 5
    // (Carouse 1), which drains immediately and auto-advances to event_outcome.
    useScriptedRandom([dieValue(2), dieValue(3)]);

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

    // Continue to the pre-career event. Scripted 2D = 5 → "party as much as study, gain
    // Carouse 1" — no prompt — so the wizard auto-advances to event_outcome.
    await user.click(screen.getByRole('button', { name: /Continue → Pre-career event/ }));
    rerender(
      <PreCareerEducationStep
        character={current}
        onChange={onChange}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    // Now we should be on the result screen with the event 5 rulebook text.
    expect(screen.getByRole('heading', { level: 2, name: /Pre-career event — result/ })).toBeInTheDocument();
    expect(screen.getByText(/Event roll: 5/)).toBeInTheDocument();
    expect(screen.getByText(/party as much as you study/i)).toBeInTheDocument();
  });

  it('shows a denial card after a failed entry, with an option to return to the chooser', async () => {
    // Entry fails on manual 2 — no event roll happens, so no rng calls expected.
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
