import type { Career } from '../types';
import { summarizeEffect } from './effectPreview';

/**
 * Detail card for a career — flavor, qualification, assignments, key tables, mustering-out
 * preview. Shown in the career picker so players can read about a career before committing.
 */
export function CareerInfoCard({ career }: { career: Career }) {
  return (
    <div className="text-xs space-y-3">
      <p className="text-gray-700 leading-relaxed">{career.flavour}</p>

      <Section title="Qualification">
        <p className="text-gray-700">
          {career.qualification.special === 'automatic'
            ? 'Automatic — no qualification roll required.'
            : career.qualification.special === 'sentenced'
              ? 'Sentenced — special entry rules apply.'
              : `${career.qualification.check.char} ${career.qualification.check.target}+`}
          {career.qualification.perPreviousCareer
            ? `, ${career.qualification.perPreviousCareer >= 0 ? '+' : ''}${career.qualification.perPreviousCareer} per previous career`
            : ''}
          {career.qualification.ageDM
            ? `, ${career.qualification.ageDM.dm >= 0 ? '+' : ''}${career.qualification.ageDM.dm} at age ${career.qualification.ageDM.atLeastAge}+`
            : ''}
          {career.qualification.autoQualifyIf
            ? `. Auto-qualify with ${career.qualification.autoQualifyIf.char} ${career.qualification.autoQualifyIf.atLeast}+.`
            : ''}
        </p>
        {career.commission ? (
          <p className="text-gray-700">
            Commission: {career.commission.check.char} {career.commission.check.target}+
            {career.commission.socRelaxAtLeast
              ? `, available later terms with SOC ${career.commission.socRelaxAtLeast}+`
              : ''}
            .
          </p>
        ) : null}
      </Section>

      <Section title="Assignments">
        <ul className="space-y-1">
          {career.assignments.map((a) => (
            <li key={a.id}>
              <span className="font-medium">{a.name}</span>
              <span className="text-gray-600">
                {' '}— Survival {a.survival.char} {a.survival.target}+, Advancement {a.advancement.char}{' '}
                {a.advancement.target}+
              </span>
              <div className="text-gray-600">{a.description}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Service skills (sample)">
        <p className="text-gray-600">
          {career.skillTables.find((t) => t.id === 'service_skills')
            ? career.skillTables
                .find((t) => t.id === 'service_skills')!
                .rows.map((r) => summarizeEffect(r.effect))
                .join(' · ')
            : 'No general service skill table.'}
        </p>
      </Section>

      {career.skillTables.find((t) => t.id === 'advanced_education') ? (
        <Section title="Advanced education (EDU 8+ or table-specific)">
          <p className="text-gray-600">
            {career.skillTables
              .find((t) => t.id === 'advanced_education')!
              .rows.map((r) => summarizeEffect(r.effect))
              .join(' · ')}
          </p>
        </Section>
      ) : null}

      {career.flags?.military ? (
        <Section title="Officer">
          <p className="text-gray-600">
            {career.skillTables
              .find((t) => t.id === 'officer')
              ?.rows.map((r) => summarizeEffect(r.effect))
              .join(' · ') ?? '—'}
          </p>
        </Section>
      ) : null}

      <Section title="Mustering-out cash range">
        <p className="text-gray-600">
          Cr{Math.min(...career.musteringOut.cash.map((r) => r.cash ?? 0)).toLocaleString()} – Cr
          {Math.max(...career.musteringOut.cash.map((r) => r.cash ?? 0)).toLocaleString()} per cash benefit
          (rolls 1–{career.musteringOut.cash.length}).
        </p>
      </Section>

      <Section title="Mustering-out benefits">
        <p className="text-gray-600">
          {career.musteringOut.benefits.map((b) => b.label ?? (b.effect ? summarizeEffect(b.effect) : '—')).join(' · ')}
        </p>
      </Section>

      {career.flags?.noPension ? (
        <p className="text-amber-700 italic">No pension on retirement.</p>
      ) : null}
      {career.flags?.enforcedEntry ? (
        <p className="text-rose-700 italic">Cannot enter voluntarily.</p>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
