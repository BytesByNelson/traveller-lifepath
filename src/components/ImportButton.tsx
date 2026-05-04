import { useRef, useState } from 'react';
import { migrate } from '../store/migrations';
import { getCharacter, upsertCharacter } from '../store/characters';
import type { Character } from '../types';

type Status =
  | { kind: 'idle' }
  | { kind: 'error'; reason: string }
  | { kind: 'conflict'; incoming: Character; existing: Character };

/**
 * File picker that imports a character JSON, runs it through the migration/validation
 * pipeline, and either saves it directly, prompts for conflict resolution if the UUID
 * already exists, or surfaces an error inline.
 */
export function ImportButton({
  onImported,
  className = '',
}: {
  onImported?: (c: Character) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleFile = async (file: File) => {
    setStatus({ kind: 'idle' });
    let parsed: unknown;
    try {
      const text = await file.text();
      parsed = JSON.parse(text);
    } catch (e) {
      setStatus({ kind: 'error', reason: `Couldn't parse JSON: ${(e as Error).message}` });
      return;
    }
    const result = migrate(parsed);
    if (!result.ok) {
      setStatus({ kind: 'error', reason: result.reason });
      return;
    }
    const incoming = result.character;
    const existing = getCharacter(incoming.id);
    if (existing) {
      setStatus({ kind: 'conflict', incoming, existing });
      return;
    }
    upsertCharacter(incoming);
    onImported?.(incoming);
  };

  const replace = () => {
    if (status.kind !== 'conflict') return;
    upsertCharacter(status.incoming);
    onImported?.(status.incoming);
    setStatus({ kind: 'idle' });
  };

  const cloneAsNew = () => {
    if (status.kind !== 'conflict') return;
    const clone = { ...status.incoming, id: crypto.randomUUID() };
    upsertCharacter(clone);
    onImported?.(clone);
    setStatus({ kind: 'idle' });
  };

  return (
    <div className={`inline-flex flex-col items-stretch gap-2 ${className}`}>
      <button
        onClick={() => inputRef.current?.click()}
        className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
        title="Import a character from a .traveller.json file"
      >
        Import JSON
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Import character JSON"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so re-selecting the same file fires onChange again.
          e.target.value = '';
        }}
      />
      {status.kind === 'error' ? (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 max-w-md">
          <strong>Import failed:</strong> {status.reason}
        </div>
      ) : null}
      {status.kind === 'conflict' ? (
        <div className="text-xs bg-amber-50 border border-amber-200 rounded p-2 max-w-md space-y-2">
          <div>
            A character with this ID already exists ({status.existing.name || '(unnamed)'}).
            What would you like to do?
          </div>
          <div className="flex gap-2">
            <button onClick={replace} className="px-2 py-1 rounded bg-amber-600 text-white text-xs hover:bg-amber-700">
              Replace existing
            </button>
            <button onClick={cloneAsNew} className="px-2 py-1 rounded border border-gray-300 text-xs hover:bg-white">
              Import as new copy
            </button>
            <button onClick={() => setStatus({ kind: 'idle' })} className="px-2 py-1 rounded border border-gray-300 text-xs hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
