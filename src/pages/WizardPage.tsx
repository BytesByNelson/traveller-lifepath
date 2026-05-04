import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacterWithUndo } from '../store/useCharacterWithUndo';
import { BasicsStep } from '../wizard/BasicsStep';
import { CharacteristicsStep } from '../wizard/CharacteristicsStep';
import { BackgroundSkillsStep } from '../wizard/BackgroundSkillsStep';
import { CareerTermStep } from '../wizard/CareerTermStep';
import { BetweenTermsStep } from '../wizard/BetweenTermsStep';
import { MusteringOutStep } from '../wizard/MusteringOutStep';
import { SkillPackageStep } from '../wizard/SkillPackageStep';
import { ReviewStep } from '../wizard/ReviewStep';
import { PreCareerEducationStep } from '../wizard/PreCareerEducationStep';
import { RollLog } from '../components/RollLog';
import { RollLogViewer } from '../components/RollLogViewer';
import { ExportButton } from '../components/ExportButton';
import { UndoButton } from '../components/UndoButton';
import type { Character, WizardStep } from '../types';

export function WizardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { character, setCharacter, undo, canUndo, depth } = useCharacterWithUndo(id ?? '');
  const [logOpen, setLogOpen] = useState(false);

  if (!id) return null;
  if (!character) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-500">No Traveller with that ID. They may have been lost on a jump.</p>
        <button onClick={() => navigate('/')} className="mt-3 text-indigo-600 hover:underline text-sm">
          ← Back to list
        </button>
      </main>
    );
  }

  const step = character.wizardState?.step ?? 'basics';
  const setStep = (s: WizardStep) =>
    setCharacter({ ...character, wizardState: { ...(character.wizardState ?? {}), step: s } });

  return (
    <main className="max-w-5xl mx-auto p-3 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="md:col-span-2 space-y-4">
        <header className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:underline">
              ← Travellers
            </button>
            <h1 className="text-xl md:text-2xl font-semibold mt-1">
              {character.name || <span className="text-gray-400">New Traveller</span>}
            </h1>
          </div>
          <div className="flex gap-2 items-baseline">
            <UndoButton onUndo={undo} disabled={!canUndo} depth={depth} />
            <ExportButton character={character} />
          </div>
        </header>

        <Stepper step={step} />

        {step === 'basics' && (
          <BasicsStep character={character} onChange={setCharacter} onNext={() => setStep('characteristics')} />
        )}
        {step === 'characteristics' && (
          <CharacteristicsStep
            character={character}
            onChange={setCharacter}
            onBack={() => setStep('basics')}
            onNext={() => setStep('background_skills')}
          />
        )}
        {step === 'background_skills' && (
          <BackgroundSkillsStep
            character={character}
            onChange={setCharacter}
            onBack={() => setStep('characteristics')}
            onNext={() => setStep('pre_career_education')}
          />
        )}
        {step === 'pre_career_education' && (
          <PreCareerEducationStep
            character={character}
            onChange={setCharacter}
            onSkip={() => setStep('career_term')}
            onComplete={() => setStep('career_term')}
          />
        )}
        {step === 'career_term' && (
          <CareerTermStep
            character={character}
            onChange={setCharacter}
            onBack={() => setStep('background_skills')}
            onTermComplete={(c) => {
              setCharacter({ ...c, wizardState: { ...(c.wizardState ?? {}), step: 'between_terms' } });
            }}
          />
        )}
        {step === 'between_terms' && (
          <BetweenTermsStep
            character={character}
            onChange={setCharacter}
            onContinueSame={() => setStep('career_term')}
            onChangeAssignment={() => setStep('career_term')}
            onChangeCareer={() => setStep('career_term')}
            onMusterOut={() => setStep('mustering_out')}
          />
        )}
        {step === 'mustering_out' && (
          <MusteringOutStep character={character} onChange={setCharacter} onDone={() => setStep('skill_package')} />
        )}
        {step === 'skill_package' && (
          <SkillPackageStep character={character} onChange={setCharacter} onDone={() => setStep('review')} />
        )}
        {step === 'review' && (
          <ReviewStep
            character={character}
            onBack={() => setStep('skill_package')}
            onFinalize={() => {
              setCharacter({ ...character, wizardState: { ...character.wizardState, step: 'done' } });
              navigate(`/sheet/${character.id}`);
            }}
          />
        )}
        {step === 'done' && (
          <section className="space-y-3">
            <p className="text-gray-600">Character creation complete.</p>
            <button
              onClick={() => navigate(`/sheet/${character.id}`)}
              className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Go to character sheet
            </button>
          </section>
        )}
      </div>

      <aside className="space-y-4 md:col-span-1">
        <SidebarSummary character={character} />
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Roll log</h3>
            <button onClick={() => setLogOpen(true)} className="text-xs text-indigo-600 hover:text-indigo-800">
              Open full log
            </button>
          </div>
          <RollLog entries={character.rollLog.slice().reverse().slice(0, 8)} />
        </div>
      </aside>

      {logOpen ? <RollLogViewer entries={character.rollLog} onClose={() => setLogOpen(false)} /> : null}
    </main>
  );
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'characteristics', label: 'Stats' },
  { id: 'background_skills', label: 'Background' },
  { id: 'pre_career_education', label: 'Education' },
  { id: 'career_term', label: 'Career' },
  { id: 'between_terms', label: 'Between' },
  { id: 'mustering_out', label: 'Mustering' },
  { id: 'skill_package', label: 'Package' },
  { id: 'review', label: 'Review' },
];

function Stepper({ step }: { step: WizardStep }) {
  return (
    <ol className="flex flex-wrap gap-1.5 text-xs">
      {STEPS.map((s, i) => {
        const idx = STEPS.findIndex((x) => x.id === step);
        const done = i < idx;
        const active = i === idx;
        return (
          <li
            key={s.id}
            className={`px-2 py-1 rounded ${
              active
                ? 'bg-indigo-600 text-white'
                : done
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

function SidebarSummary({ character }: { character: Character }) {
  const skills = useMemo(
    () =>
      character.backgroundSkills
        .slice()
        .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name)),
    [character.backgroundSkills],
  );
  return (
    <div className="space-y-3 text-sm">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Characteristics</h3>
        <ul className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 gap-1 text-xs font-mono">
          {(['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'] as const).map((c) => (
            <li key={c} className="px-2 py-1 bg-gray-50 rounded text-center">
              {c} {character.characteristics[c]}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Skills</h3>
        {skills.length === 0 ? (
          <p className="text-xs text-gray-500 italic">None yet.</p>
        ) : (
          <ul className="text-xs space-y-0.5">
            {skills.map((s) => (
              <li key={`${s.name}|${s.spec ?? ''}`}>
                {s.name}
                {s.spec ? ` (${s.spec})` : ''}{' '}
                <span className="text-gray-500">{s.level}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Connections</h3>
        {(['contacts', 'allies', 'rivals', 'enemies'] as const).every(
          (k) => character.connections[k].length === 0,
        ) ? (
          <p className="text-xs text-gray-500 italic">None.</p>
        ) : (
          <ul className="text-xs space-y-0.5">
            {(['contacts', 'allies', 'rivals', 'enemies'] as const).map((kind) => {
              const list = character.connections[kind];
              if (list.length === 0) return null;
              return (
                <li key={kind}>
                  <span className="text-gray-500 capitalize">{kind}:</span>{' '}
                  {list.map((c) => c.description || '(unnamed)').join(', ')}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {character.careerHistory.length > 0 ? (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Career history</h3>
          <ul className="text-xs space-y-0.5">
            {character.careerHistory.map((t) => (
              <li key={t.index}>
                Term {t.index + 1}: {t.career} — {t.assignment} (rank {t.rankAtEnd}
                {t.isOfficer ? ', officer' : ''})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
