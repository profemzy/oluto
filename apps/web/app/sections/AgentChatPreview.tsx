"use client";

import Image from "next/image";

export function AgentChatPreview() {
  return (
    <section
      id="agents-preview"
      aria-labelledby="preview-heading"
      className="relative py-20 sm:py-28 border-b border-edge bg-surface-secondary overflow-hidden"
    >
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header */}
        <header className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-xs font-bold text-[#087E78] dark:text-teal-400 tracking-wider uppercase">
            Continuous Financial Intelligence
          </p>
          <h2
            id="preview-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl"
          >
            Your financial briefing, delivered every morning
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Oluto monitors continuous bank feeds and generates daily executive financial briefings, highlighting cash runway, upcoming bills, and items requiring attention.
          </p>
        </header>

        {/* Two-panel screenshot showcase */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left panel: Daily Briefing screenshot */}
          <figure className="card-financial overflow-hidden bg-surface group">
            {/* App Chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 bg-surface-secondary border-b border-edge"
              aria-hidden="true"
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-edge" />
                <div className="w-2.5 h-2.5 rounded-full bg-edge" />
                <div className="w-2.5 h-2.5 rounded-full bg-edge" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface border border-edge text-xs font-medium text-muted">
                  Daily Briefing
                </div>
              </div>
            </div>
            {/* Screenshot */}
            <div className="relative aspect-[4/3] bg-surface-secondary">
              <Image
                src="/screenshots/daily-briefing.png"
                alt="Daily Briefing delivering an executive financial summary on Oluto"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Caption */}
            <figcaption className="px-4 py-3 bg-surface border-t border-edge flex items-center justify-between text-xs text-muted">
              <span className="font-semibold text-heading">Automated Morning Briefing</span>
              <span className="font-mono text-[11px]">08:00 AM EST</span>
            </figcaption>
          </figure>

          {/* Right panel: Chat Home screenshot */}
          <figure className="card-financial overflow-hidden bg-surface group">
            {/* App Chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 bg-surface-secondary border-b border-edge"
              aria-hidden="true"
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-edge" />
                <div className="w-2.5 h-2.5 rounded-full bg-edge" />
                <div className="w-2.5 h-2.5 rounded-full bg-edge" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface border border-edge text-xs font-medium text-muted">
                  Agent Operations
                </div>
              </div>
            </div>
            {/* Screenshot */}
            <div className="relative aspect-[4/3] bg-surface-secondary">
              <Image
                src="/screenshots/chat-home.png"
                alt="Agent operations interface with task-oriented quick actions"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Caption */}
            <figcaption className="px-4 py-3 bg-surface border-t border-edge flex items-center justify-between text-xs text-muted">
              <span className="font-semibold text-heading">Double-Entry Conversational Runtime</span>
              <span className="font-mono text-[11px]">LedgerForge Core</span>
            </figcaption>
          </figure>
        </div>

        {/* Mock conversation */}
        <aside
          className="mt-12 mx-auto max-w-2xl"
          aria-label="Example conversation with Oluto AI"
        >
          <div className="space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-sm rounded-xl bg-[#087E78] dark:bg-teal-700 px-4 py-2.5 text-white shadow-xs">
                <p className="text-xs font-semibold">What is our net position and CRA tax liability this month?</p>
              </div>
            </div>
            {/* Agent response */}
            <div className="flex justify-start gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface border border-edge flex items-center justify-center font-bold text-xs text-[#087E78]"
                aria-hidden="true"
              >
                O
              </div>
              <div className="max-w-md card-financial p-4 bg-surface shadow-xs">
                <p className="text-xs leading-relaxed text-body">
                  <span className="font-bold text-heading">Net Profit: </span>
                  <span className="font-bold font-tabular text-[#177245] dark:text-[#34d399]">$4,230.00 CAD</span>.
                  Revenue: $18,400.00 CAD, Operating Expenses: $14,170.00 CAD.
                  Estimated CRA net tax liability (GST/HST collected minus ITCs):{" "}
                  <span className="font-bold font-tabular text-heading">$1,120.00 CAD</span>.
                  Verified against LedgerForge balanced journals.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AgentChatPreview;
