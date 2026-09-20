"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User } from "@/app/lib/api";
import { useAuthContext } from "@/app/components/AuthProvider";
import {
  resolveRole,
  canWrite,
  canAdmin,
  canManageMemberships,
  type UserRole,
} from "@/app/lib/permissions";

interface UseAuthOptions {
  /** If true (default), redirect to onboarding when business_id is null. */
  requireBusiness?: boolean;
}

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  timezone: string;
  /** Resolved canonical or legacy business membership role. */
  role: UserRole;
  /** True if the role can create, edit, or delete financial records. */
  canWrite: boolean;
  /** True if the role can manage business settings and imports. */
  canAdmin: boolean;
  /** True for an authoritative owner or administrator membership. */
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
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const { requireBusiness = true } = options;
  const { isAuthenticated, isLoading: authLoading, login } = useAuthContext();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState("America/Toronto");
  const [businessRole, setBusinessRole] = useState<UserRole | null>(null);

  const role = useMemo(() => businessRole ?? resolveRole(user?.role), [businessRole, user?.role]);

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

          if (businessResult.status === "fulfilled" && businessResult.value.timezone) {
            setTimezone(businessResult.value.timezone);
          }
          setBusinessRole(
            contextResult.status === "fulfilled" ? resolveRole(contextResult.value.role) : "viewer"
          );
        } else {
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

  return {
    user,
    loading: loading || authLoading,
    timezone,
    role,
    canWrite: canWrite(role),
    canAdmin: canAdmin(role),
    canManageMemberships: canManageMemberships(role),
  };
}
