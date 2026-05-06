import { useEffect, useState } from 'react';
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
  // Indices into pkg.skills that are checked (Mercenary lists Gun Combat twice,
  // so we key by index rather than skill identity).
  const [picked, setPicked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (pkg) setPicked(new Set(pkg.skills.map((_, i) => i)));
    else setPicked(new Set());
  }, [pkg]);

  const toggle = (i: number) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const apply = () => {
    if (!pkg) return;
    const skills = [...picked].sort((a, b) => a - b).map((i) => pkg.skills[i]!);
    onChange(applySkillPackage(character, skills));
    onDone();
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Skill package</h2>
      <p className="text-sm text-gray-600">
        Pick one package — every chosen skill lands at level 1 (or stays at its existing level if higher).
      </p>
      <p className="text-xs text-gray-600 italic bg-amber-50 border border-amber-200 rounded p-2">
        Per Mongoose 2022, the skill package is shared by the whole group: the listed skills are split between
        Travellers, with each one taking at least one. <strong>For solo play</strong>, leave them all checked.
        <strong> For group play</strong>, uncheck the skills your teammates are taking so the totals balance out.
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
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Skills in this package — check the ones you're taking:</div>
            <div className="flex gap-1 text-xs">
              <button
                type="button"
                className="px-2 py-0.5 border border-gray-300 rounded hover:bg-white"
                onClick={() => setPicked(new Set(pkg.skills.map((_, i) => i)))}
              >
                All
              </button>
              <button
                type="button"
                className="px-2 py-0.5 border border-gray-300 rounded hover:bg-white"
                onClick={() => setPicked(new Set())}
              >
                None
              </button>
            </div>
          </div>
          <ul className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
            {pkg.skills.map((s, i) => (
              <li key={i}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={picked.has(i)}
                    onChange={() => toggle(i)}
                  />
                  <span>
                    {s.name}
                    {s.spec ? ` (${s.spec})` : ''} 1
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        disabled={!pkg || picked.size === 0}
        onClick={apply}
        className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        Apply{pkg ? ` ${picked.size} skill${picked.size === 1 ? '' : 's'}` : ''} → Review
      </button>
    </section>
  );
}
