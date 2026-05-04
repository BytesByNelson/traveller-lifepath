import { useMemo, useState } from 'react';
import type { ArmourDef, AugmentDef, EquipmentTraitId, GearDef, WeaponDef, WeaponTraitRef } from '../types';
import { ARMOUR, AUGMENTS, GEAR, WEAPONS, EQUIPMENT_TRAITS } from '../data';

type Kind = 'armour' | 'weapon' | 'augment' | 'gear';

type Props =
  | { kind: 'armour'; onSelect: (item: ArmourDef) => void; label?: string }
  | { kind: 'weapon'; onSelect: (item: WeaponDef) => void; label?: string }
  | { kind: 'augment'; onSelect: (item: AugmentDef) => void; label?: string }
  | { kind: 'gear'; onSelect: (item: GearDef) => void; label?: string };

/**
 * A "Pick from catalogue" affordance. Renders a small button; clicking opens a
 * modal with a filterable list. Selecting an item calls the onSelect callback
 * with the typed catalogue entry.
 */
export function CataloguePicker(props: Props) {
  const [open, setOpen] = useState(false);
  const label = props.label ?? `+ Pick from catalogue`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-indigo-600 hover:text-indigo-800 print:hidden"
      >
        {label}
      </button>
      {open ? <PickerModal {...props} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function PickerModal(props: Props & { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [maxTL, setMaxTL] = useState<number | undefined>(undefined);

  const items = useMemo(() => filterByKind(props.kind, search, maxTL), [props.kind, search, maxTL]);

  return (
    <div
      role="dialog"
      aria-label={`${props.kind} catalogue`}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 print:hidden"
      onClick={props.onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-baseline justify-between p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold capitalize">{props.kind} catalogue</h2>
          <button onClick={props.onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="Close">
            ×
          </button>
        </header>
        <div className="p-3 border-b border-gray-200 flex flex-wrap gap-2 text-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="px-2 py-1 border border-gray-300 rounded flex-1 min-w-[150px]"
            aria-label="Search catalogue"
            autoFocus
          />
          <label className="flex items-center gap-1 text-xs">
            Max TL:
            <input
              type="number"
              value={maxTL ?? ''}
              onChange={(e) => setMaxTL(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="any"
              min={0}
              max={20}
              className="w-14 px-1 py-0.5 border border-gray-300 rounded"
              aria-label="Max TL"
            />
          </label>
          <span className="text-xs text-gray-500 self-center">{items.length} items</span>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No items match.</p>
          ) : (
            items.map((it) => (
              <button
                key={it.item.id}
                onClick={() => {
                  selectByKind(props, it);
                  props.onClose();
                }}
                className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm"
              >
                {renderRow(it)}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type Kinded =
  | { kind: 'armour'; item: ArmourDef }
  | { kind: 'weapon'; item: WeaponDef }
  | { kind: 'augment'; item: AugmentDef }
  | { kind: 'gear'; item: GearDef };

function filterByKind(kind: Kind, search: string, maxTL: number | undefined): Kinded[] {
  const lower = search.toLowerCase();
  const matches = (name: string, variant?: string) => {
    if (!lower) return true;
    return name.toLowerCase().includes(lower) || (variant?.toLowerCase().includes(lower) ?? false);
  };
  const tlOk = (tl: number) => maxTL === undefined || tl <= maxTL;
  switch (kind) {
    case 'armour':
      return ARMOUR.filter((a) => matches(a.name, a.variant) && tlOk(a.tl)).map((item) => ({ kind: 'armour' as const, item }));
    case 'weapon':
      return WEAPONS.filter((w) => matches(w.name, w.variant) && tlOk(w.tl)).map((item) => ({ kind: 'weapon' as const, item }));
    case 'augment':
      return AUGMENTS.filter((a) => matches(a.name, a.variant) && tlOk(a.tl)).map((item) => ({ kind: 'augment' as const, item }));
    case 'gear':
      return GEAR.filter((g) => matches(g.name, g.variant) && tlOk(g.tl)).map((item) => ({ kind: 'gear' as const, item }));
  }
}

function selectByKind(props: Props, kinded: Kinded): void {
  if (kinded.kind === 'armour' && props.kind === 'armour') props.onSelect(kinded.item);
  else if (kinded.kind === 'weapon' && props.kind === 'weapon') props.onSelect(kinded.item);
  else if (kinded.kind === 'augment' && props.kind === 'augment') props.onSelect(kinded.item);
  else if (kinded.kind === 'gear' && props.kind === 'gear') props.onSelect(kinded.item);
}

function renderRow(k: Kinded): React.ReactNode {
  switch (k.kind) {
    case 'armour': {
      const a = k.item;
      return (
        <div>
          <div className="font-medium">
            {a.name}
            {a.variant ? <span className="text-gray-500 ml-1">{a.variant}</span> : null}
          </div>
          <div className="text-xs text-gray-600">
            TL {a.tl} · Protection +{a.protection}
            {a.protectionNote ? ` (${a.protectionNote})` : ''}
            {a.rad !== undefined ? ` · Rad ${a.rad}` : ''}
            {' '}· {a.mass}kg · Cr{a.cost.toLocaleString()}
            {a.requiredSkill ? ` · req ${a.requiredSkill.name} ${a.requiredSkill.level}` : ''}
          </div>
        </div>
      );
    }
    case 'weapon': {
      const w = k.item;
      return (
        <div>
          <div className="font-medium">
            {w.name}
            {w.variant ? <span className="text-gray-500 ml-1">{w.variant}</span> : null}
          </div>
          <div className="text-xs text-gray-600">
            TL {w.tl} · {w.range} · {w.damage} · {w.mass}kg · Cr{w.cost.toLocaleString()}
            {w.magazine ? ` · mag ${w.magazine} (Cr${w.magazineCost ?? 0})` : ''}
            {w.traits.length > 0 ? ` · ${formatTraits(w.traits)}` : ''}
          </div>
        </div>
      );
    }
    case 'augment': {
      const a = k.item;
      return (
        <div>
          <div className="font-medium">
            {a.name}
            {a.variant ? <span className="text-gray-500 ml-1">{a.variant}</span> : null}
          </div>
          <div className="text-xs text-gray-600">
            TL {a.tl} · {a.improvement} · Cr{a.cost.toLocaleString()}
          </div>
        </div>
      );
    }
    case 'gear': {
      const g = k.item;
      return (
        <div>
          <div className="font-medium">
            {g.name}
            {g.variant ? <span className="text-gray-500 ml-1">{g.variant}</span> : null}
          </div>
          <div className="text-xs text-gray-600">
            TL {g.tl}
            {g.mass !== undefined ? ` · ${g.mass}kg` : ''} · Cr{g.cost.toLocaleString()}
            {g.description ? ` · ${g.description}` : ''}
          </div>
        </div>
      );
    }
  }
}

function formatTraits(traits: WeaponTraitRef[]): string {
  return traits
    .map((t) => {
      const def = EQUIPMENT_TRAITS[t.trait as EquipmentTraitId];
      const short = def?.shortName ?? t.trait;
      return t.rating !== undefined ? `${short} ${t.rating}` : short;
    })
    .join(', ');
}
