/**
 * Two-user medication correction awareness — current truth vs history.
 * State-aware actions; no duplicate identical writes; corrections preserve history.
 */
import { useEffect, useMemo, useRef, useState } from "react";
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

type AdminUiState =
  | "none"
  | "administered"
  | "not_administered"
  | "uncertain";

export function MedicationCorrectionPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId(session.carePersonId);
  const space = resolveCareSpace(rid, session.carePersonId);
  const [state, setState] = useState<CareStateSnapshot | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [alertSeen, setAlertSeen] = useState(false);
  const lastIdempotencyKey = useRef<string | null>(null);

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

  const uiState: AdminUiState = useMemo(() => {
    if (!current && hasCorrection) return "not_administered";
    if (!current) return "none";
    const dose = `${str(current.doseRecorded)} ${str(current.name)} ${str(current.status)}`.toLowerCase();
    if (/not\s+admin|voided|refused/.test(dose)) return "not_administered";
    if (str(current.epistemicStatus) === "UNCERTAIN") return "uncertain";
    return "administered";
  }, [current, hasCorrection]);

  function idemKey(action: string): string {
    const med =
      str(current?.id) ||
      str(current?.name) ||
      "lunch-med";
    return `${rid}|${session.carePersonId}|${med}|${action}`;
  }

  async function reportAdministered() {
    if (uiState === "administered") {
      setMsg("This record already says the medication was administered.");
      return;
    }
    const key = idemKey("administered");
    if (lastIdempotencyKey.current === key && busy) return;
    lastIdempotencyKey.current = key;
    setBusy(true);
    setMsg(null);
    try {
      const text = `Medication administered at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} for ${space.displayName}.`;
      const p = await proposeCareUpdate(text);
      if (p.kind === "verify" && p.bundle) {
        const s = await confirmCareUpdateAsync(p.bundle);
        setMsg(
          s.kind === "persisted"
            ? `Saved as caregiver-reported · current status: administered · ${session.displayName} · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
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
    if (uiState === "not_administered") {
      setMsg("This record already says the medication was not administered.");
      return;
    }
    const key = idemKey("not_administered");
    if (lastIdempotencyKey.current === key && busy) return;
    lastIdempotencyKey.current = key;
    setBusy(true);
    setMsg(null);
    try {
      const text = `Correction: medication was not administered. Earlier report was incorrect.`;
      const p = await proposeCareUpdate(text);
      if (p.kind === "verify" && p.bundle) {
        const s = await confirmCareUpdateAsync(p.bundle);
        setMsg(
          s.kind === "persisted"
            ? `Correction saved · current status: not administered · ${session.displayName}. Original report remains in history.`
            : s.message ?? "Correction not saved",
        );
        setAlertSeen(false);
        const st = await fetchCareState();
        setState(st);
      } else {
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
        {uiState === "none" && (
          <p className="muted">No administration has been recorded yet.</p>
        )}
        {uiState === "administered" && current && (
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
        {uiState === "not_administered" && (
          <p data-testid="med-corrected-banner">
            <strong>Current record: medication was not administered</strong>
            {hasCorrection
              ? " (correction on file). History below keeps the original report."
              : "."}
          </p>
        )}
        {uiState === "uncertain" && current && (
          <p>
            <strong>Uncertain:</strong> reports disagree or are incomplete for{" "}
            {str(current.name) || "this medication"}. Review history before
            confirming.
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
        {uiState === "none" || uiState === "uncertain" ? (
          <>
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
              Record as not administered
            </button>
          </>
        ) : null}
        {uiState === "administered" ? (
          <button
            type="button"
            className="secondary-btn"
            data-testid="med-correct-not-admin"
            disabled={busy}
            onClick={() => void correctNotAdministered()}
          >
            Correct record: not administered
          </button>
        ) : null}
        {uiState === "not_administered" ? (
          <button
            type="button"
            className="secondary-btn"
            data-testid="med-report-admin"
            disabled={busy}
            onClick={() => void reportAdministered()}
          >
            Correct record: was administered
          </button>
        ) : null}
      </div>
      {msg && (
        <p className="muted" role="status" data-testid="med-correction-msg">
          {msg}
        </p>
      )}
    </section>
  );
}
