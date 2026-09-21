"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";
import { Navigation } from "../Navigation";
import { Footer } from "../Footer";

interface AppLayoutManagerProps {
  children: React.ReactNode;
}

export function AppLayoutManager({ children }: AppLayoutManagerProps) {
  const pathname = usePathname();

  // Determine page type
  const isAuthPage = pathname.startsWith("/auth/");
  const isAppPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/bills") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/reconciliation") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/daily-briefings");

  // 1. Authenticated Application Pages: Render persistent operational sidebar, NO marketing footer
  if (isAppPage) {
    return <AppShell>{children}</AppShell>;
  }

  // 2. Focused Authentication Pages: Clean, distraction-free layout, NO marketing footer
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-surface-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    );
  }

  // 3. Public Marketing & Legal Pages: Public header, content, and restrained legal footer
  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary">
      <Navigation />
      <main id="main-content" className="flex-1 pt-16" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
