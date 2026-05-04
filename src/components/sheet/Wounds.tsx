import type { Character, Injury } from '../../types';
import { SheetPanel } from './SheetPanel';
import { EditableTable, type ColumnDef } from '../editable/EditableTable';

type WoundRow = {
  id: string;
  type: string;
  location: string;
  recoveryPeriod: string;
  notes: string;
};

const COLS: ColumnDef<WoundRow>[] = [
  { key: 'type', label: 'Type', type: 'text', width: '30%' },
  { key: 'location', label: 'Location', type: 'text', width: '20%' },
  { key: 'recoveryPeriod', label: 'Recovery period', type: 'text', width: '20%' },
  { key: 'notes', label: 'Notes', type: 'text' },
];

export function Wounds({ character, onChange }: { character: Character; onChange?: (next: Character) => void }) {
  const editable = !!onChange;
  if (!editable) {
    const rows = character.injuries.map((inj) => [inj.description, '', '', inj.restored ? 'restored' : '']);
    while (rows.length < 4) rows.push(['', '', '', '']);
    return (
      <SheetPanel title="Wounds">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-gray-500 uppercase tracking-wider text-[9px]">
              <th className="font-semibold py-0.5 pr-2 border-b border-gray-300">Type</th>
              <th className="font-semibold py-0.5 pr-2 border-b border-gray-300">Location</th>
              <th className="font-semibold py-0.5 pr-2 border-b border-gray-300">Recovery period</th>
              <th className="font-semibold py-0.5 pr-2 border-b border-gray-300">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-dotted border-gray-200">
                {row.map((cell, j) => (
                  <td key={j} className="py-1 pr-2 align-top text-gray-800">
                    {cell || <span>&nbsp;</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </SheetPanel>
    );
  }

  // Editable: project Injury records to flat rows; on edit, write back.
  const rows: WoundRow[] = character.injuries.map(toRow);

  const writeBack = (rows: WoundRow[]) => {
    const updated: Injury[] = rows.map((r) => fromRow(r, character.injuries.find((i) => i.id === r.id)));
    onChange!({ ...character, injuries: updated });
  };

  return (
    <SheetPanel title="Wounds">
      <EditableTable
        rows={rows}
        columns={COLS}
        onChange={writeBack}
        emptyRows={4}
        blank={() => ({ type: '', location: '', recoveryPeriod: '', notes: '' })}
      />
    </SheetPanel>
  );
}

const toRow = (inj: Injury): WoundRow => ({
  id: inj.id,
  type: inj.description,
  location: '',
  recoveryPeriod: '',
  notes: inj.restored ? 'restored' : '',
});

const fromRow = (r: WoundRow, original: Injury | undefined): Injury => ({
  id: r.id,
  description: r.type,
  termIndex: original?.termIndex ?? 0,
  charReductions: original?.charReductions ?? {},
  ...(r.notes.toLowerCase().includes('restored') ? { restored: true } : {}),
});
