"use client";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    number: "01",
    title: "Connect your accounts",
    description: "Upload bank statements via CSV or PDF. Oluto imports transactions and maps accounts to double-entry structures.",
  },
  {
    number: "02",
    title: "Agents structure drafts",
    description: "Receipt Snap categorizes expenses. The Daily Briefing analyzes cash position. The Bookkeeper maps entries to proper accounts.",
  },
  {
    number: "03",
    title: "Review and approve",
    description: "Agents prepare drafts and flag exceptions. You maintain authorization control before any ledger entries are posted.",
  },
  {
    number: "04",
    title: "Inspect ledger anytime",
    description: "Instruct the assistant in English or French. Generate reports, inspect audit trails, and review Canadian tax balances on demand.",
  },
];

export function HowItWorksSection({
  title = "How it works",
  subtitle = "From statement import to verified double-entry books",
  description = "Oluto provides continuous bookkeeping operations with human approval safeguards. LedgerForge validates balanced debits and credits before committing journal entries.",
  steps = defaultSteps,
}: HowItWorksSectionProps) {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative py-20 sm:py-28 bg-surface border-b border-edge"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold text-[#087E78] dark:text-teal-400 tracking-wider uppercase">
            {title}
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl"
          >
            {subtitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {description}
          </p>
        </header>

        {/* Steps */}
        <div className="relative mx-auto mt-16 sm:mt-20">
          <ol
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Operating steps"
          >
            {steps.map((step) => (
              <li key={step.number}>
                <article className="card-financial p-6 bg-surface-secondary h-full flex flex-col justify-between">
                  <div>
                    {/* Step number badge */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#087E78] text-white text-xs font-bold shadow-xs">
                      {step.number}
                    </div>

                    <h3 className="mt-4 text-base font-bold text-heading">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
