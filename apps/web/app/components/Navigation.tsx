"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/app/lib/api";

interface NavLink {
  name: string;
  href: string;
}

const marketingLinks: NavLink[] = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "For Bookkeepers", href: "#bookkeepers" },
  { name: "Pricing", href: "#pricing" },
];

const appLinks: NavLink[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  { name: "Contacts", href: "/contacts" },
  { name: "Accounts", href: "/accounts" },
  { name: "Reports", href: "/reports" },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated());
    
    // Track scroll for nav styling
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isAppPage = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/bills") ||
    pathname.startsWith("/payments");

  const navLinks = isAppPage && isAuthenticated ? appLinks : marketingLinks;
  const showAuth = !isAppPage || !isAuthenticated;

  const handleLogout = () => {
    api.removeToken();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "nav-glass shadow-lg" 
        : "bg-white/80 backdrop-blur-xl border-b border-gray-200/50"
    }`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with hover effect */}
          <Link 
            href={isAuthenticated && isAppPage ? "/dashboard" : "/"} 
            className="flex items-center group"
          >
            <Image
              src="/logo.png"
              alt="Oluto"
              width={180}
              height={56}
              className="h-12 w-auto group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`nav-link text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? "text-cyan-600"
                    : "text-gray-600 hover:text-cyan-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA / User Actions */}
          {showAuth ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-bold text-gray-600 hover:text-cyan-600 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 btn-glow"
              >
                Get Started
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/transactions/new"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Transaction
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl shadow-lg">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block py-2.5 text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "text-cyan-600"
                    : "text-gray-700 hover:text-cyan-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {showAuth ? (
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                <Link href="/auth/login" className="block py-2 text-base font-medium text-gray-700 hover:text-cyan-600">
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
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
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
                  className="block w-full text-left py-2 text-base font-medium text-gray-700 hover:text-red-600"
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
