import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CareerTermStep } from './CareerTermStep';
import { newCharacter } from '../engine';
import type { CareerTerm, Character } from '../types';

const stubTerm = (overrides: Partial<CareerTerm>): CareerTerm => ({
  index: 0,
  career: 'agent',
  assignment: 'law_enforcement',
  qualified: true,
  skillRolls: [],
  survival: { rolled: 8, target: 6, success: true },
  rankAtEnd: 0,
  isOfficer: false,
  termOutcome: 'continued',
  ...overrides,
});

const seed = (overrides: Partial<Character> = {}): Character => ({
  ...newCharacter('id', 'Veteran', 'human'),
  characteristics: { STR: 9, DEX: 9, END: 9, INT: 9, EDU: 9, SOC: 9 },
  ...overrides,
});

describe('Career picker — just-left-career lockout (Mongoose 2022 p13)', () => {
  it('disables the just-left career on the next term, but Drifter and others stay open', () => {
    // Player just finished a term in Army. Next term cannot be Army again.
    const c: Character = {
      ...seed(),
      careerHistory: [stubTerm({ career: 'army', assignment: 'infantry', termOutcome: 'continued' })],
    };
    render(
      <CareerTermStep character={c} onChange={vi.fn()} onBack={vi.fn()} onTermComplete={vi.fn()} />,
    );

    // The Army button is rendered but disabled, and its tooltip names the rule.
    const armyBtn = screen.getByRole('button', { name: /Army/ });
    expect(armyBtn).toBeDisabled();
    expect(armyBtn.getAttribute('title')).toMatch(/Just left Army/);

    // Drifter remains enabled (RAW exempt — always open).
    const drifterBtn = screen.getByRole('button', { name: /Drifter/ });
    expect(drifterBtn).toBeEnabled();

    // Marines, Navy, Agent, etc. are unaffected.
    const navyBtn = screen.getByRole('button', { name: /Navy/ });
    expect(navyBtn).toBeEnabled();
  });

  it('does not lock out Drifter when the just-left career was Drifter', () => {
    // Edge case: drifter ejected from drifter (rare, but the rule says drifter is
    // exempt). They could pick Drifter again next term per RAW.
    const c: Character = {
      ...seed(),
      careerHistory: [stubTerm({ career: 'drifter', assignment: 'wanderer', termOutcome: 'ejected' })],
    };
    render(
      <CareerTermStep character={c} onChange={vi.fn()} onBack={vi.fn()} onTermComplete={vi.fn()} />,
    );
    const drifterBtn = screen.getByRole('button', { name: /Drifter/ });
    expect(drifterBtn).toBeEnabled();
  });

  it('does not apply on the very first term (no prior career to be locked out from)', () => {
    const c: Character = { ...seed(), careerHistory: [] };
    render(
      <CareerTermStep character={c} onChange={vi.fn()} onBack={vi.fn()} onTermComplete={vi.fn()} />,
    );
    // Every non-enforcedEntry career should be enabled. Spot-check Army.
    expect(screen.getByRole('button', { name: /Army/ })).toBeEnabled();
  });
});
