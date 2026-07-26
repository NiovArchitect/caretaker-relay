import { useState } from "react";
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
  type CaregiverPath,
  type OnboardingDraft,
  PATH_LABELS,
} from "../lib/onboarding";

const STEPS = ["path", "recipient", "matters", "helpers", "review"] as const;

/**
 * Progressive setup for NEW circles only.
 * Never pre-fills an existing recipient name (no automatic Evelyn/Robert).
 */
export function OnboardingWizard({
  onComplete,
  onDismiss,
  initialPath,
  modeLabel = "Set up a new care circle",
}: {
  onComplete: (draft: OnboardingDraft) => void;
  onDismiss?: () => void;
  initialPath?: CaregiverPath | null;
  modeLabel?: string;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const d = loadOnboardingDraft();
    if (initialPath) d.path = initialPath;
    // SECURITY: never auto-fill recipient from another person's active space
    d.recipientPreferredName = d.recipientPreferredName || "";
    return d;
  });

  const step = STEPS[stepIdx];
  const progress = `${stepIdx + 1} of ${STEPS.length}`;

  function patch(p: Partial<OnboardingDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...p };
      saveOnboardingDraft(next);
      return next;
    });
  }

  function next() {
    if (step === "recipient" && !draft.recipientPreferredName.trim()) {
      return; // require recipient name for new circle intent
    }
    if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
    else {
      const done = {
        ...draft,
        completed: true,
        awaitingAuthorization: true,
      };
      saveOnboardingDraft(done);
      onComplete(done);
    }
  }

  function skip() {
    if (step === "recipient") return;
    patch({ skippedSteps: [...draft.skippedSteps, step] });
    next();
  }

  return (
    <section
      className="section surface-known onboarding-wizard"
      data-testid="onboarding-wizard"
      aria-label={modeLabel}
    >
      <div className="onboarding-kicker">
        <span>{modeLabel}</span>
        <span className="muted" data-testid="onboarding-progress">
          {progress}
        </span>
      </div>
      <h2 className="onboarding-title">
        {step === "path" && "How are you authorized to set this up?"}
        {step === "recipient" && "Who is receiving care?"}
        {step === "matters" && "What matters most right now?"}
        {step === "helpers" && "Who is already helping?"}
        {step === "review" && "Review before continuing"}
      </h2>
      <p className="muted section-lead">
        This creates a draft intent only. Existing people are never linked by
        name alone. Sensitive fields require consent or lawful authority.
      </p>

      {step === "path" && (
        <div className="onboarding-choices" role="list">
          {(Object.keys(PATH_LABELS) as CaregiverPath[]).map((key) => (
            <button
              key={key}
              type="button"
              role="listitem"
              className={
                draft.path === key
                  ? "onboarding-choice is-selected"
                  : "onboarding-choice"
              }
              data-testid={`onboarding-path-${key}`}
              onClick={() => patch({ path: key })}
            >
              {PATH_LABELS[key]}
            </button>
          ))}
        </div>
      )}

      {step === "recipient" && (
        <label className="cr-field">
          <span>Preferred name (required — enter who you support)</span>
          <input
            data-testid="onboarding-recipient-name"
            value={draft.recipientPreferredName}
            onChange={(e) => patch({ recipientPreferredName: e.target.value })}
            placeholder="Type their preferred name"
            autoComplete="off"
            required
          />
        </label>
      )}

      {step === "matters" && (
        <label className="cr-field">
          <span>What should the care team know today? (optional draft)</span>
          <textarea
            data-testid="onboarding-matters"
            rows={3}
            value={draft.whatMatters}
            onChange={(e) => patch({ whatMatters: e.target.value })}
            placeholder="Priorities and preferences — not a diagnosis"
          />
        </label>
      )}

      {step === "helpers" && (
        <label className="cr-field">
          <span>People already helping (optional)</span>
          <textarea
            data-testid="onboarding-helpers"
            rows={2}
            value={draft.helpersNote}
            onChange={(e) => patch({ helpersNote: e.target.value })}
            placeholder="Names and how they help"
          />
        </label>
      )}

      {step === "review" && (
        <ul className="list-plain" data-testid="onboarding-review">
          <li>
            <strong>Authority claim:</strong>{" "}
            {draft.path ? PATH_LABELS[draft.path] : "Not set"}
          </li>
          <li>
            <strong>Recipient preferred name:</strong>{" "}
            {draft.recipientPreferredName || "—"}
          </li>
          <li>
            <strong>Today:</strong> {draft.whatMatters || "Add later"}
          </li>
          <li className="muted">
            Status: awaiting authorization / consent — not full access
          </li>
        </ul>
      )}

      <div className="btn-row onboarding-actions">
        {onDismiss && (
          <button
            type="button"
            className="ghost-btn"
            data-testid="onboarding-dismiss"
            onClick={onDismiss}
          >
            Not now
          </button>
        )}
        {step !== "path" && step !== "review" && step !== "recipient" && (
          <button
            type="button"
            className="secondary-btn"
            data-testid="onboarding-skip"
            onClick={skip}
          >
            Skip for now
          </button>
        )}
        <button
          type="button"
          className="primary-btn"
          data-testid="onboarding-continue"
          disabled={
            (step === "path" && !draft.path) ||
            (step === "recipient" && !draft.recipientPreferredName.trim())
          }
          onClick={next}
        >
          {step === "review" ? "Save draft intent" : "Continue"}
        </button>
      </div>
    </section>
  );
}
