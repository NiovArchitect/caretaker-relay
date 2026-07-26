import type { NavTab } from "../domain/types";
import { NAV_ICONS } from "./NavIcons";

const items: { id: Exclude<NavTab, "relay">; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "care", label: "Care" },
  { id: "people", label: "People" },
  { id: "documents", label: "Documents" },
];

export function SideNav({
  tab,
  onChange,
}: {
  tab: NavTab;
  onChange: (t: NavTab) => void;
}) {
  return (
    <nav className="sidenav" aria-label="Primary">
      <div className="sidenav-label">Navigate</div>
      {items.map((item) => {
        const Icon = NAV_ICONS[item.id];
        return (
          <button
            key={item.id}
            type="button"
            className="sidenav-btn"
            data-testid={`nav-${item.id}`}
            aria-current={tab === item.id ? "page" : undefined}
            onClick={() => onChange(item.id)}
          >
            <span className="sidenav-icon" aria-hidden>
              <Icon />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
      <div className="sidenav-foot">Care for who needs you today.</div>
    </nav>
  );
}
