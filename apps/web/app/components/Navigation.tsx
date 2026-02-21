"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeLogo } from "./ThemeLogo";

interface NavChild {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href?: string;
  children?: NavChild[];
}

const marketingLinks: NavItem[] = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "For Bookkeepers", href: "#bookkeepers" },
  { name: "Pricing", href: "#pricing" },
];

const appLinks: NavItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  {
    name: "Sales",
    children: [
      { name: "Invoices", href: "/invoices" },
      { name: "Payments Received", href: "/payments" },
    ],
  },
  {
    name: "Purchases",
    children: [
      { name: "Bills", href: "/bills" },
      { name: "Bill Payments", href: "/payments/new/bill" },
    ],
  },
  { name: "Contacts", href: "/contacts" },
  { name: "Accounts", href: "/accounts" },
  { name: "Reconciliation", href: "/reconciliation" },
  { name: "Reports", href: "/reports" },
];

function isGroupActive(item: NavItem, pathname: string): boolean {
  if (item.href)
    return pathname === item.href || pathname.startsWith(item.href + "/");
  if (item.children)
    return item.children.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
    );
  return false;
}

function DesktopDropdown({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const active = isGroupActive(item, pathname);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`nav-link text-sm font-semibold transition-colors inline-flex items-center gap-1 ${
          active ? "text-cyan-600" : "text-body hover:text-cyan-600"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {item.name}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-surface/95 backdrop-blur-xl border border-edge shadow-lg py-1 z-50">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname === child.href || pathname.startsWith(child.href + "/")
                  ? "text-cyan-600 bg-cyan-50/50"
                  : "text-heading hover:text-cyan-600 hover:bg-surface-hover"
              }`}
              onClick={() => setOpen(false)}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileDropdown({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = isGroupActive(item, pathname);

  return (
    <div>
      <button
        className={`w-full flex items-center justify-between py-2.5 text-base font-medium transition-colors ${
          active ? "text-cyan-600" : "text-heading hover:text-cyan-600"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {item.name}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="pl-4 space-y-1">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block py-2 text-sm font-medium transition-colors ${
                pathname === child.href || pathname.startsWith(child.href + "/")
                  ? "text-cyan-600"
                  : "text-muted hover:text-cyan-600"
              }`}
              onClick={onNavigate}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [authCheckedPath, setAuthCheckedPath] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setIsAuthenticated(api.isAuthenticated());
    setAuthCheckedPath(pathname);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (hasMounted && authCheckedPath !== pathname) {
    setAuthCheckedPath(pathname);
    setIsAuthenticated(api.isAuthenticated());
  }

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
    pathname.startsWith("/reconciliation");

  // Until client mounts, always show marketing links to match SSR output
  const navLinks = hasMounted && isAppPage && isAuthenticated ? appLinks : marketingLinks;
  const showAuth = !hasMounted || !isAppPage || !isAuthenticated;

  const handleLogout = () => {
    api.removeToken();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "nav-glass shadow-lg"
          : "bg-surface/80 backdrop-blur-xl border-b border-edge/50"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={hasMounted && isAuthenticated && isAppPage ? "/dashboard" : "/"}
            className="flex items-center group"
          >
            <ThemeLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) =>
              item.children ? (
                <DesktopDropdown
                  key={item.name}
                  item={item}
                  pathname={pathname}
                />
              ) : (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`nav-link text-sm font-semibold transition-colors ${
                    isGroupActive(item, pathname)
                      ? "text-cyan-600"
                      : "text-body hover:text-cyan-600"
                  }`}
                >
                  {item.name}
                </Link>
              ),
            )}
          </div>

          {/* CTA / User Actions */}
          {showAuth ? (
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="text-sm font-bold text-body hover:text-cyan-600 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 btn-glow"
              >
                Get Started
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/transactions/new"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Transaction
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-body hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 rounded-lg text-muted hover:bg-surface-hover hover:text-heading transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-edge-subtle bg-surface/95 backdrop-blur-xl shadow-lg">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((item) =>
              item.children ? (
                <MobileDropdown
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ) : (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`block py-2.5 text-base font-medium transition-colors ${
                    isGroupActive(item, pathname)
                      ? "text-cyan-600"
                      : "text-heading hover:text-cyan-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ),
            )}
            {showAuth ? (
              <div className="pt-4 mt-4 border-t border-edge-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">Theme</span>
                  <ThemeToggle />
                </div>
                <Link
                  href="/auth/login"
                  className="block py-2 text-base font-medium text-heading hover:text-cyan-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-4 py-2.5 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-edge-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">Theme</span>
                  <ThemeToggle />
                </div>
                <Link
                  href="/transactions/new"
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-4 py-2.5 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Add Transaction
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-heading hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
