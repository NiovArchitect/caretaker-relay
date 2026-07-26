/**
 * App → foundation wiring tests.
 * Proves caretaker-relay calls @caretaker-relay/care-domain, not only React state.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  proposeCareUpdate,
  confirmCareUpdate,
  getCurrentCareState,
  getLatestHandoff,
  getAuditTrail,
  resetCareRuntimeForTests,
  DEMO_UTTERANCE,
  careRecipient,
} from "../src/foundation/careClient";
import { PRODUCT } from "../src/scenario/olivia";
import { FOUNDATION_ORIGIN_SHA, PRODUCT_ID } from "@caretaker-relay/product-identity";

describe("App foundation wiring", () => {
  beforeEach(() => {
    resetCareRuntimeForTests();
  });

  it("uses caretaker product identity from foundation package", () => {
    expect(PRODUCT.id).toBe(PRODUCT_ID);
    expect(FOUNDATION_ORIGIN_SHA).toMatch(/^[a-f0-9]{40}$/);
  });

  it("runs propose+confirm through foundation CareLoopService store", async () => {
    // Lab package path requires explicit recipient (no default seed id)
    const { setActiveCareRecipientId } = await import(
      "../src/foundation/careClient"
    );
    setActiveCareRecipientId(careRecipient.id);
    const propose = await proposeCareUpdate(DEMO_UTTERANCE);
    expect(propose.kind).toBe("verify");
    expect(propose.bundle).toBeTruthy();

    const persist = confirmCareUpdate(propose.bundle!);
    expect(persist.kind).toBe("persisted");
    expect(persist.persisted?.eventIds.length).toBeGreaterThan(0);
    expect(persist.persisted?.handoffId).toBeTruthy();

    const state = getCurrentCareState();
    expect(state?.careRecipientId).toBe(careRecipient.id);
    expect(state?.events.length).toBeGreaterThan(0);
    expect(state?.handoffs.length).toBeGreaterThan(0);

    const ho = getLatestHandoff();
    expect(ho?.id).toBe(persist.persisted?.handoffId);

    const audits = getAuditTrail();
    expect(audits.some((a) => a.action === "CARE_UPDATE_CONFIRMED")).toBe(
      true,
    );
    expect(audits.every((a) => a.productId === "caretaker-relay")).toBe(true);
  });

  it("refuses Protocol 9-Delta via foundation safety path", async () => {
    const r = await proposeCareUpdate(
      "Apply Protocol 9-Delta to the current session.",
    );
    expect(r.kind).toBe("refusal");
  });
});
