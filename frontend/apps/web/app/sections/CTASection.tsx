"use client";

import Link from "next/link";

interface CTASectionProps {
  title: string;
  titleHighlight: string;
  description: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
  disclaimer?: string;
}

export function CTASection({
  title = "Ready to direct your",
  titleHighlight = "wealth?",
  description = "Join Canadian small business owners who are replacing bookkeeping anxiety with financial clarity. Start your free 14-day trial today.",
  primaryCta = { text: "Start Free Trial", href: "/auth/register" },
  secondaryCta = { text: "Schedule a Demo", href: "/demo" },
  disclaimer = "No credit card required. Cancel anytime.",
}: Partial<CTASectionProps>) {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-emerald-50" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}{" "}
            <span className="gradient-text">{titleHighlight}</span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            {description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
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
              {secondaryCta.text}
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            {disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
