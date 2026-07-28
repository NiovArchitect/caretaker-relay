/**
 * Public post-deploy desktop Relay visual verification (Marcus).
 * Visual PASS only — bounding boxes + screenshots.
 */
import { chromium, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE = "https://care.niovlabs.com";
const API = "https://caretaker-relay-care-api.onrender.com";
const OUT = path.resolve(
  "docs/incidents/evidence/p0-desktop-relay-missing",
);

async function injectMarcus(page: Page) {
  const login = (await (
    await page.request.post(`${API}/api/v1/care/auth/login`, {
      data: {
        care_person_id: "p-sadeil",
        password: "sadeil-lab-password",
      },
    })
  ).json()) as {
    token?: string;
    display_name?: string;
    care_person_id?: string;
  };
  if (!login.token) throw new Error("login failed");
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ token, displayName }) => {
      sessionStorage.setItem(
        "cr_care_session_v1",
        JSON.stringify({
          token,
          identity: {
            carePersonId: "p-sadeil",
            displayName: displayName || "Marcus Carter",
            roleLabel: "Primary family caregiver",
            authMode: "foundation_auth_service",
          },
          pending: false,
        }),
      );
      sessionStorage.setItem(
        "cr.authorization.v1",
        JSON.stringify({
          version: 1,
          pendingRecipientAccess: false,
          claimedPath: null,
          displayName: displayName || "Marcus Carter",
          pathway: "lab_demo_sign_in",
          accessRequest: null,
          inviteTokenBound: null,
          labPrincipalAuthorized: true,
          updatedAt: new Date().toISOString(),
        }),
      );
      localStorage.setItem(
        "cr.activeCareRecipient.v1",
        JSON.stringify({ careRecipientId: "cr-evelyn", at: Date.now() }),
      );
    },
    { token: login.token, displayName: login.display_name },
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="app-shell"]', { timeout: 45_000 });
  await page.waitForTimeout(1800);
  if (
    await page
      .getByTestId("login-gate")
      .isVisible()
      .catch(() => false)
  ) {
    throw new Error("stuck on login");
  }
}

async function probe(page: Page) {
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
      assets: {
        scripts: Array.from(document.scripts)
          .map((s) => s.src)
          .filter(Boolean),
        css: Array.from(
          document.querySelectorAll('link[rel="stylesheet"]'),
        ).map((l) => (l as HTMLLinkElement).href),
      },
      shellH: shell?.getBoundingClientRect().height ?? null,
      shellCssH: sc?.height ?? null,
      scrollY: scrollY,
      panel: pr
        ? {
            x: pr.x,
            y: pr.y,
            w: pr.width,
            h: pr.height,
            bottom: pr.bottom,
            pos: cs?.position,
            vis: cs?.visibility,
            transform: cs?.transform,
          }
        : null,
      composer: cr
        ? { x: cr.x, y: cr.y, w: cr.width, h: cr.height, bottom: cr.bottom }
        : null,
      toggle: tr
        ? { w: tr.width, h: tr.height, display: tcs?.display, x: tr.x, y: tr.y }
        : null,
      panelInView: !!(
        pr &&
        pr.width >= 200 &&
        pr.height >= 200 &&
        pr.top >= -4 &&
        pr.bottom <= innerHeight + 4 &&
        cs?.visibility !== "hidden" &&
        cs?.display !== "none"
      ),
      composerInView: !!(
        cr &&
        cr.width >= 120 &&
        cr.height >= 24 &&
        cr.top >= 0 &&
        cr.bottom <= innerHeight + 2
      ),
      composerInsidePanel: !!(
        pr &&
        cr &&
        cr.bottom <= pr.bottom + 4 &&
        cr.top >= pr.top - 4
      ),
      toggleVisible: !!(
        tr &&
        tr.width >= 40 &&
        tcs?.display !== "none" &&
        tcs?.visibility !== "hidden"
      ),
      closed: shell?.classList.contains("relay-desktop-closed") ?? false,
      open: shell?.getAttribute("data-relay-open"),
      recipient:
        document.querySelector('[data-testid="care-recipient-label"]')
          ?.textContent ?? null,
      threadText: (
        document.querySelector('[data-testid="relay-thread"]')?.textContent ??
        ""
      ).slice(0, 400),
    };
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report: Record<string, unknown> = {
    at: new Date().toISOString(),
    base: BASE,
    cases: [] as unknown[],
  };

  // live HTML meta
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    report.liveHtml = {
      scripts: await page.evaluate(() =>
        Array.from(document.scripts)
          .map((s) => s.src)
          .filter(Boolean),
      ),
      css: await page.evaluate(() =>
        Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(
          (l) => (l as HTMLLinkElement).href,
        ),
      ),
    };
    await ctx.close();
  }

  for (const [w, h] of [
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1512, 982],
    [1920, 1080],
  ] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const rec: Record<string, unknown> = { w, h };
    try {
      await injectMarcus(page);
      const top = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `public-${w}x${h}-top.png`),
      });
      await page.evaluate(() => {
        const ws = document.querySelector(".workspace") as HTMLElement | null;
        if (ws) ws.scrollTop = 99999;
        window.scrollTo(0, 2000);
      });
      await page.waitForTimeout(300);
      const scrolled = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `public-${w}x${h}-scrolled.png`),
      });

      await page.locator(".relay-close-btn").click({ timeout: 3000 });
      await page.waitForTimeout(300);
      const closed = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `public-${w}x${h}-closed.png`),
      });

      await page.getByTestId("relay-open-mobile").click();
      await page.waitForTimeout(300);
      const reopened = await probe(page);

      await page.getByTestId("composer-input").fill("How is Evelyn?");
      await page.getByTestId("composer-send").click().catch(async () => {
        await page.getByTestId("composer-input").press("Enter");
      });
      await page.waitForTimeout(6000);
      const afterSubmit = await probe(page);
      const body = await page
        .locator('[data-testid="relay-panel"]')
        .innerText()
        .catch(() => "");
      await page.screenshot({
        path: path.join(OUT, `public-${w}x${h}-submit.png`),
      });

      // refresh preserve
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      const afterRefresh = await probe(page);
      await page.screenshot({
        path: path.join(OUT, `public-${w}x${h}-refresh.png`),
      });

      rec.top = top;
      rec.scrolled = scrolled;
      rec.closed = closed;
      rec.reopened = reopened;
      rec.afterSubmit = afterSubmit;
      rec.afterRefresh = afterRefresh;
      rec.bodySample = body.slice(0, 600);
      rec.pass = {
        panel: top.panelInView,
        composer: top.composerInView && top.composerInsidePanel,
        toggle: top.toggleVisible,
        afterScroll: scrolled.panelInView && scrolled.composerInView,
        close: !closed.panelInView && closed.toggleVisible,
        reopen: reopened.panelInView && reopened.composerInView,
        submitQuestion: body.includes("How is Evelyn"),
        answerStart:
          body.length > 80 &&
          (body.toLowerCase().includes("evelyn") ||
            body.includes("Relay") ||
            afterSubmit.panelInView),
        refresh: afterRefresh.panelInView && afterRefresh.composerInView,
      };
    } catch (e) {
      rec.error = String(e);
    }
    (report.cases as unknown[]).push(rec);
    await ctx.close();
  }

  // resize compact → desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    try {
      await injectMarcus(page);
      await page.locator(".relay-close-btn").click().catch(() => {});
      await page.waitForTimeout(200);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(800);
      const desk = await probe(page);
      await page.screenshot({
        path: path.join(OUT, "public-resize-390-to-1440.png"),
      });
      report.resize = {
        desk,
        pass: desk.panelInView && desk.composerInView && desk.toggleVisible,
      };
    } catch (e) {
      report.resizeError = String(e);
    }
    await ctx.close();
  }

  // Agent Zero independent reality (1366 + 1440)
  {
    const results: unknown[] = [];
    for (const [w, h] of [
      [1366, 768],
      [1440, 900],
    ] as const) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
      });
      const page = await ctx.newPage();
      try {
        await injectMarcus(page);
        const visible = await probe(page);
        // ordinary user path: type and submit
        await page.getByTestId("composer-input").click();
        await page.keyboard.type("How is Evelyn?", { delay: 20 });
        await page.keyboard.press("Enter");
        await page.waitForTimeout(6000);
        const after = await probe(page);
        const text = await page
          .locator('[data-testid="relay-panel"]')
          .innerText();
        await page.locator(".relay-close-btn").click();
        await page.waitForTimeout(250);
        const closed = await probe(page);
        await page.getByTestId("relay-open-mobile").click();
        await page.waitForTimeout(250);
        const reopened = await probe(page);
        // navigate Today → Care → back
        await page.getByTestId("nav-care").click().catch(() => {});
        await page.waitForTimeout(400);
        await page.getByTestId("nav-today").click().catch(() => {});
        await page.waitForTimeout(400);
        const afterNav = await probe(page);
        await page.reload({ waitUntil: "networkidle" });
        await page.waitForTimeout(1200);
        const afterRef = await probe(page);
        await page.screenshot({
          path: path.join(OUT, `agent-zero-${w}x${h}.png`),
        });
        results.push({
          w,
          h,
          visible,
          after,
          closed,
          reopened,
          afterNav,
          afterRef,
          hasQuestion: text.includes("How is Evelyn"),
          textSample: text.slice(0, 500),
          pass:
            visible.panelInView &&
            visible.composerInView &&
            visible.toggleVisible &&
            text.includes("How is Evelyn") &&
            !closed.panelInView &&
            closed.toggleVisible &&
            reopened.panelInView &&
            afterNav.panelInView &&
            afterRef.panelInView,
        });
      } catch (e) {
        results.push({ w, h, error: String(e) });
      }
      await ctx.close();
    }
    report.agentZero = results;
  }

  // zoom approximations via layout width shrink
  {
    const zooms: unknown[] = [];
    for (const [label, w, h] of [
      ["125pct", 1152, 720], // 1440/1.25
      ["150pct", 960, 600],
      ["200pct", 720, 450],
    ] as const) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
      });
      const page = await ctx.newPage();
      try {
        await injectMarcus(page);
        // if drawer mode, open
        const p0 = await probe(page);
        if (!p0.panelInView && p0.toggleVisible) {
          await page.getByTestId("relay-open-mobile").click();
          await page.waitForTimeout(300);
        }
        const p = await probe(page);
        await page.screenshot({
          path: path.join(OUT, `public-zoom-${label}.png`),
        });
        zooms.push({
          label,
          w,
          h,
          p,
          pass: p.panelInView && (p.composerInView || p.toggleVisible),
        });
      } catch (e) {
        zooms.push({ label, error: String(e) });
      }
      await ctx.close();
    }
    report.zooms = zooms;
  }

  fs.writeFileSync(
    path.join(OUT, "PUBLIC_VERIFY.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
