import { useEffect, useState } from "react";
import { careRecipient } from "../scenario/olivia";
import {
  acceptInvitation,
  createInvitation,
  fetchCircleMembers,
  getSessionIdentity,
  type CareCircleMemberRow,
} from "../foundation/careClient";

export function PeoplePage() {
  const [members, setMembers] = useState<CareCircleMemberRow[]>([]);
  const [source, setSource] = useState<string>("");
  const [selected, setSelected] = useState<CareCircleMemberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteeId, setInviteeId] = useState("p-maya");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [acceptToken, setAcceptToken] = useState("");
  const session = getSessionIdentity();

  function reload() {
    setLoading(true);
    void fetchCircleMembers().then((r) => {
      setMembers(r.members);
      setSource(r.source);
      setLoading(false);
    });
  }

  useEffect(() => {
    reload();
  }, []);

  async function onInvite() {
    setInviteBusy(true);
    setInviteMsg(null);
    const res = await createInvitation(inviteeId);
    setInviteBusy(false);
    if (!res.ok) {
      setInviteMsg(res.message ?? "Invite failed");
      return;
    }
    setInviteToken(res.invitation.token);
    const inviteeLabel =
      inviteeId === "p-maya"
        ? "Maya Bennett"
        : inviteeId === "p-walter"
          ? "Daniel Kim"
          : "Invitee";
    setInviteMsg(
      `Invitation created for ${inviteeLabel}. Token ready for them to accept after their own sign-in.`,
    );
    reload();
  }

  async function onAccept() {
    setInviteBusy(true);
    setInviteMsg(null);
    const res = await acceptInvitation(acceptToken.trim());
    setInviteBusy(false);
    if (!res.ok) {
      setInviteMsg(res.message ?? "Accept failed");
      return;
    }
    setInviteMsg("Invitation accepted — membership active.");
    reload();
  }

  return (
    <>
      <div className="greeting">
        <h1>People</h1>
        <p className="for-person">
          Who is helping with {careRecipient.displayName}&apos;s care
        </p>
        <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
          Human-first circle · names and roles only. Signed in as{" "}
          <strong>{session.displayName}</strong>
          {session.roleLabel ? ` · ${session.roleLabel}` : ""}.
        </p>
        <p className="muted sr-only" data-testid="people-source">
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

      <section className="section surface-reported" aria-label="Invitations">
        <h2>Invitations</h2>
        <p className="muted">
          Real invite lifecycle: create token → invitee signs in independently →
          accept → membership. No fake Invite button.
        </p>
        <label className="muted" style={{ display: "block", marginTop: 8 }}>
          Invitee
          <select
            data-testid="invite-person"
            value={inviteeId}
            onChange={(e) => setInviteeId(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, minHeight: 48 }}
          >
            <option value="p-maya">Maya Bennett · Family / friend caregiver</option>
            <option value="p-walter">Daniel Kim · Professional caregiver</option>
          </select>
        </label>
        <div className="btn-row" style={{ marginTop: 10 }}>
          <button
            type="button"
            className="primary-btn"
            data-testid="invite-create"
            disabled={inviteBusy}
            onClick={() => void onInvite()}
          >
            Create invitation
          </button>
        </div>
        {inviteToken && (
          <p data-testid="invite-token" className="muted" style={{ wordBreak: "break-all" }}>
            Token: {inviteToken}
          </p>
        )}
        <label className="muted" style={{ display: "block", marginTop: 14 }}>
          Accept invitation (as current signed-in principal)
          <input
            data-testid="invite-accept-token"
            value={acceptToken}
            onChange={(e) => setAcceptToken(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, minHeight: 36 }}
          />
        </label>
        <div className="btn-row" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="secondary-btn"
            data-testid="invite-accept"
            disabled={inviteBusy || !acceptToken.trim()}
            onClick={() => void onAccept()}
          >
            Accept invitation
          </button>
        </div>
        {inviteMsg && (
          <p className="attention-limit" role="status" data-testid="invite-status">
            {inviteMsg}
          </p>
        )}
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
