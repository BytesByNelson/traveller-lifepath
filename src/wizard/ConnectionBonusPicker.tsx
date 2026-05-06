import { useState } from 'react';
import type { Character, SkillName, SkillRef } from '../types';
import { CONNECTIONS_RULE_SKILL_CAP, SKILLS } from '../data';

/**
 * Connections-rule bonus picker. The player selects a skill (not Jack-of-all-Trades);
 * the chosen skill gets +1 (or jumps to 1 if absent), capped at level 3 by the rule.
 * Increments `connectionsUsed`.
 */
export function ConnectionBonusPicker({
  character,
  onApply,
  onSkip,
}: {
  character: Character;
  onApply: (next: Character) => void;
  onSkip: () => void;
}) {
  const allowedNames = (Object.keys(SKILLS) as SkillName[]).filter(
    (n) => n !== 'Jack-of-all-Trades',
  );
  const [name, setName] = useState<SkillName>(allowedNames[0]!);
  const [spec, setSpec] = useState<string | undefined>(undefined);

  const def = SKILLS[name];

  const apply = () => {
    const ref: SkillRef = spec ? { name, spec } : { name };
    const idx = character.backgroundSkills.findIndex(
      (s) => s.name === ref.name && (s.spec ?? '') === (ref.spec ?? ''),
    );
    const cur = idx >= 0 ? character.backgroundSkills[idx]!.level : 0;
    const next = Math.min(CONNECTIONS_RULE_SKILL_CAP, cur === 0 ? 1 : cur + 1);
    if (next === cur) {
      onSkip();
      return;
    }
    const updatedEntry = {
      ...ref,
      level: next,
      source: { kind: 'connection' as const },
    };
    const updated = [...character.backgroundSkills];
    if (idx >= 0) updated[idx] = updatedEntry;
    else updated.push(updatedEntry);

    onApply({
      ...character,
      backgroundSkills: updated,
      connectionsUsed: (character.connectionsUsed + 1) as 0 | 1 | 2,
    });
  };

  return (
    <div className="border border-amber-300 rounded-lg p-4 bg-amber-50 space-y-3">
      <div>
        <h3 className="font-semibold">Connection bonus skill</h3>
        <p className="text-xs text-gray-600">
          Pick any skill (except Jack-of-all-Trades). +1 level, capped at 3 by the connections rule.
        </p>
      </div>

      <select
        value={name}
        onChange={(e) => {
          setName(e.target.value as SkillName);
          setSpec(undefined);
        }}
        className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
      >
        {allowedNames.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      {def.specs.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={`text-xs px-2 py-0.5 rounded border ${spec === undefined ? 'border-red-700 bg-white' : 'border-gray-300 hover:bg-white'}`}
            onClick={() => setSpec(undefined)}
          >
            (no spec)
          </button>
          {def.specs.map((sp) => (
            <button
              key={sp}
              type="button"
              className={`text-xs px-2 py-0.5 rounded border ${spec === sp ? 'border-red-700 bg-white' : 'border-gray-300 hover:bg-white'}`}
              onClick={() => setSpec(sp)}
            >
              {sp}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          onClick={apply}
          className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm hover:bg-amber-700"
        >
          Apply +1 to {name}
          {spec ? ` (${spec})` : ''}
        </button>
        <button
          onClick={onSkip}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
