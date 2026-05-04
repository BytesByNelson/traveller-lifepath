import { useState } from 'react';
import type { Character, SkillName } from '../types';
import { BACKGROUND_SKILLS } from '../data';
import { addBackgroundSkill, backgroundSkillCount, removeBackgroundSkill } from '../engine';
import { SkillInfoCard } from '../components/SkillInfo';

export function BackgroundSkillsStep({
  character,
  onChange,
  onBack,
  onNext,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const allowed = backgroundSkillCount(character);
  const picked = new Set(character.backgroundSkills.filter((s) => s.source.kind === 'background').map((s) => s.name));
  const remaining = allowed - picked.size;

  // The skill the player most recently clicked — drives the details panel.
  const [focused, setFocused] = useState<SkillName | undefined>(undefined);
  // Whether the details panel is expanded. Defaults open when a skill is focused;
  // collapses on user request.
  const [detailsOpen, setDetailsOpen] = useState(true);

  const handleClick = (name: SkillName) => {
    setFocused(name);
    if (!detailsOpen) setDetailsOpen(true);
    if (picked.has(name)) {
      onChange(removeBackgroundSkill(character, name));
    } else if (picked.size < allowed) {
      onChange(addBackgroundSkill(character, name));
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Background skills</h2>
      <p className="text-sm text-gray-600">
        You may pick <span className="font-semibold">{allowed}</span> background skills (EDU DM + 3, capped at 6).
        All gained at level 0. {remaining} left to pick. Click any skill to read what it covers.
      </p>

      <div className="grid grid-cols-3 gap-1.5">
        {BACKGROUND_SKILLS.map((name) => {
          const selected = picked.has(name);
          const disabled = !selected && remaining <= 0;
          const isFocused = focused === name;
          return (
            <button
              type="button"
              key={name}
              onClick={() => handleClick(name)}
              disabled={disabled}
              className={`px-2 py-1.5 rounded border text-sm text-left transition-colors ${
                selected
                  ? 'border-indigo-600 bg-indigo-50'
                  : disabled
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
              } ${isFocused && !selected ? 'ring-2 ring-indigo-300 ring-offset-1' : ''} ${
                isFocused && selected ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
              }`}
              aria-pressed={selected}
            >
              {name}
            </button>
          );
        })}
      </div>

      <details
        open={detailsOpen && !!focused}
        onToggle={(e) => setDetailsOpen((e.target as HTMLDetailsElement).open)}
        className="rounded border border-gray-200 bg-gray-50/50 px-3 py-2"
      >
        <summary className="text-xs font-semibold uppercase tracking-wide text-gray-600 cursor-pointer select-none">
          {focused ? `Skill details — ${focused}` : 'Skill details'}
        </summary>
        <div className="mt-3">
          {focused ? (
            <SkillInfoCard name={focused} />
          ) : (
            <p className="text-sm text-gray-500 italic">
              Click any skill above to see what it covers — description, specializations, and example checks from the rulebook.
            </p>
          )}
        </div>
      </details>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={remaining > 0}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Continue → Career term
        </button>
      </div>
    </section>
  );
}
