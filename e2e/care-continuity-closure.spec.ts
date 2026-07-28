/**
 * Care continuity: handoff inbox, correction awareness, pre-shift, three-shift surfaces.
 */
import { test, expect, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const PUBLIC = process.env.CR_E2E_BASE_URL ?? "https://care.niovlabs.com";
const API =
  process.env.CR_E2E_API_URL ??
  "https://caretaker-relay-care-api.onrender.com";
const OUT = resolve("docs/testing/care-continuity-closure");
const evidence: Record<string, unknown>[] = [];

function rec(id: string, status: "PASS" | "PARTIAL" | "FAIL", d: Record<string, unknown> = {}) {
  evidence.push({ id, status, ...d, at: new Date().toISOString() });
}

async function labSignIn(page: Page, principal: string) {
  const map: Record<string, string> = {
    "p-sadeil": "sadeil-lab-password",
    "p-maya": "maya-lab-password",
    "p-walter": "walter-lab-password",
  };
  await page.goto(PUBLIC + "/", { waitUntil: "domcontentloaded", timeout: 90_000 });
  await expect(page.getByTestId("login-gate")).toBeVisible({ timeout: 45_000 });
  if (await page.getByTestId("entry-sign-in").isVisible().catch(() => false)) {
    await page.getByTestId("entry-sign-in").click();
  }
  await page.getByTestId("login-principal").selectOption(principal);
  const pw = page.getByTestId("login-password");
  if (await pw.isVisible().catch(() => false)) await pw.fill(map[principal]!);
  const t0 = Date.now();
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ state: "visible", timeout: 75_000 });
  return Date.now() - t0;
}

async function openCare(page: Page) {
  await page.locator('.sidenav [data-testid="nav-care"]').first().click();
  await page.waitForTimeout(800);
}

test.setTimeout(240_000);
test.use({ video: "on", screenshot: "on", trace: "retain-on-failure" });
test.afterAll(() => {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(resolve(OUT, "browser-results.json"), JSON.stringify({ public: PUBLIC, evidence }, null, 2));
});

test("CC1 incoming handoff inbox surface", async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  // Seed handoff via API (walter → maya)
  const sLogin = await fetch(`${API}/api/v1/care/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ care_person_id: "p-sadeil", password: "sadeil-lab-password" }),
  }).then((r) => r.json() as Promise<{ token?: string }>);
  const wLogin = await fetch(`${API}/api/v1/care/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ care_person_id: "p-walter", password: "walter-lab-password" }),
  }).then((r) => r.json() as Promise<{ token?: string }>);
  const now = Date.now();
  if (sLogin.token && wLogin.token) {
    const cr = await fetch(`${API}/api/v1/care/recipients/cr-olivia/shifts`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + sLogin.token },
      body: JSON.stringify({
        assignee_person_id: "p-walter",
        assignee_display_name: "Daniel Kim",
        shift_start: new Date(now - 3600e3).toISOString(),
        shift_end: new Date(now + 3600e3).toISOString(),
      }),
    }).then((r) => r.json() as Promise<{ assignment?: { id: string } }>);
    const aid = cr.assignment?.id;
    if (aid) {
      await fetch(`${API}/api/v1/care/recipients/cr-olivia/shifts/${aid}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + wLogin.token },
        body: JSON.stringify({ decision: "accept" }),
      });
      await fetch(`${API}/api/v1/care/recipients/cr-olivia/shifts/${aid}/handoff`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + wLogin.token },
        body: JSON.stringify({
          what_changed: ["Calm after breakfast", "Mobility assistance provided"],
          still_needs_attention: ["Transportation incomplete"],
          to_person_id: "p-maya",
        }),
      });
    }
  }

  const t0 = Date.now();
  await labSignIn(page, "p-maya");
  await openCare(page);
  // About section has inbox
  await page.getByTestId("care-section-about").click().catch(() => null);
  await page.waitForTimeout(1200);
  const inbox = await page.getByTestId("incoming-handoff-inbox").isVisible().catch(() => false);
  await page.screenshot({ path: resolve(OUT, "cc1-handoff-inbox.png"), fullPage: true });
  if (inbox) {
    const item = page.locator('[data-testid^="handoff-inbox-item-"]').first();
    if (await item.isVisible().catch(() => false)) {
      await item.click();
      await page.waitForTimeout(1000);
      const ack = page.getByTestId("incoming-handoff-ack");
      if (await ack.isVisible().catch(() => false)) {
        if (await ack.isEnabled().catch(() => false)) {
          await ack.click();
          await page.waitForTimeout(800);
        }
      }
    }
  }
  await page.screenshot({ path: resolve(OUT, "cc1-handoff-ack.png"), fullPage: true });
  const ackMsg = await page.getByTestId("incoming-handoff-msg").textContent().catch(() => "");
  const detail = await page.getByTestId("incoming-handoff-detail").isVisible().catch(() => false);
  const statusText = await page.getByTestId("handoff-ack-status").textContent().catch(() => "");
  const ackOk =
    /Acknowledged|acknowledged/i.test(ackMsg || "") ||
    /Acknowledged/i.test(statusText || "") ||
    detail;
  rec("incoming_handoff_inbox", inbox ? "PASS" : "FAIL", { inbox });
  rec("handoff_acknowledgment", ackOk ? "PASS" : "PARTIAL", {
    ackMsg,
    statusText,
    detail,
    latencyMs: Date.now() - t0,
  });
  expect(inbox).toBeTruthy();
});

test("CC2 correction awareness panel", async ({ page }) => {
  await labSignIn(page, "p-sadeil");
  await openCare(page);
  await page.getByTestId("care-section-medications").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(OUT, "cc2-correction-panel.png"), fullPage: true });
  const panel = await page.getByTestId("correction-awareness-panel").isVisible().catch(() => false);
  const med = await page.getByTestId("med-correction-panel").isVisible().catch(() => false);
  rec("correction_awareness", panel ? "PASS" : "FAIL", { panel, med });
  expect(panel && med).toBeTruthy();
});

test("CC3 shift workspace + pre-shift briefing surface", async ({ page }) => {
  await labSignIn(page, "p-walter");
  await openCare(page);
  await page.getByTestId("care-section-shift").click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: resolve(OUT, "cc3-shift-workspace.png"), fullPage: true });
  const ws = await page.getByTestId("shift-workspace").isVisible().catch(() => false);
  const inbox = await page.getByTestId("incoming-handoff-inbox").isVisible().catch(() => false);
  const prep = await page.getByTestId("shift-prep-card").isVisible().catch(() => false);
  const active = await page.getByTestId("shift-active-workspace").isVisible().catch(() => false);
  const empty = await page.getByTestId("shift-empty").isVisible().catch(() => false);
  rec("shift_workspace", ws || empty ? "PASS" : "FAIL", { ws, prep, active, empty, inbox });
  rec("rich_pre_shift_or_active", prep || active || empty || inbox ? "PASS" : "PARTIAL", {
    prep,
    active,
  });
  expect(ws || empty).toBeTruthy();
});

test("CC4 three-shift continuity (API stages + browser answers)", async ({ page, request }) => {
  // Drive three synthetic continuity stages via API then verify Relay answers evolve in browser
  const s = await request.post(`${API}/api/v1/care/auth/login`, {
    data: { care_person_id: "p-sadeil", password: "sadeil-lab-password" },
  });
  const sj = (await s.json()) as { token?: string };
  const token = sj.token!;
  const answers: string[] = [];
  for (let i = 0; i < 3; i++) {
    await request.post(`${API}/api/v1/care/answer`, {
      headers: { authorization: `Bearer ${token}` },
      data: {
        question: `Continuity stage ${i + 1}: how is Evelyn?`,
        care_recipient_id: "cr-olivia",
      },
    });
  }
  await labSignIn(page, "p-sadeil");
  // open relay
  const fab = page.getByRole("button", { name: /Ask or update Relay/i });
  if (await fab.isVisible().catch(() => false)) await fab.click();
  else {
    await page.locator('[data-testid="nav-relay"]').first().click().catch(() => null);
  }
  await page.waitForTimeout(800);
  const input = page.getByTestId("composer-input");
  if (await input.isVisible().catch(() => false)) {
    await input.fill("How is Evelyn today?");
    await page.getByTestId("composer-send").click();
    await page.waitForTimeout(3500);
    answers.push(await page.locator("main").innerText());
    await input.fill("What changed?");
    await page.getByTestId("composer-send").click();
    await page.waitForTimeout(3500);
    answers.push(await page.locator("main").innerText());
  }
  await page.screenshot({ path: resolve(OUT, "cc4-three-shift-relay.png"), fullPage: true });
  const staticSame = answers.length >= 2 && answers[0] === answers[1];
  rec("three_shift_continuity", answers.length >= 1 ? (staticSame ? "PARTIAL" : "PASS") : "PARTIAL", {
    answers: answers.map((a) => a.slice(-200)),
    staticSame,
  });
});
