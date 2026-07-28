import { chromium } from "@playwright/test";
import * as fs from "node:fs";

const BASE = process.env.CR_E2E_BASE_URL ?? "http://127.0.0.1:5180";
const API =
  process.env.CR_E2E_API_URL ??
  "https://caretaker-relay-care-api.onrender.com";
const OUT = "docs/incidents/evidence/p0-desktop-relay-missing";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const out: unknown[] = [];
  for (const [w, h] of [
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1512, 982],
    [1920, 1080],
  ] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const login = (await (
      await page.request.post(`${API}/api/v1/care/auth/login`, {
        data: {
          care_person_id: "p-sadeil",
          password: "sadeil-lab-password",
        },
      })
    ).json()) as { token?: string };
    await page.goto(BASE + "/");
    await page.evaluate((token) => {
      sessionStorage.setItem(
        "cr_care_session_v1",
        JSON.stringify({
          token,
          identity: {
            carePersonId: "p-sadeil",
            displayName: "Marcus Carter",
            roleLabel: "Primary family caregiver",
            authMode: "foundation_auth_service",
          },
          pending: false,
        }),
      );
    }, login.token);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('[data-testid="app-shell"]', { timeout: 30_000 });
    await page.waitForTimeout(1000);
    const top = await page.evaluate(() => {
      const p = document
        .querySelector('[data-testid="relay-panel"]')!
        .getBoundingClientRect();
      const c = document
        .querySelector('[data-testid="composer-input"]')!
        .getBoundingClientRect();
      const tEl = document.querySelector(
        '[data-testid="relay-open-mobile"]',
      ) as HTMLElement;
      const t = getComputedStyle(tEl);
      return {
        pw: p.width,
        ph: p.height,
        py: p.y,
        pb: p.bottom,
        cy: c.y,
        cb: c.bottom,
        panelInView:
          p.width >= 200 &&
          p.height >= 200 &&
          p.top >= -4 &&
          p.bottom <= innerHeight + 4,
        composerInView:
          c.width >= 120 && c.top >= 0 && c.bottom <= innerHeight + 2,
        composerInsidePanel: c.bottom <= p.bottom + 2 && c.top >= p.top - 2,
        toggle: t.display !== "none" && tEl.getBoundingClientRect().width > 40,
        vh: innerHeight,
      };
    });
    await page.evaluate(() => {
      const ws = document.querySelector(".workspace") as HTMLElement | null;
      if (ws) ws.scrollTop = 99999;
    });
    await page.waitForTimeout(200);
    const scrolled = await page.evaluate(() => {
      const p = document
        .querySelector('[data-testid="relay-panel"]')!
        .getBoundingClientRect();
      const c = document
        .querySelector('[data-testid="composer-input"]')!
        .getBoundingClientRect();
      return {
        panelInView:
          p.width >= 200 &&
          p.height >= 200 &&
          p.top >= -4 &&
          p.bottom <= innerHeight + 4,
        composerInView: c.top >= 0 && c.bottom <= innerHeight + 2,
      };
    });
    await page.screenshot({ path: `${OUT}/local-${w}x${h}.png` });
    out.push({ w, h, top, scrolled, pass: top.panelInView && top.composerInView && top.toggle && scrolled.panelInView });
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/LOCAL_VERIFY2.json`, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
