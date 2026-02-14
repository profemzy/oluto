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
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-gradient-to-b from-surface-secondary to-surface overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute top-32 left-[3%] w-56 h-56 bg-cyan-100 rounded-full opacity-40 blur-3xl animate-float" />
      <div className="absolute bottom-32 right-[3%] w-64 h-64 bg-teal-100 rounded-full opacity-35 blur-3xl animate-float-slow" />
      
      {/* Decorative bouncing elements */}
      <div className="absolute top-20 right-[15%] w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full animate-bounce-subtle shadow-lg" />
      <div className="absolute bottom-28 left-[12%] w-3 h-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full animate-bounce-gentle shadow-lg" style={{ animationDelay: '0.5s' }} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-cyan-600 tracking-wider uppercase animate-pulse-slow">
            {title}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-heading sm:text-4xl lg:text-5xl">
            {subtitle}
          </h2>
          <p className="mt-4 text-lg leading-8 text-body">
            {description}
          </p>
        </div>

        {/* Steps with connector line on desktop */}
        <div className="relative mx-auto mt-16 sm:mt-20">
          {/* Connector line (visible on lg screens) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-cyan-200 via-teal-200 to-green-200" />
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className="step-card group relative"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Background number watermark */}
                <span className="absolute top-4 right-4 text-6xl font-black text-gray-100 dark:text-slate-800 select-none leading-none group-hover:text-cyan-50 transition-colors">
                  {step.number}
                </span>
                
                <div className="relative">
                  {/* Step number badge */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 group-hover:scale-110 transition-all duration-300">
                    {step.number}
                  </div>
                  
                  {/* Connector dot (visible on lg screens) */}
                  <div className="hidden lg:block absolute top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ top: '-2.5rem' }} />
                  
                  <h3 className="mt-5 text-lg font-bold text-heading group-hover:text-cyan-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-body">
                    {step.description}
                  </p>
                </div>
                
                {/* Hover gradient border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
