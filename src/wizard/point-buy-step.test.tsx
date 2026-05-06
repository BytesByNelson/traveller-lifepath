import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacteristicsStep } from './CharacteristicsStep';
import { newCharacter } from '../engine';
import type { Character } from '../types';

const seed = (): Character => {
  const c = newCharacter('id', 'Allocator', 'human');
  return {
    ...c,
    wizardState: { ...(c.wizardState ?? { step: 'characteristics' }), rollMode: 'point_buy' },
  };
};

/** Render the step with a parent that re-syncs the captured character back through props
 *  on every onChange — mirrors how WizardPage threads the live character to the step. */
const renderControlled = () => {
  let current = seed();
  const onChange = vi.fn((next: Character) => {
    current = next;
    rerender(<CharacteristicsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />);
  });
  const { rerender } = render(
    <CharacteristicsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
  );
  return { get: () => current };
};

describe('CharacteristicsStep — point-buy mode', () => {
  it('opens balanced (42 / 42) and Continue is enabled by default', () => {
    renderControlled();
    expect(screen.getByText(/Spent/)).toBeInTheDocument();
    expect(screen.getByText(/Balanced — ready to continue/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue → Background skills/ })).not.toBeDisabled();
  });

  it('shows over-budget messaging and disables Continue when total exceeds 42', async () => {
    const user = userEvent.setup();
    const ctrl = renderControlled();
    // Bump STR 7 → 9 (two clicks). Total: 44 = +2 over.
    const incSTR = () => screen.getAllByLabelText(/Increase /)[0]!;
    await user.click(incSTR());
    await user.click(incSTR());
    expect(ctrl.get().baseCharacteristics.STR).toBe(9);
    expect(screen.getByText(/Over budget by 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue → Background skills/ })).toBeDisabled();
  });

  it('clamps at the minimum (2) — − button disables at the floor', async () => {
    const user = userEvent.setup();
    const ctrl = renderControlled();
    // STR 7 → 2 takes 5 clicks.
    const decSTR = () => screen.getAllByLabelText(/Decrease /)[0]!;
    for (let i = 0; i < 5; i++) await user.click(decSTR());
    expect(ctrl.get().baseCharacteristics.STR).toBe(2);
    expect(decSTR()).toBeDisabled();
  });

  it('balances back to 42 when an over-budget allocation is offset elsewhere', async () => {
    const user = userEvent.setup();
    const ctrl = renderControlled();
    // STR +3, SOC -3 → total still 42.
    const incSTR = () => screen.getAllByLabelText(/Increase /)[0]!;
    const decSOC = () => screen.getAllByLabelText(/Decrease /)[5]!;
    for (let i = 0; i < 3; i++) await user.click(incSTR());
    for (let i = 0; i < 3; i++) await user.click(decSOC());
    expect(ctrl.get().baseCharacteristics.STR).toBe(10);
    expect(ctrl.get().baseCharacteristics.SOC).toBe(4);
    expect(screen.getByText(/Balanced — ready to continue/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue → Background skills/ })).not.toBeDisabled();
  });
});
