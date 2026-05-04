import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  resolveCheck,
  resolvePickSkill,
  type EngineState,
} from './index';

const setChar = (c: ReturnType<typeof newCharacter>, char: 'STR' | 'DEX' | 'END' | 'INT' | 'EDU' | 'SOC', value: number) => ({
  ...c,
  baseCharacteristics: { ...c.baseCharacteristics, [char]: value },
  characteristics: { ...c.characteristics, [char]: value },
});

describe('raise_char_to_or_bump', () => {
  it('raises SOC to the minimum when current is below', () => {
    let c = newCharacter('id', 'X', 'human');
    c = setChar(c, 'SOC', 7);
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'raise_char_to_or_bump', char: 'SOC', minimum: 10 }]);
    state = drain(state);
    expect(state.character.characteristics.SOC).toBe(10);
  });

  it('bumps SOC by +1 when already at the minimum', () => {
    let c = newCharacter('id', 'X', 'human');
    c = setChar(c, 'SOC', 10);
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'raise_char_to_or_bump', char: 'SOC', minimum: 10 }]);
    state = drain(state);
    expect(state.character.characteristics.SOC).toBe(11);
  });

  it('bumps SOC by +1 when already above the minimum', () => {
    let c = newCharacter('id', 'X', 'human');
    c = setChar(c, 'SOC', 13);
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'raise_char_to_or_bump', char: 'SOC', minimum: 12 }]);
    state = drain(state);
    expect(state.character.characteristics.SOC).toBe(14);
  });
});

describe('gain_skill_choice followUpCheck', () => {
  it('runs a SkillCheck on the picked skill and applies onSuccess effects when it passes', () => {
    let c = newCharacter('id', 'X', 'human');
    c = setChar(c, 'INT', 7);
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      {
        type: 'gain_skill_choice',
        level: 1,
        from: [{ name: 'Advocate' }, { name: 'Persuade' }],
        followUpCheck: {
          target: 8,
          description: 'Roll 8+ on chosen skill',
          onSuccess: [{ type: 'next_advancement_dm', dm: 2 }],
          onFailure: [{ type: 'next_survival_dm', dm: -2 }],
        },
      },
    ]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('pick_skill');

    state = resolvePickSkill(state, { name: 'Advocate' });
    // Engine should now pause on the follow-up check using Advocate.
    expect(state.prompt?.kind).toBe('check');
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    expect(state.prompt.effect.roll.kind).toBe('skill');
    if (state.prompt.effect.roll.kind !== 'skill') throw new Error('expected skill check');
    expect(state.prompt.effect.roll.skill.name).toBe('Advocate');
    expect(state.prompt.effect.roll.target).toBe(8);

    state = resolveCheck(state, 8, 8, undefined, 'manual');
    expect(state.pendingDMs.nextAdvancement).toBe(2);
    expect(state.pendingDMs.nextSurvival).toBeUndefined();
  });

  it('applies onFailure effects when the follow-up check fails', () => {
    let c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      {
        type: 'gain_skill_choice',
        level: 1,
        from: [{ name: 'Streetwise' }],
        followUpCheck: {
          target: 8,
          onSuccess: [{ type: 'next_advancement_dm', dm: 2 }],
          onFailure: [{ type: 'next_survival_dm', dm: -2 }],
        },
      },
    ]);
    state = drain(state);
    state = resolvePickSkill(state, { name: 'Streetwise' });
    state = resolveCheck(state, 4, 4, undefined, 'manual');
    expect(state.pendingDMs.nextSurvival).toBe(-2);
    expect(state.pendingDMs.nextAdvancement).toBeUndefined();
  });
});
