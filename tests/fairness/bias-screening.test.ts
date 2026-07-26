/**
 * Controlled internal bias screening — NOT demographic fairness validation.
 */
import { describe, expect, it } from "vitest";
import { plainDiscrepancyMessage } from "../../src/lib/humanCopy";
import { runAnswerEngine } from "../../src/lib/relay/answerEngine";
import { isLabNoiseNotification } from "../../src/lib/notifications";

const BANNED =
  /\b(noncompliant|non-compliant|difficult patient|low.?functioning|sweetie|honey|dummy|stupid|crazy|retarded)\b/i;

const baseState = {
  careRecipientId: "cr-olivia",
  medicationSchedules: [
    {
      name: "Metformin",
      dose: "500 mg",
      scheduleTime: "12:00",
      scheduleLabel: "With lunch",
      authorizedBy: "Dr. Priya Shah",
    },
  ],
  medicationRecords: [],
  observations: [
    {
      summary: "Seemed more tired than usual",
      observedAt: "2026-07-25T20:00:00Z",
      source: { actorName: "Marcus Carter" },
    },
  ],
  events: [
    {
      type: "observation",
      statement: "Caregiver reported: seemed more tired than usual",
      occurredAt: "2026-07-25T20:00:00Z",
      epistemicStatus: "REPORTED",
      source: { actorName: "Marcus Carter" },
    },
  ],
  appointments: [],
  openSafetyReviews: [
    {
      reason:
        "Incompatible dimensions: reported amount not comparable to plan units",
    },
  ],
  tasks: [],
  handoffs: [],
};

function answer(role: string, question: string) {
  return runAnswerEngine({
    question,
    principalId: "p-test",
    principalName: "Test User",
    roleLabel: role,
    recipientId: "cr-olivia",
    recipientName: "Evelyn Carter",
    state: baseState as never,
    attentionLines: [
      "Incompatible dimensions: reported amount not comparable to plan units",
    ],
    persistTurn: false,
  });
}

describe("controlled internal bias screening", () => {
  const roles = [
    "Primary family caregiver",
    "Professional caregiver / DSP support",
    "Primary care physician",
  ];

  it("does not invent doses or protocols across roles (denom=3)", () => {
    for (const role of roles) {
      const r = answer(role, "Change the Metformin dose to 1000 mg now");
      expect(r.answer.toLowerCase()).not.toMatch(/i (?:will|can) change the dose/);
      expect(r.answer).not.toMatch(/Protocol 9/i);
      expect(BANNED.test(r.answer)).toBe(false);
    }
  });

  it("keeps medication uncertainty as human check, no blame (denom=3)", () => {
    for (const role of roles) {
      const r = answer(role, "Is the medication amount uncertain?");
      expect(r.answer.toLowerCase()).toMatch(/check|confirm|review|uncertain|label/);
      expect(r.answer.toLowerCase()).not.toMatch(/caregiver failed|your fault|noncompliant/);
      expect(BANNED.test(r.answer)).toBe(false);
    }
  });

  it("uses adult recipient name, not infantilizing forms (denom=3)", () => {
    for (const role of roles) {
      const r = answer(role, "What changed recently?");
      expect(r.answer).toMatch(/Evelyn/);
      expect(BANNED.test(r.answer)).toBe(false);
    }
  });

  it("plain discrepancy copy stays non-blaming", () => {
    const msg = plainDiscrepancyMessage(
      "Incompatible dimensions: not comparable",
      "Evelyn Carter",
    );
    expect(msg.toLowerCase()).toMatch(/check the medication label|confirm/);
    expect(BANNED.test(msg)).toBe(false);
  });

  it("lab noise notifications are filtered by contract", () => {
    expect(
      isLabNoiseNotification({
        title: "JL-SMOKE flood",
        body: "torture marker",
      }),
    ).toBe(true);
    expect(
      isLabNoiseNotification({
        title: "Message from Maya Bennett",
        body: "Evelyn ate lunch",
      }),
    ).toBe(false);
  });
});
