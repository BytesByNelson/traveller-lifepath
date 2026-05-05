import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    END: 7,
    INT: 7,
    EDU: 9,
    SOC: 7,
    ...overrides,
  },
});

describe('University entry failure', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random called without scripted value');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does NOT grant the picked skills if the player fails the entry roll', async () => {
    const c = seed();
    const user = userEvent.setup();
    let current = c;
    const onChange = vi.fn((next: Character) => {
      current = next;
    });
    const { rerender } = render(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // University.
    await user.click(screen.getByRole('button', { name: /University/ }));
    rerender(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // Pick level-0 = Animals, level-1 = Art.
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0]!, 'Animals');
    await user.selectOptions(selects[1]!, 'Art');
    await user.click(screen.getByRole('button', { name: /Continue → Entry roll/ }));
    rerender(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // At this point the picks were SAVED but skills should NOT yet be on the character.
    expect(current.backgroundSkills.find((s) => s.name === 'Animals')).toBeUndefined();
    expect(current.backgroundSkills.find((s) => s.name === 'Art')).toBeUndefined();
    // Education taken flag should also still be unset until success.
    expect(current.wizardState?.preCareerEducationTaken).toBeFalsy();

    // Force a failing entry roll: 2 vs target 6+ (university).
    const entryInput = screen.getByPlaceholderText(/2–12|2-12/);
    await user.type(entryInput, '2');
    await user.click(screen.getByRole('button', { name: /Enter result/i }));
    rerender(
      <PreCareerEducationStep character={current} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );

    // Application denied screen is up.
    expect(screen.getByText(/Application denied/)).toBeInTheDocument();
    // No phantom skills landed on the character.
    expect(current.backgroundSkills.find((s) => s.name === 'Animals')).toBeUndefined();
    expect(current.backgroundSkills.find((s) => s.name === 'Art')).toBeUndefined();
    // Education-taken flag should also remain unset.
    expect(current.wizardState?.preCareerEducationTaken).toBeFalsy();
  });
});
