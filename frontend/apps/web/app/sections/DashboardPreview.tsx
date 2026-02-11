"use client";

interface InboxItem {
  icon: string;
  text: string;
  status: string;
}

interface DashboardPreviewProps {
  safeToSpendAmount?: string;
  safeToSpendChange?: string;
  gstHstAmount?: string;
  incomeTaxAmount?: string;
  totalSetAside?: string;
  inboxItems?: InboxItem[];
}

const defaultInboxItems: InboxItem[] = [
  { icon: "🧾", text: "Missing receipt: $234.50", status: "Needs attention" },
  { icon: "❓", text: "Uncategorized: Office Depot", status: "Low confidence" },
  { icon: "🔄", text: "Possible transfer match", status: "Review" },
];

export function DashboardPreview({
  safeToSpendAmount = "$24,850",
  safeToSpendChange = "+12.5% this month",
  gstHstAmount = "$3,240",
  incomeTaxAmount = "$5,800",
  totalSetAside = "$9,040",
  inboxItems = defaultInboxItems,
}: DashboardPreviewProps) {
  return (
    <section className="relative pb-24 sm:pb-32 overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute top-10 left-[5%] w-48 h-48 bg-cyan-100 rounded-full opacity-30 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-[5%] w-56 h-56 bg-green-100 rounded-full opacity-30 blur-3xl animate-float" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* Dashboard Preview Card with enhanced styling */}
        <div className="dashboard-preview group">
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400 hover:scale-110 transition-transform cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-amber-400 hover:scale-110 transition-transform cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-green-400 hover:scale-110 transition-transform cursor-pointer" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 shadow-sm">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                app.oluto.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50/80 to-white">
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Safe-to-Spend Card */}
              <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300 group/card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-500">Safe to Spend</span>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm animate-pulse-slow">
                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent">
                  {safeToSpendAmount}
                </div>
                <div className="mt-1 text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {safeToSpendChange}
                </div>
                {/* Animated mini chart */}
                <div className="mt-4 flex items-end gap-1 h-10">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-cyan-400 to-emerald-400 hover:from-cyan-500 hover:to-emerald-500 transition-colors"
                      style={{ 
                        height: `${h}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* CRA Lockbox Card */}
              <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-500">CRA Lockbox</span>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Q1 2026</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-500">GST/HST</span>
                      <span className="text-sm font-bold text-gray-900">{gstHstAmount}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-500">Income Tax Est.</span>
                      <span className="text-sm font-bold text-gray-900">{incomeTaxAmount}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Set Aside</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    {totalSetAside}
                  </span>
                </div>
              </div>

              {/* Exceptions Inbox Card */}
              <div className="rounded-xl bg-white p-5 border border-gray-100 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-500">Exceptions Inbox</span>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                    {inboxItems.length} items
                  </span>
                </div>
                <div className="space-y-2">
                  {inboxItems.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all cursor-pointer group/item"
                    >
                      <span className="text-lg mt-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 leading-tight">{item.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.status}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover/item:text-cyan-400 transition-colors opacity-0 group-hover/item:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
