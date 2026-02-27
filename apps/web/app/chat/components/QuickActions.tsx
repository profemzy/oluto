"use client";

export interface QuickAction {
  label: string;
  prompt: string;
  category: "insights" | "money-out" | "money-in" | "growth";
  needsFile?: boolean;
}

export const QUICK_ACTIONS: QuickAction[] = [
  // Insights (cyan)
  { label: "Daily Briefing", prompt: "Give me today's daily briefing", category: "insights" },
  { label: "Cash Position", prompt: "What is my current cash position?", category: "insights" },
  { label: "Overdue Invoices", prompt: "Show me overdue invoices", category: "insights" },
  { label: "Expense Summary", prompt: "Summarize my recent expenses", category: "insights" },
  // Money Out (amber)
  { label: "Upload Receipt", prompt: "I'd like to upload a receipt", category: "money-out", needsFile: true },
  { label: "Log Expense", prompt: "Help me log an expense", category: "money-out" },
  { label: "Import Statement", prompt: "I want to import a bank statement", category: "money-out", needsFile: true },
  // Money In (emerald)
  { label: "Record Income", prompt: "Record income for my business", category: "money-in" },
  { label: "Create Invoice", prompt: "Create an invoice for a customer", category: "money-in" },
  // Growth (violet)
  { label: "P&L Report", prompt: "Generate a profit and loss report", category: "growth" },
  { label: "Tax Summary", prompt: "Show me my tax summary for CRA", category: "growth" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "insights": "from-cyan-500 to-teal-500 hover:shadow-cyan-500/30",
  "money-out": "from-amber-500 to-orange-500 hover:shadow-amber-500/30",
  "money-in": "from-emerald-500 to-green-500 hover:shadow-emerald-500/30",
  "growth": "from-violet-500 to-purple-500 hover:shadow-violet-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  "insights": "Insights",
  "money-out": "Money Out",
  "money-in": "Money In",
  "growth": "Growth",
};

interface QuickActionsProps {
  variant: "welcome" | "compact";
  onSelect: (action: QuickAction) => void;
}

export function QuickActions({ variant, onSelect }: QuickActionsProps) {
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2 p-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onSelect(action)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${CATEGORY_COLORS[action.category]} shadow-sm hover:shadow-md transition-all`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  const categories = ["insights", "money-out", "money-in", "growth"] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {categories.map((cat) => {
        const actions = QUICK_ACTIONS.filter((a) => a.category === cat);
        return (
          <div key={cat}>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{CATEGORY_LABELS[cat]}</h3>
            <div className="space-y-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => onSelect(action)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-surface border border-edge-subtle hover:border-cyan-400 hover:shadow-md transition-all group"
                >
                  <span className="text-sm font-medium text-heading group-hover:text-cyan-600 transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
