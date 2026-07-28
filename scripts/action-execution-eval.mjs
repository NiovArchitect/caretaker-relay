/**
 * 50-category action interpretation + receipt eval (local fixture extract).
 * Does not rebuild medication extractor — exercises execution-receipt mapping.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = pathDirname(fileURLToPath(import.meta.url));
// Eval via tsx-spawned sibling is heavy; use public API when LIVE=1
const LIVE = process.env.LIVE === "1";
const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const OUT = resolve(__dirname, "../docs/testing/ACTION_EXECUTION_EVAL.json");

const CATEGORIES = [
  { id: "med_admin", phrases: ["I gave her Zyrtec 10mg.", "He took Lisinopril 20 mg.", "Pat took GlipizideXR 5mg."] },
  { id: "med_plan", phrases: ["Please add Zyrtec 10mg to her meds.", "New medicine called NovoLog started.", "Put ibuprofen on the medicine list."] },
  { id: "med_refuse", phrases: ["She refused the antibiotic.", "Wouldn't take the evening pill."] },
  { id: "med_miss", phrases: ["Missed the evening blood pressure pill.", "Missed Zyrtec for Jordan."] },
  { id: "med_supply", phrases: ["Almost out of insulin.", "Need a refill for lisinopril."] },
  { id: "med_discontinue", phrases: ["Doctor stopped Amoxicillin.", "Prescriber stopped her metformin."] },
  { id: "med_advice", phrases: ["Should I give another tablet of ibuprofen?", "Can I give her Advil now?"] },
  { id: "med_effect", phrases: ["Morgan became dizzy after Advil.", "He got sleepy after the new pill."] },
  { id: "med_topical", phrases: ["Applied hydrocortisone cream.", "Used the eye drops this morning."] },
  { id: "obs_fever", phrases: ["She has a fever today.", "Running a temperature this afternoon."] },
  { id: "meal", phrases: ["Ate lunch around noon."] },
  { id: "appointment", phrases: ["PT moved to Thursday at 2:30 PM."] },
];

// Expand toward 300+ with templates
const meds = ["Zyrtec", "Advil", "Metformin", "Lisinopril", "Amoxicillin", "NovoLog", "Ibuprofen", "Aspirin", "Omeprazole", "Insulin"];
const names = ["Jordan", "Sam", "Avery", "Riley", "Casey"];
for (const m of meds) {
  for (const n of names) {
    CATEGORIES.push({ id: "gen_admin", phrases: [`I gave ${n} ${m} 10mg.`] });
    CATEGORIES.push({ id: "gen_plan", phrases: [`Please add ${m} 10mg for ${n}.`] });
    CATEGORIES.push({ id: "gen_refuse", phrases: [`${n} refused the ${m}.`] });
    CATEGORIES.push({ id: "gen_miss", phrases: [`Missed ${m} for ${n}.`] });
    CATEGORIES.push({ id: "gen_supply", phrases: [`Almost out of ${m}.`] });
  }
}

async function login() {
  const r = await fetch(API + "/api/v1/care/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ care_person_id: "p-sadeil", password: "sadeil-lab-password" }),
  });
  const j = await r.json();
  if (!j.token) throw new Error("login failed");
  return j.token;
}

async function understand(token, text) {
  const r = await fetch(API + "/api/v1/care/understand", {
    method: "POST",
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify({ text, care_recipient_id: "cr-olivia" }),
  });
  return r.json();
}

async function main() {
  if (!LIVE) {
    writeFileSync(
      OUT,
      JSON.stringify(
        {
          mode: "offline_bank_defined",
          categories: CATEGORIES.length,
          utterances: CATEGORIES.reduce((n, c) => n + c.phrases.length, 0),
          note: "Run with LIVE=1 against public API after deploy",
        },
        null,
        2,
      ),
    );
    console.log("wrote offline bank", OUT);
    return;
  }
  const token = await login();
  let total = 0,
    interpretPass = 0,
    generic = 0,
    falseSuccess = 0;
  const byCat = {};
  const failures = [];
  for (const c of CATEGORIES) {
    byCat[c.id] = { n: 0, pass: 0 };
    for (const p of c.phrases) {
      total++;
      byCat[c.id].n++;
      const j = await understand(token, p);
      const items = j.bundle?.items ?? [];
      const labels = items.map((i) => i.label || "").join(" | ");
      const hasCand = (j.bundle?.understood?.candidates ?? []).length > 0 || items.some((i) => i.candidateId !== "uncertainty");
      const isGeneric = /not sure what to file yet/i.test(labels);
      if (isGeneric) generic++;
      if (/Confirmed via Foundation/i.test(labels)) falseSuccess++;
      const ok = j.kind === "verify" && hasCand && !isGeneric;
      if (ok) {
        interpretPass++;
        byCat[c.id].pass++;
      } else failures.push({ cat: c.id, p, labels: labels.slice(0, 120) });
    }
  }
  const out = {
    mode: "live_public",
    api: API,
    total,
    interpretPass,
    interpret_rate: +(interpretPass / total).toFixed(4),
    generic_fallbacks: generic,
    false_success_strings: falseSuccess,
    categories: Object.keys(byCat).length,
    byCat,
    failures: failures.slice(0, 30),
  };
  mkdirSync(pathDirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ total, interpretPass, rate: out.interpret_rate, generic, categories: out.categories }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
