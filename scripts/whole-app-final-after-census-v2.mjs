/**
 * Resilient whole-app after-census. Always writes JSON.
 * NODE_PATH=./node_modules node scripts/whole-app-final-after-census-v2.mjs
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

const report = {
  base: BASE,
  started_at: new Date().toISOString(),
  app_bundle_claim: "index-BUS525Zj.js",
  app_deploy_claim: "5df4d142c23f8e5e01e3a64fd4ead1251b8faae2",
  api_deploy_claim: "4394cc53d18bba015ce7220865a91cc58c138176",
  rows: [],
  defects: [],
  today_regression: null,
};

function flush() {
  report.finished_at = new Date().toISOString();
  // aggregate
  const screens = {};
  const roles = {};
  for (const r of report.rows) {
    screens[r.tab] = screens[r.tab] || { pass: 0, fail: 0 };
    if (r.result === "PASS") screens[r.tab].pass++;
    else screens[r.tab].fail++;
    roles[r.role] = roles[r.role] || { pass: 0, fail: 0 };
    if (r.result === "PASS") roles[r.role].pass++;
    else roles[r.role].fail++;
  }
  report.screen_verdicts = Object.fromEntries(
    Object.entries(screens).map(([k, v]) => [k, v.fail === 0 ? "PASS" : "FAIL"]),
  );
  report.role_verdicts = Object.fromEntries(
    Object.entries(roles).map(([k, v]) => [k, v.fail === 0 ? "PASS" : "FAIL"]),
  );
  fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));
}

function score(m) {
  const fails = [];
  if (m.probe > 0) fails.push(`probe=${m.probe}`);
  if (m.tab === "today") {
    if (m.hasCreateWork) fails.push("create_work");
    if (m.hasFullHandoffDump) fails.push("full_handoff_dump");
    if (m.hasNotifOps) fails.push("notif_ops");
    if (m.hasAmbient) fails.push("ambient");
    if (m.hasOrient) fails.push("orient");
    if (!m.hasCompactHandoff) fails.push("missing_compact_handoff");
    if (m.workItemCount > 3) fails.push(`priorities_${m.workItemCount}`);
    if (m.scrollRatio > 2.5) fails.push(`scroll_${m.scrollRatio}`);
  } else if (m.tab.startsWith("care")) {
    if (m.scrollRatio > 5) fails.push(`scroll_${m.scrollRatio}`);
    if (m.sentHandoffMentions > 10) fails.push(`sent_handoffs_${m.sentHandoffMentions}`);
    if (m.probe > 0) fails.push(`probe=${m.probe}`);
  } else {
    if (m.scrollRatio > 5) fails.push(`scroll_${m.scrollRatio}`);
    if (m.probe > 0) fails.push(`probe=${m.probe}`);
  }
  if (m.rawMachineIds > 8) fails.push(`raw_ids=${m.rawMachineIds}`);
  return fails.length ? { result: "FAIL", fails } : { result: "PASS", fails: [] };
}

async function signIn(page, personId) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.evaluate(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      /* */
    }
  });
  await page.context().clearCookies().catch(() => {});
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByTestId("login-gate").waitFor({ timeout: 45_000 });
  if (await page.getByTestId("entry-sign-in").isVisible().catch(() => false)) {
    await page.getByTestId("entry-sign-in").click();
  }
  await page.getByTestId("login-sign-in-form").waitFor({ timeout: 20_000 });
  await page.getByTestId("login-principal").selectOption(personId);
  await page.getByTestId("login-password").fill(PASSWORDS[personId]);
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ timeout: 60_000 });
  await page.waitForTimeout(1500);
}

async function nav(page, label) {
  const tid = {
    Today: "nav-today",
    Care: "nav-care",
    People: "nav-people",
    Documents: "nav-documents",
  }[label];
  // Prefer visible bottom-nav control (mobile) over hidden/desktop-only side nav
  if (tid) {
    const loc = page.getByTestId(tid);
    const n = await loc.count();
    let clicked = false;
    for (let i = 0; i < n; i++) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 8_000 });
        clicked = true;
        break;
      }
    }
    if (!clicked && n) {
      await loc.last().click({ force: true, timeout: 8_000 }).catch(() => {});
    }
  } else {
    await page
      .locator("nav button, [data-testid^=nav-], button")
      .filter({ hasText: new RegExp(`^${label}$`, "i") })
      .first()
      .click()
      .catch(() => {});
  }
  await page.waitForTimeout(1100);
}

async function measure(page, meta) {
  const body = await page.locator("body").innerText();
  const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  const sections = await page.locator("section").count();
  const workItemCount = await page.locator("[data-testid^='work-item-']").count();
  const m = {
    ...meta,
    scrollH,
    vh,
    scrollRatio: +(scrollH / Math.max(vh, 1)).toFixed(2),
    sections,
    workItemCount,
    cards: await page.locator(".member-card, .work-item-row").count(),
    probe: (body.match(/PROBE|BETA-ONLY|ALPHA-ONLY|available_to_claim|PROBESEED/gi) || [])
      .length,
    rawMachineIds: (body.match(/\bp-[a-z0-9-]{3,}\b/gi) || []).length,
    hasCreateWork: /Create unassigned/i.test(body),
    hasFullHandoffDump:
      /Incoming handoff/i.test(body) &&
      (/Sent by you/i.test(body) || /Handoff history/i.test(body)),
    hasNotifOps: /Notification status|SMS\/email is not claimed/i.test(body),
    hasAmbient: /What Relay watches for you/i.test(body),
    hasOrient: /Orient for /i.test(body),
    hasCompactHandoff: await page
      .getByTestId("today-handoff-compact")
      .isVisible()
      .catch(() => false),
    sentHandoffMentions: (body.match(/Sent handoff|Sent by you|Past handoff/gi) || [])
      .length,
    recipient: await page
      .getByTestId("care-recipient-chip")
      .getByTestId("care-recipient-label")
      .innerText()
      .catch(() => ""),
    bodyLen: body.length,
  };
  const sc = score(m);
  m.result = sc.result;
  m.fails = sc.fails;
  return m;
}

async function shot(page, name) {
  try {
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(150);
    await page.screenshot({
      path: path.join(OUT, `${name}-full.png`),
      fullPage: true,
    });
  } catch {
    /* ignore shot errors */
  }
}

async function runRole(browser, roleId, roleLabel, vps, tabs) {
  for (const vp of vps) {
    let ctx;
    try {
      ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
      const page = await ctx.newPage();
      page.setDefaultTimeout(40_000);
      await signIn(page, roleId);
      for (const tab of tabs) {
        await nav(page, tab);
        if (tab === "Care" && roleId === "p-sadeil" && vp.name === "d1366") {
          for (const sec of ["shift", "appointments", "medications", "history"]) {
            const b = page.getByTestId(`care-section-${sec}`);
            if (await b.count()) {
              await b.click().catch(() => {});
              await page.waitForTimeout(700);
              const row = await measure(page, {
                role: roleLabel,
                tab: `care-${sec}`,
                vp: vp.name,
              });
              report.rows.push(row);
              if (row.result === "FAIL")
                report.defects.push({
                  role: roleLabel,
                  tab: row.tab,
                  vp: vp.name,
                  fails: row.fails,
                });
              await shot(page, `${roleLabel}-${vp.name}-care-${sec}`);
              flush();
            }
          }
        } else {
          const row = await measure(page, {
            role: roleLabel,
            tab: tab.toLowerCase(),
            vp: vp.name,
          });
          if (tab === "Today" && roleId === "p-sadeil" && vp.name === "m390") {
            report.today_regression = row;
          }
          report.rows.push(row);
          if (row.result === "FAIL")
            report.defects.push({
              role: roleLabel,
              tab: row.tab,
              vp: vp.name,
              fails: row.fails,
            });
          await shot(page, `${roleLabel}-${vp.name}-${tab.toLowerCase()}`);
          flush();
        }
      }
      if (roleId === "p-sadeil" && vp.name === "d1366") {
        await page.getByTestId("profile-menu-btn").click().catch(() => {});
        await page.waitForTimeout(300);
        report.multi_recipient_switcher =
          (await page.getByTestId("switch-recipient-cr-olivia").isVisible().catch(() => false)) &&
          (await page.getByTestId("switch-recipient-cr-robert").isVisible().catch(() => false))
            ? "PASS"
            : "FAIL";
      }
    } catch (e) {
      report.defects.push({
        role: roleLabel,
        vp: vp.name,
        error: String(e).slice(0, 240),
      });
      flush();
    } finally {
      if (ctx) await ctx.close().catch(() => {});
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const vps = [
      { name: "m390", w: 390, h: 844 },
      { name: "t768", w: 768, h: 1024 },
      { name: "d1366", w: 1366, h: 768 },
    ];
    await runRole(browser, "p-sadeil", "family", vps, [
      "Today",
      "Care",
      "People",
      "Documents",
    ]);
    await runRole(browser, "p-maya", "family_friend", vps, ["Today", "Care", "People"]);
    await runRole(browser, "p-walter", "dsp", vps, ["Today", "Care", "People"]);
    await runRole(browser, "p-dr-shah", "clinician", vps, ["Today", "Care", "People"]);

    // self
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
      await page.waitForTimeout(600);
    }
    const t = await page.locator("body").innerText();
    report.care_recipient_self = {
      result: /preferred name|Create account/i.test(t) ? "PASS" : "FAIL",
      no_care_shell: !/app-shell|Incoming handoff/i.test(t),
    };
    await page.screenshot({ path: path.join(OUT, "self-create.png") }).catch(() => {});
    await ctx.close();
  } finally {
    flush();
    await browser.close().catch(() => {});
  }
  console.log(
    JSON.stringify(
      {
        today: report.today_regression?.result,
        today_fails: report.today_regression?.fails,
        screens: report.screen_verdicts,
        roles: report.role_verdicts,
        defects: report.defects.length,
        multi: report.multi_recipient_switcher,
        self: report.care_recipient_self,
        rows: report.rows.length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  flush();
  process.exit(1);
});
