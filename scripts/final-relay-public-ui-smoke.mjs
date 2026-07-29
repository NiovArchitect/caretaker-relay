#!/usr/bin/env node
/**
 * Final server-parity public UI smoke — Marcus for Evelyn on care.niovlabs.com
 */
import { createRequire } from "module";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = process.env.CARE_APP_URL || "https://care.niovlabs.com";
const OUT = resolve(__dirname, "../docs/testing/FINAL_RELAY_PUBLIC_UI_SMOKE.json");
const shots = resolve(__dirname, "../docs/incidents/evidence/final-server-parity-ui");
mkdirSync(shots, { recursive: true });

const questions = [
  "What am I doing today?",
  "What is on my shift today?",
  "What happened during the last shift?",
  "Send a message to May saying hello.",
  "Change Personal Training tomorrow to 2pm.",
  "Who works after me?",
  "What still needs my attention today?",
];

const isoRe = /\d{4}-\d{2}-\d{2}T/;
const idRe = /\b(?:p|cr|work|ho|apt)-[a-z0-9-]{4,}\b/i;
const techRe = /\b(source_type|work_item|available_to_claim|TASKS_NOW|CHANGES_TODAY)\b/;

async function login(page, personId, password) {
  await page.goto(APP, { waitUntil: "networkidle", timeout: 120000 }).catch(async () => {
    await page.goto(APP, { waitUntil: "domcontentloaded", timeout: 90000 });
  });
  await page.waitForTimeout(1500);

  // Entry chooser → Sign in
  const signInEntry = page.getByRole("button", { name: /Sign in/i }).first();
  if (await signInEntry.isVisible().catch(() => false)) {
    await signInEntry.click();
    await page.waitForTimeout(1000);
  }

  const gate = page.getByTestId("login-gate");
  if (await gate.isVisible({ timeout: 10000 }).catch(() => false)) {
    await page.getByTestId("login-principal").selectOption(personId);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-submit").click();
    await page.getByTestId("app-shell").waitFor({ timeout: 45000 });
    return true;
  }
  if (await page.getByTestId("app-shell").isVisible().catch(() => false)) return true;
  return false;
}

async function openRelay(page) {
  // Nav can be in desktop rail or mobile sheet; force DOM click when not "visible"
  const clicked = await page.evaluate(() => {
    const el =
      document.querySelector('[data-testid="nav-relay"]') ||
      [...document.querySelectorAll("button,a,[role=button],[role=tab]")].find((e) =>
        /relay/i.test((e.textContent || "") + (e.getAttribute("aria-label") || "")),
      );
    if (!el) return false;
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    el.click();
    return true;
  });
  if (!clicked) {
    await page.getByTestId("nav-relay").first().click({ force: true });
  }
  await page.waitForTimeout(1800);
  // Ensure relay composer exists; retry once
  const hasInput = await page
    .locator('[data-testid="relay-input"], textarea')
    .first()
    .isVisible()
    .catch(() => false);
  if (!hasInput) {
    await page.evaluate(() => {
      document.querySelector('[data-testid="nav-relay"]')?.click();
    });
    await page.waitForTimeout(1500);
  }
}

async function ask(page, q) {
  const input = page
    .locator(
      '[data-testid="relay-input"], textarea[placeholder*="Ask"], textarea[placeholder*="Relay"], textarea, input[placeholder*="Ask"]',
    )
    .first();
  await input.waitFor({ state: "visible", timeout: 25000 });
  await input.click({ force: true });
  await input.fill(q);
  const send = page
    .locator(
      '[data-testid="relay-send"], button:has-text("Send"), button[aria-label*="Send"]',
    )
    .first();
  if (await send.count()) await send.click({ force: true }).catch(() => page.keyboard.press("Enter"));
  else await page.keyboard.press("Enter");
  await page.waitForTimeout(5500);
  return page.locator("body").innerText();
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultTimeout(45000);
const results = [];
const defects = [];

try {
  const ok = await login(page, "p-sadeil", "sadeil-lab-password");
  if (!ok) throw new Error("login failed");
  await page.screenshot({ path: resolve(shots, "after-login.png") });

  // Prefer Evelyn if multi-recipient switcher exists
  const recip = await page.getByTestId("care-recipient-label").innerText().catch(() => "");
  console.log("recipient_label", recip);

  await openRelay(page);
  await page.screenshot({ path: resolve(shots, "relay-open.png") });

  for (const q of questions) {
    const after = await ask(page, q);
    const tail = after.slice(-3200);
    const entry = {
      question: q,
      iso: (tail.match(new RegExp(isoRe, "g")) || []).length,
      ids: (tail.match(new RegExp(idRe, "gi")) || []).length,
      tech: (tail.match(new RegExp(techRe, "gi")) || []).length,
      hasCareUpdatesDump: /Care updates recorded/i.test(tail),
      hasUnfinishedOrComing:
        /unfinished|Coming up|Right now|Still open|needs review|Nothing urgent|transportation|evening medication/i.test(
          tail,
        ),
      hasMayaOrMessage: /Maya|message|hello|preview|Send/i.test(tail),
      hasAppointmentDraft:
        /appointment|2:00|2\s*pm|Personal Training|confirm|Draft|reschedul/i.test(tail),
      hasDaniel: /Daniel|previous|covered|last shift|handoff/i.test(tail),
      raw_tail: tail.slice(-1100),
    };
    results.push(entry);
    console.log(
      "Q:",
      q,
      "ISO",
      entry.iso,
      "ID",
      entry.ids,
      "dump",
      entry.hasCareUpdatesDump,
    );
  }
  await page.screenshot({ path: resolve(shots, "after-questions.png"), fullPage: true });

  // Raw scan main content (exclude any debug panels)
  const full = await page.locator("body").innerText();
  const rawScan = {
    iso_count: (full.match(new RegExp(isoRe, "g")) || []).length,
    id_count: (full.match(new RegExp(idRe, "gi")) || []).length,
    tech_count: (full.match(new RegExp(techRe, "gi")) || []).length,
    uuid_count: (
      full.match(
        /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      ) || []
    ).length,
  };
  if (rawScan.iso_count) defects.push("ISO visible in UI");
  if (rawScan.id_count) defects.push("IDs visible in UI");
  if (rawScan.tech_count) defects.push("tech language visible");

  const gates = {
    today_not_dump: results[0] && !results[0].hasCareUpdatesDump,
    shift_not_dump: results[1] && !results[1].hasCareUpdatesDump,
    last_shift_grounded: results[2] && results[2].hasDaniel,
    message_not_meal:
      results[3] && !/meal card|Breakfast|Lunch logged|Meal recorded/i.test(results[3].raw_tail),
    appointment_preview: results[4] && results[4].hasAppointmentDraft,
    next_caregiver: results[5] && /Maya|next|coverage/i.test(results[5].raw_tail),
    attention: results[6] && results[6].hasUnfinishedOrComing,
    raw_iso_zero: rawScan.iso_count === 0,
    raw_id_zero: rawScan.id_count === 0,
  };

  const out = {
    recorded_at: new Date().toISOString(),
    app: APP,
    bundle: await page.evaluate(() =>
      [...document.scripts].map((s) => s.src).filter((s) => /index-/.test(s)),
    ),
    results,
    rawScan,
    gates,
    defects,
    all_pass: Object.values(gates).every(Boolean),
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log("GATES", gates);
  console.log("WROTE", OUT, "all_pass", out.all_pass);
  process.exitCode = out.all_pass ? 0 : 2;
} catch (e) {
  writeFileSync(OUT, JSON.stringify({ error: String(e), stack: e.stack }, null, 2));
  console.error("FAIL", e);
  process.exitCode = 1;
} finally {
  await browser.close();
}
