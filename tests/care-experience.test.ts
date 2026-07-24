import { describe, expect, it } from "vitest";
import {
  FORBIDDEN_ID_PATTERNS,
  resolvePersonName,
  resolveRecipientName,
  isTechnicalIdValue,
} from "../src/lib/identity";
import {
  plainDiscrepancyMessage,
  careTypeLabel,
  formatCareDateTime,
} from "../src/lib/humanCopy";
import {
  parseMarkdownToBlocks,
  sanitizeExportMarkdown,
} from "../src/lib/documentRender";
import { clusterObservations, clusterSafetyReviews } from "../src/lib/observations";
import {
  listAuthorizedCareSpaces,
  resolveCareSpace,
} from "../src/lib/careContext";

describe("identity resolution", () => {
  it("maps technical person ids to human names", () => {
    expect(resolvePersonName("p-sadeil")).toBe("Marcus Carter");
    expect(resolvePersonName("p-maya")).toBe("Maya Bennett");
    expect(resolvePersonName("p-walter")).toBe("Daniel Kim");
    expect(resolvePersonName("p-dr-shah")).toBe("Dr. Priya Shah");
  });

  it("maps recipient ids to human names", () => {
    expect(resolveRecipientName("cr-olivia")).toBe("Evelyn Carter");
    expect(resolveRecipientName("cr-robert")).toBe("Robert Hale");
  });

  it("detects technical id values", () => {
    expect(isTechnicalIdValue("cr-olivia")).toBe(true);
    expect(isTechnicalIdValue("p-sadeil")).toBe(true);
    expect(isTechnicalIdValue("Evelyn Carter")).toBe(false);
  });
});

describe("plain language", () => {
  it("translates dimension discrepancy to caregiver language", () => {
    const msg = plainDiscrepancyMessage(
      "Reported dose unit is not comparable to the authorized instruction (incompatible dimensions).",
      "Evelyn",
    );
    expect(msg.toLowerCase()).toContain("doesn't clearly match");
    expect(msg.toLowerCase()).not.toContain("dimension");
  });

  it("labels care types humanly", () => {
    expect(careTypeLabel("medication_administration")).toBe("Medication");
    expect(careTypeLabel("appointment")).toBe("Appointment");
  });

  it("formats ISO datetimes with am/pm", () => {
    const label = formatCareDateTime("2026-07-24T22:00:00Z");
    expect(label.length).toBeGreaterThan(5);
    // Should not be bare ISO dump
    expect(label).not.toMatch(/^2026-07-24T/);
  });
});

describe("document render", () => {
  it("parses markdown without exposing hash headings as raw text blocks", () => {
    const blocks = parseMarkdownToBlocks(
      "# Care summary\n\n## Medications\n\n- Metformin 500 mg\n\nHello **world**",
    );
    expect(blocks.some((b) => b.type === "h1" && b.text === "Care summary")).toBe(
      true,
    );
    expect(blocks.some((b) => b.type === "h2" && b.text === "Medications")).toBe(
      true,
    );
    expect(blocks.some((b) => b.type === "ul")).toBe(true);
    expect(JSON.stringify(blocks)).not.toContain("# Care");
  });

  it("strips technical id lines from export markdown", () => {
    const cleaned = sanitizeExportMarkdown(
      "# Summary\n\nhandoff id: ho-123\n\nAll good\n\nperson_id: p-sadeil\n",
    );
    expect(cleaned).toContain("All good");
    expect(cleaned.toLowerCase()).not.toContain("handoff id");
    expect(cleaned).not.toContain("p-sadeil");
  });
});

describe("observation clustering", () => {
  it("groups near-duplicate fatigue observations", () => {
    const clusters = clusterObservations([
      {
        id: "1",
        summary: "More fatigue after lunch",
        observedAt: "2026-07-22T13:00:00Z",
        source: { actorName: "Daniel Kim" },
      },
      {
        id: "2",
        summary: "Seemed more tired than usual",
        observedAt: "2026-07-21T13:00:00Z",
        source: { actorName: "Marcus Carter" },
      },
      {
        id: "3",
        summary: "Fatigue after meal",
        observedAt: "2026-07-20T13:00:00Z",
        source: { actorName: "Daniel Kim" },
      },
    ]);
    expect(clusters.length).toBe(1);
    expect(clusters[0]!.theme).toBe("Fatigue");
    expect(clusters[0]!.count).toBe(3);
    expect(clusters[0]!.sources).toContain("Marcus Carter");
  });

  it("consolidates safety reviews about dose mismatch", () => {
    const groups = clusterSafetyReviews([
      { id: "a", reason: "dose unit incompatible dimensions", status: "open" },
      { id: "b", reason: "reported amount not comparable", status: "open" },
    ]);
    expect(groups.length).toBe(1);
    expect(groups[0]!.count).toBe(2);
  });
});

describe("multi-recipient architecture", () => {
  it("exposes more than one care space", () => {
    const spaces = listAuthorizedCareSpaces("p-sadeil");
    expect(spaces.length).toBeGreaterThanOrEqual(2);
    expect(spaces.map((s) => s.displayName)).toContain("Evelyn Carter");
    expect(spaces.map((s) => s.displayName)).toContain("Robert Hale");
  });

  it("resolves active space without hard-coding only Evelyn", () => {
    expect(resolveCareSpace("cr-robert").displayName).toBe("Robert Hale");
  });
});

describe("forbidden caregiver UI patterns", () => {
  it("flags forbidden strings", () => {
    const samples = [
      "Care object detail",
      "lay continuity for Maya",
      "compatible dimensions",
      "real invite lifecycle",
      "create token",
      "cr-olivia",
      "p-sadeil",
    ];
    for (const s of samples) {
      const hit = FORBIDDEN_ID_PATTERNS.some((re) => re.test(s));
      expect(hit).toBe(true);
    }
  });
});
