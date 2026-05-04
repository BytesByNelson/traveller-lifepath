import type { Character, SpeciesId } from '../types';
import { SPECIES } from '../data';

export function BasicsStep({
  character,
  onChange,
  onNext,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onNext: () => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Basics</h2>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Name</span>
        <input
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={character.name}
          onChange={(e) => onChange({ ...character, name: e.target.value })}
          placeholder="Your Traveller's name"
          autoFocus
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-1">Species</legend>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(SPECIES) as SpeciesId[]).map((id) => {
            const s = SPECIES[id];
            const selected = character.species === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => onChange({ ...character, species: id })}
                className={`px-3 py-2 rounded border text-left ${
                  selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-600">{describeMods(s.charModifiers)}</div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Homeworld (optional)</span>
        <input
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={character.homeworld ?? ''}
          onChange={(e) => onChange({ ...character, homeworld: e.target.value || undefined })}
          placeholder="e.g. Regina"
        />
      </label>

      <button
        onClick={onNext}
        disabled={!character.name.trim()}
        className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        Continue → Characteristics
      </button>
    </section>
  );
}

const describeMods = (mods: Record<string, number | undefined>): string => {
  const parts = Object.entries(mods)
    .filter(([, v]) => v != null && v !== 0)
    .map(([k, v]) => `${k}${(v as number) > 0 ? '+' : ''}${v}`);
  return parts.length === 0 ? 'No modifiers' : parts.join(', ');
};
