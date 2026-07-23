import { useState } from "react";
import {
  appointments,
  careRecipient,
  medicationSchedule,
  observations,
  today,
} from "../scenario/olivia";

const sections = [
  "Today",
  "Routine",
  "Care plan",
  "Appointments",
  "Health & observations",
  "Documents",
  "History",
] as const;

export function CarePage() {
  const [section, setSection] =
    useState<(typeof sections)[number]>("Today");

  return (
    <>
      <div className="greeting">
        <h1>{careRecipient.displayName}&apos;s care</h1>
        <p className="muted" style={{ marginTop: 0, maxWidth: 520 }}>
          Living care context for this person — medications, appointments,
          routines, and observations. Not an EHR dump.
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Care sections">
        {sections.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            className="tab"
            aria-selected={section === s}
            onClick={() => setSection(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <section className="section" aria-label={section}>
        {section === "Today" && (
          <>
            <h2>Today</h2>
            <ul className="list-plain">
              {today.needsYou.map((t) => (
                <li key={t.id}>
                  {t.dueLabel ? `${t.dueLabel} — ` : ""}
                  {t.title}
                </li>
              ))}
            </ul>
          </>
        )}
        {section === "Routine" && (
          <>
            <h2>Routine</h2>
            <p>Morning medication · Meals · Afternoon rest · Evening medication at 7 PM</p>
          </>
        )}
        {section === "Care plan" && (
          <>
            <h2>Care plan</h2>
            <p>
              Support {careRecipient.displayName} at home with medication
              reminders, mobility support, and coordinated family updates.
              Progressive disclosure keeps this calm — not an EHR dump.
            </p>
          </>
        )}
        {section === "Appointments" && (
          <>
            <h2>Appointments</h2>
            {appointments.map((a) => (
              <div key={a.id} className="item-row">
                <div>
                  <div className="item-title">{a.title}</div>
                  <div className="muted">{a.whenLabel}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {section === "Health & observations" && (
          <>
            <h2>Health & observations</h2>
            {observations.map((o) => (
              <div key={o.id} className="item-row">
                <div>
                  <div className="item-title">{o.summary}</div>
                  <p className="source-line" style={{ margin: "4px 0 0" }}>
                    Why am I seeing this? {o.source.whyVisible}
                  </p>
                </div>
              </div>
            ))}
            <div className="item-row">
              <div>
                <div className="item-title">
                  {medicationSchedule.name}: {medicationSchedule.dose}
                </div>
                <p className="source-line" style={{ margin: "4px 0 0" }}>
                  Authorized by {medicationSchedule.authorizedBy} ·{" "}
                  {medicationSchedule.authorizedAtLabel}
                </p>
              </div>
            </div>
          </>
        )}
        {section === "Documents" && (
          <>
            <h2>Documents</h2>
            <p className="muted">
              Exportable care summaries and consent records will appear here.
              Data portability is required — information is not trapped in Relay.
            </p>
          </>
        )}
        {section === "History" && (
          <>
            <h2>History</h2>
            <p className="muted">
              Continuity without noise. Corrections preserve prior evidence.
            </p>
          </>
        )}
      </section>
    </>
  );
}
