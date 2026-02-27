import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation, Footer } from "./components";
import { QueryProvider } from "./components/QueryProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toast } from "./components/ui/Toast";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { SkipLink } from "./components/SkipLink";
import { LiveRegion } from "./components/Announcer";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title:
    "Oluto — AI Finance Team for Canadian Small Business",
  description:
    "8 AI agents that handle your bookkeeping, chase invoices, snap receipts, and brief you like a CFO. Built on real double-entry accounting for Canadian small businesses.",
  keywords:
    "AI bookkeeping, AI accountant, AI agents, receipt OCR, small business, accounting, Canadian business, cashflow, bookkeeping, GST, HST, financial management",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get nonce from middleware for CSP compliance
  let nonce: string | undefined;
  try {
    const headersList = await headers();
    nonce = headersList.get("x-nonce") ?? undefined;
  } catch {
    // Headers not available (e.g., during static generation)
    nonce = undefined;
  }

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* 
          Theme initialization script with nonce for CSP compliance.
          This prevents flash of wrong theme by checking localStorage 
          and system preference before React hydrates.
        */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('oluto-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased font-sans bg-surface text-body transition-colors duration-300">
        <SkipLink />
        <QueryProvider>
          <ThemeProvider>
            <LiveRegion />
            <Toast />
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main id="main-content" className="flex-1 pt-16" tabIndex={-1}>
                <GlobalErrorBoundary>
                  {children}
                </GlobalErrorBoundary>
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
