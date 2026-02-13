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
  { value: "5 min", label: "Daily bookkeeping" },
  { value: "100%", label: "CRA ready" },
  { value: "Zero", label: "Accounting jargon" },
];

export function HeroSection({
  badge = "Built for Canadian small businesses",
  headline = "Run Your Business,",
  headlineHighlight = "Not Your Books",
  subheadline = "We handle the bookkeeping, track your cash flow, and keep you tax-ready — so you can focus on what actually makes you money.",
  primaryCta = { text: "Start Free Trial", href: "/auth/register" },
  secondaryCta = { text: "Watch Demo", href: "#demo" },
  stats = defaultStats,
}: Partial<HeroSectionProps>) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 via-white to-emerald-50/30" />
      
      {/* Floating Background Orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-cyan-200 rounded-full opacity-40 blur-3xl animate-float-slow" />
      <div className="absolute top-40 right-[15%] w-96 h-96 bg-green-200 rounded-full opacity-35 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-[30%] w-56 h-56 bg-teal-200 rounded-full opacity-30 blur-2xl animate-float-reverse" />
      <div className="absolute top-1/2 right-[5%] w-40 h-40 bg-cyan-300 rounded-full opacity-25 blur-2xl animate-float-fast" />
      
      {/* Small Bouncing Decorative Circles */}
      <div className="absolute top-32 left-[20%] w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full animate-bounce-subtle shadow-lg shadow-cyan-500/30" />
      <div className="absolute top-48 right-[25%] w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-bounce-gentle shadow-lg shadow-green-500/30" />
      <div className="absolute bottom-40 left-[15%] w-5 h-5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full animate-bounce-subtle shadow-lg shadow-teal-500/30" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-[10%] w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-bounce-gentle shadow-lg" style={{ animationDelay: '1s' }} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge with glow effect */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full badge-gradient px-5 py-2.5 shadow-lg shadow-cyan-500/10 animate-bounce-subtle">
            <svg className="w-4 h-4 text-cyan-600 hover-icon-scale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              {badge}
            </span>
          </div>

          {/* Headline with animated underline */}
          <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl lg:text-8xl leading-tight">
            {headline}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                {headlineHighlight}
              </span>
              {/* Animated Gradient Underline */}
              <svg 
                className="absolute -bottom-2 left-0 w-full opacity-90 animate-pulse-slow" 
                height="12" 
                viewBox="0 0 300 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 10C50 5 100 2 150 3C200 4 250 7 298 10" 
                  stroke="url(#gradientUnderline)" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  className="animate-pulse-glow"
                />
                <defs>
                  <linearGradient id="gradientUnderline" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4"/>
                    <stop offset="50%" stopColor="#14b8a6"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheadline with animated highlight */}
          <p className="mt-8 text-lg leading-relaxed text-gray-600 sm:text-xl max-w-3xl mx-auto font-medium">
            {subheadline}
          </p>

          {/* CTA Buttons with enhanced hover effects */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href={primaryCta.href}
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden btn-glow"
            >
              <span className="relative z-10">{primaryCta.text}</span>
              <svg 
                className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href={secondaryCta.href}
              className="group inline-flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-bold text-gray-700 shadow-lg hover:bg-white hover:border-cyan-300 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
            >
              <svg 
                className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {secondaryCta.text}
            </Link>
          </div>

          {/* Stats with hover scale animation */}
          <div className="mt-20 grid grid-cols-3 gap-x-10 border-t-2 border-gray-200/80 pt-12 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center group stat-card cursor-default"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent sm:text-4xl transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs text-gray-600 font-semibold sm:text-sm uppercase tracking-wide group-hover:text-cyan-600 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
