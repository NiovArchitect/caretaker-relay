import { useState } from "react";
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
  type CaregiverPath,
  type OnboardingDraft,
  PATH_LABELS,
} from "../lib/onboarding";
import { resolveCareSpace, loadActiveCareRecipientId } from "../lib/careContext";

const STEPS = ["path", "recipient", "matters", "helpers", "review"] as const;

export function OnboardingWizard({
  onComplete,
  onDismiss,
  initialPath,
}: {
  onComplete: (draft: OnboardingDraft) => void;
  onDismiss?: () => void;
  initialPath?: CaregiverPath | null;
}) {
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const d = loadOnboardingDraft();
    if (initialPath) d.path = initialPath;
    if (!d.recipientPreferredName) {
      d.recipientPreferredName = space.preferredName;
    }
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
    if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
    else {
      const done = { ...draft, completed: true };
      saveOnboardingDraft(done);
      onComplete(done);
    }
  }

  function skip() {
    patch({ skippedSteps: [...draft.skippedSteps, step] });
    next();
  }

  return (
    <section
      className="section surface-known onboarding-wizard"
      data-testid="onboarding-wizard"
      aria-label="Set up care"
    >
      <div className="onboarding-kicker">
        <span>Set up care</span>
        <span className="muted" data-testid="onboarding-progress">
          {progress}
        </span>
      </div>
      <h2 className="onboarding-title">
        {step === "path" && "How are you connecting?"}
        {step === "recipient" && "Who is receiving care?"}
        {step === "matters" && "What matters most right now?"}
        {step === "helpers" && "Who is already helping?"}
        {step === "review" && "You’re ready for the first step"}
      </h2>
      <p className="muted section-lead">
        Only what’s useful now — you can enrich the record later. Nothing is
        invented.
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
          <span>Preferred name</span>
          <input
            data-testid="onboarding-recipient-name"
            value={draft.recipientPreferredName}
            onChange={(e) => patch({ recipientPreferredName: e.target.value })}
            placeholder="e.g. Evelyn"
          />
        </label>
      )}

      {step === "matters" && (
        <label className="cr-field">
          <span>What should the care team know today?</span>
          <textarea
            data-testid="onboarding-matters"
            rows={3}
            value={draft.whatMatters}
            onChange={(e) => patch({ whatMatters: e.target.value })}
            placeholder="Routines, priorities, what helps — not a diagnosis"
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
            <strong>Path:</strong>{" "}
            {draft.path ? PATH_LABELS[draft.path] : "Not set"}
          </li>
          <li>
            <strong>Recipient:</strong>{" "}
            {draft.recipientPreferredName || space.displayName}
          </li>
          <li>
            <strong>Today:</strong> {draft.whatMatters || "Add later"}
          </li>
          <li>
            <strong>Helpers:</strong> {draft.helpersNote || "Add in People"}
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
        {step !== "path" && step !== "review" && (
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
          disabled={step === "path" && !draft.path}
          onClick={next}
        >
          {step === "review" ? "Open Today" : "Continue"}
        </button>
      </div>
    </section>
  );
}
