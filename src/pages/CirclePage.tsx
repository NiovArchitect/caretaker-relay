import { useState } from "react";
import { careRecipient, circle } from "../scenario/olivia";
import type { CareCircleMember } from "../domain/types";

export function CirclePage() {
  const [selected, setSelected] = useState<CareCircleMember | null>(null);

  return (
    <>
      <div className="greeting">
        <h1>Care Circle</h1>
        <p className="for-person">For {careRecipient.displayName}</p>
      </div>

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

      {selected && (
        <section className="section" aria-label={`${selected.person.displayName} details`}>
          <h2>
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
            Manage access (soon)
          </button>
        </section>
      )}
    </>
  );
}
