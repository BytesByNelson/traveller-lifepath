import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacterWithUndo } from '../store/useCharacterWithUndo';
import { Sheet } from '../components/sheet/Sheet';
import { ExportButton } from '../components/ExportButton';
import { UndoButton } from '../components/UndoButton';
import { RollLogViewer } from '../components/RollLogViewer';
import { PsiTestButton } from '../components/sheet/PsiTestButton';

export function SheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { character, setCharacter, undo, canUndo, depth } = useCharacterWithUndo(id ?? '');
  const [logOpen, setLogOpen] = useState(false);

  if (!id) return null;
  if (!character) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-500">No Traveller with that ID.</p>
        <button onClick={() => navigate('/')} className="mt-3 text-red-700 hover:underline text-sm">
          ← Back to list
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-[1600px] mx-auto p-3 md:p-4 print:p-0">
      <header className="flex items-baseline justify-between flex-wrap gap-2 mb-3 print:hidden">
        <div className="flex items-baseline gap-3 flex-wrap">
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:underline">
            ← Travellers
          </button>
          <h1 className="text-lg md:text-xl font-semibold">{character.name || '(unnamed)'}</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <PsiTestButton character={character} onChange={setCharacter} />
          <UndoButton onUndo={undo} disabled={!canUndo} depth={depth} />
          <button
            onClick={() => setLogOpen(true)}
            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
          >
            Roll log ({character.rollLog.length})
          </button>
          <ExportButton character={character} />
          <button
            onClick={() => navigate(`/create/${character.id}`)}
            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
          >
            Edit creation
          </button>
          <button
            onClick={() => {
              // Set the document title temporarily so the browser's
              // "Save as PDF" suggests a useful filename (e.g.
              // "Traveller Lifepath - Nelson.pdf" instead of the
              // app's default title). Restore the original on the
              // afterprint event so the tab title isn't disturbed
              // after the dialog closes.
              const original = document.title;
              const safe = (character.name || 'Unnamed').replace(/[\\/:*?"<>|]/g, '-').trim();
              document.title = `Traveller Lifepath - ${safe || 'Unnamed'}`;
              const restore = () => {
                document.title = original;
                window.removeEventListener('afterprint', restore);
              };
              window.addEventListener('afterprint', restore);
              window.print();
            }}
            className="text-sm px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-800"
            title="Designed for landscape Letter (11×8.5in). If your print dialog defaults to portrait, switch to landscape — the layout will be cramped otherwise."
          >
            Print
          </button>
        </div>
      </header>

      <Sheet character={character} onChange={setCharacter} />

      {logOpen ? <RollLogViewer entries={character.rollLog} onClose={() => setLogOpen(false)} /> : null}
    </main>
  );
}
