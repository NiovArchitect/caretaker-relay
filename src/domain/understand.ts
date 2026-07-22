/**
 * App-facing understand helpers.
 *
 * Production loop logic lives in @caretaker-relay/care-domain (foundation).
 * This module re-exports synchronous helpers used by existing UI tests and
 * provides thin wrappers. Fixture path is explicitly marked — not production LLM.
 */

import {
  processCaregiverUtterance as foundationProcess,
  scoreAgainstOracle as foundationScore,
  isUnknownProtocolRequest,
  refuseUnknownProtocol,
  understandCareInput as foundationUnderstand,
  toVerificationBundle,
  type UnderstoodCareSlice,
  type VerificationBundle,
} from "./foundationBridge";

export { isUnknownProtocolRequest, refuseUnknownProtocol };

/** @deprecated Prefer proposeCareUpdate from foundation/careClient for live path. */
export function understandCareInput(
  rawText: string,
  opts?: { recordedDoseOverride?: string },
): UnderstoodCareSlice | { refusal: string } {
  return foundationUnderstand(rawText, opts);
}

export function toVerificationBundleExport(
  understood: UnderstoodCareSlice,
): VerificationBundle {
  return toVerificationBundle(understood);
}

export { toVerificationBundleExport as toVerificationBundle };

export function processCaregiverUtterance(
  text: string,
  opts?: { recordedDoseOverride?: string },
):
  | { kind: "refusal"; message: string }
  | { kind: "verify"; bundle: VerificationBundle } {
  return foundationProcess(text, opts);
}

export function scoreAgainstOracle(understood: UnderstoodCareSlice) {
  return foundationScore(understood);
}
