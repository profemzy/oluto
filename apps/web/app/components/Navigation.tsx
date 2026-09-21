"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "./AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeLogo } from "./ThemeLogo";

interface NavItem {
  name: string;
  href: string;
}

const publicLinks: NavItem[] = [
  { name: "Platform", href: "/#agents" },
  { name: "Accounting Engine", href: "/#bookkeepers" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Compliance", href: "/#compliance" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-surface/95 border-b border-edge backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <ThemeLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex">
            {publicLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-semibold text-body hover:text-[#087E78] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-primary text-xs py-2 px-4"
              >
                Open Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-body hover:text-[#087E78] transition-colors px-2 py-1.5"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-xs py-2 px-4"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="p-2 rounded-md text-muted hover:text-heading hover:bg-surface-hover lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-edge bg-surface px-4 py-4 space-y-3 lg:hidden shadow-lg">
          {publicLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block py-2 text-sm font-semibold text-body hover:text-[#087E78]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-edge flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-primary w-full text-center text-xs py-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-secondary w-full text-center text-xs py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary w-full text-center text-xs py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
