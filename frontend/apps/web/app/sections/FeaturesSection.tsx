"use client";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  gradient: string;
}

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Voice-to-Ledger",
    description: "Capture expenses hands-free while on the job. Just tap and speak — AI handles the rest.",
    color: "bg-cyan-50 text-cyan-600 ring-cyan-500/20",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Safe-to-Spend Dashboard",
    description: "Know exactly what you can spend in 5 seconds. Real-time cashflow minus taxes and obligations.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Email-to-Inbox",
    description: "Forward statements and receipts to your Oluto address. AI extracts, categorizes, and flags exceptions.",
    color: "bg-purple-50 text-purple-600 ring-purple-500/20",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "AI Categorization",
    description: "Smart categorization with confidence scores. Low-confidence items route to your daily inbox.",
    color: "bg-amber-50 text-amber-600 ring-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Peer Compass",
    description: "Compare spending against anonymized benchmarks from similar businesses in your province.",
    color: "bg-cyan-50 text-cyan-600 ring-cyan-500/20",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "Cash Flow Horizon",
    description: "Predict cash dips before they happen. 30-day alerts on mobile, 90-day forecasting on desktop.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
    gradient: "from-teal-500 to-emerald-500",
  },
];

export function FeaturesSection({
  title = "Features",
  subtitle = "Everything you need to master your finances",
  description = "Built specifically for Canadian small business owners who want clarity without the complexity of traditional accounting software.",
  features = defaultFeatures,
}: FeaturesSectionProps) {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-white overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute top-20 right-[5%] w-64 h-64 bg-cyan-100 rounded-full opacity-30 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-[5%] w-48 h-48 bg-green-100 rounded-full opacity-30 blur-3xl animate-float" />
      
      {/* Decorative bouncing dots */}
      <div className="absolute top-40 left-[8%] w-3 h-3 bg-cyan-400 rounded-full animate-bounce-subtle shadow-md" />
      <div className="absolute bottom-40 right-[10%] w-2 h-2 bg-green-400 rounded-full animate-bounce-gentle shadow-md" style={{ animationDelay: '0.7s' }} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header with animated text */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-cyan-600 tracking-wider uppercase animate-pulse-slow">
            {title}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {subtitle}
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            {description}
          </p>
        </div>

        {/* Features Grid with enhanced cards */}
        <div className="mx-auto mt-16 sm:mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card group cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Icon with gradient background */}
              <div className={`inline-flex rounded-xl p-3 ring-1 ring-inset ${feature.color} feature-icon shadow-sm`}>
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="mt-5 text-lg font-bold text-gray-900 group-hover:text-cyan-700 transition-colors">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
              
              {/* Hover indicator */}
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Learn more</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
