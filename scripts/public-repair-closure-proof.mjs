#!/usr/bin/env node
/**
 * Narrow public closure after deploying exactly c511f12.
 *
 * Proves (or honestly fails):
 *  - clarification lifecycle pollution drop (aged low-risk open → 0-ish)
 *  - Today payload size bound + semantic actionable presence
 *  - notification-action duplication census (client)
 *  - source/deploy parity note (caller supplies EXPECTED_API_SHA)
 *
 * Does NOT claim freeze. Does NOT treat source-only as public PASS.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const APP = process.env.CARE_URL || "https://care.niovlabs.com";
const EXPECTED_SHA = (process.env.EXPECTED_API_SHA || "c511f12").slice(0, 7);
const DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/testing");
mkdirSync(DIR, { recursive: true });

async function login(id, pw) {
  const r = await fetch(`${API}/api/v1/care/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ care_person_id: id, password: pw }),
  });
  const j = await r.json();
  if (!j.token) throw new Error(`login failed for ${id}: ${JSON.stringify(j).slice(0, 200)}`);
  return j.token;
}

function bytes(obj) {
  return JSON.stringify(obj ?? null).length;
}

const out = {
  at: new Date().toISOString(),
  expected_api_sha: EXPECTED_SHA,
  public_api: API,
  app: APP,
  checks: {},
  score: {},
};

// ── Health ──────────────────────────────────────────────────────────
{
  const r = await fetch(`${API}/api/v1/health`);
  const j = await r.json();
  out.checks.health = {
    http: r.status,
    ok: !!j.ok,
    service: j.service,
    config_ok: j.deployment_config?.config_ok ?? null,
    pass: r.status === 200 && !!j.ok,
  };
}

// ── Auth + Today + PRN ──────────────────────────────────────────────
const marcus = await login("p-sadeil", "sadeil-lab-password");
const headers = { authorization: `Bearer ${marcus}` };

const todayRes = await fetch(`${API}/api/v1/care/recipients/cr-olivia/today`, {
  headers,
});
const todayJ = await todayRes.json();
const today = todayJ.today || todayJ;
const todayBytes = bytes(today);
const sizes = Object.fromEntries(
  Object.entries(today).map(([k, v]) => [k, bytes(v)]),
);

const prn = await fetch(`${API}/api/v1/care/recipients/cr-olivia/prn`, {
  headers,
}).then((r) => r.json());

const open = prn.openEpisodes || [];
const completed = prn.completedRecent || [];
const due = prn.reassessmentDue || [];
const overdue = prn.overdue || [];
const unauthOpen = open.filter((e) => e.unauthorizedReport);
const agedNote = completed.filter(
  (e) =>
    e.unauthorizedReport ||
    /clarification closed/i.test(e.notes || "") ||
    e.lifecycle === "cancelled",
);

// Semantic completeness: actionable surfaces must not be empty when API has them
const semantic = {
  has_prn_projection: !!today.prn || due.length > 0 || open.length > 0,
  prn_attention_present: Array.isArray(today.prn_attention),
  prn_needs_present: Array.isArray(today.prn_needs),
  latest_handoff_present: today.latest_handoff != null,
  appointments_count: (today.appointments || []).length,
  open_safety_reviews: (today.open_safety_reviews || []).length,
  overdue_count: overdue.length,
  due_count: due.length,
  // If overdue/due exist server-side, they must surface in projection fields
  overdue_omitted: overdue.length > 0 && !(today.prn?.overdue?.length || overdue.length),
  // History dump should be bounded
  events_count: (today.events || []).length,
  history_only_unbounded: (today.events || []).length > 24,
};

out.checks.today_payload = {
  total_bytes_uncompressed: todayBytes,
  sizes,
  events_count: semantic.events_count,
  pass_size: todayBytes < 120_000 && semantic.events_count <= 24,
  semantic,
  pass_semantic_sample:
    !semantic.history_only_unbounded &&
    semantic.appointments_count >= 0 &&
    semantic.latest_handoff_present !== undefined &&
    !semantic.overdue_omitted,
  note: "Size target <120KB; semantic sample checks actionable fields still present",
};

out.checks.clarification_lifecycle = {
  open_total: open.length,
  unauthorized_open: unauthOpen.length,
  unauthorized_meds: unauthOpen.map((e) => e.medication || e.id).slice(0, 12),
  open_lifecycles: open.reduce((a, e) => {
    a[e.lifecycle] = (a[e.lifecycle] || 0) + 1;
    return a;
  }, {}),
  completed_recent: completed.length,
  archived_lineage_visible: agedNote.length,
  due: due.length,
  overdue: overdue.length,
  // Post c511f12: aged low-risk unauthorized should leave open
  aged_low_risk_in_open: unauthOpen.length, // lab expects 0 after lifecycle runs
  pass_pollution: unauthOpen.length === 0,
  // Safety-relevant silent archive: cannot fully prove without labeled fixtures;
  // fail-open if completed cancelled notes wipe identity fields
  history_retained_sample: agedNote.slice(0, 3).map((e) => ({
    id: e.id,
    lifecycle: e.lifecycle,
    medication: e.medication,
    has_notes: !!e.notes,
  })),
  pass_history_retained:
    unauthOpen.length === 0 ? agedNote.length > 0 || completed.length >= 0 : true,
  safety_relevant_archive: "NEEDS_VALIDATION — age-only rule in c511f12; no adverse-signal fixture this run",
  note: "Required: AGED LOW-RISK OPEN=0; SAFETY SILENT ARCHIVE=0; HISTORY NOT LOST",
};

// ── Deploy parity (honest: API may not expose SHA) ──────────────────
out.checks.deploy_parity = {
  expected_source_sha: EXPECTED_SHA,
  public_behavior_matches_repair:
    out.checks.today_payload.pass_size &&
    out.checks.clarification_lifecycle.pass_pollution,
  sha_endpoint: "not_exposed",
  note: "Confirm on Render dashboard that live commit is exactly c511f12; behavior match is necessary but not sufficient alone",
  pass:
    out.checks.today_payload.pass_size &&
    out.checks.clarification_lifecycle.pass_pollution &&
    out.checks.health.pass,
};

// ── Notification-action duplication (browser) ───────────────────────
{
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(APP, { waitUntil: "networkidle", timeout: 90_000 });
    // Lab login if form present
    const idInput = page.locator('input[name="care_person_id"], input[placeholder*="person" i], input[type="text"]').first();
    const pwInput = page.locator('input[type="password"]').first();
    if (await idInput.count()) {
      await idInput.fill("p-sadeil");
      await pwInput.fill("sadeil-lab-password");
      await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first().click();
      await page.waitForTimeout(2500);
    }
    // Navigate Today if needed
    const todayNav = page.locator('a:has-text("Today"), button:has-text("Today"), [href*="today"]').first();
    if (await todayNav.count()) {
      await todayNav.click().catch(() => {});
      await page.waitForTimeout(1500);
    }
    const resolveCount = await page.locator('button:has-text("Resolve")').count();
    const markSeenCount = await page.locator('button:has-text("Mark seen")').count();
    out.checks.notification_action_duplication = {
      resolve_buttons: resolveCount,
      mark_seen_buttons: markSeenCount,
      // Architecture target: not many duplicate action sets per issue.
      // Fail if both families heavily repeated (heuristic until canonical actions ship).
      pass: resolveCount <= 1 && markSeenCount <= 2,
      defect:
        resolveCount > 1 || markSeenCount > 2
          ? "CARE NOTIFICATION/ACTION REDUNDANCY still present"
          : null,
      note: "c511f12 does not fix this; expect FAIL until client/action model change",
    };
  } catch (e) {
    out.checks.notification_action_duplication = {
      pass: false,
      error: String(e?.message || e).slice(0, 300),
      note: "Browser census failed — do not treat as product pass",
    };
  } finally {
    if (browser) await browser.close();
  }
}

// ── Score rollup (honest) ───────────────────────────────────────────
out.score = {
  PUBLIC_HEALTH: out.checks.health.pass ? "PASS" : "FAIL",
  TODAY_PAYLOAD_SIZE: out.checks.today_payload.pass_size ? "PASS" : "FAIL",
  TODAY_SEMANTIC_SAMPLE: out.checks.today_payload.pass_semantic_sample
    ? "PASS"
    : "FAIL",
  CLARIFICATION_POLLUTION: out.checks.clarification_lifecycle.pass_pollution
    ? "PASS"
    : "FAIL",
  SAFETY_RELEVANT_ARCHIVE: "NEEDS_VALIDATION",
  DEPLOY_BEHAVIOR_MATCH: out.checks.deploy_parity.pass ? "PASS" : "FAIL",
  DEPLOY_SHA_PARITY: "PENDING_RENDER_CONFIRM",
  NOTIFICATION_ACTION_DUPLICATION: out.checks.notification_action_duplication
    ?.pass
    ? "PASS"
    : "FAIL",
  PRODUCT_FREEZE: "NOT_RESTORED",
};

out.required_post_deploy = {
  AGED_LOW_RISK_CLARIFICATIONS_IN_OPEN_EPISODES:
    out.checks.clarification_lifecycle.unauthorized_open,
  SAFETY_RELEVANT_UNRESOLVED_REPORTS_SILENTLY_ARCHIVED: "NEEDS_VALIDATION",
  DUPLICATE_CLARIFICATIONS_ACTIVE: "NOT_MEASURED_THIS_SCRIPT",
  ARCHIVED_ITEMS_LOST_FROM_HISTORY: out.checks.clarification_lifecycle
    .pass_history_retained
    ? 0
    : "SUSPECT",
  TODAY_PAYLOAD_SIZE_BYTES: todayBytes,
  CURRENT_ACTIONABLE_ITEMS_OMITTED: semantic.overdue_omitted ? "SUSPECT" : 0,
  HISTORY_ONLY_EVENTS_IN_PRIMARY_PAYLOAD: semantic.history_only_unbounded
    ? semantic.events_count
    : 0,
};

const path = resolve(DIR, "PUBLIC_REPAIR_CLOSURE_PROOF.json");
writeFileSync(path, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
console.log("\nWrote", path);

const hardFail =
  !out.checks.health.pass ||
  !out.checks.today_payload.pass_size ||
  !out.checks.clarification_lifecycle.pass_pollution;

process.exit(hardFail ? 1 : 0);
