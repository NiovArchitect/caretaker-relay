import type { NavTab } from "../domain/types";
import { NAV_ICONS } from "./NavIcons";

const items: { id: NavTab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "care", label: "Care" },
  { id: "people", label: "People" },
  { id: "documents", label: "Docs" },
  { id: "relay", label: "Relay" },
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
      {items.map((item) => {
        const Icon = NAV_ICONS[item.id];
        return (
          <button
            key={item.id}
            type="button"
            className="nav-btn"
            data-testid={`nav-${item.id}`}
            aria-current={tab === item.id ? "page" : undefined}
            onClick={() => onChange(item.id)}
          >
            <span className="nav-icon" aria-hidden>
              <Icon />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
