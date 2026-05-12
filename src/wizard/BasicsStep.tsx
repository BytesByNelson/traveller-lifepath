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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(SPECIES) as SpeciesId[]).map((id) => {
            const s = SPECIES[id];
            const selected = character.species === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => onChange({ ...character, species: id })}
                title={s.source ? `${s.description}\n\nSource: ${s.source}` : s.description}
                className={`px-3 py-2 rounded border text-left ${
                  selected ? 'border-red-700 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-600">{describeMods(s.charModifiers)}</div>
              </button>
            );
          })}
        </div>
        {/* Source attribution + lore for the currently-selected species, so
            players who care about canon can see exactly what book a pick
            comes from. */}
        {(() => {
          const selected = SPECIES[character.species];
          if (!selected) return null;
          return (
            <div className="mt-2 text-xs text-gray-600 italic">
              {selected.description}
              {selected.source ? (
                <span className="block mt-0.5 not-italic text-gray-500">
                  Source: {selected.source}
                </span>
              ) : null}
            </div>
          );
        })()}
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

      <fieldset className="rounded border border-gray-300 p-3">
        <legend className="px-2 text-sm font-medium text-gray-700">Characteristics method</legend>
        <p className="text-xs text-gray-600 mb-2">
          How would you like to set your six starting characteristics?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(
            [
              {
                mode: 'app',
                title: 'Roll — site does it',
                desc: 'The website rolls 2D × 6 into a pool; you assign each value to the stat you want. Every later check (career rolls, events, etc.) is also rolled by the site.',
              },
              {
                mode: 'manual',
                title: "Roll — I'll throw the dice",
                desc: 'You roll physical dice and enter results yourself. The website tracks DMs, targets, and outcomes for every step.',
              },
              {
                mode: 'point_buy',
                title: 'Point-buy',
                desc: 'Spend 42 points across the six stats (each 2–12). No randomness on stats. Later career rolls are still rolled by the site.',
              },
            ] as const
          ).map(({ mode, title, desc }) => {
            const selected = character.wizardState?.rollMode === mode;
            return (
              <button
                type="button"
                key={mode}
                onClick={() =>
                  onChange({
                    ...character,
                    wizardState: {
                      ...(character.wizardState ?? { step: 'basics' }),
                      rollMode: mode,
                    },
                  })
                }
                className={`px-3 py-2 rounded border text-left ${
                  selected ? 'border-red-700 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">{title}</div>
                <div className="text-xs text-gray-600 mt-0.5">{desc}</div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded border border-gray-300 p-3">
        <legend className="px-2 text-sm font-medium text-gray-700">Optional rules</legend>
        <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
          <input
            type="checkbox"
            checked={character.wizardState?.psionicsEnabled === true}
            onChange={(e) =>
              onChange({
                ...character,
                wizardState: {
                  ...(character.wizardState ?? { step: 'basics' }),
                  psionicsEnabled: e.target.checked,
                },
              })
            }
            className="mt-0.5"
          />
          <span>
            <strong>Include psionics.</strong>
            <span className="block text-xs text-gray-600">
              Rolls PSI as a seventh characteristic during creation, and unlocks the Psion career. Otherwise PSI stays
              hidden until something in play (a pre-career event or unusual life event) grants eligibility.
            </span>
          </span>
        </label>
      </fieldset>

      <button
        onClick={onNext}
        disabled={!character.name.trim() || !character.wizardState?.rollMode}
        className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800 disabled:opacity-50"
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
