"use client";

import Link from "next/link";

interface Stat {
  value: string;
  label: string;
}

interface HeroSectionProps {
  badge?: string;
  headline: string;
  headlineHighlight: string;
  subheadline: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
  stats: Stat[];
}

const defaultStats: Stat[] = [
  { value: "50K+", label: "Transactions" },
  { value: "5 min", label: "Daily bookkeeping" },
  { value: "100%", label: "CRA compliant" },
];

export function HeroSection({
  badge = "Now available for Canadian small businesses",
  headline = "Your Financial",
  headlineHighlight = "Autopilot",
  subheadline = "Oluto helps Canadian small business owners transition from reactive record-keeping to proactive financial mastery. Voice-enabled, AI-powered, and built for how you actually work.",
  primaryCta = { text: "Start Free Trial", href: "/auth/register" },
  secondaryCta = { text: "Watch Demo", href: "#demo" },
  stats = defaultStats,
}: Partial<HeroSectionProps>) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/40 via-white to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-cyan-100/30 to-emerald-100/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-cyan-700">
              {badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            {headline}{" "}
            <span className="gradient-text">{headlineHighlight}</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl max-w-2xl mx-auto">
            {subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all"
            >
              {primaryCta.text}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {secondaryCta.text}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-x-8 border-t border-gray-200/60 pt-10 max-w-lg mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold gradient-text sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-gray-500 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
