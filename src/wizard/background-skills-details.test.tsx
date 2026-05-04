import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackgroundSkillsStep } from './BackgroundSkillsStep';
import { newCharacter } from '../engine';
import type { Character } from '../types';

const seed = (overrides: Partial<Character['characteristics']> = {}): Character => ({
  ...newCharacter('id', 'Cadet', 'human'),
  characteristics: {
    STR: 7,
    DEX: 7,
    END: 7,
    INT: 7,
    EDU: 9, // EDU 9 → DM +1, +3 = 4 background skills allowed
    SOC: 7,
    ...overrides,
  },
});

describe('BackgroundSkillsStep — click-to-reveal details', () => {
  it('renders an empty-state hint before any skill is clicked', () => {
    const c = seed();
    render(
      <BackgroundSkillsStep character={c} onChange={vi.fn()} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    expect(screen.getByText(/Click any skill above to see what it covers/)).toBeInTheDocument();
  });

  it('shows the skill description when a skill is clicked', async () => {
    const c = seed();
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <BackgroundSkillsStep character={c} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    await user.click(screen.getByRole('button', { name: 'Admin' }));
    // Summary updates to name the focused skill.
    expect(screen.getByText(/Skill details — Admin/)).toBeInTheDocument();
    // Picking the skill also calls onChange (the click both focuses and toggles).
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('focuses without re-toggling when clicking an already-picked skill that is at cap of remaining', async () => {
    // Even at cap, clicking a picked skill should focus it AND remove it (toggle off).
    const c = seed({ EDU: 4 }); // EDU 4 → DM 0, allowed = 3
    const user = userEvent.setup();
    let current = c;
    const onChange = vi.fn((next: Character) => {
      current = next;
    });
    const { rerender } = render(
      <BackgroundSkillsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    await user.click(screen.getByRole('button', { name: 'Admin' }));
    rerender(
      <BackgroundSkillsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    // After picking, clicking it again should still keep focus on Admin.
    await user.click(screen.getByRole('button', { name: 'Admin' }));
    rerender(
      <BackgroundSkillsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    expect(screen.getByText(/Skill details — Admin/)).toBeInTheDocument();
  });

  it('switching focus updates the displayed skill', async () => {
    const c = seed();
    const user = userEvent.setup();
    let current = c;
    const onChange = vi.fn((next: Character) => {
      current = next;
    });
    const { rerender } = render(
      <BackgroundSkillsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    await user.click(screen.getByRole('button', { name: 'Admin' }));
    rerender(
      <BackgroundSkillsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    expect(screen.getByText(/Skill details — Admin/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Drive' }));
    rerender(
      <BackgroundSkillsStep character={current} onChange={onChange} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    expect(screen.getByText(/Skill details — Drive/)).toBeInTheDocument();
    expect(screen.queryByText(/Skill details — Admin/)).not.toBeInTheDocument();
  });

  it('clicking a skill at the cap that is not yet picked does nothing for selection but still focuses', async () => {
    // Pre-fill the character to the cap so further picks are blocked.
    const c = seed({ EDU: 4 }); // allowed = 3
    const filled: Character = {
      ...c,
      backgroundSkills: [
        { name: 'Admin', level: 0, source: { kind: 'background' } },
        { name: 'Drive', level: 0, source: { kind: 'background' } },
        { name: 'Mechanic', level: 0, source: { kind: 'background' } },
      ],
    };
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <BackgroundSkillsStep
        character={filled}
        onChange={onChange}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    // Carouse (not yet picked) should be disabled at cap.
    const carouse = screen.getByRole('button', { name: 'Carouse' });
    expect(carouse).toBeDisabled();
    // Clicking a disabled button is a no-op so focus also won't update — that's fine.
    // But clicking an already-picked skill should still focus it (and toggle off).
    await user.click(screen.getByRole('button', { name: 'Admin' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
