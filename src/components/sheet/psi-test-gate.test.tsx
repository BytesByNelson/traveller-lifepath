import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PsiTestButton } from './PsiTestButton';
import { newCharacter } from '../../engine';
import type { Character } from '../../types';

describe('PsiTestButton — eligibility gating', () => {
  const baseCharacter: Character = {
    ...newCharacter('id', 'Test', 'human'),
  };

  it('does not render when no eligibility', () => {
    render(<PsiTestButton character={baseCharacter} onChange={vi.fn()} />);
    expect(screen.queryByText('Test PSI')).not.toBeInTheDocument();
  });

  it('renders when psionics enabled at creation', () => {
    const c: Character = {
      ...baseCharacter,
      wizardState: { step: 'basics', psionicsEnabled: true },
    };
    render(<PsiTestButton character={c} onChange={vi.fn()} />);
    expect(screen.getByText('Test PSI')).toBeInTheDocument();
  });

  it('renders when psionEligibility flag is set later', () => {
    const c: Character = {
      ...baseCharacter,
      wizardState: { step: 'career_term', psionEligibility: true },
    };
    render(<PsiTestButton character={c} onChange={vi.fn()} />);
    expect(screen.getByText('Test PSI')).toBeInTheDocument();
  });

  it('does not render once PSI is set', () => {
    const c: Character = {
      ...baseCharacter,
      wizardState: { step: 'basics', psionicsEnabled: true },
      psi: { max: 8, current: 8 },
    };
    render(<PsiTestButton character={c} onChange={vi.fn()} />);
    expect(screen.queryByText('Test PSI')).not.toBeInTheDocument();
  });
});
