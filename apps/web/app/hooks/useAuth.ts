"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User } from "@/app/lib/api";
import { useAuthContext } from "@/app/components/AuthProvider";

interface UseAuthOptions {
  /** If true (default), redirect to onboarding when business_id is null. */
  requireBusiness?: boolean;
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
 * Returns `{ user, loading, timezone }` — render a loader while `loading` is true.
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { requireBusiness = true } = options;
  const { isAuthenticated, isLoading: authLoading, login } = useAuthContext();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState("America/Toronto");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      login();
      return;
    }

    api
      .getCurrentUser()
      .then((currentUser) => {
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
              if (biz.timezone) setTimezone(biz.timezone);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        login();
      });
  }, [authLoading, isAuthenticated, router, requireBusiness, login]);

  return { user, loading: loading || authLoading, timezone };
}
