import { useEffect, useMemo, useState } from "react";
import {
  fetchCareState,
  type CareStateSnapshot,
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

type CareSection =
  | "medications"
  | "appointments"
  | "observations"
  | "events"
  | "reviews";

const sections: { id: CareSection; label: string }[] = [
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

  // Prefer structured medication fields
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
      ),
    ],
    ["Location", pick(item, ["location"])],
    ["Status", pick(item, ["status"])],
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

  return (
    <dl className="care-detail-dl">
      {rows.map((r) => (
        <div key={r.label} className="care-detail-row">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
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
    focusKind === "medication" ? "medications" : "medications",
  );
  const [state, setState] = useState<CareStateSnapshot | null>(null);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(
    null,
  );
  const [selectedKind, setSelectedKind] = useState<string>("Care item");
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <>
      <div className="greeting">
        <h1>{recipientName}&apos;s care</h1>
        <p className="muted" style={{ marginTop: 0, maxWidth: 560 }}>
          Medications, appointments, observations, and reviews for{" "}
          {recipientName}. Open an item for source and status.
        </p>
        <p
          className="muted"
          data-testid="care-state-source"
          style={{ fontSize: "0.8rem" }}
        >
          {sourceLabel}
          {state?.lastUpdatedAt
            ? ` · updated ${new Date(state.lastUpdatedAt).toLocaleString()}`
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

      <section className="section" aria-label={section}>
        {section === "medications" && (
          <>
            <h2>Medications</h2>
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
            <h2>Appointments</h2>
            {!state?.appointments?.length ? (
              <p className="muted">No appointments on file.</p>
            ) : (
              state.appointments.map((a) => {
                const row = a as Record<string, unknown>;
                const when =
                  formatCareDateTime(
                    str(row.startsAt ?? row.startsAtLabel),
                  ) || str(row.startsAtLabel);
                return (
                  <button
                    key={str(row.id)}
                    type="button"
                    className="member-card"
                    data-testid={`care-apt-${row.id}`}
                    onClick={() => openItem(row, "Appointment")}
                  >
                    <strong>{str(row.title ?? "Appointment")}</strong>
                    <span className="muted">{when}</span>
                    {str(row.location) && (
                      <span className="muted">{str(row.location)}</span>
                    )}
                    <span className="badge badge-teal">
                      {str(row.status ?? "scheduled")}
                    </span>
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
