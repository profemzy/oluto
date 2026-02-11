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
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/5 overflow-hidden">
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-400">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                app.oluto.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 sm:p-6 bg-gray-50/50">
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Safe-to-Spend */}
              <div className="rounded-lg bg-white p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Safe to Spend</span>
                  <span className="inline-flex items-center rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-600/20">Live</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{safeToSpendAmount}</div>
                <div className="mt-1 text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {safeToSpendChange}
                </div>
                <div className="mt-4 flex items-end gap-0.5 h-12">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-cyan-400 to-emerald-400"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* CRA Lockbox */}
              <div className="rounded-lg bg-white p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">CRA Lockbox</span>
                  <span className="text-xs text-gray-400">Q1 2026</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">GST/HST</span>
                      <span className="text-sm font-semibold text-gray-900">{gstHstAmount}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Income Tax Est.</span>
                      <span className="text-sm font-semibold text-gray-900">{incomeTaxAmount}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Set Aside</span>
                  <span className="text-lg font-bold gradient-text">{totalSetAside}</span>
                </div>
              </div>

              {/* Exceptions Inbox */}
              <div className="rounded-lg bg-white p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Exceptions Inbox</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{inboxItems.length} items</span>
                </div>
                <div className="space-y-2">
                  {inboxItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-md bg-gray-50 hover:bg-cyan-50/50 transition-colors cursor-pointer">
                      <span className="text-sm mt-0.5">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 leading-tight">{item.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.status}</p>
                      </div>
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
