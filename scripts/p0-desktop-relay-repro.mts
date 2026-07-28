/**
 * P0 Desktop Relay missing — public authenticated visual reproduction.
 * PASS only if Relay conversation + composer are recognizably visible (box + computed styles).
 */
import { chromium, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE = process.env.CR_E2E_BASE_URL ?? "https://care.niovlabs.com";
const API =
  process.env.CR_E2E_API_URL ??
  "https://caretaker-relay-care-api.onrender.com";
const OUT = path.resolve(
  "docs/incidents/evidence/p0-desktop-relay-missing",
);
const PRINCIPAL = "p-sadeil";
const PASS = "sadeil-lab-password";

const VIEWPORTS = [
  { name: "1280x720", width: 1280, height: 720 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1512x982", width: 1512, height: 982 },
  { name: "1920x1080", width: 1920, height: 1080 },
] as const;

type Box = { x: number; y: number; width: number; height: number } | null;

async function probeRelay(page: Page) {
  return page.evaluate(() => {
    const panel = document.querySelector(
      '[data-testid="relay-panel"]',
    ) as HTMLElement | null;
    const composer = document.querySelector(
      '[data-testid="composer-input"]',
    ) as HTMLElement | null;
    const toggle = document.querySelector(
      '[data-testid="relay-open-mobile"]',
    ) as HTMLElement | null;
    const navRelay = document.querySelector(
      '[data-testid="nav-relay"]',
    ) as HTMLElement | null;
    const shell = document.querySelector(
      '[data-testid="app-shell"]',
    ) as HTMLElement | null;

    function metrics(el: HTMLElement | null) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        className: el.className,
        rect: {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          left: r.left,
        },
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        transform: cs.transform,
        overflow: cs.overflow,
        zIndex: cs.zIndex,
        pointerEvents: cs.pointerEvents,
        position: cs.position,
        width: cs.width,
        height: cs.height,
        ariaHidden: el.getAttribute("aria-hidden"),
        inert: (el as HTMLElement & { inert?: boolean }).inert ?? false,
        inViewport:
          r.width > 0 &&
          r.height > 0 &&
          r.bottom > 0 &&
          r.right > 0 &&
          r.top < window.innerHeight &&
          r.left < window.innerWidth,
        visiblyUsable:
          r.width >= 200 &&
          r.height >= 120 &&
          cs.visibility !== "hidden" &&
          cs.display !== "none" &&
          Number(cs.opacity) > 0.05 &&
          cs.pointerEvents !== "none" &&
          r.left < window.innerWidth - 8 &&
          r.right > 8,
      };
    }

    const msgs = Array.from(
      document.querySelectorAll(
        '[data-testid="relay-message"], .relay-msg, .message-bubble, [data-role]',
      ),
    ).length;

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      dpr: window.devicePixelRatio,
      mq1100: window.matchMedia("(max-width: 1100px)").matches,
      mq900: window.matchMedia("(max-width: 900px)").matches,
      shell: metrics(shell),
      panel: metrics(panel),
      composer: metrics(composer),
      toggle: metrics(toggle),
      navRelay: metrics(navRelay),
      messageNodeCount: msgs,
      localStorageKeys: Object.keys(localStorage),
      html: {
        title: document.title,
        scripts: Array.from(document.scripts)
          .map((s) => s.src)
          .filter(Boolean),
        styles: Array.from(
          document.querySelectorAll('link[rel="stylesheet"]'),
        ).map((l) => (l as HTMLLinkElement).href),
      },
    };
  });
}

async function labLogin(page: Page) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  // Prefer UI login for real browser path
  const gate = page.getByTestId("login-gate");
  const shell = page.getByTestId("app-shell");
  try {
    await Promise.race([
      gate.waitFor({ state: "visible", timeout: 25_000 }),
      shell.waitFor({ state: "visible", timeout: 25_000 }),
    ]);
  } catch {
    /* continue */
  }

  if (await shell.isVisible().catch(() => false)) {
    // Already in app — sign out if possible then re-login clean
  }

  if (await gate.isVisible().catch(() => false)) {
    await page.getByTestId("login-principal").selectOption(PRINCIPAL);
    await page.getByTestId("login-password").fill(PASS);
    await page.getByTestId("login-submit").click();
  } else {
    // API inject fallback
    const res = await page.request.post(`${API}/auth/lab-login`, {
      data: { carePersonId: PRINCIPAL, password: PASS },
    });
    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    const token =
      (body as { token?: string }).token ??
      (body as { accessToken?: string }).accessToken;
    if (!token) {
      // try alternate auth routes used by app
      const res2 = await page.request.post(`${API}/v1/auth/lab-login`, {
        data: { carePersonId: PRINCIPAL, password: PASS },
      });
      const b2 = await res2.json().catch(() => ({} as Record<string, unknown>));
      const t2 =
        (b2 as { token?: string }).token ??
        (b2 as { accessToken?: string }).accessToken;
      if (!t2) throw new Error(`login failed: ${res.status()} ${res2.status()}`);
      await page.evaluate(
        ({ token, carePersonId }) => {
          localStorage.setItem(
            "cr.session",
            JSON.stringify({
              token,
              carePersonId,
              displayName: "Marcus Carter",
              roleLabel: "Family caregiver",
              pending: false,
            }),
          );
        },
        { token: t2, carePersonId: PRINCIPAL },
      );
      await page.reload({ waitUntil: "domcontentloaded" });
    } else {
      await page.evaluate(
        ({ token, carePersonId }) => {
          localStorage.setItem(
            "cr.session",
            JSON.stringify({
              token,
              carePersonId,
              displayName: "Marcus Carter",
              roleLabel: "Family caregiver",
              pending: false,
            }),
          );
        },
        { token, carePersonId: PRINCIPAL },
      );
      await page.reload({ waitUntil: "domcontentloaded" });
    }
  }

  await page.getByTestId("app-shell").waitFor({ state: "visible", timeout: 45_000 });
  // wait for care shell not login
  await page.waitForTimeout(1200);
}

async function shot(page: Page, name: string) {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p, fullPage: true });
  return p;
}

function visualPass(probe: Awaited<ReturnType<typeof probeRelay>>) {
  const panelOk = !!probe.panel?.visiblyUsable;
  const composerOk = !!probe.composer?.visiblyUsable;
  // composer can be smaller height than 120 if only input — relax for composer
  const composerAlt =
    !!probe.composer &&
    probe.composer.rect.width >= 160 &&
    probe.composer.rect.height >= 28 &&
    probe.composer.visibility !== "hidden" &&
    probe.composer.display !== "none" &&
    Number(probe.composer.opacity) > 0.05 &&
    probe.composer.inViewport;
  return {
    panelVisible: panelOk,
    composerVisible: panelOk && (composerOk || !!composerAlt),
    toggleVisible: !!probe.toggle?.visiblyUsable ||
      (!!probe.toggle &&
        probe.toggle.rect.width > 20 &&
        probe.toggle.visibility !== "hidden" &&
        probe.toggle.display !== "none" &&
        probe.toggle.inViewport),
    drawerMode: probe.mq1100,
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results: Record<string, unknown> = {
    at: new Date().toISOString(),
    base: BASE,
    api: API,
    principal: PRINCIPAL,
    cases: [] as unknown[],
  };

  // Collect public HTML meta
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();
    const consoleErrors: string[] = [];
    const failed: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    page.on("requestfailed", (r) => failed.push(`${r.failure()?.errorText} ${r.url()}`));
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60_000 });
    results.publicHtml = await page.content().then((h) => h.slice(0, 2500));
    results.liveAssets = await page.evaluate(() => ({
      scripts: Array.from(document.scripts).map((s) => s.src).filter(Boolean),
      css: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(
        (l) => (l as HTMLLinkElement).href,
      ),
      sw: navigator.serviceWorker?.controller?.scriptURL ?? null,
    }));
    results.preLoginConsoleErrors = consoleErrors;
    results.preLoginFailed = failed;
    await ctx.close();
  }

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const consoleErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });

    const caseRec: Record<string, unknown> = {
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
    };

    try {
      await labLogin(page);
      await page.waitForTimeout(800);
      const probe1 = await probeRelay(page);
      const pass1 = visualPass(probe1);
      const shot1 = await shot(page, `${vp.name}-after-login.png`);
      caseRec.afterLogin = { probe: probe1, visual: pass1, shot: shot1 };

      // If drawer mode and not open — document founder failure
      if (probe1.mq1100 && !pass1.panelVisible) {
        const toggleVisible = pass1.toggleVisible;
        caseRec.drawerClosedFailure = {
          drawerMode: true,
          panelHidden: true,
          toggleVisible,
        };
        // try open via toggle
        if (await page.getByTestId("relay-open-mobile").isVisible().catch(() => false)) {
          await page.getByTestId("relay-open-mobile").click();
          await page.waitForTimeout(400);
        } else if (await page.getByTestId("nav-relay").isVisible().catch(() => false)) {
          await page.getByTestId("nav-relay").click();
          await page.waitForTimeout(400);
        }
        const probeOpen = await probeRelay(page);
        caseRec.afterOpen = {
          probe: probeOpen,
          visual: visualPass(probeOpen),
          shot: await shot(page, `${vp.name}-after-open.png`),
        };
      }

      // Hard refresh
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const probeRefresh = await probeRelay(page);
      caseRec.afterRefresh = {
        probe: probeRefresh,
        visual: visualPass(probeRefresh),
        shot: await shot(page, `${vp.name}-after-refresh.png`),
      };

      // Close if open, check reopen control
      const closeBtn = page.locator(".relay-close-btn");
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      } else {
        // force close via evaluate
        await page.evaluate(() => {
          const b = document.querySelector(
            ".relay-close-btn",
          ) as HTMLButtonElement | null;
          b?.click();
        });
        await page.waitForTimeout(400);
      }
      const probeClosed = await probeRelay(page);
      caseRec.afterClose = {
        probe: probeClosed,
        visual: visualPass(probeClosed),
        shot: await shot(page, `${vp.name}-after-close.png`),
      };

      // Reopen
      const openCtl =
        (await page.getByTestId("relay-open-mobile").isVisible().catch(() => false))
          ? page.getByTestId("relay-open-mobile")
          : (await page.getByTestId("nav-relay").isVisible().catch(() => false))
            ? page.getByTestId("nav-relay")
            : null;
      caseRec.reopenControlPresent = !!openCtl;
      if (openCtl) {
        await openCtl.click();
        await page.waitForTimeout(400);
      }
      const probeReopen = await probeRelay(page);
      caseRec.afterReopen = {
        probe: probeReopen,
        visual: visualPass(probeReopen),
        shot: await shot(page, `${vp.name}-after-reopen.png`),
      };

      // Try submit if composer usable
      const v = visualPass(probeReopen.panel ? probeReopen : probe1);
      const usable =
        visualPass(probeReopen).composerVisible ||
        visualPass(probe1).composerVisible;
      if (usable) {
        const input = page.getByTestId("composer-input");
        if (await input.isVisible().catch(() => false)) {
          await input.fill("How is Evelyn?");
          await page.getByTestId("composer-send").click().catch(async () => {
            await input.press("Enter");
          });
          await page.waitForTimeout(4000);
          caseRec.afterSubmit = {
            probe: await probeRelay(page),
            visual: visualPass(await probeRelay(page)),
            shot: await shot(page, `${vp.name}-after-submit.png`),
            bodyTextSample: (await page.locator('[data-testid="relay-panel"]').innerText().catch(() => "")).slice(0, 800),
          };
        }
      }

      caseRec.consoleErrors = consoleErrors;
      caseRec.summary = {
        afterLogin: pass1,
        failureLikely:
          !pass1.panelVisible ||
          (!pass1.composerVisible && !pass1.toggleVisible),
      };
    } catch (e) {
      caseRec.error = String(e);
      try {
        caseRec.errorShot = await shot(page, `${vp.name}-error.png`);
      } catch {
        /* ignore */
      }
    }

    (results.cases as unknown[]).push(caseRec);
    await ctx.close();
  }

  // Compact → desktop resize case
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    try {
      await labLogin(page);
      await page.waitForTimeout(600);
      const mobile = await probeRelay(page);
      await shot(page, `resize-390-before.png`);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(800);
      const desktop = await probeRelay(page);
      await shot(page, `resize-390-to-1440.png`);
      // also 1024 → 1366
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(500);
      const mid = await probeRelay(page);
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.waitForTimeout(500);
      const midUp = await probeRelay(page);
      await shot(page, `resize-1024-to-1366.png`);
      results.resizeCases = {
        mobile390: { probe: mobile, visual: visualPass(mobile) },
        after1440: { probe: desktop, visual: visualPass(desktop) },
        at1024: { probe: mid, visual: visualPass(mid) },
        after1366: { probe: midUp, visual: visualPass(midUp) },
      };
    } catch (e) {
      results.resizeError = String(e);
    }
    await ctx.close();
  }

  // Zoom cases at 1440
  for (const zoom of [1.25, 1.5, 2.0]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    try {
      await labLogin(page);
      await page.evaluate((z) => {
        (document.body.style as CSSStyleDeclaration & { zoom?: string }).zoom =
          String(z);
      }, zoom);
      // Also set CDP page zoom if available
      const client = await page.context().newCDPSession(page);
      try {
        await client.send("Emulation.setPageScaleFactor", { pageScaleFactor: zoom });
      } catch {
        /* ignore */
      }
      await page.waitForTimeout(600);
      const probe = await probeRelay(page);
      const name = `zoom-${Math.round(zoom * 100)}-1440`;
      await shot(page, `${name}.png`);
      (results as { zoomCases?: unknown[] }).zoomCases =
        (results as { zoomCases?: unknown[] }).zoomCases ?? [];
      (results as { zoomCases: unknown[] }).zoomCases.push({
        zoom,
        probe,
        visual: visualPass(probe),
        shot: name + ".png",
        // effective CSS width under browser zoom approximation
        note: "Playwright zoom emulation imperfect; CSS media uses layout viewport",
      });
    } catch (e) {
      (results as { zoomCases?: unknown[] }).zoomCases =
        (results as { zoomCases?: unknown[] }).zoomCases ?? [];
      (results as { zoomCases: unknown[] }).zoomCases.push({
        zoom,
        error: String(e),
      });
    }
    await ctx.close();
  }

  // Narrow layout viewport that still looks "desktop" on Retina (1100 exact boundary)
  {
    const ctx = await browser.newContext({
      viewport: { width: 1100, height: 720 },
    });
    const page = await ctx.newPage();
    try {
      await labLogin(page);
      const probe = await probeRelay(page);
      await shot(page, `boundary-1100.png`);
      results.boundary1100 = { probe, visual: visualPass(probe) };
      await page.setViewportSize({ width: 1101, height: 720 });
      await page.waitForTimeout(400);
      const probe2 = await probeRelay(page);
      await shot(page, `boundary-1101.png`);
      results.boundary1101 = { probe: probe2, visual: visualPass(probe2) };
    } catch (e) {
      results.boundaryError = String(e);
    }
    await ctx.close();
  }

  fs.writeFileSync(
    path.join(OUT, "REPRODUCTION.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify({
    out: OUT,
    cases: (results.cases as { viewport: string; summary?: unknown; error?: string }[]).map(
      (c) => ({
        vp: c.viewport,
        summary: c.summary,
        error: c.error,
      }),
    ),
    resize: results.resizeCases,
    boundary1100: results.boundary1100,
    boundary1101: results.boundary1101,
  }, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
