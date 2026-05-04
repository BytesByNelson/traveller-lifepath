import { useState } from 'react';
import {
  acknowledgeNote,
  candidateSkillsForPrompt,
  resolveCheck,
  resolveChoice,
  resolveNameConnection,
  resolvePickChar,
  resolvePickConnectionType,
  resolvePickSkill,
  resolveWager,
  type EngineState,
} from '../engine';
import { HybridDice } from './HybridDice';
import { SKILLS } from '../data';
import { SkillInfoCard } from './SkillInfo';
import type { CharCode, ConnectionType, SkillName, SkillRef } from '../types';

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

  switch (p.kind) {
    case 'check':
      return (
        <HybridDice
          title={p.title}
          target={p.effect.roll.target}
          dms={p.dms}
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

    case 'wager_benefit_rolls':
      return <WagerPrompt state={state} onUpdate={onUpdate} />;

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
        Pick a skill to gain at level {p.level}
        {p.existingOnly ? ' (must already have it)' : ''}.
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

function NameConnectionPrompt({ state, onUpdate }: Props) {
  const p = state.prompt;
  const [name, setName] = useState('');
  if (p?.kind !== 'name_connection') return null;
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-2 capitalize">New {p.type}</h3>
      <p className="text-sm text-gray-600 mb-2">Optional: describe this {p.type} (their name, role, why they matter).</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`e.g. "Captain Harrick" or "rival in Navy"`}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      />
      <button
        onClick={() => onUpdate(resolveNameConnection(state, name))}
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
        onResult={(natural, total) =>
          onUpdate(resolveWager(state, Number(wagered) || 0, natural, total))
        }
      />
    </div>
  );
}
