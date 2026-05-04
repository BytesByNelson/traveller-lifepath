import type { Character, SkillName } from '../types';
import { BACKGROUND_SKILLS } from '../data';
import { addBackgroundSkill, backgroundSkillCount, removeBackgroundSkill } from '../engine';

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

  const toggle = (name: SkillName) => {
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
        All gained at level 0. {remaining} left to pick.
      </p>

      <div className="grid grid-cols-3 gap-1.5">
        {BACKGROUND_SKILLS.map((name) => {
          const selected = picked.has(name);
          const disabled = !selected && remaining <= 0;
          return (
            <button
              type="button"
              key={name}
              onClick={() => toggle(name)}
              disabled={disabled}
              className={`px-2 py-1.5 rounded border text-sm text-left ${
                selected
                  ? 'border-indigo-600 bg-indigo-50'
                  : disabled
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

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
