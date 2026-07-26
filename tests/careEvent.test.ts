import { describe, it, expect } from "vitest";
import {
  careEventDedupeKey,
  formatEventVsReport,
  isConsequentialAction,
  type CareEvent,
} from "../src/lib/careEvent";

describe("careEvent model", () => {
  const base: CareEvent = {
    id: "ev-1",
    care_recipient_id: "cr-x",
    type: "observation",
    summary: "Ate lunch",
    provenance: {
      source_system: "relay",
      actor_principal_id: "p-acct-1",
      authority_basis: "membership",
      event_time: "2026-07-26T12:00:00Z",
      report_time: "2026-07-26T12:05:00Z",
      confidence: "reported",
    },
    created_at: "2026-07-26T12:05:00Z",
    updated_at: "2026-07-26T12:05:00Z",
  };

  it("distinguishes event time from report time", () => {
    expect(formatEventVsReport(base.provenance)).toMatch(/Event/);
    expect(formatEventVsReport(base.provenance)).toMatch(/reported/);
  });

  it("builds stable dedupe keys", () => {
    const k1 = careEventDedupeKey(base);
    const k2 = careEventDedupeKey({
      ...base,
      id: "ev-2",
      summary: "different text same facts",
    });
    expect(k1).toBe(k2);
  });

  it("flags consequential actions", () => {
    expect(isConsequentialAction("notify_helpers")).toBe(true);
    expect(isConsequentialAction("view_today")).toBe(false);
  });
});
