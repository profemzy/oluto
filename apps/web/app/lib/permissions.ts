/**
 * Role-based permission utilities.
 *
 * Business membership hierarchy with temporary support for the legacy admin role.
 * Mirrors LedgerForge business-role enforcement.
 */

export type UserRole =
  | "owner"
  | "administrator"
  | "admin"
  | "accountant"
  | "contributor"
  | "viewer";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  contributor: 1,
  accountant: 2,
  administrator: 3,
  admin: 3,
  owner: 4,
};

/** Normalise any role string to a known UserRole (defaults to "viewer"). */
export function resolveRole(role: string | undefined | null): UserRole {
  if (role === "owner") return "owner";
  if (role === "administrator") return "administrator";
  if (role === "admin" || role === "2") return "admin";
  if (role === "accountant" || role === "1") return "accountant";
  if (role === "contributor") return "contributor";
  return "viewer";
}

/** True if the role is at least as privileged as `minRole`. */
export function hasRole(role: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/** Viewers cannot create, update, or delete anything. */
export function canWrite(role: UserRole): boolean {
  return hasRole(role, "accountant");
}

/** Only admins can import, manage business settings, etc. */
export function canAdmin(role: UserRole): boolean {
  return role === "owner" || role === "administrator" || role === "admin";
}

/** Only owners and administrators may manage business memberships. */
export function canManageMemberships(role: UserRole): boolean {
  return role === "owner" || role === "administrator" || role === "admin";
}
