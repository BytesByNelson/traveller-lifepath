import { useState } from 'react';
import type { Character } from '../types';
import { SKILL_PACKAGES } from '../data';
import { applySkillPackage } from '../engine';

export function SkillPackageStep({
  character,
  onChange,
  onDone,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onDone: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const pkg = SKILL_PACKAGES.find((p) => p.id === selectedId);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Skill package</h2>
      <p className="text-sm text-gray-600">
        Pick one package — every skill in it lands at level 1 (raises your existing level only if it's higher).
        Solo creation: you take all skills in the package.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {SKILL_PACKAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`px-3 py-2 rounded border text-left text-sm ${
              selectedId === p.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-gray-600">{p.description}</div>
          </button>
        ))}
      </div>

      {pkg ? (
        <div className="rounded border border-gray-200 p-3 text-sm bg-gray-50">
          <div className="font-medium mb-1">Skills granted:</div>
          <ul className="text-xs grid grid-cols-2 gap-x-4 gap-y-0.5">
            {pkg.skills.map((s, i) => (
              <li key={i}>
                {s.name}
                {s.spec ? ` (${s.spec})` : ''} 1
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        disabled={!pkg}
        onClick={() => {
          if (!pkg) return;
          const next = applySkillPackage(character, pkg.skills);
          onChange(next);
          onDone();
        }}
        className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        Apply package → Review
      </button>
    </section>
  );
}
