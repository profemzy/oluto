"use client";

import Link from "next/link";
import { ThemeLogo } from "./ThemeLogo";

interface FooterProps {
  companyName?: string;
  tagline?: string;
}

const footerLinks = [
  { label: "Platform", href: "/#agents" },
  { label: "Accounting Engine", href: "/#bookkeepers" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Sign In", href: "/auth/login" },
  { label: "Get Started", href: "/auth/register" },
] as const;

export function Footer({
  companyName = "InfoTitans LTD",
  tagline = "Double-entry financial operating system built for Canadian small businesses and bookkeeping teams.",
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-edge bg-surface"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link href="/" className="inline-block" aria-label="Oluto homepage">
              <ThemeLogo className="h-8 w-auto" />
            </Link>
            <p className="mt-2 text-xs text-muted max-w-sm leading-relaxed">
              {tagline}
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-6 text-xs font-semibold text-body"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-[#087E78] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-edge-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-caption">
          <p suppressHydrationWarning>
            &copy; {currentYear} {companyName}. Built in Canada. All rights reserved.
          </p>
          <nav className="flex items-center gap-4" aria-label="Legal links">
            <Link href="/privacy" className="hover:text-body transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-body transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
