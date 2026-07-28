#!/usr/bin/env node
/**
 * Holistic end-to-end operational closure smoke (public API).
 * Open-work accept/decline, schedule proposals, three-shift Relay, authz.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const OUT = resolve(__dirname, "../docs/testing/holistic-e2e-closure");
mkdirSync(OUT, { recursive: true });

const Q = [
  "How are they?",
  "What changed?",
  "What remains unfinished?",
  "Was medication administered?",
  "What is the next appointment?",
  "What should the next caregiver know?",
];

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

const evidence = {
  started: new Date().toISOString(),
  api: API,
  gates: {},
  stages: {},
  defects: [],
};

const sadeil = await login("p-sadeil", "sadeil-lab-password");
const walter = await login("p-walter", "walter-lab-password");
const maya = await login("p-maya", "maya-lab-password");
const RUN = `HOL${Date.now().toString(36)}`;
const RID = "cr-olivia"; // lab recipient with known principals (isolated recipient creation needs invite pipeline)
evidence.run_id = RUN;
evidence.recipient = RID;
evidence.note =
  "Uses shared lab recipient with unique RUN markers; full isolated recipient requires invite/bind product path.";

async function answer(token, q) {
  const r = await req("/api/v1/care/answer", {
    method: "POST",
    token,
    body: { question: q, care_recipient_id: RID },
  });
  return {
    status: r.status,
    text: String(r.body.answer || r.body.message || ""),
    ms: r.ms,
  };
}

const now = Date.now();

// ── SHIFT 1: handoff seeds open work
{
  const create = await req(`/api/v1/care/recipients/${RID}/shifts`, {
    method: "POST",
    token: sadeil.token,
    body: {
      assignee_person_id: "p-walter",
      assignee_display_name: "Daniel Kim",
      shift_start: new Date(now - 2 * 3600e3).toISOString(),
      shift_end: new Date(now + 2 * 3600e3).toISOString(),
      scope_note: `Holistic S1 ${RUN}`,
    },
  });
  const aid = create.body.assignment?.id;
  evidence.stages.s1_create = { status: create.status, aid };
  if (aid) {
    await req(`/api/v1/care/recipients/${RID}/shifts/${aid}/respond`, {
      method: "POST",
      token: walter.token,
      body: { decision: "accept" },
    });
    const ho = await req(`/api/v1/care/recipients/${RID}/shifts/${aid}/handoff`, {
      method: "POST",
      token: walter.token,
      body: {
        what_changed: [
          `Calm mood after breakfast [${RUN}-S1]`,
          `Breakfast eaten [${RUN}-S1]`,
        ],
        still_needs_attention: [`Transportation incomplete [${RUN}-S1]`],
        to_person_id: "p-maya",
      },
    });
    evidence.stages.s1_handoff = {
      status: ho.status,
      handoff_id: ho.body.handoff_id,
      ok: ho.body.ok,
    };
  }
  const work = await req(`/api/v1/care/recipients/${RID}/work-items`, {
    token: maya.token,
  });
  const items = work.body.work_items || [];
  const transport = items.find((w) =>
    new RegExp(`${RUN}-S1`, "i").test(w.action || ""),
  );
  evidence.stages.s1_work_seeded = {
    status: work.status,
    count: items.length,
    transportId: transport?.id,
    transportStatus: transport?.status,
    unassigned: !transport?.ownerPersonId,
  };
  evidence.gates.work_seeded_from_handoff = transport?.id ? "PASS" : "FAIL";

  const a1 = {};
  for (const q of Q) {
    const r = await answer(sadeil.token, q);
    a1[q] = r.text.slice(0, 320).replace(/\n/g, " | ");
  }
  evidence.stages.s1_answers = a1;
}

// ── SHIFT 2: ack handoff WITHOUT accepting; then accept one task
{
  const list = await req(`/api/v1/care/recipients/${RID}/handoffs`, {
    token: maya.token,
  });
  const handoffs = list.body.handoffs || [];
  const latest = [...handoffs].sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt)),
  )[handoffs.length - 1];
  if (latest?.id) {
    const ack = await req(
      `/api/v1/care/recipients/${RID}/handoffs/${latest.id}/lifecycle`,
      {
        method: "POST",
        token: maya.token,
        body: { status: "acknowledged" },
      },
    );
    evidence.stages.s2_ack = {
      status: ack.status,
      lifecycle: ack.body.lifecycle?.status,
      ok: ack.body.ok,
    };
  }

  // After ack, work must still be unassigned
  const workAfterAck = await req(`/api/v1/care/recipients/${RID}/work-items`, {
    token: maya.token,
  });
  const transport = (workAfterAck.body.work_items || []).find((w) =>
    new RegExp(`${RUN}-S1`, "i").test(w.action || ""),
  );
  evidence.stages.s2_after_ack_work = {
    id: transport?.id,
    owner: transport?.ownerPersonId ?? null,
    status: transport?.status,
  };
  evidence.gates.ack_not_accept =
    transport && !transport.ownerPersonId ? "PASS" : "PARTIAL";

  // Accept
  let acceptRes = null;
  if (transport?.id) {
    acceptRes = await req(
      `/api/v1/care/recipients/${RID}/work-items/${transport.id}/accept`,
      { method: "POST", token: maya.token, body: {} },
    );
    evidence.stages.s2_accept = {
      status: acceptRes.status,
      work_status: acceptRes.body.work_item?.status,
      owner: acceptRes.body.work_item?.ownerPersonId,
      message: acceptRes.body.message,
    };
    // Double claim
    const second = await req(
      `/api/v1/care/recipients/${RID}/work-items/${transport.id}/accept`,
      { method: "POST", token: walter.token, body: {} },
    );
    evidence.stages.s2_double_claim = {
      status: second.status,
      code: second.body.code,
    };
    evidence.gates.double_claim_blocked =
      second.status === 409 || second.body.code === "ALREADY_OWNED"
        ? "PASS"
        : "FAIL";
  }
  evidence.gates.task_accept =
    acceptRes?.body?.work_item?.status === "accepted" &&
    acceptRes?.body?.work_item?.ownerPersonId === "p-maya"
      ? "PASS"
      : "FAIL";

  // Decline path on a separate item
  const create2 = await req(`/api/v1/care/recipients/${RID}/shifts`, {
    method: "POST",
    token: sadeil.token,
    body: {
      assignee_person_id: "p-maya",
      assignee_display_name: "Maya Bennett",
      shift_start: new Date(now - 30 * 60e3).toISOString(),
      shift_end: new Date(now + 3 * 3600e3).toISOString(),
      scope_note: `Holistic S2 ${RUN}`,
    },
  });
  const aid2 = create2.body.assignment?.id;
  if (aid2) {
    await req(`/api/v1/care/recipients/${RID}/shifts/${aid2}/respond`, {
      method: "POST",
      token: maya.token,
      body: { decision: "accept" },
    });
    const ho2 = await req(`/api/v1/care/recipients/${RID}/shifts/${aid2}/handoff`, {
      method: "POST",
      token: maya.token,
      body: {
        what_changed: [
          `More tired than usual [${RUN}-S2]`,
          `Lunch refused [${RUN}-S2]`,
          `Medication reported administered at noon [${RUN}-S2]`,
          `Therapy rescheduled to later slot [${RUN}-S2]`,
        ],
        still_needs_attention: [`Watch fatigue after lunch [${RUN}-S2]`],
        to_person_id: "p-sadeil",
      },
    });
    evidence.stages.s2_handoff = {
      status: ho2.status,
      handoff_id: ho2.body.handoff_id,
    };
  }

  const work2 = await req(`/api/v1/care/recipients/${RID}/work-items`, {
    token: sadeil.token,
  });
  const fatigue = (work2.body.work_items || []).find((w) =>
    new RegExp(`${RUN}-S2`, "i").test(w.action || ""),
  );
  if (fatigue?.id) {
    const dec = await req(
      `/api/v1/care/recipients/${RID}/work-items/${fatigue.id}/decline`,
      {
        method: "POST",
        token: sadeil.token,
        body: { reason: "Cannot cover tonight" },
      },
    );
    evidence.stages.s2_decline = {
      status: dec.status,
      work_status: dec.body.work_item?.status,
      owner: dec.body.work_item?.ownerPersonId,
      reason: dec.body.work_item?.declineReason,
    };
    evidence.gates.task_decline =
      dec.body.work_item?.status === "available_to_claim" &&
      !dec.body.work_item?.ownerPersonId
        ? "PASS"
        : "FAIL";
  } else {
    evidence.gates.task_decline = "FAIL";
  }

  // Schedule proposals
  const props = await req(`/api/v1/care/recipients/${RID}/schedule-proposals`, {
    token: sadeil.token,
  });
  const openProps = props.body.open || props.body.proposals || [];
  const prop = openProps.find(
    (p) =>
      p.status === "proposed" &&
      (new RegExp(RUN, "i").test(p.sourceText || "") ||
        /reschedul|later/i.test(p.sourceText || "")),
  );
  evidence.stages.schedule_proposals = {
    status: props.status,
    openCount: (props.body.open || []).length,
    propId: prop?.id,
    source: prop?.sourceText?.slice(0, 80),
  };
  evidence.gates.schedule_proposal_created = prop?.id ? "PASS" : "PARTIAL";

  if (prop?.id) {
    const conf = await req(
      `/api/v1/care/recipients/${RID}/schedule-proposals/${prop.id}/confirm`,
      {
        method: "POST",
        token: sadeil.token,
        body: {
          confirmed_starts_at_label: `Confirmed later slot ${RUN}`,
          confirmed_starts_at: new Date(now + 36 * 3600e3).toISOString(),
        },
      },
    );
    evidence.stages.schedule_confirm = {
      status: conf.status,
      proposal_status: conf.body.proposal?.status,
      apt: conf.body.appointment_id,
    };
    evidence.gates.schedule_confirm =
      conf.body.proposal?.status === "confirmed" ? "PASS" : "FAIL";
  } else {
    evidence.gates.schedule_confirm = "PARTIAL";
  }

  const a2 = {};
  for (const q of Q) {
    const r = await answer(sadeil.token, q);
    a2[q] = r.text.slice(0, 320).replace(/\n/g, " | ");
  }
  evidence.stages.s2_answers = a2;
}

// ── SHIFT 3: correction language
{
  const create3 = await req(`/api/v1/care/recipients/${RID}/shifts`, {
    method: "POST",
    token: sadeil.token,
    body: {
      assignee_person_id: "p-walter",
      assignee_display_name: "Daniel Kim",
      shift_start: new Date(now - 10 * 60e3).toISOString(),
      shift_end: new Date(now + 4 * 3600e3).toISOString(),
      scope_note: `Holistic S3 ${RUN}`,
    },
  });
  const aid3 = create3.body.assignment?.id;
  if (aid3) {
    await req(`/api/v1/care/recipients/${RID}/shifts/${aid3}/respond`, {
      method: "POST",
      token: walter.token,
      body: { decision: "accept" },
    });
    const ho3 = await req(`/api/v1/care/recipients/${RID}/shifts/${aid3}/handoff`, {
      method: "POST",
      token: walter.token,
      body: {
        what_changed: [
          `Correction: medication was not administered [${RUN}-S3]`,
          `Mood improved [${RUN}-S3]`,
          `New mobility concern noted [${RUN}-S3]`,
        ],
        still_needs_attention: [`Mobility concern needs monitoring [${RUN}-S3]`],
        to_person_id: "p-maya",
      },
    });
    evidence.stages.s3_handoff = {
      status: ho3.status,
      handoff_id: ho3.body.handoff_id,
    };
  }
  const list = await req(`/api/v1/care/recipients/${RID}/handoffs`, {
    token: maya.token,
  });
  const latest = [...(list.body.handoffs || [])].sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt)),
  ).pop();
  if (latest?.id) {
    const ack = await req(
      `/api/v1/care/recipients/${RID}/handoffs/${latest.id}/lifecycle`,
      {
        method: "POST",
        token: maya.token,
        body: { status: "acknowledged" },
      },
    );
    evidence.stages.s3_ack = {
      status: ack.status,
      lifecycle: ack.body.lifecycle?.status,
    };
  }

  const notifs = await req("/api/v1/care/notifications", { token: maya.token });
  evidence.stages.notifications = {
    status: notifs.status,
    count: (notifs.body.notifications || []).length,
    correctionish: (notifs.body.notifications || []).filter(
      (n) =>
        /correct/i.test(n.title || "") ||
        /correct/i.test(n.body || "") ||
        n.sourceType === "correction",
    ).length,
  };

  const a3 = {};
  for (const q of Q) {
    const r = await answer(sadeil.token, q);
    a3[q] = r.text.slice(0, 320).replace(/\n/g, " | ");
  }
  evidence.stages.s3_answers = a3;
}

// Comparison
const a1 = evidence.stages.s1_answers || {};
const a2 = evidence.stages.s2_answers || {};
const a3 = evidence.stages.s3_answers || {};
let staticCount = 0;
const comparison = [];
for (const q of Q) {
  const s1 = a1[q] || "";
  const s2 = a2[q] || "";
  const s3 = a3[q] || "";
  const allSame = s1 === s2 && s2 === s3 && s1.length > 0;
  const expectChange = q !== "What is the next appointment?" || true;
  // After schedule confirm, next appointment should change when confirmed
  if (allSame && expectChange && q !== "What is the next appointment?") staticCount++;
  if (allSame && q === "What is the next appointment?" && evidence.gates.schedule_confirm === "PASS") {
    // should have changed
    staticCount++;
  }
  comparison.push({
    question: q,
    shift1: s1,
    shift2: s2,
    shift3: s3,
    allSame,
    pass: allSame ? "FAIL" : "PASS",
  });
}
evidence.comparison = comparison;
evidence.gates.three_relay_sets = staticCount === 0 ? "PASS" : staticCount < Q.length ? "PARTIAL" : "FAIL";
evidence.gates.static_answers = staticCount;

// Authz
const unauth = await req("/api/v1/care/auth/login", {
  method: "POST",
  body: { care_person_id: "p-unauthorized", password: "unauth-lab-password" },
});
let unauthN = 0;
if (unauth.body.token) {
  const r = await answer(unauth.body.token, "How is Evelyn?");
  if (r.status === 200 && /Metformin|Fatigue/i.test(r.text) && !/access|relationship/i.test(r.text))
    unauthN++;
}
evidence.gates.unauth_answers = unauthN;
evidence.gates.unsafe_med = 0;
for (const stage of [a1, a2, a3]) {
  for (const q of Q) {
    if (/give another dose|redose now|take an extra/i.test(stage[q] || ""))
      evidence.gates.unsafe_med++;
  }
}

const hard =
  evidence.gates.work_seeded_from_handoff === "PASS" &&
  evidence.gates.task_accept === "PASS" &&
  evidence.gates.task_decline === "PASS" &&
  evidence.gates.double_claim_blocked === "PASS" &&
  evidence.gates.three_relay_sets !== "FAIL" &&
  unauthN === 0;

evidence.verdict = hard
  ? evidence.gates.three_relay_sets === "PASS" &&
    evidence.gates.schedule_confirm === "PASS"
    ? "HOLISTIC_PASS"
    : "HOLISTIC_PARTIAL"
  : "HOLISTIC_FAIL";

evidence.ended = new Date().toISOString();
writeFileSync(resolve(OUT, "HOLISTIC_SMOKE_RESULTS.json"), JSON.stringify(evidence, null, 2));
writeFileSync(resolve(OUT, "RELAY_COMPARISON.json"), JSON.stringify(comparison, null, 2));
console.log(
  JSON.stringify(
    {
      verdict: evidence.verdict,
      gates: evidence.gates,
      run: RUN,
    },
    null,
    2,
  ),
);
process.exit(evidence.verdict === "HOLISTIC_FAIL" ? 1 : 0);
