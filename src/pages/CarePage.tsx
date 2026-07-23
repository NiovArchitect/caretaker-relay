import { useEffect, useState } from "react";
import { careRecipient } from "../scenario/olivia";
import {
  fetchCareState,
  type CareStateSnapshot,
} from "../foundation/careClient";

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

export function CarePage({
  focusKind,
}: {
  /** Open a care object category (e.g. from Today attention). */
  focusKind?: "medication" | "task" | "general" | null;
}) {
  const [section, setSection] = useState<CareSection>(
    focusKind === "medication" ? "medications" : "medications",
  );
  const [state, setState] = useState<CareStateSnapshot | null>(null);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(
    null,
  );
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

  const sourceLabel =
    state?.source === "http"
      ? "Server-authoritative care state"
      : state?.source === "package"
        ? "Local package store"
        : "Unavailable";

  return (
    <>
      <div className="greeting">
        <h1>{careRecipient.displayName}&apos;s care</h1>
        <p className="muted" style={{ marginTop: 0, maxWidth: 560 }}>
          Living care objects for this person. Open an item to see source and
          status — not a prompt into Relay.
        </p>
        <p className="muted" data-testid="care-state-source" style={{ fontSize: "0.8rem" }}>
          {sourceLabel}
          {state?.lastUpdatedAt
            ? ` · updated ${new Date(state.lastUpdatedAt).toLocaleString()}`
            : ""}
        </p>
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
              state.medicationSchedules.map((m) => (
                <button
                  key={String(m.id)}
                  type="button"
                  className="member-card"
                  data-testid={`care-med-${m.id}`}
                  onClick={() => setSelected(m)}
                >
                  <strong>{String(m.name ?? "Medication")}</strong>
                  <span className="muted">
                    {String(m.dose ?? "")} · {String(m.scheduleLabel ?? "")}
                  </span>
                  <span className="muted">
                    Authorized by {String(m.authorizedBy ?? "—")}
                  </span>
                </button>
              ))
            )}
            {!!state?.medicationRecords?.length && (
              <>
                <h3 className="muted" style={{ marginTop: 16 }}>
                  Recent administrations (reported)
                </h3>
                {state.medicationRecords.slice(-5).map((r, i) => (
                  <button
                    key={String(r.id ?? i)}
                    type="button"
                    className="member-card"
                    onClick={() => setSelected(r)}
                  >
                    <strong>
                      {String(r.recordedDose ?? r.statement ?? "Med report")}
                    </strong>
                    <span className="muted">
                      {String(r.epistemicStatus ?? "")} ·{" "}
                      {String(r.occurredAt ?? r.recordedAt ?? "")}
                    </span>
                  </button>
                ))}
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
              state.appointments.map((a) => (
                <button
                  key={String(a.id)}
                  type="button"
                  className="member-card"
                  data-testid={`care-apt-${a.id}`}
                  onClick={() => setSelected(a)}
                >
                  <strong>{String(a.title ?? "Appointment")}</strong>
                  <span className="muted">
                    {String(a.startsAtLabel ?? a.startsAt ?? "")} ·{" "}
                    {String(a.status ?? "")}
                  </span>
                </button>
              ))
            )}
          </>
        )}

        {section === "observations" && (
          <>
            <h2>Observations</h2>
            {!state?.observations?.length ? (
              <p className="muted">No observations on file.</p>
            ) : (
              state.observations
                .slice()
                .reverse()
                .slice(0, 12)
                .map((o) => (
                  <button
                    key={String(o.id)}
                    type="button"
                    className="member-card"
                    onClick={() => setSelected(o)}
                  >
                    <strong>{String(o.summary ?? "Observation")}</strong>
                    <span className="muted">
                      {String(o.epistemicStatus ?? "REPORTED")} ·{" "}
                      {String(o.observedAt ?? "")}
                    </span>
                  </button>
                ))
            )}
          </>
        )}

        {section === "reviews" && (
          <>
            <h2>Open safety reviews</h2>
            {!state?.openSafetyReviews?.length ? (
              <p className="muted">Nothing open right now.</p>
            ) : (
              state.openSafetyReviews.map((r) => (
                <button
                  key={String(r.id)}
                  type="button"
                  className="member-card"
                  onClick={() => setSelected(r)}
                >
                  <strong>{String(r.safetyClass ?? "review")}</strong>
                  <span>{String(r.reason ?? "")}</span>
                  <span className="muted">{String(r.status ?? "")}</span>
                </button>
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
                .slice(0, 15)
                .map((e) => (
                  <button
                    key={String(e.id)}
                    type="button"
                    className="member-card"
                    onClick={() => setSelected(e)}
                  >
                    <strong>
                      {String(e.title ?? e.statement ?? e.type ?? "Event")}
                    </strong>
                    <span className="muted">
                      {String(e.epistemicStatus ?? "")} ·{" "}
                      {String(e.occurredAt ?? "")}
                    </span>
                  </button>
                ))
            )}
          </>
        )}
      </section>

      {selected && (
        <section
          className="section surface-reported"
          aria-label="Care object detail"
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
            Care object
          </h2>
          <p className="muted">
            Server-backed fields for this item. Relay is not inventing this
            view.
          </p>
          <dl className="list-plain" style={{ marginTop: 12 }}>
            {Object.entries(selected).map(([k, v]) => {
              if (v === null || v === undefined) return null;
              if (typeof v === "object") {
                return (
                  <li key={k} style={{ marginBottom: 8 }}>
                    <strong>{k}</strong>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "var(--cr-font)",
                        fontSize: "0.85rem",
                        background: "var(--cr-clinical)",
                        padding: 10,
                        borderRadius: 10,
                        marginTop: 4,
                      }}
                    >
                      {JSON.stringify(v, null, 2)}
                    </pre>
                  </li>
                );
              }
              return (
                <li key={k} style={{ marginBottom: 6 }}>
                  <strong>{k}:</strong> {String(v)}
                </li>
              );
            })}
          </dl>
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
