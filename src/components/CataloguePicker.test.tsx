import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CataloguePicker } from './CataloguePicker';

describe('CataloguePicker', () => {
  it('opens a modal of weapons and selecting one fires onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CataloguePicker kind="weapon" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /Pick from catalogue/ }));
    expect(screen.getByLabelText('weapon catalogue')).toBeInTheDocument();

    // Search filter narrows the list
    await user.type(screen.getByLabelText('Search catalogue'), 'cutlass');
    const cutlass = screen.getByText('Cutlass').closest('button');
    expect(cutlass).toBeTruthy();
    await user.click(cutlass!);

    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0]![0]).toMatchObject({ id: 'cutlass', damage: '3D' });
  });

  it('Max TL filter excludes items above the cap', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CataloguePicker kind="armour" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /Pick from catalogue/ }));
    await user.clear(screen.getByLabelText('Max TL'));
    await user.type(screen.getByLabelText('Max TL'), '8');

    expect(screen.queryByText(/Battle Dress/)).not.toBeInTheDocument();
    expect(screen.getByText('Jack')).toBeInTheDocument();
    expect(screen.getByText('Mesh')).toBeInTheDocument();
  });

  it('augment picker selects by id', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CataloguePicker kind="augment" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /Pick from catalogue/ }));
    await user.type(screen.getByLabelText('Search catalogue'), 'wafer');
    const waferTL12 = screen.getAllByText('Wafer Jack')[0]!.closest('button');
    expect(waferTL12).toBeTruthy();
    await user.click(waferTL12!);

    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0]![0].name).toBe('Wafer Jack');
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<CataloguePicker kind="gear" onSelect={() => {}} />);
    await user.click(screen.getByRole('button', { name: /Pick from catalogue/ }));
    expect(screen.getByLabelText('gear catalogue')).toBeInTheDocument();
    await user.click(screen.getByRole('dialog'));
    expect(screen.queryByLabelText('gear catalogue')).not.toBeInTheDocument();
  });
});
