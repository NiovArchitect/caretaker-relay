/**
 * Local preview OR public post-deploy desktop Relay visual verification.
 * CR_E2E_BASE_URL defaults to local preview http://127.0.0.1:5180
 */
import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

const BASE = process.env.CR_E2E_BASE_URL ?? "http://127.0.0.1:5180";
const API =
  process.env.CR_E2E_API_URL ??
  "https://caretaker-relay-care-api.onrender.com";
const OUT = path.resolve(
  "docs/incidents/evidence/p0-desktop-relay-missing",
);
const PUBLIC = BASE.includes("care.niovlabs.com");

async function login(page: import("@playwright/test").Page) {
  const loginRes = await page.request.post(`${API}/api/v1/care/auth/login`, {
    data: {
      care_person_id: "p-sadeil",
      password: "sadeil-lab-password",
    },
  });
  const login = (await loginRes.json()) as { token?: string };
  if (!login.token) throw new Error(`login failed ${loginRes.status()}`);
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ token }) => {
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
    },
    { token: login.token },
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="app-shell"]', { timeout: 45_000 });
  await page.waitForTimeout(1500);
  if (
    await page
      .getByTestId("login-gate")
      .isVisible()
      .catch(() => false)
  ) {
    throw new Error("stuck on login");
  }
}

async function probe(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const p = document.querySelector(
      '[data-testid="relay-panel"]',
    ) as HTMLElement | null;
    const c = document.querySelector(
      '[data-testid="composer-input"]',
    ) as HTMLElement | null;
    const t = document.querySelector(
      '[data-testid="relay-open-mobile"]',
    ) as HTMLElement | null;
    const shell = document.querySelector(
      '[data-testid="app-shell"]',
    ) as HTMLElement | null;
    const pr = p?.getBoundingClientRect();
    const cr = c?.getBoundingClientRect();
    const tr = t?.getBoundingClientRect();
    const cs = p ? getComputedStyle(p) : null;
    const tcs = t ? getComputedStyle(t) : null;
    const sc = shell ? getComputedStyle(shell) : null;
    return {
      viewport: { w: innerWidth, h: innerHeight },
      scrollY: scrollY,
      shellH: shell?.getBoundingClientRect().height ?? null,
      shellMaxH: sc?.maxHeight ?? null,
      shellHcss: sc?.height ?? null,
      panel: pr
        ? {
            x: pr.x,
            y: pr.y,
            w: pr.width,
            h: pr.height,
            bottom: pr.bottom,
            vis: cs?.visibility,
            pos: cs?.position,
            transform: cs?.transform,
          }
        : null,
      composer: cr
        ? { x: cr.x, y: cr.y, w: cr.width, h: cr.height, bottom: cr.bottom }
        : null,
      toggle: tr
        ? {
            w: tr.width,
            h: tr.height,
            display: tcs?.display,
            x: tr.x,
            y: tr.y,
          }
        : null,
      panelInView: !!(
        pr &&
        pr.width >= 200 &&
        pr.height >= 200 &&
        pr.top >= -4 &&
        pr.bottom <= innerHeight + 4 &&
        pr.left < innerWidth &&
        cs?.visibility !== "hidden" &&
        cs?.display !== "none"
      ),
      composerInView: !!(
        cr &&
        cr.width >= 120 &&
        cr.height >= 24 &&
        cr.top >= 0 &&
        cr.bottom <= innerHeight + 2 &&
        cr.left < innerWidth
      ),
      toggleVisible: !!(
        tr &&
        tr.width >= 40 &&
        tcs?.display !== "none" &&
        tcs?.visibility !== "hidden"
      ),
      mq1100: matchMedia("(max-width: 1100px)").matches,
      closedClass: shell?.classList.contains("relay-desktop-closed") ?? false,
      dataOpen: shell?.getAttribute("data-relay-open"),
    };
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let preview: ChildProcess | null = null;
  if (!PUBLIC && BASE.includes("127.0.0.1")) {
    preview = spawn(
      "npx",
      ["vite", "preview", "--host", "127.0.0.1", "--port", "5180", "--strictPort"],
      {
        cwd: process.cwd(),
        stdio: "ignore",
        detached: false,
      },
    );
    await new Promise((r) => setTimeout(r, 1500));
  }

  const browser = await chromium.launch({ headless: true });
  const report: Record<string, unknown> = {
    at: new Date().toISOString(),
    base: BASE,
    cases: [] as unknown[],
  };

  const vps = [
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1512, 982],
    [1920, 1080],
  ] as const;

  for (const [w, h] of vps) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const rec: Record<string, unknown> = { w, h };
    try {
      await login(page);
      const top = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `verify-${w}x${h}-top.png`),
      });
      // deep scroll workspace
      await page.evaluate(() => {
        const ws = document.querySelector(
          ".workspace, main.workspace",
        ) as HTMLElement | null;
        if (ws) ws.scrollTop = ws.scrollHeight;
        window.scrollTo(0, 2000);
      });
      await page.waitForTimeout(300);
      const scrolled = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `verify-${w}x${h}-scrolled.png`),
      });

      // close
      const close = page.locator(".relay-close-btn");
      if (await close.isVisible().catch(() => false)) {
        await close.click();
        await page.waitForTimeout(300);
      }
      const closed = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `verify-${w}x${h}-closed.png`),
      });

      // reopen
      if (await page.getByTestId("relay-open-mobile").isVisible()) {
        await page.getByTestId("relay-open-mobile").click();
        await page.waitForTimeout(300);
      }
      const reopened = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `verify-${w}x${h}-reopened.png`),
      });

      // submit
      let submit: Record<string, unknown> | null = null;
      if (reopened.composerInView || top.composerInView) {
        await page.getByTestId("composer-input").fill("How is Evelyn?");
        const send = page.getByTestId("composer-send");
        if (await send.isVisible().catch(() => false)) await send.click();
        else await page.getByTestId("composer-input").press("Enter");
        await page.waitForTimeout(5000);
        const body = await page
          .locator('[data-testid="relay-panel"]')
          .innerText()
          .catch(() => "");
        submit = {
          probe: await probe(page),
          hasQuestion: body.includes("How is Evelyn"),
          sample: body.slice(0, 500),
        };
        await page.screenshot({
          path: path.join(OUT, `verify-${w}x${h}-submit.png`),
        });
      }

      rec.top = top;
      rec.scrolled = scrolled;
      rec.closed = closed;
      rec.reopened = reopened;
      rec.submit = submit;
      rec.pass = {
        panelTop: top.panelInView,
        composerTop: top.composerInView,
        panelAfterScroll: scrolled.panelInView,
        composerAfterScroll: scrolled.composerInView,
        toggleAlways: top.toggleVisible,
        closedHidesPanel: !closed.panelInView || closed.closedClass,
        reopenControlWhenClosed: closed.toggleVisible,
        reopenedPanel: reopened.panelInView && reopened.composerInView,
        submitOk: submit
          ? !!(submit as { hasQuestion?: boolean }).hasQuestion
          : false,
      };
    } catch (e) {
      rec.error = String(e);
    }
    (report.cases as unknown[]).push(rec);
    await ctx.close();
  }

  // resize 390 → 1440
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    try {
      await login(page);
      const mobile = await probe(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(600);
      const desk = await probe(page);
      await page.screenshot({
        path: path.join(OUT, "verify-resize-390-to-1440.png"),
      });
      report.resize = {
        mobile,
        desk,
        pass: desk.panelInView && desk.composerInView && desk.toggleVisible,
      };
    } catch (e) {
      report.resizeError = String(e);
    }
    await ctx.close();
  }

  fs.writeFileSync(
    path.join(OUT, PUBLIC ? "PUBLIC_VERIFY.json" : "LOCAL_VERIFY.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (preview) preview.kill("SIGTERM");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
