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
import { getSessionIdentity } from "../foundation/careClient";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [packet, setPacket] = useState<HandoffPacket | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listHandoffs(rid);
    setRows(res.handoffs ?? []);
    setLoading(false);
  }, [rid]);

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
        ? `Acknowledged · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${session.displayName}`
        : next === "correction_required"
          ? "Flagged for clarification. The original handoff stays on file."
          : `Updated to ${next}`,
    );
    await load();
    if (activeId) await openHandoff(activeId);
  }

  // List all handoffs for this recipient (inbox is discovery surface)
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
              (packet.stillNeedsAttention ?? []).map((x) => <li key={x}>{x}</li>)
            )}
          </ul>

          {(packet.unfinishedWork?.length ?? 0) > 0 && (
            <>
              <h3>Open work ownership</h3>
              <ul className="list-plain" data-testid="incoming-work-owners">
                {packet.unfinishedWork!.map((w) => (
                  <li key={w.action}>
                    {w.action} · owner: {w.owner} · {w.status}
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
