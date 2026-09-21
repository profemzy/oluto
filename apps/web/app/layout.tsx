import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayoutManager } from "./components/layout/AppLayoutManager";
import { QueryProvider } from "./components/QueryProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProviderWrapper } from "./components/AuthProviderWrapper";
import { Toast } from "./components/ui/Toast";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { SkipLink } from "./components/SkipLink";
import { LiveRegion } from "./components/Announcer";
import { headers } from "next/headers";

/**
 * Primary font for the application.
 * Using next/font for automatic optimization and preload.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Core metadata for SEO and social sharing.
 */
export const metadata: Metadata = {
  title: "Oluto — Financial Operating System for Canadian Small Business",
  description:
    "Institutional double-entry bookkeeping, automated receipt reconciliation, GST/HST compliance, and CFO-level briefings built specifically for Canadian corporations and sole proprietors.",
  keywords: [
    "Canadian accounting",
    "double-entry bookkeeping",
    "GST HST filing",
    "receipt matching",
    "small business finance",
    "LedgerForge",
    "cashflow management",
  ],
  authors: [{ name: "Oluto" }],
  creator: "Oluto",
  publisher: "Oluto",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://oluto.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    siteName: "Oluto",
    title: "Oluto — Financial Operating System for Canadian Small Business",
    description:
      "Institutional double-entry bookkeeping, automated receipt reconciliation, and GST/HST compliance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Oluto - Financial Operating System for Canadian Small Business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oluto — Financial Operating System for Canadian Small Business",
    description:
      "Institutional double-entry bookkeeping, automated receipt reconciliation, and GST/HST compliance.",
    images: ["/og-image.png"],
    creator: "@oluto",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  category: "finance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1825" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let nonce: string | undefined;
  try {
    const headersList = await headers();
    nonce = headersList.get("x-nonce") ?? undefined;
  } catch {
    nonce = undefined;
  }

  return (
    <html lang="en-CA" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/init-theme.js" nonce={nonce} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"} />
      </head>
      <body className="bg-surface-secondary text-body min-h-screen font-sans antialiased">
        <SkipLink />
        <QueryProvider>
          <ThemeProvider>
            <AuthProviderWrapper>
              <LiveRegion />
              <Toast />
              <AppLayoutManager>
                <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
              </AppLayoutManager>
            </AuthProviderWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
