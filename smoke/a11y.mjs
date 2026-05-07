/**
 * Accessibility audit against a deployed (or local) instance of the app.
 *
 * Drives a headless Chromium through the home page, wizard, and sheet, runs
 * axe-core against each, and reports WCAG 2.1 A and AA violations. Tests both
 * the LBB (light) and Imperial (dark) themes since contrast issues are theme-
 * specific.
 *
 * Usage:
 *   node smoke/a11y.mjs                                      # against the production site
 *   A11Y_URL=http://localhost:5173/ node smoke/a11y.mjs       # against `npm run dev`
 *
 * Exit code is the violation count (0 = clean).
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE = (process.env.A11Y_URL ?? 'https://bytesbynelson.github.io/traveller-lifepath/').replace(/\/$/, '');

const axeSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', 'axe-core', 'axe.min.js'),
  'utf8',
);

const PAGES = [
  { name: 'Character library', hash: '/' },
  // Wizard + sheet need a seeded character; we create one client-side below.
];

/** Inject a single test character into localStorage so the wizard and sheet routes
 *  have something to render. Mirrors the Character schema enough for the app to load. */
async function seedCharacter(page) {
  await page.evaluate(() => {
    const id = 'a11y-test';
    const c = {
      schemaVersion: 1,
      id,
      name: 'A11y Test',
      species: 'human',
      characteristics: { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 },
      baseCharacteristics: { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 },
      backgroundSkills: [],
      careerHistory: [],
      connections: { contacts: [], allies: [], rivals: [], enemies: [] },
      connectionsUsed: 0,
      benefits: [],
      injuries: [],
      cashRollsUsed: 0,
      currentCash: 0,
      equipment: [],
      weapons: [],
      armor: [],
      augments: [],
      studyPeriods: [],
      notes: '',
      rollLog: [],
      wizardState: { step: 'basics', rollMode: 'app' },
    };
    localStorage.setItem('traveller:characters:v1', JSON.stringify({ characters: { [id]: c } }));
  });
}

async function runAxe(page, themeLabel) {
  await page.evaluate((src) => {
    const s = document.createElement('script');
    s.text = src;
    document.head.appendChild(s);
  }, axeSource);
  return page.evaluate(async () =>
    window.axe.run(document, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      resultTypes: ['violations'],
    }),
  );
}

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

let totalViolations = 0;
const reportRow = (label, count) => {
  process.stdout.write(`  ${count === 0 ? '✓' : '✗'} ${label}: ${count} violation(s)\n`);
};

for (const theme of ['lbb', 'imperial']) {
  console.log(`\n=== Theme: ${theme.toUpperCase()} ===`);

  for (const target of PAGES) {
    const url = `${BASE}/#${target.hash}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    // Set theme + seed character before audit.
    await page.evaluate((t) => localStorage.setItem('traveller:theme', t), theme);
    await seedCharacter(page);
    await page.reload({ waitUntil: 'networkidle' });

    const results = await runAxe(page, theme);
    reportRow(`${target.name} (${url})`, results.violations.length);
    for (const v of results.violations) {
      console.log(`     [${v.impact}] ${v.id} — ${v.help}`);
      console.log(`       ${v.helpUrl}`);
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`       → ${node.target.join(' > ')}`);
        if (node.failureSummary) {
          console.log(`         ${node.failureSummary.replace(/\n/g, '\n         ')}`);
        }
      }
      if (v.nodes.length > 3) {
        console.log(`       ... and ${v.nodes.length - 3} more occurrence(s)`);
      }
    }
    totalViolations += results.violations.length;
  }

  // Wizard route — needs the seeded character ID.
  for (const route of ['/create/a11y-test', '/sheet/a11y-test', '/npc']) {
    const url = `${BASE}/#${route}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500); // small settle for lazy-loaded chunks
    const results = await runAxe(page, theme);
    reportRow(`${route} (${url})`, results.violations.length);
    for (const v of results.violations) {
      console.log(`     [${v.impact}] ${v.id} — ${v.help}`);
      console.log(`       ${v.helpUrl}`);
      for (const node of v.nodes.slice(0, 3)) {
        console.log(`       → ${node.target.join(' > ')}`);
        if (node.failureSummary) {
          console.log(`         ${node.failureSummary.replace(/\n/g, '\n         ')}`);
        }
      }
      if (v.nodes.length > 3) {
        console.log(`       ... and ${v.nodes.length - 3} more occurrence(s)`);
      }
    }
    totalViolations += results.violations.length;
  }
}

await browser.close();
console.log(`\nTotal WCAG 2.1 A/AA violations across all pages × themes: ${totalViolations}`);
process.exit(totalViolations > 0 ? 1 : 0);
