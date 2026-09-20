"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "./AuthProvider";
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
  { name: "Agents", href: "#agents" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "For Bookkeepers", href: "#bookkeepers" },
  { name: "Pricing", href: "#pricing" },
];

// Core app links - most important items visible by default
const primaryAppLinks: NavItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  { name: "Contacts", href: "/contacts" },
];

// Secondary app links - grouped under "More"
const secondaryAppLinks: NavItem[] = [
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
  { name: "Accounts", href: "/accounts" },
  { name: "Reconciliation", href: "/reconciliation" },
  { name: "Reports", href: "/reports" },
  { name: "Team & access", href: "/settings/team" },
];

function isGroupActive(item: NavItem, pathname: string): boolean {
  if (item.href) return pathname === item.href || pathname.startsWith(item.href + "/");
  if (item.children)
    return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
  return false;
}

function isAnySecondaryActive(pathname: string): boolean {
  return secondaryAppLinks.some((item) => isGroupActive(item, pathname));
}

// ============================================================================
// DESKTOP DROPDOWN COMPONENT
// ============================================================================

function DesktopDropdown({
  item,
  pathname,
  compact = false,
}: {
  item: NavItem;
  pathname: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={`nav-link inline-flex items-center gap-1 font-semibold transition-colors ${compact ? "px-2 py-1 text-xs" : "text-sm"} ${active ? "text-cyan-600" : "text-body hover:text-cyan-600"} `}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {item.name}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="bg-surface/95 border-edge absolute top-full left-0 z-50 mt-1 w-48 rounded-xl border py-1 shadow-lg backdrop-blur-xl"
          role="menu"
          aria-label={`${item.name} submenu`}
        >
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname === child.href || pathname.startsWith(child.href + "/")
                  ? "bg-cyan-50/50 text-cyan-600"
                  : "text-heading hover:bg-surface-hover hover:text-cyan-600"
              }`}
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MOBILE DROPDOWN COMPONENT
// ============================================================================

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
        type="button"
        className={`flex w-full items-center justify-between py-2.5 text-base font-medium transition-colors ${
          active ? "text-cyan-600" : "text-heading hover:text-cyan-600"
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {item.name}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="space-y-1 pl-4" role="menu" aria-label={`${item.name} submenu`}>
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
              role="menuitem"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MORE MENU COMPONENT (for overflow items)
// ============================================================================

function MoreMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isActive = isAnySecondaryActive(pathname);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={`nav-link inline-flex items-center gap-1 text-sm font-semibold transition-colors ${isActive ? "text-cyan-600" : "text-body hover:text-cyan-600"} `}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        More
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="bg-surface/95 border-edge absolute top-full right-0 z-50 mt-1 max-h-[70vh] w-56 overflow-y-auto rounded-xl border py-2 shadow-lg backdrop-blur-xl"
          role="menu"
          aria-label="More navigation items"
        >
          {secondaryAppLinks.map((item) =>
            item.children ? (
              <div key={item.name} className="border-edge-subtle border-b py-1 last:border-0">
                <div className="text-muted px-4 py-1.5 text-xs font-semibold uppercase">
                  {item.name}
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${
                      pathname === child.href || pathname.startsWith(child.href + "/")
                        ? "bg-cyan-50/50 text-cyan-600"
                        : "text-heading hover:bg-surface-hover hover:text-cyan-600"
                    }`}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href!}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-cyan-50/50 text-cyan-600"
                    : "text-heading hover:bg-surface-hover hover:text-cyan-600"
                }`}
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                {item.name}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

const emptySubscribe = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

// ============================================================================
// MAIN NAVIGATION COMPONENT
// ============================================================================

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasMounted = useSyncExternalStore(emptySubscribe, getMountedClient, getMountedServer);
  const [scrolled, setScrolled] = useState(false);

  // Auth state comes from OIDC context; gate on hasMounted for SSR safety
  const authed = hasMounted && !authLoading && isAuthenticated;

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    pathname.startsWith("/chat");

  // Until client mounts, always show marketing links to match SSR output
  const showAppNav = hasMounted && isAppPage && authed;
  const showAuth = !hasMounted || !isAppPage || !authed;

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-glass shadow-lg" : "bg-surface/80 border-edge/50 border-b backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Fixed width, never shrinks */}
          <div className="flex-shrink-0">
            <Link
              href={hasMounted && authed && isAppPage ? "/dashboard" : "/"}
              className="group flex items-center"
            >
              <ThemeLogo />
            </Link>
          </div>

          {/* Desktop Navigation - Flexible but constrained */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-6">
            {showAppNav ? (
              <>
                {/* Primary links - always visible */}
                <div className="flex items-center gap-1 xl:gap-6">
                  {primaryAppLinks.map((item) =>
                    item.children ? (
                      <DesktopDropdown key={item.name} item={item} pathname={pathname} />
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href!}
                        className={`nav-link rounded-lg px-2 py-1 text-sm font-semibold whitespace-nowrap transition-colors ${
                          isGroupActive(item, pathname)
                            ? "bg-cyan-50/50 text-cyan-600 dark:bg-cyan-950/30"
                            : "text-body hover:bg-surface-hover hover:text-cyan-600"
                        } `}
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>

                {/* Divider */}
                <div className="bg-edge mx-2 h-6 w-px" />

                {/* Secondary links - grouped under "More" on smaller screens */}
                <div className="hidden items-center gap-1 xl:flex">
                  {secondaryAppLinks.slice(0, 3).map((item) =>
                    item.children ? (
                      <DesktopDropdown key={item.name} item={item} pathname={pathname} compact />
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href!}
                        className={`nav-link rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                          isGroupActive(item, pathname)
                            ? "bg-cyan-50/50 text-cyan-600 dark:bg-cyan-950/30"
                            : "text-body hover:bg-surface-hover hover:text-cyan-600"
                        } `}
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>

                {/* More menu for overflow items */}
                <MoreMenu pathname={pathname} />
              </>
            ) : (
              // Marketing links
              marketingLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`nav-link text-sm font-semibold whitespace-nowrap transition-colors ${isGroupActive(item, pathname) ? "text-cyan-600" : "text-body hover:text-cyan-600"} `}
                >
                  {item.name}
                </Link>
              ))
            )}
          </div>

          {/* CTA / User Actions - Fixed width area */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {showAuth ? (
              <div className="hidden items-center gap-3 md:flex">
                <ThemeToggle />
                <Link
                  href="/auth/login"
                  className="text-body text-sm font-bold whitespace-nowrap transition-colors hover:text-cyan-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="group btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-4 py-2 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40"
                >
                  Get Started
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
              <div className="hidden items-center gap-2 lg:flex">
                <ThemeToggle />
                <Link
                  href="/chat"
                  className={`rounded-lg p-2 transition-colors ${
                    pathname.startsWith("/chat")
                      ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50"
                      : "text-muted hover:bg-surface-hover hover:text-cyan-600"
                  } `}
                  aria-label="Chat with Oluto"
                  title="Chat with Oluto"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </Link>
                <Link
                  href="/transactions/new"
                  className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-3 py-2 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40"
                >
                  <svg
                    className="h-4 w-4 transition-transform group-hover:scale-110"
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
                  <span className="hidden xl:inline">Add Transaction</span>
                  <span className="xl:hidden">Add</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-body px-2 text-sm font-bold whitespace-nowrap transition-colors hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="text-muted hover:bg-surface-hover hover:text-heading rounded-lg p-2 transition-colors lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-edge-subtle bg-surface/95 max-h-[70vh] overflow-y-auto border-t shadow-lg backdrop-blur-xl lg:hidden"
          role="menu"
        >
          <div className="space-y-1 px-4 py-4">
            {showAppNav ? (
              <>
                {/* Primary links */}
                {primaryAppLinks.map((item) =>
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
                  )
                )}

                {/* Divider */}
                <div className="border-edge-subtle my-2 border-t" />

                {/* Secondary links */}
                {secondaryAppLinks.map((item) =>
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
                  )
                )}

                {/* Mobile actions */}
                <div className="border-edge-subtle mt-4 space-y-3 border-t pt-4">
                  <Link
                    href="/chat"
                    className={`flex items-center gap-2 py-2.5 text-base font-medium transition-colors ${
                      pathname.startsWith("/chat")
                        ? "text-cyan-600"
                        : "text-heading hover:text-cyan-600"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Chat with Oluto
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link
                    href="/transactions/new"
                    className="block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-4 py-2.5 text-center text-base font-bold text-white shadow-lg transition-all hover:shadow-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Add Transaction
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-heading block w-full py-2 text-left text-base font-medium hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Marketing links */}
                {marketingLinks.map((item) => (
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
                ))}

                {/* Auth links */}
                <div className="border-edge-subtle mt-4 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link
                    href="/auth/login"
                    className="text-heading block py-2 text-base font-medium hover:text-cyan-600"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-4 py-2.5 text-center text-base font-bold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
