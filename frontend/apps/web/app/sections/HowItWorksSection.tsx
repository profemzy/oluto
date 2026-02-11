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
    title: "Connect your business",
    description: "Upload bank statements via CSV/PDF or forward them via email. AI extracts transactions with integrity checks.",
  },
  {
    number: "02",
    title: "AI processes everything",
    description: "Transactions are auto-categorized with confidence scores. Duplicates detected. Balances validated.",
  },
  {
    number: "03",
    title: "Clear your inbox",
    description: "Spend 5 minutes daily confirming low-confidence items and attaching receipts. Everything else is handled.",
  },
  {
    number: "04",
    title: "Know your numbers",
    description: "Check your Safe-to-Spend anytime. Get province-aware tax alerts. Export accountant-ready reports.",
  },
];

export function HowItWorksSection({
  title = "How it works",
  subtitle = "Bookkeeping in 5 minutes a day",
  description = "No more drowning in receipts or spending weekends on admin. Oluto's AI does the heavy lifting so you can focus on your business.",
  steps = defaultSteps,
}: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-cyan-600 tracking-wide uppercase">{title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {subtitle}
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            {description}
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-16 sm:mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative rounded-xl bg-white border border-gray-200 p-6">
              <span className="absolute top-5 right-5 text-5xl font-bold text-gray-100 select-none leading-none">
                {step.number}
              </span>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-sm font-bold">
                  {step.number}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
