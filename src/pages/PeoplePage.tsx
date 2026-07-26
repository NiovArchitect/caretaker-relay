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
  const [coverageNote, setCoverageNote] = useState("");
  const [coverageStatus, setCoverageStatus] = useState<string | null>(null);
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

  // Rebind when recipient context changes
  useEffect(() => {
    reload();
  }, [space.careRecipientId]);

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

  const canInvite =
    /primary/i.test(session.roleLabel) ||
    session.carePersonId === "p-sadeil";

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

      <section
        className="section surface-known privacy-access-card"
        aria-label="Privacy and access"
        data-testid="privacy-access-card"
      >
        <h2>Privacy, dignity, and access</h2>
        <p className="muted section-lead">
          Only people in {space.preferredName}&apos;s care circle can see care
          details. Each person&apos;s role controls what they can view and do.
          Information is never mixed across care recipients.
        </p>
        <ul className="list-plain">
          <li>
            <strong>You:</strong> {session.displayName}
            {session.roleLabel ? ` · ${session.roleLabel}` : ""}
          </li>
          <li>
            <strong>Active care:</strong> {space.displayName}
            {canInvite ? " · you can invite people" : " · invite needs primary contact"}
          </li>
          <li>
            <strong>Share a summary:</strong> Documents → Prepare care summary
          </li>
          <li data-testid="access-control-honesty">
            <strong>Access changes:</strong> Open a person to see what they can
            see and do. Removing someone requires the primary circle contact
            (or organization admin). Unauthorized access is blocked
            automatically.
          </li>
        </ul>
      </section>

      <section className="section" aria-label="Care circle">
        <h2>Authorized people</h2>
        {loading && <p className="muted cr-empty">Loading care circle…</p>}
        {!loading && members.length === 0 && (
          <p className="muted cr-empty">No authorized members returned.</p>
        )}
        {members.map((member) => (
          <div
            key={member.personId}
            className="member-card member-card-row"
            data-testid={`person-${member.personId}`}
          >
            <button
              type="button"
              className="member-card-main"
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
            <button
              type="button"
              className="btn-comm btn-with-icon member-card-message"
              data-testid={`person-message-quick-${member.personId}`}
              data-action-kind="communication"
              onClick={() =>
                onMessagePerson?.(member.personId, member.displayName)
              }
            >
              <span className="btn-glyph" aria-hidden>
                ✉
              </span>
              Message
            </button>
          </div>
        ))}
      </section>

      <section
        className="section surface-reported"
        aria-label="Care circle invitations"
        data-testid="invite-section"
      >
        <h2>Care circle access</h2>
        {canInvite ? (
          <>
            <p className="muted section-lead">
              As primary circle contact, you can invite people to help with{" "}
              {space.preferredName}. Each person only sees what their role
              allows. You stay accountable for who you invite.
            </p>
            <label className="cr-field">
              <span>Who to invite</span>
              <select
                data-testid="invite-person"
                value={inviteeId}
                onChange={(e) => setInviteeId(e.target.value)}
              >
                <option value="p-maya">
                  Maya Bennett · Family / friend caregiver
                </option>
                <option value="p-walter">
                  Daniel Kim · Professional caregiver
                </option>
              </select>
            </label>
            <div className="btn-row">
              <button
                type="button"
                className="btn-comm btn-with-icon"
                data-testid="invite-create"
                data-action-kind="communication"
                disabled={inviteBusy}
                onClick={() => void onInvite()}
              >
                <span className="btn-glyph" aria-hidden>
                  ✉
                </span>
                Send invitation
              </button>
            </div>
          </>
        ) : (
          <p className="muted section-lead" data-testid="invite-not-authorized">
            Only the primary circle contact can invite new people for{" "}
            {space.preferredName}. If you need access, ask them for an invitation
            code.
          </p>
        )}
        {inviteReady && (
          <p className="muted" data-testid="invite-token" style={{ display: "none" }}>
            {acceptToken}
          </p>
        )}
        <label className="cr-field" style={{ marginTop: 16 }}>
          <span>Have an invitation code?</span>
          <input
            data-testid="invite-accept-token"
            value={acceptToken}
            onChange={(e) => setAcceptToken(e.target.value)}
            placeholder="Paste your code"
          />
        </label>
        <div className="btn-row">
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

      <section
        className="section surface-known"
        aria-label="Coverage"
        data-testid="coverage-section"
      >
        <h2>Coverage</h2>
        <p className="muted section-lead">
          Ask people already in {space.preferredName}&apos;s circle for help
          covering time. This is private circle coverage — not a public
          marketplace, and not emergency dispatch.
        </p>
        <label className="cr-field">
          <span>What do you need?</span>
          <textarea
            data-testid="coverage-request-note"
            value={coverageNote}
            onChange={(e) => setCoverageNote(e.target.value)}
            rows={2}
            placeholder={`e.g. Need someone with ${space.preferredName} Thursday 2–6 PM`}
          />
        </label>
        <div className="btn-row">
          <button
            type="button"
            className="secondary-btn btn-with-icon"
            data-testid="coverage-request-send"
            disabled={!coverageNote.trim()}
            onClick={() => {
              const note = coverageNote.trim();
              const backup =
                members.find(
                  (m) =>
                    m.personId !== session.carePersonId &&
                    m.status === "active",
                ) ?? members.find((m) => m.personId !== session.carePersonId);
              setCoverageStatus(
                `Coverage need noted for ${space.preferredName}: “${note}”. ` +
                  (backup
                    ? `Open Coordination to confirm with ${backup.displayName}.`
                    : "Message someone in the circle above to confirm."),
              );
              setCoverageNote("");
              if (backup) {
                onMessagePerson?.(backup.personId, backup.displayName);
              }
            }}
          >
            Request help from circle
          </button>
        </div>
        {coverageStatus && (
          <p className="attention-limit" role="status" data-testid="coverage-status">
            {coverageStatus}
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
                className="btn-comm btn-with-icon"
                href={`tel:${contact.phone}`}
                data-testid="person-call"
                data-action-kind="communication"
              >
                <span className="btn-glyph" aria-hidden>
                  ☎
                </span>
                Call
              </a>
            )}
            <button
              type="button"
              className="btn-comm btn-with-icon"
              data-testid="person-message"
              data-action-kind="communication"
              onClick={() =>
                onMessagePerson?.(selected.personId, selected.displayName)
              }
            >
              <span className="btn-glyph" aria-hidden>
                ✉
              </span>
              Message in Coordination
            </button>
            {selected.personId === "p-dr-shah" ? (
              <button
                type="button"
                className="btn-verify btn-with-icon"
                data-testid="person-provider-update"
                data-action-kind="verify"
                onClick={() => onOpenRelayForProvider?.()}
              >
                <span className="btn-glyph" aria-hidden>
                  ◈
                </span>
                Prepare update for clinic
              </button>
            ) : (
              <button
                type="button"
                className="secondary-btn btn-with-icon"
                data-testid="person-handoff"
                data-action-kind="secondary"
                onClick={() => onPrepareHandoff?.()}
              >
                <span className="btn-glyph" aria-hidden>
                  ⇄
                </span>
                Prepare handoff
              </button>
            )}
            <button
              type="button"
              className="ghost-btn btn-with-icon"
              data-action-kind="quiet"
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
