import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillPackageStep } from './SkillPackageStep';
import { newCharacter } from '../engine';
import type { Character } from '../types';

const seed = (): Character => newCharacter('id', 'Cadet', 'human');

describe('SkillPackageStep — checklist subset selection', () => {
  it('explains that the package is shared by the group', () => {
    render(<SkillPackageStep character={seed()} onChange={vi.fn()} onDone={vi.fn()} />);
    expect(
      screen.getByText(/skill package is shared by the whole group/i),
    ).toBeInTheDocument();
  });

  it('after picking a package, every skill is checked by default', async () => {
    const user = userEvent.setup();
    render(<SkillPackageStep character={seed()} onChange={vi.fn()} onDone={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Traveller/ }));
    // Eight skills, all checked.
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(8);
    for (const b of boxes) expect(b).toBeChecked();
  });

  it('applying with a subset only grants the checked skills', async () => {
    const user = userEvent.setup();
    let captured: Character | null = null;
    const onChange = (c: Character) => {
      captured = c;
    };
    render(<SkillPackageStep character={seed()} onChange={onChange} onDone={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Traveller/ }));
    // Uncheck Pilot and Stealth — leave the other six.
    const pilot = screen.getByRole('checkbox', { name: /Pilot 1/ });
    const stealth = screen.getByRole('checkbox', { name: /Stealth 1/ });
    await user.click(pilot);
    await user.click(stealth);
    await user.click(screen.getByRole('button', { name: /Apply 6 skills/ }));

    expect(captured).not.toBeNull();
    const names = captured!.backgroundSkills.map((s) => s.name);
    // Six skills granted; Pilot and Stealth NOT granted.
    expect(names).not.toContain('Pilot');
    expect(names).not.toContain('Stealth');
    expect(names.length).toBe(6);
  });

  it('"None" button clears all checkboxes and disables Apply', async () => {
    const user = userEvent.setup();
    render(<SkillPackageStep character={seed()} onChange={vi.fn()} onDone={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Traveller/ }));
    await user.click(screen.getByRole('button', { name: 'None' }));
    for (const b of screen.getAllByRole('checkbox')) expect(b).not.toBeChecked();
    expect(screen.getByRole('button', { name: /Apply/ })).toBeDisabled();
  });

  it('"All" button re-checks every box after clearing', async () => {
    const user = userEvent.setup();
    render(<SkillPackageStep character={seed()} onChange={vi.fn()} onDone={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Traveller/ }));
    await user.click(screen.getByRole('button', { name: 'None' }));
    await user.click(screen.getByRole('button', { name: 'All' }));
    for (const b of screen.getAllByRole('checkbox')) expect(b).toBeChecked();
  });
});
