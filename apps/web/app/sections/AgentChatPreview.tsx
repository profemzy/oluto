"use client";

import Image from "next/image";

export function AgentChatPreview() {
  return (
    <section id="agents" className="relative pb-24 sm:pb-32 overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute top-10 left-[5%] w-48 h-48 bg-cyan-100 rounded-full opacity-30 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-[5%] w-56 h-56 bg-green-100 rounded-full opacity-30 blur-3xl animate-float" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-sm font-bold text-cyan-600 tracking-wider uppercase animate-pulse-slow">
            See it in action
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-heading sm:text-4xl lg:text-5xl">
            Your CFO briefing, delivered{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              every morning
            </span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-body">
            AI agents on the Oluto desktop and mobile app analyze your finances and brief you in plain English — proactively, every 30 minutes.
          </p>
        </div>

        {/* Two-panel screenshot showcase */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left panel: Daily Briefing screenshot */}
          <div className="dashboard-preview group">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-surface border border-edge text-xs text-muted shadow-sm">
                  <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Oluto Desktop
                </div>
              </div>
            </div>
            {/* Screenshot */}
            <div className="relative aspect-[4/3] bg-surface-secondary">
              <Image
                src="/screenshots/daily-briefing.png"
                alt="Daily Briefing Agent delivering a CFO-level morning summary on the Oluto desktop app"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            {/* Caption */}
            <div className="px-4 py-3 bg-surface border-t border-edge flex items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                Live
              </span>
              <span className="text-sm font-semibold text-heading">Daily Briefing Agent</span>
            </div>
          </div>

          {/* Right panel: Chat Home screenshot */}
          <div className="dashboard-preview group">
            {/* App Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-surface border border-edge text-xs text-muted shadow-sm">
                  <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Oluto Desktop
                </div>
              </div>
            </div>
            {/* Screenshot */}
            <div className="relative aspect-[4/3] bg-surface-secondary">
              <Image
                src="/screenshots/chat-home.png"
                alt="Chat interface with quick action cards for financial queries"
                fill
                className="object-cover object-top"
              />
            </div>
            {/* Caption */}
            <div className="px-4 py-3 bg-surface border-t border-edge flex items-center justify-center gap-2">
              <span className="text-sm font-semibold text-heading">Ask anything about your finances</span>
            </div>
          </div>
        </div>

        {/* Mock conversation */}
        <div className="mt-16 mx-auto max-w-2xl">
          <div className="space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-sm rounded-2xl rounded-br-md bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-5 py-3 text-white shadow-lg shadow-cyan-500/20">
                <p className="text-sm font-medium">Am I profitable this month?</p>
              </div>
            </div>
            {/* Agent response */}
            <div className="flex justify-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="max-w-md rounded-2xl rounded-bl-md bg-surface border border-edge px-5 py-4 shadow-lg">
                <p className="text-sm leading-relaxed text-body">
                  <span className="font-bold text-heading">Yes!</span> Your net profit for February is{" "}
                  <span className="font-bold text-emerald-600">$4,230</span>. Revenue: $18,400. Expenses: $14,170.
                  You&apos;re up <span className="font-bold text-emerald-600">12%</span> compared to January.
                  Your safe-to-spend after tax obligations is{" "}
                  <span className="font-bold text-cyan-600">$6,850</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
