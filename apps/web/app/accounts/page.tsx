"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Account } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "Asset", label: "Assets" },
  { value: "Liability", label: "Liabilities" },
  { value: "Equity", label: "Equity" },
  { value: "Revenue", label: "Revenue" },
  { value: "Expense", label: "Expenses" },
];

const TYPE_COLORS: Record<string, string> = {
  Asset: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Liability: "bg-red-50 text-red-700 ring-red-200",
  Equity: "bg-blue-50 text-blue-700 ring-blue-200",
  Revenue: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Expense: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function AccountsPage() {
  const { loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listAccounts();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = typeFilter
    ? accounts.filter((a) => a.account_type === typeFilter)
    : accounts;

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this account?")) return;
    try {
      await api.deactivateAccount(id);
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: false } : a))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to deactivate account");
    }
  };

  if (authLoading || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Chart of Accounts"
        subtitle={`${filtered.length} account${filtered.length === 1 ? "" : "s"}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-white"
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <Link
            href="/accounts/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Account
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-sm text-gray-500 mb-6">Set up your chart of accounts to start tracking finances.</p>
            <Link href="/accounts/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md">
              Add Account
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Code</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {filtered.map((account) => (
                <div key={account.id} className={`group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 transition-all items-center ${!account.is_active ? "opacity-50" : ""}`}>
                  <div className="col-span-2">
                    <p className="text-sm font-mono font-bold text-gray-900">{account.code}</p>
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm font-bold text-gray-900">
                      {account.parent_account_id && <span className="text-gray-400 mr-1">\u2514</span>}
                      {account.name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${TYPE_COLORS[account.account_type] || "bg-gray-100 text-gray-700"}`}>
                      {account.account_type}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${account.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {account.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Link
                      href={`/accounts/${account.id}/edit`}
                      className="p-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                      title="Edit account"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    {account.is_active && (
                      <button
                        onClick={() => handleDeactivate(account.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Deactivate account"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
