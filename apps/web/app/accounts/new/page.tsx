"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, Account } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"] as const;

export default function NewAccountPage() {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingAccounts, setExistingAccounts] = useState<Account[]>([]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<typeof ACCOUNT_TYPES[number]>("Asset");
  const [parentAccountId, setParentAccountId] = useState("");

  useEffect(() => {
    if (!user?.business_id) return;
    api.listAccounts(user.business_id!).then(setExistingAccounts).catch(() => {});
  }, [user?.business_id]);

  const parentOptions = existingAccounts.filter(
    (a) => a.account_type === accountType && a.is_active
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.createAccount(user.business_id!, {
        code,
        name,
        account_type: accountType,
        parent_account_id: parentAccountId || undefined,
      });
      router.push("/accounts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Add Account"
        subtitle="Add to your chart of accounts"
        actions={
          <Link href="/accounts" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Accounts
          </Link>
        }
      />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-gray-100 sm:px-10">
          <ErrorAlert error={error} className="mb-6" />
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-bold leading-6 text-gray-900">Account Code</label>
                <input id="code" type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 1000"
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm font-mono transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="accountType" className="block text-sm font-bold leading-6 text-gray-900">Account Type</label>
                <select id="accountType" value={accountType} onChange={(e) => { setAccountType(e.target.value as typeof ACCOUNT_TYPES[number]); setParentAccountId(""); }}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-white transition-all hover:ring-gray-400">
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-bold leading-6 text-gray-900">Account Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cash, Accounts Receivable"
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
            </div>

            {parentOptions.length > 0 && (
              <div>
                <label htmlFor="parentAccount" className="block text-sm font-bold leading-6 text-gray-900">Parent Account <span className="text-gray-400 font-normal">(optional)</span></label>
                <select id="parentAccount" value={parentAccountId} onChange={(e) => setParentAccountId(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm bg-white transition-all hover:ring-gray-400">
                  <option value="">None (top-level account)</option>
                  {parentOptions.map((a) => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 flex justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
                {loading ? "Saving..." : "Save Account"}
              </button>
              <Link href="/accounts" className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
