/**
 * First-class incoming handoff inbox + acknowledgment.
 */
import { useCallback, useEffect, useState } from "react";
import {
  getHandoffLifecyclePacket,
  listHandoffs,
  transitionHandoff,
  type HandoffPacket,
  type HandoffRow,
} from "../foundation/careContinuity";
import {
  acceptOpenWork,
  clarifyOpenWork,
  confirmScheduleProposal,
  declineOpenWork,
  escalateOpenWork,
  listOpenWork,
  listScheduleProposals,
  reassignOpenWork,
  rejectScheduleProposal,
  type OpenWorkItem,
  type ScheduleProposal,
} from "../foundation/careOpenWork";
import { getSessionIdentity } from "../foundation/careClient";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import {
  formatCareDateTimeRecent,
  humanCareLine,
  workStatusLabel,
} from "../lib/humanCopy";
import { resolvePersonName } from "../lib/identity";

export function IncomingHandoffInbox({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId(session.carePersonId);
  const space = resolveCareSpace(rid, session.carePersonId);
  const [rows, setRows] = useState<HandoffRow[]>([]);
  const [sentRows, setSentRows] = useState<HandoffRow[]>([]);
  const [historyRows, setHistoryRows] = useState<HandoffRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [packet, setPacket] = useState<HandoffPacket | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workItems, setWorkItems] = useState<OpenWorkItem[]>([]);
  const [proposals, setProposals] = useState<ScheduleProposal[]>([]);
  const [confirmWorkId, setConfirmWorkId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listHandoffs(rid);
    const pid = session.carePersonId;
    if (res.buckets) {
      // Prefer primary_relevant (≤2) when present; keep sent/history for sections
      const primary = (res.buckets as { primary_relevant?: HandoffRow[] })
        .primary_relevant;
      setRows(
        primary && primary.length > 0
          ? primary.filter(
              (h) =>
                h.toPersonId === session.carePersonId ||
                h.fromPersonId === session.carePersonId,
            )
          : (res.buckets.incoming ?? []),
      );
      setSentRows(res.buckets.sent ?? []);
      setHistoryRows(res.buckets.history ?? []);
    } else {
      // Client-side partition when API has no buckets yet
      const all = res.handoffs ?? [];
      setRows(
        all.filter(
          (h) => h.toPersonId === pid && h.fromPersonId !== pid,
        ),
      );
      setSentRows(all.filter((h) => h.fromPersonId === pid));
      setHistoryRows([]);
    }
    const work = await listOpenWork(rid);
    if (work.ok) setWorkItems(work.work_items ?? []);
    const sched = await listScheduleProposals(rid);
    if (sched.ok) setProposals(sched.open ?? []);
    setLoading(false);
  }, [rid, session.carePersonId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function openHandoff(id: string) {
    setActiveId(id);
    setMsg(null);
    const res = await getHandoffLifecyclePacket(rid, id);
    if (!res.ok) {
      setMsg(res.message ?? "Could not load handoff");
      setPacket(null);
      return;
    }
    setPacket(res.packet ?? null);
    setStatus(res.lifecycle?.status ?? res.packet?.status ?? null);
    // Mark seen when opened
    if (res.lifecycle?.status === "sent" || res.lifecycle?.status === "delivered") {
      await transitionHandoff(rid, id, "seen");
      setStatus("seen");
    }
  }

  async function doTransition(next: string) {
    if (!activeId) return;
    setBusy(true);
    const res = await transitionHandoff(rid, activeId, next);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.message ?? "Could not update handoff");
      return;
    }
    setStatus(res.lifecycle?.status ?? next);
    setMsg(
      next === "acknowledged"
        ? `Handoff acknowledged · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${session.displayName}. Open tasks are still unassigned until you accept them.`
        : next === "correction_required"
          ? "Flagged for clarification. The original handoff stays on file."
          : `Updated to ${next}`,
    );
    await load();
    if (activeId) await openHandoff(activeId);
  }

  async function doAccept(workId: string) {
    setBusy(true);
    const res = await acceptOpenWork(rid, workId);
    setBusy(false);
    setConfirmWorkId(null);
    if (!res.ok) {
      setMsg(res.message ?? res.code ?? "Could not accept task");
      return;
    }
    setMsg(res.message ?? "You accepted this task. It is not marked complete.");
    await load();
  }

  async function doDecline(workId: string) {
    setBusy(true);
    const res = await declineOpenWork(rid, workId, "Declined from handoff inbox");
    setBusy(false);
    if (!res.ok) {
      setMsg(res.message ?? "Could not decline task");
      return;
    }
    setMsg(res.message ?? "Declined. Task remains open.");
    await load();
  }

  async function doClarify(workId: string) {
    setBusy(true);
    const res = await clarifyOpenWork(
      rid,
      workId,
      "Clarification requested from incoming handoff inbox",
    );
    setBusy(false);
    if (!res.ok) {
      setMsg(res.message ?? "Could not request clarification");
      return;
    }
    setMsg("Clarification requested. Original task details stay on file.");
    await load();
  }

  async function doEscalate(workId: string) {
    setBusy(true);
    const res = await escalateOpenWork(rid, workId, {
      reason: "No acceptance before deadline — escalate for care continuity",
      alternate_person_id: "p-sadeil",
      alternate_display_name: "Marcus Carter",
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(res.message ?? "Could not escalate");
      return;
    }
    setMsg(
      res.message ??
        "Escalated. Task remains open. Authorized helpers were notified.",
    );
    await load();
  }

  async function doReassign(workId: string) {
    // Coordinator path: offer to primary family controller when DSP declines
    setBusy(true);
    const res = await reassignOpenWork(rid, workId, {
      new_owner_person_id: "p-sadeil",
      new_owner_display_name: "Marcus Carter",
      note: "Offered after decline — they must accept",
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(res.message ?? "Could not reassign");
      return;
    }
    setMsg(
      res.message ??
        "Reassignment proposed. New owner must accept — not automatic.",
    );
    await load();
  }

  async function doConfirmProposal(id: string) {
    setBusy(true);
    const res = await confirmScheduleProposal(rid, id, {
      confirmed_starts_at_label: "Confirmed later slot (authorized)",
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(res.message ?? "Could not confirm schedule");
      return;
    }
    setMsg("Schedule change confirmed. Next appointment updated.");
    await load();
  }

  async function doRejectProposal(id: string) {
    setBusy(true);
    const res = await rejectScheduleProposal(rid, id, "Not applying this change");
    setBusy(false);
    if (!res.ok) {
      setMsg(res.message ?? "Could not reject proposal");
      return;
    }
    setMsg("Schedule proposal rejected. Prior appointment remains current.");
    await load();
  }

  // Incoming only — never list the signed-in user's own sent handoffs as tasks
  const pending = rows;

  return (
    <section
      className="section surface-known"
      data-testid="incoming-handoff-inbox"
      aria-label="Incoming care handoffs"
    >
      <h2 style={{ marginTop: 0 }}>Incoming handoff</h2>
      <p className="muted">
        Review what the previous caregiver left for {space.displayName}. Opening
        a handoff is not the same as acknowledging it.
      </p>

      {loading && <p className="muted">Loading handoffs…</p>}
      {!loading && pending.length === 0 && (
        <p className="muted" data-testid="handoff-inbox-empty">
          No handoff is waiting right now.
        </p>
      )}

      <ul className="list-plain" data-testid="handoff-inbox-list">
        {pending.slice(0, 8).map((h) => {
          const waiting =
            !packet ||
            activeId !== h.id ||
            (status !== "acknowledged" && status !== "completed");
          return (
            <li key={h.id}>
              <button
                type="button"
                className="member-card"
                data-testid={`handoff-inbox-item-${h.id}`}
                onClick={() => void openHandoff(h.id)}
              >
                <strong>
                  {waiting ? "Handoff waiting" : "Handoff acknowledged"}
                </strong>
                <span className="muted">
                  Sent by {resolvePersonName(h.fromPersonId, "Previous caregiver")}{" "}
                  ·{" "}
                  {h.createdAt
                    ? new Date(h.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "time on file"}
                </span>
                <span className="muted">
                  {(h.stillNeedsAttention?.length ?? 0) > 0
                    ? `${h.stillNeedsAttention.length} open item(s) need attention`
                    : "No open items listed"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {sentRows.length > 0 && (
        <div data-testid="handoff-sent-section" style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 8 }}>Sent by you</h3>
          <p className="muted">
            These are handoffs you authored — not incoming work.
          </p>
          <ul className="list-plain">
            {sentRows.slice(0, 5).map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="member-card"
                  data-testid={`handoff-sent-item-${h.id}`}
                  onClick={() => void openHandoff(h.id)}
                >
                  <strong>Sent handoff</strong>
                  <span className="muted">
                    To {resolvePersonName(h.toPersonId, "Next caregiver")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {historyRows.length > 0 && (
        <div data-testid="handoff-history-section" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Handoff history</h3>
          <ul className="list-plain">
            {historyRows.slice(0, 5).map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="member-card"
                  data-testid={`handoff-history-item-${h.id}`}
                  onClick={() => void openHandoff(h.id)}
                >
                  <strong>Past handoff</strong>
                  <span className="muted">
                    {resolvePersonName(h.fromPersonId, "Caregiver")} →{" "}
                    {resolvePersonName(h.toPersonId, "Next")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {packet && activeId && (
        <div
          className="surface-soft"
          data-testid="incoming-handoff-detail"
          style={{ marginTop: 16 }}
        >
          <p className="handoff-kicker" data-testid="handoff-ack-status">
            Status:{" "}
            <strong>
              {status === "acknowledged"
                ? "Acknowledged"
                : status === "seen"
                  ? "Seen — acknowledgment still required"
                  : status === "correction_required"
                    ? "Needs clarification"
                    : "Waiting for acknowledgment"}
            </strong>
          </p>
          {packet.acknowledgedAt && (
            <p className="muted" data-testid="handoff-ack-time">
              Acknowledged at{" "}
              {new Date(packet.acknowledgedAt).toLocaleString()}
            </p>
          )}

          <h3>What changed</h3>
          <ul className="list-plain" data-testid="incoming-what-changed">
            {(packet.whatChanged ?? []).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <h3>Still needs attention</h3>
          <ul className="list-plain" data-testid="incoming-open-items">
            {(packet.stillNeedsAttention ?? []).length === 0 ? (
              <li className="muted">Nothing listed</li>
            ) : (
              (packet.stillNeedsAttention ?? []).map((x) => (
                <li key={x}>{humanCareLine(x)}</li>
              ))
            )}
          </ul>

          <h3>Open work — accept separately</h3>
          <p className="muted" data-testid="open-work-ack-sep">
            Acknowledging this handoff does not assign these tasks to you.
          </p>
          <ul className="list-plain" data-testid="incoming-work-owners">
            {(workItems.length
              ? workItems
              : (packet.unfinishedWork ?? []).map((w, i) => ({
                  id: w.id ?? `text-${i}`,
                  action: w.action,
                  status: w.status,
                  ownerDisplayName: w.owner,
                  ownerPersonId: w.ownerPersonId,
                  dueAt: w.dueAt,
                }))
            ).map((w) => {
              const open =
                !w.ownerPersonId ||
                w.status === "available_to_claim" ||
                w.status === "unassigned";
              const mine =
                w.ownerPersonId === session.carePersonId ||
                w.status === "accepted" ||
                w.status === "claimed";
              return (
                <li
                  key={w.id}
                  className="surface-soft"
                  style={{ marginBottom: 10, padding: 12 }}
                  data-testid={`open-work-item-${w.id}`}
                >
                  <strong>{humanCareLine(w.action)}</strong>
                  <div className="muted">
                    Due:{" "}
                    {w.dueAt
                      ? formatCareDateTimeRecent(String(w.dueAt)) || "When able"
                      : "When able"}
                  </div>
                  <div className="muted">
                    Current owner: {w.ownerDisplayName ?? "Unassigned"} ·{" "}
                    {workStatusLabel(w.status)}
                  </div>
                  <div className="muted">
                    From open work · keeps care continuous across helpers
                  </div>
                  {confirmWorkId === w.id ? (
                    <div className="btn-row" style={{ marginTop: 8 }}>
                      <p className="muted">
                        Accept for {space.displayName}? You become owner; task
                        stays open (not completed).
                      </p>
                      <button
                        type="button"
                        className="primary-btn"
                        data-testid={`open-work-confirm-accept-${w.id}`}
                        disabled={busy}
                        onClick={() => void doAccept(w.id)}
                      >
                        Confirm accept
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        disabled={busy}
                        onClick={() => setConfirmWorkId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="btn-row" style={{ marginTop: 8 }}>
                      {open && (
                        <button
                          type="button"
                          className="primary-btn"
                          data-testid={`open-work-accept-${w.id}`}
                          disabled={busy}
                          onClick={() => setConfirmWorkId(w.id)}
                        >
                          Accept responsibility
                        </button>
                      )}
                      {open && (
                        <button
                          type="button"
                          className="secondary-btn"
                          data-testid={`open-work-decline-${w.id}`}
                          disabled={busy}
                          onClick={() => void doDecline(w.id)}
                        >
                          Decline
                        </button>
                      )}
                      <button
                        type="button"
                        className="secondary-btn"
                        data-testid={`open-work-clarify-${w.id}`}
                        disabled={busy}
                        onClick={() => void doClarify(w.id)}
                      >
                        Ask for clarification
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        data-testid={`open-work-reassign-${w.id}`}
                        disabled={busy}
                        onClick={() => void doReassign(w.id)}
                      >
                        Offer to coordinator
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        data-testid={`open-work-escalate-${w.id}`}
                        disabled={busy}
                        onClick={() => void doEscalate(w.id)}
                      >
                        Escalate (still open)
                      </button>
                      {mine && (
                        <span className="muted" data-testid="open-work-you-accepted">
                          You accepted this task.
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            {workItems.length === 0 &&
              (packet.unfinishedWork?.length ?? 0) === 0 && (
                <li className="muted">No open work items listed</li>
              )}
          </ul>

          {proposals.length > 0 && (
            <>
              <h3>Schedule proposals — confirm required</h3>
              <p className="muted">
                Handoff schedule language is not applied until someone authorized
                confirms.
              </p>
              <ul className="list-plain" data-testid="schedule-proposals-list">
                {proposals.map((p) => (
                  <li
                    key={p.id}
                    className="surface-soft"
                    style={{ marginBottom: 10, padding: 12 }}
                    data-testid={`schedule-proposal-${p.id}`}
                  >
                    <strong>{p.proposedTitle}</strong>
                    <div className="muted">{p.sourceText}</div>
                    <div className="muted">{p.proposedStartsAtLabel}</div>
                    <div className="btn-row" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="primary-btn"
                        data-testid={`schedule-confirm-${p.id}`}
                        disabled={busy}
                        onClick={() => void doConfirmProposal(p.id)}
                      >
                        Confirm schedule change
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        data-testid={`schedule-reject-${p.id}`}
                        disabled={busy}
                        onClick={() => void doRejectProposal(p.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {(packet.corrections?.length ?? 0) > 0 && (
            <>
              <h3>Recent corrections</h3>
              <ul className="list-plain">
                {packet.corrections!.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}

          {(packet.upcoming?.length ?? 0) > 0 && (
            <>
              <h3>Coming up</h3>
              <ul className="list-plain">
                {packet.upcoming!.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </>
          )}

          <div className="btn-row" data-testid="incoming-handoff-actions">
            <button
              type="button"
              className="primary-btn"
              data-testid="incoming-handoff-ack"
              disabled={busy || status === "acknowledged"}
              onClick={() => void doTransition("acknowledged")}
            >
              Acknowledge handoff
            </button>
            <button
              type="button"
              className="secondary-btn"
              data-testid="incoming-handoff-clarify"
              disabled={busy}
              onClick={() => void doTransition("correction_required")}
            >
              Needs clarification
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p className="muted" role="status" data-testid="incoming-handoff-msg">
          {msg}
        </p>
      )}
    </section>
  );
}
