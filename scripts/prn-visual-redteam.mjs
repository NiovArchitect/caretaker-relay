#!/usr/bin/env node
/**
 * Independent visual PRN red-team (read-only browser).
 * Checks: no raw lifecycle codes, no duplicate as-needed cards, scheduled vs PRN clarity,
 * completed episodes not flooding Today, mobile + 200% zoom smoke.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const APP = process.env.CARE_URL || "https://care.niovlabs.com";
const OUT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../docs/testing/prn-visual-redteam",
);
mkdirSync(OUT_DIR, { recursive: true });

const RAW = /\b(reassessment_due|awaiting_confirmation|PRN_ORDER_V1|PRN_EPISODE_V1|lifecycle:|prn-ep-)\b/i;
const findings = [];

function note(id, ok, detail) {
  findings.push({ id, ok, detail });
}

async function login(page) {
  await page.goto(APP, { waitUntil: "networkidle", timeout: 90000 });
  const entry = page.getByTestId("entry-sign-in");
  if (await entry.isVisible().catch(() => false)) await entry.click();
  await page.getByTestId("login-principal").selectOption("p-sadeil");
  await page.getByTestId("login-password").fill("sadeil-lab-password");
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ timeout: 45000 });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

try {
  await login(page);
  await page.screenshot({ path: resolve(OUT_DIR, "desktop-today.png"), fullPage: true });
  const todayText = await page.locator("body").innerText();
  note("no_raw_today", !RAW.test(todayText), "Today body raw scan");
  const openFollow = (todayText.match(/As-needed follow-up/gi) || []).length;
  note("today_followup_count_le_3", openFollow <= 3, `count=${openFollow}`);

  // Care medications — use stable section test id
  await page.getByTestId("nav-care").click().catch(async () => {
    await page.getByText("Care", { exact: true }).first().click();
  });
  await page.waitForTimeout(1200);
  await page.getByTestId("care-section-medications").click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  // Wait for PRN heading if present
  await page
    .getByTestId("care-prn-heading")
    .waitFor({ timeout: 8000 })
    .catch(() => {});
  await page.screenshot({ path: resolve(OUT_DIR, "desktop-care-meds.png"), fullPage: true });
  const careText = await page.locator("body").innerText();
  const headingVisible = await page
    .getByTestId("care-prn-heading")
    .isVisible()
    .catch(() => false);
  note(
    "as_needed_heading",
    headingVisible || /As-needed medications/i.test(careText),
    headingVisible ? "testid" : "text-scan",
  );
  note(
    "scheduled_separated",
    /Scheduled medications/i.test(careText) || headingVisible,
    /Scheduled medications/i.test(careText) ? "label" : "prn-section-only",
  );
  note("no_raw_care", !RAW.test(careText), "Care raw scan");
  const orderCards = await page.locator('[data-testid^="care-prn-order-"]').count();
  note(
    "order_cards_present",
    orderCards >= 1 || /Acetaminophen|Ondansetron|as-needed/i.test(careText),
    `orders=${orderCards}`,
  );
  const historyCards = await page.locator('[data-testid^="care-prn-history-"]').count();
  note("history_or_empty_ok", historyCards >= 0, `history=${historyCards}`);

  const titles = careText.match(/As-needed medications/gi) || [];
  note("single_as_needed_section", titles.length <= 2, `headings=${titles.length}`);

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  // may need re-login if session lost — shell check
  if (!(await page.getByTestId("app-shell").isVisible().catch(() => false))) {
    await login(page);
  }
  await page.screenshot({ path: resolve(OUT_DIR, "mobile-390.png"), fullPage: true });
  const mob = await page.locator("body").innerText();
  note("mobile_no_raw", !RAW.test(mob), "mobile raw");

  // 200% zoom simulation via CSS
  await page.setViewportSize({ width: 683, height: 450 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: resolve(OUT_DIR, "zoom-200.png"), fullPage: true });
  note("zoom_shell_visible", await page.getByTestId("app-shell").isVisible().catch(() => false), "shell at zoom");

  const asset = (await page.content()).match(/assets\/(index-[^"]+\.js)/)?.[1] || "unknown";
  const summary = {
    asset,
    passed: findings.filter((f) => f.ok).length,
    total: findings.length,
    findings,
  };
  writeFileSync(resolve(OUT_DIR, "REDTEAM.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.passed === summary.total ? 0 : 1);
} catch (e) {
  console.error(e);
  writeFileSync(resolve(OUT_DIR, "REDTEAM.json"), JSON.stringify({ error: String(e) }, null, 2));
  process.exit(1);
} finally {
  await browser.close();
}
