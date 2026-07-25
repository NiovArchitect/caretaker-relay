/**
 * Deterministic jump-latest torture (public).
 * Pattern matches proven dual-browser diagnostic: stable scroll-up, peer send, wait for indicator.
 */
import { test, expect, type Browser, type Page } from "@playwright/test";
import fs from "fs";

const BASE =
  process.env.CARE_URL || process.env.CR_E2E_BASE_URL || "https://care.niovlabs.com";

async function login(page: Page, id: string, pw: string) {
  await page.goto(BASE + `?v=${Date.now()}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.getByTestId("login-principal").selectOption(id);
  await page.getByTestId("login-password").fill(pw);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("app-shell")).toBeVisible({ timeout: 90_000 });
}

async function openCoord(page: Page) {
  await page
    .locator('.sidenav [data-testid="nav-today"]')
    .click()
    .catch(async () => {
      await page.getByTestId("nav-today").first().click();
    });
  if (await page.getByTestId("relay-open-mobile").isVisible().catch(() => false)) {
    await page.getByTestId("relay-open-mobile").click();
  }
  const mode = page.locator(
    'button:has-text("Coordination"), button:has-text("Messages")',
  );
  if (await mode.count()) await mode.first().click();
  await page.getByTestId("coord-thread").waitFor({ timeout: 30_000 });
  await page.waitForTimeout(2000);
}

async function oneJumpTrial(
  browser: Browser,
  opts: {
    viewport: { width: number; height: number };
    multi: boolean;
    label: string;
  },
): Promise<{ ok: boolean; detail: string }> {
  const a = await browser.newContext({ viewport: opts.viewport });
  const b = await browser.newContext({ viewport: opts.viewport });
  const pa = await a.newPage();
  const pb = await b.newPage();
  try {
    await login(pa, "p-sadeil", "sadeil-lab-password");
    await login(pb, "p-walter", "walter-lab-password");
    await openCoord(pa);
    const thread = pa.getByTestId("coord-thread");
    // Stable scroll-up (proven diagnostic path)
    await thread.evaluate((el) => {
      el.scrollTop = 0;
      el.dispatchEvent(new Event("scroll", { bubbles: true }));
    });
    await pa.waitForTimeout(400);
    const dist0 = await thread.evaluate(
      (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
    );
    if (dist0 < 120) {
      return { ok: false, detail: `${opts.label}: not enough scroll room (${dist0})` };
    }

    await openCoord(pb);
    const draft = pb
      .locator(".coord-composer-sticky textarea, textarea")
      .first();
    const msg = `Jump torture ${opts.label} ${Date.now()}`;
    await draft.fill(msg);
    await pb.locator('button:has-text("Send")').first().click();
    await pb.waitForTimeout(1500);
    if (opts.multi) {
      await draft.fill(msg + " #2");
      await pb.locator('button:has-text("Send")').first().click();
      await pb.waitForTimeout(800);
      await draft.fill(msg + " #3");
      await pb.locator('button:has-text("Send")').first().click();
      await pb.waitForTimeout(800);
    }

    const jump = pa.getByTestId("coord-jump-latest");
    const needle = msg.slice(0, 14);
    let visible = false;
    for (let i = 0; i < 25; i++) {
      const snap = await thread.evaluate(
        (el, needle) => ({
          dist: el.scrollHeight - el.scrollTop - el.clientHeight,
          n: el.querySelectorAll("[data-testid=coord-msg]").length,
          has: el.innerText.includes(needle),
        }),
        needle,
      );
      if (await jump.isVisible().catch(() => false)) {
        // Must still not be forced to bottom before click
        if (snap.dist < 100) {
          return {
            ok: false,
            detail: `${opts.label}: force-scrolled before click (dist=${snap.dist})`,
          };
        }
        visible = true;
        break;
      }
      await pa.waitForTimeout(500);
    }
    if (!visible) {
      return { ok: false, detail: `${opts.label}: indicator never visible` };
    }

    await jump.click();
    await pa.waitForTimeout(400);
    let atBottom = false;
    for (let i = 0; i < 12; i++) {
      atBottom = await thread.evaluate(
        (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 120,
      );
      if (atBottom) break;
      await pa.waitForTimeout(150);
    }
    if (!atBottom) {
      return { ok: false, detail: `${opts.label}: click did not reach latest` };
    }
    if (await jump.isVisible().catch(() => false)) {
      return { ok: false, detail: `${opts.label}: indicator did not clear` };
    }
    return { ok: true, detail: `${opts.label}: PASS` };
  } catch (e) {
    return { ok: false, detail: `${opts.label}: ${String(e)}` };
  } finally {
    await a.close().catch(() => {});
    await b.close().catch(() => {});
  }
}

test.describe.configure({ mode: "serial", timeout: 1_200_000 });

test("jump-latest 20x dual-browser torture", async ({ browser }) => {
  test.setTimeout(1_200_000);
  const plan: Array<{
    viewport: { width: number; height: number };
    multi: boolean;
    label: string;
  }> = [];
  for (let i = 0; i < 10; i++)
    plan.push({
      viewport: { width: 1280, height: 800 },
      multi: false,
      label: `desk-${i}`,
    });
  for (let i = 0; i < 5; i++)
    plan.push({
      viewport: { width: 1280, height: 800 },
      multi: true,
      label: `multi-${i}`,
    });
  for (let i = 0; i < 5; i++)
    plan.push({
      viewport: { width: 390, height: 844 },
      multi: false,
      label: `narrow-${i}`,
    });

  const results: Array<{ ok: boolean; detail: string }> = [];
  for (const p of plan) {
    const r = await oneJumpTrial(browser, p);
    results.push(r);
    fs.writeFileSync(
      "/tmp/jump_latest_torture.json",
      JSON.stringify(
        {
          passed: results.filter((x) => x.ok).length,
          total: results.length,
          target: plan.length,
          results,
        },
        null,
        2,
      ),
    );
    console.log(r.detail);
  }
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  expect(passed, failed.map((f) => f.detail).join(" | ")).toBe(plan.length);
});
