import { useState } from 'react';
import type { Character, SkillEntry, SkillName } from '../../types';
import { SKILLS } from '../../data';
import { SheetPanel } from './SheetPanel';
import { EditableNumber } from '../editable/EditableNumber';

const PRINTED_SLOTS: { name: SkillName; slotsForSpecs: number }[] = [
  { name: 'Admin', slotsForSpecs: 0 },
  { name: 'Advocate', slotsForSpecs: 0 },
  { name: 'Animals', slotsForSpecs: 3 },
  { name: 'Art', slotsForSpecs: 3 },
  { name: 'Astrogation', slotsForSpecs: 0 },
  { name: 'Athletics', slotsForSpecs: 3 },
  { name: 'Broker', slotsForSpecs: 0 },
  { name: 'Carouse', slotsForSpecs: 0 },
  { name: 'Deception', slotsForSpecs: 0 },
  { name: 'Diplomat', slotsForSpecs: 0 },
  { name: 'Drive', slotsForSpecs: 3 },
  { name: 'Electronics', slotsForSpecs: 3 },
  { name: 'Engineer', slotsForSpecs: 3 },
  { name: 'Explosives', slotsForSpecs: 0 },
  { name: 'Flyer', slotsForSpecs: 3 },
  { name: 'Gambler', slotsForSpecs: 0 },
  { name: 'Gunner', slotsForSpecs: 3 },
  { name: 'Gun Combat', slotsForSpecs: 3 },
  { name: 'Heavy Weapons', slotsForSpecs: 3 },
  { name: 'Investigate', slotsForSpecs: 0 },
  { name: 'Jack-of-all-Trades', slotsForSpecs: 0 },
  { name: 'Language', slotsForSpecs: 3 },
  { name: 'Leadership', slotsForSpecs: 0 },
  { name: 'Mechanic', slotsForSpecs: 0 },
  { name: 'Medic', slotsForSpecs: 0 },
  { name: 'Melee', slotsForSpecs: 3 },
  { name: 'Navigation', slotsForSpecs: 0 },
  { name: 'Persuade', slotsForSpecs: 0 },
  { name: 'Pilot', slotsForSpecs: 3 },
  { name: 'Profession', slotsForSpecs: 3 },
  { name: 'Recon', slotsForSpecs: 0 },
  { name: 'Science', slotsForSpecs: 3 },
  { name: 'Seafarer', slotsForSpecs: 3 },
  { name: 'Stealth', slotsForSpecs: 0 },
  { name: 'Steward', slotsForSpecs: 0 },
  { name: 'Streetwise', slotsForSpecs: 0 },
  { name: 'Survival', slotsForSpecs: 0 },
  { name: 'Tactics', slotsForSpecs: 3 },
  { name: 'Vacc Suit', slotsForSpecs: 0 },
];

export function SkillsList({
  character,
  onChange,
}: {
  character: Character;
  onChange?: (next: Character) => void;
}) {
  const editable = !!onChange;
  const rows = layoutRows(character.backgroundSkills);
  const cols = chunk(rows, Math.ceil(rows.length / 3));

  const setLevel = (name: SkillName, spec: string | undefined, level: number) => {
    if (!onChange) return;
    const idx = character.backgroundSkills.findIndex(
      (s) => s.name === name && (s.spec ?? '') === (spec ?? ''),
    );
    if (level <= 0) {
      // Remove if exists
      if (idx === -1) return;
      onChange({ ...character, backgroundSkills: character.backgroundSkills.filter((_, i) => i !== idx) });
      return;
    }
    const list = [...character.backgroundSkills];
    if (idx === -1) {
      list.push({ name, ...(spec ? { spec } : {}), level, source: { kind: 'manual' } });
    } else {
      list[idx] = { ...list[idx]!, level };
    }
    onChange({ ...character, backgroundSkills: list });
  };

  return (
    <SheetPanel badge="Skills">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-0 text-xs print:grid-cols-3">
        {cols.map((col, i) => (
          <ul key={i} className="space-y-0.5">
            {col.map((row, j) => (
              <li key={j} className="flex items-baseline gap-1 leading-tight">
                <span className={`flex-1 truncate ${row.spec ? 'pl-3 text-gray-700' : 'text-gray-900'}`}>
                  {row.spec ? <span className="text-gray-400">→ </span> : null}
                  {row.label}
                </span>
                <span className="font-mono text-gray-600 shrink-0">
                  {row.label && editable ? (
                    <span>
                      [
                      <EditableNumber
                        value={row.level ?? 0}
                        onChange={(v) => setLevel(row.parentName, row.specName, v)}
                        min={0}
                        max={9}
                        size={1}
                        ariaLabel={`Level for ${row.label}`}
                      />
                      ]
                    </span>
                  ) : (
                    `[${row.level ?? ' '}]`
                  )}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {editable ? <AddSkillRow onAdd={(ref) => setLevel(ref.name, ref.spec, 1)} /> : null}
    </SheetPanel>
  );
}

function AddSkillRow({ onAdd }: { onAdd: (ref: { name: SkillName; spec?: string }) => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState<SkillName>('Admin');
  const [spec, setSpec] = useState<string>('');

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 print:hidden"
      >
        + Add skill
      </button>
    );
  }
  const def = SKILLS[name];
  return (
    <div className="mt-2 print:hidden flex flex-wrap gap-1 items-center text-xs">
      <select value={name} onChange={(e) => { setName(e.target.value as SkillName); setSpec(''); }} className="px-1 py-0.5 border border-gray-300 rounded">
        {(Object.keys(SKILLS) as SkillName[]).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      {def.specs.length > 0 ? (
        <select value={spec} onChange={(e) => setSpec(e.target.value)} className="px-1 py-0.5 border border-gray-300 rounded">
          <option value="">(no spec)</option>
          {def.specs.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ) : null}
      <button
        onClick={() => {
          onAdd({ name, ...(spec ? { spec } : {}) });
          setAdding(false);
          setName('Admin');
          setSpec('');
        }}
        className="px-2 py-0.5 rounded bg-indigo-600 text-white"
      >
        Add at level 1
      </button>
      <button onClick={() => setAdding(false)} className="px-2 py-0.5 rounded border border-gray-300">Cancel</button>
    </div>
  );
}

type Row = {
  label: string;
  level?: number;
  spec: boolean;
  parentName: SkillName;
  specName?: string;
};

function layoutRows(entries: SkillEntry[]): Row[] {
  const byParent = new Map<SkillName, SkillEntry[]>();
  const extras: SkillEntry[] = [];
  for (const e of entries) {
    if (SKILLS[e.name]) {
      const list = byParent.get(e.name) ?? [];
      list.push(e);
      byParent.set(e.name, list);
    } else {
      extras.push(e);
    }
  }

  const rows: Row[] = [];
  for (const slot of PRINTED_SLOTS) {
    const matches = byParent.get(slot.name) ?? [];
    const parentEntry = matches.find((m) => !m.spec);
    rows.push({
      label: slot.name,
      ...(parentEntry ? { level: parentEntry.level } : {}),
      spec: false,
      parentName: slot.name,
    });
    if (slot.slotsForSpecs > 0) {
      const specs = matches.filter((m) => m.spec);
      for (let i = 0; i < slot.slotsForSpecs; i++) {
        const spec = specs[i];
        rows.push({
          label: spec ? `(${spec.spec})` : '',
          ...(spec ? { level: spec.level } : {}),
          spec: true,
          parentName: slot.name,
          ...(spec?.spec ? { specName: spec.spec } : {}),
        });
      }
    }
  }

  // Overflow specs (beyond the printed slots) and unknown skills append at the bottom.
  const overflowSpecs: { name: SkillName; entry: SkillEntry }[] = [];
  for (const [name, list] of byParent) {
    const slot = PRINTED_SLOTS.find((p) => p.name === name);
    if (!slot) continue;
    const overflow = list.filter((e) => e.spec).slice(slot.slotsForSpecs);
    overflow.forEach((entry) => overflowSpecs.push({ name, entry }));
  }
  for (const o of overflowSpecs) {
    rows.push({
      label: `${o.name} (${o.entry.spec})`,
      level: o.entry.level,
      spec: false,
      parentName: o.name,
      ...(o.entry.spec ? { specName: o.entry.spec } : {}),
    });
  }
  for (const e of extras) {
    rows.push({
      label: e.name + (e.spec ? ` (${e.spec})` : ''),
      level: e.level,
      spec: false,
      parentName: e.name,
      ...(e.spec ? { specName: e.spec } : {}),
    });
  }

  while (rows.length % 3 !== 0) rows.push({ label: '', spec: false, parentName: 'Admin' });
  return rows;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
