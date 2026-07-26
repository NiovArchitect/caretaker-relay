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
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

  it("Robert care space is lightweight (not Evelyn fill)", () => {
    const space = resolveCareSpace("cr-robert");
    expect(space.displayName).toBe("Robert Hale");
    expect(space.depth).toBe("lightweight");
    expect(space.careRecipientId).toBe("cr-robert");
    expect(space.careRecipientId).not.toBe("cr-olivia");
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

describe("operating experience copy contracts", () => {
  it("purges technical-delivery invite copy from PeoplePage", () => {
    const src = readFileSync(
      join(process.cwd(), "src/pages/PeoplePage.tsx"),
      "utf8",
    );
    expect(src.toLowerCase()).not.toContain("technical delivery");
    expect(src).toContain("canInvite");
    expect(src).toContain("invite-not-authorized");
    expect(src).toContain("coverage-section");
  });

  it("coordination destination banner exists in RelayPanel", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/RelayPanel.tsx"),
      "utf8",
    );
    expect(src).toContain("coord-destination-banner");
    expect(src).toMatch(/Message[\s\S]*about/);
  });

  it("emergency blood type never invents values", () => {
    const src = readFileSync(
      join(process.cwd(), "src/pages/CarePage.tsx"),
      "utf8",
    );
    expect(src).toContain("never guessed");
    expect(src).toContain("emergency-blood-type");
    expect(src).toContain("emergency-provenance");
  });

  it("lightweight empty state exists for progressive onboarding", () => {
    const src = readFileSync(
      join(process.cwd(), "src/pages/TodayPage.tsx"),
      "utf8",
    );
    expect(src).toContain("lightweight-empty-state");
    expect(src).toContain("Getting started");
  });
});

import {
  resolveMessageTarget,
  defaultCoordinationTarget,
  isSelfMessageTarget,
} from "../src/lib/messageTarget";
import {
  labPrincipalForPath,
  emptyOnboardingDraft,
} from "../src/lib/onboarding";

describe("message targeting self-exclusion", () => {
  const members = [
    { personId: "p-sadeil", displayName: "Marcus Carter", status: "active" },
    { personId: "p-maya", displayName: "Maya Bennett", status: "active" },
    { personId: "p-walter", displayName: "Daniel Kim", status: "active" },
  ];

  it("uses clicked non-self person", () => {
    const t = resolveMessageTarget("p-maya", "p-sadeil", members);
    expect(t?.personId).toBe("p-maya");
  });

  it("never returns self when self is clicked", () => {
    const t = resolveMessageTarget("p-sadeil", "p-sadeil", members);
    expect(t).not.toBeNull();
    expect(t!.personId).not.toBe("p-sadeil");
  });

  it("returns null when only self exists", () => {
    const t = resolveMessageTarget("p-sadeil", "p-sadeil", [
      { personId: "p-sadeil", displayName: "Marcus" },
    ]);
    expect(t).toBeNull();
  });

  it("default coordination excludes self", () => {
    const id = defaultCoordinationTarget("p-maya", ["p-maya", "p-walter"], members);
    expect(id).toBe("p-walter");
  });

  it("detects self target", () => {
    expect(isSelfMessageTarget("p-sadeil", "p-sadeil")).toBe(true);
    expect(isSelfMessageTarget("p-maya", "p-sadeil")).toBe(false);
  });
});

describe("onboarding path mapping", () => {
  it("maps paths to lab principals without inventing clinical data", () => {
    expect(labPrincipalForPath("family_friend")).toBe("p-maya");
    expect(labPrincipalForPath("paid_dsp")).toBe("p-walter");
    expect(labPrincipalForPath("clinician")).toBe("p-dr-shah");
    expect(emptyOnboardingDraft().completed).toBe(false);
  });
});

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { LOGO_COLORS, logoPalette } from "../src/brand/logoTokens";

describe("production logo system", () => {
  it("defines three principal colors and tone palettes", () => {
    expect(LOGO_COLORS.ink).toBe("#0B2430");
    expect(LOGO_COLORS.tealBright).toBe("#1F8A9A");
    expect(LOGO_COLORS.gold).toBe("#D4A017");
    expect(logoPalette("color").person).toBe(LOGO_COLORS.gold);
    expect(logoPalette("ink").person).toBe(LOGO_COLORS.ink);
    expect(logoPalette("white").relay).toBe(LOGO_COLORS.white);
  });

  it("temporary live logo is wordmark-only (rejected emblem not default)", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/brand/CaretakerRelayLogo.tsx"),
      "utf8",
    );
    expect(src).toContain("wordmark-temporary");
    expect(src).toContain("showSymbol = false");
    expect(src).toContain("Caretaker");
    expect(src).toContain("Relay");
  });

  it("refinement options A/B/C exist as SVG-only source", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/brand/logoRefinements.tsx"),
      "utf8",
    );
    expect(src).toContain("LogoOptionA");
    expect(src).toContain("LogoOptionB");
    expect(src).toContain("LogoOptionC");
    expect(src).not.toContain("feGaussianBlur");
    expect(src).not.toContain("backdrop-filter");
  });

  it("BrandMark is temporary micro-mark, not rejected pin emblem", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/BrandMark.tsx"),
      "utf8",
    );
    expect(src).toContain("LogoMicroMark");
    expect(src).not.toContain("conic-gradient");
  });

  it("favicon is temporary micro-mark (not full rejected emblem)", () => {
    const fav = readFileSync(join(process.cwd(), "public/favicon.svg"), "utf8");
    expect(fav).toContain("viewBox=\"0 0 32 32\"");
    expect(fav).toContain("Temporary micro-mark");
    expect(fav).not.toContain("L39.2 42.5");
    expect(
      existsSync(
        join(
          process.cwd(),
          "docs/design/logo-refinement/comparison.html",
        ),
      ),
    ).toBe(true);
  });
});
