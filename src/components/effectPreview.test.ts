import { describe, it, expect } from 'vitest';
import { summarizeEffect } from './effectPreview';

describe('summarizeEffect', () => {
  it('describes a plain skill grant', () => {
    expect(summarizeEffect({ type: 'gain_skill', skill: { name: 'Mechanic' } })).toBe('Mechanic');
  });

  it('includes the spec', () => {
    expect(
      summarizeEffect({ type: 'gain_skill', skill: { name: 'Electronics', spec: 'comms' } }),
    ).toBe('Electronics (comms)');
  });

  it('describes a stat bump with a sign', () => {
    expect(summarizeEffect({ type: 'modify_char', char: 'STR', delta: 1 })).toBe('STR +1');
    expect(summarizeEffect({ type: 'modify_char', char: 'EDU', delta: -1 })).toBe('EDU -1');
  });

  it('joins choice option labels with "or"', () => {
    expect(
      summarizeEffect({
        type: 'choice',
        prompt: 'Pick one',
        options: [
          { label: 'Drive', effects: [] },
          { label: 'Vacc Suit', effects: [] },
        ],
      }),
    ).toBe('Drive or Vacc Suit');
  });

  it('lists the constrained skills for a gain_skill_choice', () => {
    expect(
      summarizeEffect({
        type: 'gain_skill_choice',
        level: 1,
        from: [{ name: 'Recon' }, { name: 'Survival' }],
      }),
    ).toBe('Pick: Recon / Survival (level 1)');
  });

  it('describes a future-roll DM', () => {
    expect(summarizeEffect({ type: 'next_advancement_dm', dm: 2 })).toBe('Next advancement DM +2');
  });
});
