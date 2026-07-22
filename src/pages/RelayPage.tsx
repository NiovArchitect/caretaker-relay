import type { RelayMessage } from "../domain/types";

export function RelayPage({
  messages,
  onUseDemo,
}: {
  messages: RelayMessage[];
  onUseDemo: () => void;
}) {
  return (
    <>
      <div className="greeting">
        <h1>Relay</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Voice first · text second · same care context
        </p>
      </div>

      <div className="relay-thread" aria-live="polite">
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
          <li>What should Walter know?</li>
          <li>Tell Maya what happened.</li>
        </ul>
        <button type="button" className="secondary-btn" onClick={onUseDemo}>
          Fill demo care update
        </button>
      </section>
    </>
  );
}
