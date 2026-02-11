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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Set up your business
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell us about your business so we can configure tax calculations and reporting.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg shadow-gray-900/5 rounded-xl border border-gray-200 sm:px-10">
          <ErrorAlert error={error} />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
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
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium leading-6 text-gray-900">
                Province / Territory
              </label>
              <div className="mt-2">
                <select
                  id="province"
                  name="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select province...</option>
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Used for GST/HST/PST tax calculations
              </p>
            </div>

            <div>
              <label htmlFor="taxProfile" className="block text-sm font-medium leading-6 text-gray-900">
                GST/HST Registration Number
                <span className="text-gray-400 font-normal"> (optional)</span>
              </label>
              <div className="mt-2">
                <input
                  id="taxProfile"
                  name="taxProfile"
                  type="text"
                  value={taxProfile}
                  onChange={(e) => setTaxProfile(e.target.value)}
                  placeholder="e.g. 123456789 RT0001"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Setting up..." : "Continue to Dashboard"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
