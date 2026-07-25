import { describe, expect, it } from "vitest";
import { createCareRuntime, answerRelayQuestion } from "@caretaker-relay/care-domain";

describe("coherence answer quality", () => {
  it("person-specific Maya admin does not silently attribute Marcus", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const r = answerRelayQuestion({
      question: "When did Maya give it yesterday?",
      principalId: "p-sadeil",
      principalDisplayName: "Marcus Carter",
      roleLabel: "Primary family caregiver",
      careRecipientId: "cr-olivia",
      recipientDisplayName: "Evelyn Carter",
      store,
    });
    // Seed has Maya MAR — should mention Maya or say if missing
    expect(r.answer).toMatch(/Maya|don't have a medication administration recorded from Maya/i);
    if (/Marcus Carter/i.test(r.answer) && !/Maya/i.test(r.answer)) {
      throw new Error("Attributed to Marcus without Maya distinction");
    }
  });

  it("does not dump PT reminders on simple medication-next question", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const r = answerRelayQuestion({
      question: "What medication does Evelyn need next?",
      principalId: "p-sadeil",
      principalDisplayName: "Marcus Carter",
      roleLabel: "Primary family caregiver",
      careRecipientId: "cr-olivia",
      recipientDisplayName: "Evelyn Carter",
      store,
    });
    expect(r.answer).toMatch(/Metformin|500|12:00/i);
    expect(r.answer).not.toMatch(/rule-based|LLM timer/i);
    expect(r.answer).not.toMatch(/day-before reminder/i);
  });

  it("Dr Shah on Robert is not silently Dr Cole", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const r = answerRelayQuestion({
      question: "What did Dr. Shah say about that?",
      principalId: "p-sadeil",
      principalDisplayName: "Marcus Carter",
      roleLabel: "Primary family caregiver",
      careRecipientId: "cr-robert",
      recipientDisplayName: "Robert Hale",
      store,
    });
    expect(r.answer).toMatch(/isn't listed|don't have (a )?Dr\. Shah|not .*provider/i);
    // May mention Cole as alternative but not as if she is Shah
    if (/Dr\. Shah.*Lisinopril|Shah's current medication instruction is from Dr\. Amara/i.test(r.answer)) {
      throw new Error("Silent provider substitution");
    }
  });

  it("Robert has no Evelyn dementia watch dump", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const r = answerRelayQuestion({
      question: "Is there anything we're supposed to watch for?",
      principalId: "p-sadeil",
      principalDisplayName: "Marcus Carter",
      roleLabel: "Primary family caregiver",
      careRecipientId: "cr-robert",
      recipientDisplayName: "Robert Hale",
      store,
    });
    expect(r.answer).not.toMatch(/dementia-aware/i);
  });
});
