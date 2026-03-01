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

/**
 * Primary font for the application.
 * Using next/font for automatic optimization and preload.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Prevents FOIT (Flash of Invisible Text)
});

/**
 * Core metadata for SEO and social sharing.
 * OpenGraph and Twitter cards ensure proper preview on social platforms.
 */
export const metadata: Metadata = {
  title: "Oluto — AI Finance Team for Canadian Small Business",
  description:
    "8 AI agents that handle your bookkeeping, chase invoices, snap receipts, and brief you like a CFO. Built on real double-entry accounting for Canadian small businesses.",
  keywords: [
    "AI bookkeeping",
    "AI accountant",
    "AI agents",
    "receipt OCR",
    "small business",
    "accounting",
    "Canadian business",
    "cashflow",
    "bookkeeping",
    "GST",
    "HST",
    "financial management",
  ],
  authors: [{ name: "Oluto" }],
  creator: "Oluto",
  publisher: "Oluto",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://oluto.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    siteName: "Oluto",
    title: "Oluto — AI Finance Team for Canadian Small Business",
    description:
      "8 AI agents that handle your bookkeeping, chase invoices, snap receipts, and brief you like a CFO.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Oluto - AI Finance Team for Canadian Small Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oluto — AI Finance Team for Canadian Small Business",
    description:
      "8 AI agents that handle your bookkeeping, chase invoices, snap receipts, and brief you like a CFO.",
    images: ["/og-image.png"],
    creator: "@oluto",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#06b6d4",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "business",
};

/**
 * Viewport configuration for responsive design.
 * theme-color adapts to light/dark mode for mobile browsers.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

/**
 * Root layout component.
 * Provides global providers, navigation, and accessibility features.
 */
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
    // Headers not available during static generation
    nonce = undefined;
  }

  return (
    <html
      lang="en-CA"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Theme initialization script - prevents flash of wrong theme */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('oluto-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
        {/* Preconnect to API domain for faster requests */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}
        />
      </head>
      <body className="antialiased font-sans bg-surface text-body transition-colors duration-300 min-h-screen">
        <SkipLink />
        <QueryProvider>
          <ThemeProvider>
            <LiveRegion />
            <Toast />
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main
                id="main-content"
                className="flex-1 pt-16"
                tabIndex={-1}
              >
                <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
