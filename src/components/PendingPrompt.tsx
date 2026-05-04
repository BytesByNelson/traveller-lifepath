import { useState } from 'react';
import {
  acknowledgeNote,
  candidateSkillsForPrompt,
  resolveCheck,
  resolveChoice,
  resolveConvertConnection,
  resolveNameConnection,
  resolvePickCatalogueItem,
  resolvePickChar,
  resolvePickConnectionType,
  resolvePickSkill,
  resolveWager,
  skipPickCatalogueItem,
  type EngineState,
} from '../engine';
import { HybridDice } from './HybridDice';
import { ARMOUR, AUGMENTS, GEAR, SKILLS, WEAPONS } from '../data';
import { SkillInfoCard } from './SkillInfo';
import type { ArmourDef, AugmentDef, CharCode, ConnectionType, GearDef, SkillName, SkillRef, WeaponDef } from '../types';

type Props = {
  state: EngineState;
  onUpdate: (s: EngineState) => void;
};

/**
 * Renders the engine's current prompt and provides controls to resolve it.
 * Calls `onUpdate` with the new EngineState after each resolution.
 */
export function PendingPrompt({ state, onUpdate }: Props) {
  const p = state.prompt;
  if (!p) return null;
  const mode = state.character.wizardState?.rollMode ?? 'both';
  const diceMode = mode === 'app' || mode === 'manual' ? mode : 'both';

  switch (p.kind) {
    case 'check':
      return (
        <HybridDice
          title={p.title}
          target={p.effect.roll.target}
          dms={p.dms}
          mode={diceMode}
          onResult={(natural, total, source) => onUpdate(resolveCheck(state, natural, total, undefined, source))}
        />
      );

    case 'choice':
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <h3 className="font-semibold mb-2">{p.effect.prompt}</h3>
          <div className="flex flex-wrap gap-2">
            {p.effect.options.map((o, i) => (
              <button
                key={i}
                onClick={() => onUpdate(resolveChoice(state, i))}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-sm"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      );

    case 'pick_skill':
      return <PickSkillPrompt state={state} onUpdate={onUpdate} />;

    case 'pick_char':
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <h3 className="font-semibold mb-2">{p.title} ({p.delta > 0 ? '+' : ''}{p.delta})</h3>
          <div className="flex gap-2">
            {p.chars.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate(resolvePickChar(state, c as CharCode))}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-sm"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      );

    case 'pick_connection_type':
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <h3 className="font-semibold mb-2">{p.title}</h3>
          <p className="text-sm text-gray-600 mb-2">Pick connection type:</p>
          <div className="flex gap-2">
            {p.choices.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate(resolvePickConnectionType(state, c as ConnectionType))}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-sm capitalize"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      );

    case 'name_connection':
      return <NameConnectionPrompt state={state} onUpdate={onUpdate} />;

    case 'convert_connection':
      return <ConvertConnectionPrompt state={state} onUpdate={onUpdate} />;

    case 'wager_benefit_rolls':
      return <WagerPrompt state={state} onUpdate={onUpdate} />;

    case 'pick_catalogue_item':
      return <PickCatalogueItemPrompt state={state} onUpdate={onUpdate} />;

    case 'note':
      return (
        <div className="border border-gray-300 rounded-lg p-4 bg-amber-50">
          <p className="text-sm">{p.text}</p>
          <button
            onClick={() => onUpdate(acknowledgeNote(state))}
            className="mt-3 px-3 py-1.5 rounded bg-amber-600 text-white text-sm hover:bg-amber-700"
          >
            Acknowledge
          </button>
        </div>
      );
  }
}

function PickCatalogueItemPrompt({ state, onUpdate }: Props) {
  const p = state.prompt;
  if (p?.kind !== 'pick_catalogue_item') return null;

  const items: Array<ArmourDef | WeaponDef | AugmentDef | GearDef> = filterCatalogue(p);

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-2">
      <h3 className="font-semibold">{p.title}</h3>
      <p className="text-xs text-gray-600">
        {items.length} item{items.length === 1 ? '' : 's'} match the constraints. Pick one to add to your sheet, or skip
        and record it manually later.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No catalogue items match — skip and record manually.
        </p>
      ) : (
        <ul className="max-h-64 overflow-y-auto space-y-1">
          {items.map((it) => (
            <li key={it.id}>
              <button
                onClick={() => onUpdate(resolvePickCatalogueItem(state, it.id))}
                className="w-full text-left px-3 py-2 rounded border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm"
              >
                <div className="font-medium">
                  {it.name}
                  {it.variant ? <span className="text-gray-500 ml-1">{it.variant}</span> : null}
                </div>
                <div className="text-xs text-gray-600">{describeItem(it)}</div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => onUpdate(skipPickCatalogueItem(state))}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
      >
        Skip — record manually on the sheet
      </button>
    </div>
  );
}

function filterCatalogue(p: Extract<EngineState['prompt'], { kind: 'pick_catalogue_item' }>): Array<ArmourDef | WeaponDef | AugmentDef | GearDef> {
  const tlOk = (tl: number) => p.tlMax === undefined || tl <= p.tlMax;
  const costOk = (cost: number) => p.costMax === undefined || cost <= p.costMax;
  switch (p.category) {
    case 'armour':
      return ARMOUR.filter((a) => tlOk(a.tl) && costOk(a.cost));
    case 'weapon':
      return WEAPONS.filter((w) => {
        if (!tlOk(w.tl) || !costOk(w.cost)) return false;
        if (p.weaponCategories && !p.weaponCategories.includes(w.category)) return false;
        if (p.weaponSpec && w.skillSpec !== p.weaponSpec) return false;
        return true;
      });
    case 'augment':
      return AUGMENTS.filter((a) => tlOk(a.tl) && costOk(a.cost));
    case 'gear':
      return GEAR.filter((g) => tlOk(g.tl) && costOk(g.cost));
  }
}

function describeItem(it: ArmourDef | WeaponDef | AugmentDef | GearDef): string {
  const parts: string[] = [`TL ${it.tl}`];
  if ('protection' in it) parts.push(`Protection +${it.protection}`);
  if ('range' in it && it.range !== 'Melee') parts.push(it.range);
  if ('damage' in it) parts.push(it.damage);
  if ('improvement' in it) parts.push(it.improvement);
  parts.push(`Cr${it.cost.toLocaleString()}`);
  return parts.join(' · ');
}

function PickSkillPrompt({ state, onUpdate }: Props) {
  const p = state.prompt;
  if (p?.kind !== 'pick_skill') return null;

  const candidates = candidateSkillsForPrompt(state);
  const [picked, setPicked] = useState<{ name: SkillName; spec?: string } | undefined>(candidates[0]);
  const skillDef = picked ? SKILLS[picked.name] : undefined;
  const showSpecPicker = !!picked && !!skillDef && skillDef.specs.length > 0 && picked.spec === undefined;

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-2">{p.title}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {p.level === undefined
          ? `Pick a skill to bump by +1${p.existingOnly ? ' (must already have it)' : ''}.`
          : `Pick a skill to gain at level ${p.level}${p.existingOnly ? ' (must already have it)' : ''}.`}
      </p>
      <select
        className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
        value={picked ? `${picked.name}|${picked.spec ?? ''}` : ''}
        onChange={(e) => {
          const [name, spec] = e.target.value.split('|');
          setPicked({ name: name as SkillName, ...(spec ? { spec } : {}) });
        }}
      >
        {candidates.map((c) => (
          <option key={`${c.name}|${c.spec ?? ''}`} value={`${c.name}|${c.spec ?? ''}`}>
            {c.name}
            {c.spec ? ` (${c.spec})` : ''}
          </option>
        ))}
      </select>

      {showSpecPicker && skillDef ? (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">Pick specialization (or leave as parent skill):</p>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              className="text-xs px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50"
              onClick={() => setPicked({ ...picked, spec: undefined })}
            >
              {picked.name} (no spec)
            </button>
            {skillDef.specs.map((sp) => (
              <button
                key={sp}
                type="button"
                className="text-xs px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50"
                onClick={() => setPicked({ ...picked, spec: sp })}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        disabled={!picked}
        onClick={() => picked && onUpdate(resolvePickSkill(state, picked as SkillRef))}
        className="mt-3 px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
      >
        Confirm
      </button>

      {picked ? (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <SkillInfoCard name={picked.name} {...(picked.spec ? { spec: picked.spec } : {})} />
        </div>
      ) : null}
    </div>
  );
}

function ConvertConnectionPrompt({ state, onUpdate }: Props) {
  const p = state.prompt;
  const [chosenId, setChosenId] = useState<string | undefined>(undefined);
  if (p?.kind !== 'convert_connection') return null;
  const selected = chosenId ?? p.convertibles[0]?.id;
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-3">
      <h3 className="font-semibold">{p.title}</h3>
      <p className="text-sm text-gray-600">
        Pick one existing connection to convert. They'll move from their current bucket to the type you choose.
      </p>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Connection</label>
        <select
          value={selected ?? ''}
          onChange={(e) => setChosenId(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        >
          {p.convertibles.map((c) => (
            <option key={c.id} value={c.id}>
              {labelConnection(c)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600 block mb-1">Convert to</label>
        <div className="flex gap-2">
          {p.targetTypes.map((t) => (
            <button
              key={t}
              type="button"
              disabled={!selected}
              onClick={() => selected && onUpdate(resolveConvertConnection(state, selected, t))}
              className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-sm capitalize disabled:opacity-50"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const labelConnection = (c: { type: string; description: string; linkedTraveller?: string }): string => {
  const name = c.description?.trim() || c.linkedTraveller?.trim() || `(unnamed ${c.type})`;
  return `${c.type}: ${name}`;
};

function NameConnectionPrompt({ state, onUpdate }: Props) {
  const p = state.prompt;
  const [name, setName] = useState('');
  if (p?.kind !== 'name_connection') return null;
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-semibold capitalize">New {p.type}</h3>
        {p.progress ? (
          <span className="text-xs text-gray-500">
            {p.progress.current} of {p.progress.total}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-gray-600 mb-2">
        {p.progress && p.progress.total > 1
          ? `Adding ${p.progress.total} ${p.type}s — describe each one as you go.`
          : `Optional: describe this ${p.type} (their name, role, why they matter).`}
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`e.g. "Captain Harrick" or "rival in Navy"`}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      />
      <button
        onClick={() => {
          onUpdate(resolveNameConnection(state, name));
          setName('');
        }}
        className="mt-3 px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
      >
        Add
      </button>
    </div>
  );
}

function WagerPrompt({ state, onUpdate }: Props) {
  const p = state.prompt;
  const [wagered, setWagered] = useState('1');
  if (p?.kind !== 'wager_benefit_rolls') return null;
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-2">Wager benefit rolls</h3>
      <input
        type="number"
        min={0}
        value={wagered}
        onChange={(e) => setWagered(e.target.value)}
        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
      />
      <HybridDice
        title="Roll the check"
        target={p.effect.check.target}
        dms={[]}
        mode={state.character.wizardState?.rollMode ?? 'both'}
        onResult={(natural, total) =>
          onUpdate(resolveWager(state, Number(wagered) || 0, natural, total))
        }
      />
    </div>
  );
}
