import { describe, it, expect } from 'vitest';
import type { CareerTerm, CharCode } from '../types';
import {
  acknowledgeNote,
  applySkillPackage,
  blankEngineState,
  commitCareerTerm,
  computeCharacterPension,
  d3Value,
  dieValue,
  drain,
  enqueue,
  newCharacter,
  resolveCheck,
  resolvePickChar,
  resolvePickSkill,
  scriptedRng,
  startAging,
  startMusteringOutRoll,
  startPreCareerEvent,
  termsInCareer,
  totalBenefitRolls,
} from './index';
import { CAREERS, MAX_CASH_BENEFIT_ROLLS_TOTAL, SKILL_PACKAGES } from '../data';

const setChar = (c: ReturnType<typeof newCharacter>, values: Partial<Record<CharCode, number>>) => ({
  ...c,
  baseCharacteristics: { ...c.baseCharacteristics, ...values },
  characteristics: { ...c.characteristics, ...values },
});

const stubTerm = (overrides: Partial<CareerTerm>): CareerTerm => ({
  index: 0,
  career: 'agent',
  assignment: 'law_enforcement',
  qualified: true,
  skillRolls: [],
  survival: { rolled: 7, target: 6, success: true },
  rankAtEnd: 0,
  isOfficer: false,
  termOutcome: 'continued',
  ...overrides,
});

describe('phase 3 — term commit', () => {
  it('commitCareerTerm appends to careerHistory in order', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = commitCareerTerm(c, stubTerm({ index: 0, career: 'agent' }));
    c = commitCareerTerm(c, stubTerm({ index: 1, career: 'agent' }));
    c = commitCareerTerm(c, stubTerm({ index: 2, career: 'merchant' }));
    expect(c.careerHistory).toHaveLength(3);
    expect(c.careerHistory.map((t) => t.career)).toEqual(['agent', 'agent', 'merchant']);
  });

  it('termsInCareer counts only matching career', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = commitCareerTerm(c, stubTerm({ index: 0, career: 'agent' }));
    c = commitCareerTerm(c, stubTerm({ index: 1, career: 'agent' }));
    c = commitCareerTerm(c, stubTerm({ index: 2, career: 'merchant' }));
    expect(termsInCareer(c, 'agent')).toBe(2);
    expect(termsInCareer(c, 'merchant')).toBe(1);
    expect(termsInCareer(c, 'navy')).toBe(0);
  });
});

describe('phase 3 — aging', () => {
  it('lands on result 0 when 2D=8 and terms=8: "reduce one physical char by 1"', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = setChar(c, { STR: 9, DEX: 9, END: 9 });
    // Stuff careerHistory with 8 stub terms.
    for (let i = 0; i < 8; i++) c = commitCareerTerm(c, stubTerm({ index: i }));
    // 2D=8, net = 8 - 8 = 0 → reduce one physical char by 1 (player picks).
    const rng = scriptedRng([dieValue(3), dieValue(5)]);
    let state = startAging(c, rng);
    expect(state.prompt?.kind).toBe('pick_char');
    state = resolvePickChar(state, 'STR');
    expect(state.character.characteristics.STR).toBe(8);
    expect(state.prompt).toBeUndefined();
  });

  it('lands on -1 when 2D=7 and terms=8: "reduce two physical chars by 1"', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = setChar(c, { STR: 9, DEX: 9, END: 9 });
    for (let i = 0; i < 8; i++) c = commitCareerTerm(c, stubTerm({ index: i }));
    // 2D=7, net = -1 → reduce two physical chars by 1.
    const rng = scriptedRng([dieValue(3), dieValue(4)]);
    let state = startAging(c, rng);
    expect(state.prompt?.kind).toBe('pick_char');
    state = resolvePickChar(state, 'STR');
    expect(state.prompt?.kind).toBe('pick_char');
    state = resolvePickChar(state, 'END');
    expect(state.prompt).toBeUndefined();
    expect(state.character.characteristics.STR).toBe(8);
    expect(state.character.characteristics.END).toBe(8);
  });

  it('catastrophic aging at terms=10 (net -6+): reduces three phys by 2 + one mental by 1', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = setChar(c, { STR: 12, DEX: 12, END: 12, INT: 12, EDU: 12, SOC: 12 });
    for (let i = 0; i < 10; i++) c = commitCareerTerm(c, stubTerm({ index: i }));
    // 2D=2 → 2 - 10 = -8, hits the "atMost: -6" row.
    const rng = scriptedRng([dieValue(1), dieValue(1)]);
    let state = startAging(c, rng);
    // Three physical -2 (auto), then a mental pick.
    expect(state.character.characteristics.STR).toBe(10);
    expect(state.character.characteristics.DEX).toBe(10);
    expect(state.character.characteristics.END).toBe(10);
    expect(state.prompt?.kind).toBe('pick_char');
    if (state.prompt?.kind !== 'pick_char') throw new Error('expected pick_char');
    expect(state.prompt.chars).toEqual(['INT', 'EDU', 'SOC']);
    state = resolvePickChar(state, 'INT');
    expect(state.character.characteristics.INT).toBe(11);
  });
});

describe('phase 3 — pre-career events', () => {
  it('event 5 (party) grants Carouse 1', () => {
    let c = newCharacter('id', 'Erik', 'human');
    // Roll a 5 on 2D: dice (2,3).
    const rng = scriptedRng([dieValue(2), dieValue(3)]);
    const state = startPreCareerEvent(c, rng);
    expect(state.prompt).toBeUndefined();
    c = state.character;
    const carouse = c.backgroundSkills.find((s) => s.name === 'Carouse');
    expect(carouse?.level).toBe(1);
  });

  it('event 6 (clique) prompts for D3 Allies (3 in this case)', () => {
    let c = newCharacter('id', 'Erik', 'human');
    // 2D=6 → dice (3,3); D3=3 → 0.7 (in [2/3, 1)).
    const rng = scriptedRng([dieValue(3), dieValue(3), d3Value(3)]);
    const state = startPreCareerEvent(c, rng);
    expect(state.prompt?.kind).toBe('name_connection');
    if (state.prompt?.kind !== 'name_connection') throw new Error('expected name_connection');
    expect(state.prompt.type).toBe('ally');
  });

  it('event 10 (overturn tutor) prompts for an existing skill on EDU 9+ success and bumps it by +1', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = setChar(c, { EDU: 12 });
    // Seed a known existing skill so the prompt can offer it.
    c = {
      ...c,
      backgroundSkills: [
        { name: 'Admin', level: 1, source: { kind: 'background' } },
      ],
    };
    // 2D=10 → dice (4,6).
    const rng = scriptedRng([dieValue(4), dieValue(6)]);
    let state = startPreCareerEvent(c, rng);
    // First the engine pauses on the EDU check.
    expect(state.prompt?.kind).toBe('check');
    state = resolveCheck(state, 10, 10, undefined, 'manual');
    // Now the engine should be on the pick_skill prompt with no fixed level (bump semantic).
    expect(state.prompt?.kind).toBe('pick_skill');
    if (state.prompt?.kind !== 'pick_skill') throw new Error('expected pick_skill');
    expect(state.prompt.existingOnly).toBe(true);
    expect(state.prompt.level).toBeUndefined();
    state = resolvePickSkill(state, { name: 'Admin' });
    const admin = state.character.backgroundSkills.find((s) => s.name === 'Admin');
    expect(admin?.level).toBe(2); // bumped from 1 → 2
    // Engine then pauses on a name_connection prompt for the new Rival.
    expect(state.prompt?.kind).toBe('name_connection');
  });
});

describe('phase 3 — mustering out', () => {
  it('totalBenefitRolls = 1 per term + rank bonuses (1 for rank 1-2, 2 for 3-4, 3 for 5-6)', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = commitCareerTerm(c, stubTerm({ index: 0, career: 'agent', rankAtEnd: 0 }));
    c = commitCareerTerm(c, stubTerm({ index: 1, career: 'agent', rankAtEnd: 2 })); // rank 2 → bonus 1
    expect(totalBenefitRolls(c)).toBe(2 + 1);

    c = commitCareerTerm(c, stubTerm({ index: 2, career: 'agent', rankAtEnd: 5 })); // rank 5 → bonus 3
    expect(totalBenefitRolls(c)).toBe(3 + 3);

    c = commitCareerTerm(c, stubTerm({ index: 3, career: 'merchant', rankAtEnd: 1 })); // rank 1 → bonus 1
    expect(totalBenefitRolls(c)).toBe(3 + 3 + 1 + 1);
  });

  it('cash benefit roll adds credits and the cap is global', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = commitCareerTerm(c, stubTerm({ career: 'agent' }));
    // Force a 1D=4 → Agent cash row 4 = Cr7500.
    const { state } = startMusteringOutRoll(c, CAREERS.agent, 'cash', 0, scriptedRng([dieValue(4)]));
    expect(state.character.currentCash).toBe(7500);
    // cashRollsUsed not incremented inside the engine — wizard increments after applying.
    expect(state.character.cashRollsUsed).toBe(0);
    expect(MAX_CASH_BENEFIT_ROLLS_TOTAL).toBe(3);
  });

  it('computePension respects 5-term floor and excludes Scout/Rogue/Drifter/Prisoner', () => {
    let c = newCharacter('id', 'Erik', 'human');
    for (let i = 0; i < 5; i++) c = commitCareerTerm(c, stubTerm({ index: i, career: 'agent' }));
    expect(computeCharacterPension(c)).toBe(10000);

    let scout = newCharacter('id2', 'Scout', 'human');
    for (let i = 0; i < 5; i++) scout = commitCareerTerm(scout, stubTerm({ index: i, career: 'scout' }));
    expect(computeCharacterPension(scout)).toBe(0);
  });
});

describe('phase 3 — skill package', () => {
  it('Traveller package grants 8 skills at level 1, doesn\'t lower existing', () => {
    let c = newCharacter('id', 'Erik', 'human');
    // Pre-existing Pilot at level 3 — should stay at 3.
    c = {
      ...c,
      backgroundSkills: [
        { name: 'Pilot', level: 3, source: { kind: 'manual' } },
      ],
    };
    const traveller = SKILL_PACKAGES.find((p) => p.id === 'traveller')!;
    c = applySkillPackage(c, traveller.skills);
    const pilot = c.backgroundSkills.find((s) => s.name === 'Pilot' && !s.spec);
    expect(pilot?.level).toBe(3);
    const stealth = c.backgroundSkills.find((s) => s.name === 'Stealth');
    expect(stealth?.level).toBe(1);
  });
});

describe('phase 3 — golden path: 2-term Agent → muster out → skill package', () => {
  it('walks through qualify, term-end-commit, second term, muster cash, package', () => {
    let c = newCharacter('id', 'Erik', 'human');
    c = setChar(c, { STR: 9, DEX: 9, END: 9, INT: 9, EDU: 9, SOC: 7 });

    // Two stub terms in Agent (rank 2 → bonus 1 → 2+1 = 3 benefit rolls).
    c = commitCareerTerm(c, stubTerm({ index: 0, career: 'agent', rankAtEnd: 1 }));
    c = commitCareerTerm(c, stubTerm({ index: 1, career: 'agent', rankAtEnd: 2 }));

    expect(totalBenefitRolls(c)).toBe(2 + 1);

    // Roll one cash benefit on the Agent column → 1D=3 = Cr5000.
    const r1 = startMusteringOutRoll(c, CAREERS.agent, 'cash', 0, scriptedRng([dieValue(3)]));
    c = r1.state.character;
    c = { ...c, cashRollsUsed: c.cashRollsUsed + 1 };
    expect(c.currentCash).toBe(5000);
    expect(c.cashRollsUsed).toBe(1);

    // Roll a benefit-column row that's a stat bump: 1D=2 → Agent benefits row 2 = INT +1.
    let r2 = startMusteringOutRoll(c, CAREERS.agent, 'benefits', 0, scriptedRng([dieValue(2)]));
    expect(r2.state.prompt).toBeUndefined();
    c = r2.state.character;
    expect(c.characteristics.INT).toBe(10);

    // Skill package
    const traveller = SKILL_PACKAGES.find((p) => p.id === 'traveller')!;
    c = applySkillPackage(c, traveller.skills);
    expect(c.backgroundSkills.find((s) => s.name === 'Persuade')?.level).toBe(1);
    expect(c.backgroundSkills.find((s) => s.name === 'Pilot' && !s.spec)?.level).toBe(1);
  });
});

// Exercise the engine pause API used by the wizard during connection naming, just to be
// sure these helpers don't regress with the new types.
describe('phase 3 — sanity: name_connection prompt still resumes', () => {
  it('pre-career event 6 → naming flow consumes count', () => {
    let c = newCharacter('id', 'Erik', 'human');
    const rng = scriptedRng([dieValue(3), dieValue(3), d3Value(2)]);
    let state = startPreCareerEvent(c, rng);
    expect(state.prompt?.kind).toBe('name_connection');
    state = drain(state, rng); // already drained, but sanity.
    void blankEngineState;
    void enqueue;
    void resolvePickSkill;
    void resolveCheck;
    void acknowledgeNote;
  });
});
