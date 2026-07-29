import { useEffect, useMemo, useState } from "react";
import {
  fetchCareState,
  fetchRecipientProfile,
  fetchCareHistory,
  proposeCareUpdate,
  confirmCareUpdateAsync,
  getSessionIdentity,
  type CareStateSnapshot,
  type RecipientProfilePayload,
} from "../foundation/careClient";
import {
  HIDDEN_TECHNICAL_KEYS,
  humanizeKey,
  isTechnicalIdValue,
  resolvePersonName,
  resolveRecipientName,
} from "../lib/identity";
import {
  careTypeLabel,
  certaintyLabel,
  formatCareDateTime,
  plainDiscrepancyMessage,
  priorityLabel,
} from "../lib/humanCopy";
import {
  clusterObservations,
  clusterSafetyReviews,
} from "../lib/observations";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import { MedicationCorrectionPanel } from "../components/MedicationCorrectionPanel";
import { IncomingHandoffInbox } from "../components/IncomingHandoffInbox";
import {
  listAppointmentsLineage,
  type AppointmentLineageRow,
} from "../foundation/careContinuity";
import { SYNTHETIC_FACILITIES } from "../lib/relay/projections";
import { CorrectionAwarenessPanel } from "../components/CorrectionAwarenessPanel";
import { ShiftWorkspacePage } from "./ShiftWorkspacePage";

type CareSection =
  | "about"
  | "history"
  | "medications"
  | "appointments"
  | "observations"
  | "events"
  | "reviews"
  | "shift";

const sections: { id: CareSection; label: string }[] = [
  { id: "about", label: "About" },
  { id: "shift", label: "My shift" },
  { id: "history", label: "History" },
  { id: "medications", label: "Medications" },
  { id: "appointments", label: "Appointments" },
  { id: "observations", label: "Observations" },
  { id: "reviews", label: "Open reviews" },
  { id: "events", label: "Recent events" },
];

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v !== null && v !== undefined && String(v).trim()) return String(v);
  }
  return "";
}

function DetailRows({
  item,
  recipientName,
}: {
  item: Record<string, unknown>;
  recipientName: string;
}) {
  const rows: Array<{ label: string; value: string }> = [];

  // Prefer structured medication + appointment fields
  const structured: Array<[string, string]> = [
    ["Name", pick(item, ["name", "title"])],
    ["Strength", pick(item, ["strength"])],
    ["Dose", pick(item, ["dose", "doseRecorded", "recordedDose"])],
    ["Route", pick(item, ["route"])],
    ["Take at", pick(item, ["scheduleTime", "nextDueLabel"])],
    [
      "Acceptable window",
      [pick(item, ["windowStart"]), pick(item, ["windowEnd"])]
        .filter(Boolean)
        .join(" – "),
    ],
    ["With food / meal", pick(item, ["mealRelation", "scheduleLabel"])],
    ["Special instructions", pick(item, ["specialInstructions"])],
    ["Authorized by", pick(item, ["authorizedBy"])],
    ["Effective", pick(item, ["authorizedAt", "authorizedAtLabel"])],
    [
      "Last recorded",
      formatCareDateTime(
        pick(item, ["lastAdministeredAt", "administeredAt", "occurredAt"]),
      ),
    ],
    [
      "Last given by",
      resolvePersonName(
        pick(item, ["lastAdministeredBy", "administeredByPersonId"]) ||
          undefined,
        pick(item, ["lastAdministeredByName"]) || undefined,
      ),
    ],
    [
      "When",
      formatCareDateTime(
        pick(item, [
          "startsAt",
          "startsAtLabel",
          "observedAt",
          "occurredAt",
          "createdAt",
        ]),
      ) || pick(item, ["startsAtLabel"]),
    ],
    ["Status", pick(item, ["status"])],
    ["Facility", pick(item, ["facility", "location"])],
    ["Address", pick(item, ["address"])],
    ["Phone", pick(item, ["phone", "contact"])],
    ["Directions", pick(item, ["navigation_hint", "mapsUrl"])],
    ["Travel estimate", pick(item, ["travelMinutes"]) ? `${pick(item, ["travelMinutes"])} minutes` : ""],
    ["Leave by", pick(item, ["leaveByLabel", "leave_by_label"])],
    [
      "Transportation",
      pick(item, ["transportResponsibility", "transport_hint", "transportationNotes"]),
    ],
    ["Prior schedule history", pick(item, ["priorHistory"])],
    ["Location", pick(item, ["location"])],
    ["Certainty", certaintyLabel(item.epistemicStatus)],
    ["Priority", priorityLabel(item.safetyClass)],
    ["Summary", pick(item, ["summary", "statement", "whatHappened"])],
    ["Why it matters", pick(item, ["whySurfaced", "reason", "whyVisible"])],
  ];

  for (const [label, value] of structured) {
    if (!value || value === "Care team member" || value === "Someone in the care circle")
      continue;
    if (isTechnicalIdValue(value)) continue;
    rows.push({ label, value });
  }

  // Discrepancy plain language
  const disc =
    item.discrepancy && typeof item.discrepancy === "object"
      ? (item.discrepancy as Record<string, unknown>)
      : null;
  if (disc) {
    rows.push({
      label: "Needs review",
      value: plainDiscrepancyMessage(str(disc.message), recipientName),
    });
  } else if (item.message && /dimension|comparable|unit/i.test(str(item.message))) {
    rows.push({
      label: "Needs review",
      value: plainDiscrepancyMessage(str(item.message), recipientName),
    });
  }

  // Source attribution without dumping technical source object
  const src = item.source;
  if (src && typeof src === "object") {
    const s = src as Record<string, unknown>;
    const actor =
      str(s.actorName) ||
      resolvePersonName(str(s.actorPersonId) || undefined) ||
      str(s.label);
    if (actor && !isTechnicalIdValue(actor)) {
      rows.push({ label: "Source", value: actor });
    }
    if (s.kind === "provider_instruction") {
      rows.push({ label: "Authority", value: "Provider instruction" });
    } else if (s.kind === "professional_note") {
      rows.push({ label: "Authority", value: "Professional caregiver note" });
    } else if (s.kind === "caregiver_text" || s.kind === "caregiver_speech") {
      rows.push({ label: "Authority", value: "Family caregiver observation" });
    }
  }

  // Fallback remaining non-technical scalar fields
  if (rows.length < 2) {
    for (const [k, v] of Object.entries(item)) {
      if (HIDDEN_TECHNICAL_KEYS.has(k)) continue;
      if (v === null || v === undefined || typeof v === "object") continue;
      const val = String(v);
      if (isTechnicalIdValue(val)) continue;
      if (/id$/i.test(k)) continue;
      rows.push({ label: humanizeKey(k), value: val });
    }
  }

  const mapsUrl = pick(item, ["mapsUrl", "maps_url"]);
  const phone = pick(item, ["phone", "contact"]);

  return (
    <>
      <dl className="care-detail-dl" data-testid="appointment-detail-fields">
        {rows.map((r) => (
          <div key={r.label} className="care-detail-row">
            <dt>{r.label}</dt>
            <dd>
              {r.label === "Phone" && phone ? (
                <a href={`tel:${phone}`} data-testid="appointment-phone-link">
                  {phone}
                </a>
              ) : r.label === "Directions" && mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="appointment-directions-link"
                >
                  {r.value || "Open directions"}
                </a>
              ) : (
                r.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      {(mapsUrl || phone) && (
        <div className="btn-row" style={{ marginTop: 12 }} data-testid="appointment-actions">
          {mapsUrl ? (
            <a
              className="primary-btn"
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="appointment-open-maps"
              style={{ display: "inline-flex", textDecoration: "none" }}
            >
              Open directions
            </a>
          ) : null}
          {phone ? (
            <a
              className="secondary-btn"
              href={`tel:${phone}`}
              data-testid="appointment-call"
              style={{ display: "inline-flex", textDecoration: "none" }}
            >
              Call facility
            </a>
          ) : null}
        </div>
      )}
    </>
  );
}

/** Manual documentation path — same understand→confirm care record model as Relay. */
function ManualCareNotePanel({ recipientName }: { recipientName: string }) {
  const session = getSessionIdentity();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bundle, setBundle] = useState<
    import("../domain/types").VerificationBundle | null
  >(null);

  const roleHint = /physician|provider|doctor|\bnp\b|nurse|clinician/i.test(
    session.roleLabel,
  )
    ? "Provider update"
    : /professional|dsp|paid/i.test(session.roleLabel)
      ? "Support note"
      : "Care update";

  async function onPreview() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const result = await proposeCareUpdate(t);
      if (result.kind === "verify" && result.bundle) {
        setBundle(result.bundle);
        setPreview(
          result.bundle.items.map((i) => `• ${i.label}`).join("\n") ||
            "No structured items extracted",
        );
        setMsg(
          `Preview (${roleHint}) — review, edit text if needed, then Save. Same care-record path as Relay.`,
        );
      } else if (result.kind === "refusal") {
        // Keep prior draft preview if re-structure refused
        setMsg(result.message ?? "Could not structure that update.");
      } else {
        setMsg(result.message ?? "Could not prepare documentation.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    if (!bundle || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const result = await confirmCareUpdateAsync(bundle);
      if (result.kind === "persisted") {
        setMsg(
          result.message ??
            `Saved ${roleHint.toLowerCase()} for ${recipientName}. History and handoff updated.`,
        );
        setText("");
        setPreview(null);
        setBundle(null);
      } else {
        setMsg(result.message ?? "Save did not persist.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="section surface-known"
      style={{ marginTop: 16 }}
      data-testid="manual-care-note"
      aria-label="Manual documentation"
    >
      <h3 style={{ marginTop: 0 }}>Document care (manual path)</h3>
      <p className="muted">
        Type a structured care note without using Relay chat. Preview and save
        use the <strong>same governed care record model</strong> as
        Relay-assisted documentation. Role: {session.roleLabel} → {roleHint}.
      </p>
      <textarea
        data-testid="manual-note-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={`Manual ${roleHint.toLowerCase()} for ${recipientName}…`}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <div className="btn-row">
        <button
          type="button"
          className="secondary-btn"
          data-testid="manual-note-preview"
          disabled={busy || !text.trim()}
          onClick={() => void onPreview()}
        >
          {busy ? "Working…" : "Preview structure"}
        </button>
        <button
          type="button"
          className="primary-btn"
          data-testid="manual-note-save"
          disabled={busy || !bundle}
          onClick={() => void onSave()}
        >
          Save care record
        </button>
      </div>
      {preview && (
        <pre
          data-testid="manual-note-preview-body"
          style={{
            marginTop: 12,
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem",
            background: "var(--cr-glass, rgba(0,0,0,0.04))",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {preview}
        </pre>
      )}
      {msg && (
        <p className="muted" role="status" style={{ marginTop: 8 }}>
          {msg}
        </p>
      )}
    </section>
  );
}

function AboutRecipientPanel({
  recipientName,
  profile,
}: {
  recipientName: string;
  profile: RecipientProfilePayload | null;
}) {
  const p = (profile?.profile ?? {}) as Record<string, unknown>;
  const conditions = Array.isArray(p.confirmedConditions)
    ? (p.confirmedConditions as Array<Record<string, unknown>>)
    : [];
  const allergies = Array.isArray(p.allergies)
    ? (p.allergies as Array<Record<string, unknown>>)
    : [];
  const emergency = Array.isArray(p.emergencyContacts)
    ? (p.emergencyContacts as Array<Record<string, unknown>>)
    : [];
  const goals = Array.isArray(p.careGoals) ? (p.careGoals as string[]) : [];
  const prefs = Array.isArray(p.carePreferences)
    ? (p.carePreferences as string[])
    : [];
  const concerns = Array.isArray(p.healthConcerns)
    ? (p.healthConcerns as string[])
    : [];

  function ageLine(): string {
    const dob = typeof p.dateOfBirth === "string" ? p.dateOfBirth : "";
    if (!dob) return "Age: not on file";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
    if (!m) return `Date of birth on file: ${dob}`;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const now = new Date();
    let age = now.getFullYear() - y;
    if (now.getMonth() < mo || (now.getMonth() === mo && now.getDate() < d))
      age -= 1;
    return `${age} years old · DOB ${dob}`;
  }

  const space = resolveCareSpace(loadActiveCareRecipientId());
  const isLightweight = space.depth === "lightweight";

  return (
    <>
      <h2>About {recipientName}</h2>
      <p className="muted">
        Person-first care context. Confirmed fields only — missing items are not
        invented.
      </p>
      {isLightweight && (
        <p className="attention-limit" data-testid="care-lightweight-banner" role="status">
          Early care space for {recipientName}: empty fields mean not yet on
          file — never invented. Add facts as the circle confirms them.
        </p>
      )}

      <div className="surface-known care-panel">
        <h3 className="care-panel-title">Overview</h3>
        <ul className="list-plain">
          <li>
            <strong>{profile?.displayName ?? recipientName}</strong>
            {profile?.preferredName
              ? ` · prefers ${profile.preferredName}`
              : ""}
          </li>
          <li>{ageLine()}</li>
          {p.pronouns ? <li>Pronouns: {String(p.pronouns)}</li> : null}
          {p.primaryLanguage ? (
            <li>Language: {String(p.primaryLanguage)}</li>
          ) : null}
          {p.primaryProviderName ? (
            <li data-testid="care-about-primary-provider">
              Primary provider: {String(p.primaryProviderName)}
            </li>
          ) : (
            <li className="muted" data-testid="care-about-primary-provider">
              Primary provider: not on file
            </li>
          )}
          {p.careLocationSummary ? (
            <li>{String(p.careLocationSummary)}</li>
          ) : null}
        </ul>
      </div>

      <div className="surface-reported care-panel">
        <h3 className="care-panel-title">Health</h3>
        <p className="muted care-panel-lead">
          Confirmed conditions vs caregiver-reported concerns are separate.
        </p>
        {conditions.length === 0 ? (
          <p className="muted">No confirmed diagnoses on file.</p>
        ) : (
          <ul className="list-plain">
            {conditions.map((c) => (
              <li key={String(c.id ?? c.label)}>
                <strong>{String(c.label)}</strong>
                {c.sourceLabel ? (
                  <span className="muted"> · {String(c.sourceLabel)}</span>
                ) : null}
                <span className="badge badge-teal care-inline-badge">
                  {String(c.verification ?? "CONFIRMED")}
                </span>
              </li>
            ))}
          </ul>
        )}
        {concerns.length > 0 && (
          <>
            <p className="care-subhead">
              <strong>Concerns / observations (not diagnoses)</strong>
            </p>
            <ul className="list-plain">
              {concerns.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        )}
        <p className="care-subhead">
          <strong>Allergies</strong>
        </p>
        <ul className="list-plain">
          {allergies.length === 0 ? (
            <li className="muted">Not on file</li>
          ) : (
            allergies.map((a) => (
              <li key={String(a.label)}>{String(a.label)}</li>
            ))
          )}
        </ul>
        <p className="care-subhead">
          <strong>Medications on file</strong>
        </p>
        <ul className="list-plain">
          {(profile?.medications ?? []).length === 0 ? (
            <li className="muted">None listed</li>
          ) : (
            profile!.medications.map((m, i) => (
              <li key={i}>
                {String(m.name)} {String(m.dose ?? "")} —{" "}
                {String(m.scheduleLabel ?? "")}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="surface-known care-panel">
        <h3 className="care-panel-title">Daily support</h3>
        <ul className="list-plain">
          {p.mobilityBaseline ? (
            <li>Mobility: {String(p.mobilityBaseline)}</li>
          ) : (
            <li className="muted">Mobility: not on file</li>
          )}
          {p.dailyRoutineSummary ? (
            <li>{String(p.dailyRoutineSummary)}</li>
          ) : null}
          {p.transportationNotes ? (
            <li>Transport: {String(p.transportationNotes)}</li>
          ) : null}
        </ul>
      </div>

      <div
        className="surface-reported care-panel"
        data-testid="person-centered-preferences"
      >
        <h3 className="care-panel-title">Preferences, dignity, and goals</h3>
        <p className="muted care-panel-lead">
          Person-centered support notes — not diagnostic labels. Prefer the
          person&apos;s name and adult language. Supported decision-making and
          substitute decision-making are different; only use labels that are on
          file.
        </p>
        <ul className="list-plain">
          {p.communicationPreferences ? (
            <li>
              <strong>Communication preferences:</strong>{" "}
              {String(p.communicationPreferences)}
            </li>
          ) : null}
          {p.supportedDecisionMaking ? (
            <li>
              <strong>Decision support:</strong>{" "}
              {String(p.supportedDecisionMaking)}
            </li>
          ) : null}
          {prefs.map((x) => (
            <li key={x}>
              <strong>Preference:</strong> {x}
            </li>
          ))}
          {goals.map((x) => (
            <li key={x}>
              <strong>Goal:</strong> {x}
            </li>
          ))}
          {prefs.length === 0 &&
            goals.length === 0 &&
            !p.communicationPreferences &&
            !p.supportedDecisionMaking && (
              <li className="muted">Not on file</li>
            )}
        </ul>
      </div>

      <div
        className="surface-verify care-panel emergency-snapshot"
        data-testid="emergency-snapshot-card"
        id="emergency-snapshot"
      >
        <h3 className="care-panel-title">Essential / emergency</h3>
        <p className="attention-limit emergency-disclaimer" role="note">
          Emergency: call your local emergency number (e.g. 911). This app does
          not dispatch responders or diagnose.
        </p>
        <ul className="list-plain">
          <li>{ageLine()}</li>
          <li>
            Allergies:{" "}
            {allergies.map((a) => String(a.label)).join("; ") || "not on file"}
          </li>
          <li>
            Conditions:{" "}
            {conditions.map((c) => String(c.label)).join("; ") || "none on file"}
          </li>
          <li data-testid="emergency-blood-type">
            Blood type:{" "}
            {typeof p.bloodType === "string" && p.bloodType.trim()
              ? `${p.bloodType.trim()} (on file · not inferred)`
              : "O+ · synthetic demo only (not a clinical record)"}
          </li>
          {p.primaryProviderName ? (
            <li>Provider: {String(p.primaryProviderName)}</li>
          ) : null}
          {emergency.length > 0 ? (
            emergency.map((c) => (
              <li key={String(c.name)}>
                Contact: {String(c.name)}
                {c.relationship ? ` · ${String(c.relationship)}` : ""}
                {c.phone ? (
                  <>
                    {" "}
                    ·{" "}
                    <a href={`tel:${String(c.phone)}`}>{String(c.phone)}</a>
                  </>
                ) : (
                  ""
                )}
              </li>
            ))
          ) : (
            <li data-testid="emergency-contact-synthetic">
              Contact: Alex Rivera · family (demo) ·{" "}
              <a href="tel:+15550109999">+1 (555) 010-9999</a>
              <span className="muted"> · synthetic demo only</span>
            </li>
          )}
        </ul>
        <p className="muted meta-time" data-testid="emergency-provenance">
          Source: care profile on file
          {p.profileSourceSummary ? ` · ${String(p.profileSourceSummary)}` : ""}
          . Missing blood type / contacts use clearly labeled synthetic demo
          values for product walkthroughs only — never treated as clinical
          truth. Opening emergency information is audited server-side when the
          emergency-card API is used.
        </p>
        <button
          type="button"
          className="secondary-btn"
          data-testid="load-emergency-card-api"
          onClick={() => {
            void import("../foundation/careClient").then(({ fetchEmergencyCard }) =>
              fetchEmergencyCard().then((r) => {
                if (r.ok && r.card) {
                  const el = document.getElementById("emergency-api-result");
                  if (el) {
                    el.textContent = `Emergency card loaded for ${String(r.card.preferredName ?? "")}. Access audited. Incomplete: ${Array.isArray(r.card.incomplete) ? (r.card.incomplete as string[]).join(", ") || "none" : "n/a"}`;
                  }
                }
              }),
            );
          }}
        >
          Load authorized emergency card (audited)
        </button>
        <p
          className="muted"
          id="emergency-api-result"
          data-testid="emergency-api-result"
        />
        {p.profileSourceSummary ? (
          <p className="muted meta-time" style={{ marginBottom: 0 }}>
            {String(p.profileSourceSummary)}
          </p>
        ) : null}
      </div>
    </>
  );
}

export function CarePage({
  focusKind,
}: {
  focusKind?: "medication" | "task" | "general" | null;
}) {
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const recipientName = space.displayName;
  const [section, setSection] = useState<CareSection>(
    focusKind === "medication" ? "medications" : "about",
  );
  const [state, setState] = useState<CareStateSnapshot | null>(null);
  const [profile, setProfile] = useState<RecipientProfilePayload | null>(null);
  const [history, setHistory] = useState<
    Array<{
      id: string;
      at: string;
      kind: string;
      title: string;
      detail: string;
      sourceLabel?: string;
    }>
  >([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(
    null,
  );
  const [selectedKind, setSelectedKind] = useState<string>("Care item");
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeApts, setActiveApts] = useState<AppointmentLineageRow[]>([]);
  const [historyApts, setHistoryApts] = useState<AppointmentLineageRow[]>([]);
  const [aptsLoaded, setAptsLoaded] = useState(false);

  useEffect(() => {
    if (focusKind === "medication") setSection("medications");
  }, [focusKind]);

  useEffect(() => {
    let cancelled = false;
    void fetchCareState().then((s) => {
      if (cancelled) return;
      setState(s);
      if (s.source === "empty") {
        setError("No care state available yet for this recipient.");
      }
    });
    void fetchRecipientProfile().then((p) => {
      if (!cancelled) setProfile(p);
    });
    void fetchCareHistory(historyFilter).then((h) => {
      if (!cancelled) setHistory(h.items);
    });
    void listAppointmentsLineage(space.careRecipientId).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setActiveApts(res.active);
        setHistoryApts(res.history);
      }
      setAptsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [historyFilter, space.careRecipientId]);

  const observationClusters = useMemo(
    () => clusterObservations(state?.observations ?? []),
    [state?.observations],
  );

  const reviewClusters = useMemo(
    () => clusterSafetyReviews(state?.openSafetyReviews ?? []),
    [state?.openSafetyReviews],
  );

  const sourceLabel =
    state?.source === "http"
      ? "Live care state"
      : state?.source === "package"
        ? "Local care state"
        : "Unavailable";

  function openItem(item: Record<string, unknown>, kind: string) {
    setSelected(item);
    setSelectedKind(kind);
  }

  /** Enrich appointment card for real-world caregiver actions (maps, phone, leave-by). */
  function openAppointmentDetail(row: AppointmentLineageRow) {
    const title = String(row.title ?? "Appointment");
    const loc = String(row.location ?? row.address ?? "");
    const isPt =
      /physical therapy|coastal pt|\bpt\b|therapy/i.test(title) ||
      /coastal pt|physical therapy/i.test(loc);
    const isClinic =
      /clinic|family medicine|doctor|physician/i.test(title) ||
      /family medicine|clinic/i.test(loc);
    const fac = isPt
      ? SYNTHETIC_FACILITIES.pt
      : isClinic
        ? SYNTHETIC_FACILITIES.clinic
        : null;

    const startsIso = row.starts_at ? String(row.starts_at) : "";
    let leaveBy = row.leave_by_label ? String(row.leave_by_label) : "";
    const travelMin =
      row.travel_minutes ??
      (fac ? fac.travelMinutes : null);
    if (!leaveBy && startsIso && travelMin) {
      try {
        const start = new Date(startsIso);
        const leave = new Date(start.getTime() - travelMin * 60_000);
        leaveBy = leave.toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      } catch {
        /* ignore */
      }
    }

    const address =
      row.address ||
      (fac ? fac.address : null) ||
      row.location ||
      "";
    const phone =
      row.phone ||
      row.contact ||
      (fac ? fac.phone : null) ||
      "";
    const mapsUrl =
      row.maps_url ||
      (fac ? fac.mapsUrl : null) ||
      (address
        ? `https://maps.google.com/?q=${encodeURIComponent(String(address))}`
        : null);

    const prior = historyApts
      .filter(
        (h) =>
          h.lineage_key &&
          row.lineage_key &&
          h.lineage_key === row.lineage_key &&
          h.id !== row.id,
      )
      .slice(0, 6)
      .map((h) => {
        const when =
          formatCareDateTime(String(h.starts_at ?? h.starts_at_label ?? "")) ||
          String(h.starts_at_label ?? "");
        return `${h.status ?? "updated"} · ${when || "prior visit"}`;
      });

    openItem(
      {
        id: row.id,
        title,
        startsAt: row.starts_at,
        startsAtLabel: row.starts_at_label,
        status: row.status,
        location: row.location || fac?.name || "",
        facility: fac?.name || row.location || "",
        address,
        phone,
        mapsUrl,
        navigation_hint: row.navigation_hint,
        transport_hint: row.transport_hint,
        leaveByLabel: leaveBy,
        travelMinutes: travelMin,
        transportResponsibility: row.transport_hint,
        priorHistory: prior.join("; ") || "No prior moves or cancellations listed",
        facilityNote: fac?.note ?? "",
        lineage_key: row.lineage_key,
        bucket: row.bucket,
      },
      "Appointment",
    );
  }

  return (
    <>
      <div className="greeting">
        <h1>{recipientName}&apos;s care</h1>
        <p
          className="muted section-lead"
          style={{ marginTop: 0, maxWidth: 560 }}
          data-testid="page-purpose-care"
        >
          Current care picture for {recipientName} — medications, observations,
          appointments, and reviews. Pending stays separate from active. Open an
          item for source and status.
        </p>
        <p
          className="muted"
          data-testid="care-state-source"
          style={{ fontSize: "0.8rem" }}
        >
          {sourceLabel}
          {state?.lastUpdatedAt
            ? ` · updated ${formatCareDateTime(String(state.lastUpdatedAt))}`
            : ""}
        </p>
        <span className="sr-only" data-testid="care-recipient-id-hidden">
          {resolveRecipientName(state?.careRecipientId, recipientName)}
        </span>
      </div>

      {error && (
        <p className="attention-limit" role="alert">
          {error}
        </p>
      )}

      <div className="tabs" role="tablist" aria-label="Care sections">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            className="tab"
            aria-selected={section === s.id}
            data-testid={`care-section-${s.id}`}
            onClick={() => {
              setSection(s.id);
              setSelected(null);
              setExpandedCluster(null);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <section
        className="section"
        aria-label={section}
        data-testid={section === "about" ? "care-about-profile" : undefined}
      >
        {section === "about" && (
          <>
            <AboutRecipientPanel
              recipientName={recipientName}
              profile={profile}
            />
            <ManualCareNotePanel recipientName={recipientName} />
          </>
        )}
        {section === "history" && (
          <div data-testid="care-history-panel">
            <h2>Care history</h2>
            <p className="muted">
              What happened for {recipientName} — human labels, not database IDs.
            </p>
            <div className="btn-row" style={{ marginBottom: 12 }}>
              {(
                [
                  "all",
                  "medications",
                  "appointments",
                  "observations",
                  "care_notes",
                  "handoffs",
                ] as const
              ).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={
                    historyFilter === f ? "primary-btn" : "secondary-btn"
                  }
                  style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem" }}
                  data-testid={`history-filter-${f}`}
                  onClick={() => setHistoryFilter(f)}
                >
                  {f === "care_notes" ? "Care notes" : f}
                </button>
              ))}
            </div>
            {history.length === 0 ? (
              <p className="muted">No history items yet for this filter.</p>
            ) : (
              <div className="timeline" data-testid="care-history-list">
                {history.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <strong>{item.title}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {item.at
                        ? formatCareDateTime(String(item.at))
                        : ""}
                      {item.sourceLabel ? ` · ${item.sourceLabel}` : ""}
                    </div>
                    <div>{item.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {section === "shift" && (
          <>
            <ShiftWorkspacePage
              refreshKey={0}
              onOpenRelay={() => {
                window.dispatchEvent(new CustomEvent("cr-open-relay"));
              }}
              onRelayBlocked={(reason) => {
                window.alert(reason);
              }}
            />
          </>
        )}
        {section === "about" && (
          <div style={{ marginBottom: 16 }}>
            <IncomingHandoffInbox refreshKey={0} />
          </div>
        )}
        {section === "medications" && (
          <>
            <h2>Medications</h2>
            <CorrectionAwarenessPanel refreshKey={0} />
            <MedicationCorrectionPanel refreshKey={0} />
            {!state?.medicationSchedules?.length ? (
              <p className="muted">No medication schedules on file.</p>
            ) : (
              state.medicationSchedules.map((m) => {
                const row = m as Record<string, unknown>;
                const takeAt =
                  pick(row, ["scheduleTime", "nextDueLabel"]) ||
                  pick(row, ["scheduleLabel"]);
                return (
                  <button
                    key={str(row.id)}
                    type="button"
                    className="member-card med-card"
                    data-testid={`care-med-${row.id}`}
                    onClick={() => openItem(row, "Medication")}
                  >
                    <strong>{str(row.name ?? "Medication")}</strong>
                    <span className="muted">
                      {[str(row.dose), str(row.strength)].filter(Boolean).join(" · ")}
                    </span>
                    <span className="muted">
                      {takeAt ? `Next / schedule: ${takeAt}` : str(row.scheduleLabel)}
                    </span>
                    <span className="muted">
                      Authorized by {str(row.authorizedBy ?? "prescribing team")}
                    </span>
                  </button>
                );
              })
            )}
            {!!state?.medicationRecords?.length && (
              <>
                <h3 className="muted" style={{ marginTop: 16 }}>
                  Recent administrations (reported)
                </h3>
                {state.medicationRecords.slice(-5).map((r, i) => {
                  const row = r as Record<string, unknown>;
                  const by = resolvePersonName(
                    str(row.administeredByPersonId) || undefined,
                  );
                  return (
                    <button
                      key={str(row.id ?? i)}
                      type="button"
                      className="member-card"
                      onClick={() => openItem(row, "Medication report")}
                    >
                      <strong>
                        {str(
                          row.recordedDose ??
                            row.doseRecorded ??
                            row.statement ??
                            "Med report",
                        )}
                      </strong>
                      <span className="muted">
                        {certaintyLabel(row.epistemicStatus)} ·{" "}
                        {formatCareDateTime(
                          str(row.occurredAt ?? row.administeredAt ?? row.recordedAt),
                        )}
                      </span>
                      <span className="muted">Given by {by}</span>
                    </button>
                  );
                })}
              </>
            )}
          </>
        )}

        {section === "appointments" && (
          <>
            <h2>Current appointments</h2>
            <p className="muted section-lead">
              Tap an appointment for time, place, directions, phone, travel, and
              prior schedule history. Only current items stay here; past moves
              and cancellations are under Prior schedule.
            </p>
            {!aptsLoaded ? (
              <p className="muted">Loading appointments…</p>
            ) : activeApts.length === 0 ? (
              <p className="muted" data-testid="appointments-empty">
                No current appointments on file.
              </p>
            ) : (
              activeApts.map((a) => {
                const when =
                  formatCareDateTime(String(a.starts_at ?? a.starts_at_label ?? "")) ||
                  String(a.starts_at_label ?? "");
                return (
                  <button
                    key={a.id}
                    type="button"
                    className="member-card"
                    data-testid={`care-apt-${a.id}`}
                    data-appointment-card="true"
                    onClick={() => openAppointmentDetail(a)}
                  >
                    <strong>{a.title ?? "Appointment"}</strong>
                    <span className="muted">{when}</span>
                    {(a.location || a.address) && (
                      <span className="muted">{a.location || a.address}</span>
                    )}
                    <span className="badge badge-teal">
                      {a.status ?? "scheduled"}
                    </span>
                    {a.transport_hint && (
                      <span className="muted">{a.transport_hint}</span>
                    )}
                  </button>
                );
              })
            )}

            <h2 style={{ marginTop: 24 }}>Prior schedule</h2>
            <p className="muted">
              Moved, cancelled, or replaced visits stay here so history is not
              lost.
            </p>
            {historyApts.length === 0 ? (
              <p className="muted">No prior appointment history listed.</p>
            ) : (
              historyApts.slice(0, 12).map((a) => {
                const when =
                  formatCareDateTime(String(a.starts_at ?? a.starts_at_label ?? "")) ||
                  String(a.starts_at_label ?? "");
                return (
                  <button
                    key={a.id}
                    type="button"
                    className="member-card"
                    data-testid={`care-apt-history-${a.id}`}
                    onClick={() => openAppointmentDetail(a)}
                  >
                    <strong>{a.title ?? "Appointment"}</strong>
                    <span className="muted">{when}</span>
                    <span className="badge">{a.status ?? "history"}</span>
                  </button>
                );
              })
            )}
          </>
        )}

        {section === "observations" && (
          <>
            <h2>Observations</h2>
            <p className="muted">
              Related reports are grouped. Expand a theme to see each report and
              who recorded it.
            </p>
            {observationClusters.length === 0 ? (
              <p className="muted">No observations on file.</p>
            ) : (
              observationClusters.map((c) => (
                <div key={c.key} className="obs-cluster">
                  <button
                    type="button"
                    className="member-card"
                    data-testid={`obs-cluster-${c.key}`}
                    onClick={() =>
                      setExpandedCluster((cur) =>
                        cur === c.key ? null : c.key,
                      )
                    }
                  >
                    <strong>{c.theme}</strong>
                    <span className="muted">
                      Reported {c.count} time{c.count === 1 ? "" : "s"} · most
                      recent {c.mostRecentLabel}
                    </span>
                    <span className="muted">
                      Sources: {c.sources.join(", ")}
                    </span>
                    {c.trendNote && (
                      <span className="muted">{c.trendNote}</span>
                    )}
                  </button>
                  {expandedCluster === c.key && (
                    <div className="obs-evidence">
                      {c.items.map((o, i) => (
                        <button
                          key={str(o.id ?? i)}
                          type="button"
                          className="member-card member-card-nested"
                          onClick={() =>
                            openItem(o as Record<string, unknown>, "Observation")
                          }
                        >
                          <strong>{str(o.summary ?? "Observation")}</strong>
                          <span className="muted">
                            {formatCareDateTime(str(o.observedAt))} ·{" "}
                            {o.source?.actorName ||
                              resolvePersonName(o.source?.actorPersonId)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {section === "reviews" && (
          <>
            <h2>Open reviews</h2>
            {reviewClusters.length === 0 ? (
              <p className="muted">Nothing open right now.</p>
            ) : (
              reviewClusters.map((c) => (
                <div key={c.key} className="obs-cluster">
                  <button
                    type="button"
                    className="member-card"
                    onClick={() =>
                      setExpandedCluster((cur) =>
                        cur === c.key ? null : c.key,
                      )
                    }
                  >
                    <strong>{c.title}</strong>
                    <span>
                      {plainDiscrepancyMessage(c.reason, recipientName)}
                    </span>
                    <span className="muted">
                      {c.count} related item{c.count === 1 ? "" : "s"} ·{" "}
                      {c.status}
                    </span>
                  </button>
                  {expandedCluster === c.key &&
                    c.items.map((r, i) => (
                      <button
                        key={str(r.id ?? i)}
                        type="button"
                        className="member-card member-card-nested"
                        onClick={() => openItem(r, "Needs review")}
                      >
                        <strong>
                          {plainDiscrepancyMessage(
                            str(r.reason ?? r.message),
                            recipientName,
                          )}
                        </strong>
                        <span className="muted">{str(r.status ?? "open")}</span>
                      </button>
                    ))}
                </div>
              ))
            )}
          </>
        )}

        {section === "events" && (
          <>
            <h2>Recent care events</h2>
            {!state?.events?.length ? (
              <p className="muted">No events yet.</p>
            ) : (
              state.events
                .slice()
                .reverse()
                .slice(0, 12)
                .map((e) => {
                  const row = e as Record<string, unknown>;
                  const src =
                    row.source && typeof row.source === "object"
                      ? (row.source as Record<string, unknown>)
                      : null;
                  const who =
                    str(src?.actorName) ||
                    resolvePersonName(str(src?.actorPersonId) || undefined);
                  return (
                    <button
                      key={str(row.id)}
                      type="button"
                      className="member-card"
                      onClick={() =>
                        openItem(row, careTypeLabel(row.type ?? row.title))
                      }
                    >
                      <strong>
                        {str(row.title ?? row.statement ?? "Care update")}
                      </strong>
                      <span className="muted">
                        {formatCareDateTime(str(row.occurredAt))} · {who}
                      </span>
                      <span className="muted">
                        {certaintyLabel(row.epistemicStatus)}
                        {row.status ? ` · ${str(row.status)}` : ""}
                      </span>
                    </button>
                  );
                })
            )}
          </>
        )}
      </section>

      {selected && (
        <section
          className="section surface-reported"
          aria-label={`${selectedKind} detail`}
          data-testid="care-object-detail"
        >
          <h2
            style={{
              textTransform: "none",
              letterSpacing: "-0.02em",
              fontSize: "1.1rem",
              color: "var(--cr-graphite)",
            }}
          >
            {selectedKind}
          </h2>
          <p className="muted">
            From {recipientName}&apos;s care record. Relay is not inventing these
            fields.
          </p>
          <DetailRows item={selected} recipientName={recipientName} />
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setSelected(null)}
          >
            Close
          </button>
        </section>
      )}
    </>
  );
}
