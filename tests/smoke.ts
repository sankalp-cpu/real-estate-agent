/**
 * End-to-end walkthrough of the demo script in README.md, against a running dev
 * server. Uses the pre-installed Chromium — no browser download.
 *
 *   npm run dev      # in one shell
 *   npm run smoke    # in another
 *
 * Screenshots land in tests/screenshots/. Any console error fails the run: a
 * demo that logs errors in front of a client is a demo that failed.
 */

import { chromium, type Browser, type Page } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';
const SHOTS = path.join(process.cwd(), 'tests', 'screenshots');
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

const failures: string[] = [];
const consoleErrors: string[] = [];

function check(label: string, condition: boolean, detail = '') {
  if (condition) {
    console.log(`  ok    ${label}`);
  } else {
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
    failures.push(label);
  }
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });

  let browser: Browser;
  try {
    browser = await chromium.launch({ executablePath: EXECUTABLE });
  } catch {
    browser = await chromium.launch();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => localStorage.setItem('rea-tour-seen', '1'));
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  // -- 1. Dashboard, and the seats problem --------------------------------
  console.log('\n1 · Dashboard and per-user access');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  check('dashboard renders', await page.locator('text=Matters').first().isVisible());
  const counselMatters = await page.locator('.matter-item').count();
  check('counsel sees the department book of work', counselMatters >= 6, `${counselMatters} matters`);
  await shot(page, '01-dashboard');

  await context.addCookies([
    { name: 'rea_user', value: 'u-panel', url: BASE },
  ]);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const panelMatters = await page.locator('.matter-item').count();
  check('panel counsel sees only their matter', panelMatters === 1, `${panelMatters} matters`);

  await page.goto(`${BASE}/matters/m-arb-turnkey`, { waitUntil: 'networkidle' });
  check(
    'panel counsel is refused a matter they are not on',
    await page.locator('text=Not available to you').isVisible(),
  );

  await page.goto(`${BASE}/repository?q=arbitrator+appointed+by+the+employer`, {
    waitUntil: 'networkidle',
  });
  check(
    'scoped search does not leak the EPC contract',
    (await page.locator('text=Turnkey Structures').count()) === 0,
  );

  await context.addCookies([{ name: 'rea_user', value: 'u-counsel-1', url: BASE }]);

  // -- 2. The pleading filed against us -----------------------------------
  console.log('\n2 · Pleading analysis — the marquee ask');
  await page.goto(`${BASE}/analyst`, { waitUntil: 'networkidle' });
  await page.click('button:has-text("Pleading filed against us")');
  await page.click('button:has-text("Load the NCDRC complaint on file")');
  await page.click('button:has-text("Analyse")');
  await page.waitForSelector('text=grounds asserted', { timeout: 20000 });

  check(
    'all seven grounds in the complaint are extracted',
    await page.locator('text=7 grounds asserted').isVisible(),
  );
  check(
    'counter-argument outline is produced',
    await page.locator('text=Counter-argument outline').first().isVisible(),
  );
  check(
    'grounding panel is shown alongside the answer',
    await page.locator('text=Grounding').first().isVisible(),
  );
  await shot(page, '02-pleading-analysis');

  // -- 3. Currency — an overruled authority --------------------------------
  console.log('\n3 · Currency check');
  await page.goto(`${BASE}/analyst`, { waitUntil: 'networkidle' });
  await page.fill('textarea', 'An unstamped agreement cannot be referred to arbitration.');
  await page.click('button:has-text("Analyse")');
  await page.waitForSelector('text=Currency check', { timeout: 20000 });

  check('N.N. Global is retrieved', await page.locator('text=N.N. Global').first().isVisible());
  check(
    'it is flagged overruled',
    (await page.locator('text=/overruled/i').count()) > 0,
  );
  check(
    'the superseding decision is named',
    (await page.locator('text=Interplay').count()) > 0,
  );
  await shot(page, '03-currency-overruled');

  // -- 4. When it does not know -------------------------------------------
  console.log('\n4 · No authority, rather than a guess');
  await page.goto(`${BASE}/analyst`, { waitUntil: 'networkidle' });
  await page.fill(
    'textarea',
    'A shareholder may compel the declaration of dividend in an unlisted company.',
  );
  await page.click('button:has-text("Analyse")');
  await page.waitForSelector('text=No authority found', { timeout: 20000 });

  check(
    'reports no authority instead of the best of a bad set',
    await page.locator('text=No authority found').isVisible(),
  );
  check(
    'no case is cited at all',
    (await page.locator('text=SCC').count()) === 0,
    'a citation appeared on a no-authority answer',
  );
  await shot(page, '04-no-authority');

  // -- 5. Where the developer has the better of it ------------------------
  console.log('\n5 · A proposition available to the developer');
  await page.goto(`${BASE}/analyst`, { waitUntil: 'networkidle' });
  await page.fill(
    'textarea',
    'A landowner cannot claim the earlier acquisition lapsed where compensation was deposited in the treasury.',
  );
  await page.click('button:has-text("Analyse")');
  await page.waitForSelector('text=/Available to the developer|Runs against the developer|Genuinely contested/', {
    timeout: 20000,
  });
  check(
    'the verdict is that the position is available',
    await page.locator('text=Available to the developer').first().isVisible(),
  );
  check(
    'Indore Development Authority is the assisting authority',
    (await page.locator('text=Indore Development Authority').count()) > 0,
  );
  await shot(page, '05-available-to-developer');

  // -- 6. Repository -------------------------------------------------------
  console.log('\n6 · Repository');
  await page.goto(`${BASE}/repository?q=agreement+to+sell+general+power+of+attorney`, {
    waitUntil: 'networkidle',
  });
  check(
    'search reaches the title-chain defect and the authority together',
    (await page.locator('text=Suraj Lamp').count()) > 0,
  );
  check(
    'a low-confidence scan is held back for review',
    (await page.locator('text=Needs review').count()) > 0,
  );
  await shot(page, '06-repository');

  // -- 7. Drafting ---------------------------------------------------------
  console.log('\n7 · Drafting Studio and redline');
  await page.goto(`${BASE}/drafting`, { waitUntil: 'networkidle' });
  await page.selectOption('select', { label: 'Leave and License Agreement — v5.0' });
  await page.click('button:has-text("Fill from example")');
  await page.getByText('Security deposit — forfeiture on early exit').click();
  await page.click('button:has-text("Assemble draft")');
  await page.waitForSelector('text=Redline against the approved position', { timeout: 20000 });

  check(
    'departure from the approved position is redlined',
    await page.locator('text=Redline against the approved position').isVisible(),
  );
  check(
    'the risk note cites the governing authority',
    (await page.locator('text=Kailash Nath').count()) > 0,
  );
  check(
    'the assembled document has no unfilled placeholders',
    (await page.locator('pre:has-text("{{")').count()) === 0,
  );
  await shot(page, '07-drafting-redline');

  // -- 8. Trust and control -------------------------------------------------
  console.log('\n8 · Trust & Control');
  await context.addCookies([{ name: 'rea_user', value: 'u-head', url: BASE }]);
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  check('control room is shown', await page.getByRole('heading', { name: 'Control Room' }).isVisible());
  check('fixture mode is explicitly identified', (await page.locator('text=Demo fixture').count()) > 0);
  check('activity is present', await page.getByRole('heading', { name: 'Activity' }).isVisible());
  await shot(page, '08-trust-and-control');

  await browser.close();

  // -- Result ---------------------------------------------------------------
  console.log('');
  if (consoleErrors.length) {
    console.log(`Console errors (${consoleErrors.length}):`);
    for (const e of [...new Set(consoleErrors)]) console.log(`  ${e}`);
    failures.push('console errors');
  }

  console.log(
    failures.length
      ? `\nFAILED — ${failures.length} check(s): ${failures.join(', ')}`
      : `\nAll checks passed. Screenshots in tests/screenshots/`,
  );
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
