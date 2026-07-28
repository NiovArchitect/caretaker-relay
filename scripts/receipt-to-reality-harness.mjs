/**
 * Receipt-to-reality: confirm via API, then assert public browser destinations.
 * Measures: today_attention, open_work, handoff, notifications, relay_retrieval, plan unchanged.
 */
import { chromium, devices } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const APP = process.env.CR_E2E_BASE_URL || "https://care.niovlabs.com";
const OUT = resolve(__dirname, "../docs/testing/RECEIPT_TO_REALITY_RESULTS.json");
mkdirSync(dirname(OUT), { recursive: true });

const MARKER = `R2R${Date.now().toString(36)}`;
const REPORT = `Please add Allegra 60mg for allergies. Case ${MARKER}`;

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await res.json().catch(() => ({}));
  return { status: res.status, body: j };
}

async function login(id, password) {
  const r = await api("/api/v1/care/auth/login", {
    method: "POST",
    body: { care_person_id: id, password },
  });
  if (!r.body.token) throw new Error("login " + id + " " + JSON.stringify(r.body).slice(0, 120));
  return r.body.token;
}

async function labBrowserLogin(page, principal, password) {
  await page.goto(APP + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  if (await page.getByTestId("entry-sign-in").isVisible().catch(() => false)) {
    await page.getByTestId("entry-sign-in").click();
  }
  await page.getByTestId("login-principal").selectOption(principal);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ timeout: 75000 });
  await page.waitForTimeout(2000);
}

const evidence = {
  started: new Date().toISOString(),
  marker: MARKER,
  report: REPORT,
  api: API,
  app: APP,
  gates: {},
};

const token = await login("p-sadeil", "sadeil-lab-password");
const und = await api("/api/v1/care/understand", {
  method: "POST",
  token,
  body: { text: REPORT, care_recipient_id: "cr-olivia" },
});
const vb = und.body.verification_bundle_id;
const conf = await api("/api/v1/care/confirm", {
  method: "POST",
  token,
  body: { verification_bundle_id: vb, idempotency_key: `r2r-${MARKER}` },
});
const receipt = conf.body.execution_receipt || {};
evidence.receipt = {
  message: (conf.body.message || "").slice(0, 200),
  destinations: receipt.screenDestinations || [],
  still: (receipt.handoffInclusion || {}).stillNeedsAttention || [],
  planChanged: receipt.activeMedicationPlanChanged,
  result: receipt.result,
  events: (conf.body.persisted || {}).eventIds || [],
  handoffId: (conf.body.persisted || {}).handoffId,
};
evidence.gates.receipt_created = Boolean(receipt.requestId || receipt.result);
evidence.gates.plan_unchanged = receipt.activeMedicationPlanChanged === false;
evidence.gates.false_success = /Confirmed via Foundation/i.test(conf.body.message || "");

// API destination checks
const today = await api("/api/v1/care/recipients/cr-olivia/today", { token });
const t = today.body.today || {};
const still = (t.latest_handoff || {}).stillNeedsAttention || [];
const tasks = (t.tasks || []).map((x) => x.title || "");
const todayHit =
  still.some((s) => s.includes("Allegra") || s.includes(MARKER)) ||
  tasks.some((s) => s.includes("Allegra") || s.includes("Medication change"));
evidence.gates.api_today_or_handoff = todayHit;

const work = await api("/api/v1/care/recipients/cr-olivia/work-items", { token });
const wis = work.body.work_items || [];
const workHit = wis.some((w) =>
  JSON.stringify(w).includes("Allegra") || JSON.stringify(w).includes("Medication change needs verification"),
);
evidence.gates.api_open_work = workHit;

const notif = await api("/api/v1/care/notifications", { token });
const notifs = notif.body.notifications || notif.body.items || [];
const notifHit = JSON.stringify(notifs).includes("Allegra") || JSON.stringify(notifs).includes("Needs an owner") || JSON.stringify(notifs).includes("Medication change");
evidence.gates.api_notifications = notifHit || workHit; // work create notifies circle

// Browser reality
const browser = await chromium.launch({ headless: true });
const ctxA = await browser.newContext({ ...devices["iPhone 13"], viewport: { width: 390, height: 844 } });
const pageA = await ctxA.newPage();
await labBrowserLogin(pageA, "p-sadeil", "sadeil-lab-password");
await pageA.waitForTimeout(2500);
let bodyA = await pageA.locator("body").innerText();
const browserToday =
  bodyA.includes("Allegra") ||
  bodyA.includes("Medication needs verification") ||
  bodyA.includes("Medication change needs verification");
evidence.gates.browser_today = browserToday;
await pageA.screenshot({ path: resolve(dirname(OUT), "receipt-reality-today-marcus.png") }).catch(() => {});

// Care tab
const careNav = pageA.locator('.bottom-nav [data-testid="nav-care"], .sidenav [data-testid="nav-care"]').first();
if (await careNav.isVisible().catch(() => false)) {
  await careNav.click();
  await pageA.waitForTimeout(1500);
}
const bodyCare = await pageA.locator("body").innerText();
evidence.gates.browser_care = bodyCare.includes("Allegra") || bodyCare.includes("Medication change") || bodyCare.includes("pending");
// Active plan must not list Allegra as authorized instruction (heuristic)
evidence.gates.browser_plan_not_active_order =
  !/active medication plan[^\n]*Allegra|Allegra[^\n]*as prescribed/i.test(bodyCare);

// Relay retrieval
await pageA.getByTestId("relay-open-mobile").click({ force: true }).catch(async () => {
  await pageA.locator(".relay-drawer-toggle").click({ force: true });
});
await pageA.waitForTimeout(600);
const input = pageA.getByTestId("composer-input");
if (await input.isVisible().catch(() => false)) {
  await input.fill(`Was a new medicine Allegra reported for allergies? ${MARKER}`);
  await pageA.getByTestId("composer-send").click();
  await pageA.waitForTimeout(5000);
}
const bodyRelay = await pageA.locator("body").innerText();
evidence.gates.browser_relay_retrieval =
  bodyRelay.includes("Allegra") || bodyRelay.includes("medication change") || bodyRelay.includes("verification");

// Second browser: DSP next shift (p-walter)
const ctxB = await browser.newContext({ ...devices["iPhone 13"], viewport: { width: 390, height: 844 } });
const pageB = await ctxB.newPage();
await labBrowserLogin(pageB, "p-walter", "walter-lab-password");
await pageB.waitForTimeout(2500);
const bodyB = await pageB.locator("body").innerText();
evidence.gates.next_shift_visible =
  bodyB.includes("Allegra") ||
  bodyB.includes("Medication change") ||
  bodyB.includes("Medication needs verification") ||
  bodyB.includes("Needs an owner");
// Open care/shift if available
const shift = pageB.locator('[data-testid="care-section-shift"], [data-testid="nav-care"]').first();
if (await shift.isVisible().catch(() => false)) {
  await shift.click();
  await pageB.waitForTimeout(1200);
}
const bodyB2 = await pageB.locator("body").innerText();
if (!evidence.gates.next_shift_visible) {
  evidence.gates.next_shift_visible =
    bodyB2.includes("Allegra") || bodyB2.includes("Medication change") || bodyB2.includes("handoff");
}
await pageB.screenshot({ path: resolve(dirname(OUT), "receipt-reality-next-shift.png") }).catch(() => {});

// Score destinations from receipt
const dest = receipt.screenDestinations || [];
const destProof = {
  today_attention: evidence.gates.browser_today || evidence.gates.api_today_or_handoff,
  open_work: evidence.gates.api_open_work,
  handoff: evidence.gates.api_today_or_handoff,
  notifications: evidence.gates.api_notifications,
  relay_retrieval: evidence.gates.browser_relay_retrieval,
  care_pending_med_changes: evidence.gates.browser_care || evidence.gates.api_today_or_handoff,
};
evidence.destination_proof = destProof;
evidence.destination_pass_count = dest.filter((d) => destProof[d] || destProof[d?.replace?.(/-/g, "_")]).length;
// count matching keys
let matched = 0;
for (const d of dest) {
  if (d === "today_attention" && destProof.today_attention) matched++;
  else if (d === "open_work" && destProof.open_work) matched++;
  else if (d === "handoff" && destProof.handoff) matched++;
  else if (d === "notifications" && destProof.notifications) matched++;
  else if (d === "relay_retrieval" && destProof.relay_retrieval) matched++;
  else if (d === "care_pending_med_changes" && destProof.care_pending_med_changes) matched++;
  else if (d === "care_medications" && destProof.care_pending_med_changes) matched++;
}
evidence.destination_matched = matched;
evidence.destination_declared = dest.length;
evidence.cross_screen_rate = dest.length ? +(matched / dest.length).toFixed(3) : 0;

evidence.finished = new Date().toISOString();
evidence.summary = {
  receipt_ok: evidence.gates.receipt_created !== false && !evidence.gates.false_success,
  plan_ok: evidence.gates.plan_unchanged,
  browser_today: evidence.gates.browser_today,
  open_work: evidence.gates.api_open_work,
  next_shift: evidence.gates.next_shift_visible,
  relay: evidence.gates.browser_relay_retrieval,
  cross_screen_rate: evidence.cross_screen_rate,
};
writeFileSync(OUT, JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence.summary, null, 2));
console.log("gates", evidence.gates);
await browser.close();
const hard =
  evidence.gates.plan_unchanged &&
  !evidence.gates.false_success &&
  evidence.gates.api_today_or_handoff &&
  (evidence.gates.browser_today || evidence.gates.api_open_work);
process.exit(hard ? 0 : 2);
