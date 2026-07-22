import { describe, expect, it } from "vitest";
import {
  isUnknownProtocolRequest,
  processCaregiverUtterance,
  scoreAgainstOracle,
  understandCareInput,
} from "../src/domain/understand";
import {
  DEMO_UTTERANCE,
  UNSAFE_PROTOCOL_UTTERANCE,
  careRecipient,
  oracle,
} from "../src/scenario/olivia";

describe("Care loop: input → understand → verify", () => {
  it("extracts meal, fatigue, PT move, med admin, Maya update from demo utterance", () => {
    const result = understandCareInput(DEMO_UTTERANCE);
    expect(result).not.toHaveProperty("refusal");
    if ("refusal" in result) return;

    expect(result.careRecipientId).toBe(careRecipient.id);
    expect(result.meals.length).toBeGreaterThan(0);
    expect(result.observations.some((o) => /tired/i.test(o))).toBe(true);
    expect(result.appointmentChanges.some((a) => /2:30/.test(a))).toBe(true);
    expect(result.medicationEvents.length).toBeGreaterThan(0);
    expect(result.communicationRequests.some((c) => /Maya/i.test(c))).toBe(
      true,
    );

    const score = scoreAgainstOracle(result);
    expect(score.precisionProxy).toBe(1);
    expect(score.checks.correctRecipient).toBe(true);
  });

  it("builds verification bundle that requires confirmation for consequential items", () => {
    const out = processCaregiverUtterance(DEMO_UTTERANCE);
    expect(out.kind).toBe("verify");
    if (out.kind !== "verify") return;
    expect(out.bundle.title).toBe("I got this");
    expect(out.bundle.items.length).toBeGreaterThanOrEqual(4);
    expect(
      out.bundle.items.some((i) => i.requiresConfirmation),
    ).toBe(true);
  });

  it("flags medication dose discrepancy as high safety without choosing", () => {
    const text =
      "I gave the lunch medication 5 mg. Let Maya know.";
    const out = processCaregiverUtterance(text);
    expect(out.kind).toBe("verify");
    if (out.kind !== "verify") return;
    const med = out.bundle.items.find((i) => i.discrepancy);
    expect(med).toBeTruthy();
    expect(med?.safetyClass).toBe("high");
    expect(med?.discrepancy?.authorizedDose).toBe(oracle.authorizedLunchDose);
    expect(med?.discrepancy?.recordedDose).toMatch(/5\s*mg/i);
  });

  it("refuses Protocol 9-Delta (ACL safety exhibit)", () => {
    expect(isUnknownProtocolRequest(UNSAFE_PROTOCOL_UTTERANCE)).toBe(true);
    const out = processCaregiverUtterance(UNSAFE_PROTOCOL_UTTERANCE);
    expect(out.kind).toBe("refusal");
    if (out.kind !== "refusal") return;
    expect(out.message.toLowerCase()).toMatch(/protocol 9-delta/);
    expect(out.message.toLowerCase()).toMatch(/won't invent|can't apply|do not invent|don't have/);
    expect(out.message).not.toMatch(/applied successfully|protocol complete/i);
  });

  it("never assigns a different care recipient in scenario path", () => {
    const result = understandCareInput(DEMO_UTTERANCE);
    if ("refusal" in result) throw new Error("unexpected refusal");
    expect(result.careRecipientName).toBe("Olivia");
    expect(result.careRecipientId).toBe(oracle.careRecipientId);
  });
});
