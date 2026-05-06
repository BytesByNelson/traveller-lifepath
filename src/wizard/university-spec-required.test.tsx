import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreCareerEducationStep } from './PreCareerEducationStep';
import { newCharacter } from '../engine';
import type { Character } from '../types';

const seed = (overrides: Partial<Character['characteristics']> = {}): Character => ({
  ...newCharacter('id', 'Cadet', 'human'),
  characteristics: {
    STR: 7, DEX: 7, END: 7,
    INT: 9, EDU: 12, // EDU 12 → +1 DM helps the entry roll succeed
    SOC: 9,
    ...overrides,
  },
});

describe('University picker — parent-skill spec is required at level 1', () => {
  beforeEach(() => {
    // Force entry roll to succeed with a high natural so we can assert downstream skill grant.
    let calls = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      // Two calls per 2D roll. We only need entry to pass — return 0.95s for high rolls.
      calls += 1;
      return 0.95 - calls * 0.0001;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('disables Continue when level1 is a parent skill (Profession) and no spec is chosen', async () => {
    const user = userEvent.setup();
    const c = seed();
    render(<PreCareerEducationStep character={c} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /University/i }));

    // Pick Language at level 0, Profession at level 1.
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0]!, 'Language');
    await user.selectOptions(selects[1]!, 'Profession');

    // The spec sub-picker appears with the RAW-citing label.
    expect(
      screen.getByText(/Pick a specialization for Profession/),
    ).toBeInTheDocument();

    // Continue button is disabled until a spec is chosen.
    const cont = screen.getByRole('button', { name: /Continue → Entry roll/ });
    expect(cont).toBeDisabled();
  });

  it('writes the spec onto the granted skill when entry succeeds (no orphan parent at level 1)', async () => {
    const user = userEvent.setup();
    let captured = seed();
    const onChange = (next: Character) => {
      captured = next;
    };
    render(<PreCareerEducationStep character={captured} onChange={onChange} onSkip={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /University/i }));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0]!, 'Language');
    await user.selectOptions(selects[1]!, 'Profession');
    // Spec dropdown is the third combobox now.
    const updatedSelects = screen.getAllByRole('combobox');
    await user.selectOptions(updatedSelects[2]!, 'civil engineering');

    const cont = screen.getByRole('button', { name: /Continue → Entry roll/ });
    expect(cont).not.toBeDisabled();
  });

  it('does NOT show the spec picker for non-parent skills like Admin', async () => {
    const user = userEvent.setup();
    render(<PreCareerEducationStep character={seed()} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /University/i }));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0]!, 'Language');
    await user.selectOptions(selects[1]!, 'Admin');

    expect(screen.queryByText(/Pick a specialization/)).not.toBeInTheDocument();
    // Continue is enabled.
    expect(screen.getByRole('button', { name: /Continue → Entry roll/ })).not.toBeDisabled();
  });
});
