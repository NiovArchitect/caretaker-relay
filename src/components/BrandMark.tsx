/**
 * Staged Caretaker Relay mark — two arcs around a protected center (relay loop).
 * SVG scales to favicon/app icon; CSS-only circle is no longer the primary mark.
 */
export function BrandMark({
  size = 28,
  className = "",
  title = "Caretaker Relay",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={`brand-mark-svg ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={title}
      data-testid="brand-mark"
    >
      <defs>
        <linearGradient id="cr-mark-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--cr-accent-2, #2a8a9e)" />
          <stop offset="100%" stopColor="var(--cr-accent, #0c4f5c)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#cr-mark-g)" />
      {/* Outer relay arcs — continuity / handoff */}
      <path
        d="M8 18.5c1.2-5 5-8.2 8.8-8.2 2.4 0 4.5.9 6 2.4"
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M24 13.5c-1.2 5-5 8.2-8.8 8.2-2.4 0-4.5-.9-6-2.4"
        fill="none"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/* Protected center — care recipient */}
      <circle cx="16" cy="16" r="3.2" fill="rgba(255,255,255,0.95)" />
      <circle cx="16" cy="16" r="1.4" fill="var(--cr-accent, #0c4f5c)" />
    </svg>
  );
}
