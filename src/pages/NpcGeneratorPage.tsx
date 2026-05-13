import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateNpc, type NpcOptions } from '../engine/npc';
import { upsertCharacter } from '../store/characters';
import { SPECIES } from '../data';
import { SOCIETIES } from '../data/societies';
import { Sheet } from '../components/sheet/Sheet';
import type { Character, SocietyId, SpeciesId } from '../types';

/**
 * NPC autopilot UI. The GM picks a few inputs, hits Generate, and the engine
 * runs a full lifepath in the background. The resulting Character is shown
 * inline with a Re-roll button (discard + try again) and a Save button (commit
 * to the library and navigate to the editable sheet).
 *
 * Intentionally minimal at v1 — the engine does the heavy lifting. The page is
 * the seam where GM intent becomes a Character.
 */
export function NpcGeneratorPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<SpeciesId>('human');
  const [society, setSociety] = useState<SocietyId>('third_imperium');
  const [terms, setTerms] = useState(3);
  const [psionics, setPsionics] = useState(false);
  const [generated, setGenerated] = useState<Character | undefined>(undefined);

  const generate = useCallback(() => {
    const opts: NpcOptions = {
      name: name.trim() || undefined,
      species,
      society,
      terms,
      psionics,
    };
    setGenerated(generateNpc(opts, Math.random));
  }, [name, species, society, terms, psionics]);

  const reroll = useCallback(() => generate(), [generate]);

  const save = useCallback(() => {
    if (!generated) return;
    upsertCharacter(generated);
    navigate(`/sheet/${generated.id}`);
  }, [generated, navigate]);

  return (
    <main className="max-w-[1600px] mx-auto p-3 md:p-4 space-y-4">
      <header className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:underline">
            ← Travellers
          </button>
          <h1 className="text-lg md:text-xl font-semibold">Generate NPC</h1>
        </div>
      </header>

      <section className="rounded border border-gray-300 bg-white p-3 space-y-3">
        <p className="text-sm text-gray-600">
          One-click NPC generator for GMs. The engine runs a full lifepath — qualification, survival,
          events, mustering — and produces a complete Traveller with a real career history. Re-roll until
          you get one you like, then save to add it to your library.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Name (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="auto"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label="NPC name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Species</span>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value as SpeciesId)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm capitalize"
              aria-label="NPC species"
            >
              {(Object.keys(SPECIES) as SpeciesId[]).map((id) => (
                <option key={id} value={id}>
                  {SPECIES[id].name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Society</span>
            <select
              value={society}
              onChange={(e) => setSociety(e.target.value as SocietyId)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label="NPC society"
              title="Shapes the available career list and name flavour"
            >
              {(Object.keys(SOCIETIES) as SocietyId[]).map((id) => (
                <option key={id} value={id}>
                  {SOCIETIES[id].name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Terms (≈4 years each)</span>
            <input
              type="number"
              min={1}
              max={7}
              value={terms}
              onChange={(e) => setTerms(Math.max(1, Math.min(7, Number(e.target.value) || 1)))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              aria-label="Number of career terms"
            />
          </label>
          <label className="flex items-center gap-2 mt-5 text-sm text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={psionics}
              onChange={(e) => setPsionics(e.target.checked)}
            />
            <span>Include PSI</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={generate}
            className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
          >
            {generated ? 'Generate another' : 'Generate'}
          </button>
          {generated ? (
            <>
              <button
                onClick={reroll}
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
              >
                Re-roll
              </button>
              <button
                onClick={save}
                className="px-4 py-2 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800"
              >
                Save to library
              </button>
            </>
          ) : null}
        </div>
      </section>

      {generated ? (
        <section aria-label="Generated NPC preview">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {generated.name} — {generated.careerHistory.length} terms,{' '}
            {generated.careerHistory.map((t) => t.career).join(' → ') || 'no completed careers'}
            {generated.deceased ? ' — deceased' : ''}
          </h2>
          {/* Reuse the read-only Sheet so what you see is what you save. */}
          <Sheet character={generated} />
        </section>
      ) : null}
    </main>
  );
}
