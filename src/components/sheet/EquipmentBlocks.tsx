import type { Augment, Armor, Character, Item, Weapon } from '../../types';
import { SheetPanel } from './SheetPanel';
import { EditableTable, type ColumnDef } from '../editable/EditableTable';
import { CataloguePicker } from '../CataloguePicker';
import { EQUIPMENT_TRAITS } from '../../data';

type AugmentRow = { id: string; name: string; tl: number; description: string };
type ArmourRow = { id: string; name: string; rad: string; protection: number; kg: string; description: string };
type WeaponRow = { id: string; name: string; tl: number; range: string; damage: string; kg: string; mag: string; description: string };
type EquipRow = { id: string; name: string; tl: number; kg: string; description: string };

const AUG_COLS: ColumnDef<AugmentRow>[] = [
  { key: 'name', label: 'Type', type: 'text', width: '40%' },
  { key: 'tl', label: 'TL', type: 'number', width: '10%' },
  { key: 'description', label: 'Traits', type: 'text' },
];

const ARM_COLS: ColumnDef<ArmourRow>[] = [
  { key: 'name', label: 'Type', type: 'text' },
  { key: 'rad', label: 'Rad.', type: 'text', width: '10%' },
  { key: 'protection', label: 'Protection', type: 'number', width: '15%' },
  { key: 'kg', label: 'KG', type: 'text', width: '10%' },
  { key: 'description', label: 'Options', type: 'text' },
];

const WEP_COLS: ColumnDef<WeaponRow>[] = [
  { key: 'name', label: 'Type', type: 'text' },
  { key: 'tl', label: 'TL', type: 'number', width: '8%' },
  { key: 'range', label: 'Range', type: 'text', width: '12%' },
  { key: 'damage', label: 'Damage', type: 'text', width: '14%' },
  { key: 'kg', label: 'KG', type: 'text', width: '8%' },
  { key: 'mag', label: 'Mag.', type: 'text', width: '8%' },
  { key: 'description', label: 'Traits', type: 'text' },
];

const EQ_COLS: ColumnDef<EquipRow>[] = [
  { key: 'name', label: 'Type', type: 'text' },
  { key: 'tl', label: 'TL', type: 'number', width: '10%' },
  { key: 'kg', label: 'KG', type: 'text', width: '10%' },
  { key: 'description', label: 'Notes', type: 'text' },
];

type Props = { character: Character; onChange?: (next: Character) => void };

const formatTraits = (traits: { trait: string; rating?: number }[]): string =>
  traits
    .map((t) => {
      const def = EQUIPMENT_TRAITS[t.trait as keyof typeof EQUIPMENT_TRAITS];
      const short = def?.shortName ?? t.trait;
      return t.rating !== undefined ? `${short} ${t.rating}` : short;
    })
    .join(', ');

/* ─────────────── Augments ─────────────── */
export function AugmentsBlock({ character, onChange }: Props) {
  if (!onChange) {
    return (
      <SheetPanel badge="Augments">
        <ReadOnlyTable
          cols={['TYPE', 'TL', 'TRAITS']}
          rows={character.augments.map((a) => [a.name, a.tl ?? '', a.description ?? ''])}
          emptyRows={3}
        />
      </SheetPanel>
    );
  }
  const rows: AugmentRow[] = character.augments.map((a: Augment) => ({
    id: a.id,
    name: a.name,
    tl: a.tl ?? 0,
    description: a.description ?? '',
  }));
  const writeBack = (rs: AugmentRow[]) =>
    onChange({ ...character, augments: rs.map((r) => ({ id: r.id, name: r.name, tl: r.tl, description: r.description })) });
  return (
    <SheetPanel badge="Augments">
      <EditableTable
        rows={rows}
        columns={AUG_COLS}
        onChange={writeBack}
        emptyRows={3}
        blank={() => ({ name: '', tl: 0, description: '' })}
      />
      <div className="mt-1">
        <CataloguePicker
          kind="augment"
          label="+ Pick augment from catalogue"
          onSelect={(a) =>
            writeBack([
              ...rows,
              {
                id: crypto.randomUUID(),
                name: a.name + (a.variant ? ` (${a.variant})` : ''),
                tl: a.tl,
                description: a.improvement + (a.description ? ` — ${a.description}` : ''),
              },
            ])
          }
        />
      </div>
    </SheetPanel>
  );
}

/* ─────────────── Armour ─────────────── */
export function ArmourBlock({ character, onChange }: Props) {
  if (!onChange) {
    return (
      <SheetPanel badge="Armour">
        <ReadOnlyTable
          cols={['TYPE', 'RAD.', 'PROTECTION', 'KG', 'OPTIONS']}
          rows={character.armor.map((a) => [a.name, '', a.protection ?? '', '', a.description ?? ''])}
          emptyRows={3}
        />
      </SheetPanel>
    );
  }
  const rows: ArmourRow[] = character.armor.map((a: Armor) => ({
    id: a.id,
    name: a.name,
    rad: '',
    protection: a.protection ?? 0,
    kg: '',
    description: a.description ?? '',
  }));
  const writeBack = (rs: ArmourRow[]) =>
    onChange({
      ...character,
      armor: rs.map((r) => ({ id: r.id, name: r.name, protection: r.protection, description: r.description })),
    });
  return (
    <SheetPanel badge="Armour">
      <EditableTable
        rows={rows}
        columns={ARM_COLS}
        onChange={writeBack}
        emptyRows={3}
        blank={() => ({ name: '', rad: '', protection: 0, kg: '', description: '' })}
      />
      <div className="mt-1">
        <CataloguePicker
          kind="armour"
          label="+ Pick armour from catalogue"
          onSelect={(a) =>
            writeBack([
              ...rows,
              {
                id: crypto.randomUUID(),
                name: a.name + (a.variant ? ` (${a.variant})` : ''),
                rad: a.rad?.toString() ?? '—',
                protection: a.protection,
                kg: a.mass.toString(),
                description: [a.protectionNote, a.notes].filter(Boolean).join(' · '),
              },
            ])
          }
        />
      </div>
    </SheetPanel>
  );
}

/* ─────────────── Weapons ─────────────── */
export function WeaponsBlock({ character, onChange }: Props) {
  if (!onChange) {
    return (
      <SheetPanel badge="Weapons">
        <ReadOnlyTable
          cols={['TYPE', 'TL', 'RANGE', 'DAMAGE', 'KG', 'MAG.', 'TRAITS']}
          rows={character.weapons.map((w) => [w.name, w.tl ?? '', w.range ?? '', w.damage ?? '', '', '', w.description ?? ''])}
          emptyRows={4}
        />
      </SheetPanel>
    );
  }
  const rows: WeaponRow[] = character.weapons.map((w: Weapon) => ({
    id: w.id,
    name: w.name,
    tl: w.tl ?? 0,
    range: w.range ?? '',
    damage: w.damage ?? '',
    kg: '',
    mag: '',
    description: w.description ?? '',
  }));
  const writeBack = (rs: WeaponRow[]) =>
    onChange({
      ...character,
      weapons: rs.map((r) => ({ id: r.id, name: r.name, tl: r.tl, range: r.range, damage: r.damage, description: r.description })),
    });
  return (
    <SheetPanel badge="Weapons">
      <EditableTable
        rows={rows}
        columns={WEP_COLS}
        onChange={writeBack}
        emptyRows={4}
        blank={() => ({ name: '', tl: 0, range: '', damage: '', kg: '', mag: '', description: '' })}
      />
      <div className="mt-1">
        <CataloguePicker
          kind="weapon"
          label="+ Pick weapon from catalogue"
          onSelect={(w) =>
            writeBack([
              ...rows,
              {
                id: crypto.randomUUID(),
                name: w.name + (w.variant ? ` (${w.variant})` : ''),
                tl: w.tl,
                range: w.range,
                damage: w.damage,
                kg: w.mass.toString(),
                mag: w.magazine?.toString() ?? '',
                description: formatTraits(w.traits) || (w.description ?? ''),
              },
            ])
          }
        />
      </div>
    </SheetPanel>
  );
}

/* ─────────────── Equipment ─────────────── */
export function EquipmentBlock({ character, onChange }: Props) {
  if (!onChange) {
    return (
      <SheetPanel badge="Equipment">
        <ReadOnlyTable
          cols={['TYPE', 'TL', 'KG', 'NOTES']}
          rows={character.equipment.map((e) => [e.name, e.tl ?? '', '', e.description ?? ''])}
          emptyRows={6}
        />
      </SheetPanel>
    );
  }
  const rows: EquipRow[] = character.equipment.map((e: Item) => ({
    id: e.id,
    name: e.name,
    tl: e.tl ?? 0,
    kg: '',
    description: e.description ?? '',
  }));
  const writeBack = (rs: EquipRow[]) =>
    onChange({
      ...character,
      equipment: rs.map((r) => ({ id: r.id, name: r.name, tl: r.tl, description: r.description })),
    });
  return (
    <SheetPanel badge="Equipment">
      <EditableTable
        rows={rows}
        columns={EQ_COLS}
        onChange={writeBack}
        emptyRows={6}
        blank={() => ({ name: '', tl: 0, kg: '', description: '' })}
      />
      <div className="mt-1">
        <CataloguePicker
          kind="gear"
          label="+ Pick gear from catalogue"
          onSelect={(g) =>
            writeBack([
              ...rows,
              {
                id: crypto.randomUUID(),
                name: g.name + (g.variant ? ` (${g.variant})` : ''),
                tl: g.tl,
                kg: g.mass !== undefined ? g.mass.toString() : '',
                description: g.description ?? '',
              },
            ])
          }
        />
      </div>
    </SheetPanel>
  );
}

function ReadOnlyTable({
  cols,
  rows,
  emptyRows,
}: {
  cols: string[];
  rows: (string | number)[][];
  emptyRows: number;
}) {
  const padded: (string | number | null)[][] = [...rows];
  while (padded.length < rows.length + emptyRows) padded.push(cols.map(() => null));
  return (
    <table className="w-full text-[11px]">
      <thead>
        <tr className="text-left text-gray-500 uppercase tracking-wider text-[9px]">
          {cols.map((c) => (
            <th key={c} className="font-semibold py-0.5 pr-2 border-b border-gray-300">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {padded.map((row, i) => (
          <tr key={i} className="border-b border-dotted border-gray-200">
            {row.map((cell, j) => (
              <td key={j} className="py-1 pr-2 align-top text-gray-800">
                {cell ?? <span>&nbsp;</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
