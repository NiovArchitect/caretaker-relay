import { useEffect, useState } from "react";
import {
  acceptInvitation,
  createInvitation,
  fetchCircleMembers,
  getSessionIdentity,
  type CareCircleMemberRow,
} from "../foundation/careClient";
import { SYNTHETIC_CONTACTS } from "../lib/identity";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";

export function PeoplePage({
  onMessagePerson,
  onPrepareHandoff,
  onOpenRelayForProvider,
}: {
  onMessagePerson?: (personId: string, displayName: string) => void;
  onPrepareHandoff?: () => void;
  onOpenRelayForProvider?: () => void;
}) {
  const [members, setMembers] = useState<CareCircleMemberRow[]>([]);
  const [source, setSource] = useState<string>("");
  const [selected, setSelected] = useState<CareCircleMemberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteeId, setInviteeId] = useState("p-maya");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteReady, setInviteReady] = useState(false);
  const [acceptToken, setAcceptToken] = useState("");
  const session = getSessionIdentity();
  const space = resolveCareSpace(loadActiveCareRecipientId());

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
    setInviteReady(false);
    const res = await createInvitation(inviteeId);
    setInviteBusy(false);
    if (!res.ok) {
      setInviteMsg(res.message ?? "Could not create the invitation.");
      return;
    }
    // Keep raw token only for accept flow; do not frame as developer lifecycle.
    if (res.invitation.token) {
      setAcceptToken(res.invitation.token);
    }
    const inviteeLabel =
      inviteeId === "p-maya"
        ? "Maya Bennett"
        : inviteeId === "p-walter"
          ? "Daniel Kim"
          : "Invitee";
    setInviteReady(true);
    setInviteMsg(
      `Invitation ready for ${inviteeLabel}. They join ${space.displayName}'s care circle with only the access their role allows.`,
    );
    reload();
  }

  async function onAccept() {
    setInviteBusy(true);
    setInviteMsg(null);
    const res = await acceptInvitation(acceptToken.trim());
    setInviteBusy(false);
    if (!res.ok) {
      setInviteMsg(res.message ?? "Could not accept the invitation.");
      return;
    }
    setInviteMsg(
      `Welcome. You are now part of ${space.displayName}'s care circle.`,
    );
    reload();
  }

  const contact = selected
    ? SYNTHETIC_CONTACTS[selected.personId]
    : null;

  return (
    <>
      <div className="greeting">
        <h1>People</h1>
        <p className="for-person">
          Who is helping with {space.displayName}&apos;s care
        </p>
        <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
          Care circle for {space.displayName}. Signed in as{" "}
          <strong>{session.displayName}</strong>
          {session.roleLabel ? ` · ${session.roleLabel}` : ""}.
        </p>
        <p className="muted sr-only" data-testid="people-source">
          Source: {source || "…"}
        </p>
      </div>

      <section
        className="section section-hero surface-known"
        aria-label="Care recipient"
      >
        <h2>Care recipient</h2>
        <div className="recipient-chip" style={{ marginBottom: 8 }}>
          <span className="avatar-3d" aria-hidden>
            {space.preferredName.charAt(0)}
          </span>
          <div>
            <strong>{space.displayName}</strong>
            <div
              className="muted"
              style={{ fontSize: "0.85rem", fontWeight: 500 }}
            >
              Care recipient · home / community
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Care circle">
        <h2>Authorized people</h2>
        {loading && <p className="muted">Loading care circle…</p>}
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
                member.status === "active"
                  ? "badge badge-teal"
                  : "badge badge-amber"
              }
            >
              {member.status === "active" ? "Active" : member.status}
            </span>
          </button>
        ))}
      </section>

      <section className="section surface-reported" aria-label="Invitations">
        <h2>Invite someone to {space.displayName}&apos;s care circle</h2>
        <p className="muted">
          They&apos;ll only see the care information their role allows. Choose
          the person and send the invitation. Technical delivery happens in the
          background.
        </p>
        <label className="muted" style={{ display: "block", marginTop: 8 }}>
          Person and role
          <select
            data-testid="invite-person"
            value={inviteeId}
            onChange={(e) => setInviteeId(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              minHeight: 48,
            }}
          >
            <option value="p-maya">
              Maya Bennett · Family / friend caregiver
            </option>
            <option value="p-walter">
              Daniel Kim · Professional caregiver
            </option>
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
            Send invitation
          </button>
        </div>
        {inviteReady && (
          <p className="muted" data-testid="invite-token" style={{ display: "none" }}>
            {acceptToken}
          </p>
        )}
        <label className="muted" style={{ display: "block", marginTop: 14 }}>
          Join with invitation code (if you received one)
          <input
            data-testid="invite-accept-token"
            value={acceptToken}
            onChange={(e) => setAcceptToken(e.target.value)}
            placeholder="Paste invitation code"
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              minHeight: 36,
            }}
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
            Join care circle
          </button>
        </div>
        {inviteMsg && (
          <p
            className="attention-limit"
            role="status"
            data-testid="invite-status"
          >
            {inviteMsg}
          </p>
        )}
      </section>

      {selected && (
        <section
          className="section surface-reported person-detail-panel"
          aria-label={`${selected.displayName} details`}
          data-testid="person-detail"
        >
          <h2
            style={{
              textTransform: "none",
              letterSpacing: "-0.02em",
              fontSize: "1.15rem",
              color: "var(--cr-graphite)",
            }}
          >
            {selected.displayName}
          </h2>
          <p className="muted">
            {selected.roleLabel}
            {contact?.relationship ? ` · ${contact.relationship}` : ""}
          </p>

          {contact && (
            <>
              <p>
                <strong>Preferred contact:</strong>{" "}
                {contact.preferredContact ?? "Not listed"}
              </p>
              {contact.availability && (
                <p>
                  <strong>Availability:</strong> {contact.availability}
                </p>
              )}
              {contact.phone && (
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                </p>
              )}
              {contact.email && (
                <p>
                  <strong>Email:</strong> {contact.email}
                </p>
              )}
              <p>
                <strong>What they help with</strong>
              </p>
              <ul className="list-plain">
                {contact.helpsWith.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="muted">{contact.accessPlain}</p>
            </>
          )}

          {!contact && (
            <>
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
            </>
          )}

          <div className="btn-row person-actions">
            {contact?.phone && (
              <a
                className="primary-btn"
                href={`tel:${contact.phone}`}
                data-testid="person-call"
              >
                Call
              </a>
            )}
            <button
              type="button"
              className="secondary-btn"
              data-testid="person-message"
              onClick={() =>
                onMessagePerson?.(selected.personId, selected.displayName)
              }
            >
              Message
            </button>
            {selected.personId === "p-dr-shah" ? (
              <button
                type="button"
                className="secondary-btn"
                data-testid="person-provider-update"
                onClick={() => onOpenRelayForProvider?.()}
              >
                Prepare update for clinic
              </button>
            ) : (
              <button
                type="button"
                className="secondary-btn"
                data-testid="person-handoff"
                onClick={() => onPrepareHandoff?.()}
              >
                Prepare handoff
              </button>
            )}
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </section>
      )}
    </>
  );
}
