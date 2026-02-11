"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User } from "@/app/lib/api";

interface UseAuthOptions {
  /** If true (default), redirect to onboarding when business_id is null. */
  requireBusiness?: boolean;
}

/**
 * Shared auth gate used by every authenticated page.
 *
 * Checks the JWT token, fetches the current user, and optionally
 * redirects to onboarding if the user has no business yet.
 *
 * Returns `{ user, loading }` — render a loader while `loading` is true.
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { requireBusiness = true } = options;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push("/auth/login");
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
      })
      .catch(() => {
        api.removeToken();
        router.push("/auth/login");
      });
  }, [router, requireBusiness]);

  return { user, loading };
}
