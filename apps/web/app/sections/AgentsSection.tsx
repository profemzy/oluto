"use client";

interface Capability {
  title: string;
  description: string;
  category: string;
  status: "Active" | "Phase 2";
}

const capabilities: Capability[] = [
  {
    title: "Daily Financial Briefing",
    description: "Verified morning cash position, overnight cleared transactions, overdue receivables, and impending bill obligations.",
    category: "Operations",
    status: "Active",
  },
  {
    title: "Assisted Receipt Extraction & Matching",
    description: "Extracts vendor, line items, and GST/HST/QST tax components, staging proposals for user approval before matching to bank transactions.",
    category: "Bookkeeping",
    status: "Active",
  },
  {
    title: "Verifiable Ledger Queries",
    description: "Ask plain-language questions grounded in verified double-entry books, with financial data retrieved directly from the ledger.",
    category: "Intelligence",
    status: "Active",
  },
  {
    title: "CRA Tax Lockbox Modeling",
    description: "Automatically reserves collected GST/HST net of input tax credits (ITCs), ensuring you never spend tax remittance funds.",
    category: "Compliance",
    status: "Active",
  },
  {
    title: "Receivables & Invoice Aging",
    description: "Continuous accounts receivable aging calculations with structured customer payment tracking and automatic reconciliation.",
    category: "Working Capital",
    status: "Active",
  },
  {
    title: "Audit-Grade Double Entry",
    description: "Every financial action produces balanced debit and credit entries with full provenance, timestamps, and actor attributions.",
    category: "Core Engine",
    status: "Active",
  },
];

export function AgentsSection() {
  return (
    <section id="agents" className="py-20 bg-surface-secondary border-b border-edge">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[#087E78]">
            Platform Architecture
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-heading">
            Accounting Workflows & Financial Engine
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Engineered around Canadian corporate tax guidelines and standard accounting principles.
            Double-entry operations with strict human review gates and deterministic audit trails.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="card-financial p-6 bg-surface hover:border-[#087E78]/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">
                    {cap.category}
                  </span>
                  <span className="status-badge status-badge-positive text-[10px]">
                    {cap.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-heading">
                  {cap.title}
                </h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-edge-subtle flex items-center justify-between text-[11px] text-[#087E78] font-semibold">
                <span>Operational Capability</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AgentsSection;
