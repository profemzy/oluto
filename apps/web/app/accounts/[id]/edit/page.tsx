"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

export default function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: accountId } = use(params);
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!user?.business_id) return;
    const load = async () => {
      try {
        const account = await api.getAccount(user.business_id!, accountId);
        setCode(account.code);
        setName(account.name);
        setAccountType(account.account_type);
        setIsActive(account.is_active);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load account");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accountId, user?.business_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.updateAccount(user.business_id!, accountId, {
        name,
        is_active: isActive,
      });
      router.push("/accounts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Edit Account"
        subtitle={`${code} - ${accountType}`}
        actions={
          <Link href="/accounts" className="group inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Accounts
          </Link>
        }
      />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-surface/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-edge-subtle sm:px-10">
          <ErrorAlert error={error} className="mb-6" />
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold leading-6 text-heading">Account Code</label>
                <p className="mt-2 text-sm text-body bg-surface-secondary rounded-xl py-3 px-4 ring-1 ring-edge font-mono">{code}</p>
              </div>
              <div>
                <label className="block text-sm font-bold leading-6 text-heading">Account Type</label>
                <p className="mt-2 text-sm text-body bg-surface-secondary rounded-xl py-3 px-4 ring-1 ring-edge">{accountType}</p>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-bold leading-6 text-heading">Account Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-bold leading-6 text-heading mb-2">Status</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-edge after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                <span className="ml-3 text-sm font-bold text-body">{isActive ? "Active" : "Inactive"}</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 flex justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link href="/accounts" className="flex items-center justify-center rounded-xl border-2 border-edge bg-surface px-6 py-3 text-sm font-bold text-body shadow-sm hover:bg-surface-hover transition-all">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
