/**
 * People → Coordination targeting rules.
 * Never default message destination to the signed-in user.
 */

export type MessageablePerson = {
  personId: string;
  displayName: string;
  status?: string;
};

/**
 * Resolve who Coordination should address after a People Message click.
 * Returns null when the only candidates are self or the list is empty.
 */
export function resolveMessageTarget(
  clickedPersonId: string,
  selfPersonId: string,
  members: MessageablePerson[],
): MessageablePerson | null {
  const clicked = members.find((m) => m.personId === clickedPersonId);
  if (clicked && clicked.personId !== selfPersonId) {
    return clicked;
  }
  // Clicked self (or unknown): do not message self — pick another active person.
  const other =
    members.find(
      (m) =>
        m.personId !== selfPersonId &&
        m.personId !== clickedPersonId &&
        (m.status === "active" || !m.status),
    ) ?? members.find((m) => m.personId !== selfPersonId);
  return other ?? null;
}

/** Default Coordination "To" when opening messages without a People click. */
export function defaultCoordinationTarget(
  selfPersonId: string,
  preferredIds: string[],
  members: MessageablePerson[] = [],
): string | null {
  for (const id of preferredIds) {
    if (id && id !== selfPersonId) {
      if (!members.length || members.some((m) => m.personId === id)) {
        return id;
      }
    }
  }
  const fromMembers = members.find((m) => m.personId !== selfPersonId);
  return fromMembers?.personId ?? null;
}

export function isSelfMessageTarget(
  targetPersonId: string | null | undefined,
  selfPersonId: string,
): boolean {
  if (!targetPersonId) return false;
  return targetPersonId === selfPersonId;
}
