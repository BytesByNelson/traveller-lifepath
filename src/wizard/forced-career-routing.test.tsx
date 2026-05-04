import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BetweenTermsStep } from './BetweenTermsStep';
import { CareerTermStep } from './CareerTermStep';
import { newCharacter } from '../engine';
import type { Character, CareerTerm } from '../types';

const completedTerm = (overrides: Partial<CareerTerm> = {}): CareerTerm => ({
  index: 0,
  career: 'agent',
  assignment: 'law_enforcement',
  qualified: true,
  skillRolls: [],
  survival: { rolled: 5, target: 6, success: false }, // failed survival → mishap
  rankAtEnd: 0,
  isOfficer: false,
  termOutcome: 'ejected',
  ...overrides,
});

const seedCharacter = (overrides: Partial<Character> = {}): Character => ({
  ...newCharacter('id', 'Forced', 'human'),
  characteristics: { STR: 8, DEX: 8, END: 8, INT: 9, EDU: 9, SOC: 7 },
  careerHistory: [completedTerm()],
  ...overrides,
});

describe('Forced career routing — between terms', () => {
  it('shows the forced section when wizardState.forcedNextCareer is set', () => {
    const c = seedCharacter({
      wizardState: {
        step: 'between_terms',
        forcedNextCareer: { career: 'prisoner' },
      },
    });
    render(
      <BetweenTermsStep
        character={c}
        onChange={vi.fn()}
        onContinueSame={vi.fn()}
        onChangeAssignment={vi.fn()}
        onChangeCareer={vi.fn()}
        onMusterOut={vi.fn()}
      />,
    );
    expect(screen.getByText(/Forced career switch/)).toBeInTheDocument();
    expect(screen.getByText(/prisoner/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Begin forced term/ })).toBeInTheDocument();
  });

  it('clicking "Begin forced term" clears the flag and routes to the career step', async () => {
    const onChange = vi.fn();
    const onChangeCareer = vi.fn();
    const c = seedCharacter({
      wizardState: {
        step: 'between_terms',
        forcedNextCareer: { career: 'prisoner' },
      },
    });
    const user = userEvent.setup();
    render(
      <BetweenTermsStep
        character={c}
        onChange={onChange}
        onContinueSame={vi.fn()}
        onChangeAssignment={vi.fn()}
        onChangeCareer={onChangeCareer}
        onMusterOut={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Begin forced term/ }));
    expect(onChange).toHaveBeenCalled();
    const updated: Character = onChange.mock.calls[0]![0];
    expect(updated.wizardState?.forcedNextCareer).toBeUndefined();
    expect(updated.wizardState?.step).toBe('career_term');
    expect(onChangeCareer).toHaveBeenCalled();
  });

  it('shows draft section when wizardState.forcedDraft is set', () => {
    const c = seedCharacter({
      wizardState: {
        step: 'between_terms',
        forcedDraft: true,
      },
    });
    render(
      <BetweenTermsStep
        character={c}
        onChange={vi.fn()}
        onContinueSame={vi.fn()}
        onChangeAssignment={vi.fn()}
        onChangeCareer={vi.fn()}
        onMusterOut={vi.fn()}
      />,
    );
    expect(screen.getByText(/Draft:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roll the draft/ })).toBeInTheDocument();
  });
});

describe('Forced career routing — into the career term', () => {
  it('CareerTermStep starts on pick_assignment for the forced career', () => {
    const c = seedCharacter({
      wizardState: {
        step: 'career_term',
        forcedNextCareer: { career: 'prisoner' },
      },
    });
    render(
      <CareerTermStep
        character={c}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onTermComplete={vi.fn()}
      />,
    );
    // Should land directly on the Prisoner pick_assignment header.
    expect(screen.getByText('Prisoner — pick assignment')).toBeInTheDocument();
    // The three Prisoner assignments should be visible.
    expect(screen.getByText('Inmate')).toBeInTheDocument();
    expect(screen.getByText('Thug')).toBeInTheDocument();
    expect(screen.getByText('Fixer')).toBeInTheDocument();
  });

  it('CareerTermStep does NOT start on pick_assignment when no forcing', () => {
    const c = seedCharacter({
      wizardState: { step: 'career_term' },
    });
    render(
      <CareerTermStep
        character={c}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onTermComplete={vi.fn()}
      />,
    );
    expect(screen.queryByText('Prisoner — pick assignment')).not.toBeInTheDocument();
    // Lands on the career picker instead.
    expect(screen.getByText(/pick a career/)).toBeInTheDocument();
  });
});
