import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation, Footer } from "./components";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Oluto - Direct Your Wealth | Financial Autopilot for Canadian Small Business",
  description: "Oluto is a cashflow-first financial management platform for Canadian small businesses. Features voice-enabled transaction capture, AI-powered categorization, and a bookkeeper console for multi-client operations.",
  keywords: "small business, accounting, Canadian business, cashflow, bookkeeping, GST, HST, financial management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
