import type { CareHandoff } from "../domain/types";
import { handoff as demoHandoff, people } from "../scenario/olivia";

export function HandoffPanel({
  onClose,
  liveHandoff,
  status = "prepared",
}: {
  onClose: () => void;
  liveHandoff?: CareHandoff | null;
  /** Honest delivery state — never claim sent unless system actually sent. */
  status?: "prepared" | "reviewed";
}) {
  const h = liveHandoff ?? demoHandoff;
  const mayaName = people.maya.displayName;
  const sourceLine =
    h.sources.length > 0
      ? h.sources
          .map((s) => s.actorName ?? s.label)
          .filter(Boolean)
          .join(" · ")
      : "Today's care activity";

  return (
    <section
      className="section handoff-hero"
      aria-label="Care handoff"
      data-testid="handoff-panel"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "var(--cr-teal-deep)",
            fontSize: "1.25rem",
          }}
          data-testid="handoff-title"
        >
          {mayaName} can stay caught up
        </h2>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="muted" style={{ marginTop: 4, fontSize: "0.85rem" }} data-testid="handoff-status">
        {status === "reviewed"
          ? "You reviewed this continuity summary."
          : "Prepared for the next caregiver — not automatically sent as a message."}
      </p>

      <h3 className="muted" style={{ marginBottom: 6 }}>
        What changed
      </h3>
      <ul className="list-plain" data-testid="handoff-what-changed">
        {h.whatChanged.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h3 className="muted" style={{ marginBottom: 6 }}>
        Still needs attention
      </h3>
      <ul className="list-plain">
        {h.stillNeedsAttention.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h3 className="muted" style={{ marginBottom: 6 }}>
        Watch
      </h3>
      <ul className="list-plain">
        {h.watch.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <p className="source-line" data-testid="handoff-sources">
        Where this came from: {sourceLine}
      </p>

      <div className="btn-row">
        <button
          type="button"
          className="primary-btn"
          data-testid="handoff-caught-up"
          onClick={onClose}
        >
          I&apos;m caught up
        </button>
        <button
          type="button"
          className="secondary-btn"
          data-testid="handoff-share-maya"
          onClick={onClose}
        >
          Review before {mayaName} takes over
        </button>
      </div>
    </section>
  );
}
