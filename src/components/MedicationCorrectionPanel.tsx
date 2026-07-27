/**
 * Two-user medication correction awareness — current truth vs history.
 */
import { useEffect, useMemo, useState } from "react";
import {
  fetchCareState,
  getSessionIdentity,
  proposeCareUpdate,
  confirmCareUpdateAsync,
  type CareStateSnapshot,
} from "../foundation/careClient";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import { formatCareDateTime } from "../lib/humanCopy";
import { resolvePersonName } from "../lib/identity";

function str(v: unknown) {
  return v == null ? "" : String(v);
}

export function MedicationCorrectionPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId(session.carePersonId);
  const space = resolveCareSpace(rid, session.carePersonId);
  const [state, setState] = useState<CareStateSnapshot | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [alertSeen, setAlertSeen] = useState(false);

  useEffect(() => {
    void fetchCareState().then((s) => setState(s));
  }, [refreshKey, rid]);

  const records = useMemo(() => {
    const rows = (state?.medicationRecords ?? []) as Array<Record<string, unknown>>;
    return [...rows].sort((a, b) =>
      str(b.administeredAt).localeCompare(str(a.administeredAt)),
    );
  }, [state]);

  const current = records.find((r) => str(r.status) !== "voided");
  const voided = records.filter((r) => str(r.status) === "voided");
  const hasCorrection = voided.length > 0;

  async function reportAdministered() {
    setBusy(true);
    setMsg(null);
    try {
      const text = `Medication administered at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} for ${space.displayName}.`;
      const p = await proposeCareUpdate(text);
      if (p.kind === "verify" && p.bundle) {
        const s = await confirmCareUpdateAsync(p.bundle);
        setMsg(
          s.kind === "persisted"
            ? `Saved as caregiver-reported · ${session.displayName} · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : s.message ?? "Not saved",
        );
        const st = await fetchCareState();
        setState(st);
      } else {
        setMsg(p.message ?? "Could not structure report");
      }
    } finally {
      setBusy(false);
    }
  }

  async function correctNotAdministered() {
    setBusy(true);
    setMsg(null);
    try {
      const text = `Correction: medication was not administered. Earlier report was incorrect.`;
      const p = await proposeCareUpdate(text);
      if (p.kind === "verify" && p.bundle) {
        const s = await confirmCareUpdateAsync(p.bundle);
        setMsg(
          s.kind === "persisted"
            ? `Correction saved · current status: not administered · ${session.displayName}`
            : s.message ?? "Correction not saved",
        );
        setAlertSeen(false);
        const st = await fetchCareState();
        setState(st);
      } else {
        // Fallback: show honest local guidance if structure fails
        setMsg(
          p.message ??
            "Record the correction in Relay or documentation: medication was not administered.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="section surface-known"
      data-testid="med-correction-panel"
      aria-label="Medication administration and corrections"
    >
      <h3 style={{ marginTop: 0 }}>Medication administration</h3>
      <p className="muted">
        Reports stay on file. Corrections update current truth without erasing
        history. This is not a dosing instruction.
      </p>

      {hasCorrection && !alertSeen && (
        <div
          className="attention-banner"
          role="status"
          data-testid="med-correction-alert"
        >
          <strong>An earlier medication record was corrected.</strong>
          <p className="muted" style={{ marginBottom: 8 }}>
            Review the current status before acting. Open the history for the
            original report.
          </p>
          <button
            type="button"
            className="secondary-btn"
            data-testid="med-correction-ack"
            onClick={() => setAlertSeen(true)}
          >
            Mark as seen
          </button>
        </div>
      )}

      <div className="med-current-truth" data-testid="med-current-truth">
        <h4>Current status</h4>
        {!current && voided.length === 0 && (
          <p className="muted">No administration has been recorded yet.</p>
        )}
        {current && str(current.status) !== "voided" && (
          <p>
            <strong>
              {str(current.epistemicStatus) === "CONFIRMED"
                ? "Confirmed"
                : "Caregiver reported"}
              :
            </strong>{" "}
            {str(current.name) || "Medication"} ·{" "}
            {str(current.doseRecorded) || str(current.dose) || "dose on file"} ·{" "}
            {formatCareDateTime(str(current.administeredAt))} · by{" "}
            {resolvePersonName(
              str(current.administeredByPersonId) || undefined,
              str(
                (current.source as { actorName?: string } | undefined)
                  ?.actorName,
              ) || undefined,
            )}
          </p>
        )}
        {hasCorrection && !current && (
          <p data-testid="med-corrected-banner">
            <strong>Corrected: Not administered</strong> (per latest correction
            on file). History below keeps the original report.
          </p>
        )}
      </div>

      {voided.length > 0 && (
        <div data-testid="med-correction-history">
          <h4>History (superseded reports)</h4>
          <ul>
            {voided.slice(0, 5).map((r) => (
              <li key={str(r.id)}>
                Originally reported as administered ·{" "}
                {formatCareDateTime(str(r.administeredAt))} ·{" "}
                {resolvePersonName(
                  str(r.administeredByPersonId) || undefined,
                  undefined,
                )}{" "}
                · <em>voided / corrected</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="primary-btn"
          data-testid="med-report-admin"
          disabled={busy}
          onClick={() => void reportAdministered()}
        >
          Record as administered
        </button>
        <button
          type="button"
          className="secondary-btn"
          data-testid="med-correct-not-admin"
          disabled={busy}
          onClick={() => void correctNotAdministered()}
        >
          Correct: not administered
        </button>
      </div>
      {msg && (
        <p className="muted" role="status" data-testid="med-correction-msg">
          {msg}
        </p>
      )}
    </section>
  );
}
