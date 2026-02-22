import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation, Footer, ErrorBoundary } from "./components";
import { QueryProvider } from "./components/QueryProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toast } from "./components/ui/Toast";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('oluto-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased font-sans bg-surface text-body transition-colors duration-300">
        <QueryProvider>
          <ThemeProvider>
            <Toast />
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1 pt-16">
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
