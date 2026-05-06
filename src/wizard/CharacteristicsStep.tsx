import { useState } from 'react';
import { CHAR_CODES, type Character, type CharCode } from '../types';
import { CHAR_NAMES, characteristicDM, SPECIES } from '../data';
import {
  assignFromPool,
  assignPoolInOrder,
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  rollCharacteristicsPool,
  setCharacteristic,
  setPointBuyCharacteristic,
  unassignToPool,
} from '../engine';
import { roll2d } from '../engine';

const DEFAULT_BASE = 7;

export function CharacteristicsStep({
  character,
  onChange,
  onBack,
  onNext,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const mods = SPECIES[character.species].charModifiers;
  const psionicsEnabled = character.wizardState?.psionicsEnabled === true;
  const rollMode = character.wizardState?.rollMode ?? 'app';
  const pool = character.wizardState?.unassignedRolls ?? [];
  const [manualValues, setManualValues] = useState<Record<CharCode, string>>({
    STR: '', DEX: '', END: '', INT: '', EDU: '', SOC: '',
  });
  const [manualPsi, setManualPsi] = useState('');

  const rollPool = () => onChange(rollCharacteristicsPool(character, Math.random));
  const takeInOrder = () => onChange(assignPoolInOrder(character));
  const assign = (code: CharCode, value: number) => onChange(assignFromPool(character, code, value));
  const unassign = (code: CharCode) => onChange(unassignToPool(character, code));
  const setManual = (code: CharCode, value: number) =>
    onChange(setCharacteristic(character, code, value));
  /** Re-roll one *already-assigned* characteristic in app mode. Pool isn't touched. */
  const reroll = (code: CharCode) => {
    const { total } = roll2d(Math.random);
    const newBase = { ...character.baseCharacteristics, [code]: total };
    onChange({
      ...character,
      baseCharacteristics: newBase,
      characteristics: { ...character.characteristics, [code]: Math.max(1, total + (mods[code] ?? 0)) },
      rollLog: [
        ...character.rollLog,
        {
          id: crypto.randomUUID(),
          ts: Date.now(),
          context: `Roll ${code} (re-roll)`,
          result: total,
          source: 'rng',
        },
      ],
    });
  };
  /** Re-roll PSI in app mode (used after Roll all). */
  const rerollPsi = () => {
    const { total } = roll2d(Math.random);
    const value = Math.max(0, total);
    onChange({
      ...character,
      psi: { max: value, current: value },
      rollLog: [
        ...character.rollLog,
        {
          id: crypto.randomUUID(),
          ts: Date.now(),
          context: 'Roll PSI (re-roll)',
          result: value,
          source: 'rng',
        },
      ],
    });
  };
  const rollPsiOnly = () => {
    const { total } = roll2d(Math.random);
    const value = Math.max(0, total);
    onChange({
      ...character,
      psi: { max: value, current: value },
      rollLog: [
        ...character.rollLog,
        {
          id: crypto.randomUUID(),
          ts: Date.now(),
          context: 'Roll PSI',
          result: value,
          source: 'rng',
        },
      ],
    });
  };
  const setPsiManual = (value: number) => {
    onChange({
      ...character,
      psi: { max: value, current: value },
      rollLog: [
        ...character.rollLog,
        {
          id: crypto.randomUUID(),
          ts: Date.now(),
          context: 'Set PSI',
          result: value,
          source: 'manual',
        },
      ],
    });
  };

  const isAssigned = (code: CharCode): boolean => character.baseCharacteristics[code] !== DEFAULT_BASE;
  const anyAssigned = CHAR_CODES.some(isAssigned);
  const totalPoints = CHAR_CODES.reduce((sum, c) => sum + character.baseCharacteristics[c], 0);
  const pointBuyBalanced = totalPoints === POINT_BUY_BUDGET;
  const setPB = (code: CharCode, value: number) => {
    if (value < POINT_BUY_MIN || value > POINT_BUY_MAX) return;
    onChange(setPointBuyCharacteristic(character, code, value));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Characteristics</h2>
      <p className="text-sm text-gray-600">
        {rollMode === 'app'
          ? 'Roll 2D × 6 into a pool, then assign each value to the characteristic you want it on. Species modifiers apply automatically.'
          : rollMode === 'point_buy'
          ? `Distribute ${POINT_BUY_BUDGET} points across the six characteristics, each between ${POINT_BUY_MIN} and ${POINT_BUY_MAX}. Species modifiers apply automatically.`
          : 'Enter your 2D roll for each characteristic. Species modifiers apply automatically.'}
        {psionicsEnabled
          ? rollMode === 'point_buy'
            ? ' PSI is rolled separately (2D) — point-buy applies only to the six core stats.'
            : ' PSI is rolled separately — 2D at creation.'
          : ''}
      </p>

      {rollMode === 'point_buy' ? (
        <div
          className={`rounded border p-2 text-sm flex items-center justify-between ${
            pointBuyBalanced
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <span>
            Spent <strong>{totalPoints}</strong> / {POINT_BUY_BUDGET} points
          </span>
          <span className="text-xs">
            {pointBuyBalanced
              ? '✓ Balanced — ready to continue'
              : totalPoints > POINT_BUY_BUDGET
              ? `Over budget by ${totalPoints - POINT_BUY_BUDGET}`
              : `${POINT_BUY_BUDGET - totalPoints} left to spend`}
          </span>
        </div>
      ) : null}

      {rollMode === 'app' ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={rollPool}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            title={
              pool.length === 0 && !anyAssigned
                ? 'Roll 2D × 6 into a pool'
                : 'Re-roll the pool — clears any current assignments'
            }
          >
            {pool.length === 0 && !anyAssigned ? 'Roll pool (2D × 6)' : 'Re-roll pool'}
          </button>
          {pool.length > 0 ? (
            <button
              onClick={takeInOrder}
              className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
              title="Drain the remaining pool into the unassigned characteristics in order (STR, DEX, END, INT, EDU, SOC)"
            >
              Take in order
            </button>
          ) : null}
        </div>
      ) : null}

      {rollMode === 'app' && pool.length > 0 ? (
        <div className="rounded border border-indigo-200 bg-indigo-50 p-2">
          <div className="text-xs font-medium text-indigo-900 mb-1">
            Pool ({pool.length} {pool.length === 1 ? 'value' : 'values'} remaining):
          </div>
          <div className="flex flex-wrap gap-1">
            {pool.map((v, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 rounded bg-white border border-indigo-300 text-sm font-mono"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500">
          <tr>
            <th className="text-left py-1">Char</th>
            <th className="text-right">Base</th>
            <th className="text-right">Species</th>
            <th className="text-right">Final</th>
            <th className="text-right">DM</th>
            <th className="w-44"></th>
          </tr>
        </thead>
        <tbody>
          {CHAR_CODES.map((code) => {
            const base = character.baseCharacteristics[code];
            const final = character.characteristics[code];
            const mod = (mods as Record<CharCode, number | undefined>)[code] ?? 0;
            // Point-buy stats are always "assigned" — every value is a deliberate allocation,
            // including the default 7. For roll modes, "assigned" means the player has set a
            // non-default value via roll or manual entry.
            const assigned = rollMode === 'point_buy' ? true : isAssigned(code);
            return (
              <tr key={code} className="border-t border-gray-200">
                <td className="py-1.5 font-medium">{code}</td>
                <td className="text-right">{assigned ? base : <span className="text-gray-400">—</span>}</td>
                <td className={`text-right ${mod < 0 ? 'text-red-600' : mod > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {mod === 0 ? '—' : (mod > 0 ? `+${mod}` : mod)}
                </td>
                <td className="text-right font-semibold">{assigned ? final : <span className="text-gray-400">—</span>}</td>
                <td className="text-right">
                  {assigned ? (
                    <span className={characteristicDM(final) < 0 ? 'text-red-600' : 'text-gray-700'}>
                      {characteristicDM(final) > 0 ? '+' : ''}
                      {characteristicDM(final)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="text-right">
                  {rollMode === 'point_buy' ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setPB(code, base - 1)}
                        disabled={base <= POINT_BUY_MIN}
                        className="text-xs w-6 h-6 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Decrease ${CHAR_NAMES[code]}`}
                        title={`Decrease ${CHAR_NAMES[code]}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={POINT_BUY_MIN}
                        max={POINT_BUY_MAX}
                        value={base}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isInteger(n)) setPB(code, n);
                        }}
                        className="w-12 px-1 border border-gray-300 rounded text-xs text-right"
                        aria-label={`${CHAR_NAMES[code]} value`}
                      />
                      <button
                        type="button"
                        onClick={() => setPB(code, base + 1)}
                        disabled={base >= POINT_BUY_MAX}
                        className="text-xs w-6 h-6 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Increase ${CHAR_NAMES[code]}`}
                        title={`Increase ${CHAR_NAMES[code]}`}
                      >
                        +
                      </button>
                    </div>
                  ) : rollMode === 'manual' ? (
                    <>
                      <input
                        type="number"
                        min={2}
                        max={12}
                        value={manualValues[code]}
                        onChange={(e) => setManualValues((m) => ({ ...m, [code]: e.target.value }))}
                        className="w-12 px-1 border border-gray-300 rounded text-xs text-right"
                        placeholder="2–12"
                        title={`Set ${CHAR_NAMES[code]} manually (2D)`}
                      />
                      <button
                        type="button"
                        className="ml-1 text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50"
                        onClick={() => {
                          const n = Number(manualValues[code]);
                          if (Number.isInteger(n) && n >= 2 && n <= 12) {
                            setManual(code, n);
                            setManualValues((m) => ({ ...m, [code]: '' }));
                          }
                        }}
                      >
                        Set
                      </button>
                    </>
                  ) : assigned ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => unassign(code)}
                        className="text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                        title={`Return ${CHAR_NAMES[code]}'s value to the pool`}
                      >
                        Unassign
                      </button>
                      <button
                        type="button"
                        onClick={() => reroll(code)}
                        className="text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                        title={`Re-roll ${CHAR_NAMES[code]} — appends to roll log, replaces value.`}
                      >
                        Re-roll
                      </button>
                    </div>
                  ) : pool.length > 0 ? (
                    <select
                      className="text-xs px-1 py-0.5 border border-indigo-300 rounded bg-white"
                      value=""
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isInteger(n)) assign(code, n);
                      }}
                      title={`Assign a value from the pool to ${CHAR_NAMES[code]}`}
                    >
                      <option value="">Assign…</option>
                      {pool.map((v, i) => (
                        <option key={i} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-400">— pending —</span>
                  )}
                </td>
              </tr>
            );
          })}
          {psionicsEnabled ? (
            <tr className="border-t border-gray-200 bg-amber-50/30">
              <td className="py-1.5 font-medium">PSI</td>
              <td className="text-right">{character.psi?.max ?? <span className="text-gray-400">—</span>}</td>
              <td className="text-right text-gray-400">—</td>
              <td className="text-right font-semibold">{character.psi?.max ?? '—'}</td>
              <td className="text-right">
                {character.psi ? (
                  <span className={characteristicDM(character.psi.max) < 0 ? 'text-red-600' : 'text-gray-700'}>
                    {characteristicDM(character.psi.max) > 0 ? '+' : ''}
                    {characteristicDM(character.psi.max)}
                  </span>
                ) : null}
              </td>
              <td className="text-right">
                {rollMode === 'app' ? (
                  character.psi ? (
                    <button
                      type="button"
                      onClick={rerollPsi}
                      className="text-xs px-2 py-0.5 border border-amber-400 bg-amber-50 rounded hover:bg-amber-100 text-amber-900"
                      title="Re-roll 2D for PSI"
                    >
                      Re-roll
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={rollPsiOnly}
                      className="text-xs px-2 py-0.5 border border-amber-400 bg-amber-50 rounded hover:bg-amber-100"
                      title="Roll 2D for PSI"
                    >
                      Roll
                    </button>
                  )
                ) : (
                  <>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={manualPsi}
                      onChange={(e) => setManualPsi(e.target.value)}
                      className="w-12 px-1 border border-gray-300 rounded text-xs text-right"
                      placeholder="0–15"
                    />
                    <button
                      type="button"
                      className="ml-1 text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50"
                      onClick={() => {
                        const n = Number(manualPsi);
                        if (Number.isInteger(n) && n >= 0 && n <= 15) {
                          setPsiManual(n);
                          setManualPsi('');
                        }
                      }}
                    >
                      Set
                    </button>
                  </>
                )}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={
            (rollMode === 'app' && pool.length > 0) ||
            (rollMode === 'point_buy' && !pointBuyBalanced)
          }
          title={
            rollMode === 'app' && pool.length > 0
              ? `Assign the remaining ${pool.length} pool ${pool.length === 1 ? 'value' : 'values'} before continuing`
              : rollMode === 'point_buy' && !pointBuyBalanced
              ? `Spend exactly ${POINT_BUY_BUDGET} points before continuing (currently ${totalPoints})`
              : ''
          }
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Continue → Background skills
        </button>
      </div>
    </section>
  );
}
