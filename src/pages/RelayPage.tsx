import type { RelayMessage } from "../domain/types";
import type { RoleExperience } from "../lib/roleExperience";

export function RelayPage({
  messages,
  onUseDemo,
  correcting,
  roleExperience,
}: {
  messages: RelayMessage[];
  onUseDemo: () => void;
  correcting?: boolean;
  /** Role-aware copy only — server still authorizes retrieval. */
  roleExperience?: RoleExperience | null;
}) {
  const roleHint = roleExperience?.relayTone;
  return (
    <>
      <div className="greeting">
        <h1>{roleExperience?.navLabels.relay ?? "Relay"}</h1>
        <p
          className="muted section-lead"
          style={{ marginTop: 0 }}
          data-testid="relay-role-lead"
        >
          {correcting
            ? "Correcting a previous note — prior evidence stays on record"
            : roleHint
              ? roleHint
              : "What can I ask, report, or do? Voice first · text second · same care context. Relay does not invent clinical orders."}
        </p>
        {roleExperience?.badge && (
          <p className="badge badge-teal" data-testid="relay-role-badge">
            {roleExperience.badge}
          </p>
        )}
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
