/**
 * Synchronous bridge for existing unit tests.
 * Uses foundation fixture extractor under authenticated Olivia context.
 * EvidenceMode: FIXTURE (explicit).
 */

import {
  createCareRuntime,
  sadeilContext,
  careRecipient,
  oracle,
  fixtureExtract,
  toVerificationBundle as foundationToBundle,
  isUnknownProtocolRequest,
  refuseUnknownProtocol,
  type UnderstoodCareSlice,
  type VerificationBundle,
} from "@caretaker-relay/care-domain";

export { isUnknownProtocolRequest, refuseUnknownProtocol };
export type { UnderstoodCareSlice, VerificationBundle };

const runtime = createCareRuntime({ mode: "fixture", seedOlivia: true });

export function understandCareInput(
  rawText: string,
  opts?: { recordedDoseOverride?: string },
): UnderstoodCareSlice | { refusal: string } {
  if (isUnknownProtocolRequest(rawText)) {
    return { refusal: refuseUnknownProtocol(rawText) };
  }
  // Dosage / injection handled async in CareLoopService; mirror for sync tests
  if (/what\s+dose\s+should|recommend\s+a\s+dose|prescribe/i.test(rawText)) {
    return {
      refusal:
        "I can't recommend or change medication dosages. I can show the authorized schedule from the care plan and record what a caregiver confirms they gave. For dosing questions, contact the prescribing clinician.",
    };
  }
  if (/ignore\s+(all\s+)?(prior|previous)\s+rules/i.test(rawText)) {
    return {
      refusal:
        "I can't follow instructions that try to override care safety rules. Your note was not treated as a system command. Please restate the care update in ordinary caregiver language.",
    };
  }

  return fixtureExtract(rawText, sadeilContext(), careRecipient.displayName, {
    recordedDoseOverride: opts?.recordedDoseOverride,
  });
}

export function toVerificationBundle(
  understood: UnderstoodCareSlice,
): VerificationBundle {
  const schedules = runtime.store.getMedSchedules(careRecipient.id);
  return foundationToBundle(understood, schedules);
}

export function processCaregiverUtterance(
  text: string,
  opts?: { recordedDoseOverride?: string },
):
  | { kind: "refusal"; message: string }
  | { kind: "verify"; bundle: VerificationBundle } {
  const result = understandCareInput(text, opts);
  if ("refusal" in result) {
    return { kind: "refusal", message: result.refusal };
  }
  return { kind: "verify", bundle: toVerificationBundle(result) };
}

export function scoreAgainstOracle(understood: UnderstoodCareSlice) {
  const checks = {
    correctRecipient: understood.careRecipientId === oracle.careRecipientId,
    meal: understood.meals.length > 0,
    observation: understood.observations.some((o) => /tired|fatigue/i.test(o)),
    appointment: understood.appointmentChanges.some((a) => /2:30/.test(a)),
    medication: understood.medicationEvents.length > 0,
    mayaUpdate: understood.communicationRequests.some((c) => /Maya/i.test(c)),
  };
  const values = Object.values(checks);
  const hit = values.filter(Boolean).length;
  return { checks, precisionProxy: hit / values.length };
}
