import type { Character } from '../types';
import { CAREERS } from '../data';
import { getAge } from '../engine';

export function ReviewStep({
  character,
  onFinalize,
  onBack,
}: {
  character: Character;
  onFinalize: () => void;
  onBack: () => void;
}) {
  const age = getAge(character);
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Review</h2>

      <div className="rounded border border-gray-200 p-3 bg-gray-50">
        <div className="font-medium">{character.name || '(unnamed)'}</div>
        <div className="text-xs text-gray-600 capitalize">
          {character.species} • Age {age} • {character.careerHistory.length} terms
        </div>
        {character.homeworld ? <div className="text-xs text-gray-500">Homeworld: {character.homeworld}</div> : null}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1">Characteristics</h3>
        <ul className="grid grid-cols-3 gap-1 text-sm font-mono">
          {(['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'] as const).map((c) => (
            <li key={c} className="px-2 py-1 bg-gray-50 rounded text-center">
              {c} {character.characteristics[c]}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1">Skills</h3>
        <ul className="text-sm grid grid-cols-2 gap-x-4 gap-y-0.5">
          {character.backgroundSkills
            .slice()
            .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
            .map((s) => (
              <li key={`${s.name}|${s.spec ?? ''}`}>
                {s.name}
                {s.spec ? ` (${s.spec})` : ''}{' '}
                <span className="text-gray-500">{s.level}</span>
              </li>
            ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1">Career history</h3>
        <ol className="text-sm space-y-1">
          {character.careerHistory.map((t) => {
            const c = CAREERS[t.career];
            return (
              <li key={t.index}>
                Term {t.index + 1}: <strong>{c.name}</strong> ({c.assignments.find((a) => a.id === t.assignment)?.name}) — rank {t.rankAtEnd}
                {t.isOfficer ? ' (officer)' : ''} — {t.termOutcome.replace('_', ' ')}
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1">Connections</h3>
        {(['contacts', 'allies', 'rivals', 'enemies'] as const).map((kind) => {
          const list = character.connections[kind];
          if (list.length === 0) return null;
          return (
            <div key={kind} className="text-sm">
              <span className="capitalize text-gray-500">{kind}:</span>{' '}
              {list.map((x) => x.description || '(unnamed)').join(', ')}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded border border-gray-200 p-2">
          <div className="text-xs text-gray-500">Cash</div>
          <div>Cr{character.currentCash.toLocaleString()}</div>
        </div>
        {character.pension ? (
          <div className="rounded border border-gray-200 p-2">
            <div className="text-xs text-gray-500">Pension</div>
            <div>Cr{character.pension.toLocaleString()}/yr</div>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={onFinalize}
          className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          Finalize → Sheet
        </button>
      </div>
    </section>
  );
}
