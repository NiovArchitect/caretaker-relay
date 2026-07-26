/**
 * Premium design screenshot matrix (Playwright).
 * Usage: node scripts/premium-design-screenshots.mjs [baseline|final]
 * Env: CR_SHOT_BASE_URL (default http://127.0.0.1:5180)
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const tag = process.argv[2] === "final" ? "final" : "baseline";
const baseURL = process.env.CR_SHOT_BASE_URL ?? "http://127.0.0.1:5180";
const outDir = join(
  "docs/design/screenshots",
  tag === "final" ? "premium-finish-final" : "premium-finish-baseline",
);
mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "1920", width: 1920, height: 1080 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1366", width: 1366, height: 768 },
  { name: "1024", width: 1024, height: 768 },
  { name: "820", width: 820, height: 1180 },
  { name: "390", width: 390, height: 844 },
  { name: "360", width: 360, height: 740 },
];

async function login(page, principal = "p-sadeil", password = "sadeil-lab-password") {
  await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const gate = page.getByTestId("login-gate");
  if (await gate.isVisible({ timeout: 12_000 }).catch(() => false)) {
    await page.getByTestId("login-principal").selectOption(principal);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-submit").click();
    await page.getByTestId("app-shell").waitFor({ timeout: 45_000 });
  }
}

async function shot(page, name) {
  const path = join(outDir, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function nav(page, tab) {
  const desk = page.getByTestId(`nav-${tab}`).first();
  if (await desk.isVisible().catch(() => false)) {
    await desk.click();
    return;
  }
  // mobile bottom nav uses same test ids
  await page.locator(`[data-testid="nav-${tab}"]`).last().click();
}

const browser = await chromium.launch({ headless: true });
const manifest = [];

try {
  // Login surface (desktop)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(baseURL, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(400);
    manifest.push(await shot(page, "login-1440"));
    // focus state on password if present
    const pw = page.getByTestId("login-password");
    if (await pw.isVisible().catch(() => false)) {
      await pw.focus();
      manifest.push(await shot(page, "login-focus-password-1440"));
    }
    await page.close();
  }

  // Primary caregiver tour across viewports (subset for time)
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    try {
      await login(page);
      await page.waitForTimeout(500);
      manifest.push(await shot(page, `today-${vp.name}`));

      // open profile / recipient switcher when present
      const avatar = page.locator(".avatar-btn").first();
      if (await avatar.isVisible().catch(() => false)) {
        await avatar.click();
        await page.waitForTimeout(200);
        manifest.push(await shot(page, `recipient-menu-${vp.name}`));
        // close via Escape or click outside
        await page.keyboard.press("Escape").catch(() => {});
        await page.locator(".profile-scrim").click({ timeout: 1000 }).catch(() => {});
      }

      await nav(page, "care");
      await page.waitForTimeout(400);
      manifest.push(await shot(page, `care-${vp.name}`));

      await nav(page, "people");
      await page.waitForTimeout(400);
      manifest.push(await shot(page, `people-${vp.name}`));

      await nav(page, "documents");
      await page.waitForTimeout(400);
      manifest.push(await shot(page, `documents-${vp.name}`));

      // Relay open
      const relayToggle = page.locator('[data-testid="relay-drawer-toggle"], .relay-drawer-toggle').first();
      const relayNav = page.getByTestId("nav-relay");
      if (await relayToggle.isVisible().catch(() => false)) {
        await relayToggle.click();
      } else if (await relayNav.isVisible().catch(() => false)) {
        await relayNav.click();
      } else {
        // desktop relay is always visible; ensure mode tabs
        await page.getByTestId("relay-mode-ai").click().catch(() => {});
      }
      await page.waitForTimeout(300);
      manifest.push(await shot(page, `relay-${vp.name}`));

      // Coordination
      if (await page.getByTestId("relay-mode-messages").isVisible().catch(() => false)) {
        await page.getByTestId("relay-mode-messages").click();
        await page.waitForTimeout(500);
        manifest.push(await shot(page, `coord-${vp.name}`));
      }
    } catch (e) {
      console.error(`viewport ${vp.name} failed:`, e.message);
      try {
        manifest.push(await shot(page, `error-${vp.name}`));
      } catch {
        /* ignore */
      }
    }
    await page.close();
  }

  // Physician + DSP roles (desktop)
  for (const [principal, password, label] of [
    ["p-dr-shah", "drshah-lab-password", "physician"],
    ["p-walter", "walter-lab-password", "dsp"],
  ]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(baseURL, { waitUntil: "domcontentloaded" });
      // clear session storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await login(page, principal, password);
      await page.waitForTimeout(500);
      manifest.push(await shot(page, `${label}-today-1440`));
      await nav(page, "care");
      await page.waitForTimeout(400);
      manifest.push(await shot(page, `${label}-care-1440`));
    } catch (e) {
      console.error(`${label} failed:`, e.message);
    }
    await page.close();
  }

  // Reduced motion
  {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    try {
      await login(page);
      manifest.push(await shot(page, "today-reduced-motion-1440"));
    } catch (e) {
      console.error("reduced motion failed:", e.message);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ tag, outDir, count: manifest.length, files: manifest }, null, 2));
