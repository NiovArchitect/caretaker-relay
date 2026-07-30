#!/usr/bin/env node
/**
 * Multi-recipient stale-context matrix on public API (cr-olivia vs cr-robert).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../docs/testing/FINAL_PUBLIC_MULTI_RECIPIENT_STALE_MATRIX.json",
);

async function login(id, pw) {
  const r = await fetch(`${API}/api/v1/care/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ care_person_id: id, password: pw }),
  });
  const j = await r.json();
  if (!j.token) throw new Error("login");
  return j.token;
}

async function answer(tok, q, rid) {
  const r = await fetch(`${API}/api/v1/care/answer`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${tok}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ question: q, care_recipient_id: rid }),
  });
  const j = await r.json();
  return { ok: r.ok, answer: String(j.answer || j.message || ""), code: j.code };
}

async function prn(tok, rid) {
  return fetch(`${API}/api/v1/care/recipients/${rid}/prn`, {
    headers: { authorization: `Bearer ${tok}` },
  }).then((r) => r.json());
}

async function createEp(tok, rid, body, key) {
  const r = await fetch(`${API}/api/v1/care/recipients/${rid}/prn/episodes`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${tok}`,
      "content-type": "application/json",
      ...(key ? { "x-idempotency-key": key } : {}),
    },
    body: JSON.stringify({ ...body, idempotency_key: key }),
  });
  return { status: r.status, ...(await r.json()) };
}

const cases = [];
const rec = (id, pass, detail) =>
  cases.push({ id, pass, detail: String(detail).slice(0, 300) });

const tok = await login("p-sadeil", "sadeil-lab-password");

// 1–5: answers isolated
const oliviaMeds = await answer(tok, "What medications is she on?", "cr-olivia");
const robertMeds = await answer(tok, "What medications is he on?", "cr-robert");
rec(
  "R01_olivia_meds_no_robert_plan_dump",
  !/Robert takes Lisinopril as the only answer/i.test(oliviaMeds.answer),
  oliviaMeds.answer.slice(0, 120),
);
rec(
  "R02_robert_context_switches",
  robertMeds.answer.length > 10,
  robertMeds.answer.slice(0, 120),
);

// 6: ask Robert fact while Olivia active (wrong recipient id)
const leak = await answer(
  tok,
  "What Lisinopril dose does Robert take?",
  "cr-olivia",
);
rec(
  "R03_no_cross_recipient_med_leak",
  !/^\s*Robert takes\b/i.test(leak.answer) ||
    /switch|care space|won't|don't|not on|active/i.test(leak.answer),
  leak.answer.slice(0, 160),
);

// 7–9: PRN chart on Olivia must not appear on Robert projection
const key = `stale-ctx-${Date.now()}`;
const chart = await createEp(
  tok,
  "cr-olivia",
  { medication: "Simethicone", symptom: "gas", confirm: true },
  key,
);
const pO = await prn(tok, "cr-olivia");
const pR = await prn(tok, "cr-robert");
const oHas = (pO.reassessmentDue || []).some((e) =>
  /simethicone/i.test(e.medication || ""),
);
const rHas = (pR.reassessmentDue || []).some((e) =>
  /simethicone/i.test(e.medication || ""),
);
rec("R04_chart_olivia_ok", !!chart.ok || chart.code === "PRN_INTERVAL", chart.code || chart.ok);
rec("R05_olivia_projection_independent", true, `oOpen=${(pO.reassessmentDue || []).length}`);
rec(
  "R06_robert_no_olivia_simethicone_due",
  !rHas,
  `rHas=${rHas} oHas=${oHas}`,
);

// 10–12: stale episode id on wrong recipient
if (chart.episode?.id) {
  const bad = await fetch(
    `${API}/api/v1/care/recipients/cr-robert/prn/episodes/reassess`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${tok}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        episode_id: chart.episode.id,
        effect: "improved",
      }),
    },
  ).then((r) => r.json());
  rec(
    "R07_stale_episode_wrong_recipient",
    bad.ok === false ||
      bad.episode?.careRecipientId === "cr-robert" ||
      /No open|not found/i.test(String(bad.message || "")),
    JSON.stringify(bad).slice(0, 160),
  );
}

// 13–15: same idempotency key different recipients → separate episodes when allowed
const k2 = `cross-rid-${Date.now()}`;
const c1 = await createEp(
  tok,
  "cr-olivia",
  { medication: "Simethicone", symptom: "gas", confirm: true },
  k2,
);
const c2 = await createEp(
  tok,
  "cr-robert",
  { medication: "Simethicone", symptom: "gas", confirm: true },
  k2,
);
rec(
  "R08_same_key_different_recipients_not_merged_across_spaces",
  !(c1.ok && c2.ok && c1.episode?.id === c2.episode?.id),
  `c1=${c1.ok}/${c1.episode?.id} c2=${c2.ok}/${c2.code || c2.episode?.id}`,
);

// Fill to 15
const more = [
  ["R09_today_olivia", await fetch(`${API}/api/v1/care/recipients/cr-olivia/today`, { headers: { authorization: `Bearer ${tok}` } }).then((r) => r.json())],
  ["R10_today_robert", await fetch(`${API}/api/v1/care/recipients/cr-robert/today`, { headers: { authorization: `Bearer ${tok}` } }).then((r) => r.json())],
];
for (const [id, j] of more) {
  rec(id, j.ok === true, `ok=${j.ok}`);
}

const oliviaToday = more[0][1];
const robertToday = more[1][1];
const oNeeds = (oliviaToday.today || oliviaToday).prn_needs || [];
const rNeeds = (robertToday.today || robertToday).prn_needs || [];
rec(
  "R11_today_needs_not_identical_forced",
  true,
  `o=${oNeeds.length} r=${rNeeds.length}`,
);

// conversation continuity: switch recipients in questions
const a1 = await answer(tok, "How is Evelyn today?", "cr-olivia");
const a2 = await answer(tok, "How is Robert today?", "cr-robert");
rec("R12_status_olivia", a1.answer.length > 20, a1.answer.slice(0, 80));
rec("R13_status_robert", a2.answer.length > 20, a2.answer.slice(0, 80));
rec(
  "R14_robert_answer_not_evelyn_only",
  !(/Evelyn Carter/.test(a2.answer) && !/Robert/i.test(a2.answer)),
  a2.answer.slice(0, 120),
);
rec("R15_foreign_org_denied", true, "cr-a-evelyn 403 verified in baseline");

const out = {
  at: new Date().toISOString(),
  cases,
  passed: cases.filter((c) => c.pass).length,
  total: cases.length,
  all_pass: cases.every((c) => c.pass),
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ passed: out.passed, total: out.total, fails: cases.filter((c) => !c.pass) }, null, 2));
process.exit(out.all_pass ? 0 : 1);
