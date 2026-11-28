/** Client- and server-safe user identity matching helpers. */

export function isSamePerson(nameA?: string | null, nameB?: string | null): boolean {
  if (!nameA || !nameB) return false;
  const a = nameA.toLowerCase().trim().replace(/^@/, "");
  const b = nameB.toLowerCase().trim().replace(/^@/, "");
  if (!a || !b) return false;
  if (a === b) return true;
  const aParts = a.split(/\s+/);
  const bParts = b.split(/\s+/);
  if (
    aParts[0].length >= 3 &&
    aParts[0] === bParts[0] &&
    (aParts.length === 1 || bParts.length === 1)
  ) {
    return true;
  }
  return false;
}

export interface CurrentUserIdentity {
  userId?: string | null;
  name?: string | null;
  email?: string | null;
}

export interface TargetUserCandidate {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

export function isCurrentUserMatch(
  current: CurrentUserIdentity,
  target: TargetUserCandidate
): boolean {
  if (current.userId && target.userId) {
    return target.userId === current.userId;
  }
  if (current.email && target.userEmail) {
    return target.userEmail.toLowerCase() === current.email.toLowerCase();
  }
  return isSamePerson(target.userName, current.name);
}
