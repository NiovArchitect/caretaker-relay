/**
 * Whole-app final after-census — roles × key screens × key viewports.
 * Does not redesign Today unless regression flags fire.
 *
 * NODE_PATH=./node_modules node scripts/whole-app-final-after-census.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.CARE_URL || "https://care.niovlabs.com";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../docs/design/screenshots/whole-app-final-after-census");
const JSON_OUT = path.resolve(__dirname, "../docs/testing/WHOLE_APP_FINAL_AFTER_CENSUS.json");
fs.mkdirSync(OUT, { recursive: true });

const PASSWORDS = {
  "p-sadeil": "sadeil-lab-password",
  "p-maya": "maya-lab-password",
  "p-walter": "walter-lab-password",
  "p-dr-shah": "drshah-lab-password",
};

const ROLES = [
  { id: "p-sadeil", label: "family", name: "Marcus" },
  { id: "p-maya", label: "family_friend", name: "Maya" },
  { id: "p-walter", label: "dsp", name: "Daniel" },
  { id: "p-dr-shah", label: "clinician", name: "DrShah" },
];

const VPS = [
  { name: "mobile-390", w: 390, h: 844 },
  { name: "tablet-768", w: 768, h: 1024 },
  { name: "desktop-1366", w: 1366, h: 768 },
];

const report = {
  base: BASE,
  started_at: new Date().toISOString(),
  agency_selection: [],
  today_regression: {},
  rows: [],
  screen_verdicts: {},
  role_verdicts: {},
  defects: [],
};

function scoreScreen(m) {
  const fails = [];
  if (m.probe > 0) fails.push(`probe_markers=${m.probe}`);
  if (m.hasCreateWork && m.tab === "today") fails.push("today_create_work");
  if (m.hasFullHandoffDump && m.tab === "today") fails.push("today_full_handoff");
  if (m.hasNotifOps && m.tab === "today") fails.push("today_notif_ops");
  if (m.scrollRatio > 4 && m.tab === "today") fails.push(`today_scroll_${m.scrollRatio}`);
  if (m.scrollRatio > 6 && m.tab !== "today") fails.push(`scroll_heavy_${m.scrollRatio}`);
  if (m.rawIds > 5) fails.push(`raw_ids=${m.rawIds}`);
  // Care: fail if massive sent handoff walls without collapse control context
  if (m.tab === "care" && m.sentHandoffMentions > 8) fails.push("care_handoff_wall");
  if (m.tab === "care" && m.workItemCount > 12) fails.push("care_work_wall");
  return fails.length === 0
    ? { result: "PASS", fails }
    : { result: "FAIL", fails };
}

async function forceSignIn(page, personId) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.evaluate(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      /* */
    }
  });
  await page.context().clearCookies();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByTestId("login-gate").waitFor({ timeout: 60_000 });
  if (await page.getByTestId("entry-sign-in").isVisible().catch(() => false)) {
    await page.getByTestId("entry-sign-in").click();
  }
  await page.getByTestId("login-sign-in-form").waitFor({ timeout: 20_000 });
  await page.getByTestId("login-principal").selectOption(personId);
  await page.getByTestId("login-password").fill(PASSWORDS[personId] || "");
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ timeout: 60_000 });
  await page.waitForTimeout(1800);
}

async function goNav(page, label) {
  // Prefer side/bottom nav testids
  const map = {
    Today: "nav-today",
    Care: "nav-care",
    People: "nav-people",
    Documents: "nav-documents",
    Shift: "nav-shift",
    Summary: "nav-summary",
  };
  const tid = map[label];
  if (tid && (await page.getByTestId(tid).count())) {
    await page.getByTestId(tid).first().click().catch(() => {});
  } else {
    await page
      .locator("button, a, [role=tab], [role=menuitem]")
      .filter({ hasText: new RegExp(`^${label}$`, "i") })
      .first()
      .click()
      .catch(() => {});
  }
  await page.waitForTimeout(1200);
}

async function measure(page, meta) {
  const body = await page.locator("body").innerText();
  const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  const sections = await page.locator("section").count();
  const cards = await page
    .locator(".member-card, .work-item-row, [data-testid^='work-item-'], [class*='card']")
    .count();
  const workItemCount = await page.locator("[data-testid^='work-item-']").count();
  const probe = (body.match(/PROBE|BETA-ONLY|ALPHA-ONLY|available_to_claim|PROBESEED/gi) || [])
    .length;
  const rawIds = (body.match(/\bp-[a-z0-9-]+\b|\bcr-[a-z0-9-]+\b|\bwork-[a-z0-9-]+\b/gi) || [])
    .length;
  const hasCreateWork = /Create unassigned/i.test(body);
  const hasFullHandoffDump =
    /Incoming handoff/i.test(body) &&
    (/Sent by you/i.test(body) || /Handoff history/i.test(body));
  const hasNotifOps = /Notification status|SMS\/email is not claimed/i.test(body);
  const hasAmbient = /What Relay watches for you/i.test(body);
  const hasOrient = /Orient for /i.test(body);
  const hasCompactHandoff = await page
    .getByTestId("today-handoff-compact")
    .isVisible()
    .catch(() => false);
  const sentHandoffMentions = (body.match(/Sent handoff|Sent by you|Past handoff/gi) || [])
    .length;
  const recipient = await page
    .getByTestId("care-recipient-chip")
    .getByTestId("care-recipient-label")
    .innerText()
    .catch(() => "");
  const m = {
    ...meta,
    scrollH,
    vh,
    scrollRatio: +(scrollH / Math.max(vh, 1)).toFixed(2),
    sections,
    cards,
    workItemCount,
    probe,
    rawIds,
    hasCreateWork,
    hasFullHandoffDump,
    hasNotifOps,
    hasAmbient,
    hasOrient,
    hasCompactHandoff,
    sentHandoffMentions,
    recipient,
    bodyLen: body.length,
    bodySample: body.slice(0, 400),
  };
  m.score = scoreScreen(m);
  return m;
}

async function shot(page, name) {
  const p = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, `${name}-bottom.png`), fullPage: false });
  await page.screenshot({ path: path.join(OUT, `${name}-full.png`), fullPage: true });
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // --- Today regression only (family, mobile+desktop) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(45_000);
    await forceSignIn(page, "p-sadeil");
    const m = await measure(page, { role: "family", tab: "today", vp: "mobile-390" });
    await shot(page, "reg-today-mobile");
    report.today_regression = {
      ...m.score,
      scrollRatio: m.scrollRatio,
      workItemCount: m.workItemCount,
      hasCreateWork: m.hasCreateWork,
      hasFullHandoffDump: m.hasFullHandoffDump,
      hasNotifOps: m.hasNotifOps,
      hasAmbient: m.hasAmbient,
      hasOrient: m.hasOrient,
      hasCompactHandoff: m.hasCompactHandoff,
      probe: m.probe,
    };
    report.rows.push(m);
    await ctx.close();
  }

  // --- Role × screen × viewport census ---
  for (const role of ROLES) {
    for (const vp of VPS) {
      // Skip dense combo for speed: full tabs only on desktop; mobile Today+Care+People
      const tabs =
        vp.name === "desktop-1366"
          ? ["Today", "Care", "People", "Documents"]
          : ["Today", "Care", "People"];
      const ctx = await browser.newContext({
        viewport: { width: vp.w, height: vp.h },
      });
      const page = await ctx.newPage();
      page.setDefaultTimeout(45_000);
      try {
        await forceSignIn(page, role.id);
        for (const tab of tabs) {
          await goNav(page, tab);
          // Care subsections for family desktop only
          if (tab === "Care" && role.id === "p-sadeil" && vp.name === "desktop-1366") {
            for (const sec of ["shift", "appointments", "medications", "history"]) {
              const btn = page.getByTestId(`care-section-${sec}`);
              if (await btn.count()) {
                await btn.click().catch(() => {});
                await page.waitForTimeout(900);
                const mm = await measure(page, {
                  role: role.label,
                  tab: `care-${sec}`,
                  vp: vp.name,
                });
                report.rows.push(mm);
                await shot(page, `${role.label}-${vp.name}-care-${sec}`);
                if (mm.score.result === "FAIL") {
                  report.defects.push({
                    role: role.label,
                    tab: `care-${sec}`,
                    vp: vp.name,
                    fails: mm.score.fails,
                  });
                }
              }
            }
          } else {
            const mm = await measure(page, {
              role: role.label,
              tab: tab.toLowerCase(),
              vp: vp.name,
            });
            report.rows.push(mm);
            await shot(page, `${role.label}-${vp.name}-${tab.toLowerCase()}`);
            if (mm.score.result === "FAIL") {
              report.defects.push({
                role: role.label,
                tab: tab.toLowerCase(),
                vp: vp.name,
                fails: mm.score.fails,
              });
            }
          }
        }
        // multi-recipient switcher presence for Marcus desktop
        if (role.id === "p-sadeil" && vp.name === "desktop-1366") {
          await page.getByTestId("profile-menu-btn").click();
          await page.waitForTimeout(400);
          const both =
            (await page.getByTestId("switch-recipient-cr-olivia").isVisible().catch(() => false)) &&
            (await page.getByTestId("switch-recipient-cr-robert").isVisible().catch(() => false));
          report.multi_recipient_switcher = both ? "PASS" : "FAIL";
        }
      } catch (e) {
        report.defects.push({
          role: role.label,
          vp: vp.name,
          error: String(e).slice(0, 300),
        });
      }
      await ctx.close();
    }
  }

  // Care-recipient self path
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch {
        /* */
      }
    });
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    if (await page.getByTestId("entry-create").isVisible().catch(() => false)) {
      await page.getByTestId("entry-create").click();
    }
    await page.waitForTimeout(800);
    const t = (await page.locator("body").innerText()).slice(0, 500);
    report.care_recipient_self = {
      create_form: /preferred name|Create account|Email \(requir/i.test(t),
      no_care_dump: !/Incoming handoff|Open care work|Create unassigned/i.test(t),
    };
    await page.screenshot({ path: path.join(OUT, "self-create.png") });
    await ctx.close();
  }

  // Aggregate verdicts
  const byTab = {};
  for (const r of report.rows) {
    const k = r.tab;
    byTab[k] = byTab[k] || { pass: 0, fail: 0, samples: 0 };
    byTab[k].samples++;
    if (r.score?.result === "PASS") byTab[k].pass++;
    else byTab[k].fail++;
  }
  for (const [k, v] of Object.entries(byTab)) {
    report.screen_verdicts[k] = v.fail === 0 ? "PASS" : "FAIL";
  }
  for (const role of ROLES) {
    const rs = report.rows.filter((r) => r.role === role.label);
    report.role_verdicts[role.label] =
      rs.length && rs.every((r) => r.score?.result === "PASS") ? "PASS" : "FAIL";
  }

  report.finished_at = new Date().toISOString();
  report.summary = {
    today_regression: report.today_regression.result,
    rows: report.rows.length,
    defects: report.defects.length,
    screens: report.screen_verdicts,
    roles: report.role_verdicts,
    multi_recipient_switcher: report.multi_recipient_switcher,
    care_recipient_self: report.care_recipient_self,
  };

  fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
