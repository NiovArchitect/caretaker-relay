import type { NavTab } from "../domain/types";
import { NAV_ICONS } from "./NavIcons";
import type { RoleExperience } from "../lib/roleExperience";

const DEFAULT_ITEMS: { id: Exclude<NavTab, "relay">; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "care", label: "Care" },
  { id: "people", label: "People" },
  { id: "documents", label: "Documents" },
];

export function SideNav({
  tab,
  onChange,
  roleExperience,
}: {
  tab: NavTab;
  onChange: (t: NavTab) => void;
  roleExperience?: RoleExperience | null;
}) {
  const items = DEFAULT_ITEMS.map((item) => ({
    ...item,
    label: roleExperience?.navLabels[item.id] ?? item.label,
  }));
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
      <div className="sidenav-foot" data-testid="sidenav-role-foot">
        {roleExperience?.orientation?.slice(0, 80) ??
          "Care for who needs you today."}
      </div>
    </nav>
  );
}
