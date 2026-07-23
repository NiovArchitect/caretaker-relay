import type { NavTab } from "../domain/types";

const items: { id: Exclude<NavTab, "relay">; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "◉" },
  { id: "care", label: "Care", icon: "♡" },
  { id: "people", label: "People", icon: "◎" },
  { id: "documents", label: "Documents", icon: "▤" },
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
      <div className="sidenav-label">Care space</div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="sidenav-btn"
          data-testid={`nav-${item.id}`}
          aria-current={tab === item.id ? "page" : undefined}
          onClick={() => onChange(item.id)}
        >
          <span className="sidenav-icon" aria-hidden>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
      <div className="sidenav-foot">
        One care recipient · authorized people · not workforce ops.
      </div>
    </nav>
  );
}
