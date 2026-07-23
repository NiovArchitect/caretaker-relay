import type { NavTab } from "../domain/types";

const items: { id: NavTab; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "◉" },
  { id: "care", label: "Care", icon: "♡" },
  { id: "people", label: "People", icon: "◎" },
  { id: "documents", label: "Docs", icon: "▤" },
  { id: "relay", label: "Relay", icon: "↝" },
];

export function BottomNav({
  tab,
  onChange,
}: {
  tab: NavTab;
  onChange: (t: NavTab) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="nav-btn"
          data-testid={`nav-${item.id}`}
          aria-current={tab === item.id ? "page" : undefined}
          onClick={() => onChange(item.id)}
        >
          <span className="nav-icon" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
