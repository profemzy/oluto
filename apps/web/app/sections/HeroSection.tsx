"use client";

import Link from "next/link";

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "Double-Entry", label: "LedgerForge core accounting engine" },
  { value: "GST · HST · PST", label: "Canadian federal & provincial tax locks" },
  { value: "Audit-Ready", label: "Tamper-evident transaction logs" },
];

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-edge bg-surface"
    >
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center">
        {/* Subtle pill tag */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-edge bg-surface-tertiary px-3.5 py-1 text-xs font-semibold text-muted">
          <span className="h-2 w-2 rounded-full bg-[#087E78]" />
          <span>Canadian Financial Operating System</span>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-4xl sm:text-6xl font-bold tracking-tight text-heading leading-[1.15]"
        >
          Double-Entry Accounting & Financial Operating System for Canadian Business.
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base sm:text-lg text-muted max-w-3xl mx-auto leading-relaxed">
          Oluto unifies your Canadian bank feeds, matches receipts, models GST/HST liabilities,
          and delivers executive cashflow briefings with immutable ledger precision.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="btn-primary w-full sm:w-auto text-sm py-2.5 px-6"
          >
            Start Free Trial
          </Link>
          <Link
            href="#how-it-works"
            className="btn-secondary w-full sm:w-auto text-sm py-2.5 px-6"
          >
            How It Works &rarr;
          </Link>
        </div>

        {/* Core Institutional Metrics */}
        <div className="mt-14 pt-10 border-t border-edge-subtle grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {stats.map((stat) => (
            <div key={stat.value} className="card-financial p-4 bg-surface-secondary">
              <p className="text-sm font-bold text-heading font-tabular">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
