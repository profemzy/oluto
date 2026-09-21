"use client";

import Link from "next/link";

const trustIndicators = [
  { label: "LedgerForge Double-Entry Engine" },
  { label: "Strict Multi-Tenant Isolation" },
  { label: "Canadian CRA Tax Compliance" },
];

export function CTASection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="py-16 sm:py-20 bg-surface border-t border-edge"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight text-heading"
        >
          Deploy Your Canadian Financial Operating System.
        </h2>

        <p className="mt-4 text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
          Join Canadian business owners and bookkeepers managing accounts with verifiable double-entry accuracy, automated receipt reconciliation, and real-time cashflow intelligence.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="btn-primary w-full sm:w-auto text-sm py-2.5 px-6"
          >
            Create Business Account
          </Link>
          <Link
            href="/auth/login"
            className="btn-secondary w-full sm:w-auto text-sm py-2.5 px-6"
          >
            Sign In &rarr;
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted font-medium">
          {trustIndicators.map((indicator) => (
            <div key={indicator.label} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#177245]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{indicator.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CTASection;
