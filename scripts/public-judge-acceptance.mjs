/**
 * Public remote acceptance against the live Caretaker Relay URL.
 * Run: node scripts/public-judge-acceptance.mjs
 * Optional: PUBLIC_URL=https://care.niovlabs.com node scripts/public-judge-acceptance.mjs
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE =
  process.env.PUBLIC_URL || "https://caretaker-relay-web.onrender.com";

const FALLBACK_UTT =
  "Mom was dizzy again when she got up. She ate around nine. She said she took two of the blood pressure pills but the bottle still says one. PT moved to Thursday. Can you make sure Maya knows about the dizziness?";

function loadJudgeUtt() {
  try {
    return readFileSync("/tmp/judge_utt.txt", "utf8").trim() || FALLBACK_UTT;
  } catch {
    return FALLBACK_UTT;
  }
}

const results = {};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 200));
  });
  const apiCalls = [];
  page.on("response", (res) => {
    const u = res.url();
    if (u.includes("care-api") || u.includes("/api/v1/care")) {
      apiCalls.push({ url: u.slice(0, 140), status: res.status() });
    }
  });

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3000);

  // Public product requires lab sign-in before Relay surfaces exist.
  if ((await page.locator('[data-testid="login-gate"]').count()) > 0) {
    await page.locator('[data-testid="login-principal"]').selectOption({
      label: /Marcus/i,
    }).catch(async () => {
      await page.locator('[data-testid="login-principal"]').selectOption({ index: 0 });
    });
    await page
      .locator('[data-testid="login-password"]')
      .fill(process.env.LAB_PASSWORD || "sadeil-lab-password");
    await page.locator('[data-testid="login-submit"]').click();
    await page
      .locator('[data-testid="composer-input"], [data-testid="today-greeting"]')
      .first()
      .waitFor({ timeout: 90000 });
    await page.waitForTimeout(1500);
  }

  results.landing_title = await page.title();
  results.brand = await page.locator(".brand").innerText().catch(() => null);
  results.greeting = await page
    .locator('[data-testid="today-greeting"]')
    .innerText()
    .catch(() => null);
  results.care_recipient = await page
    .locator('[data-testid="care-recipient-label"]')
    .innerText()
    .catch(() => null);
  results.needs_attention = await page
    .locator('[data-testid="needs-attention-section"]')
    .count();
  results.try_update_btn = await page
    .locator('[data-testid="try-care-update"]')
    .count();

  const bodyText = await page.locator("body").innerText();
  results.has_localhost_text =
    /localhost|127\.0\.0\.1|prisma|fixture|SYNTHETIC_FOUNDATION|JWT|DEBUG/i.test(
      bodyText,
    );
  results.has_workforce_text =
    /payroll|workforce schedule|HR portal|employee retention/i.test(bodyText);
  results.body_snippet = bodyText.slice(0, 350);

  // Open Relay if composer is docked/hidden behind Today-only layout
  if ((await page.locator('[data-testid="composer-input"]').count()) === 0) {
    const openers = [
      '[data-testid="try-care-update"]',
      '[data-testid="try-care-update-top"]',
      'button:has-text("Ask or update Relay")',
      'button:has-text("Relay")',
    ];
    for (const sel of openers) {
      if (await page.locator(sel).count()) {
        await page.locator(sel).first().click().catch(() => {});
        await page.waitForTimeout(800);
        if ((await page.locator('[data-testid="composer-input"]').count()) > 0)
          break;
      }
    }
  }

  // Prefer explicit fill of natural multi-event update (judge path without depending on CTA geometry)
  await page.locator('[data-testid="composer-input"]').fill(loadJudgeUtt());
  await page.waitForTimeout(300);
  results.demo_draft_len = (
    await page.locator('[data-testid="composer-input"]').inputValue()
  ).length;

  await page.locator('[data-testid="composer-send"]').click();
  await page.waitForTimeout(1500);

  try {
    await page.locator('[data-testid="verify-panel"]').waitFor({ timeout: 90000 });
    results.verify_panel = true;
    results.verify_items = await page.locator('[data-testid="verify-item"]').count();
    results.med_block = await page
      .locator('[data-testid="med-safety-block"]')
      .count();
    results.verify_summary = await page
      .locator('[data-testid="verify-summary"]')
      .innerText()
      .catch(() => null);
    results.verify_body = (
      await page.locator('[data-testid="verify-panel"]').innerText()
    ).slice(0, 600);

    const confirmBtn = page
      .locator(
        '[data-testid="verify-confirm"], button:has-text("Looks right"), button:has-text("Confirm")',
      )
      .first();
    if (await confirmBtn.count()) {
      await confirmBtn.click();
      await page.waitForTimeout(5000);
    }
    results.after_confirm_handoff = await page
      .locator('[data-testid="handoff-panel"], [data-testid="handoff"]')
      .count();
    results.after_confirm_today = await page
      .locator('[data-testid="today-greeting"]')
      .count();
    results.what_changed = await page
      .locator('[data-testid="what-changed-list"] li')
      .count()
      .catch(() => 0);
  } catch (e) {
    results.verify_panel = false;
    results.verify_error = String(e.message || e).slice(0, 300);
    results.app_error = await page.locator('[data-testid="app-error"]').count();
    results.relay_text = (
      await page.locator("main").innerText().catch(() => "")
    ).slice(0, 500);
  }

  // Refresh persistence
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  results.after_refresh_greeting = await page
    .locator('[data-testid="today-greeting"]')
    .innerText()
    .catch(() => null);

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  results.mobile_brand_visible = await page.locator(".brand").isVisible();
  results.mobile_composer = await page
    .locator('[data-testid="composer-input"]')
    .isVisible()
    .catch(() => false);

  // Also try primary CTA is clickable after fix
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  try {
    const top = page.locator('[data-testid="try-care-update-top"]');
    if (await top.count()) {
      await top.click({ timeout: 8000 });
      results.cta_clickable = true;
      results.cta_which = "top";
    } else {
      await page.locator('[data-testid="try-care-update"]').scrollIntoViewIfNeeded();
      await page
        .locator('[data-testid="try-care-update"]')
        .click({ timeout: 8000, force: true });
      results.cta_clickable = true;
      results.cta_which = "bottom-force";
    }
    results.cta_filled_len = (
      await page.locator('[data-testid="composer-input"]').inputValue()
    ).length;
  } catch (e) {
    results.cta_clickable = false;
    results.cta_error = String(e.message || e).slice(0, 160);
  }

  results.api_calls = apiCalls.slice(0, 25);
  results.console_errors = consoleErrors.slice(0, 12);
  results.css_href = await page
    .locator('link[rel="stylesheet"]')
    .getAttribute("href")
    .catch(() => null);

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
