#!/usr/bin/env node
/**
 * Whole-UI raw-code census across ordinary routes for Marcus on Evelyn.
 */
import { createRequire } from "module";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const APP = process.env.CARE_APP_URL || "https://care.niovlabs.com";
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../docs/testing/FINAL_WHOLE_UI_RAW_CODE_CENSUS.json",
);
mkdirSync(dirname(OUT), { recursive: true });

const ISO = /\d{4}-\d{2}-\d{2}T|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}Z/;
const MS = /\b\d{13}\b/;
const RAW_ID = /\b(?:p|cr|work|ho|apt|rel|coord|notif)-[a-z0-9-]{3,}\b/i;
const UUID =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const MARKER = /\b(PROBE_|ALPHA-ONLY|BETA-ONLY|smoke-test|SMOKE_|JUDGE_DEMO)\b/i;
const ENUM =
  /\b(available_to_claim|response_received|source_type|work_item|care_event|TASKS_NOW|CHANGES_TODAY)\b/;
const DBERR = /\b(ECONNREFUSED|Prisma|SQLSTATE|stack trace|TypeError:|at Object\.)\b/i;
const DEV = /\b(correlation_id|API route|\/api\/v1\/|undefined is not|null pointer)\b/i;

const ROUTES = [
  { name: "today", testid: "nav-today" },
  { name: "relay", testid: "nav-relay" },
  { name: "care", testid: "nav-care" },
  { name: "people", testid: "nav-people" },
  { name: "documents", testid: "nav-documents" },
  { name: "privacy", testid: "nav-privacy" },
];

function countAll(text) {
  return {
    iso: (text.match(new RegExp(ISO, "g")) || []).length,
    ms: (text.match(new RegExp(MS, "g")) || []).length,
    raw_id: (text.match(new RegExp(RAW_ID, "gi")) || []).length,
    uuid: (text.match(new RegExp(UUID, "gi")) || []).length,
    marker: (text.match(new RegExp(MARKER, "g")) || []).length,
    enum: (text.match(new RegExp(ENUM, "g")) || []).length,
    dberr: (text.match(new RegExp(DBERR, "g")) || []).length,
    dev: (text.match(new RegExp(DEV, "g")) || []).length,
  };
}

async function login(page) {
  await page.goto(APP, { waitUntil: "networkidle", timeout: 120000 }).catch(async () => {
    await page.goto(APP, { waitUntil: "domcontentloaded", timeout: 90000 });
  });
  await page.waitForTimeout(1200);
  const signIn = page.getByRole("button", { name: /Sign in/i }).first();
  if (await signIn.isVisible().catch(() => false)) {
    await signIn.click();
    await page.waitForTimeout(800);
  }
  await page.getByTestId("login-principal").selectOption("p-sadeil");
  await page.getByTestId("login-password").fill("sadeil-lab-password");
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ timeout: 45000 });
}

async function openNav(page, testid) {
  await page.evaluate((id) => {
    document.querySelector(`[data-testid="${id}"]`)?.click();
  }, testid);
  await page.waitForTimeout(1500);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(40000);

try {
  await login(page);
  const perRoute = [];
  const totals = {
    iso: 0,
    ms: 0,
    raw_id: 0,
    uuid: 0,
    marker: 0,
    enum: 0,
    dberr: 0,
    dev: 0,
  };
  let a11yRaw = 0;

  for (const r of ROUTES) {
    await openNav(page, r.testid);
    const body = await page.locator("body").innerText();
    const counts = countAll(body);
    // accessibility tree sample
    const ax = await page.accessibility.snapshot({ interestingOnly: true });
    const axText = JSON.stringify(ax || {});
    const axCounts = countAll(axText);
    a11yRaw +=
      axCounts.iso +
      axCounts.raw_id +
      axCounts.uuid +
      axCounts.marker +
      axCounts.enum +
      axCounts.dberr;
    for (const k of Object.keys(totals)) totals[k] += counts[k];
    perRoute.push({ route: r.name, ...counts, a11y: axCounts });
    console.log(r.name, counts);
  }

  // tooltips / title attributes sample
  const titleAttrs = await page.evaluate(() =>
    [...document.querySelectorAll("[title],[aria-label]")]
      .map((e) => `${e.getAttribute("title") || ""} ${e.getAttribute("aria-label") || ""}`)
      .join("\n"),
  );
  const titleCounts = countAll(titleAttrs);

  const out = {
    recorded_at: new Date().toISOString(),
    app: APP,
    bundle: await page.evaluate(() =>
      [...document.scripts].map((s) => s.src).filter((s) => /index-/.test(s)),
    ),
    perRoute,
    totals,
    title_aria: titleCounts,
    a11y_raw_total: a11yRaw,
    gates: {
      VISIBLE_ISO: totals.iso,
      VISIBLE_MS: totals.ms,
      VISIBLE_RAW_IDS: totals.raw_id,
      VISIBLE_UUIDS: totals.uuid,
      VISIBLE_MARKERS: totals.marker,
      VISIBLE_ENUMS: totals.enum,
      VISIBLE_DBERR: totals.dberr,
      VISIBLE_DEV: totals.dev,
      A11Y_RAW: a11yRaw,
      TITLE_ARIA_RAW:
        titleCounts.iso +
        titleCounts.raw_id +
        titleCounts.uuid +
        titleCounts.marker +
        titleCounts.enum,
    },
  };
  out.all_zero = Object.values(out.gates).every((v) => v === 0);
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log("GATES", out.gates, "all_zero", out.all_zero);
  process.exit(out.all_zero ? 0 : 2);
} catch (e) {
  writeFileSync(OUT, JSON.stringify({ error: String(e), stack: e.stack }, null, 2));
  console.error(e);
  process.exit(1);
} finally {
  await browser.close();
}
