import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableText } from './EditableText';
import { EditableNumber } from './EditableNumber';
import { EditableTextarea } from './EditableTextarea';
import { EditableTable, type ColumnDef } from './EditableTable';

describe('EditableText', () => {
  it('renders the value as a button', () => {
    render(<EditableText value="hello" onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('hello');
  });

  it('clicking switches to input, blurring saves', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableText value="hello" onChange={onChange} ariaLabel="field" />);
    await user.click(screen.getByRole('button'));
    const input = await screen.findByRole('textbox', { name: 'field' });
    await user.clear(input);
    await user.type(input, 'world');
    input.blur();
    expect(onChange).toHaveBeenCalledWith('world');
  });

  it('Enter saves like blur', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableText value="abc" onChange={onChange} ariaLabel="field" />);
    await user.click(screen.getByRole('button'));
    const input = await screen.findByRole('textbox', { name: 'field' });
    await user.clear(input);
    await user.type(input, 'xyz{Enter}');
    expect(onChange).toHaveBeenCalledWith('xyz');
  });

  it('Escape cancels — onChange not called', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableText value="abc" onChange={onChange} ariaLabel="field" />);
    await user.click(screen.getByRole('button'));
    const input = await screen.findByRole('textbox', { name: 'field' });
    await user.clear(input);
    await user.type(input, 'xyz{Escape}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('abc');
  });

  it('shows placeholder when empty', () => {
    render(<EditableText value="" onChange={() => {}} placeholder="(empty)" />);
    expect(screen.getByRole('button')).toHaveTextContent('(empty)');
  });

  it('does not call onChange when value is unchanged', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableText value="hello" onChange={onChange} ariaLabel="field" />);
    await user.click(screen.getByRole('button'));
    const input = await screen.findByRole('textbox', { name: 'field' });
    input.blur();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('EditableNumber', () => {
  it('clamps to min/max', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableNumber value={5} onChange={onChange} min={0} max={10} ariaLabel="num" />);
    await user.click(screen.getByRole('button'));
    const input = await screen.findByRole('spinbutton', { name: 'num' });
    await user.clear(input);
    await user.type(input, '20');
    input.blur();
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('rejects non-integers (does not call onChange)', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableNumber value={5} onChange={onChange} ariaLabel="num" />);
    await user.click(screen.getByRole('button'));
    const input = await screen.findByRole('spinbutton', { name: 'num' });
    await user.clear(input);
    await user.type(input, 'abc');
    input.blur();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('formats value via the format prop', () => {
    render(<EditableNumber value={1234} onChange={() => {}} format={(n) => `Cr${n.toLocaleString()}`} />);
    expect(screen.getByRole('button')).toHaveTextContent('Cr1,234');
  });
});

describe('EditableTextarea', () => {
  it('saves on blur', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableTextarea value="" onChange={onChange} ariaLabel="notes" />);
    await user.click(screen.getByRole('button'));
    const textarea = await screen.findByRole('textbox', { name: 'notes' });
    await user.type(textarea, 'line one');
    textarea.blur();
    expect(onChange).toHaveBeenCalledWith('line one');
  });

  it('Escape cancels', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableTextarea value="orig" onChange={onChange} ariaLabel="notes" />);
    await user.click(screen.getByRole('button'));
    const textarea = await screen.findByRole('textbox', { name: 'notes' });
    await user.type(textarea, ' new{Escape}');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('EditableTable', () => {
  type Row = { id: string; name: string; tl: number };
  const cols: ColumnDef<Row>[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'tl', label: 'TL', type: 'number' },
  ];

  it('add row appends a blank row', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditableTable<Row>
        rows={[{ id: 'a', name: 'pistol', tl: 5 }]}
        columns={cols}
        onChange={onChange}
        blank={() => ({ name: '', tl: 0 })}
      />,
    );
    await user.click(screen.getByText('+ Add row'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const next: Row[] = onChange.mock.calls[0]![0];
    expect(next).toHaveLength(2);
    expect(next[1]).toMatchObject({ name: '', tl: 0 });
    expect(typeof next[1]!.id).toBe('string');
  });

  it('editing a cell calls onChange with the updated row', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditableTable<Row>
        rows={[{ id: 'a', name: 'pistol', tl: 5 }]}
        columns={cols}
        onChange={onChange}
        blank={() => ({ name: '', tl: 0 })}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Name for row' }));
    const input = await screen.findByDisplayValue('pistol');
    await user.clear(input);
    await user.type(input, 'rifle');
    input.blur();
    expect(onChange).toHaveBeenCalledWith([{ id: 'a', name: 'rifle', tl: 5 }]);
  });

  it('remove row filters it out', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditableTable<Row>
        rows={[
          { id: 'a', name: 'pistol', tl: 5 },
          { id: 'b', name: 'rifle', tl: 6 },
        ]}
        columns={cols}
        onChange={onChange}
        blank={() => ({ name: '', tl: 0 })}
      />,
    );
    const removeButtons = screen.getAllByLabelText('Remove row');
    await user.click(removeButtons[0]!);
    expect(onChange).toHaveBeenCalledWith([{ id: 'b', name: 'rifle', tl: 6 }]);
  });
});
