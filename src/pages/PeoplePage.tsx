import { useEffect, useState } from "react";
import { careRecipient } from "../scenario/olivia";
import {
  fetchCircleMembers,
  type CareCircleMemberRow,
} from "../foundation/careClient";

export function PeoplePage() {
  const [members, setMembers] = useState<CareCircleMemberRow[]>([]);
  const [source, setSource] = useState<string>("");
  const [selected, setSelected] = useState<CareCircleMemberRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchCircleMembers().then((r) => {
      if (cancelled) return;
      setMembers(r.members);
      setSource(r.source);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="greeting">
        <h1>People</h1>
        <p className="for-person">
          Who is authorized for {careRecipient.displayName}
        </p>
        <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
          Membership from the care space access model — not a static cast list
          and not an agency roster.
        </p>
        <p className="muted" data-testid="people-source" style={{ fontSize: "0.8rem" }}>
          Source: {source || "…"}
        </p>
      </div>

      <section className="section section-hero surface-known" aria-label="Care recipient">
        <h2>Care recipient</h2>
        <div className="recipient-chip" style={{ marginBottom: 8 }}>
          <span className="avatar-3d" aria-hidden>
            E
          </span>
          <div>
            <strong>{careRecipient.displayName}</strong>
            <div className="muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              Care recipient · home / community
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Care circle">
        <h2>Authorized people</h2>
        {loading && <p className="muted">Loading membership…</p>}
        {!loading && members.length === 0 && (
          <p className="muted">No authorized members returned.</p>
        )}
        {members.map((member) => (
          <button
            key={member.personId}
            type="button"
            className="member-card"
            data-testid={`person-${member.personId}`}
            onClick={() =>
              setSelected((cur) =>
                cur?.personId === member.personId ? null : member,
              )
            }
          >
            <strong>{member.displayName}</strong>
            <span className="muted">{member.roleLabel}</span>
            <span
              className={
                member.status === "active" ? "badge badge-teal" : "badge badge-amber"
              }
            >
              {member.status}
            </span>
          </button>
        ))}
      </section>

      <section className="section surface-verify" aria-label="Invitation status">
        <h2>Invitations</h2>
        <p className="muted" data-testid="invite-not-available">
          Caregiver invitation lifecycle is{" "}
          <strong>not available in this build</strong>. No Invite button is
          shown until create → token → accept → membership is real end-to-end.
        </p>
      </section>

      {selected && (
        <section
          className="section surface-reported"
          aria-label={`${selected.displayName} details`}
          data-testid="person-detail"
        >
          <h2
            style={{
              textTransform: "none",
              letterSpacing: "-0.02em",
              fontSize: "1.1rem",
              color: "var(--cr-graphite)",
            }}
          >
            {selected.displayName} · {selected.roleLabel}
          </h2>
          <p>
            <strong>Membership:</strong> {selected.status}
          </p>
          <p>
            <strong>Can see</strong>
          </p>
          <ul className="list-plain">
            {selected.canSee.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>
            <strong>Can do</strong>
          </p>
          <ul className="list-plain">
            {selected.canDo.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="muted">
            Authority limits:{" "}
            {selected.limits.length ? selected.limits.join("; ") : "None listed"}
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
