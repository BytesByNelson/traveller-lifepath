/**
 * Smoke test against a deployed instance of the app. Drives a real headless Chromium
 * through the full happy path of character creation, then exercises export/import,
 * undo, the roll-log viewer, and mobile responsiveness.
 *
 * Usage:
 *   npm run smoke                                 # tests https://bytesbynelson.github.io/traveller-lifepath/
 *   SMOKE_URL=http://localhost:5173/ npm run smoke  # test against `npm run dev`
 *
 * Requires `npx playwright install chromium` once before first use.
 *
 * Not wired into CI — running this against the deployed site has a chicken-and-egg
 * problem (the workflow would need to deploy first and then test). Run it locally
 * after a push to verify production looks healthy.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const URL = process.env.SMOKE_URL ?? 'https://bytesbynelson.github.io/traveller-lifepath/';
const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  process.stdout.write(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}\n`);
}

async function withTimeout(p, ms, label) {
  return Promise.race([
    p,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout: ${label}`)), ms)),
  ]);
}

const browser = await chromium.launch();
const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'traveller-smoke-'));
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
});
const page = await context.newPage();

const errors = [];
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
});

try {
  // ─── 1. Page loads ───
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10_000 });
  record('Page loads', (await page.locator('h1').textContent()) === 'Travellers');

  // ─── 2. Create a new Traveller ───
  await page.click('button:has-text("+ New Traveller")');
  await page.waitForURL(/\/create\//, { timeout: 5_000 });
  record('Create routes to /create/:id', true);

  // Basics step
  await page.fill('input[placeholder*="Traveller"]', 'Smoke Test');
  // Characteristics-method picker (required gate; Continue is disabled until one is selected).
  // Three options: "Roll — site does it" / "Roll — I'll throw the dice" / "Point-buy".
  await page.click('button:has-text("Roll — site does it")');
  record('Characteristics-method picker selectable (app)', true);
  await page.click('button:has-text("Continue → Characteristics")');
  record('Basics → Characteristics', await page.locator('h2:has-text("Characteristics")').isVisible());

  // ─── 3. Roll the pool, drain it in order ───
  // App mode rolls 2D × 6 into a pool; "Take in order" assigns them top-to-bottom.
  await page.click('button:has-text("Roll pool")');
  await page.click('button:has-text("Take in order")');
  // Per-stat Re-roll buttons (text exactly "Re-roll") appear after assignments
  // land. Note there's also a "Re-roll pool" header button with overlapping
  // text — match by exact accessible name to skip it.
  const perStatReroll = page.getByRole('button', { name: 'Re-roll', exact: true });
  const rerollCount = await perStatReroll.count();
  record('Re-roll buttons appear after pool drain (app mode)', rerollCount >= 6, `${rerollCount} buttons`);

  // Click one per-stat re-roll and verify the rollLog gains a "(re-roll)" entry.
  await perStatReroll.first().click();
  await page.waitForTimeout(150);
  const hasRerollLog = await page.locator('aside ol li').filter({ hasText: '(re-roll)' }).count();
  record('Re-roll appends a (re-roll) entry to the roll log', hasRerollLog > 0, `${hasRerollLog} entries`);

  // After rolling, Continue should be enabled and 6 chars should have non-default values
  await page.click('button:has-text("Continue → Background skills")');
  record('Characteristics rolled and step advanced',
    await page.locator('h2:has-text("Background skills")').isVisible());

  // ─── 4. Pick background skills ───
  // The wizard tells us how many remain via "X left to pick" — keep clicking until 0.
  const allowedMatch = await page.locator('text=/may pick/').textContent();
  const allowed = allowedMatch ? Number(allowedMatch.match(/(\d+)\s+background/)?.[1] ?? 3) : 3;
  const wishlist = ['Admin', 'Drive', 'Streetwise', 'Carouse', 'Mechanic', 'Medic'];
  let picked = 0;
  for (const skill of wishlist) {
    if (picked >= allowed) break;
    const btn = page.getByRole('button', { name: skill, exact: true });
    if ((await btn.count()) > 0) {
      await btn.first().click();
      picked += 1;
    }
  }
  record('Picked background skills', picked === allowed, `picked ${picked} of allowed ${allowed}`);

  await page.click('button:has-text("Continue → Career term")');
  record('Background → Pre-career education',
    await page.locator('h2:has-text("Pre-career education")').isVisible());

  // ─── 5. Skip pre-career education ───
  await page.click('button:has-text("Skip pre-career education")');
  record('Skip pre-career → Career term',
    await page.locator('h2:has-text("pick a career")').isVisible());

  // ─── 6. Pick Agent → Law Enforcement ───
  // Career picker now shows a details panel after a career is clicked. Selecting
  // the career card focuses it; the "Continue → {career} assignments" button
  // inside the details panel routes to the assignment picker.
  await page.click('button:has-text("Agent")');
  await page.click('button:has-text("Continue → Agent assignments")');
  record('Pick Agent', await page.locator('h2:has-text("Agent — pick assignment")').isVisible());

  await page.click('button:has-text("Law Enforcement")');
  // Either we land on qualification or basic training (depending on whether qualified is automatic)
  const onQualify = await page.locator('h2:has-text("Agent — qualification")').isVisible();
  const onBasic = await page.locator('h2:has-text("Agent — basic training")').isVisible();
  record('Picked Law Enforcement (qualify or basic training)', onQualify || onBasic);

  // If on qualification, roll and click through the qualification-result page.
  if (onQualify) {
    await page.click('button:has-text("Roll for me")');
    // After rolling, the wizard pauses on a qualify_outcome screen showing
    // PASS/FAIL details. Wait for it to appear, then advance via the relevant
    // continuation button.
    await page.waitForSelector('h2:has-text("qualification result")', { timeout: 5_000 });
    const passContinue = page.locator('button:has-text("Continue → Basic training")');
    const drifterFallback = page.locator('button:has-text("Take Drifter")');
    if (await passContinue.isVisible()) {
      await passContinue.click();
      record('Qualification roll resolved', true, 'qualified');
    } else if (await drifterFallback.isVisible()) {
      // Failed qualification: per RAW p13 the only options are Drifter or Draft.
      // Take Drifter and pick the first assignment so the rest of the smoke
      // (roll log, undo, export) still runs against a valid character.
      await drifterFallback.click();
      // The drifter assignment picker shows a list of buttons in a <ul>; click
      // the first one to commit to an assignment.
      await page.waitForSelector('h2:has-text("Drifter — pick assignment")', { timeout: 3_000 });
      await page.locator('section ul button').first().click();
      record('Qualification roll resolved', true, 'failed → Drifter fallback');
    } else {
      record('Qualification roll resolved', false, 'unexpected qualify_outcome state');
    }
  }

  // ─── 7. Verify Roll log shows entries ───
  const logEntries = await page.locator('aside ol li').count();
  record('Roll log captures rolls', logEntries > 0, `${logEntries} entries`);

  // ─── 8. Open the roll log viewer ───
  await page.click('button:has-text("Open full log")');
  const viewerVisible = await page.locator('h2:has-text("Roll log")').isVisible();
  record('Roll log viewer opens', viewerVisible);

  // Filter by RNG
  if (viewerVisible) {
    await page.selectOption('select[aria-label="Source filter"]', 'rng');
    record('Source filter applied', true);
    // Close viewer
    await page.keyboard.press('Escape').catch(() => {});
    // The viewer was wired to close on backdrop click; try clicking the X button
    const closeBtn = page.locator('button[aria-label="Close"]');
    if (await closeBtn.isVisible()) await closeBtn.click();
    record('Roll log viewer closes', !(await page.locator('h2:has-text("Roll log")').isVisible()));
  }

  // ─── 9. Undo button ───
  const undoBtn = page.locator('button:has-text("Undo")');
  const undoEnabled = !(await undoBtn.isDisabled());
  record('Undo button is enabled after edits', undoEnabled);

  // ─── 10. Export JSON ───
  const downloadPromise = page.waitForEvent('download', { timeout: 5_000 });
  await page.click('button:has-text("Export JSON")');
  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  await download.saveAs(path.join(downloadDir, filename));
  const exportedPath = path.join(downloadDir, filename);
  const exportedRaw = fs.readFileSync(exportedPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(exportedRaw);
  } catch {
    parsed = null;
  }
  record('Export JSON downloads a parseable file',
    !!parsed, `${filename} (${exportedRaw.length} bytes, schemaVersion=${parsed?.schemaVersion})`);
  record('Exported character has expected name',
    parsed?.name === 'Smoke Test', `name="${parsed?.name}"`);

  // ─── 11. Import JSON (with UUID conflict prompt) ───
  await page.goto(URL, { waitUntil: 'networkidle' });
  // Existing character should already be in localStorage; importing the same file should trigger conflict
  // Set up file chooser handler
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('button:has-text("Import JSON")'),
  ]);
  await fileChooser.setFiles(exportedPath);
  await page.waitForTimeout(500);
  const conflictPrompt = await page.locator('text=already exists').isVisible();
  record('Import shows UUID conflict prompt', conflictPrompt);
  if (conflictPrompt) {
    await page.click('button:has-text("Import as new copy")');
    await page.waitForURL(/\/sheet\//, { timeout: 5_000 });
    record('Clone-as-new navigates to the new character sheet',
      /\/sheet\//.test(page.url()), page.url());

    // ─── 11b. Catalogue picker on the editable sheet ───
    // We're on /sheet/:id for the cloned character. Exercise the weapon and armour pickers.
    {
      const pickWeapon = page.locator('button:has-text("Pick weapon from catalogue")').first();
      await pickWeapon.scrollIntoViewIfNeeded();
      await pickWeapon.click();
      await page.waitForSelector('[aria-label="weapon catalogue"]', { timeout: 5_000 });
      await page.fill('input[aria-label="Search catalogue"]', 'cutlass');
      await page.click('button:has-text("Cutlass")');
      // Modal should close and the weapons table now contains "Cutlass".
      await page.waitForFunction(
        () => !document.querySelector('[aria-label="weapon catalogue"]'),
        { timeout: 5_000 },
      );
      const weaponsHasCutlass = await page.locator('text=Cutlass').first().isVisible();
      record('Catalogue picker adds a weapon to the sheet', weaponsHasCutlass);
    }
    {
      const pickArmour = page.locator('button:has-text("Pick armour from catalogue")').first();
      await pickArmour.scrollIntoViewIfNeeded();
      await pickArmour.click();
      await page.waitForSelector('[aria-label="armour catalogue"]', { timeout: 5_000 });
      // Search for Mesh — short, common term
      await page.fill('input[aria-label="Search catalogue"]', 'mesh');
      await page.click('button:has-text("Mesh")');
      await page.waitForFunction(
        () => !document.querySelector('[aria-label="armour catalogue"]'),
        { timeout: 5_000 },
      );
      const armourHasMesh = await page.locator('text=Mesh').first().isVisible();
      record('Catalogue picker adds armour to the sheet', armourHasMesh);
    }
    {
      // Max-TL filter sanity check — set TL=5 in the augment picker, expect no augments to appear
      // (lowest-TL augment is TL10).
      const pickAugment = page.locator('button:has-text("Pick augment from catalogue")').first();
      await pickAugment.scrollIntoViewIfNeeded();
      await pickAugment.click();
      await page.waitForSelector('[aria-label="augment catalogue"]', { timeout: 5_000 });
      await page.fill('input[aria-label="Max TL"]', '5');
      // Wait a tick for the filter to apply
      await page.waitForTimeout(150);
      const noItemsVisible = await page.locator('text=No items match').isVisible();
      record('Max-TL filter empties the augment list at TL5', noItemsVisible);
      // Close the modal via the X button
      await page.click('[aria-label="armour catalogue"] >> ..').catch(() => {});
      // Fall back to backdrop click
      const dialog = page.getByRole('dialog', { name: 'augment catalogue' });
      if (await dialog.isVisible()) {
        await page.keyboard.press('Escape').catch(() => {});
        await dialog.locator('button[aria-label="Close"]').click().catch(() => {});
      }
    }

    // Navigate back to the list and count cards
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const cardCount = await page.locator('main ul li').count();
    record('List page shows 2 characters after clone', cardCount === 2, `${cardCount} cards`);
  }

  // ─── 11c. Engine-level catalogue picker via mustering out ───
  // Seed a character at the mustering_out step with one Agent term, then click
  // benefit-column rolls until a catalogue prompt appears. Agent's benefit table
  // hits a catalogue prompt on rolls 1, 4, 5, 6 (4 of 7) — within ~7 rolls the
  // probability of NOT hitting one is < 1%.
  {
    const seedId = 'smoke-muster-' + Math.random().toString(36).slice(2, 10);
    // Stuff careerHistory with a 5-term Agent at rank 5 — gives us 5 + 3 = 8
    // benefit rolls total, which is more than enough to hit a catalogue prompt
    // probabilistically (~99.4% chance in 8 rolls).
    const stubTerms = Array.from({ length: 5 }, (_, i) => ({
      index: i,
      career: 'agent',
      assignment: 'law_enforcement',
      qualified: true,
      skillRolls: [],
      survival: { rolled: 9, target: 6, success: true },
      rankAtEnd: 5,
      isOfficer: false,
      termOutcome: 'continued',
      advancement: { attempted: true, success: true, rolled: 8 },
    }));
    const seedChar = {
      schemaVersion: 1,
      id: seedId,
      name: 'Smoke Muster',
      species: 'human',
      characteristics: { STR: 8, DEX: 8, END: 9, INT: 9, EDU: 9, SOC: 7 },
      baseCharacteristics: { STR: 8, DEX: 8, END: 9, INT: 9, EDU: 9, SOC: 7 },
      backgroundSkills: [
        { name: 'Streetwise', level: 0, source: { kind: 'background' } },
      ],
      careerHistory: stubTerms,
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
      wizardState: { step: 'mustering_out' },
    };
    // Write directly to localStorage so the store hydrates on next page load.
    await page.evaluate(({ id, char }) => {
      localStorage.setItem(`traveller:char:${id}`, JSON.stringify(char));
      const indexRaw = localStorage.getItem('traveller:index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      index.push({ id, name: char.name, species: char.species, lastModified: Date.now() });
      localStorage.setItem('traveller:index', JSON.stringify(index));
    }, { id: seedId, char: seedChar });

    // Hard reload so the in-memory store re-hydrates from the new localStorage.
    await page.goto(`${URL}#/create/${seedId}`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('h2:has-text("Mustering out")', { timeout: 5_000 });
    record('Seeded character lands on mustering-out step', true);

    // Click benefit-column rolls until a catalogue picker appears.
    // Catalogue prompts use h3 starting with "Pick " (Pick armour / Pick a weapon /
    // Pick a blade / Pick a gun / Pick an augment / Pick scientific gear).
    const cataloguePromptLocator = page.locator('h3').filter({ hasText: /^Pick / });

    let pickerOpened = false;
    let pickerTitle = null;
    let rollsAttempted = 0;
    let lastSeen = '';
    for (let i = 0; i < 12 && !pickerOpened; i++) {
      const benefitBtn = page.locator('button:has-text("Benefits column")').first();
      const benefitVisible = await benefitBtn.isVisible();
      if (!benefitVisible) {
        lastSeen = await page.locator('main').innerText().catch(() => '');
        break;
      }
      await benefitBtn.click();
      rollsAttempted += 1;
      // Wait for either the catalogue prompt or an Apply / Acknowledge button to appear.
      try {
        await page.waitForSelector(
          'h3:has-text("Pick "), button:has-text("Apply benefit"), button:has-text("Acknowledge")',
          { timeout: 3_000 },
        );
      } catch {
        // fallthrough
      }
      if (await cataloguePromptLocator.first().isVisible()) {
        pickerOpened = true;
        pickerTitle = await cataloguePromptLocator.first().textContent();
        break;
      }
      const applyBtn = page.locator('button:has-text("Apply benefit")').first();
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
        await page.waitForTimeout(200);
        continue;
      }
      const ack = page.locator('button:has-text("Acknowledge")').first();
      if (await ack.isVisible()) {
        await ack.click();
        await page.waitForTimeout(200);
        continue;
      }
      // Choice/other — pick first option to advance.
      const choiceBtn = page.locator('section section button, section [role="button"]').first();
      if (await choiceBtn.isVisible()) {
        await choiceBtn.click().catch(() => {});
        await page.waitForTimeout(200);
        continue;
      }
      lastSeen = await page.locator('main').innerText().catch(() => '');
      break;
    }
    record(
      'Catalogue picker prompt opened during mustering-out',
      pickerOpened,
      pickerTitle ?? `no picker after ${rollsAttempted} rolls — ${lastSeen.slice(0, 200)}`,
    );

    if (pickerOpened) {
      // Pick the first item in the list and verify it commits.
      const firstItem = page.locator('h3').filter({ hasText: /^Pick / }).locator('..').locator('ul li button').first();
      if (await firstItem.isVisible()) {
        await firstItem.click();
        await page.waitForTimeout(250);
        const headerGone = !(await cataloguePromptLocator.first().isVisible());
        record('Catalogue picker selection commits and dismisses the prompt', headerGone);
      } else {
        record('Catalogue picker had at least one item to choose', false, 'no items rendered');
      }
    }
  }

  // ─── 12. Mobile responsive — narrow viewport ───
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  // Check no horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  record('No horizontal overflow at 375px', overflow <= 4, `scrollWidth - clientWidth = ${overflow}px`);

  // ─── 12b. Print-mode rendering on the sheet ───
  // Best a headless test can do without rendering an actual PDF: emulate the
  // print media, navigate to a sheet, and assert that print:hidden chrome is
  // hidden and there's no horizontal overflow at letter-landscape proportions.
  {
    // Load any existing character (the imported clone from earlier).
    await page.setViewportSize({ width: 1100, height: 850 }); // ~ landscape letter @ 96dpi
    await page.goto(URL, { waitUntil: 'networkidle' });
    // Click the first character card on the list.
    const firstCard = page.locator('main ul li button').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/(create|sheet)/, { timeout: 5_000 });
      // Force into sheet view if we landed on creation.
      if (!/\/sheet\//.test(page.url())) {
        // Skip — character isn't finalised. Use the persistence-seeded one if available.
        await page.goBack();
      }
    }

    // Switch to print media.
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(150);

    // Assert that print:hidden header chrome is gone (Roll log button etc.).
    const printChromeHidden = await page.evaluate(() => {
      const candidates = document.querySelectorAll('.print\\:hidden');
      // Every print:hidden element must compute to display: none.
      return Array.from(candidates).every((el) => {
        return getComputedStyle(el).display === 'none';
      });
    });
    record('Print mode hides .print:hidden chrome', printChromeHidden);

    // Assert no horizontal overflow in print mode.
    const printOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    record('No horizontal overflow in print mode', printOverflow <= 4, `print scrollWidth - clientWidth = ${printOverflow}px`);

    // Reset to screen media for the rest of the run.
    await page.emulateMedia({ media: 'screen' });
  }

  // ─── 13. Footer disclaimer + Buy Me a Coffee link ───
  await page.emulateMedia({ media: 'screen' });
  await page.goto(URL, { waitUntil: 'networkidle' });
  {
    // The CharacterListPage has its own inline <footer> for the localStorage hint;
    // the site-wide Footer component is the one with the fan-tool disclaimer +
    // Buy-Me-a-Coffee link. Target by accessible name to skip the inline one.
    const footer = page.getByRole('contentinfo').filter({ hasText: 'Unofficial fan tool' });
    const footerVisible = await footer.isVisible();
    record('Footer renders site-wide', footerVisible);
    if (footerVisible) {
      const text = (await footer.innerText()).toLowerCase();
      record('Footer contains the unofficial / fan-tool disclaimer',
        text.includes('unofficial fan tool') && text.includes('mongoose'));
      const bmc = footer.locator('a[href*="buymeacoffee.com/bytesbynelson"]');
      record('Footer includes Buy Me a Coffee link', (await bmc.count()) > 0);
    }
  }

  // ─── 14. GoatCounter analytics script tag is wired ───
  {
    const goatcounterPresent = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(
        (s) =>
          s.getAttribute('data-goatcounter') === 'https://traveller-lifepath.goatcounter.com/count' ||
          s.src?.includes('gc.zgo.at/count.js'),
      );
    });
    record('GoatCounter analytics script tag present', goatcounterPresent);
    const noOnload = await page.evaluate(() => {
      // The HTML inline script set window.goatcounter = { no_onload: true } before the
      // async script loaded. The async script may overwrite the object, but no_onload
      // should still be true (or the object should at least exist).
      return typeof window.goatcounter !== 'undefined';
    });
    record('window.goatcounter is initialised', noOnload);
  }

  // ─── 15. Verify no JS console errors ───
  record('No JS console errors', errors.length === 0,
    errors.length === 0 ? '' : errors.slice(0, 3).join(' | '));

} catch (err) {
  record('FATAL', false, err.message);
} finally {
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  process.stdout.write(`\n${results.length - failed.length}/${results.length} smoke checks passed\n`);
  if (failed.length > 0) {
    process.stdout.write(`\nFailures:\n${failed.map((f) => `  ✗ ${f.name}: ${f.detail}`).join('\n')}\n`);
    process.exit(1);
  }
}
