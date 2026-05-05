import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  resolvePickSkill,
  type EngineState,
} from './index';

describe('gain_skill — specRequired prompt', () => {
  it('prompts for a Profession specialization when none was given', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Profession' } }]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('pick_skill');
    if (state.prompt?.kind !== 'pick_skill') throw new Error('expected pick_skill');
    expect(state.prompt.from?.every((r) => r.name === 'Profession' && !!r.spec)).toBe(true);
    expect(state.prompt.from?.length).toBe(6); // 6 Profession specs in data
  });

  it('prompts for a Science specialization when none was given', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Science' } }]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('pick_skill');
    if (state.prompt?.kind !== 'pick_skill') throw new Error('expected pick_skill');
    expect(state.prompt.from?.every((r) => r.name === 'Science' && !!r.spec)).toBe(true);
  });

  it('does NOT prompt when a spec was supplied in the data', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Profession', spec: 'belter' } }]);
    state = drain(state);
    expect(state.prompt).toBeUndefined();
    expect(state.character.backgroundSkills.find((s) => s.name === 'Profession' && s.spec === 'belter')?.level).toBe(1);
  });

  it('prompts for Tactics specialization at level 1+ (per Mongoose 2022 p60: every spec\'d skill needs a spec at 1+)', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Tactics' }, level: 1 }]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('pick_skill');
    if (state.prompt?.kind !== 'pick_skill') throw new Error('expected pick_skill');
    expect(state.prompt.from?.every((r) => r.name === 'Tactics' && !!r.spec)).toBe(true);
  });

  it('also prompts for Pilot when no spec is given (covers the Reddit "Pilot 1 + Pilot (spacecraft) 1" report)', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Pilot' } }]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('pick_skill');
    if (state.prompt?.kind !== 'pick_skill') throw new Error('expected pick_skill');
    expect(state.prompt.from?.every((r) => r.name === 'Pilot' && !!r.spec)).toBe(true);
  });

  it('grants skills without specializations directly (no prompt)', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Stealth' }, level: 1 }]);
    state = drain(state);
    expect(state.prompt).toBeUndefined();
    expect(state.character.backgroundSkills.find((s) => s.name === 'Stealth')?.level).toBe(1);
  });

  it('completes the bump when the player picks a specialization', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Science' } }]);
    state = drain(state);
    state = resolvePickSkill(state, { name: 'Science', spec: 'physics' });
    const sci = state.character.backgroundSkills.find((s) => s.name === 'Science' && s.spec === 'physics');
    expect(sci?.level).toBe(1);
  });
});
