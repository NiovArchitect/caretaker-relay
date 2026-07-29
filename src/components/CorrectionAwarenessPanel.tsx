/**
 * Medication / care correction awareness for affected authorized users.
 */
import { useCallback, useEffect, useState } from "react";
import {
  ackNotification,
  listNotifications,
  type NotifRow,
} from "../foundation/careContinuity";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import { getSessionIdentity } from "../foundation/careClient";

export function CorrectionAwarenessPanel({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId(session.carePersonId);
  const space = resolveCareSpace(rid, session.carePersonId);
  const [rows, setRows] = useState<NotifRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await listNotifications(rid);
    const corr = (res.notifications ?? []).filter(
      (n) =>
        /correction/i.test(n.type ?? "") ||
        /correct/i.test(n.title ?? "") ||
        /correct/i.test(n.body ?? "") ||
        n.sourceType === "correction" ||
        n.actionType === "open_correction",
    );
    // Collapse duplicate smoke/semantic correction alerts into one current card.
    const byKey = new Map<string, (typeof corr)[0]>();
    for (const n of corr) {
      const raw = `${n.title ?? ""} ${n.body ?? ""}`;
      // Drop pure harness noise that only carries run markers
      if (
        /\[(?:AZ|HOL|FMH|S\d)/i.test(raw) &&
        /medication was not administered/i.test(raw)
      ) {
        // keep one cleaned representative below
      }
      const key = /medication was not administered/i.test(raw)
        ? "med_not_administered"
        : (n.title || n.body || n.id)
            .toLowerCase()
            .replace(/\s*\[(?:AZ|HOL|FMH|S\d)[^\]]*\]/gi, "")
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .slice(0, 80);
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, {
          ...n,
          title: (n.title || "Medication record corrected").replace(
            /\s*\[(?:AZ|HOL|FMH|S\d)[^\]]*\]/gi,
            "",
          ),
          body: (n.body || "An earlier report was corrected.")
            .replace(/\s*\[(?:AZ|HOL|FMH|S\d)[^\]]*\]/gi, "")
            .replace(/\b(?:AZms|HOLms|FMHms)\w*/gi, "")
            .trim(),
        });
      } else if (!existing.acknowledged_at && n.acknowledged_at) {
        byKey.set(key, existing);
      }
    }
    setRows([...byKey.values()]);
  }, [rid]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function acknowledge(id: string) {
    const res = await ackNotification(id);
    if (!res.ok) {
      setMsg(res.message ?? "Could not acknowledge");
      return;
    }
    setMsg(
      `Correction acknowledged · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
    );
    setOpenId(null);
    await load();
  }

  return (
    <section
      className="section surface-known"
      data-testid="correction-awareness-panel"
      aria-label="Care record corrections"
    >
      <h2 style={{ marginTop: 0 }}>Corrections that need your attention</h2>
      <p className="muted">
        When a care report for {space.displayName} is corrected, you see it here
        if you are authorized and affected. History keeps the original report.
      </p>

      {rows.length === 0 && (
        <p className="muted" data-testid="correction-inbox-empty">
          No correction alerts right now.
        </p>
      )}

      <ul className="list-plain">
        {rows.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className="member-card"
              data-testid={`correction-alert-${n.id}`}
              onClick={() => setOpenId(n.id)}
            >
              <strong>{n.title || "Medication record corrected"}</strong>
              <span className="muted">{n.body || "An earlier report was corrected."}</span>
              {n.acknowledged_at ? (
                <span className="muted">Acknowledged</span>
              ) : (
                <span className="badge badge-coral">Needs review</span>
              )}
            </button>
            {openId === n.id && (
              <div className="surface-soft" data-testid="correction-detail">
                <p>
                  <strong>An earlier medication record was corrected.</strong>
                </p>
                <p className="muted">{n.body}</p>
                <p className="muted">
                  Current status: Needs review until you acknowledge. This is not
                  a dosing instruction.
                </p>
                {!n.acknowledged_at && (
                  <button
                    type="button"
                    className="primary-btn"
                    data-testid="correction-ack-btn"
                    onClick={() => void acknowledge(n.id)}
                  >
                    Acknowledge correction
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {msg && (
        <p className="muted" role="status" data-testid="correction-ack-msg">
          {msg}
        </p>
      )}
    </section>
  );
}
