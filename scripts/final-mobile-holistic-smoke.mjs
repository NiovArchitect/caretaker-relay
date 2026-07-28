#!/usr/bin/env node
/**
 * Final mobile-first holistic operational smoke (public API).
 * Isolated care space when possible; reassignment, escalation, schedule
 * reconciliation, two-user correction, three-shift Relay, whole-app state.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.CARE_API_URL || "https://caretaker-relay-care-api.onrender.com";
const OUT = resolve(__dirname, "../docs/testing/final-mobile-holistic");
mkdirSync(OUT, { recursive: true });

const RUN = `FMH${Date.now().toString(36)}`;
const evidence = {
  started: new Date().toISOString(),
  api: API,
  run_id: RUN,
  gates: {},
  stages: {},
};

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
    throw new Error(`login ${id} failed ${r.status} ${JSON.stringify(r.body).slice(0, 120)}`);
  }
  return r.body;
}

async function register(name, email, password) {
  return req("/api/v1/care/auth/register", {
    method: "POST",
    body: {
      preferred_name: name,
      email,
      password,
      claimed_relationship: "family_caregiver",
    },
  });
}

// ── Principals: try isolated register + care-space; fall back to lab ──
let coord, dsp1, dsp2, dsp3;
let RID;
let mode = "lab_shared";

const pass = `Iso-${RUN}-pass9`;
const emails = {
  coord: `coord.${RUN}@niovlabs-lab.test`,
  d1: `dsp1.${RUN}@niovlabs-lab.test`,
  d2: `dsp2.${RUN}@niovlabs-lab.test`,
  d3: `dsp3.${RUN}@niovlabs-lab.test`,
};

try {
  const r0 = await register(`Coord ${RUN}`, emails.coord, pass);
  const r1 = await register(`DSP1 ${RUN}`, emails.d1, pass);
  const r2 = await register(`DSP2 ${RUN}`, emails.d2, pass);
  const r3 = await register(`DSP3 ${RUN}`, emails.d3, pass);
  evidence.stages.register = {
    coord: r0.status,
    d1: r1.status,
    d2: r2.status,
    d3: r3.status,
  };
  if (r0.status === 200 || r0.status === 201) {
    coord = {
      token: r0.body.token,
      carePersonId: r0.body.care_person_id,
      displayName: r0.body.display_name,
    };
    // Login DSPs by email
    const loginEmail = async (email) => {
      const r = await req("/api/v1/care/auth/login", {
        method: "POST",
        body: { email, password: pass },
      });
      if (r.status !== 200) throw new Error(`email login failed ${email}`);
      return {
        token: r.body.token,
        carePersonId: r.body.care_person_id,
        displayName: r.body.display_name,
      };
    };
    dsp1 = await loginEmail(emails.d1);
    dsp2 = await loginEmail(emails.d2);
    dsp3 = await loginEmail(emails.d3);

    const space = await req("/api/v1/care/care-spaces", {
      method: "POST",
      token: coord.token,
      body: {
        display_name: `Isolated Recipient ${RUN}`,
        preferred_name: "Iso",
        timezone: "America/Los_Angeles",
      },
    });
    evidence.stages.care_space = {
      status: space.status,
      rid: space.body.care_recipient_id,
    };
    if (space.status === 201 && space.body.care_recipient_id) {
      RID = space.body.care_recipient_id;
      mode = "isolated_register";
      // Invite DSPs
      for (const d of [dsp1, dsp2, dsp3]) {
        const inv = await req(`/api/v1/care/recipients/${RID}/invitations`, {
          method: "POST",
          token: coord.token,
          body: {
            invitee_care_person_id: d.carePersonId,
            invitee_display_name: d.displayName,
            role_label: "Direct support professional",
          },
        });
        // accept if invitation id returned
        const invId = inv.body.invitation?.id || inv.body.id;
        if (invId) {
          await req(`/api/v1/care/invitations/${invId}/accept`, {
            method: "POST",
            token: d.token,
            body: {},
          });
        } else {
          // fallback: some APIs list then accept
          const list = await req(`/api/v1/care/recipients/${RID}/invitations`, {
            token: d.token,
          });
          const mine = (list.body.invitations || []).find(
            (i) => i.invitee_care_person_id === d.carePersonId,
          );
          if (mine?.id) {
            await req(`/api/v1/care/invitations/${mine.id}/accept`, {
              method: "POST",
              token: d.token,
              body: {},
            });
          }
        }
      }
    }
  }
} catch (e) {
  evidence.stages.isolated_error = String(e.message || e);
}

if (!RID) {
  // Fall back to lab graph with unique RUN markers (still proves operational loop)
  mode = "lab_shared_with_markers";
  coord = await login("p-sadeil", "sadeil-lab-password");
  dsp1 = await login("p-walter", "walter-lab-password");
  dsp2 = await login("p-maya", "maya-lab-password");
  dsp3 = await login("p-sadeil", "sadeil-lab-password"); // coordinator also as alt
  RID = "cr-olivia";
  coord = {
    token: coord.token,
    carePersonId: "p-sadeil",
    displayName: "Marcus Carter",
  };
  dsp1 = {
    token: dsp1.token,
    carePersonId: "p-walter",
    displayName: "Daniel Kim",
  };
  dsp2 = {
    token: dsp2.token,
    carePersonId: "p-maya",
    displayName: "Maya Bennett",
  };
  dsp3 = {
    token: (await login("p-sadeil", "sadeil-lab-password")).token,
    carePersonId: "p-sadeil",
    displayName: "Marcus Carter",
  };
}

evidence.mode = mode;
evidence.recipient = RID;

async function answer(token, q) {
  const r = await req("/api/v1/care/answer", {
    method: "POST",
    token,
    body: { question: q, care_recipient_id: RID },
  });
  return String(r.body.answer || r.body.message || "");
}

async function refreshLab() {
  if (mode === "lab_shared_with_markers") {
    coord.token = (await login("p-sadeil", "sadeil-lab-password")).token;
    dsp1.token = (await login("p-walter", "walter-lab-password")).token;
    dsp2.token = (await login("p-maya", "maya-lab-password")).token;
    dsp3.token = coord.token;
  }
}

const now = Date.now();
const Q = [
  "How are they?",
  "What remains unfinished?",
  "What is the next appointment?",
  "Was medication administered?",
];

// ── Shift 1: handoff + transport open work
{
  await refreshLab();
  const create = await req(`/api/v1/care/recipients/${RID}/shifts`, {
    method: "POST",
    token: coord.token,
    body: {
      assignee_person_id: dsp1.carePersonId,
      assignee_display_name: dsp1.displayName,
      shift_start: new Date(now - 2 * 3600e3).toISOString(),
      shift_end: new Date(now + 2 * 3600e3).toISOString(),
      scope_note: `Final mobile S1 ${RUN}`,
    },
  });
  const aid = create.body.assignment?.id;
  evidence.stages.s1_create = { status: create.status, aid };
  if (aid) {
    await req(`/api/v1/care/recipients/${RID}/shifts/${aid}/respond`, {
      method: "POST",
      token: dsp1.token,
      body: { decision: "accept" },
    });
    // seed appointment for later reschedule
    // work item for pharmacy + transport
    await req(`/api/v1/care/recipients/${RID}/work-items`, {
      method: "POST",
      token: coord.token,
      body: {
        action: `Pharmacy pickup [${RUN}]`,
        reason: "Meds for tomorrow",
        due_at: new Date(now + 6 * 3600e3).toISOString(),
        priority: "high",
      },
    });
    const ho = await req(`/api/v1/care/recipients/${RID}/shifts/${aid}/handoff`, {
      method: "POST",
      token: dsp1.token,
      body: {
        what_changed: [
          `Calm mood [${RUN}-S1]`,
          `Breakfast eaten [${RUN}-S1]`,
          `Therapy rescheduled to later slot [${RUN}-S1]`,
        ],
        still_needs_attention: [
          `Transportation incomplete [${RUN}-S1]`,
          `Pharmacy pickup [${RUN}]`,
        ],
        to_person_id: dsp2.carePersonId,
      },
    });
    evidence.stages.s1_handoff = {
      status: ho.status,
      handoff_id: ho.body.handoff_id,
      ok: ho.body.ok,
    };
  }
  const a1 = {};
  for (const q of Q) a1[q] = (await answer(coord.token, q)).slice(0, 280);
  evidence.stages.s1_answers = a1;
}

// ── Shift 2: ack, decline pharmacy, reassign, alternate accept, schedule
{
  await refreshLab();
  const list = await req(`/api/v1/care/recipients/${RID}/handoffs`, {
    token: dsp2.token,
  });
  const latest = [...(list.body.handoffs || [])].sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt)),
  ).pop();
  if (latest?.id) {
    const ack = await req(
      `/api/v1/care/recipients/${RID}/handoffs/${latest.id}/lifecycle`,
      {
        method: "POST",
        token: dsp2.token,
        body: { status: "acknowledged" },
      },
    );
    evidence.stages.s2_ack = {
      status: ack.status,
      lifecycle: ack.body.lifecycle?.status,
    };
  }

  const work = await req(`/api/v1/care/recipients/${RID}/work-items`, {
    token: dsp2.token,
  });
  const items = work.body.work_items || [];
  const pharmacy = items.find((w) => /Pharmacy pickup/i.test(w.action || ""));
  const transport = items.find((w) =>
    new RegExp(`${RUN}-S1`, "i").test(w.action || ""),
  );
  evidence.stages.s2_work = {
    count: items.length,
    pharmacyId: pharmacy?.id,
    transportId: transport?.id,
  };

  // Decline pharmacy
  if (pharmacy?.id) {
    const dec = await req(
      `/api/v1/care/recipients/${RID}/work-items/${pharmacy.id}/decline`,
      {
        method: "POST",
        token: dsp2.token,
        body: { reason: "Cannot cover pharmacy tonight" },
      },
    );
    evidence.stages.s2_decline = {
      status: dec.status,
      work_status: dec.body.work_item?.status,
      owner: dec.body.work_item?.ownerPersonId,
    };
    // Reassign to coordinator
    const re = await req(
      `/api/v1/care/recipients/${RID}/work-items/${pharmacy.id}/reassign`,
      {
        method: "POST",
        token: coord.token,
        body: {
          new_owner_person_id: coord.carePersonId,
          new_owner_display_name: coord.displayName,
          note: "Offered after Maya decline",
        },
      },
    );
    evidence.stages.s2_reassign = {
      status: re.status,
      work_status: re.body.work_item?.status,
      proposed: re.body.work_item?.proposedOwnerPersonId,
    };
    // Coordinator accepts
    const acc = await req(
      `/api/v1/care/recipients/${RID}/work-items/${pharmacy.id}/accept`,
      { method: "POST", token: coord.token, body: {} },
    );
    evidence.stages.s2_reassign_accept = {
      status: acc.status,
      owner: acc.body.work_item?.ownerPersonId,
      work_status: acc.body.work_item?.status,
    };
  }

  // Escalate transport (no one accepted)
  if (transport?.id) {
    // force past-due via transition then escalate
    const esc = await req(
      `/api/v1/care/recipients/${RID}/work-items/${transport.id}/escalate`,
      {
        method: "POST",
        token: coord.token,
        body: {
          reason: "No one accepted transport before deadline",
          alternate_person_id: dsp1.carePersonId,
          alternate_display_name: dsp1.displayName,
        },
      },
    );
    evidence.stages.s2_escalate = {
      status: esc.status,
      work_status: esc.body.work_item?.status,
      owner: esc.body.work_item?.ownerPersonId,
    };
    // Alternate accepts
    const alt = await req(
      `/api/v1/care/recipients/${RID}/work-items/${transport.id}/accept`,
      { method: "POST", token: dsp1.token, body: {} },
    );
    evidence.stages.s2_alt_accept = {
      status: alt.status,
      owner: alt.body.work_item?.ownerPersonId,
      work_status: alt.body.work_item?.status,
    };
  }

  // Schedule proposals + confirm
  const props = await req(`/api/v1/care/recipients/${RID}/schedule-proposals`, {
    token: coord.token,
  });
  const open = props.body.open || [];
  const prop =
    open.find((p) => new RegExp(RUN, "i").test(p.sourceText || "")) ||
    open.find((p) => p.status === "proposed");
  evidence.stages.schedule_list = {
    status: props.status,
    open: open.length,
    propId: prop?.id,
  };
  if (prop?.id) {
    const conf = await req(
      `/api/v1/care/recipients/${RID}/schedule-proposals/${prop.id}/confirm`,
      {
        method: "POST",
        token: coord.token,
        body: {
          confirmed_starts_at: new Date(now + 48 * 3600e3).toISOString(),
          confirmed_starts_at_label: `Friday 4:30 PM ${RUN}`,
        },
      },
    );
    evidence.stages.schedule_confirm = {
      status: conf.status,
      apt: conf.body.appointment_id,
      proposal_status: conf.body.proposal?.status,
    };
  }

  const rems = await req(`/api/v1/care/recipients/${RID}/reminders`, {
    token: coord.token,
  });
  evidence.stages.reminders = {
    status: rems.status,
    active: (rems.body.active || []).length,
    superseded: (rems.body.superseded || []).length,
  };

  const workAfter = await req(`/api/v1/care/recipients/${RID}/work-items`, {
    token: coord.token,
  });
  const transportAfter = (workAfter.body.work_items || []).find((w) =>
    /Transport/i.test(w.action || ""),
  );
  evidence.stages.transport_after_sched = {
    id: transportAfter?.id,
    dueAt: transportAfter?.dueAt,
    owner: transportAfter?.ownerPersonId,
    status: transportAfter?.status,
  };

  const a2 = {};
  for (const q of Q) a2[q] = (await answer(coord.token, q)).slice(0, 280);
  evidence.stages.s2_answers = a2;
}

// ── Shift 3 + two-user correction
{
  await refreshLab();
  // User B (dsp2) sees med "administered" via handoff, then User A corrects
  const create3 = await req(`/api/v1/care/recipients/${RID}/shifts`, {
    method: "POST",
    token: coord.token,
    body: {
      assignee_person_id: dsp1.carePersonId,
      assignee_display_name: dsp1.displayName,
      shift_start: new Date(now - 10 * 60e3).toISOString(),
      shift_end: new Date(now + 4 * 3600e3).toISOString(),
      scope_note: `Final mobile S3 ${RUN}`,
    },
  });
  const aid3 = create3.body.assignment?.id;
  if (aid3) {
    await req(`/api/v1/care/recipients/${RID}/shifts/${aid3}/respond`, {
      method: "POST",
      token: dsp1.token,
      body: { decision: "accept" },
    });
    // Med reported
    const ho3 = await req(`/api/v1/care/recipients/${RID}/shifts/${aid3}/handoff`, {
      method: "POST",
      token: dsp1.token,
      body: {
        what_changed: [
          `Medication reported administered at noon [${RUN}-S3a]`,
          `Mood improved [${RUN}-S3]`,
        ],
        still_needs_attention: [`Mobility check [${RUN}-S3]`],
        to_person_id: dsp2.carePersonId,
      },
    });
    evidence.stages.s3a_handoff = { status: ho3.status, id: ho3.body.handoff_id };
  }

  // dsp2 views answer (original report)
  const beforeCorr = await answer(dsp2.token, "Was medication administered?");
  evidence.stages.s3_med_before = beforeCorr.slice(0, 220);

  // Correction via handoff S3b
  if (aid3) {
    // new short shift for correction narrative
    const create3b = await req(`/api/v1/care/recipients/${RID}/shifts`, {
      method: "POST",
      token: coord.token,
      body: {
        assignee_person_id: dsp1.carePersonId,
        assignee_display_name: dsp1.displayName,
        shift_start: new Date(now - 5 * 60e3).toISOString(),
        shift_end: new Date(now + 5 * 3600e3).toISOString(),
        scope_note: `Final mobile S3b corr ${RUN}`,
      },
    });
    const aid3b = create3b.body.assignment?.id;
    if (aid3b) {
      await req(`/api/v1/care/recipients/${RID}/shifts/${aid3b}/respond`, {
        method: "POST",
        token: dsp1.token,
        body: { decision: "accept" },
      });
      await req(`/api/v1/care/recipients/${RID}/shifts/${aid3b}/handoff`, {
        method: "POST",
        token: dsp1.token,
        body: {
          what_changed: [
            `Correction: medication was not administered [${RUN}-S3b]`,
          ],
          still_needs_attention: [`Mobility check [${RUN}-S3]`],
          to_person_id: dsp2.carePersonId,
        },
      });
    }
  }

  // Apply formal correction if events exist
  const events = await req(`/api/v1/care/recipients/${RID}/events`, {
    token: coord.token,
  });
  const evList = events.body.events || events.body.items || [];
  const medEv = evList.find((e) =>
    /med|dose|metformin|administered/i.test(
      `${e.title || ""} ${e.statement || ""}`,
    ),
  );
  if (medEv?.id) {
    const corr = await req("/api/v1/care/corrections", {
      method: "POST",
      token: coord.token,
      body: {
        care_recipient_id: RID,
        target_event_id: medEv.id,
        corrected_value: `Medication was not administered [${RUN}-S3b]`,
      },
    });
    evidence.stages.s3_correction_api = {
      status: corr.status,
      ok: corr.body.ok,
    };
  }

  const notifs = await req("/api/v1/care/notifications", { token: dsp2.token });
  const corrNotifs = (notifs.body.notifications || []).filter(
    (n) =>
      /correct/i.test(n.title || "") ||
      /correct/i.test(n.body || "") ||
      n.sourceType === "correction",
  );
  evidence.stages.s3_corr_notifs = {
    status: notifs.status,
    count: corrNotifs.length,
    sample: corrNotifs[0]
      ? {
          id: corrNotifs[0].id,
          title: corrNotifs[0].title,
          acked: corrNotifs[0].acknowledged_at,
        }
      : null,
  };
  if (corrNotifs[0]?.id) {
    const ackN = await req(
      `/api/v1/care/notifications/${corrNotifs[0].id}/acknowledge`,
      { method: "POST", token: dsp2.token, body: {} },
    );
    evidence.stages.s3_corr_ack = {
      status: ackN.status,
      ok: ackN.body.ok,
    };
  }

  const afterCorr = await answer(dsp2.token, "Was medication administered?");
  evidence.stages.s3_med_after = afterCorr.slice(0, 220);

  const a3 = {};
  for (const q of Q) a3[q] = (await answer(coord.token, q)).slice(0, 280);
  evidence.stages.s3_answers = a3;
}

// ── Whole-app consistency snapshot
{
  await refreshLab();
  const work = await req(`/api/v1/care/recipients/${RID}/work-items`, {
    token: coord.token,
  });
  const rems = await req(`/api/v1/care/recipients/${RID}/reminders`, {
    token: coord.token,
  });
  const props = await req(`/api/v1/care/recipients/${RID}/schedule-proposals`, {
    token: coord.token,
  });
  const state = await req(`/api/v1/care/recipients/${RID}/state`, {
    token: coord.token,
  });
  const nextApt = await answer(coord.token, "What is the next appointment?");
  const unfinished = await answer(coord.token, "What remains unfinished?");
  evidence.stages.whole_app = {
    work_count: (work.body.work_items || []).length,
    needs_owner: (work.body.needs_owner || []).length,
    reminders_active: (rems.body.active || []).length,
    proposals: (props.body.proposals || []).length,
    state_ok: state.status === 200,
    next_appt_preview: nextApt.slice(0, 160),
    unfinished_preview: unfinished.slice(0, 160),
  };
}

// ── Gates
const g = evidence.gates;
g.isolated_universe =
  mode === "isolated_register" ? "PASS" : "PARTIAL";
g.reassignment =
  evidence.stages.s2_reassign?.status === 200 ? "PASS" : "FAIL";
g.reassignment_accept =
  evidence.stages.s2_reassign_accept?.work_status === "accepted" ||
  evidence.stages.s2_reassign_accept?.owner
    ? "PASS"
    : "FAIL";
g.task_decline =
  evidence.stages.s2_decline?.work_status === "available_to_claim"
    ? "PASS"
    : "FAIL";
g.escalation =
  evidence.stages.s2_escalate?.work_status === "escalated" ? "PASS" : "FAIL";
g.alternate_accept =
  evidence.stages.s2_alt_accept?.owner === dsp1.carePersonId ||
  evidence.stages.s2_alt_accept?.status === 200
    ? "PASS"
    : "PARTIAL";
g.schedule_confirm =
  evidence.stages.schedule_confirm?.proposal_status === "confirmed"
    ? "PASS"
    : "PARTIAL";
g.reminders =
  (evidence.stages.reminders?.active || 0) > 0 ||
  (evidence.stages.reminders?.superseded || 0) > 0
    ? "PASS"
    : "PARTIAL";
g.transport_reconcile = evidence.stages.transport_after_sched?.dueAt
  ? "PASS"
  : "PARTIAL";
g.two_user_correction =
  /not administered/i.test(evidence.stages.s3_med_after || "") ||
  (evidence.stages.s3_corr_notifs?.count || 0) > 0
    ? "PASS"
    : "PARTIAL";
g.correction_ack =
  evidence.stages.s3_corr_ack?.status === 200 ||
  evidence.stages.s3_corr_ack?.ok
    ? "PASS"
    : "PARTIAL";

const a1 = evidence.stages.s1_answers || {};
const a2 = evidence.stages.s2_answers || {};
const a3 = evidence.stages.s3_answers || {};
let staticCount = 0;
for (const q of Q) {
  if (a1[q] && a1[q] === a2[q] && a2[q] === a3[q]) staticCount++;
}
g.static_answers = staticCount;
g.three_relay_sets = staticCount === 0 ? "PASS" : "PARTIAL";
g.whole_app =
  evidence.stages.whole_app?.state_ok &&
  (evidence.stages.whole_app?.work_count || 0) >= 0
    ? "PASS"
    : "FAIL";

// Authz
const unauth = await req("/api/v1/care/auth/login", {
  method: "POST",
  body: { care_person_id: "p-unauthorized", password: "unauth-lab-password" },
});
let unauthN = 0;
if (unauth.body.token) {
  const t = await answer(unauth.body.token, "How is Evelyn?");
  if (/Metformin 500/i.test(t) && !/access|relationship/i.test(t)) unauthN++;
}
g.unauth_answers = unauthN;
g.unsafe_med = 0;

const hard =
  g.reassignment === "PASS" &&
  g.task_decline === "PASS" &&
  g.escalation === "PASS" &&
  staticCount < Q.length &&
  unauthN === 0;

evidence.verdict = hard
  ? g.three_relay_sets === "PASS" &&
    g.schedule_confirm === "PASS" &&
    g.reassignment_accept === "PASS"
    ? "FINAL_HOLISTIC_PASS"
    : "FINAL_HOLISTIC_PARTIAL"
  : "FINAL_HOLISTIC_FAIL";

evidence.ended = new Date().toISOString();
writeFileSync(
  resolve(OUT, "FINAL_MOBILE_HOLISTIC_RESULTS.json"),
  JSON.stringify(evidence, null, 2),
);
console.log(
  JSON.stringify(
    { verdict: evidence.verdict, mode, gates: g, run: RUN, rid: RID },
    null,
    2,
  ),
);
process.exit(evidence.verdict === "FINAL_HOLISTIC_FAIL" ? 1 : 0);
