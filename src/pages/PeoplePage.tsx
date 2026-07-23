import { useState } from "react";
import { careRecipient, circle } from "../scenario/olivia";
import type { CareCircleMember } from "../domain/types";

export function PeoplePage() {
  const [selected, setSelected] = useState<CareCircleMember | null>(null);

  return (
    <>
      <div className="greeting">
        <h1>People</h1>
        <p className="for-person">Who supports {careRecipient.displayName}</p>
        <p className="muted" style={{ marginTop: 8, maxWidth: 520 }}>
          Family, friends, and professionals connected to this person — not a
          workforce roster. Access is explicit.
        </p>
      </div>

      <section className="section section-hero surface-known" aria-label="Care recipient">
        <h2>Care recipient</h2>
        <div className="recipient-chip" style={{ marginBottom: 8 }}>
          <span className="avatar-3d" aria-hidden>
            O
          </span>
          <div>
            <strong>{careRecipient.displayName}</strong>
            <div className="muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              Home / community care
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Care circle">
        <h2>Care circle</h2>
        {circle.map((member) => (
          <button
            key={member.id}
            type="button"
            className="member-card"
            onClick={() =>
              setSelected((cur) => (cur?.id === member.id ? null : member))
            }
          >
            <strong>{member.person.displayName}</strong>
            <span className="muted">{member.roleLabel}</span>
            {member.nextInvolvement && <span>{member.nextInvolvement}</span>}
            {member.lastUpdate && (
              <span className="muted">{member.lastUpdate}</span>
            )}
          </button>
        ))}
      </section>

      {selected && (
        <section
          className="section surface-reported"
          aria-label={`${selected.person.displayName} details`}
        >
          <h2 style={{ textTransform: "none", letterSpacing: "-0.02em", fontSize: "1.1rem", color: "var(--cr-graphite)" }}>
            {selected.person.displayName} · {selected.roleLabel}
          </h2>
          <p>
            <strong>Helps with:</strong> {selected.helpsWith.join(", ")}
          </p>
          <p>
            <strong>Who can see what</strong>
          </p>
          <ul className="list-plain">
            {selected.access.informationCategories.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="muted">
            Authority limits: {selected.access.authorityLimits.join("; ")}
          </p>
          <p className="muted">
            Family hierarchy is not the same as authority. Access is explicit.
          </p>
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
