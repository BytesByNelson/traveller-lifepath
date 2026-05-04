import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CareerTermStep } from './CareerTermStep';
import { newCharacter } from '../engine';
import type { Character } from '../types';

const setupCharacter = (overrides: Partial<Character> = {}): Character => ({
  ...newCharacter('id', 'Smoke', 'human'),
  characteristics: { STR: 8, DEX: 8, END: 9, INT: 9, EDU: 9, SOC: 7 },
  ...overrides,
});

describe('CareerTermStep — Psion gating', () => {
  it('Psion is hidden when psionics is not enabled and no eligibility flag', () => {
    const c = setupCharacter();
    render(
      <CareerTermStep
        character={c}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onTermComplete={vi.fn()}
      />,
    );
    expect(screen.queryByText('Psion')).not.toBeInTheDocument();
    expect(screen.getByText(/Psion career hidden/)).toBeInTheDocument();
  });

  it('Psion is visible when psionicsEnabled is set at creation', () => {
    const c = setupCharacter({
      wizardState: { step: 'career_term', psionicsEnabled: true },
    });
    render(
      <CareerTermStep
        character={c}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onTermComplete={vi.fn()}
      />,
    );
    expect(screen.getByText('Psion')).toBeInTheDocument();
  });

  it('Psion is visible when psionEligibility flag is set later (no creation toggle)', () => {
    const c = setupCharacter({
      wizardState: { step: 'career_term', psionEligibility: true },
    });
    render(
      <CareerTermStep
        character={c}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onTermComplete={vi.fn()}
      />,
    );
    expect(screen.getByText('Psion')).toBeInTheDocument();
  });

  it('shows the standard 13 careers when psionics is off (no Psion)', () => {
    const c = setupCharacter();
    render(
      <CareerTermStep
        character={c}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onTermComplete={vi.fn()}
      />,
    );
    // Spot-check a handful — Agent, Marine, Scout always visible
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('Marine')).toBeInTheDocument();
    expect(screen.getByText('Scout')).toBeInTheDocument();
    // Prisoner is shown but disabled (cannot enter voluntarily)
    expect(screen.getByText('Prisoner')).toBeInTheDocument();
  });
});
