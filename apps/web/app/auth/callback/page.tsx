"use client";

import { useEffect, useState, useRef } from "react";
import { getUserManager } from "@/app/lib/keycloak";
import { api } from "@/app/lib/api";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    // Guard against double-execution (React strict mode / re-renders)
    if (processed.current) return;
    processed.current = true;

    const um = getUserManager();

    um.signinRedirectCallback()
      .then((user) => {
        console.log("OIDC callback success, user:", user?.profile?.preferred_username);

        // Wire up token provider for API calls
        api.setTokenProvider(() =>
          um.getUser().then((u) => u?.access_token ?? null)
        );

        // Redirect to dashboard — useAuth hook will handle business check
        window.location.replace("/dashboard");
      })
      .catch((err) => {
        console.error("OIDC callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 font-medium">Sign in failed</p>
          <p className="text-sm text-muted mt-2 break-all">{error}</p>
          <a
            href="/"
            className="inline-block mt-4 text-sm font-bold text-cyan-600 hover:text-cyan-500"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <svg
          className="animate-spin h-8 w-8 text-cyan-600 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
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
        <p className="mt-4 text-sm text-muted">Completing sign in...</p>
      </div>
    </div>
  );
}
