import type { VerificationBundle } from "../domain/types";

export function VerifyPanel({
  bundle,
  onConfirm,
  onCorrect,
}: {
  bundle: VerificationBundle;
  onConfirm: () => void;
  onCorrect: () => void;
}) {
  return (
    <section className="section verify-card" aria-label="Verify what Relay understood">
      <p className="for-person">For {bundle.understood.careRecipientName}</p>
      <h2>{bundle.title}</h2>
      {bundle.items.map((item) => (
        <div key={item.id} className="verify-item">
          <div className="item-title">{item.label}</div>
          {"epistemicStatus" in item && item.epistemicStatus && (
            <span className="badge badge-amber" role="status">
              {item.epistemicStatus}
            </span>
          )}
          {item.safetyClass === "high" && (
            <span className="badge badge-coral" role="status">
              ⚠ Needs review
            </span>
          )}
          {item.safetyClass === "moderate" && item.requiresConfirmation && (
            <span className="badge badge-amber" role="status">
              ○ Needs your confirmation
            </span>
          )}
          {item.discrepancy && (
            <div className="discrepancy" role="alert">
              <strong>Check this</strong>
              <div>
                You recorded: <strong>{item.discrepancy.recordedDose}</strong>
              </div>
              <div>
                Current care instructions show:{" "}
                <strong>{item.discrepancy.authorizedDose}</strong>
              </div>
              <p className="source-line" style={{ marginBottom: 0 }}>
                Source: {item.discrepancy.authorizedSourceLabel}
              </p>
              <p className="muted" style={{ marginBottom: 0 }}>
                {item.discrepancy.message}
              </p>
            </div>
          )}
        </div>
      ))}
      <div className="btn-row">
        <button type="button" className="primary-btn" onClick={onConfirm}>
          Looks right
        </button>
        <button type="button" className="secondary-btn" onClick={onCorrect}>
          Correct something
        </button>
      </div>
    </section>
  );
}
