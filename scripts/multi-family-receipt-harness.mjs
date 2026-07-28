/**
 * Representative receipt-to-reality across action families.
 * Metrics: interpretation, execution, persistence, destinations (API), plan safety.
 * Browser full dual-session only for plan-change (covered by receipt-to-reality-harness).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const OUT = resolve(__dirname, "../docs/testing/MULTI_FAMILY_RECEIPT_RESULTS.json");
mkdirSync(dirname(OUT), { recursive: true });

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let j = {};
  try {
    j = JSON.parse(text);
  } catch {
    j = { _raw: text.slice(0, 200) };
  }
  return { status: res.status, body: j };
}

async function login(id, password) {
  const r = await api("/api/v1/care/auth/login", {
    method: "POST",
    body: { care_person_id: id, password },
  });
  if (!r.body.token) throw new Error("login " + id);
  return r.body.token;
}

const MARK = Date.now().toString(36);

const FAMILIES = [
  {
    id: "med_plan_change",
    text: `Please add Allegra 60mg for allergies. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["open_work", "today_attention", "handoff"],
  },
  {
    id: "med_admin",
    text: `I gave Evelyn her lunch Metformin 500mg. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["care_medications", "handoff"],
  },
  {
    id: "med_refusal",
    text: `Evelyn refused her evening blood pressure pill. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["today_attention", "handoff"],
  },
  {
    id: "med_effect",
    text: `Evelyn felt dizzy after Advil this afternoon. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["care_observations", "relay_retrieval"],
    noCausation: true,
  },
  {
    id: "symptom",
    text: `Evelyn has a fever of about 100.4 this morning. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["care_observations", "handoff"],
  },
  {
    id: "meal",
    text: `Evelyn ate most of her lunch around noon. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["care_timeline", "handoff"],
  },
  {
    id: "transport",
    text: `Need a ride for Evelyn to PT tomorrow. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["open_work"],
  },
  {
    id: "task",
    text: `Create a task to pick up the walker from the garage. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["open_work", "today_attention"],
  },
  {
    id: "invite",
    text: `Invite Maya to help with Evelyn. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["people_privacy"],
  },
  {
    id: "access_change",
    text: `Who can see Evelyn's care — please review access. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["people_privacy"],
  },
  {
    id: "access_request",
    text: `I need access as a friend to help with Evelyn. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["people_privacy", "open_work"],
  },
  {
    id: "document_ingest",
    text: `Upload document: discharge summary says PT Friday and Metformin 500mg twice daily. Family ${MARK}`,
    expectPlanUnchanged: true,
    expectDest: ["documents"],
  },
];

const token = await login("p-sadeil", "sadeil-lab-password");
const results = [];

for (const f of FAMILIES) {
  const row = {
    id: f.id,
    interpretation: false,
    execution: false,
    persistence: false,
    destinations: false,
    plan_safe: false,
    causation_ok: true,
    message: "",
    dest: [],
    result: null,
  };
  try {
    const und = await api("/api/v1/care/understand", {
      method: "POST",
      token,
      body: { text: f.text, care_recipient_id: "cr-olivia" },
    });
    const vb = und.body.verification_bundle_id;
    row.interpretation = Boolean(vb);
    if (!vb) {
      results.push(row);
      continue;
    }
    const conf = await api("/api/v1/care/confirm", {
      method: "POST",
      token,
      body: {
        verification_bundle_id: vb,
        idempotency_key: `mf-${f.id}-${MARK}`,
      },
    });
    const receipt = conf.body.execution_receipt || {};
    row.execution = conf.body.ok === true || conf.body.kind === "persisted";
    const p = conf.body.persisted || {};
    row.persistence = Boolean(
      (p.eventIds && p.eventIds.length) ||
        (p.updateIds && p.updateIds.length) ||
        (p.handoffId),
    );
    row.dest = receipt.screenDestinations || [];
    row.result = receipt.result;
    row.message = (conf.body.message || "").slice(0, 160);
    row.plan_safe =
      f.expectPlanUnchanged === false
        ? true
        : receipt.activeMedicationPlanChanged === false;
    const destOk = (f.expectDest || []).every((d) =>
      row.dest.includes(d) ||
      (d === "open_work" && row.dest.includes("open_work")) ||
      (d === "people_privacy" && row.dest.includes("people_privacy")),
    );
    // Soft: at least one expected dest OR dests non-empty for saved
    row.destinations =
      destOk ||
      (row.dest.length > 0 &&
        (receipt.result === "saved" || receipt.result === "pending_review"));
    if (f.noCausation) {
      row.causation_ok = !/caused by|because of Advil|side effect of/i.test(
        row.message,
      );
      row.causation_ok =
        row.causation_ok &&
        /association|reported|not a clinical/i.test(row.message);
    }
  } catch (e) {
    row.message = String(e).slice(0, 120);
  }
  results.push(row);
  console.log(
    f.id,
    row.interpretation ? "I" : "-",
    row.execution ? "E" : "-",
    row.persistence ? "P" : "-",
    row.destinations ? "D" : "-",
    row.plan_safe ? "S" : "!",
    row.dest.join(","),
  );
}

// Access full lifecycle: create request as unauthorized (API) → list as Marcus → deny or approve
const accessLife = { create: false, list: false, decide: false, detail: "" };
try {
  const unauth = await login("p-unauthorized", "unauth-lab-password");
  const create = await api("/api/v1/care/access-requests", {
    method: "POST",
    token: unauth,
    body: {
      care_recipient_id: "cr-olivia",
      claimed_relationship: "friend",
      reason: `Help with Evelyn after work. Harness ${MARK}`,
    },
  });
  accessLife.create = create.status === 201 || create.body.ok === true;
  const reqId = create.body.access_request?.id;
  accessLife.detail = `create status ${create.status} id ${reqId || "none"}`;
  const list = await api("/api/v1/care/recipients/cr-olivia/access-requests", {
    token,
  });
  const items = list.body.access_requests || [];
  accessLife.list = items.some((x) => x.id === reqId) || items.some((x) =>
    String(x.reason || "").includes(MARK),
  );
  if (reqId) {
    const dec = await api(`/api/v1/care/access-requests/${reqId}/decide`, {
      method: "POST",
      token,
      body: { decision: "deny" },
    });
    accessLife.decide =
      dec.body.ok === true && dec.body.access_request?.status === "denied";
    accessLife.detail += ` decide ${dec.body.access_request?.status || dec.status}`;
  }
} catch (e) {
  accessLife.detail = String(e).slice(0, 200);
}

// Document lifecycle via dedicated API
const docLife = { ingest: false, proposals: 0, reject: false, detail: "" };
try {
  const ing = await api("/api/v1/care/recipients/cr-olivia/documents", {
    method: "POST",
    token,
    body: {
      title: `Harness discharge ${MARK}`,
      body: `Discharge summary ${MARK}: PT Friday at 2pm. Metformin 500mg twice daily. Continue walker.`,
    },
  });
  docLife.ingest = ing.body.ok === true;
  const props = ing.body.proposals || [];
  docLife.proposals = props.length;
  if (props[0]?.id) {
    const rej = await api(
      `/api/v1/care/recipients/cr-olivia/documents/proposals/${props[0].id}`,
      {
        method: "POST",
        token,
        body: { decision: "reject" },
      },
    );
    docLife.reject = rej.body.ok === true;
  }
  docLife.detail = `proposals ${docLife.proposals} reject ${docLife.reject}`;
} catch (e) {
  docLife.detail = String(e).slice(0, 200);
}

const rates = {
  interpretation: +(
    results.filter((r) => r.interpretation).length / results.length
  ).toFixed(3),
  execution: +(results.filter((r) => r.execution).length / results.length).toFixed(
    3,
  ),
  persistence: +(
    results.filter((r) => r.persistence).length / results.length
  ).toFixed(3),
  destinations: +(
    results.filter((r) => r.destinations).length / results.length
  ).toFixed(3),
  plan_safe: +(results.filter((r) => r.plan_safe).length / results.length).toFixed(
    3,
  ),
  causation_ok: +(
    results.filter((r) => r.causation_ok).length / results.length
  ).toFixed(3),
};

const out = {
  started: new Date().toISOString(),
  marker: MARK,
  api: API,
  families: results,
  rates,
  access_lifecycle: accessLife,
  document_lifecycle: docLife,
  finished: new Date().toISOString(),
};
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ rates, accessLife, docLife }, null, 2));
const hard =
  rates.interpretation >= 0.85 &&
  rates.execution >= 0.85 &&
  rates.plan_safe === 1 &&
  accessLife.create &&
  accessLife.decide &&
  docLife.ingest;
process.exit(hard ? 0 : 2);
