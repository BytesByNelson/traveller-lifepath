import { describe, it, expect } from 'vitest';
import {
  applyBasicTraining,
  blankEngineState,
  d3Value,
  dieValue,
  drain,
  enqueue,
  newCharacter,
  pushContext,
  resolveCheck,
  resolveChoice,
  resolveNameConnection,
  resolvePickSkill,
  scriptedRng,
  startAdvancement,
  startEvent,
  startQualification,
  startSurvival,
} from './index';
import { CAREERS } from '../data';
import type { CharCode } from '../types';

const setChar = (
  c: ReturnType<typeof newCharacter>,
  values: Partial<Record<CharCode, number>>,
) => ({
  ...c,
  baseCharacteristics: { ...c.baseCharacteristics, ...values },
  characteristics: { ...c.characteristics, ...values },
});

describe('engine — Agent vertical slice golden path', () => {
  it('runs a full Law Enforcement term: qualify → basic training → survival → event(5) → advancement', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = setChar(c, { STR: 8, DEX: 8, END: 9, INT: 9, EDU: 9, SOC: 7 });

    // ─── Qualification: Agent INT 6+ ───
    const { state: qualState } = startQualification(c, 'agent', scriptedRng([]));
    expect(qualState.prompt?.kind).toBe('check');
    const afterQual = resolveCheck(qualState, 10, 10);
    expect(afterQual.prompt).toBeUndefined();
    c = afterQual.character;

    // ─── Basic training: gains all 6 Law Enforcement service skills at level 0 ───
    c = applyBasicTraining(c, 'agent', 'law_enforcement', 0);
    const namesAfterBasic = c.backgroundSkills.map((s) => s.name).sort();
    // Service Skills row for Agent: Streetwise, Drive, Investigate, Flyer, Recon, Gun Combat
    expect(namesAfterBasic).toEqual(
      expect.arrayContaining(['Drive', 'Flyer', 'Gun Combat', 'Investigate', 'Recon', 'Streetwise']),
    );

    // ─── Survival: Law Enforcement END 6+ ───
    const survState = startSurvival(c, CAREERS.agent, 'law_enforcement', 0, scriptedRng([]));
    expect(survState.prompt?.kind).toBe('check');
    const afterSurv = resolveCheck(survState, 8, 8);
    expect(afterSurv.prompt).toBeUndefined();
    expect(afterSurv.flags.ejected).toBeFalsy();
    c = afterSurv.character;

    // ─── Event roll → 5 (Network of contacts: gain D3 Contacts). Dice: 2 + 3 = 5; D3 = 2. ───
    const eventRng = scriptedRng([dieValue(2), dieValue(3), d3Value(2)]);
    const eventState = startEvent(c, CAREERS.agent, eventRng);
    expect(eventState.prompt?.kind).toBe('name_connection');
    if (eventState.prompt?.kind !== 'name_connection') throw new Error('expected name_connection');
    expect(eventState.prompt.type).toBe('contact');

    const afterFirst = resolveNameConnection(eventState, 'Marisa, fence');
    expect(afterFirst.prompt?.kind).toBe('name_connection');
    const afterSecond = resolveNameConnection(afterFirst, 'Detective Yan');
    expect(afterSecond.prompt).toBeUndefined();
    c = afterSecond.character;
    expect(c.connections.contacts).toHaveLength(2);
    expect(c.connections.contacts.map((x) => x.description)).toEqual(['Marisa, fence', 'Detective Yan']);

    // ─── Advancement: Law Enforcement INT 6+ ───
    const advState = startAdvancement(c, CAREERS.agent, 'law_enforcement', 0, scriptedRng([]));
    expect(advState.prompt?.kind).toBe('check');
    const afterAdv = resolveCheck(advState, 9, 9);
    expect(afterAdv.prompt).toBeUndefined();
    c = afterAdv.character;

    // ─── Final assertions ───
    expect(c.backgroundSkills.filter((s) => s.source.kind === 'basic_training')).toHaveLength(6);
    expect(c.connections.contacts).toHaveLength(2);
    const checkLogs = c.rollLog.filter((r) => r.target !== undefined);
    expect(checkLogs).toHaveLength(3); // qualification, survival, advancement
    expect(checkLogs.every((r) => r.success)).toBe(true);
  });
});

describe('engine — cross-career flow (Agent event 8 → Rogue)', () => {
  it('Deception success → pick Rogue → engine rolls Rogue events AND eventually the Rogue assignment skill table', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = setChar(c, { INT: 10, EDU: 10, END: 10 });

    /**
     * RNG sequence:
     *  - Agent event roll: 3 + 5 = 8 (undercover)
     *  - Rogue event roll: 2 + 2 = 4 (heist planning, gain_skill_choice Electronics/Mechanic)
     *  - Rogue assignment skill table roll (Thief, 1D): 3 (Recon)
     */
    const rng = scriptedRng([
      dieValue(3), dieValue(5),
      dieValue(2), dieValue(2),
      dieValue(3),
    ]);

    let state = blankEngineState(c);
    state = pushContext(state, 'Agent — Event');
    state = enqueue(state, [
      { type: 'roll_on_table', table: { kind: 'career_events', career: 'agent' } },
    ]);
    state = drain(state, rng);

    // Pause on the Deception 8+ check.
    expect(state.prompt?.kind).toBe('check');

    // Resolve successfully.
    state = resolveCheck(state, 10, 10, rng);

    // Pause on the Rogue/Citizen choice.
    expect(state.prompt?.kind).toBe('choice');
    if (state.prompt?.kind !== 'choice') throw new Error('expected choice');
    const rogueIdx = state.prompt.effect.options.findIndex((o) => o.label === 'Rogue');

    state = resolveChoice(state, rogueIdx, rng);

    // After picking Rogue, the engine processed Rogue event 4 (gain_skill_choice Electronics/Mechanic).
    // It should pause on a pick_skill prompt with that from-list.
    expect(state.prompt?.kind).toBe('pick_skill');
    if (state.prompt?.kind !== 'pick_skill') throw new Error('expected pick_skill');
    const fromNames = state.prompt.from?.map((s) => s.name);
    expect(fromNames).toEqual(['Electronics', 'Mechanic']);

    // Pick Electronics. Engine should resume; the second compound effect
    // (roll_on_other_career_assignment_skill_table for Rogue, no fixed assignment)
    // emits a `choice` to pick the Rogue assignment.
    state = resolvePickSkill(state, { name: 'Electronics' }, rng);
    expect(state.prompt?.kind).toBe('choice');
    if (state.prompt?.kind !== 'choice') throw new Error('expected assignment choice');
    const assignmentLabels = state.prompt.effect.options.map((o) => o.label);
    expect(assignmentLabels).toEqual(expect.arrayContaining(['Thief', 'Enforcer', 'Pirate']));

    // Pick Thief. Engine rolls 1D=3 → Recon for Thief.
    const thiefIdx = state.prompt.effect.options.findIndex((o) => o.label === 'Thief');
    state = resolveChoice(state, thiefIdx, rng);

    expect(state.prompt).toBeUndefined();
    c = state.character;

    // Verify the granted skills:
    //   - Electronics 1 (from Rogue event 4 pick)
    //   - Recon at level 1 (or +1) from Thief skill table roll (rolled 3 = Recon, no level → +1 = 1)
    const electronics = c.backgroundSkills.find((s) => s.name === 'Electronics' && !s.spec);
    expect(electronics?.level).toBe(1);
    const recon = c.backgroundSkills.find((s) => s.name === 'Recon');
    expect(recon?.level).toBe(1);
  });
});
