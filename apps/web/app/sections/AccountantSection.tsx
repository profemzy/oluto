"use client";

interface ProFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const proFeatures: ProFeature[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
      </svg>
    ),
    title: "Full Double-Entry Accounting",
    description: "Professional chart of accounts with parent-child hierarchies and standard account types.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Trial Balance, P&L, Balance Sheet",
    description: "Generate standard financial statements instantly. Filter by date range and export as needed.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: "Bank Reconciliation",
    description: "Auto-matching algorithm links bank transactions to payments. Confirm, reject, or bulk-reconcile.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Invoices, Bills & Payments",
    description: "Full AP/AR workflow with payment tracking, aging reports, and automatic status management.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: "CSV Import & Export",
    description: "Bulk import bank statements and chart of accounts. Export accountant-ready data anytime.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Multi-User Roles",
    description: "Owner, Accountant, and Viewer roles with appropriate access levels for your whole team.",
  },
];

export function AccountantSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-[8%] w-56 h-56 bg-indigo-100 rounded-full opacity-25 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-[8%] w-48 h-48 bg-cyan-100 rounded-full opacity-25 blur-3xl animate-float" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-indigo-600 tracking-wider uppercase animate-pulse-slow">
            For the pros
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Your accountant will{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              thank you
            </span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Behind the simple interface is a full double-entry accounting engine
            your bookkeeper already knows how to use.
          </p>
        </div>

        {/* Pro features grid */}
        <div className="mx-auto mt-16 sm:mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {proFeatures.map((feature, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 ring-1 ring-inset ring-indigo-500/20 group-hover:bg-indigo-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust callout */}
        <div className="mt-16 mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-6 py-4 shadow-sm">
            <svg className="w-6 h-6 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-sm text-gray-700">
              <span className="font-bold">Built on proper accounting principles</span>{" "}
              — every debit has a credit, every dollar is accounted for, and your books are always balanced.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
