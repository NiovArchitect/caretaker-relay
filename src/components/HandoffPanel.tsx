import type { CareHandoff } from "../domain/types";
import { handoff as demoHandoff } from "../scenario/olivia";

export function HandoffPanel({
  onClose,
  liveHandoff,
}: {
  onClose: () => void;
  liveHandoff?: CareHandoff | null;
}) {
  const h = liveHandoff ?? demoHandoff;
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
        >
          Handoff ready
        </h2>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="muted" style={{ marginTop: 4, fontSize: "0.85rem" }}>
        Evidence: {h.evidenceMode}
      </p>

      <h3 className="muted" style={{ marginBottom: 6 }}>
        What changed
      </h3>
      <ul className="list-plain">
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

      <p className="source-line">Sources: {sourceLine}</p>

      <div className="btn-row">
        <button type="button" className="primary-btn" onClick={onClose}>
          Start my shift
        </button>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Review handoff
        </button>
      </div>
    </section>
  );
}
