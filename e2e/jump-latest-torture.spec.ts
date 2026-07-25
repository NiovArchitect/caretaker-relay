/**
 * Deterministic jump-latest torture (public).
 * CR_E2E_BASE_URL=https://care.niovlabs.com npx playwright test e2e/jump-latest-torture.spec.ts
 */
import { test, expect, type Browser, type Page } from "@playwright/test";
import fs from "fs";

const BASE = process.env.CARE_URL || process.env.CR_E2E_BASE_URL || "https://care.niovlabs.com";

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
  await page.locator('.sidenav [data-testid="nav-today"]').click().catch(async () => {
    await page.getByTestId("nav-today").first().click();
  });
  if (await page.getByTestId("relay-open-mobile").isVisible().catch(() => false)) {
    await page.getByTestId("relay-open-mobile").click();
  }
  const mode = page.locator('button:has-text("Coordination"), button:has-text("Messages")');
  if (await mode.count()) await mode.first().click();
  const thread = page.getByTestId("coord-thread");
  await expect(thread).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(1500);
  return thread;
}

async function scrollCoordUp(page: Page, thread: ReturnType<Page["getByTestId"]>) {
  await thread.hover();
  await page.mouse.wheel(0, -12000);
  await thread.evaluate((el) => {
    el.scrollTop = 0;
  });
  // Fire native scroll so onScroll pin sync runs
  await thread.evaluate((el) => {
    el.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await page.waitForTimeout(200);
  const dist = await thread.evaluate(
    (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
  );
  expect(dist).toBeGreaterThan(100);
}

async function sendCoord(page: Page, body: string) {
  const draft = page
    .locator(
      '[data-testid="coord-draft"], [data-testid="coord-input"], .coord-composer-sticky textarea, textarea',
    )
    .first();
  await draft.fill(body);
  await page
    .getByTestId("coord-send")
    .or(page.locator('button:has-text("Send")'))
    .first()
    .click();
  await page.waitForTimeout(1500);
}

async function oneJumpTrial(
  browser: Browser,
  opts: { viewport: { width: number; height: number }; multi: boolean; label: string },
): Promise<{ ok: boolean; detail: string }> {
  const a = await browser.newContext({ viewport: opts.viewport });
  const b = await browser.newContext({ viewport: opts.viewport });
  const pa = await a.newPage();
  const pb = await b.newPage();
  try {
    await login(pa, "p-sadeil", "sadeil-lab-password");
    await login(pb, "p-walter", "walter-lab-password");
    const thread = await openCoord(pa);
    await scrollCoordUp(pa, thread);
    // Settle pin state after scroll before any peer post
    await pa.waitForTimeout(800);
    const scrollBefore = await thread.evaluate((el) => el.scrollTop);
    const distBefore = await thread.evaluate(
      (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
    );
    if (distBefore < 120) {
      return { ok: false, detail: `${opts.label}: failed to leave bottom before post` };
    }

    await openCoord(pb);
    const msg = `Jump torture ${opts.label} ${Date.now()}`;
    await sendCoord(pb, msg);
    if (opts.multi) {
      await sendCoord(pb, msg + " #2");
      await sendCoord(pb, msg + " #3");
    }

    // Do not thrash scrollTop during wait — that races pin sync. Stay put.
    const jump = pa.getByTestId("coord-jump-latest");
    let visible = false;
    for (let i = 0; i < 25; i++) {
      if (await jump.isVisible().catch(() => false)) {
        visible = true;
        break;
      }
      // Only re-assert top if something force-scrolled us
      const dist = await thread.evaluate(
        (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
      );
      if (dist < 120) {
        await thread.evaluate((el) => {
          el.scrollTop = 0;
          el.dispatchEvent(new Event("scroll", { bubbles: true }));
        });
      }
      await pa.waitForTimeout(500);
    }
    if (!visible) {
      return { ok: false, detail: `${opts.label}: indicator never visible` };
    }

    // Must not have force-scrolled to bottom before click
    const scrollMid = await thread.evaluate((el) => el.scrollTop);
    if (scrollMid > scrollBefore + 400) {
      // allow small layout shifts; large jump = force scroll
      const dist = await thread.evaluate(
        (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
      );
      if (dist < 120) {
        return { ok: false, detail: `${opts.label}: force-scrolled before click` };
      }
    }

    await jump.click();
    await pa.waitForTimeout(500);
    let atBottom = false;
    for (let i = 0; i < 10; i++) {
      atBottom = await thread.evaluate(
        (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 120,
      );
      if (atBottom) break;
      await pa.waitForTimeout(200);
    }
    if (!atBottom) return { ok: false, detail: `${opts.label}: click did not reach latest` };

    const still = await jump.isVisible().catch(() => false);
    if (still) return { ok: false, detail: `${opts.label}: indicator did not clear` };

    return { ok: true, detail: `${opts.label}: PASS` };
  } catch (e) {
    return { ok: false, detail: `${opts.label}: ${String(e)}` };
  } finally {
    await a.close();
    await b.close();
  }
}

test.describe.configure({ mode: "serial", timeout: 1_200_000 });

test("jump-latest 20x dual-browser torture", async ({ browser }) => {
  test.setTimeout(1_200_000);
  const results: Array<{ ok: boolean; detail: string }> = [];
  const plan: Array<{
    viewport: { width: number; height: number };
    multi: boolean;
    label: string;
  }> = [];
  for (let i = 0; i < 10; i++)
    plan.push({ viewport: { width: 1280, height: 800 }, multi: false, label: `desk-${i}` });
  for (let i = 0; i < 5; i++)
    plan.push({ viewport: { width: 1280, height: 800 }, multi: true, label: `multi-${i}` });
  for (let i = 0; i < 5; i++)
    plan.push({ viewport: { width: 390, height: 844 }, multi: false, label: `narrow-${i}` });

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
