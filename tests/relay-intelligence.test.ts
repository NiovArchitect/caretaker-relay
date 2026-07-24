import { describe, expect, it, beforeEach } from "vitest";
import { classifyIntent, classifyPersona } from "../src/lib/relay/intents";
import {
  __resetConversationMemory,
  getOrCreateConversation,
  recordTurn,
  resolveWithMemory,
} from "../src/lib/relay/conversationMemory";
import { runAnswerEngine, answerDependsOnState } from "../src/lib/relay/answerEngine";
import { buildProjections } from "../src/lib/relay/projections";
import type { CareStateSnapshot } from "../src/foundation/careClient";

const evelynState = (): CareStateSnapshot => ({
  careRecipientId: "cr-olivia",
  medicationSchedules: [
    {
      id: "med-lunch",
      name: "Metformin",
      dose: "500 mg",
      scheduleTime: "12:00 PM",
      windowStart: "11:30 AM",
      windowEnd: "12:30 PM",
      mealRelation: "Take with food",
      authorizedBy: "Dr. Priya Shah",
      scheduleLabel: "Take with food at lunch",
    },
  ],
  medicationRecords: [
    {
      id: "mar-1",
      doseRecorded: "500 mg",
      administeredAt: "2026-07-22T19:58:00Z",
      administeredByPersonId: "p-maya",
      name: "Metformin",
    },
  ],
  appointments: [
    {
      id: "apt-pt",
      title: "Physical therapy",
      startsAt: "2026-07-24T22:00:00Z",
      startsAtLabel: "Friday, July 24 · 3:00 PM – 4:00 PM PDT",
      location: "North County Physical Therapy",
      status: "moved",
      previousStartsAtLabel: "Thursday, July 23 · 2:30 PM PDT",
    },
  ],
  observations: [
    {
      id: "o1",
      summary: "Brief dizziness when standing",
      observedAt: "2026-07-22T20:30:00Z",
      source: { actorName: "Marcus Carter" },
    },
    {
      id: "o2",
      summary: "More fatigue after lunch",
      observedAt: "2026-07-22T20:00:00Z",
      source: { actorName: "Daniel Kim" },
    },
  ],
  tasks: [],
  events: [
    {
      id: "e1",
      statement: "PT moved to Friday 3:00 PM",
      occurredAt: "2026-07-22T16:00:00Z",
      source: { actorName: "Marcus Carter" },
    },
  ],
  openSafetyReviews: [
    {
      id: "r1",
      reason: "reported dose unit incompatible dimensions",
      status: "open",
    },
  ],
  handoffs: [],
  source: "package",
});

describe("intent classification", () => {
  it("classifies family medication due", () => {
    const c = classifyIntent("What medicine does Evelyn need next?");
    expect(c.primary).toBe("MEDICATION_DUE");
  });

  it("classifies DSP visit change", () => {
    const c = classifyIntent("What changed since my last visit?");
    expect(c.intents).toContain("CHANGE_SINCE");
  });

  it("classifies provider prep", () => {
    const c = classifyIntent("Prepare an update for Dr. Shah");
    expect(
      c.intents.some((i) =>
        ["PROVIDER_UPDATE_PREP", "PROVIDER_INSTRUCTION"].includes(i),
      ),
    ).toBe(true);
  });

  it("maps roles to personas", () => {
    expect(classifyPersona("Primary family caregiver")).toBe("family");
    expect(classifyPersona("Professional caregiver")).toBe("professional_dsp");
    expect(classifyPersona("Primary care physician")).toBe("physician");
  });
});

describe("conversation memory + follow-ups", () => {
  beforeEach(() => __resetConversationMemory());

  it("resolves it to prior medication", () => {
    const a = runAnswerEngine({
      question: "What medication does Evelyn need next?",
      principalId: "p-sadeil",
      principalName: "Marcus Carter",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
    });
    expect(a.answer).toMatch(/Metformin|12:00/i);

    const b = runAnswerEngine({
      question: "When did Maya give it yesterday?",
      principalId: "p-sadeil",
      principalName: "Marcus Carter",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
    });
    expect(b.answer).toMatch(/Maya|500 mg|recorded/i);
    expect(b.intent).toMatch(/MEDICATION|OBSERVATION|UNKNOWN/);
  });

  it("isolates conversation by recipient", () => {
    runAnswerEngine({
      question: "What medication does Evelyn need next?",
      principalId: "p-sadeil",
      principalName: "Marcus Carter",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
    });
    const evelyn = getOrCreateConversation("p-sadeil", "cr-olivia");
    expect(evelyn.focus.medicationName).toBeTruthy();

    const robert = getOrCreateConversation("p-sadeil", "cr-robert");
    expect(robert.turns.length).toBe(0);
    expect(robert.focus.medicationName).toBeUndefined();
  });
});

describe("role-conditioned answers", () => {
  beforeEach(() => __resetConversationMemory());

  it("family vs dsp vs physician differ on same medication question", () => {
    const q = "What's going on with Evelyn's medication?";
    const family = runAnswerEngine({
      question: q,
      principalId: "p-sadeil",
      principalName: "Marcus",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
      attentionLines: ["dose mismatch"],
    });
    const dsp = runAnswerEngine({
      question: q,
      principalId: "p-walter",
      principalName: "Daniel",
      roleLabel: "Professional caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
    });
    const md = runAnswerEngine({
      question: q,
      principalId: "p-dr-shah",
      principalName: "Dr. Shah",
      roleLabel: "Primary care physician",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
    });
    expect(family.persona).toBe("family");
    expect(dsp.persona).toBe("professional_dsp");
    expect(md.persona).toBe("physician");
    // Same truth, different projection shapes
    expect(family.answer).not.toEqual(md.answer);
    expect(dsp.answer).toMatch(/document|authorized|care plan/i);
    expect(md.answer).toMatch(/authorized|uncertain|reported|Sources/i);
  });
});

describe("current-truth refresh", () => {
  beforeEach(() => __resetConversationMemory());

  it("changes answer when administration appears", () => {
    const empty = evelynState();
    empty.medicationRecords = [];
    const a = runAnswerEngine({
      question: "Did anyone already give her lunch medicine?",
      principalId: "p-sadeil",
      principalName: "Marcus",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: empty,
      persistTurn: false,
    });
    const withMar = evelynState();
    const b = runAnswerEngine({
      question: "Did anyone already give her lunch medicine?",
      principalId: "p-sadeil",
      principalName: "Marcus",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: withMar,
      persistTurn: false,
    });
    expect(answerDependsOnState(a, b)).toBe(true);
    expect(b.answer).toMatch(/Maya|500 mg|recorded/i);
  });
});

describe("projections + reminders", () => {
  it("builds decision-ready projections and advance appointment reminders", () => {
    const p = buildProjections({
      state: evelynState(),
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
    });
    expect(p.CURRENT_MEDICATIONS.length).toBe(1);
    expect(p.NEXT_APPOINTMENT).toBeTruthy();
    expect(p.REMINDERS.some((r) => r.phase === "day_before")).toBe(true);
    expect(p.REMINDERS.some((r) => r.kind === "medication")).toBe(true);
    expect(p.FACILITY_CONTEXT[0]?.note).toMatch(/synthetic/i);
    expect(p.DEMENTIA_WATCH.length).toBeGreaterThan(0);
    expect(p.DSP_SUPPORT_NOTES.length).toBeGreaterThan(0);
  });
});

describe("multi-recipient non-leak", () => {
  beforeEach(() => __resetConversationMemory());

  it("robert answers do not mention Metformin/Evelyn truth", () => {
    // Seed Evelyn conversation first
    runAnswerEngine({
      question: "What medication does Evelyn need next?",
      principalId: "p-sadeil",
      principalName: "Marcus",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
    });
    const robertState: CareStateSnapshot = {
      careRecipientId: "cr-robert",
      medicationSchedules: [
        {
          name: "Lisinopril",
          dose: "10 mg",
          scheduleTime: "8:00 AM",
          authorizedBy: "Dr. Amara Cole",
        },
      ],
      medicationRecords: [],
      appointments: [],
      observations: [],
      tasks: [],
      events: [],
      openSafetyReviews: [],
      handoffs: [],
      source: "package",
    };
    const ans = runAnswerEngine({
      question: "What medication is due next?",
      principalId: "p-sadeil",
      principalName: "Marcus",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-robert",
      recipientName: "Robert Hale",
      state: robertState,
    });
    expect(ans.answer).toMatch(/Lisinopril|Robert/i);
    expect(ans.answer).not.toMatch(/Metformin/i);
    expect(ans.answer).not.toMatch(/Evelyn/i);
  });
});

describe("memory is not truth", () => {
  beforeEach(() => __resetConversationMemory());

  it("stores turns but answer still requires projections", () => {
    const r = runAnswerEngine({
      question: "When is her next appointment?",
      principalId: "p-sadeil",
      principalName: "Marcus",
      roleLabel: "Primary family caregiver",
      recipientId: "cr-olivia",
      recipientName: "Evelyn Carter",
      state: evelynState(),
    });
    const conv = getOrCreateConversation("p-sadeil", "cr-olivia");
    expect(conv.turns.length).toBe(1);
    expect(r.answer).toMatch(/Physical therapy|3:00/i);
    // Conversation history exists but is non-authoritative label
    expect(conv.turns[0]!.assistantAnswer).toBe(r.answer);
  });
});
