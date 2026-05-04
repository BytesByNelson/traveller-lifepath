import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Character } from '../../types';
import { newCharacter } from '../../engine';
import { Sheet } from './Sheet';

const fixture = (overrides: Partial<Character> = {}): Character => {
  const c = newCharacter('id', 'Erik', 'human');
  return {
    ...c,
    name: 'Erik',
    homeworld: 'Regina',
    characteristics: { STR: 9, DEX: 8, END: 10, INT: 12, EDU: 11, SOC: 7 },
    backgroundSkills: [{ name: 'Pilot', spec: 'spacecraft', level: 2, source: { kind: 'manual' } }],
    currentCash: 5000,
    ...overrides,
  };
};

describe('Editable sheet — integration', () => {
  it('editing cash on hand updates the character', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Sheet character={fixture()} onChange={onChange} />);

    const cashButton = screen.getByLabelText('Cash on hand');
    await user.click(cashButton);
    const input = await screen.findByRole('spinbutton', { name: 'Cash on hand' });
    await user.clear(input);
    await user.type(input, '7500{Enter}');

    expect(onChange).toHaveBeenCalled();
    const updated: Character = onChange.mock.calls.at(-1)![0];
    expect(updated.currentCash).toBe(7500);
  });

  it('editing a characteristic updates the character', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Sheet character={fixture()} onChange={onChange} />);

    const strButton = screen.getByLabelText('STR value');
    await user.click(strButton);
    const input = await screen.findByRole('spinbutton', { name: 'STR value' });
    await user.clear(input);
    await user.type(input, '7{Enter}');

    expect(onChange).toHaveBeenCalled();
    const updated: Character = onChange.mock.calls.at(-1)![0];
    expect(updated.characteristics.STR).toBe(7);
  });

  it('editing the name updates the character', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Sheet character={fixture()} onChange={onChange} />);

    const nameButton = screen.getByLabelText('Name');
    await user.click(nameButton);
    const input = await screen.findByRole('textbox', { name: 'Name' });
    await user.clear(input);
    await user.type(input, 'Kathya{Enter}');

    expect(onChange).toHaveBeenCalled();
    const updated: Character = onChange.mock.calls.at(-1)![0];
    expect(updated.name).toBe('Kathya');
  });

  it('adding a connection uses the right type', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Sheet character={fixture()} onChange={onChange} />);

    await user.click(screen.getByLabelText('Add ally'));
    const updated: Character = onChange.mock.calls.at(-1)![0];
    expect(updated.connections.allies).toHaveLength(1);
    expect(updated.connections.allies[0]!.type).toBe('ally');
  });

  it('read-only mode (no onChange) does not render edit affordances', () => {
    render(<Sheet character={fixture()} />);
    expect(screen.queryByLabelText('Cash on hand')).toBeNull();
    expect(screen.queryByText('+ Add ally')).toBeNull();
  });
});
