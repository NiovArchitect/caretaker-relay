import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE = "https://care.niovlabs.com";
const API = "https://caretaker-relay-care-api.onrender.com";
const OUT = path.resolve("docs/incidents/evidence/p0-desktop-relay-missing");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results: Record<string, unknown> = { at: new Date().toISOString() };

  for (const vp of [
    { name: "1366x768", w: 1366, h: 768 },
    { name: "1440x900", w: 1440, h: 900 },
    { name: "1512x982", w: 1512, h: 982 },
    { name: "1280x720", w: 1280, h: 720 },
    { name: "1920x1080", w: 1920, h: 1080 },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
    });
    const page = await ctx.newPage();
    const loginRes = await page.request.post(`${API}/api/v1/care/auth/login`, {
      data: {
        care_person_id: "p-sadeil",
        password: "sadeil-lab-password",
      },
    });
    const login = (await loginRes.json()) as {
      ok?: boolean;
      token?: string;
      display_name?: string;
    };
    if (!login.token) {
      results[vp.name] = { error: "login failed", status: loginRes.status() };
      await ctx.close();
      continue;
    }
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
    // Wait for authenticated grid (not login)
    await page.waitForTimeout(2000);
    // Ensure not stuck on login
    const isLogin = await page
      .getByTestId("login-gate")
      .isVisible()
      .catch(() => false);
    if (isLogin) {
      results[vp.name] = { error: "still on login gate" };
      await page.screenshot({
        path: path.join(OUT, `${vp.name}-login-stuck.png`),
      });
      await ctx.close();
      continue;
    }

    async function probe(label: string) {
      const data = await page.evaluate(() => {
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
        const ws = document.querySelector(
          ".workspace, main.workspace",
        ) as HTMLElement | null;
        const pr = p?.getBoundingClientRect();
        const cr = c?.getBoundingClientRect();
        const tr = t?.getBoundingClientRect();
        const cs = p ? getComputedStyle(p) : null;
        const tcs = t ? getComputedStyle(t) : null;
        const shellCs = shell ? getComputedStyle(shell) : null;
        return {
          viewport: { w: innerWidth, h: innerHeight },
          scrollY: scrollY,
          docH: document.documentElement.scrollHeight,
          bodyH: document.body.scrollHeight,
          shell: shell
            ? {
                h: shell.getBoundingClientRect().height,
                overflow: shellCs?.overflow,
                display: shellCs?.display,
              }
            : null,
          workspace: ws
            ? {
                scrollTop: ws.scrollTop,
                scrollH: ws.scrollHeight,
                clientH: ws.clientHeight,
                overflow: getComputedStyle(ws).overflow,
              }
            : null,
          panel: pr
            ? {
                x: pr.x,
                y: pr.y,
                w: pr.width,
                h: pr.height,
                bottom: pr.bottom,
                visibility: cs?.visibility,
                transform: cs?.transform,
                position: cs?.position,
                maxHeight: cs?.maxHeight,
              }
            : null,
          composer: cr
            ? { x: cr.x, y: cr.y, w: cr.width, h: cr.height, bottom: cr.bottom }
            : null,
          toggle: tr
            ? {
                x: tr.x,
                y: tr.y,
                w: tr.width,
                h: tr.height,
                display: tcs?.display,
                visibility: tcs?.visibility,
              }
            : null,
          panelInView: !!(
            pr &&
            pr.width >= 180 &&
            pr.height >= 100 &&
            pr.top < innerHeight - 40 &&
            pr.bottom > 40 &&
            pr.left < innerWidth &&
            pr.right > 0 &&
            cs?.visibility !== "hidden" &&
            cs?.display !== "none"
          ),
          composerInView: !!(
            cr &&
            cr.width >= 120 &&
            cr.height >= 24 &&
            cr.top >= 0 &&
            cr.bottom <= innerHeight &&
            cr.left < innerWidth
          ),
          toggleVisible: !!(
            tr &&
            tr.width > 20 &&
            tcs?.display !== "none" &&
            tcs?.visibility !== "hidden"
          ),
          mq1100: matchMedia("(max-width: 1100px)").matches,
        };
      });
      await page.screenshot({
        path: path.join(OUT, `${vp.name}-${label}.png`),
        fullPage: false,
      });
      return data;
    }

    const atTop = await probe("at-top");
    // Scroll workspace deeply (Today is long)
    await page.evaluate(() => {
      const ws = document.querySelector(
        ".workspace, main.workspace",
      ) as HTMLElement | null;
      if (ws && ws.scrollHeight > ws.clientHeight + 40) {
        ws.scrollTop = Math.min(1200, ws.scrollHeight);
      }
      window.scrollTo(0, Math.min(1200, document.body.scrollHeight));
      document.documentElement.scrollTop = Math.min(
        1200,
        document.documentElement.scrollHeight,
      );
    });
    await page.waitForTimeout(400);
    const afterScroll = await probe("after-scroll");

    // founder failure: panel not in view AND no toggle
    const failure =
      !afterScroll.panelInView &&
      !afterScroll.composerInView &&
      !afterScroll.toggleVisible;

    results[vp.name] = {
      atTop,
      afterScroll,
      founderFailureMode: failure,
      panelLeftViewportAfterScroll: !afterScroll.panelInView,
      noReopenControl: !afterScroll.toggleVisible,
    };
    await ctx.close();
  }

  fs.writeFileSync(
    path.join(OUT, "SCROLL_AWAY.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
