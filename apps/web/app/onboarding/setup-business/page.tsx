"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ErrorAlert } from "@/app/components";

const PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

export default function SetupBusinessPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth({ requireBusiness: false });
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [taxProfile, setTaxProfile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.createBusiness({
        name,
        province: province || undefined,
        tax_profile: taxProfile || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-[10%] w-64 h-64 bg-cyan-200 dark:bg-cyan-800 rounded-full opacity-20 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-[10%] w-72 h-72 bg-green-200 dark:bg-green-800 rounded-full opacity-20 blur-3xl animate-float" />

      {/* Bouncing decorative dots */}
      <div className="absolute top-32 right-[25%] w-3 h-3 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full animate-bounce-subtle" />
      <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-green-500" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
            2
          </div>
          <div className="w-12 h-1 rounded-full bg-surface-tertiary" />
          <div className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center text-muted text-sm font-bold">
            3
          </div>
        </div>

        <h2 className="mt-4 text-center text-3xl font-black tracking-tight text-heading">
          Set up your business
        </h2>
        <p className="mt-2 text-center text-sm text-body">
          Tell us about your business so we can configure tax calculations and reporting.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/10 rounded-2xl border border-edge-subtle sm:px-10">
          <ErrorAlert error={error} />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-bold leading-6 text-heading">
                Business name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maple Leaf Consulting"
                  className="block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-bold leading-6 text-heading">
                Province / Territory
              </label>
              <div className="mt-2">
                <select
                  id="province"
                  name="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400 bg-surface"
                >
                  <option value="">Select province...</option>
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-muted">
                Used for GST/HST/PST tax calculations
              </p>
            </div>

            <div>
              <label htmlFor="taxProfile" className="block text-sm font-bold leading-6 text-heading">
                GST/HST Registration Number
                <span className="text-caption font-normal"> (optional)</span>
              </label>
              <div className="mt-2">
                <input
                  id="taxProfile"
                  name="taxProfile"
                  type="text"
                  value={taxProfile}
                  onChange={(e) => setTaxProfile(e.target.value)}
                  placeholder="e.g. 123456789 RT0001"
                  className="block w-full rounded-xl border-0 py-3 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] placeholder:text-caption focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 transition-all duration-200 hover:ring-gray-400"
                />
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-cyan-800">
                  Tax (GST/HST/PST) will be automatically calculated based on your business province.
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold leading-6 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 btn-glow"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Setting up...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue to Dashboard
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
