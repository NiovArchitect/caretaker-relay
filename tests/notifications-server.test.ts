import { describe, expect, it } from "vitest";
import {
  createCareRuntime,
  notificationFromCoordination,
  listNotificationsForPrincipal,
  markSeen,
  createClarificationRequest,
  respondToClarification,
  createNotificationIfNew,
} from "@caretaker-relay/care-domain";

describe("server-backed notifications", () => {
  it("Daniel → Marcus coordination creates Marcus notification", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const n = notificationFromCoordination({
      store,
      careRecipientId: "cr-olivia",
      messageId: "coord-1",
      fromPersonId: "p-walter",
      fromDisplayName: "Daniel Kim",
      toPersonId: "p-sadeil",
      body: "Evelyn completed mobility exercises.",
    });
    expect(n.principalId).toBe("p-sadeil");
    const list = listNotificationsForPrincipal(store, "p-sadeil", "cr-olivia");
    expect(list.some((x) => x.id === n.id)).toBe(true);
    expect(listNotificationsForPrincipal(store, "p-maya", "cr-olivia").some((x) => x.id === n.id)).toBe(false);
  });

  it("dedupes by dedupeKey", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const a = createNotificationIfNew(store, {
      principalId: "p-sadeil",
      careRecipientId: "cr-olivia",
      type: "NEW_COORDINATION_MESSAGE",
      priority: "attention",
      title: "t",
      body: "b",
      sourceType: "coordination",
      sourceId: "same",
      actionType: "open_coordination",
      actionTarget: "x",
      dedupeKey: "dedupe-test-1",
    });
    const b = createNotificationIfNew(store, {
      principalId: "p-sadeil",
      careRecipientId: "cr-olivia",
      type: "NEW_COORDINATION_MESSAGE",
      priority: "attention",
      title: "t2",
      body: "b2",
      sourceType: "coordination",
      sourceId: "same",
      actionType: "open_coordination",
      actionTarget: "x",
      dedupeKey: "dedupe-test-1",
    });
    expect(a.id).toBe(b.id);
  });

  it("Marcus → Maya clarification → Maya notification → response → Marcus notification", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const { request, notification } = createClarificationRequest(store, {
      careRecipientId: "cr-olivia",
      requesterPersonId: "p-sadeil",
      requesterDisplayName: "Marcus Carter",
      targetPersonId: "p-maya",
      targetDisplayName: "Maya Bennett",
      question: "Did you give lunch medication yesterday?",
    });
    expect(notification.principalId).toBe("p-maya");
    const mayaInbox = listNotificationsForPrincipal(store, "p-maya", "cr-olivia");
    expect(mayaInbox.some((n) => n.type === "CLARIFICATION_REQUEST")).toBe(true);

    const resp = respondToClarification(store, {
      requestId: request.id,
      careRecipientId: "cr-olivia",
      responderPersonId: "p-maya",
      responderDisplayName: "Maya Bennett",
      body: "Yes, I gave Metformin with lunch around noon.",
    });
    expect(resp?.notification?.principalId).toBe("p-sadeil");
    const marcusInbox = listNotificationsForPrincipal(store, "p-sadeil", "cr-olivia");
    expect(marcusInbox.some((n) => n.type === "CLARIFICATION_RESPONSE")).toBe(true);
  });

  it("seen state is server-side", () => {
    const { store } = createCareRuntime({ seedOlivia: true });
    const n = notificationFromCoordination({
      store,
      careRecipientId: "cr-olivia",
      messageId: "coord-seen",
      fromPersonId: "p-walter",
      fromDisplayName: "Daniel Kim",
      toPersonId: "p-sadeil",
      body: "hello",
    });
    const updated = markSeen(store, "p-sadeil", n.id);
    expect(updated?.seenAt).toBeTruthy();
    const again = listNotificationsForPrincipal(store, "p-sadeil", "cr-olivia").find((x) => x.id === n.id);
    expect(again?.seenAt).toBeTruthy();
  });
});
