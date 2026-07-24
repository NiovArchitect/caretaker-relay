/**
 * Conversation working memory — NOT durable care truth.
 * Resolves "it", "that medicine", "yesterday", "she" within a session.
 * Scoped by principal + active recipient (multi-recipient isolation).
 */

import type { ClassifiedTurn, RelayIntent } from "./intents";

export type ConversationTurn = {
  turnId: string;
  conversationId: string;
  principalId: string;
  recipientId: string;
  timestamp: string;
  userMessage: string;
  resolvedIntent: RelayIntent;
  intents: RelayIntent[];
  entities: ClassifiedTurn["entities"];
  assistantAnswer: string;
  sourceRefs: string[];
  persona: string;
};

export type ConversationState = {
  conversationId: string;
  principalId: string;
  recipientId: string;
  turns: ConversationTurn[];
  /** Working focus — last discussed care entities */
  focus: {
    medicationName?: string;
    personName?: string;
    appointmentTitle?: string;
    observationTheme?: string;
    lastIntent?: RelayIntent;
  };
};

export type WorkingEntities = ClassifiedTurn["entities"] & {
  observationTheme?: string;
};

const stores = new Map<string, ConversationState>();

function key(principalId: string, recipientId: string): string {
  return `${principalId}::${recipientId}`;
}

export function getOrCreateConversation(
  principalId: string,
  recipientId: string,
): ConversationState {
  const k = key(principalId, recipientId);
  let s = stores.get(k);
  if (!s) {
    s = {
      conversationId: `conv-${principalId.slice(0, 6)}-${recipientId.slice(0, 8)}-${Date.now().toString(36)}`,
      principalId,
      recipientId,
      turns: [],
      focus: {},
    };
    stores.set(k, s);
  }
  return s;
}

/** Hard isolation: switching recipient must not reuse another space's turns. */
export function clearConversation(
  principalId: string,
  recipientId: string,
): void {
  stores.delete(key(principalId, recipientId));
}

export function clearAllForPrincipal(principalId: string): void {
  for (const k of [...stores.keys()]) {
    if (k.startsWith(`${principalId}::`)) stores.delete(k);
  }
}

export function resolveWithMemory(
  principalId: string,
  recipientId: string,
  classified: ClassifiedTurn,
  userMessage: string,
): ClassifiedTurn {
  const conv = getOrCreateConversation(principalId, recipientId);
  const entities = { ...classified.entities };

  // Resolve pronouns / "it" from focus
  if (
    (!entities.medicationHint || /^(it|that)$/i.test(entities.medicationHint)) &&
    conv.focus.medicationName &&
    (entities.references.includes("it") ||
      /\bit\b|\bthat (medicine|med|one|dose)\b/i.test(userMessage))
  ) {
    entities.medicationHint = conv.focus.medicationName;
  }
  if (
    !entities.personHint &&
    conv.focus.personName &&
    /\b(they|them|she|he)\b/i.test(userMessage) === false
  ) {
    // keep
  }
  if (
    entities.references.includes("yesterday") ||
    /yesterday/i.test(userMessage)
  ) {
    entities.timeHint = "yesterday";
  }

  // If follow-up is bare temporal about "it" with prior med focus
  if (
    classified.primary === "UNKNOWN_QUESTION" &&
    conv.focus.medicationName &&
    /when|before|after|who gave|did .* give/i.test(userMessage)
  ) {
    return {
      ...classified,
      primary: "MEDICATION_ADMINISTRATION_HISTORY",
      intents: ["MEDICATION_ADMINISTRATION_HISTORY", ...classified.intents],
      entities: {
        ...entities,
        medicationHint: conv.focus.medicationName,
      },
    };
  }

  // "Was that before she got dizzy?" after med discussion
  if (
    /before.*dizz|dizz.*before|before she/i.test(userMessage) &&
    (conv.focus.medicationName || conv.focus.observationTheme)
  ) {
    return {
      ...classified,
      primary: "OBSERVATION_HISTORY",
      intents: [
        "OBSERVATION_HISTORY",
        "MEDICATION_ADMINISTRATION_HISTORY",
        ...classified.intents,
      ],
      entities: {
        ...entities,
        medicationHint: conv.focus.medicationName,
      },
    };
  }

  return { ...classified, entities };
}

export function recordTurn(input: {
  principalId: string;
  recipientId: string;
  userMessage: string;
  classified: ClassifiedTurn;
  assistantAnswer: string;
  sourceRefs: string[];
  persona: string;
}): ConversationTurn {
  const conv = getOrCreateConversation(input.principalId, input.recipientId);
  const turn: ConversationTurn = {
    turnId: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    conversationId: conv.conversationId,
    principalId: input.principalId,
    recipientId: input.recipientId,
    timestamp: new Date().toISOString(),
    userMessage: input.userMessage,
    resolvedIntent: input.classified.primary,
    intents: input.classified.intents,
    entities: input.classified.entities,
    assistantAnswer: input.assistantAnswer,
    sourceRefs: input.sourceRefs,
    persona: input.persona,
  };
  conv.turns.push(turn);
  // Cap working memory
  if (conv.turns.length > 40) conv.turns = conv.turns.slice(-40);

  // Update focus from this turn (working memory only)
  if (input.classified.entities.medicationHint) {
    conv.focus.medicationName = input.classified.entities.medicationHint;
  }
  if (input.classified.entities.personHint) {
    conv.focus.personName = input.classified.entities.personHint;
  }
  if (/dizz/i.test(input.userMessage) || /dizz/i.test(input.assistantAnswer)) {
    conv.focus.observationTheme = "dizziness";
  }
  conv.focus.lastIntent = input.classified.primary;

  return turn;
}

export function getRecentTurns(
  principalId: string,
  recipientId: string,
  n = 6,
): ConversationTurn[] {
  const conv = getOrCreateConversation(principalId, recipientId);
  return conv.turns.slice(-n);
}

/** For tests only */
export function __resetConversationMemory(): void {
  stores.clear();
}
