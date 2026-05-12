import { useNavigate } from 'react-router-dom';
import { deleteCharacter, useCharacterList, upsertCharacter } from '../store/characters';
import { newCharacter } from '../engine';
import { ImportButton } from '../components/ImportButton';
import type { Character } from '../types';

export function CharacterListPage() {
  const characters = useCharacterList();
  const navigate = useNavigate();

  const create = () => {
    const id = crypto.randomUUID();
    upsertCharacter(newCharacter(id, '', 'human'));
    navigate(`/create/${id}`);
  };

  const duplicate = (c: Character) => {
    // Clone-with-new-id. Keep every field — career history, sheet edits,
    // notes — so GMs making variants of an NPC don't have to redo work.
    // Append " (copy)" to disambiguate in the library; users can rename
    // in the sheet immediately after.
    const newId = crypto.randomUUID();
    const cloned: Character = {
      ...c,
      id: newId,
      name: c.name ? `${c.name} (copy)` : '(copy)',
    };
    upsertCharacter(cloned);
    navigate(`/sheet/${newId}`);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Travellers</h1>
        <div className="flex items-start gap-2 flex-wrap">
          <ImportButton onImported={(c) => navigate(`/sheet/${c.id}`)} />
          <button
            onClick={() => navigate('/npc')}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
            title="Auto-generate an NPC for the GM table"
          >
            Generate NPC
          </button>
          <button
            onClick={create}
            className="text-sm px-3 py-1.5 rounded bg-red-700 text-white font-medium hover:bg-red-800"
          >
            + New Traveller
          </button>
        </div>
      </header>

      {characters.length === 0 ? (
        <p className="mt-6 text-gray-500">
          No Travellers yet. Click <span className="font-medium">New Traveller</span> to begin or import a JSON file.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {characters.map((c) => (
            <li key={c.id} className="relative group">
              <button
                onClick={() => {
                  const next = c.wizardState?.step === 'done' || !c.wizardState ? 'sheet' : 'create';
                  navigate(`/${next}/${c.id}`);
                }}
                className="w-full text-left px-4 py-3 rounded border border-gray-300 hover:bg-gray-50"
              >
                <div className="font-medium">{c.name || <span className="text-gray-400">(unnamed)</span>}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {c.species} • {c.careerHistory.length} terms • Step: {c.wizardState?.step ?? 'done'}
                </div>
              </button>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1">
                <button
                  onClick={() => duplicate(c)}
                  className="text-xs text-gray-500 hover:text-red-700 px-1"
                  aria-label={`Duplicate ${c.name || 'character'}`}
                  title="Duplicate — clones with a new id, keeps every field"
                >
                  ⧉
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${c.name || '(unnamed)'}? This cannot be undone.`)) {
                      deleteCharacter(c.id);
                    }
                  }}
                  className="text-xs text-gray-400 hover:text-red-600 px-1"
                  aria-label={`Delete ${c.name || 'character'}`}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-8 text-xs text-gray-500">
        Saved in your browser's localStorage. Export JSON to back up or move between devices.
      </footer>
    </main>
  );
}
