import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setStorageForTesting, type Storage } from '../store/persistence';
import { resetStoreForTesting, getCharacter } from '../store/characters';
import { newCharacter } from '../engine';
import { ImportButton } from './ImportButton';
import { ExportButton } from './ExportButton';

const memStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
};

beforeEach(() => {
  setStorageForTesting(memStorage());
  resetStoreForTesting();
});

const fileFor = (obj: unknown, name = 'erik.traveller.json') =>
  new File([JSON.stringify(obj)], name, { type: 'application/json' });

describe('ImportButton', () => {
  it('imports a valid character JSON', async () => {
    const onImported = vi.fn();
    const user = userEvent.setup();
    const c = newCharacter('imported-id', 'Erik', 'human');
    render(<ImportButton onImported={onImported} />);

    const fileInput = screen.getByLabelText('Import character JSON') as HTMLInputElement;
    await user.upload(fileInput, fileFor(c));

    await waitFor(() => {
      expect(onImported).toHaveBeenCalled();
    });
    const stored = getCharacter('imported-id');
    expect(stored?.name).toBe('Erik');
  });

  it('shows an error for malformed JSON', async () => {
    const user = userEvent.setup();
    render(<ImportButton />);
    const fileInput = screen.getByLabelText('Import character JSON') as HTMLInputElement;
    const badFile = new File(['{not json'], 'bad.json', { type: 'application/json' });
    await user.upload(fileInput, badFile);
    await waitFor(() => {
      expect(screen.getByText(/Import failed/)).toBeInTheDocument();
    });
  });

  it('shows an error for bad schemaVersion', async () => {
    const user = userEvent.setup();
    render(<ImportButton />);
    const fileInput = screen.getByLabelText('Import character JSON') as HTMLInputElement;
    await user.upload(fileInput, fileFor({ schemaVersion: 99, id: 'x' }));
    await waitFor(() => {
      expect(screen.getByText(/Import failed/)).toBeInTheDocument();
      expect(screen.getByText(/99/)).toBeInTheDocument();
    });
  });

  it('prompts on UUID conflict and replaces on confirm', async () => {
    const user = userEvent.setup();
    // Pre-seed store with an existing character.
    const existing = newCharacter('shared-id', 'Old', 'human');
    setStorageForTesting(memStorage());
    resetStoreForTesting();
    // Save existing through the store path.
    const { upsertCharacter } = await import('../store/characters');
    upsertCharacter(existing);

    render(<ImportButton />);
    const fileInput = screen.getByLabelText('Import character JSON') as HTMLInputElement;
    const incoming = newCharacter('shared-id', 'New', 'aslan');
    await user.upload(fileInput, fileFor(incoming));

    await waitFor(() => {
      expect(screen.getByText(/already exists/)).toBeInTheDocument();
    });
    await user.click(screen.getByText('Replace existing'));
    expect(getCharacter('shared-id')?.name).toBe('New');
    expect(getCharacter('shared-id')?.species).toBe('aslan');
  });

  it('clones with new id when chosen', async () => {
    const user = userEvent.setup();
    setStorageForTesting(memStorage());
    resetStoreForTesting();
    const { upsertCharacter, listCharacters } = await import('../store/characters');
    upsertCharacter(newCharacter('shared-id', 'Old', 'human'));

    render(<ImportButton />);
    const fileInput = screen.getByLabelText('Import character JSON') as HTMLInputElement;
    await user.upload(fileInput, fileFor(newCharacter('shared-id', 'Clone of Old', 'aslan')));

    await waitFor(() => screen.getByText(/already exists/));
    await user.click(screen.getByText('Import as new copy'));

    await waitFor(() => {
      expect(listCharacters()).toHaveLength(2);
    });
    const old = getCharacter('shared-id');
    expect(old?.name).toBe('Old'); // unchanged
  });
});

describe('ExportButton', () => {
  it('triggers a download with the slugified name', async () => {
    const user = userEvent.setup();
    const c = newCharacter('id', 'Captain Erik', 'human');

    // Stub URL.createObjectURL / revokeObjectURL — jsdom may not implement them.
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:fake');
    URL.revokeObjectURL = vi.fn();

    // Spy on anchor click
    const clicks: string[] = [];
    const origCreateElement = document.createElement.bind(document);
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        const orig = el.click.bind(el);
        (el as HTMLAnchorElement).click = () => {
          clicks.push((el as HTMLAnchorElement).download);
          orig();
        };
      }
      return el;
    });

    render(<ExportButton character={c} />);
    await user.click(screen.getByRole('button', { name: 'Export JSON' }));

    expect(clicks[0]).toBe('captain-erik.traveller.json');

    spy.mockRestore();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });
});
