/**
 * Rate-aware final-state reliability harness.
 *
 * Target: N logical care ops → N known final states.
 * Zero silent loss. Zero duplicate durable effects under retry.
 *
 * Uses bounded concurrency, exponential backoff+jitter, finite retry budget.
 * Does NOT demand all 50 fire simultaneously with 200.
 */
const API =
  process.env.CARE_API_URL ||
  "https://caretaker-relay-care-api.onrender.com";

const results = [];
function assert(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail: String(detail).slice(0, 200) });
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function backoffMs(attempt, retryAfterSec) {
  if (retryAfterSec != null && Number.isFinite(retryAfterSec)) {
    return Math.max(0, retryAfterSec * 1000) + Math.floor(Math.random() * 200);
  }
  const base = Math.min(8000, 200 * Math.pow(2, attempt));
  return base + Math.floor(Math.random() * 150);
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return out;
}

async function coordWrite(token, op) {
  const maxAttempts = 5;
  let last = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const t0 = Date.now();
    try {
      const res = await fetch(
        `${API}/api/v1/care/recipients/cr-olivia/coordination`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
            "x-idempotency-key": op.idem,
            "x-request-id": `fs-${op.i}-a${attempt}`,
          },
          body: JSON.stringify({
            body: op.body,
            to_person_id: "p-sadeil",
            idempotency_key: op.idem,
          }),
        },
      );
      const retryAfter = res.headers.get("retry-after");
      const body = await res.json().catch(() => ({}));
      last = {
        status: res.status,
        ok: res.ok,
        ms: Date.now() - t0,
        attempt: attempt + 1,
        code: body.code || null,
        message: String(body.message || "").slice(0, 100),
        messageId: body.message?.id || null,
        notificationId: body.notification?.id || null,
        replay: !!body.idempotent_replay,
        retryAfter,
      };
      if (res.ok) return { ...last, final: "COMMITTED" };
      // Retry transient classes only
      const transient =
        res.status === 429 ||
        res.status === 503 ||
        res.status === 502 ||
        res.status === 500 ||
        res.status === 408;
      if (!transient) return { ...last, final: "FAILED_PERMANENT" };
      if (attempt < maxAttempts - 1) {
        const ra = retryAfter ? Number(retryAfter) : null;
        await sleep(backoffMs(attempt, Number.isFinite(ra) ? ra : null));
      }
    } catch (e) {
      last = {
        status: 0,
        ok: false,
        ms: Date.now() - t0,
        attempt: attempt + 1,
        message: String(e?.message || e).slice(0, 100),
      };
      if (attempt < maxAttempts - 1) await sleep(backoffMs(attempt, null));
    }
  }
  return { ...last, final: "FAILED_BUDGET" };
}

async function runBatch(token, n, concurrency, label) {
  const ops = Array.from({ length: n }, (_, i) => ({
    i,
    idem: `${label}-${Date.now()}-${i}`,
    body: `Final-state ${label} op ${i} @ ${Date.now()}`,
  }));
  const rows = await mapPool(ops, concurrency, (op) => coordWrite(token, op));
  const committed = rows.filter((r) => r.final === "COMMITTED");
  const failed = rows.filter((r) => r.final !== "COMMITTED");
  const msgIds = committed.map((r) => r.messageId).filter(Boolean);
  const uniqueMsg = new Set(msgIds);
  return {
    label,
    n,
    concurrency,
    committed: committed.length,
    failed: failed.length,
    silentUnknown: rows.filter((r) => !r.final).length,
    duplicates: msgIds.length - uniqueMsg.size,
    failSamples: failed.slice(0, 5),
    rows,
  };
}

async function main() {
  // ONE OpenAI probe only
  const health = await fetch(`${API}/api/v1/care/health`).then((r) => r.json());
  let openai = "UNKNOWN";
  {
    const tok = await login("p-sadeil", "sadeil-lab-password");
    const u = await fetch(`${API}/api/v1/care/understand`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${tok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: "Single OpenAI probe for rate-aware campaign.",
        care_recipient_id: "cr-olivia",
        mode: "llm",
      }),
    });
    const uj = await u.json().catch(() => ({}));
    const blob = JSON.stringify(uj);
    if (/429|quota|billing/i.test(blob)) openai = "BLOCKED_EXTERNAL_QUOTA";
    else if (/Model unavailable|provider failed/i.test(blob))
      openai = "BLOCKED_EXTERNAL_QUOTA";
    else if (u.ok && !/Model unavailable/i.test(blob)) openai = "PASS";
    else openai = "FAIL";
    console.log("OPENAI_PROBE", openai);
  }

  const daniel = await login("p-walter", "walter-lab-password");
  assert("login_daniel", !!daniel);

  // Bounded concurrency knee sample (not hammer)
  for (const c of [4, 8, 12]) {
    const b = await runBatch(daniel, 12, c, `knee-c${c}`);
    console.log(
      `KNEE c=${c} committed=${b.committed}/${b.n} fail=${b.failed} dups=${b.duplicates}`,
    );
  }

  const b50 = await runBatch(daniel, 50, 8, "final-50");
  assert(
    "50_all_committed",
    b50.committed === 50,
    `${b50.committed}/50 fail=${b50.failed} samples=${JSON.stringify(b50.failSamples).slice(0, 200)}`,
  );
  assert("50_zero_duplicates", b50.duplicates === 0, String(b50.duplicates));
  assert("50_zero_silent", b50.silentUnknown === 0);

  const b100 = await runBatch(daniel, 100, 8, "final-100");
  assert(
    "100_all_committed",
    b100.committed === 100,
    `${b100.committed}/100 fail=${b100.failed}`,
  );
  assert("100_zero_duplicates", b100.duplicates === 0, String(b100.duplicates));

  // Idempotency: same key twice → replay, one message id
  const idem = `idem-proof-${Date.now()}`;
  const a1 = await coordWrite(daniel, {
    i: 0,
    idem,
    body: `Idempotency proof body ${idem}`,
  });
  const a2 = await coordWrite(daniel, {
    i: 0,
    idem,
    body: `Idempotency proof body ${idem}`,
  });
  assert("idem_first_commit", a1.final === "COMMITTED", a1.status);
  assert(
    "idem_second_same_id",
    a2.final === "COMMITTED" && a1.messageId && a1.messageId === a2.messageId,
    `a1=${a1.messageId} a2=${a2.messageId} replay=${a2.replay}`,
  );

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(
    JSON.stringify(
      {
        openai,
        b50: {
          committed: b50.committed,
          failed: b50.failed,
          duplicates: b50.duplicates,
        },
        b100: {
          committed: b100.committed,
          failed: b100.failed,
          duplicates: b100.duplicates,
        },
        passed,
        total,
        results,
      },
      null,
      2,
    ),
  );
  console.log(`FINAL_STATE ${passed}/${total}`);
  if (passed < total) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
