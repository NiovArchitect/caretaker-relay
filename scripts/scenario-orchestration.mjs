/**
 * 10 full care orchestration scenario simulations against public API.
 * Not isolated asserts — end-to-end care coordination flows.
 */
const API =
  process.env.CARE_API_URL ||
  "https://caretaker-relay-care-api.onrender.com";

const results = [];
function scenario(name, fn) {
  return { name, fn };
}
function pass(name, detail = "") {
  results.push({ name, pass: true, detail: String(detail).slice(0, 180) });
  console.log("PASS", name, detail ? `— ${detail}` : "");
}
function fail(name, detail = "") {
  results.push({ name, pass: false, detail: String(detail).slice(0, 180) });
  console.log("FAIL", name, detail);
}

async function login(id, password) {
  let res = await fetch(`${API}/api/v1/care/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ care_person_id: id, password }),
  });
  let j = await res.json().catch(() => ({}));
  if (!res.ok) {
    res = await fetch(`${API}/api/v1/care/auth/lab-login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ care_person_id: id, password }),
    });
    j = await res.json().catch(() => ({}));
  }
  if (!res.ok) throw new Error(`login ${id} ${res.status}`);
  return j.token || j.access_token;
}

async function api(path, token, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body };
}

const scenarios = [
  scenario("S1_marcus_maya_full_loop", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    const maya = await login("p-maya", "maya-lab-password");
    const tag = Date.now();
    // Ask Relay about Maya admin
    const q = await api("/api/v1/care/answer", marcus, {
      method: "POST",
      body: {
        question: `When did Maya give the lunch Metformin yesterday? (scenario ${tag})`,
        care_recipient_id: "cr-olivia",
      },
    });
    if (!q.ok) throw new Error("answer failed");
    // Create clarification orchestration
    const clr = await api("/api/v1/care/clarifications", marcus, {
      method: "POST",
      body: {
        care_recipient_id: "cr-olivia",
        target_person_id: "p-maya",
        question: `Did you give Evelyn lunch Metformin yesterday? (s1-${tag})`,
        context_summary: "S1 full loop",
      },
    });
    if (!clr.ok || !clr.body.orchestration_id) {
      throw new Error(`clr ${clr.status} ${JSON.stringify(clr.body).slice(0, 200)}`);
    }
    const requestId = clr.body.request?.id;
    // Waiting-on
    const wait = await api("/api/v1/care/answer", marcus, {
      method: "POST",
      body: {
        question: "Are we still waiting on anyone?",
        care_recipient_id: "cr-olivia",
      },
    });
    if (!/Maya|Waiting|waiting/i.test(String(wait.body?.answer || ""))) {
      throw new Error(`waiting answer: ${wait.body?.answer}`);
    }
    // Maya responds
    const resp = await api("/api/v1/care/clarifications/respond", maya, {
      method: "POST",
      body: {
        request_id: requestId,
        care_recipient_id: "cr-olivia",
        body: "Yes, I gave it around 12:10 after she ate.",
      },
    });
    if (!resp.ok || !resp.body.candidate_id) {
      throw new Error(`respond ${resp.status} ${JSON.stringify(resp.body).slice(0, 200)}`);
    }
    if (resp.body.requires_verification !== true) {
      throw new Error("expected requires_verification");
    }
    // Confirm candidate
    const conf = await api(
      `/api/v1/care/orchestration/candidates/${resp.body.candidate_id}/action`,
      marcus,
      {
        method: "POST",
        body: {
          care_recipient_id: "cr-olivia",
          action: "confirm",
        },
      },
    );
    if (!conf.ok || !conf.body.mar_id) {
      throw new Error(`confirm ${conf.status} ${JSON.stringify(conf.body).slice(0, 200)}`);
    }
    // Follow-up answer should not re-offer ask
    const follow = await api("/api/v1/care/answer", marcus, {
      method: "POST",
      body: {
        question: "When did Maya give Evelyn's lunch medication?",
        care_recipient_id: "cr-olivia",
      },
    });
    if (!follow.ok) throw new Error("follow answer fail");
    if (/Want me to ask Maya/i.test(String(follow.body?.answer || ""))) {
      throw new Error("still offering ask after confirm");
    }
    if (!/Maya/i.test(String(follow.body?.answer || ""))) {
      throw new Error(`no Maya in answer: ${follow.body?.answer}`);
    }
  }),

  scenario("S2_dr_shah_full_loop", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    const shah = await login("p-dr-shah", "drshah-lab-password");
    const tag = Date.now();
    const offer = await api("/api/v1/care/answer", marcus, {
      method: "POST",
      body: {
        question: "Could the dizziness be related to her medication?",
        care_recipient_id: "cr-olivia",
      },
    });
    if (!/ask Dr\.?\s*Shah|Dr\. Priya Shah/i.test(String(offer.body?.answer || ""))) {
      throw new Error(`no provider offer: ${offer.body?.answer}`);
    }
    const clr = await api("/api/v1/care/clarifications", marcus, {
      method: "POST",
      body: {
        care_recipient_id: "cr-olivia",
        target_person_id: "p-dr-shah",
        question: `Could recent dizziness require medication review? (s2-${tag})`,
        context_summary:
          "Timeline: lunch med reported; dizziness when rising; no regimen change by Relay.",
      },
    });
    if (!clr.ok) throw new Error(`shah clr ${clr.status}`);
    // Shah sees notification
    const n = await api(
      "/api/v1/care/notifications?care_recipient_id=cr-olivia",
      shah,
    );
    const has = (n.body?.notifications || []).some(
      (x) =>
        x.type === "CLARIFICATION_REQUEST" ||
        /dizziness|medication review|Marcus/i.test(
          String(x.body || "") + String(x.title || ""),
        ),
    );
    if (!has) throw new Error("Dr Shah missing notification");
    const resp = await api("/api/v1/care/clarifications/respond", shah, {
      method: "POST",
      body: {
        request_id: clr.body.request.id,
        care_recipient_id: "cr-olivia",
        body: "Continue the current medication as prescribed. If dizziness persists or worsens, contact the clinic.",
      },
    });
    if (!resp.ok || !resp.body.candidate_id) {
      throw new Error(`shah resp ${resp.status}`);
    }
    // Marcus notified
    const mn = await api(
      "/api/v1/care/notifications?care_recipient_id=cr-olivia",
      marcus,
    );
    const marcusHas = (mn.body?.notifications || []).some((x) =>
      /Shah|guidance|replied/i.test(String(x.title || "") + String(x.body || "")),
    );
    if (!marcusHas) throw new Error("Marcus missing Shah reply notif");
    const conf = await api(
      `/api/v1/care/orchestration/candidates/${resp.body.candidate_id}/action`,
      marcus,
      {
        method: "POST",
        body: { care_recipient_id: "cr-olivia", action: "confirm" },
      },
    );
    if (!conf.ok || !conf.body.provider_guidance_id) {
      throw new Error(`provider confirm ${conf.status} ${JSON.stringify(conf.body)}`);
    }
  }),

  scenario("S3_no_auto_promote_mar", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    const maya = await login("p-maya", "maya-lab-password");
    const tag = Date.now();
    const clr = await api("/api/v1/care/clarifications", marcus, {
      method: "POST",
      body: {
        care_recipient_id: "cr-olivia",
        target_person_id: "p-maya",
        question: `Auto-promote probe ${tag}`,
      },
    });
    const resp = await api("/api/v1/care/clarifications/respond", maya, {
      method: "POST",
      body: {
        request_id: clr.body.request.id,
        care_recipient_id: "cr-olivia",
        body: "Yes I gave two tablets at lunch.",
      },
    });
    if (resp.body.requires_verification !== true) {
      throw new Error("must require verification");
    }
    // Do NOT confirm — state should need verification
    if (resp.body.orchestration_state !== "NEEDS_VERIFICATION") {
      throw new Error(`state ${resp.body.orchestration_state}`);
    }
  }),

  scenario("S4_daniel_coord_then_waiting", async () => {
    const daniel = await login("p-walter", "walter-lab-password");
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    const post = await api("/api/v1/care/recipients/cr-olivia/coordination", daniel, {
      method: "POST",
      body: {
        body: "Evelyn had brief dizziness after lunch. Documented for handoff.",
        to_person_id: "p-sadeil",
      },
    });
    if (!post.ok) throw new Error("coord fail");
    const n = await api(
      "/api/v1/care/notifications?care_recipient_id=cr-olivia",
      marcus,
    );
    if (!(n.body?.notifications || []).some((x) => x.type === "NEW_COORDINATION_MESSAGE")) {
      throw new Error("no daniel notif");
    }
  }),

  scenario("S5_open_loops_endpoint", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    // Ensure something open
    await api("/api/v1/care/clarifications", marcus, {
      method: "POST",
      body: {
        care_recipient_id: "cr-olivia",
        target_person_id: "p-maya",
        question: `Open loop probe ${Date.now()}`,
      },
    });
    const o = await api(
      "/api/v1/care/recipients/cr-olivia/orchestration",
      marcus,
    );
    if (!o.ok) throw new Error("orch list fail");
    if (!Array.isArray(o.body.open)) throw new Error("no open array");
  }),

  scenario("S6_reject_candidate", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    const maya = await login("p-maya", "maya-lab-password");
    const clr = await api("/api/v1/care/clarifications", marcus, {
      method: "POST",
      body: {
        care_recipient_id: "cr-olivia",
        target_person_id: "p-maya",
        question: `Reject probe ${Date.now()}`,
      },
    });
    const resp = await api("/api/v1/care/clarifications/respond", maya, {
      method: "POST",
      body: {
        request_id: clr.body.request.id,
        care_recipient_id: "cr-olivia",
        body: "Actually I am not sure.",
      },
    });
    const rej = await api(
      `/api/v1/care/orchestration/candidates/${resp.body.candidate_id}/action`,
      marcus,
      {
        method: "POST",
        body: {
          care_recipient_id: "cr-olivia",
          action: "reject",
          reason: "Insufficient certainty",
        },
      },
    );
    if (!rej.ok || rej.body.state !== "REJECTED") {
      throw new Error(`reject ${rej.status} ${JSON.stringify(rej.body)}`);
    }
  }),

  scenario("S7_robert_isolation_no_maya", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    // Asking Robert med should not leak Evelyn Metformin
    const a = await api("/api/v1/care/answer", marcus, {
      method: "POST",
      body: {
        question: "What medication is due next?",
        care_recipient_id: "cr-robert",
      },
    });
    if (/Metformin/i.test(String(a.body?.answer || ""))) {
      throw new Error("Evelyn med leak on Robert");
    }
    // Clarification to Maya for Robert should fail (not in circle)
    const clr = await api("/api/v1/care/clarifications", marcus, {
      method: "POST",
      body: {
        care_recipient_id: "cr-robert",
        target_person_id: "p-maya",
        question: "Did you give Robert meds?",
      },
    });
    if (clr.ok) throw new Error("Maya should not be valid target for Robert");
  }),

  scenario("S8_handoff_refresh_after_confirm", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    const maya = await login("p-maya", "maya-lab-password");
    const clr = await api("/api/v1/care/clarifications", marcus, {
      method: "POST",
      body: {
        care_recipient_id: "cr-olivia",
        target_person_id: "p-maya",
        question: `Handoff probe ${Date.now()}`,
      },
    });
    const resp = await api("/api/v1/care/clarifications/respond", maya, {
      method: "POST",
      body: {
        request_id: clr.body.request.id,
        care_recipient_id: "cr-olivia",
        body: "Yes, gave Metformin around noon after lunch.",
      },
    });
    const conf = await api(
      `/api/v1/care/orchestration/candidates/${resp.body.candidate_id}/action`,
      marcus,
      {
        method: "POST",
        body: { care_recipient_id: "cr-olivia", action: "confirm" },
      },
    );
    if (!conf.body.handoff_id) throw new Error("no handoff refresh");
  }),

  scenario("S9_lab_principals_include_shah", async () => {
    const res = await fetch(`${API}/api/v1/care/auth/lab-principals`);
    const j = await res.json();
    const ids = (j.principals || []).map((p) => p.care_person_id);
    if (!ids.includes("p-dr-shah")) throw new Error("Dr Shah not in lab principals");
    await login("p-dr-shah", "drshah-lab-password");
  }),

  scenario("S10_what_changed_after_orch", async () => {
    const marcus = await login("p-sadeil", "sadeil-lab-password");
    const a = await api("/api/v1/care/answer", marcus, {
      method: "POST",
      body: {
        question: "What changed?",
        care_recipient_id: "cr-olivia",
      },
    });
    if (!a.ok || !a.body?.answer) throw new Error("what changed failed");
  }),
];

async function main() {
  let i = 0;
  for (const s of scenarios) {
    i++;
    try {
      await s.fn();
      pass(s.name);
    } catch (e) {
      fail(s.name, e?.message || String(e));
    }
  }
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(JSON.stringify({ passed, total, results }, null, 2));
  console.log(`SCENARIOS ${passed}/${total}`);
  if (passed < total) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
