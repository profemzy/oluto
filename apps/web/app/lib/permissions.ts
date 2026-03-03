/**
 * Role-based permission utilities.
 *
 * Role hierarchy: admin > accountant > viewer
 * Mirrors the backend (LedgerForge + ZeroClaw) role enforcement.
 */

export type UserRole = "admin" | "accountant" | "viewer";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  accountant: 1,
  admin: 2,
};

/** Normalise any role string to a known UserRole (defaults to "viewer"). */
export function resolveRole(role: string | undefined | null): UserRole {
  if (role === "admin") return "admin";
  if (role === "accountant") return "accountant";
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
  return role === "admin";
}
