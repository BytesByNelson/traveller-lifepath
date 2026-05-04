import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { Character } from '../../types';
import { newCharacter } from '../../engine';
import { Sheet } from './Sheet';

const fixture = (overrides: Partial<Character> = {}): Character => {
  const c = newCharacter('id', 'Erik', 'human');
  return {
    ...c,
    name: 'Erik',
    homeworld: 'Regina',
    characteristics: { STR: 9, DEX: 8, END: 10, INT: 12, EDU: 11, SOC: 7 },
    backgroundSkills: [
      { name: 'Pilot', spec: 'spacecraft', level: 2, source: { kind: 'manual' } },
      { name: 'Pilot', spec: 'small craft', level: 1, source: { kind: 'manual' } },
      { name: 'Investigate', level: 3, source: { kind: 'manual' } },
      { name: 'Streetwise', level: 1, source: { kind: 'manual' } },
      { name: 'Gun Combat', spec: 'slug rifle', level: 2, source: { kind: 'manual' } },
    ],
    careerHistory: [
      {
        index: 0,
        career: 'agent',
        assignment: 'law_enforcement',
        qualified: true,
        skillRolls: [],
        survival: { rolled: 9, target: 6, success: true },
        rankAtEnd: 2,
        isOfficer: false,
        termOutcome: 'continued',
        advancement: { attempted: true, success: true, rolled: 8 },
      },
      {
        index: 1,
        career: 'agent',
        assignment: 'law_enforcement',
        qualified: true,
        skillRolls: [],
        survival: { rolled: 5, target: 6, success: false },
        rankAtEnd: 2,
        isOfficer: false,
        termOutcome: 'ejected',
      },
    ],
    connections: {
      contacts: [{ id: 'c1', type: 'contact', description: 'Marisa, fence' }],
      allies: [{ id: 'a1', type: 'ally', description: 'Detective Yan' }],
      rivals: [],
      enemies: [{ id: 'e1', type: 'enemy', description: 'Crime boss Hakar' }],
    },
    injuries: [
      {
        id: 'inj1',
        description: 'Severely injured — one physical -1D.',
        termIndex: 1,
        charReductions: { STR: 3 },
      },
    ],
    currentCash: 12500,
    pension: 10000,
    ...overrides,
  };
};

describe('Sheet rendering', () => {
  it('renders Personal Data File with name, age, species, homeworld', () => {
    const html = renderToString(<Sheet character={fixture()} />);
    expect(html).toContain('Erik');
    expect(html).toContain('Regina');
    expect(html).toContain('human');
    // Age = 18 + 4*2 terms = 26
    expect(html).toContain('>26<');
  });

  it('renders all six characteristics with values and DMs', () => {
    const html = renderToString(<Sheet character={fixture()} />);
    expect(html).toContain('STR');
    expect(html).toContain('DEX');
    expect(html).toContain('END');
    expect(html).toContain('INT');
    expect(html).toContain('EDU');
    expect(html).toContain('SOC');
    // INT 12 → DM +2
    expect(html).toMatch(/DM \+2/);
    // SOC 7 → DM 0 (no sign for zero)
    expect(html).toMatch(/DM 0/);
  });

  it('renders skills with parent + specializations', () => {
    const html = renderToString(<Sheet character={fixture()} />);
    expect(html).toContain('Pilot');
    expect(html).toContain('(spacecraft)');
    expect(html).toContain('(small craft)');
    expect(html).toContain('Investigate');
    expect(html).toContain('[3]');
    expect(html).toContain('Gun Combat');
    expect(html).toContain('(slug rifle)');
  });

  it('renders career history with rank titles and survival/advancement marks', () => {
    const html = renderToString(<Sheet character={fixture()} />);
    expect(html).toContain('Agent');
    expect(html).toContain('Law Enforcement');
    // Rank 2 in Agent law_enforcement = "Sergeant"
    expect(html).toContain('Sergeant');
    expect(html).toContain('✓'); // term 0 survival success
    expect(html).toContain('✗'); // term 1 survival fail
    expect(html).toContain('ejected');
  });

  it('renders connections grouped into Allies / Contacts / Rivals / Enemies', () => {
    const html = renderToString(<Sheet character={fixture()} />);
    expect(html).toContain('Marisa, fence');
    expect(html).toContain('Detective Yan');
    expect(html).toContain('Crime boss Hakar');
    expect(html).toContain('Allies');
    expect(html).toContain('Contacts');
    expect(html).toContain('Rivals');
    expect(html).toContain('Enemies');
  });

  it('renders the wounds list when injuries are present', () => {
    const html = renderToString(<Sheet character={fixture()} />);
    expect(html).toContain('Severely injured');
  });

  it('renders finances: cash and pension', () => {
    const html = renderToString(<Sheet character={fixture()} />);
    expect(html).toContain('Cr12,500');
    expect(html).toContain('Cr10,000');
  });

  it('shows empty wounds gracefully when no injuries', () => {
    const c = fixture({ injuries: [] });
    const html = renderToString(<Sheet character={c} />);
    expect(html).toContain('Wounds');
    // Doesn't throw, doesn't show injury text
    expect(html).not.toContain('Severely injured');
  });
});
