import { useState } from 'react';
import type { Character, SkillName } from '../types';
import { MILITARY_ACADEMY, UNIVERSITY } from '../data';
import {
  startMilitaryAcademyEntry,
  startMilitaryAcademyGraduation,
  startPreCareerEvent,
  startUniversityEntry,
  startUniversityGraduation,
  type EngineState,
} from '../engine';
import { PendingPrompt } from '../components/PendingPrompt';

type Track = 'university' | 'army' | 'marine' | 'navy';

type Phase =
  | { kind: 'choose' }
  | { kind: 'university_skills'; level0?: SkillName; level1?: SkillName }
  | { kind: 'entry_check'; track: Track; engine: EngineState }
  | { kind: 'event'; track: Track; engine: EngineState }
  | { kind: 'graduation_check'; track: Track; engine: EngineState }
  | { kind: 'done' };

export function PreCareerEducationStep({
  character,
  onChange,
  onSkip,
  onComplete,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: 'choose' });
  const termIndex = character.careerHistory.length;

  if (phase.kind === 'choose') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pre-career education</h2>
        <p className="text-sm text-gray-600">
          Optional. Available for terms 1–3. Skip to go straight to your first career.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <TrackButton
            title="University"
            subtitle={`Entry: EDU ${UNIVERSITY.entry.check.target}+`}
            onClick={() => setPhase({ kind: 'university_skills' })}
          />
          <TrackButton
            title="Army Academy"
            subtitle={`Entry: END ${MILITARY_ACADEMY.entry.army.check.target}+`}
            onClick={() => {
              const state = startMilitaryAcademyEntry(character, 'army', termIndex, Math.random);
              setPhase({ kind: 'entry_check', track: 'army', engine: state });
            }}
          />
          <TrackButton
            title="Marine Academy"
            subtitle={`Entry: END ${MILITARY_ACADEMY.entry.marine.check.target}+`}
            onClick={() => {
              const state = startMilitaryAcademyEntry(character, 'marine', termIndex, Math.random);
              setPhase({ kind: 'entry_check', track: 'marine', engine: state });
            }}
          />
          <TrackButton
            title="Navy Academy"
            subtitle={`Entry: INT ${MILITARY_ACADEMY.entry.navy.check.target}+`}
            onClick={() => {
              const state = startMilitaryAcademyEntry(character, 'navy', termIndex, Math.random);
              setPhase({ kind: 'entry_check', track: 'navy', engine: state });
            }}
          />
        </div>
        <button onClick={onSkip} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Skip pre-career education
        </button>
      </section>
    );
  }

  if (phase.kind === 'university_skills') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">University — pick skills</h2>
        <p className="text-sm text-gray-600">
          Choose one skill at level 0 and one at level 1 from the university list. Both are bumped on graduation.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Picker
            label="Level 0 skill"
            value={phase.level0}
            options={UNIVERSITY.skillPickList}
            onChange={(v) => setPhase({ ...phase, level0: v })}
          />
          <Picker
            label="Level 1 skill"
            value={phase.level1}
            options={UNIVERSITY.skillPickList}
            onChange={(v) => setPhase({ ...phase, level1: v })}
          />
        </div>

        <button
          disabled={!phase.level0 || !phase.level1 || phase.level0 === phase.level1}
          onClick={() => {
            const next = grantSkillsForUniversity(character, phase.level0!, phase.level1!);
            onChange(next);
            const state = startUniversityEntry(next, termIndex, Math.random);
            setPhase({ kind: 'entry_check', track: 'university', engine: state });
          }}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          Continue → Entry roll
        </button>
      </section>
    );
  }

  if (phase.kind === 'entry_check') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{trackLabel(phase.track)} — entry</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const last = s.character.rollLog.filter((r) => r.target !== undefined).at(-1);
              if (last?.success) {
                const event = startPreCareerEvent(s.character, Math.random);
                setPhase({ kind: 'event', track: phase.track, engine: event });
              } else {
                // Failed entry — return to chooser to allow another track or skip.
                setPhase({ kind: 'choose' });
              }
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  if (phase.kind === 'event') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pre-career event</h2>
        {phase.engine.prompt ? (
          <PendingPrompt
            state={phase.engine}
            onUpdate={(s) => {
              onChange(s.character);
              setPhase({ ...phase, engine: s });
            }}
          />
        ) : (
          <button
            onClick={() => {
              const grad =
                phase.track === 'university'
                  ? startUniversityGraduation(character, Math.random)
                  : startMilitaryAcademyGraduation(character, Math.random);
              setPhase({ kind: 'graduation_check', track: phase.track, engine: grad });
            }}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Continue → Graduation
          </button>
        )}
      </section>
    );
  }

  if (phase.kind === 'graduation_check') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{trackLabel(phase.track)} — graduation</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const last = s.character.rollLog.filter((r) => r.target !== undefined).at(-1);
              const success = !!last?.success;
              const honourThreshold =
                phase.track === 'university'
                  ? UNIVERSITY.graduationHonoursAtLeast
                  : MILITARY_ACADEMY.graduationHonoursAtLeast;
              const honours = (last?.result ?? 0) >= honourThreshold;
              const next = applyGraduationBenefits(s.character, phase.track, success, honours);
              onChange(next);
              setPhase({ kind: 'done' });
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Pre-career education complete</h2>
      <button
        onClick={onComplete}
        className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
      >
        Continue → Career term
      </button>
    </section>
  );
}

function TrackButton({ title, subtitle, onClick }: { title: string; subtitle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 text-left">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </button>
  );
}

function Picker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: SkillName | undefined;
  options: readonly SkillName[];
  onChange: (v: SkillName) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-600">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as SkillName)}
        className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="" disabled>
          Pick a skill
        </option>
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

const trackLabel = (track: Track): string =>
  track === 'university' ? 'University' : `${track[0]!.toUpperCase()}${track.slice(1)} Academy`;

function grantSkillsForUniversity(c: Character, level0: SkillName, level1: SkillName): Character {
  const list = [...c.backgroundSkills];
  for (const [name, level] of [[level0, 0], [level1, 1]] as const) {
    const idx = list.findIndex((s) => s.name === name && !s.spec);
    if (idx === -1) {
      list.push({ name, level, source: { kind: 'pre_career_education', institution: 'university' } });
    } else if (level > list[idx]!.level) {
      list[idx] = { ...list[idx]!, level };
    }
  }
  return { ...c, backgroundSkills: list };
}

function applyGraduationBenefits(
  c: Character,
  track: Track,
  graduated: boolean,
  honours: boolean,
): Character {
  let next = c;
  const wizardState = next.wizardState ?? { step: 'pre_career_education' };
  if (track === 'university') {
    if (graduated) {
      // EDU +1, +1 to each chosen skill (we apply the +1 to whichever level0/level1 entries were marked university)
      next = { ...next, characteristics: { ...next.characteristics, EDU: next.characteristics.EDU + 1 } };
      next = {
        ...next,
        backgroundSkills: next.backgroundSkills.map((s) =>
          s.source.kind === 'pre_career_education' && s.source.institution === 'university'
            ? { ...s, level: s.level + 1 }
            : s,
        ),
      };
      next = {
        ...next,
        wizardState: {
          ...wizardState,
          preCareerBonus: {
            qualifyDM: {
              dm: honours ? UNIVERSITY.graduationCareerBonusDMHonours : UNIVERSITY.graduationCareerBonusDM,
              careers: [...UNIVERSITY.bonusCareers],
              assignmentSpecific: UNIVERSITY.bonusAssignmentSpecific.map((x) => ({ ...x })),
            },
            commission: { dm: UNIVERSITY.commissionDM, auto: honours },
          },
        },
      };
    }
  } else {
    const branch = track;
    if (graduated) {
      next = { ...next, characteristics: { ...next.characteristics, EDU: next.characteristics.EDU + 1 } };
      if (honours) {
        next = { ...next, characteristics: { ...next.characteristics, SOC: next.characteristics.SOC + 1 } };
      }
      next = {
        ...next,
        wizardState: {
          ...wizardState,
          preCareerBonus: {
            qualifyDM: { dm: 0, careers: [] },
            commission: { dm: MILITARY_ACADEMY.graduationBenefits.commissionDM, auto: honours, tiedTo: branch },
            autoEntry: { career: branch, commissionAllowed: true },
          },
        },
      };
    } else {
      // Non-fatal failure: still allows auto-entry to the tied military career (no commission).
      const last = next.rollLog.filter((r) => r.target !== undefined).at(-1);
      if ((last?.result ?? 0) >= MILITARY_ACADEMY.failsafeAutoEntryFloor) {
        next = {
          ...next,
          wizardState: {
            ...wizardState,
            preCareerBonus: {
              qualifyDM: { dm: 0, careers: [] },
              autoEntry: { career: branch, commissionAllowed: false },
            },
          },
        };
      }
    }
  }
  return next;
}
