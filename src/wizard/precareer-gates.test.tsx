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
    END: 7,
    INT: 7,
    EDU: 7,
    SOC: 7,
    ...overrides,
  },
});

describe('Pre-career education entry gates', () => {
  it('shows the player\'s stat next to each requirement', () => {
    const c = seed({ EDU: 9, END: 8, INT: 10 });
    render(
      <PreCareerEducationStep
        character={c}
        onChange={vi.fn()}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText(/EDU 6\+ — you have EDU 9/)).toBeInTheDocument();
    expect(screen.getByText(/END 7\+ — you have END 8/)).toBeInTheDocument();
    expect(screen.getByText(/END 8\+ — you have END 8/)).toBeInTheDocument();
    expect(screen.getByText(/INT 8\+ — you have INT 10/)).toBeInTheDocument();
  });

  it('disables University when EDU < 6', () => {
    const c = seed({ EDU: 5 });
    render(
      <PreCareerEducationStep character={c} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );
    // The University tile should not be a clickable button anymore.
    expect(screen.queryByRole('button', { name: 'University' })).not.toBeInTheDocument();
    // It should be present as a labelled disabled card.
    expect(screen.getByLabelText(/University \(disabled — Requires EDU 6\+\)/)).toBeInTheDocument();
    // Disabled-reason copy is visible inline.
    expect(screen.getByText('Requires EDU 6+')).toBeInTheDocument();
  });

  it('disables Army Academy when END < 7', () => {
    const c = seed({ END: 6 });
    render(
      <PreCareerEducationStep character={c} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: 'Army Academy' })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Army Academy \(disabled/)).toBeInTheDocument();
  });

  it('disables Marine Academy when END < 8', () => {
    const c = seed({ END: 7 });
    render(
      <PreCareerEducationStep character={c} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );
    // Army should still be enabled at END 7.
    expect(screen.getByRole('button', { name: /Army Academy/ })).toBeEnabled();
    // Marines should be disabled.
    expect(screen.queryByRole('button', { name: 'Marine Academy' })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Marine Academy \(disabled/)).toBeInTheDocument();
  });

  it('disables Navy Academy when INT < 8', () => {
    const c = seed({ INT: 7 });
    render(
      <PreCareerEducationStep character={c} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: 'Navy Academy' })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Navy Academy \(disabled/)).toBeInTheDocument();
  });

  it('shows the "no academies available" hint when every track is blocked', () => {
    const c = seed({ EDU: 4, END: 4, INT: 4 });
    render(
      <PreCareerEducationStep character={c} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );
    expect(screen.getByText(/None of the academies will accept this Traveller/)).toBeInTheDocument();
  });

  it('eligible Travellers can still click into University', async () => {
    const c = seed({ EDU: 7 });
    const user = userEvent.setup();
    render(
      <PreCareerEducationStep character={c} onChange={vi.fn()} onSkip={vi.fn()} onComplete={vi.fn()} />,
    );
    await user.click(screen.getByRole('button', { name: /University/ }));
    // After clicking we land on the skill-pick screen.
    expect(screen.getByText('University — pick skills')).toBeInTheDocument();
  });
});
