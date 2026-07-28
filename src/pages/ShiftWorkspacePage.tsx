/**
 * DSP / paid-caregiver shift workspace — invitation through expiry.
 * Driven by public care API shift endpoints; human language only.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completeShiftHandoffApi,
  listShifts,
  respondShift,
  type ShiftDto,
} from "../foundation/careShifts";
import {
  deriveShiftUiPhase,
  formatShiftTime,
  phaseGuidance,
  phaseHeadline,
  allowsGeneralRelay,
  allowsDocumentationOnly,
  DOC_WINDOW_MS,
  type ShiftUiPhase,
} from "../lib/shiftPhase";
import {
  getSessionIdentity,
  proposeCareUpdate,
  confirmCareUpdateAsync,
  fetchCareState,
  fetchLatestHandoff,
} from "../foundation/careClient";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import {
  getHandoffLifecyclePacket,
  listHandoffs,
} from "../foundation/careContinuity";
import { IncomingHandoffInbox } from "../components/IncomingHandoffInbox";
import { CorrectionAwarenessPanel } from "../components/CorrectionAwarenessPanel";

function pickMine(shifts: ShiftDto[], personId: string): ShiftDto | null {
  const mine = shifts
    .filter((s) => s.assigneePersonId === personId)
    .sort((a, b) => b.shiftStart.localeCompare(a.shiftStart));
  // Prefer active / pre / doc over pure expired
  const order: ShiftUiPhase[] = [
    "active",
    "ending",
    "pre_shift",
    "documentation_window",
    "scheduled",
    "invited",
  ];
  for (const ph of order) {
    const hit = mine.find((s) => deriveShiftUiPhase(s) === ph);
    if (hit) return hit;
  }
  return mine[0] ?? null;
}

export function ShiftWorkspacePage({
  refreshKey = 0,
  onOpenRelay,
  onRelayBlocked,
}: {
  refreshKey?: number;
  onOpenRelay?: () => void;
  onRelayBlocked?: (reason: string) => void;
}) {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId(session.carePersonId);
  const space = resolveCareSpace(rid, session.carePersonId);
  const [shifts, setShifts] = useState<ShiftDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [obsText, setObsText] = useState("");
  const [handoffChanged, setHandoffChanged] = useState("");
  const [handoffOpen, setHandoffOpen] = useState("");
  const [toPersonId, setToPersonId] = useState("");
  const [briefing, setBriefing] = useState<{
    handoffLines: string[];
    tasks: string[];
    appts: string[];
    obs: string[];
    prefs: string[];
    corrections: string[];
  } | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listShifts(rid);
    if (!res.ok) {
      setError(res.message);
      setShifts([]);
    } else {
      setShifts(res.shifts);
    }
    setLoading(false);
  }, [rid]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  // Rich pre-shift briefing from live handoff + care state
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [state, hands] = await Promise.all([
        fetchCareState(),
        listHandoffs(rid),
      ]);
      if (cancelled) return;
      const latest = hands.handoffs?.[0];
      let handoffLines: string[] = [];
      let corrections: string[] = [];
      if (latest) {
        const pack = await getHandoffLifecyclePacket(rid, latest.id);
        if (pack.ok && pack.packet) {
          handoffLines = [
            ...(pack.packet.whatChanged ?? []).map((x) => `Changed: ${x}`),
            ...(pack.packet.stillNeedsAttention ?? []).map(
              (x) => `Needs attention: ${x}`,
            ),
          ];
          corrections = pack.packet.corrections ?? [];
        }
      } else {
        const ho = await fetchLatestHandoff();
        if (ho) {
          handoffLines = [
            ...ho.whatChanged.map((x) => `Changed: ${x}`),
            ...ho.stillNeedsAttention.map((x) => `Needs attention: ${x}`),
          ];
        }
      }
      const tasks = (state?.tasks ?? [])
        .filter((t) => {
          const st = String((t as { status?: string }).status ?? "");
          return st !== "done" && st !== "completed" && st !== "cancelled";
        })
        .slice(0, 6)
        .map((t) => String((t as { title?: string }).title ?? "Task"));
      const appts = (state?.appointments ?? [])
        .filter((a) => String((a as { status?: string }).status) !== "cancelled")
        .slice(0, 4)
        .map((a) => {
          const r = a as { title?: string; startsAtLabel?: string; startsAt?: string };
          return `${r.title ?? "Appointment"} · ${r.startsAtLabel ?? r.startsAt ?? ""}`;
        });
      const obs = (state?.observations ?? [])
        .slice(-4)
        .map((o) => String((o as { summary?: string }).summary ?? "Observation"));
      setBriefing({
        handoffLines,
        tasks,
        appts,
        obs,
        prefs: [
          "Support at the recipient’s pace",
          "Confirm before consequential changes",
        ],
        corrections,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [rid, refreshKey, tick]);

  // Bounded poll so pre-shift → active transitions surface without hard refresh
  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      void load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const mine = useMemo(
    () => pickMine(shifts, session.carePersonId),
    [shifts, session.carePersonId, tick],
  );
  const phase = mine ? deriveShiftUiPhase(mine) : null;
  const docEnd =
    mine && !Number.isNaN(Date.parse(mine.shiftEnd))
      ? formatShiftTime(
          new Date(Date.parse(mine.shiftEnd) + DOC_WINDOW_MS).toISOString(),
        )
      : undefined;

  async function onAcceptDecline(decision: "accept" | "decline") {
    if (!mine) return;
    setBusy(true);
    setStatusMsg(null);
    const res = await respondShift(rid, mine.id, decision);
    setBusy(false);
    if (!res.ok) {
      setStatusMsg(res.message);
      return;
    }
    setStatusMsg(
      decision === "accept"
        ? "Assignment accepted. Your briefing appears when the preparation window opens."
        : "Shift declined. The coordinator can arrange coverage.",
    );
    await load();
  }

  async function saveObservation() {
    const t = obsText.trim();
    if (!t || !mine) return;
    if (phase !== "active" && phase !== "ending" && phase !== "documentation_window") {
      setStatusMsg("Observations can be saved during your shift or documentation window.");
      return;
    }
    setBusy(true);
    setStatusMsg(null);
    try {
      const proposed = await proposeCareUpdate(t);
      if (proposed.kind === "verify" && proposed.bundle) {
        const saved = await confirmCareUpdateAsync(proposed.bundle);
        if (saved.kind === "persisted") {
          setStatusMsg(
            `Saved · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${space.displayName} · ${session.displayName}`,
          );
          setObsText("");
        } else {
          setStatusMsg(saved.message ?? "Could not save.");
        }
      } else {
        setStatusMsg(proposed.message ?? "Could not structure that note.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendHandoff() {
    if (!mine) return;
    const changed = handoffChanged
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const open = handoffOpen
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!changed.length && !open.length) {
      setStatusMsg("Add what changed and what still needs attention.");
      return;
    }
    setBusy(true);
    const res = await completeShiftHandoffApi(
      rid,
      mine.id,
      changed,
      open,
      toPersonId.trim() || undefined,
    );
    setBusy(false);
    if (!res.ok) {
      setStatusMsg(res.message);
      return;
    }
    setStatusMsg(
      toPersonId.trim()
        ? "Handoff saved and marked sent for the next caregiver."
        : "Handoff saved for the next caregiver.",
    );
    setHandoffChanged("");
    setHandoffOpen("");
    await load();
  }

  function tryOpenRelay() {
    if (!phase) {
      onOpenRelay?.();
      return;
    }
    if (allowsGeneralRelay(phase)) {
      onOpenRelay?.();
      return;
    }
    if (allowsDocumentationOnly(phase)) {
      onRelayBlocked?.(
        "Your operational shift access has ended. During the documentation window you may only finish handoff notes and correct your own reports.",
      );
      return;
    }
    onRelayBlocked?.(
      "Relay care questions are not available for this assignment state. Accept a shift or wait for your preparation window.",
    );
  }

  if (loading && !mine) {
    return (
      <section className="section surface-known" data-testid="shift-workspace">
        <p className="muted">Loading your assignments…</p>
      </section>
    );
  }

  if (!mine) {
    return (
      <section className="section surface-known" data-testid="shift-workspace">
        <h2 style={{ marginTop: 0 }}>My shift</h2>
        <p className="muted" data-testid="shift-empty">
          No shift assignment is linked to you for {space.displayName} right
          now. When a coordinator invites you, it will appear here.
        </p>
      </section>
    );
  }

  const ph = phase!;
  const startL = formatShiftTime(mine.shiftStart);
  const endL = formatShiftTime(mine.shiftEnd);

  return (
    <section className="section surface-known" data-testid="shift-workspace">
      <header className="shift-workspace-head">
        <p className="muted" data-testid="shift-recipient">
          Caring for <strong>{space.displayName}</strong>
        </p>
        <h2 style={{ marginTop: 4 }} data-testid="shift-phase-title">
          {phaseHeadline(ph)}
        </h2>
        <p className="muted" data-testid="shift-phase-guidance">
          {phaseGuidance(ph, docEnd)}
        </p>
        <p data-testid="shift-window">
          <strong>Shift time:</strong> {startL} – {endL}
        </p>
        {mine.scopeNote && (
          <p className="muted" data-testid="shift-scope">
            Scope: {mine.scopeNote}
          </p>
        )}
        <p className="muted" data-testid="shift-status-chip">
          Status: {mine.status.replace(/_/g, " ")}
        </p>
      </header>

      {error && (
        <p className="attention-limit" role="alert">
          {error}
        </p>
      )}
      {statusMsg && (
        <p className="muted" role="status" data-testid="shift-status-msg">
          {statusMsg}
        </p>
      )}

      {ph === "invited" && (
        <div className="btn-row" data-testid="shift-invite-actions">
          <button
            type="button"
            className="primary-btn"
            data-testid="shift-accept"
            disabled={busy}
            onClick={() => void onAcceptDecline("accept")}
          >
            Accept assignment
          </button>
          <button
            type="button"
            className="secondary-btn"
            data-testid="shift-decline"
            disabled={busy}
            onClick={() => void onAcceptDecline("decline")}
          >
            Decline
          </button>
        </div>
      )}

      {(ph === "scheduled" || ph === "pre_shift") && (
        <div className="surface-soft" data-testid="shift-prep-card">
          <h3 style={{ marginTop: 0 }} data-testid="pre-shift-briefing-title">
            {ph === "pre_shift" ? "Your shift briefing" : "Preparation"}
          </h3>
          <p>
            {ph === "scheduled"
              ? `Your care briefing becomes available at ${startL} (within the preparation window before start).`
              : "Review the previous handoff and today’s tasks. Family-private and out-of-scope clinical detail stay closed."}
          </p>
          {ph === "pre_shift" && briefing && (
            <div data-testid="rich-pre-shift-briefing">
              <h4>Your shift</h4>
              <p>
                {space.displayName} · {startL} – {endL}
              </p>
              <h4>What changed / handoff</h4>
              <ul className="list-plain" data-testid="briefing-handoff">
                {briefing.handoffLines.length === 0 ? (
                  <li className="muted">No prior handoff lines on file yet.</li>
                ) : (
                  briefing.handoffLines.map((l) => <li key={l}>{l}</li>)
                )}
              </ul>
              <h4>What needs attention</h4>
              <ul className="list-plain" data-testid="briefing-tasks">
                {briefing.tasks.length === 0 ? (
                  <li className="muted">No open tasks listed.</li>
                ) : (
                  briefing.tasks.map((t) => <li key={t}>{t}</li>)
                )}
              </ul>
              {(briefing.corrections.length > 0 || briefing.obs.length > 0) && (
                <>
                  <h4>Recent observations &amp; corrections</h4>
                  <ul className="list-plain" data-testid="briefing-obs">
                    {[...briefing.corrections, ...briefing.obs].map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </>
              )}
              <h4>Coming up</h4>
              <ul className="list-plain" data-testid="briefing-upcoming">
                {briefing.appts.length === 0 ? (
                  <li className="muted">No appointments listed.</li>
                ) : (
                  briefing.appts.map((a) => <li key={a}>{a}</li>)
                )}
              </ul>
              <h4>How to support</h4>
              <ul className="list-plain">
                {briefing.prefs.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {ph === "pre_shift" && (
            <button
              type="button"
              className="secondary-btn"
              data-testid="shift-open-relay-prep"
              onClick={tryOpenRelay}
            >
              Open Relay for shift briefing
            </button>
          )}
        </div>
      )}

      {(ph === "active" || ph === "ending") && (
        <div data-testid="shift-active-workspace">
          <h3>During this visit</h3>
          <p className="muted">
            Record observations and complete work as you go. Each save is timed
            and attributed to you.
          </p>
          <label className="cr-field">
            <span>Observation or visit note</span>
            <textarea
              data-testid="shift-observation-input"
              rows={3}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              placeholder={`What you observed for ${space.displayName}…`}
            />
          </label>
          <div className="btn-row">
            <button
              type="button"
              className="primary-btn"
              data-testid="shift-save-observation"
              disabled={busy || !obsText.trim()}
              onClick={() => void saveObservation()}
            >
              Save note
            </button>
            <button
              type="button"
              className="secondary-btn"
              data-testid="shift-open-relay-active"
              onClick={tryOpenRelay}
            >
              Ask Relay
            </button>
          </div>

          <h3 style={{ marginTop: 20 }}>Handoff for the next caregiver</h3>
          <label className="cr-field">
            <span>What changed (one item per line)</span>
            <textarea
              data-testid="shift-handoff-changed"
              rows={3}
              value={handoffChanged}
              onChange={(e) => setHandoffChanged(e.target.value)}
            />
          </label>
          <label className="cr-field">
            <span>Still needs attention (one item per line)</span>
            <textarea
              data-testid="shift-handoff-open"
              rows={3}
              value={handoffOpen}
              onChange={(e) => setHandoffOpen(e.target.value)}
            />
          </label>
          <label className="cr-field">
            <span>Incoming caregiver person ID (optional, for acknowledgment)</span>
            <input
              data-testid="shift-handoff-to"
              value={toPersonId}
              onChange={(e) => setToPersonId(e.target.value)}
              placeholder="e.g. p-maya or p-walter"
            />
          </label>
          <button
            type="button"
            className="primary-btn"
            data-testid="shift-send-handoff"
            disabled={busy}
            onClick={() => void sendHandoff()}
          >
            Save and send handoff
          </button>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <IncomingHandoffInbox refreshKey={tick + refreshKey} />
      </div>
      <div style={{ marginTop: 16 }}>
        <CorrectionAwarenessPanel refreshKey={tick + refreshKey} />
      </div>

      {ph === "documentation_window" && (
        <div data-testid="shift-doc-window">
          <p>
            You may only finish your handoff or correct notes from this shift —
            not browse the full care record.
          </p>
          <label className="cr-field">
            <span>Final note or correction</span>
            <textarea
              data-testid="shift-doc-note"
              rows={3}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
            />
          </label>
          <div className="btn-row">
            <button
              type="button"
              className="primary-btn"
              data-testid="shift-doc-save"
              disabled={busy || !obsText.trim()}
              onClick={() => void saveObservation()}
            >
              Save shift note
            </button>
            <button
              type="button"
              className="secondary-btn"
              data-testid="shift-doc-handoff"
              disabled={busy}
              onClick={() => void sendHandoff()}
            >
              Finalize handoff
            </button>
          </div>
          <button
            type="button"
            className="ghost-btn"
            data-testid="shift-doc-relay-blocked"
            onClick={tryOpenRelay}
          >
            Why can’t I open general Relay?
          </button>
        </div>
      )}

      {(ph === "expired" || ph === "completed" || ph === "revoked") && (
        <div data-testid="shift-expired-panel">
          <p>
            You no longer have access to this care space for this assignment.
          </p>
          <ul>
            <li>Return to your other assignments from People or Today.</li>
            <li>Contact your coordinator if this is unexpected.</li>
          </ul>
        </div>
      )}
    </section>
  );
}
