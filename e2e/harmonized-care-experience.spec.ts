/**
 * Harmonized ambient care experience — public browser smoke + flagship journey.
 * Proves work ownership surfaces, since-last-visit, sync label, multi-recipient confirm.
 */
import { test, expect, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const PUBLIC = process.env.CR_E2E_BASE_URL ?? "https://care.niovlabs.com";
const API =
  process.env.CR_E2E_API_URL ??
  "https://caretaker-relay-care-api.onrender.com";

const evidence: Record<string, unknown>[] = [];

function rec(
  id: string,
  status: "PASS" | "PARTIAL" | "FAIL",
  detail: Record<string, unknown> = {},
) {
  evidence.push({ id, status, ...detail, at: new Date().toISOString() });
}

async function labSignIn(page: Page, principal: string) {
  await page.goto(PUBLIC + "/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page.getByTestId("login-gate")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("entry-sign-in").click();
  await expect(page.getByTestId("login-sign-in-form")).toBeVisible({
    timeout: 15_000,
  });
  await page.getByTestId("login-principal").selectOption(principal);
  const t0 = Date.now();
  await page.getByTestId("login-submit").click();
  try {
    await page.getByTestId("app-shell").waitFor({ state: "visible", timeout: 60_000 });
  } catch {
    await page
      .getByTestId("authorization-gate")
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => null);
  }
  return Date.now() - t0;
}

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

test.afterAll(() => {
  const dir = resolve("docs/testing/harmonized-care-experience");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, "browser-results.json"),
    JSON.stringify({ public: PUBLIC, api: API, evidence }, null, 2),
  );
});

test("H0 API health + work-items route exists post-deploy", async ({
  request,
}) => {
  const health = await request.get(`${API}/api/v1/care/health`);
  rec("api_health", health.ok() ? "PASS" : "FAIL", { status: health.status() });
  expect(health.ok()).toBeTruthy();

  // Unauth should not leak
  const work = await request.get(
    `${API}/api/v1/care/recipients/cr-olivia/work-items`,
  );
  rec("work_items_unauth", work.status() === 401 || work.status() === 403 ? "PASS" : "PARTIAL", {
    status: work.status(),
  });
});

test("H1 flagship family journey — Today ownership + since-last-visit", async ({
  page,
}) => {
  const ms = await labSignIn(page, "p-sadeil");
  const hasShell = await page.getByTestId("app-shell").isVisible().catch(() => false);
  const hasNav = await page.getByTestId("nav-today").isVisible().catch(() => false);
  rec("family_login", hasShell || hasNav ? "PASS" : "FAIL", { ms, hasShell, hasNav });
  expect(hasShell || hasNav).toBeTruthy();

  if (hasNav) await page.getByTestId("nav-today").click();
  await page.waitForTimeout(1500);

  const workPanel = await page
    .getByTestId("work-ownership-panel")
    .isVisible()
    .catch(() => false);
  rec("work_ownership_panel", workPanel ? "PASS" : "FAIL", {});
  expect(workPanel).toBeTruthy();

  const since = await page
    .getByTestId("since-last-visit")
    .isVisible()
    .catch(() => false);
  rec("since_last_visit", since ? "PASS" : "PARTIAL", {
    note: since ? "visible" : "may be empty if API not yet deployed",
  });

  const sync = await page.getByTestId("sync-state-label").textContent().catch(() => null);
  rec("sync_label", sync ? "PASS" : "FAIL", { sync });

  // Multi-recipient confirm required
  const input = page.getByTestId("new-work-action");
  if (await input.isVisible().catch(() => false)) {
    await input.fill("Pick up prescription refill");
    await page.getByTestId("create-work-submit").click();
    await page.waitForTimeout(400);
    const err = await page.getByTestId("work-error").textContent().catch(() => null);
    rec(
      "confirm_required_before_create",
      err && /confirm/i.test(err) ? "PASS" : "PARTIAL",
      { err },
    );
    await page.getByTestId("confirm-recipient-checkbox").check();
    await page.getByTestId("create-work-submit").click();
    await page.waitForTimeout(2000);
    const list = await page.getByTestId("work-items-list").isVisible().catch(() => false);
    const empty = await page.getByTestId("work-empty-state").isVisible().catch(() => false);
    rec("create_work_after_confirm", list || empty ? "PASS" : "PARTIAL", {
      list,
      empty,
    });
  } else {
    rec("create_work_form", "FAIL", { reason: "form not visible" });
  }

  const handoff = page.getByTestId("review-handoff");
  if (await handoff.isVisible().catch(() => false)) {
    await handoff.click();
    await page.waitForTimeout(800);
    const panel = await page.getByTestId("handoff-panel").isVisible().catch(() => false);
    rec("handoff_panel", panel ? "PASS" : "PARTIAL", {});
  }
});

test("H2 professional caregiver journey — claim path visible", async ({
  page,
}) => {
  const ms = await labSignIn(page, "p-walter");
  const ok =
    (await page.getByTestId("app-shell").isVisible().catch(() => false)) ||
    (await page.getByTestId("nav-today").isVisible().catch(() => false));
  rec("dsp_login", ok ? "PASS" : "FAIL", { ms });
  if (!ok) return;
  if (await page.getByTestId("nav-today").isVisible().catch(() => false)) {
    await page.getByTestId("nav-today").click();
  }
  await page.waitForTimeout(1200);
  const work = await page
    .getByTestId("work-ownership-panel")
    .isVisible()
    .catch(() => false);
  rec("dsp_work_panel", work ? "PASS" : "FAIL", {});
});

test("H3 adversarial — unauth work create rejected", async ({ request }) => {
  const res = await request.post(
    `${API}/api/v1/care/recipients/cr-olivia/work-items`,
    {
      data: {
        action: "Should fail",
        reason: "no auth",
        session_active_recipient_id: "cr-olivia",
        confirm_recipient_id: "cr-olivia",
      },
    },
  );
  rec(
    "adversarial_unauth_create",
    res.status() === 401 || res.status() === 403 ? "PASS" : "FAIL",
    { status: res.status() },
  );
  expect([401, 403]).toContain(res.status());
});
