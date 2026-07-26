import { describe, expect, it } from "vitest";
import {
  formatCareInstant,
  formatCareInstantLayered,
  isRawIsoTimestamp,
  shiftBucket,
} from "../src/lib/dateTime";
import { formatCareDateTime } from "../src/lib/humanCopy";
import { sanitizeExportMarkdown } from "../src/lib/documentRender";
import {
  createCareRuntime,
  exportCareData,
} from "@caretaker-relay/care-domain";

describe("dateTime system", () => {
  const noonPt = new Date("2026-07-26T19:00:00.000Z"); // ~12:00 PDT

  it("formats full weekday style without raw ISO", () => {
    const label = formatCareDateTime("2026-07-23T22:04:51.749Z");
    expect(label).not.toMatch(/T22:04/);
    expect(label).not.toMatch(/\.749Z/);
    expect(label).toMatch(/2026/);
    expect(label.toLowerCase()).toMatch(/pm|am/);
  });

  it("standard form uses middle dot separator", () => {
    const label = formatCareInstant("2026-07-23T22:04:51.749Z", "standard");
    expect(label).toContain("·");
    expect(isRawIsoTimestamp(label)).toBe(false);
  });

  it("recent form can say Today", () => {
    const iso = "2026-07-26T20:00:00.000Z";
    const label = formatCareInstant(iso, "recent", { now: noonPt });
    expect(label.startsWith("Today") || label.includes("2026")).toBe(true);
  });

  it("layered recent includes parenthetical standard when today", () => {
    const iso = "2026-07-26T20:15:00.000Z";
    const label = formatCareInstantLayered(iso, { now: noonPt });
    expect(isRawIsoTimestamp(label)).toBe(false);
  });

  it("shift bucket classifies today", () => {
    expect(shiftBucket("2026-07-26T20:00:00.000Z", { now: noonPt })).toBe(
      "today",
    );
  });
});

describe("care export human record", () => {
  it("never leads with raw ISO timestamps in humanReadable", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const res = exportCareData(store, "p-sadeil", "cr-olivia", "markdown");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const md = res.humanReadable;
    expect(md).toMatch(/Care record/);
    expect(md).toMatch(/Action needed|Today/);
    // No primary raw ISO dumps like 2026-07-23T22:04:51.749Z
    expect(md).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    // Structured still keeps ISO exportedAt
    expect(res.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("sanitize rewrites residual ISO in markdown", () => {
    const cleaned = sanitizeExportMarkdown(
      "Exported at: 2026-07-23T22:04:51.749Z\nAll good\n",
    );
    expect(cleaned).not.toContain("T22:04:51.749Z");
    expect(cleaned).toContain("All good");
  });
});
