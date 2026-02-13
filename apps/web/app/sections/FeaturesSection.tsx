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
    title: "Snap a Receipt, We Do the Rest",
    description: "Speak or snap — expenses are captured instantly while you're on the go. No data entry, no end-of-month panic.",
    color: "bg-cyan-50 text-cyan-600 ring-cyan-500/20",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Know What You Can Actually Spend",
    description: "See your real available cash in seconds — after taxes, bills, and obligations are set aside. No surprises.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Never Miss a Tax Deadline",
    description: "GST/HST and income tax are estimated in real time. Province-aware alerts tell you what's due and when.",
    color: "bg-purple-50 text-purple-600 ring-purple-500/20",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "Expenses Sort Themselves",
    description: "AI categorizes every transaction automatically. You only review the handful it's unsure about — takes 5 minutes a day.",
    color: "bg-amber-50 text-amber-600 ring-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "See Trouble Before It Hits",
    description: "Cash flow forecasting spots shortfalls weeks ahead, so you can act before they become problems.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Reports Ready When You Need Them",
    description: "Profit & loss, balance sheets, and tax summaries generated instantly. Share with your accountant in one click.",
    color: "bg-cyan-50 text-cyan-600 ring-cyan-500/20",
    gradient: "from-cyan-500 to-teal-500",
  },
];

export function FeaturesSection({
  title = "What you get",
  subtitle = "Less paperwork, more clarity",
  description = "Every feature is designed around one question: how do we save you time and give you confidence in your numbers?",
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
