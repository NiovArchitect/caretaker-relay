import type { VerificationBundle } from "../domain/types";

function humanEpistemic(status?: string): string {
  switch (status) {
    case "REPORTED":
      return "Reported";
    case "UNCERTAIN":
      return "Needs checking";
    case "CONFLICTED":
      return "Conflict";
    case "CONFIRMED":
      return "Confirmed";
    case "INFERRED":
      return "Inferred — please check";
    default:
      return status ?? "Reported";
  }
}

function kindLabel(item: VerificationBundle["items"][number]): string {
  if (item.discrepancy) return "Medication";
  const label = item.label.toLowerCase();
  if (/meal|breakfast|lunch|dinner|ate/.test(label)) return "Meal";
  if (/dizzy|tired|fatigue|observation|reported:/.test(label))
    return "Observation";
  if (/maya|pt|appointment|visit|moved|schedule/.test(label))
    return "Schedule";
  if (/medication|med|pill|dose|given/.test(label)) return "Medication";
  if (/update ready|maya|tell|know/.test(label)) return "For Maya";
  return "Care update";
}

export function VerifyPanel({
  bundle,
  onConfirm,
  onCorrect,
}: {
  bundle: VerificationBundle;
  onConfirm: () => void;
  onCorrect: () => void;
}) {
  const count = bundle.items.length;
  const hasMedIssue = bundle.items.some(
    (i) => i.discrepancy || i.safetyClass === "high",
  );

  return (
    <section
      className="section verify-card"
      aria-label="Verify what Relay understood"
      data-testid="verify-panel"
    >
      <p className="for-person" data-testid="verify-recipient">
        For {bundle.understood.careRecipientName}
      </p>
      <h2 data-testid="verify-summary">
        I found {count} thing{count === 1 ? "" : "s"} in that update
      </h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Caregiver observations can be saved as reported evidence. Only
        consequential clinical or medication items need extra scrutiny before
        care truth updates.
      </p>

      {bundle.items.map((item) => (
        <div
          key={item.id}
          className="verify-item"
          data-testid="verify-item"
          data-safety={item.safetyClass}
          data-has-discrepancy={item.discrepancy ? "true" : "false"}
        >
          <div className="verify-kind muted">{kindLabel(item)}</div>
          <div className="item-title">{item.label}</div>

          <dl className="verify-meta">
            <div>
              <dt>Action</dt>
              <dd>{item.label}</dd>
            </div>
            {(item as { timeLabel?: string }).timeLabel ||
            bundle.understood.rawText ? (
              <div>
                <dt>Time</dt>
                <dd>
                  {(item as { timeLabel?: string }).timeLabel ??
                    "As you described"}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Source</dt>
              <dd>
                {bundle.understood.careRecipientName
                  ? `You · caregiver update for ${bundle.understood.careRecipientName}`
                  : "Caregiver update"}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="badge badge-amber" role="status">
                  {humanEpistemic(item.epistemicStatus)}
                </span>
              </dd>
            </div>
          </dl>

          {item.safetyClass === "high" && !item.discrepancy && (
            <span className="badge badge-coral" role="status">
              Needs your check
            </span>
          )}
          {item.safetyClass === "moderate" && item.requiresConfirmation && (
            <span className="badge badge-amber" role="status">
              Needs your confirmation
            </span>
          )}

          {item.discrepancy && (
            <div className="discrepancy" role="alert" data-testid="med-safety-block">
              <strong>I need you to check this one.</strong>
              <p style={{ marginBottom: 8 }}>
                You said: <strong>{item.discrepancy.recordedDose}</strong>
              </p>
              <p style={{ marginBottom: 8 }}>
                Current care instructions show:{" "}
                <strong>{item.discrepancy.authorizedDose}</strong>
              </p>
              <p className="source-line" style={{ marginBottom: 8 }}>
                Source: {item.discrepancy.authorizedSourceLabel}
              </p>
              <p className="muted" style={{ marginBottom: 0 }}>
                {item.discrepancy.message}
              </p>
              <p className="attention-limit" style={{ marginTop: 8 }}>
                <strong>I won&apos;t guess the dose.</strong> Relay will not
                choose or invent a medication amount.
              </p>
            </div>
          )}
        </div>
      ))}

      {hasMedIssue && !bundle.items.some((i) => i.discrepancy) && (
        <p className="attention-limit" data-testid="med-ambiguity-note">
          Medication details need human judgment. Relay does not recommend or
          invent doses.
        </p>
      )}

      <div className="btn-row">
        <button
          type="button"
          className="btn-verify btn-with-icon"
          data-testid="confirm-looks-right"
          data-action-kind="verify"
          onClick={onConfirm}
        >
          <span className="btn-glyph" aria-hidden>
            ✓
          </span>
          {bundle.items.some((i) =>
            /medication change needs verification/i.test(i.label),
          )
            ? "Confirm my report"
            : "Looks right"}
        </button>
        <button
          type="button"
          className="secondary-btn btn-with-icon"
          data-testid="correct-something"
          data-action-kind="secondary"
          onClick={onCorrect}
        >
          <span className="btn-glyph" aria-hidden>
            ✎
          </span>
          Correct something
        </button>
      </div>
    </section>
  );
}
