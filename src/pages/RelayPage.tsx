import type { RelayMessage } from "../domain/types";

export function RelayPage({
  messages,
  onUseDemo,
  correcting,
}: {
  messages: RelayMessage[];
  onUseDemo: () => void;
  correcting?: boolean;
}) {
  return (
    <>
      <div className="greeting">
        <h1>Relay</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          {correcting
            ? "Correcting a previous note — prior evidence stays on record"
            : "Voice first · text second · same care context"}
        </p>
      </div>

      <div className="relay-thread" aria-live="polite" data-testid="relay-thread">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "bubble bubble-user"
                : m.role === "system"
                  ? "bubble bubble-system"
                  : "bubble bubble-relay"
            }
          >
            {m.text}
          </div>
        ))}
      </div>

      <section className="section">
        <h2>You can ask</h2>
        <ul className="list-plain">
          <li>What changed today?</li>
          <li>What still needs to happen?</li>
          <li>What should Maya know?</li>
          <li>When is the next appointment note?</li>
          <li>Summarize the day</li>
        </ul>
        <button
          type="button"
          className="secondary-btn"
          data-testid="fill-judge-update"
          onClick={onUseDemo}
        >
          Use sample care update
        </button>
      </section>
    </>
  );
}
