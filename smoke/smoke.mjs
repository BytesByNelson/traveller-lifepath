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
  await page.click('button:has-text("Continue → Characteristics")');
  record('Basics → Characteristics', await page.locator('h2:has-text("Characteristics")').isVisible());

  // ─── 3. Roll all characteristics ───
  await page.click('button:has-text("Roll all")');
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
  await page.click('button:has-text("Agent")');
  record('Pick Agent', await page.locator('h2:has-text("Agent — pick assignment")').isVisible());

  await page.click('button:has-text("Law Enforcement")');
  // Either we land on qualification or basic training (depending on whether qualified is automatic)
  const onQualify = await page.locator('h2:has-text("Agent — qualification")').isVisible();
  const onBasic = await page.locator('h2:has-text("Agent — basic training")').isVisible();
  record('Picked Law Enforcement (qualify or basic training)', onQualify || onBasic);

  // If on qualification, click "Roll for me"
  if (onQualify) {
    await page.click('button:has-text("Roll for me")');
    // Wait for one of: success → basic training, fail → pick career
    await page.waitForFunction(() => {
      const h2 = document.querySelector('h2');
      return h2 && (h2.textContent?.includes('basic training') || h2.textContent?.includes('pick a career'));
    }, { timeout: 5_000 });
    const passed = await page.locator('h2:has-text("basic training")').isVisible();
    record('Qualification roll resolved', true, passed ? 'qualified' : 'failed (retry path)');
    if (!passed) {
      // Retry by re-picking Agent
      await page.click('button:has-text("Agent")');
      await page.click('button:has-text("Law Enforcement")');
      // Try again
      while (!(await page.locator('h2:has-text("basic training")').isVisible())) {
        await page.click('button:has-text("Roll for me")');
        await page.waitForTimeout(200);
        if (await page.locator('h2:has-text("pick a career")').isVisible()) {
          await page.click('button:has-text("Agent")');
          await page.click('button:has-text("Law Enforcement")');
        }
      }
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

  // ─── 12. Mobile responsive — narrow viewport ───
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  // Check no horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  record('No horizontal overflow at 375px', overflow <= 4, `scrollWidth - clientWidth = ${overflow}px`);

  // ─── 13. Verify no JS console errors ───
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
