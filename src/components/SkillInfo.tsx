import { useState } from 'react';
import { DIFFICULTY_TARGETS, type SkillName, type TaskDifficulty } from '../types';
import { SKILLS } from '../data';

const DIFFICULTY_LABEL: Record<TaskDifficulty, string> = {
  simple: 'Simple',
  easy: 'Easy',
  routine: 'Routine',
  average: 'Average',
  difficult: 'Difficult',
  very_difficult: 'Very Difficult',
  formidable: 'Formidable',
  impossible: 'Impossible',
};

/** Compact details for a skill — its description, specializations, and example checks. */
export function SkillInfoCard({
  name,
  spec,
  className = '',
}: {
  name: SkillName;
  spec?: string;
  className?: string;
}) {
  const def = SKILLS[name];
  const specDesc = spec ? def.specDescriptions?.[spec] : undefined;
  return (
    <div className={`text-xs space-y-2 ${className}`}>
      <div>
        <div className="font-semibold text-sm text-gray-900">
          {name}
          {spec ? ` (${spec})` : ''}
        </div>
        <p className="text-gray-700 mt-0.5">{def.description}</p>
        {specDesc ? <p className="text-gray-700 mt-1 italic">{specDesc}</p> : null}
      </div>

      {def.specs.length > 0 && !spec ? (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500">Specializations</div>
          <ul className="text-[11px] text-gray-700 space-y-0.5">
            {def.specs.map((s) => (
              <li key={s}>
                <span className="font-medium">{s}</span>
                {def.specDescriptions?.[s] ? (
                  <span className="text-gray-600"> — {def.specDescriptions[s]}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {def.tasks && def.tasks.length > 0 ? (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-gray-500">Example checks</div>
          <ul className="text-[11px] text-gray-700 space-y-0.5">
            {def.tasks.map((t, i) => (
              <li key={i}>
                <span className="font-mono text-gray-500">
                  {DIFFICULTY_LABEL[t.difficulty]} ({DIFFICULTY_TARGETS[t.difficulty]}+)
                </span>{' '}
                <span>{t.name}</span>
                <span className="text-gray-500">
                  {t.characteristic
                    ? ` · ${Array.isArray(t.characteristic) ? t.characteristic.join('/') : t.characteristic}`
                    : ''}
                  {t.opposed ? ` · opposed by ${t.opposed}` : ''}
                  {t.timeframe ? ` · ${t.timeframe}` : ''}
                  {t.spec ? ` · spec: ${t.spec}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {def.notTrainable ? (
        <p className="text-[11px] italic text-amber-700">Not trainable through study.</p>
      ) : null}
    </div>
  );
}

/**
 * A small "?" button that toggles a popover with the SkillInfoCard. Used inline
 * in pickers and around the wizard.
 */
export function SkillInfoButton({ name, spec }: { name: SkillName; spec?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block print:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] w-4 h-4 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 inline-flex items-center justify-center align-middle"
        aria-label={`Info about ${name}${spec ? ` (${spec})` : ''}`}
        title="Skill info"
      >
        ?
      </button>
      {open ? (
        <div
          role="dialog"
          className="absolute z-50 left-0 top-full mt-1 w-80 max-w-[90vw] bg-white border border-gray-300 rounded-md shadow-lg p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-1 right-2 text-gray-400 hover:text-gray-700"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
          <SkillInfoCard name={name} {...(spec ? { spec } : {})} />
        </div>
      ) : null}
    </span>
  );
}
