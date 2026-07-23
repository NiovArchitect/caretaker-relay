import { chromium } from 'playwright';

const BASE = process.env.PUBLIC_URL || 'https://caretaker-relay-web.onrender.com';
const results = {};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0,200)); });
  const failedReqs = [];
  page.on('requestfailed', (req) => {
    failedReqs.push({ url: req.url().slice(0,120), error: req.failure()?.errorText });
  });
  const apiCalls = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (u.includes('caretaker-relay-care-api') || u.includes('/api/v1/care')) {
      apiCalls.push({ url: u.slice(0,140), status: res.status() });
    }
  });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  results.landing_title = await page.title();
  results.brand = await page.locator('.brand').innerText().catch(() => null);
  results.greeting = await page.locator('[data-testid="today-greeting"]').innerText().catch(() => null);
  results.care_recipient = await page.locator('[data-testid="care-recipient-label"]').innerText().catch(() => null);
  results.needs_attention = await page.locator('[data-testid="needs-attention-section"]').count();
  results.try_update_btn = await page.locator('[data-testid="try-care-update"]').count();
  const bodyText = await page.locator('body').innerText();
  results.has_localhost_text = /localhost|127\.0\.0\.1|prisma|fixture|SYNTHETIC_FOUNDATION|JWT|DEBUG/i.test(bodyText);
  results.has_workforce_text = /payroll|workforce schedule|HR portal|employee retention/i.test(bodyText);
  results.body_snippet = bodyText.slice(0, 400);

  if (results.try_update_btn > 0) {
    await page.locator('[data-testid="try-care-update"]').click();
    await page.waitForTimeout(800);
  }
  const draftSel = 'textarea, [data-testid="composer-input"]';
  const draft = await page.locator(draftSel).first().inputValue().catch(() => '');
  results.demo_draft_len = draft.length;

  // click send if present
  const send = page.locator('[data-testid="composer-submit"], [data-testid="send-btn"], button:has-text("Send"), .composer-dock button').last();
  if (await send.count()) {
    await send.click();
  } else if (draft.length) {
    await page.locator(draftSel).first().press('Enter');
  }
  await page.waitForTimeout(2000);

  try {
    await page.locator('[data-testid="verify-panel"]').waitFor({ timeout: 60000 });
    results.verify_panel = true;
    results.verify_items = await page.locator('[data-testid="verify-item"]').count();
    results.med_block = await page.locator('[data-testid="med-safety-block"]').count();
    results.verify_summary = await page.locator('[data-testid="verify-summary"]').innerText().catch(() => null);
    const confirmBtn = page.locator('[data-testid="verify-confirm"], button:has-text("Looks right"), button:has-text("Confirm")').first();
    if (await confirmBtn.count()) {
      await confirmBtn.click();
      await page.waitForTimeout(4000);
    }
    results.after_confirm_handoff = await page.locator('[data-testid="handoff-panel"], [data-testid="handoff"]').count();
    results.after_confirm_today = await page.locator('[data-testid="today-greeting"]').count();
  } catch (e) {
    results.verify_panel = false;
    results.verify_error = String(e.message || e).slice(0, 250);
    results.app_error = await page.locator('[data-testid="app-error"]').count();
    results.relay_text = await page.locator('[data-testid="relay-page"], .relay-page, main').innerText().catch(() => '').then(t => t.slice(0,500));
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  results.mobile_brand_visible = await page.locator('.brand').isVisible();
  results.api_calls = apiCalls.slice(0, 20);
  results.console_errors = consoleErrors.slice(0, 12);
  results.failed_reqs = failedReqs.filter(f => !f.url.includes('favicon')).slice(0, 12);

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch((e) => { console.error('FATAL', e); process.exit(1); });
