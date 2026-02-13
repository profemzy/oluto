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
  title = "Ready to spend less time on",
  titleHighlight = "paperwork?",
  description = "Start your free trial and get back to the work that matters. Invite your accountant when you're ready — they'll love what they find.",
  primaryCta = { text: "Start Free Trial", href: "/auth/register" },
  secondaryCta = { text: "Schedule a Demo", href: "/demo" },
  disclaimer = "No credit card required. Cancel anytime.",
}: Partial<CTASectionProps>) {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-white to-emerald-50/80" />
      
      {/* Floating decorative orbs */}
      <div className="absolute top-20 left-[10%] w-64 h-64 bg-cyan-200 rounded-full opacity-25 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-[10%] w-72 h-72 bg-green-200 rounded-full opacity-25 blur-3xl animate-float" />
      <div className="absolute top-1/2 left-[5%] w-40 h-40 bg-teal-200 rounded-full opacity-20 blur-2xl animate-float-reverse" />
      
      {/* Bouncing decorative dots */}
      <div className="absolute top-32 right-[20%] w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full animate-bounce-subtle shadow-lg shadow-cyan-500/30" />
      <div className="absolute bottom-32 left-[18%] w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-bounce-gentle shadow-lg shadow-green-500/30" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-[8%] w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-bounce-subtle" style={{ animationDelay: '1s' }} />

      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
      
      {/* Bottom gradient line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-cyan-200 px-4 py-2 shadow-lg shadow-cyan-500/10">
            <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold text-cyan-700">Free 14-day trial</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            {title}{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              {titleHighlight}
            </span>
          </h2>
          
          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={primaryCta.href}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden btn-glow"
            >
              <span className="relative z-10">{primaryCta.text}</span>
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href={secondaryCta.href}
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-bold text-gray-700 shadow-lg hover:bg-white hover:border-cyan-300 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {secondaryCta.text}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>CRA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Loved by Users</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-gray-400">
            {disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
