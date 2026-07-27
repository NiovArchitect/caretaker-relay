/** Unified geometric nav icons — stroke-based, medical-calm, no emoji mix. */

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export function IconToday() {
  return (
    <svg {...svgProps}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function IconCare() {
  return (
    <svg {...svgProps}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
    </svg>
  );
}

export function IconPeople() {
  return (
    <svg {...svgProps}>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="16.5" cy="9.5" r="2.4" />
      <path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M14 19c.3-2 1.6-3.4 3.5-3.4 1.4 0 2.5.8 3 2.2" />
    </svg>
  );
}

export function IconDocuments() {
  return (
    <svg {...svgProps}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function IconRelay() {
  return (
    <svg {...svgProps}>
      <path d="M4 12h10" />
      <path d="M11 7l5 5-5 5" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function IconPrivacy() {
  return (
    <svg {...svgProps}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export const NAV_ICONS = {
  today: IconToday,
  care: IconCare,
  people: IconPeople,
  documents: IconDocuments,
  relay: IconRelay,
  privacy: IconPrivacy,
} as const;
