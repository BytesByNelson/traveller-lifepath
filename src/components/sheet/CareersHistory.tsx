import type { CareerTerm, Character } from '../../types';
import { CAREERS } from '../../data';
import { SheetPanel } from './SheetPanel';

export function CareersHistory({ character }: { character: Character }) {
  return (
    <SheetPanel title="Careers">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-left text-gray-500 uppercase tracking-wider text-[9px]">
            <th className="py-0.5 pr-2 border-b border-gray-300 w-12">Term</th>
            <th className="py-0.5 pr-2 border-b border-gray-300">Career</th>
            <th className="py-0.5 pr-2 border-b border-gray-300 w-12">Surv.</th>
            <th className="py-0.5 pr-2 border-b border-gray-300 w-12">Adv.</th>
            <th className="py-0.5 pr-2 border-b border-gray-300 w-24">Rank</th>
            <th className="py-0.5 pr-2 border-b border-gray-300">Notes</th>
          </tr>
        </thead>
        <tbody>
          {character.careerHistory.map((t) => (
            <tr key={t.index} className="border-b border-dotted border-gray-200 align-top">
              <td className="py-1 pr-2">{t.index + 1}</td>
              <td className="py-1 pr-2">
                {CAREERS[t.career].name} <span className="text-gray-500">({assignmentName(t)})</span>
              </td>
              <td className="py-1 pr-2 text-center">{markFor(t.survival.success)}</td>
              <td className="py-1 pr-2 text-center">
                {t.advancement ? markFor(t.advancement.success) : <span className="text-gray-400">—</span>}
              </td>
              <td className="py-1 pr-2">
                {rankTitle(t)} <span className="text-gray-500">({t.rankAtEnd})</span>
                {t.isOfficer ? <span className="text-[9px] uppercase text-indigo-600 ml-1">officer</span> : null}
              </td>
              <td className="py-1 pr-2 text-[10px] text-gray-600">
                {t.termOutcome === 'continued' ? '' : t.termOutcome.replace('_', ' ')}
              </td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 6 - character.careerHistory.length) }).map((_, i) => (
            <tr key={`pad-${i}`} className="border-b border-dotted border-gray-200">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <td key={j} className="py-1 pr-2">&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SheetPanel>
  );
}

const markFor = (success: boolean): string => (success ? '✓' : '✗');

function assignmentName(t: CareerTerm): string {
  return CAREERS[t.career].assignments.find((a) => a.id === t.assignment)?.name ?? t.assignment;
}

function rankTitle(t: CareerTerm): string {
  const career = CAREERS[t.career];
  const ranks = t.isOfficer
    ? career.ranks.officer
    : career.ranks[t.assignment] ?? career.ranks.enlisted;
  if (!ranks) return '';
  return ranks.find((r) => r.rank === t.rankAtEnd)?.title ?? '';
}
