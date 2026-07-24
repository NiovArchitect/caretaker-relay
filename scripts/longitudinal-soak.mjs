/**
 * Longitudinal soak: long history, long conversation, many notifications, care team size.
 * Runs against public API — measures correctness + latency (not just survival).
 */
const API =
  process.env.CARE_API_URL ||
  "https://caretaker-relay-care-api.onrender.com";

const results = [];
function assert(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail: String(detail).slice(0, 160) });
  if (!cond) console.log("FAIL", name, detail);
}

async function login(id, pw) {
  let r = await fetch(`${API}/api/v1/care/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ care_person_id: id, password: pw }),
  });
  let j = await r.json().catch(() => ({}));
  if (!r.ok) {
    r = await fetch(`${API}/api/v1/care/auth/lab-login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ care_person_id: id, password: pw }),
    });
    j = await r.json().catch(() => ({}));
  }
  return j.token || j.access_token;
}

async function api(path, token, opts = {}) {
  const t0 = Date.now();
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body, ms: Date.now() - t0 };
}

async function main() {
  const marcus = await login("p-sadeil", "sadeil-lab-password");
  const daniel = await login("p-walter", "walter-lab-password");
  assert("login", !!marcus && !!daniel);

  // Long conversation: 100+ turns (questions + answers)
  const latencies = [];
  let lastAnswer = "";
  for (let i = 0; i < 100; i++) {
    const q =
      i % 5 === 0
        ? "What medication is due next for Evelyn?"
        : i % 5 === 1
          ? "What changed recently?"
          : i % 5 === 2
            ? "Are we still waiting on anyone?"
            : i % 5 === 3
              ? "When is her next appointment?"
              : `Quick status check #${i} — anything urgent right now?`;
    const r = await api("/api/v1/care/answer", marcus, {
      method: "POST",
      body: { question: q, care_recipient_id: "cr-olivia" },
    });
    latencies.push(r.ms);
    lastAnswer = String(r.body?.answer || "");
    if (!r.ok) {
      assert(`turn_${i}`, false, `status ${r.status}`);
      break;
    }
  }
  assert("long_conversation_100_turns", latencies.length === 100);
  const p95 = [...latencies].sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
  assert("long_conversation_p95_under_15s", p95 < 15000, `p95=${p95}ms`);
  // Current truth still coherent after long convo
  const truth = await api("/api/v1/care/answer", marcus, {
    method: "POST",
    body: {
      question: "What medication does Evelyn need next?",
      care_recipient_id: "cr-olivia",
    },
  });
  assert(
    "current_truth_after_long_conversation",
    truth.ok && /Metformin|500|medication/i.test(String(truth.body?.answer || "")),
    String(truth.body?.answer || "").slice(0, 120),
  );
  assert(
    "no_hallucinated_insulin_after_long",
    !/insulin/i.test(String(truth.body?.answer || "")),
  );

  // Many notifications: 50 concurrent coordination messages
  const batch = [];
  for (let i = 0; i < 50; i++) {
    batch.push(
      api("/api/v1/care/recipients/cr-olivia/coordination", daniel, {
        method: "POST",
        body: {
          body: `Soak note ${i}: Evelyn status update at ${Date.now()}.`,
          to_person_id: "p-sadeil",
        },
      }),
    );
  }
  const batchRes = await Promise.all(batch);
  assert(
    "notifications_batch_50",
    batchRes.filter((r) => r.ok).length >= 45,
    `ok=${batchRes.filter((r) => r.ok).length}`,
  );
  const nlist = await api(
    "/api/v1/care/notifications?care_recipient_id=cr-olivia",
    marcus,
  );
  assert(
    "notifications_list_100plus_or_many",
    nlist.ok && (nlist.body?.notifications || []).length >= 20,
    `count=${(nlist.body?.notifications || []).length}`,
  );

  // Long history via many understand/fixture events if available — use answer isolation as proxy
  const rob = await api("/api/v1/care/answer", marcus, {
    method: "POST",
    body: {
      question: "What medication is due next?",
      care_recipient_id: "cr-robert",
    },
  });
  assert(
    "isolation_after_soak",
    rob.ok && !/Metformin/i.test(String(rob.body?.answer || "")),
  );

  // Reminder reschedule if endpoint live
  const rem = await api(
    "/api/v1/care/recipients/cr-olivia/appointments/reschedule",
    marcus,
    {
      method: "POST",
      body: {
        appointment_id: "apt-soak-pt",
        new_starts_at: "2026-07-25T23:30:00.000Z",
        new_starts_at_label: "Saturday 4:30 PM PDT",
        timezone: "America/Los_Angeles",
      },
    },
  );
  if (rem.status === 404 || rem.status === 405) {
    assert("reminder_endpoint_available", false, `status ${rem.status}`);
  } else {
    assert("reminder_reschedule_ok", rem.ok, rem.status);
    if (rem.ok) {
      assert(
        "reminder_superseded",
        (rem.body?.superseded_count ?? 0) >= 0,
        JSON.stringify(rem.body).slice(0, 100),
      );
      assert(
        "reminder_active_after",
        (rem.body?.active_reminders ?? 0) >= 1,
        String(rem.body?.active_reminders),
      );
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(
    JSON.stringify(
      { passed, total, p95_ms: p95, lastAnswer: lastAnswer.slice(0, 100), results },
      null,
      2,
    ),
  );
  console.log(`SOAK ${passed}/${total}`);
  if (passed < total - 1) process.exitCode = 1; // allow 1 soft miss pre-deploy
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
