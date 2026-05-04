import { useNavigate } from 'react-router-dom';
import { deleteCharacter, useCharacterList, upsertCharacter } from '../store/characters';
import { newCharacter } from '../engine';
import { ImportButton } from '../components/ImportButton';

export function CharacterListPage() {
  const characters = useCharacterList();
  const navigate = useNavigate();

  const create = () => {
    const id = crypto.randomUUID();
    upsertCharacter(newCharacter(id, '', 'human'));
    navigate(`/create/${id}`);
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Travellers</h1>
        <div className="flex items-start gap-2">
          <ImportButton onImported={(c) => navigate(`/sheet/${c.id}`)} />
          <button
            onClick={create}
            className="text-sm px-3 py-1.5 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700"
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
              <button
                onClick={() => {
                  if (confirm(`Delete ${c.name || '(unnamed)'}? This cannot be undone.`)) {
                    deleteCharacter(c.id);
                  }
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-600 px-1"
                aria-label={`Delete ${c.name || 'character'}`}
                title="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-8 text-xs text-gray-400">
        Saved in your browser's localStorage. Export JSON to back up or move between devices.
      </footer>
    </main>
  );
}
