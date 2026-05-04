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

      <fieldset className="rounded border border-gray-300 p-3">
        <legend className="px-2 text-sm font-medium text-gray-700">Dice rolls</legend>
        <p className="text-xs text-gray-600 mb-2">
          How would you like to handle dice rolls during creation?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['app', 'manual'] as const).map((mode) => {
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
                  selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">
                  {mode === 'app' ? 'Roll for me' : 'I\'ll roll my own dice'}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {mode === 'app'
                    ? 'The website rolls 2D for every check and table; you just review the result.'
                    : 'You roll physical dice and enter the result. The website still tracks DMs and outcomes.'}
                </div>
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
