"use client";

interface Agent {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  live: boolean;
  timeline?: string;
}

const agents: Agent[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    title: "Daily Briefing",
    description: "Your CFO-level morning summary. Cash position, overnight transactions, overdue invoices, and action items — delivered before your first coffee.",
    color: "bg-cyan-50 dark:bg-cyan-950 text-cyan-600 ring-cyan-500/20",
    live: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    title: "Receipt Snap",
    description: "Snap a photo, done. AI extracts vendor, amount, tax breakdown, and auto-categorizes. Matched to your bank transaction in seconds.",
    color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 ring-emerald-500/20",
    live: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: "Conversational Bookkeeper",
    description: "Ask anything in plain English. \"Am I profitable?\" \"Who owes me money?\" \"Can I afford a $2,000 laptop?\" Real answers from your actual books.",
    color: "bg-purple-50 dark:bg-purple-950 text-purple-600 ring-purple-500/20",
    live: true,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "Cash Flow Predictor",
    description: "30/60/90-day cash projections with scenario modeling. Know about shortfalls weeks before they hit.",
    color: "bg-teal-50 dark:bg-teal-950 text-teal-600 ring-teal-500/20",
    live: false,
    timeline: "Q3 2026",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Invoice Follow-Up",
    description: "Autonomous AR management. Tracks overdue invoices and escalates from gentle reminder to final notice.",
    color: "bg-amber-50 dark:bg-amber-950 text-amber-600 ring-amber-500/20",
    live: false,
    timeline: "Q3 2026",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Tax Season Prep",
    description: "Perpetual CRA readiness. Categorization audits, receipt coverage tracking, and deadline reminders all year long.",
    color: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 ring-indigo-500/20",
    live: false,
    timeline: "Q3 2026",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Smart Notifications",
    description: "Context-aware alerts that replace generic banking notifications with actionable, enriched insights.",
    color: "bg-rose-50 dark:bg-rose-950 text-rose-600 ring-rose-500/20",
    live: false,
    timeline: "Q4 2026",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: "Vendor Intelligence",
    description: "Spending pattern analysis. Detects price increases, suggests consolidation, and tracks vendor performance.",
    color: "bg-orange-50 dark:bg-orange-950 text-orange-600 ring-orange-500/20",
    live: false,
    timeline: "Q4 2026",
  },
];

export function AgentsSection() {
  const liveAgents = agents.filter((a) => a.live);
  const comingAgents = agents.filter((a) => !a.live);

  return (
    <section className="relative py-24 sm:py-32 bg-surface overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute top-20 right-[5%] w-64 h-64 bg-cyan-100 rounded-full opacity-30 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-[5%] w-48 h-48 bg-green-100 rounded-full opacity-30 blur-3xl animate-float" />

      {/* Decorative bouncing dots */}
      <div className="absolute top-40 left-[8%] w-3 h-3 bg-cyan-400 rounded-full animate-bounce-subtle shadow-md" />
      <div className="absolute bottom-40 right-[10%] w-2 h-2 bg-green-400 rounded-full animate-bounce-gentle shadow-md" style={{ animationDelay: "0.7s" }} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-cyan-600 tracking-wider uppercase animate-pulse-slow">
            Your AI team
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-heading sm:text-4xl lg:text-5xl">
            8 agents. One mission:{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              your money, handled.
            </span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-body">
            Three agents are live today on the Oluto desktop and mobile app. Five more ship this year. Each one handles a specific part of your financial operations — autonomously.
          </p>
        </div>

        {/* Live agents — larger cards */}
        <div className="mx-auto mt-16 sm:mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {liveAgents.map((agent, i) => (
            <div
              key={i}
              className="feature-card group cursor-pointer relative"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Live badge */}
              <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                Live
              </span>

              {/* Icon */}
              <div className={`inline-flex rounded-xl p-3 ring-1 ring-inset ${agent.color} feature-icon shadow-sm`}>
                {agent.icon}
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-bold text-heading group-hover:text-cyan-700 transition-colors">
                {agent.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-6 text-body">
                {agent.description}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 mb-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-edge to-transparent" />
          <span className="text-sm font-bold text-muted uppercase tracking-wider">Coming soon</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-edge to-transparent" />
        </div>

        {/* Coming soon agents — smaller cards, muted */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {comingAgents.map((agent, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-edge-subtle bg-surface p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 opacity-80 hover:opacity-100"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Timeline badge */}
              {agent.timeline && (
                <span className="absolute top-4 right-4 text-xs font-medium text-caption bg-surface-tertiary px-2.5 py-1 rounded-full">
                  {agent.timeline}
                </span>
              )}

              {/* Icon */}
              <div className={`inline-flex rounded-lg p-2.5 ring-1 ring-inset ${agent.color} shadow-sm`}>
                {agent.icon}
              </div>

              {/* Title */}
              <h3 className="mt-4 text-base font-bold text-heading group-hover:text-cyan-700 transition-colors">
                {agent.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-6 text-body">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
