/**
 * Central human-readable care date/time presentation.
 * Store remains ISO/UTC. Display is local-friendly, never raw Z-ISO as primary.
 */

export type CareTimeZone = string;

export type DateTimeVariant =
  | "full"
  | "standard"
  | "recent"
  | "compact"
  | "audit"
  | "date"
  | "relative_day";

export const DEFAULT_CARE_TZ: CareTimeZone = "America/Los_Angeles";

export type FormatOpts = {
  timeZone?: CareTimeZone;
  now?: Date;
  /** Prefer "recent" layering when within ~36h */
  preferRecent?: boolean;
};

function parseDate(isoOrLabel: string | null | undefined): Date | null {
  if (isoOrLabel == null) return null;
  const raw = String(isoOrLabel).trim();
  if (!raw) return null;
  // Already human label without ISO shape — leave for callers
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw) && !raw.includes("T")) {
    return null;
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** True when value looks like a machine ISO timestamp. */
export function isRawIsoTimestamp(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(value).trim());
}

function partsFor(
  d: Date,
  timeZone: string,
  opts: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat("en-US", { timeZone, ...opts }).formatToParts(d);
}

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((p) => p.type === type)?.value ?? "";
}

function ymdInZone(d: Date, timeZone: string): string {
  const p = partsFor(d, timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${part(p, "year")}-${part(p, "month")}-${part(p, "day")}`;
}

function relativeDayLabel(
  d: Date,
  timeZone: string,
  now: Date,
): "Today" | "Yesterday" | null {
  const target = ymdInZone(d, timeZone);
  const today = ymdInZone(now, timeZone);
  if (target === today) return "Today";
  const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  // Walk back ~36h window for "yesterday" by calendar day in zone
  for (let i = 1; i <= 2; i++) {
    const cand = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    if (ymdInZone(cand, timeZone) === target && i === 1) return "Yesterday";
    void yest;
  }
  const yesterdayYmd = (() => {
    // Compute yesterday calendar day in zone via noon UTC probe
    const probe = new Date(`${today}T12:00:00Z`);
    const back = new Date(probe.getTime() - 24 * 60 * 60 * 1000);
    return ymdInZone(back, timeZone);
  })();
  if (target === yesterdayYmd) return "Yesterday";
  return null;
}

/**
 * Format a care timestamp for humans.
 * Non-ISO labels pass through (with light enrichment for "around 3").
 */
export function formatCareInstant(
  isoOrLabel: string | null | undefined,
  variant: DateTimeVariant = "standard",
  opts?: FormatOpts,
): string {
  if (!isoOrLabel) return "";
  const raw = String(isoOrLabel).trim();
  const d = parseDate(raw);
  if (!d) {
    // Non-ISO human label
    if (/around\s+(\d{1,2})\b/i.test(raw) && !/\b(am|pm)\b/i.test(raw)) {
      return raw.replace(/around\s+(\d{1,2})\b/i, (_m, h) => {
        const hour = Number(h);
        if (hour >= 1 && hour <= 11) return `around ${hour}:00 PM`;
        if (hour === 12) return "around 12:00 PM";
        return `around ${hour}:00`;
      });
    }
    return raw;
  }

  const timeZone = opts?.timeZone ?? DEFAULT_CARE_TZ;
  const now = opts?.now ?? new Date();

  try {
    if (variant === "compact") {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
      }).format(d);
    }

    if (variant === "date") {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone,
      }).format(d);
    }

    if (variant === "full") {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
        timeZoneName: "short",
      }).format(d);
    }

    if (variant === "audit") {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone,
        timeZoneName: "short",
      }).format(d);
    }

    if (variant === "recent" || opts?.preferRecent) {
      const rel = relativeDayLabel(d, timeZone, now);
      const time = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
      }).format(d);
      if (rel === "Today") return `Today at ${time}`;
      if (rel === "Yesterday") return `Yesterday at ${time}`;
      // fall through to standard
    }

    if (variant === "relative_day") {
      return relativeDayLabel(d, timeZone, now) ?? formatCareInstant(raw, "date", opts);
    }

    // standard
    const date = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone,
    }).format(d);
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
      timeZoneName: "short",
    }).format(d);
    return `${date} · ${time}`;
  } catch {
    return d.toLocaleString("en-US");
  }
}

/** Layered recent + standard for dense lists. */
export function formatCareInstantLayered(
  isoOrLabel: string | null | undefined,
  opts?: FormatOpts,
): string {
  const recent = formatCareInstant(isoOrLabel, "recent", {
    ...opts,
    preferRecent: true,
  });
  const standard = formatCareInstant(isoOrLabel, "standard", opts);
  if (!recent) return "";
  if (recent.startsWith("Today") || recent.startsWith("Yesterday")) {
    if (recent === standard) return recent;
    return `${recent} (${standard})`;
  }
  return standard;
}

/** Shift-aware bucket for chronology copy. */
export function shiftBucket(
  isoOrLabel: string | null | undefined,
  opts?: FormatOpts,
): "today" | "overnight" | "yesterday" | "earlier" | "unknown" {
  const d = parseDate(isoOrLabel ?? "");
  if (!d) return "unknown";
  const timeZone = opts?.timeZone ?? DEFAULT_CARE_TZ;
  const now = opts?.now ?? new Date();
  const rel = relativeDayLabel(d, timeZone, now);
  if (rel === "Today") {
    const hour = Number(
      part(
        partsFor(d, timeZone, { hour: "numeric", hour12: false, hourCycle: "h23" }),
        "hour",
      ) || "12",
    );
    // Overnight-ish early morning still "today" calendar but note overnight if before 6am
    if (hour < 6) return "overnight";
    return "today";
  }
  if (rel === "Yesterday") {
    const hour = Number(
      part(
        partsFor(d, timeZone, { hour: "numeric", hour12: false, hourCycle: "h23" }),
        "hour",
      ) || "12",
    );
    if (hour >= 18) return "overnight";
    return "yesterday";
  }
  return "earlier";
}

export function shiftBucketLabel(
  isoOrLabel: string | null | undefined,
  opts?: FormatOpts,
): string {
  switch (shiftBucket(isoOrLabel, opts)) {
    case "today":
      return "Today";
    case "overnight":
      return "Overnight";
    case "yesterday":
      return "Yesterday";
    case "earlier":
      return "Earlier";
    default:
      return "Time not on file";
  }
}
