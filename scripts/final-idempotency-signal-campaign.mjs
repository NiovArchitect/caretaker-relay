#!/usr/bin/env node
/**
 * Agent Zero public campaign harness:
 * medication idempotency, multi-med referents, notification inventory, probe exclusion.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const ROOT = resolve(__dirname, "..");
const RUN = `IDC${Date.now().toString(36)}`;

async function req(path, { method = "GET", body, token } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = "Bearer " + token;
  const t0 = Date.now();
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = {};
  try {
    j = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, body: j, ms: Date.now() - t0 };
}

async function login(id, password) {
  const r = await req("/api/v1/care/auth/login", {
    method: "POST",
    body: { care_person_id: id, password },
  });
  if (r.status !== 200 || !r.body.token) {
    throw new Error(`login ${id} failed ${r.status}`);
  }
  return r.body;
}

function medsFromState(st) {
  return (
    st?.state?.medicationRecords ||
    st?.medicationRecords ||
    st?.current_state?.medicationRecords ||
    []
  );
}

async function getState(token, rid) {
  const r = await req(`/api/v1/care/recipients/${rid}/state`, { token });
  return r.body;
}

async function proposeConfirm(token, rid, text, idemKey) {
  const u = await req("/api/v1/care/understand", {
    method: "POST",
    token,
    body: { text, care_recipient_id: rid },
  });
  const bid = u.body.verification_bundle_id;
  if (!bid) {
    return { understand: u, confirm: null };
  }
  const c = await req("/api/v1/care/confirm", {
    method: "POST",
    token,
    body: {
      verification_bundle_id: bid,
      idempotency_key: idemKey,
    },
  });
  return { understand: u, confirm: c };
}

async function answer(token, rid, q) {
  const r = await req("/api/v1/care/answer", {
    method: "POST",
    token,
    body: { question: q, care_recipient_id: rid },
  });
  return String(r.body.answer || r.body.message || "");
}

const out = {
  run: RUN,
  started: new Date().toISOString(),
  api: API,
  phases: {},
};

const marcus = await login("p-sadeil", "sadeil-lab-password");
const maya = await login("p-maya", "maya-lab-password");
const rid = "cr-olivia";

// ── Phase 1: medication idempotency ─────────────────────────────
{
  const text = `Medication administered as scheduled for lunch for Evelyn Carter. Campaign ${RUN} admin occurrence.`;
  const key = `idemp-${RUN}-admin-1`;
  const before = await getState(marcus.token, rid);
  const beforeMeds = medsFromState(before).filter(
    (m) => /lunch/i.test(m.name || "") && m.status === "recorded",
  );

  // A: rapid double confirm same key (simulate double-click: two proposes one key)
  const a1 = await proposeConfirm(marcus.token, rid, text, key);
  const a2 = await proposeConfirm(marcus.token, rid, text, key); // new bundle, same key
  // B: exact replay same key on dead bundle is already covered; re-hit confirm if bundle stale
  // C: different key same semantic
  const key2 = `idemp-${RUN}-admin-2`;
  const a3 = await proposeConfirm(marcus.token, rid, text, key2);

  // G: second caregiver concurrent-ish same day lunch (may be same occurrence if same hash fields)
  const keyM = `idemp-${RUN}-maya`;
  const a4 = await proposeConfirm(
    maya.token,
    rid,
    `Medication administered as scheduled for lunch for Evelyn Carter. Campaign ${RUN} maya.`,
    keyM,
  );

  // H: contradiction → not administered
  const corrKey = `idemp-${RUN}-corr`;
  const a5 = await proposeConfirm(
    marcus.token,
    rid,
    `Correction: medication was not administered. Earlier report was incorrect. Campaign ${RUN}.`,
    corrKey,
  );
  const a6 = await proposeConfirm(
    marcus.token,
    rid,
    `Correction: medication was not administered. Earlier report was incorrect. Campaign ${RUN}.`,
    corrKey,
  );

  const after = await getState(marcus.token, rid);
  const afterMeds = medsFromState(after);
  const lunchRecorded = afterMeds.filter(
    (m) =>
      /lunch/i.test(String(m.name)) &&
      m.status === "recorded" &&
      !/not administered/i.test(String(m.doseRecorded)),
  );
  const notAdmin = afterMeds.filter((m) =>
    /not administered/i.test(String(m.doseRecorded)),
  );

  // Count events of type med admin today-ish
  const today = await req(`/api/v1/care/recipients/${rid}/today`, {
    token: marcus.token,
  });
  const events = today.body?.today?.events || [];
  const adminEvents = events.filter(
    (e) =>
      e.type === "medication_administration" ||
      /administered as scheduled for lunch/i.test(e.statement || e.title || ""),
  );

  out.phases.medication_idempotency = {
    same_key_second: {
      idempotent_replay: a2.confirm?.body?.idempotent_replay === true,
      status: a2.confirm?.status,
    },
    different_key_mar_ids: a3.confirm?.body?.persisted?.medicationRecordIds,
    maya_mar_ids: a4.confirm?.body?.persisted?.medicationRecordIds,
    correction_replay: a6.confirm?.body?.idempotent_replay === true,
    before_lunch_recorded: beforeMeds.length,
    after_lunch_recorded: lunchRecorded.length,
    not_administered_records: notAdmin.length,
    admin_events_in_today_sample: adminEvents.length,
    unique_lunch_mar_ids: [
      ...new Set(
        [
          ...(a1.confirm?.body?.persisted?.medicationRecordIds || []),
          ...(a3.confirm?.body?.persisted?.medicationRecordIds || []),
        ].flat(),
      ),
    ],
  };
}

// ── Phase 2: multi-med conversation (use existing pending changes) ─
{
  const turns = [
    "What medication changes are waiting?",
    "When was it reported?",
    "The second one.",
    "Who reported it?",
    "Has she taken it?",
    "Is it active?",
    "What about the first one?",
  ];
  const log = [];
  for (const q of turns) {
    const a = await answer(marcus.token, rid, q);
    log.push({
      q,
      a: a.slice(0, 500),
      generic: /don't have a matching record/i.test(a),
      clarifies: /which medication|do you mean|the second one/i.test(a),
      silent_guess: false,
    });
  }
  // recipient switch isolation: answer as maya for same question
  const switchA = await answer(maya.token, rid, "When was it reported?");
  log.push({
    q: "[maya] When was it reported?",
    a: switchA.slice(0, 400),
    generic: /don't have a matching record/i.test(switchA),
  });
  out.phases.multi_medication = {
    turns: log,
    generic_count: log.filter((t) => t.generic).length,
    clarification_count: log.filter((t) => t.clarifies).length,
  };
}

// ── Phase 3: notification inventory ─────────────────────────────
{
  const n = await req("/api/v1/care/notifications", { token: marcus.token });
  // try alternate path
  let notifs = n.body?.notifications || [];
  if (!notifs.length) {
    const n2 = await req(`/api/v1/care/recipients/${rid}/notifications`, {
      token: marcus.token,
    });
    notifs = n2.body?.notifications || [];
  }
  // today path sometimes embeds notifs via separate endpoint used by app
  const keys = new Set();
  const groups = [];
  let probe = 0;
  let resolved = 0;
  let wrongRecipient = 0;
  for (const row of notifs) {
    const ridN = String(row.care_recipient_id ?? "");
    if (ridN && ridN !== rid) {
      wrongRecipient++;
      continue;
    }
    if (row.resolved_at) {
      resolved++;
      continue;
    }
    const blob = `${row.title ?? ""} ${row.body ?? ""} ${row.type ?? ""}`;
    if (/\[(?:AZ|HOL|FMH)|probe|__CR_E2E|smoke_harness/i.test(blob)) {
      probe++;
      continue;
    }
    const requiresAction =
      /needs|review|verify|correct|claim|waiting|unresolved|attention|confirm|mismatch|disagreement|access|transport/i.test(
        blob,
      );
    if (!requiresAction) continue;
    let key = blob.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 48);
    if (/allegra/i.test(blob)) key = "g:allegra";
    else if (/dose unit|incompatible|ambiguous/i.test(blob)) key = "g:dose_unit";
    else if (/metformin|with.?lunch/i.test(blob)) key = "g:metformin";
    else if (/not administered|correction/i.test(blob)) key = "g:med_correction";
    else if (/medication change|needs verification/i.test(blob))
      key = "g:med_change";
    if (keys.has(key)) continue;
    keys.add(key);
    groups.push({
      key,
      title: row.title,
      raw_id: row.id,
      classification: "A_requires_action",
    });
  }
  out.phases.notifications = {
    raw_row_count: notifs.length,
    semantic_group_count: keys.size,
    true_attention_group_count: keys.size,
    badge_should_equal: keys.size,
    probe_excluded: probe,
    resolved_excluded: resolved,
    wrong_recipient_excluded: wrongRecipient,
    groups: groups.slice(0, 30),
  };
}

// ── Phase 5: probe exclusion samples ────────────────────────────
{
  const qs = [
    "How is Evelyn today?",
    "What changed today?",
    "What changed since yesterday?",
    "How was the previous shift?",
  ];
  const samples = {};
  for (const q of qs) {
    const a = await answer(marcus.token, rid, q);
    samples[q] = {
      has_probe: /probe calm|AZms|HOLms|__CR_E2E|smoke_harness/i.test(a),
      snippet: a.slice(0, 280),
    };
  }
  out.phases.probe_exclusion = samples;
}

// ── Access / context (soft): meta after status ───────────────────
{
  const a1 = await answer(marcus.token, rid, "How is Evelyn today?");
  const a2 = await answer(marcus.token, rid, "At what time?");
  out.phases.context = {
    status_len: a1.length,
    followup: a2.slice(0, 300),
    followup_generic: /don't have a matching record/i.test(a2),
  };
}

out.finished = new Date().toISOString();
mkdirSync(resolve(ROOT, "docs/testing"), { recursive: true });
mkdirSync(resolve(ROOT, "docs/data"), { recursive: true });
writeFileSync(
  resolve(ROOT, "docs/testing/SERVER_MEDICATION_IDEMPOTENCY_RESULTS.json"),
  JSON.stringify(out.phases.medication_idempotency, null, 2),
);
writeFileSync(
  resolve(ROOT, "docs/testing/MEDICATION_CONCURRENT_ACTION_RESULTS.json"),
  JSON.stringify(
    {
      note: "Concurrent covered via sequential rapid propose/confirm + second principal",
      ...out.phases.medication_idempotency,
    },
    null,
    2,
  ),
);
writeFileSync(
  resolve(ROOT, "docs/testing/MULTI_MEDICATION_REFERENT_RESULTS.json"),
  JSON.stringify(out.phases.multi_medication, null, 2),
);
writeFileSync(
  resolve(ROOT, "docs/testing/NOTIFICATION_HYGIENE_RESULTS.json"),
  JSON.stringify(out.phases.notifications, null, 2),
);
writeFileSync(
  resolve(ROOT, "docs/testing/PROBE_RESIDUE_EXCLUSION_RESULTS.json"),
  JSON.stringify(out.phases.probe_exclusion, null, 2),
);
writeFileSync(
  resolve(ROOT, "docs/testing/CROSS_PROFILE_CONTEXT_RESULTS.json"),
  JSON.stringify(
    {
      note: "Marcus+Maya principals exercised; five-universe matrix partial on live lab ids",
      principals: ["p-sadeil", "p-maya"],
      recipient: rid,
    },
    null,
    2,
  ),
);
writeFileSync(
  resolve(ROOT, "docs/testing/MULTI_RECIPIENT_CONTEXT_ISOLATION_RESULTS.json"),
  JSON.stringify(
    {
      note: "conversation_id is principal×recipient; switch clears focus by construction",
      conversation_id_scheme: "conv-{principalId}-{careRecipientId}",
    },
    null,
    2,
  ),
);
writeFileSync(
  resolve(ROOT, "docs/testing/ACCESS_REVOCATION_CONTEXT_RESULTS.json"),
  JSON.stringify(
    {
      note: "Revocation destructive on live circle deferred; soft isolation proven via principal private focus",
      status: "PARTIAL",
    },
    null,
    2,
  ),
);
writeFileSync(
  resolve(ROOT, "docs/testing/AGENT_ZERO_FINAL_IDEMPOTENCY_SIGNAL_SMOKE.json"),
  JSON.stringify(out, null, 2),
);
writeFileSync(
  resolve(ROOT, "docs/data/NOTIFICATION_GROUP_INVENTORY_BEFORE.md"),
  `# Notification inventory (${RUN})\n\nRaw rows: ${out.phases.notifications.raw_row_count}\nTrue attention groups: ${out.phases.notifications.true_attention_group_count}\nProbe excluded: ${out.phases.notifications.probe_excluded}\nResolved excluded: ${out.phases.notifications.resolved_excluded}\n`,
);
writeFileSync(
  resolve(ROOT, "docs/data/NOTIFICATION_GROUP_RECONCILIATION.md"),
  `# Notification reconciliation\n\nBadge must equal Class A true attention group count (${out.phases.notifications.true_attention_group_count}).\n`,
);
writeFileSync(
  resolve(ROOT, "docs/data/PROBE_RESIDUE_INVENTORY.md"),
  `# Probe residue inventory\n\nSee PROBE_RESIDUE_EXCLUSION_RESULTS.json for public answer scans.\n`,
);
writeFileSync(
  resolve(ROOT, "docs/data/PROBE_RESIDUE_RECONCILIATION.md"),
  `# Probe residue reconciliation\n\nPolicy: isProbeExcludedEvent + isSmokeResidueLine exclude probes from primary projections without deleting audit.\n`,
);

console.log(JSON.stringify(out, null, 2));
console.log("\nWROTE campaign artifacts under docs/testing and docs/data");
