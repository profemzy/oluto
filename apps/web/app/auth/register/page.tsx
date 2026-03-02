"use client";

import { useEffect, useRef } from "react";
import { useAuthContext } from "@/app/components/AuthProvider";
import { useRouter } from "next/navigation";
import { getUserManager } from "@/app/lib/keycloak";

/**
 * Register page — redirects to Keycloak registration form via OIDC flow.
 * Uses signinRedirect with prompt=create (OIDC standard, Keycloak 26.1+).
 */
export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const redirecting = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }
    if (!redirecting.current) {
      redirecting.current = true;
      getUserManager().signinRedirect({
        prompt: "create",
      }).catch((err) => {
        console.error("signinRedirect (register) failed:", err);
      });
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <svg
        className="animate-spin h-8 w-8 text-cyan-600"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="mt-4 text-sm text-muted">Redirecting to sign up...</p>
    </div>
  );
}
