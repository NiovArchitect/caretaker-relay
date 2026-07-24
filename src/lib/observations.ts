/**
 * Observation intelligence: group near-duplicates into signal with expandable evidence.
 */

import { resolvePersonName } from "./identity";
import { formatCareDateTime } from "./humanCopy";

export type RawObservation = {
  id?: unknown;
  summary?: unknown;
  observedAt?: unknown;
  epistemicStatus?: unknown;
  source?: {
    actorName?: string;
    actorPersonId?: string;
    label?: string;
    kind?: string;
  };
};

export type ObservationCluster = {
  key: string;
  theme: string;
  count: number;
  mostRecentAt: string;
  mostRecentLabel: string;
  sources: string[];
  statusLabel: string;
  items: RawObservation[];
  trendNote?: string;
};

function normalizeTheme(summary: string): string {
  const s = summary.toLowerCase().trim();
  if (/fatigu|tired|energy|sleepy/.test(s)) return "Fatigue";
  if (/dizz|vertigo|light.?head/.test(s)) return "Dizziness";
  if (/pain|ache|sore/.test(s)) return "Pain";
  if (/appetite|ate|meal|lunch|dinner|breakfast/.test(s)) return "Meals and appetite";
  if (/mood|anxious|agitat|confus|memory/.test(s)) return "Mood and cognition";
  if (/mobil|walk|gait|balance|transfer/.test(s)) return "Mobility";
  if (/sleep|night|insomnia/.test(s)) return "Sleep";
  // First meaningful words as theme
  const words = summary.replace(/[^\w\s]/g, " ").trim().split(/\s+/).slice(0, 4);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Observation";
}

function actorOf(o: RawObservation): string {
  const src = o.source;
  if (src?.actorName) return src.actorName;
  if (src?.actorPersonId) return resolvePersonName(src.actorPersonId);
  if (src?.label) return src.label;
  return "Care team";
}

export function clusterObservations(
  rows: RawObservation[],
  maxClusters = 8,
): ObservationCluster[] {
  const map = new Map<string, ObservationCluster>();

  for (const o of rows) {
    const summary = String(o.summary ?? "Observation");
    const theme = normalizeTheme(summary);
    const key = theme.toLowerCase();
    const at = String(o.observedAt ?? "");
    const actor = actorOf(o);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        theme,
        count: 1,
        mostRecentAt: at,
        mostRecentLabel: formatCareDateTime(at) || at || "Recently",
        sources: [actor],
        statusLabel: String(o.epistemicStatus ?? "REPORTED"),
        items: [o],
      });
    } else {
      existing.count += 1;
      existing.items.push(o);
      if (at && (!existing.mostRecentAt || at > existing.mostRecentAt)) {
        existing.mostRecentAt = at;
        existing.mostRecentLabel = formatCareDateTime(at) || at;
      }
      if (!existing.sources.includes(actor)) existing.sources.push(actor);
    }
  }

  const clusters = [...map.values()].map((c) => {
    // Only claim a mild trend when evidence supports frequency
    if (c.count >= 3) {
      c.trendNote = `Reported ${c.count} times in recent care activity.`;
    } else if (c.count === 2) {
      c.trendNote = "Reported twice recently.";
    }
    return c;
  });

  clusters.sort((a, b) => {
    if (a.mostRecentAt && b.mostRecentAt) return b.mostRecentAt.localeCompare(a.mostRecentAt);
    return b.count - a.count;
  });

  return clusters.slice(0, maxClusters);
}

export function clusterSafetyReviews(
  rows: Array<Record<string, unknown>>,
): Array<{
  key: string;
  title: string;
  count: number;
  reason: string;
  status: string;
  items: Array<Record<string, unknown>>;
}> {
  const map = new Map<
    string,
    {
      key: string;
      title: string;
      count: number;
      reason: string;
      status: string;
      items: Array<Record<string, unknown>>;
    }
  >();

  for (const r of rows) {
    const reason = String(r.reason ?? r.message ?? "Needs review");
    const theme = /dose|med|unit|dimension|amount/i.test(reason)
      ? "Medication amount needs checking"
      : /access|auth|permission/i.test(reason)
        ? "Access or permission review"
        : "Open safety review";
    const key = theme;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        title: theme,
        count: 1,
        reason,
        status: String(r.status ?? "open"),
        items: [r],
      });
    } else {
      existing.count += 1;
      existing.items.push(r);
    }
  }

  return [...map.values()];
}
