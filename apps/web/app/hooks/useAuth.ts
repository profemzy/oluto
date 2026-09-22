"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User } from "@/app/lib/api";
import { useAuthContext } from "@/app/components/AuthProvider";
import {
  resolveRole,
  canWrite as checkCanWrite,
  canAdmin as checkCanAdmin,
  canManageMemberships as checkCanManageMemberships,
  type UserRole,
} from "@/app/lib/permissions";

interface UseAuthOptions {
  /** If true (default), redirect to onboarding when business_id is null. */
  requireBusiness?: boolean;
}

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  /** Authoritative current business name, null while loading or without business. */
  businessName: string | null;
  timezone: string;
  /** Resolved canonical or legacy business membership role, null while loading access. */
  role: UserRole | null;
  /** True if the role can create, edit, or delete financial records. Always false while loading. */
  canWrite: boolean;
  /** True if the role can manage business settings and imports. Always false while loading. */
  canAdmin: boolean;
  /** True for an authoritative owner or administrator membership. Always false while loading. */
  canManageMemberships: boolean;
}

/**
 * Shared auth gate used by every authenticated page.
 *
 * Consumes the OIDC AuthProvider context, fetches the current user from
 * LedgerForge, and optionally redirects to onboarding if the user has
 * no business yet.
 *
 * Also fetches the business timezone (derived from province by the API)
 * so pages can generate correct local dates.
 *
 * Returns the user, authoritative business role, derived capabilities, and timezone.
 * Guarantees that while loading, role is null and mutation permissions are false
 * to eliminate transient role misrepresentation or UI flashing.
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const { requireBusiness = true } = options;
  const { isAuthenticated, isLoading: authLoading, login } = useAuthContext();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("America/Toronto");
  const [businessRole, setBusinessRole] = useState<UserRole | null>(null);

  const isActuallyLoading = loading || authLoading;

  const role = useMemo<UserRole | null>(() => {
    if (isActuallyLoading) return null;
    return businessRole ?? resolveRole(user?.role);
  }, [isActuallyLoading, businessRole, user?.role]);

  useEffect(() => {
    const abortController = new AbortController();

    if (authLoading) return;

    if (!isAuthenticated) {
      login();
      return;
    }

    api
      .getCurrentUser()
      .then(async (currentUser) => {
        if (abortController.signal.aborted) return;

        if (requireBusiness && currentUser.business_id === null) {
          router.push("/onboarding/setup-business");
          return;
        }
        setUser(currentUser);

        if (currentUser.business_id) {
          const [businessResult, contextResult] = await Promise.allSettled([
            api.businesses.getBusiness(currentUser.business_id),
            api.auth.getBusinessContext(currentUser.business_id),
          ]);
          if (abortController.signal.aborted) return;

          if (businessResult.status === "fulfilled") {
            setBusinessName(businessResult.value.name ?? null);
            if (businessResult.value.timezone) {
              setTimezone(businessResult.value.timezone);
            }
          } else {
            setBusinessName(null);
          }
          setBusinessRole(
            contextResult.status === "fulfilled" ? resolveRole(contextResult.value.role) : "viewer"
          );
        } else {
          setBusinessName(null);
          setBusinessRole(resolveRole(currentUser.role));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
          login();
        }
      });

    return () => {
      abortController.abort();
    };
  }, [authLoading, isAuthenticated, router, requireBusiness, login]);

  const canWrite = useMemo(() => (role ? checkCanWrite(role) : false), [role]);
  const canAdmin = useMemo(() => (role ? checkCanAdmin(role) : false), [role]);
  const canManageMemberships = useMemo(
    () => (role ? checkCanManageMemberships(role) : false),
    [role]
  );

  return {
    user,
    loading: isActuallyLoading,
    businessName,
    timezone,
    role,
    canWrite,
    canAdmin,
    canManageMemberships,
  };
}
