import { test, expect } from "@playwright/test";
import fs from "fs";

const BASE = process.env.CARE_URL || "https://care.niovlabs.com";

test("jump-latest: new message while reading history", async ({ browser }) => {
  test.setTimeout(240_000);
  const marcus = await browser.newContext();
  const daniel = await browser.newContext();
  const m = await marcus.newPage();
  const d = await daniel.newPage();

  async function login(page: import("@playwright/test").Page, id: string, pw: string) {
    await page.goto(BASE + `?v=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.getByTestId("login-principal").selectOption(id);
    await page.getByTestId("login-password").fill(pw);
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("app-shell")).toBeVisible({ timeout: 90_000 });
  }

  await login(m, "p-sadeil", "sadeil-lab-password");
  await login(d, "p-walter", "walter-lab-password");

  // Confirm poll code is in the live bundle
  const hasPoll = await m.evaluate(async () => {
    const scripts = [...document.querySelectorAll("script[src]")].map(
      (s) => (s as HTMLScriptElement).src,
    );
    for (const src of scripts) {
      if (!src.includes("assets/")) continue;
      const t = await fetch(src).then((r) => r.text());
      if (t.includes("coord-jump-latest") && t.includes("4000")) return true;
      if (t.includes("coordHasNewWhileUp") && /setInterval/.test(t)) return true;
    }
    return false;
  });

  // Marcus opens coordination ONCE and scrolls up — do not remount
  await m.locator('.sidenav [data-testid="nav-today"]').click().catch(async () => {
    await m.getByTestId("nav-today").first().click();
  });
  if (await m.getByTestId("relay-open-mobile").isVisible().catch(() => false)) {
    await m.getByTestId("relay-open-mobile").click();
  }
  const mMode = m.locator('button:has-text("Coordination"), button:has-text("Messages")');
  if (await mMode.count()) await mMode.first().click();
  const thread = m.getByTestId("coord-thread");
  await expect(thread).toBeVisible({ timeout: 30_000 });
  await m.waitForTimeout(2500); // let initial load + rAF pin finish
  // Real user scroll (React onScroll) to unpin — not only programmatic Event
  await thread.hover();
  await m.mouse.wheel(0, -8000);
  await m.waitForTimeout(300);
  await thread.evaluate((el) => {
    el.scrollTop = 0;
  });
  await m.waitForTimeout(400);
  const metricsBefore = await thread.evaluate((el) => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    dist: el.scrollHeight - el.scrollTop - el.clientHeight,
  }));

  // Daniel opens coordination and sends to Marcus if possible
  await d.locator('.sidenav [data-testid="nav-today"]').click().catch(async () => {
    await d.getByTestId("nav-today").first().click();
  });
  if (await d.getByTestId("relay-open-mobile").isVisible().catch(() => false)) {
    await d.getByTestId("relay-open-mobile").click();
  }
  const dMode = d.locator('button:has-text("Coordination"), button:has-text("Messages")');
  if (await dMode.count()) await dMode.first().click();
  await d.waitForTimeout(2500);
  // Prefer Marcus as recipient if select exists
  const toSelect = d.locator(
    'select[data-testid="coord-to"], select.coord-to, [data-testid="coord-to-person"]',
  );
  if (await toSelect.count()) {
    await toSelect.first().selectOption({ label: /Marcus/i }).catch(async () => {
      await toSelect.first().selectOption("p-sadeil").catch(() => {});
    });
  }
  const draft = d
    .locator(
      '[data-testid="coord-draft"], [data-testid="coord-input"], .coord-composer-sticky textarea, textarea',
    )
    .first();
  const msg = `Jump latest dual-browser proof ${Date.now()}`;
  await draft.fill(msg);
  const send = d
    .getByTestId("coord-send")
    .or(d.locator('button:has-text("Send")'))
    .first();
  await send.click();
  await d.waitForTimeout(4000);
  // Confirm Daniel sees own message
  const danielHas = await d.getByTestId("coord-thread").innerText().catch(() => "");
  const danielSent = danielHas.includes(msg.slice(0, 20));

  // Marcus waits for poll (4s interval) — keep scrolled up, no remount
  const jump = m.getByTestId("coord-jump-latest");
  let visible = false;
  for (let i = 0; i < 20; i++) {
    await thread.evaluate((el) => {
      el.scrollTop = 0;
      el.dispatchEvent(new Event("scroll"));
    });
    if (await jump.isVisible().catch(() => false)) {
      visible = true;
      break;
    }
    // check if message appeared (might have force-scrolled if still pinned)
    const t = await thread.innerText();
    if (t.includes(msg.slice(0, 20)) && !(await jump.isVisible().catch(() => false))) {
      // message arrived but jump not shown — re-scroll and wait one more poll
      await thread.evaluate((el) => {
        el.scrollTop = 0;
        el.dispatchEvent(new Event("scroll"));
      });
    }
    await m.waitForTimeout(2000);
  }

  let jumpWorks: boolean | string = false;
  if (visible) {
    await jump.click();
    // smooth scroll on a long thread needs >600ms
    for (let i = 0; i < 15; i++) {
      await m.waitForTimeout(400);
      const atBottom = await thread.evaluate(
        (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 120,
      );
      if (atBottom) {
        jumpWorks = true;
        break;
      }
    }
    if (jumpWorks !== true) {
      jumpWorks = await thread.evaluate((el) => ({
        dist: el.scrollHeight - el.scrollTop - el.clientHeight,
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
      })) as unknown as string;
    }
  }

  const out = {
    hasPoll,
    metricsBefore,
    danielSent,
    visible,
    jumpWorks,
    msg,
    marcusThread: (await thread.innerText()).slice(0, 300),
  };
  fs.writeFileSync("/tmp/cr_jump_latest.json", JSON.stringify(out, null, 2));
  console.log("JUMP", JSON.stringify(out, null, 2));

  expect(visible, "New messages jump control should appear while scrolled up").toBe(true);
  expect(jumpWorks).toBe(true);

  await marcus.close();
  await daniel.close();
});
