import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RollLogEntry } from '../types';
import { RollLogViewer } from './RollLogViewer';

const entry = (overrides: Partial<RollLogEntry> = {}): RollLogEntry => ({
  id: crypto.randomUUID(),
  ts: Date.parse('2026-05-03T12:00:00Z'),
  context: 'Agent / Survival',
  result: 8,
  source: 'rng',
  ...overrides,
});

const fixture: RollLogEntry[] = [
  entry({ id: '1', context: 'Agent / Qualification', target: 6, result: 9, success: true, source: 'rng' }),
  entry({ id: '2', context: 'Agent / Survival', target: 6, result: 4, success: false, source: 'manual', natural: 4 }),
  entry({ id: '3', context: 'Agent / Event', result: 7, source: 'rng' }), // no target → "no target" outcome
  entry({ id: '4', context: 'Marine / Qualification', target: 6, result: 7, success: true, source: 'manual' }),
];

describe('RollLogViewer', () => {
  it('renders all entries by default', () => {
    render(<RollLogViewer entries={fixture} onClose={() => {}} />);
    expect(screen.getByText('Agent / Qualification')).toBeInTheDocument();
    expect(screen.getByText('Agent / Survival')).toBeInTheDocument();
    expect(screen.getByText('Agent / Event')).toBeInTheDocument();
    expect(screen.getByText('Marine / Qualification')).toBeInTheDocument();
  });

  it('filters by source: manual', async () => {
    const user = userEvent.setup();
    render(<RollLogViewer entries={fixture} onClose={() => {}} />);
    await user.selectOptions(screen.getByLabelText('Source filter'), 'manual');
    expect(screen.queryByText('Agent / Qualification')).not.toBeInTheDocument();
    expect(screen.getByText('Agent / Survival')).toBeInTheDocument();
    expect(screen.getByText('Marine / Qualification')).toBeInTheDocument();
  });

  it('filters by outcome: pass', async () => {
    const user = userEvent.setup();
    render(<RollLogViewer entries={fixture} onClose={() => {}} />);
    await user.selectOptions(screen.getByLabelText('Outcome filter'), 'pass');
    expect(screen.getByText('Agent / Qualification')).toBeInTheDocument();
    expect(screen.queryByText('Agent / Survival')).not.toBeInTheDocument();
    expect(screen.queryByText('Agent / Event')).not.toBeInTheDocument();
    expect(screen.getByText('Marine / Qualification')).toBeInTheDocument();
  });

  it('filters by outcome: fail', async () => {
    const user = userEvent.setup();
    render(<RollLogViewer entries={fixture} onClose={() => {}} />);
    await user.selectOptions(screen.getByLabelText('Outcome filter'), 'fail');
    expect(screen.queryByText('Agent / Qualification')).not.toBeInTheDocument();
    expect(screen.getByText('Agent / Survival')).toBeInTheDocument();
  });

  it('filters by context substring', async () => {
    const user = userEvent.setup();
    render(<RollLogViewer entries={fixture} onClose={() => {}} />);
    await user.type(screen.getByLabelText('Context filter'), 'Marine');
    expect(screen.queryByText('Agent / Qualification')).not.toBeInTheDocument();
    expect(screen.getByText('Marine / Qualification')).toBeInTheDocument();
  });

  it('Copy button writes filtered entries to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    // Spy on the existing clipboard if jsdom provides it; otherwise install a mock.
    const existing = navigator.clipboard;
    if (existing && typeof existing.writeText === 'function') {
      vi.spyOn(existing, 'writeText').mockImplementation(writeText);
    } else {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
    }

    const user = userEvent.setup({ writeToClipboard: false });
    render(<RollLogViewer entries={fixture} onClose={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    });
    expect(writeText).toHaveBeenCalled();
    const written: string = writeText.mock.calls[0]![0];
    expect(written).toMatch(/Agent \/ Qualification/);
    expect(written).toMatch(/PASS/);
    expect(written).toMatch(/FAIL/);
  });

  it('Esc-style close: clicking the backdrop calls onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<RollLogViewer entries={fixture} onClose={onClose} />);
    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows "No entries match" when filters exclude everything', async () => {
    const user = userEvent.setup();
    render(<RollLogViewer entries={fixture} onClose={() => {}} />);
    await user.type(screen.getByLabelText('Context filter'), 'nonexistent-context-xyz');
    expect(screen.getByText(/No entries match/)).toBeInTheDocument();
  });
});
