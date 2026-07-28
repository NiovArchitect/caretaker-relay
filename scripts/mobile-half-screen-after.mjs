/**
 * Post-repair authenticated mobile shell overflow matrix.
 * Measures shell/main widths vs viewport; requires scrollWidth <= clientWidth + 1.
 */
import { chromium, devices } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.CR_E2E_BASE_URL ?? "http://127.0.0.1:4173";
const OUT = resolve(__dirname, "../docs/incidents/evidence/mobile-half-screen-after");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "320x568", w: 320, h: 568 },
  { name: "360x800", w: 360, h: 800 },
  { name: "375x667", w: 375, h: 667 },
  { name: "390x844", w: 390, h: 844 },
  { name: "393x852", w: 393, h: 852 },
  { name: "412x915", w: 412, h: 915 },
  { name: "430x932", w: 430, h: 932 },
  { name: "568x320-land", w: 568, h: 320 },
  { name: "667x375-land", w: 667, h: 375 },
  { name: "844x390-land", w: 844, h: 390 },
  { name: "915x412-land", w: 915, h: 412 },
  { name: "768x1024-tab", w: 768, h: 1024 },
  { name: "820x1180-tab", w: 820, h: 1180 },
  { name: "1024x768-tab", w: 1024, h: 768 },
];

const ROUTES = [
  { id: "today", testid: "nav-today" },
  { id: "care", testid: "nav-care" },
  { id: "people", testid: "nav-people" },
  { id: "privacy", testid: "nav-privacy" },
  { id: "documents", testid: "nav-documents" },
];

async function labSignIn(page, principal = "p-sadeil") {
  const map = {
    "p-sadeil": "sadeil-lab-password",
    "p-maya": "maya-lab-password",
    "p-walter": "walter-lab-password",
  };
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.getByTestId("login-gate").waitFor({ state: "visible", timeout: 45_000 });
  if (await page.getByTestId("entry-sign-in").isVisible().catch(() => false)) {
    await page.getByTestId("entry-sign-in").click();
  }
  await page.getByTestId("login-sign-in-form").waitFor({ state: "visible", timeout: 20_000 });
  await page.getByTestId("login-principal").selectOption(principal);
  const pw = page.getByTestId("login-password");
  if (await pw.isVisible().catch(() => false)) {
    await pw.fill(map[principal] || "sadeil-lab-password");
  }
  const t0 = Date.now();
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ state: "visible", timeout: 75_000 });
  await page.waitForTimeout(1500);
  return Date.now() - t0;
}

async function measure(page) {
  return page.evaluate(() => {
    const shell = document.querySelector('[data-testid="app-shell"]');
    const main =
      document.querySelector("main.workspace") ||
      document.querySelector(".workspace") ||
      document.querySelector("main");
    const topbar = document.querySelector(".topbar");
    const bottomNav = document.querySelector(".bottom-nav");
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        left: Math.round(r.left * 10) / 10,
        maxWidth: cs.maxWidth,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        minWidth: cs.minWidth,
        gridTemplateColumns: cs.gridTemplateColumns,
      };
    };
    const vw = window.visualViewport;
    const overflows = [];
    const all = document.querySelectorAll("body *");
    const iw = window.innerWidth;
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width > iw + 2 && r.height > 0) {
        overflows.push({
          tag: el.tagName,
          cls: (el.className && String(el.className).slice?.(0, 80)) || "",
          testid: el.getAttribute?.("data-testid"),
          width: Math.round(r.width),
          left: Math.round(r.left),
        });
      }
    }
    const bodyText = document.body?.innerText || "";
    const iso = (bodyText.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/g) || []).length;
    const enums = (
      bodyText.match(
        /\b(available_to_claim|work_item|care_event|source_type|in_progress|clarification_required|provider_confirmation_pending)\b/g,
      ) || []
    ).length;
    const tags = (bodyText.match(/\[(HOL|FMH|JL|PROBE|SEED|SMOKE)[^\]]*\]/gi) || []).length;
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      bodyScrollW: document.body?.scrollWidth,
      vvWidth: vw?.width,
      vvHeight: vw?.height,
      shell: box(shell),
      main: box(main),
      topbar: box(topbar),
      bottomNav: box(bottomNav),
      hasCrShell: !!document.querySelector(".cr-shell"),
      overflows: overflows.slice(0, 25),
      overflowCount: overflows.length,
      residue: { iso, enums, tags },
      pass:
        document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1 &&
        (box(shell)?.width ?? 0) >= window.innerWidth - 2 &&
        (box(main)?.width ?? 0) <= (box(shell)?.width ?? window.innerWidth) + 2,
    };
  });
}

const results = { base: BASE, started: new Date().toISOString(), matrix: [] };

// Local preview is CORS-blocked against public API; allow origin for measurement.
// Public deploy (care.niovlabs.com) does not need this flag.
const isLocal = /127\.0\.0\.1|localhost/.test(BASE);
const browser = await chromium.launch({
  headless: true,
  args: isLocal
    ? ["--disable-web-security", "--disable-features=IsolateOrigins,site-per-process"]
    : [],
});
const context = await browser.newContext({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();

let loginMs = 0;
try {
  loginMs = await labSignIn(page, "p-sadeil");
} catch (e) {
  results.loginError = String(e);
  writeFileSync(resolve(OUT, "MATRIX.json"), JSON.stringify(results, null, 2));
  console.error("LOGIN FAILED", e);
  await browser.close();
  process.exit(1);
}
results.loginMs = loginMs;

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.waitForTimeout(400);
  // Today first
  const m = await measure(page);
  const row = {
    viewport: vp.name,
    route: "today",
    ...m,
    shellOk: Math.abs((m.shell?.width ?? 0) - vp.w) <= 2,
    mainOk: (m.main?.width ?? 9999) <= vp.w + 2,
    scrollOk: m.scrollW <= m.clientW + 1,
  };
  results.matrix.push(row);
  await page.screenshot({
    path: resolve(OUT, `${vp.name}-today.png`),
    fullPage: false,
  });
  await page.screenshot({
    path: resolve(OUT, `${vp.name}-today-full.png`),
    fullPage: true,
  });
  console.log(
    vp.name,
    "shell",
    m.shell?.width,
    "main",
    m.main?.width,
    "scroll",
    m.scrollW,
    "/",
    m.clientW,
    "pass",
    row.shellOk && row.mainOk && row.scrollOk,
    "overflowEls",
    m.overflowCount,
    "iso",
    m.residue.iso,
    "enums",
    m.residue.enums,
  );
}

// Route sweep at 390×844
await page.setViewportSize({ width: 390, height: 844 });
for (const r of ROUTES) {
  const nav = page
    .locator(`.bottom-nav [data-testid="${r.testid}"], .sidenav [data-testid="${r.testid}"]`)
    .first();
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
    await page.waitForTimeout(1200);
  }
  const m = await measure(page);
  results.matrix.push({
    viewport: "390x844",
    route: r.id,
    ...m,
    shellOk: Math.abs((m.shell?.width ?? 0) - 390) <= 2,
    mainOk: (m.main?.width ?? 9999) <= 392,
    scrollOk: m.scrollW <= m.clientW + 1,
  });
  await page.screenshot({
    path: resolve(OUT, `route-${r.id}-390.png`),
    fullPage: false,
  });
  console.log(
    "route",
    r.id,
    "shell",
    m.shell?.width,
    "main",
    m.main?.width,
    "pass",
    m.pass,
    "iso",
    m.residue.iso,
  );
}

// Relay open (force-click if topbar chip overlaps)
const relayToggle = page
  .getByTestId("relay-open-mobile")
  .or(page.getByTestId("relay-drawer-toggle"))
  .or(page.locator(".relay-drawer-toggle"))
  .first();
if (await relayToggle.isVisible().catch(() => false)) {
  try {
    await relayToggle.click({ force: true, timeout: 5000 });
    await page.waitForTimeout(800);
    const m = await measure(page);
    results.matrix.push({
      viewport: "390x844",
      route: "relay-open",
      ...m,
      shellOk: Math.abs((m.shell?.width ?? 0) - 390) <= 2,
      mainOk: (m.main?.width ?? 9999) <= 392,
      scrollOk: m.scrollW <= m.clientW + 1,
    });
    await page.screenshot({ path: resolve(OUT, "route-relay-open-390.png") });
  } catch (e) {
    results.relayOpenError = String(e).slice(0, 200);
  }
}

// Landscape orientation flip simulation
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(500);
const land = await measure(page);
results.matrix.push({ viewport: "844x390-land-post", route: "today", ...land });
await page.screenshot({ path: resolve(OUT, "orientation-844x390.png") });

results.finished = new Date().toISOString();
const fails = results.matrix.filter(
  (r) => r.shellOk === false || r.mainOk === false || r.scrollOk === false,
);
results.summary = {
  total: results.matrix.length,
  fails: fails.length,
  failViewports: fails.map((f) => `${f.viewport}/${f.route}`),
  loginMs,
};
writeFileSync(resolve(OUT, "MATRIX.json"), JSON.stringify(results, null, 2));
writeFileSync(
  resolve(OUT, "SHELL_LAYOUT_390.json"),
  JSON.stringify(
    results.matrix.find((r) => r.viewport === "390x844" && r.route === "today") || {},
    null,
    2,
  ),
);
console.log("SUMMARY", results.summary);
await browser.close();
process.exit(fails.length ? 2 : 0);
