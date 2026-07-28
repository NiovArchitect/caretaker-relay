/**
 * Screen purpose + signal budget contracts.
 * Each major page answers one question; content outside that purpose is secondary.
 */

export type PageId =
  | "today"
  | "care"
  | "my_shift"
  | "tasks"
  | "schedule"
  | "notifications"
  | "people"
  | "privacy"
  | "documents"
  | "relay";

export type PagePurpose = {
  id: PageId;
  question: string;
  /** Soft budget for primary cards / attention items on mobile. */
  primarySignalBudget: number;
  lead: string;
};

export const PAGE_PURPOSES: Record<PageId, PagePurpose> = {
  today: {
    id: "today",
    question: "What matters now?",
    primarySignalBudget: 5,
    lead: "What needs attention for this person today — not the full care history.",
  },
  care: {
    id: "care",
    question: "What is the current care picture?",
    primarySignalBudget: 8,
    lead: "Current medications, observations, appointments, and reviews — with pending clearly separate from active.",
  },
  my_shift: {
    id: "my_shift",
    question: "What must I do during this assignment?",
    primarySignalBudget: 6,
    lead: "Your shift duties, handoff in, and what to leave for the next caregiver.",
  },
  tasks: {
    id: "tasks",
    question: "Who owns what?",
    primarySignalBudget: 8,
    lead: "Open work that needs an owner — claim, complete, or reassign.",
  },
  schedule: {
    id: "schedule",
    question: "What is happening and when?",
    primarySignalBudget: 8,
    lead: "Upcoming appointments and timing only — details live on Care when needed.",
  },
  notifications: {
    id: "notifications",
    question: "What new information needs acknowledgment?",
    primarySignalBudget: 5,
    lead: "New alerts only. Acknowledging removes them from this list.",
  },
  people: {
    id: "people",
    question: "Who is authorized or assigned?",
    primarySignalBudget: 10,
    lead: "Authorized helpers, invitations, and messaging — not clinical details.",
  },
  privacy: {
    id: "privacy",
    question: "Who can access what and why?",
    primarySignalBudget: 10,
    lead: "Access, pending requests, and scope. Approve, limit, or revoke with audit.",
  },
  documents: {
    id: "documents",
    question: "What source records exist and what awaits review?",
    primarySignalBudget: 6,
    lead: "Source documents and proposed facts. Nothing becomes care truth until confirmed.",
  },
  relay: {
    id: "relay",
    question: "What can I ask, report, or do?",
    primarySignalBudget: 4,
    lead: "Ask, report, and confirm care updates. Relay does not invent clinical orders.",
  },
};

/** Cap a list to the page’s primary signal budget (keeps first N). */
export function applySignalBudget<T>(page: PageId, items: T[]): T[] {
  const n = PAGE_PURPOSES[page].primarySignalBudget;
  return items.slice(0, n);
}
