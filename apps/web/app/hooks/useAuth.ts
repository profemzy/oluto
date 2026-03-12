"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User } from "@/app/lib/api";
import { useAuthContext } from "@/app/components/AuthProvider";
import { resolveRole, canWrite, canAdmin, type UserRole } from "@/app/lib/permissions";

interface UseAuthOptions {
  /** If true (default), redirect to onboarding when business_id is null. */
  requireBusiness?: boolean;
}

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  timezone: string;
  /** Resolved role: "admin" | "accountant" | "viewer". */
  role: UserRole;
  /** True if role >= accountant (can create/edit/delete records). */
  canWrite: boolean;
  /** True if role === admin (can import, manage business). */
  canAdmin: boolean;
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
 * Returns `{ user, loading, timezone, role, canWrite, canAdmin }`.
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const { requireBusiness = true } = options;
  const { isAuthenticated, isLoading: authLoading, login } = useAuthContext();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState("America/Toronto");

  const role = useMemo(() => resolveRole(user?.role), [user?.role]);

  useEffect(() => {
    const abortController = new AbortController();

    if (authLoading) return;

    if (!isAuthenticated) {
      login();
      return;
    }

    api
      .getCurrentUser()
      .then((currentUser) => {
        if (abortController.signal.aborted) return;

        if (requireBusiness && currentUser.business_id === null) {
          router.push("/onboarding/setup-business");
          return;
        }
        setUser(currentUser);
        setLoading(false);

        if (currentUser.business_id) {
          api
            .getBusiness(currentUser.business_id)
            .then((biz) => {
              if (!abortController.signal.aborted && biz.timezone) {
                setTimezone(biz.timezone);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
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
  };
}
