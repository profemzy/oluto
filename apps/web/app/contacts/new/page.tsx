"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

export default function NewContactPage() {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [contactType, setContactType] = useState<"Customer" | "Vendor" | "Employee">("Customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.createContact(user.business_id!, {
        contact_type: contactType,
        name,
        email: email || undefined,
        phone: phone || undefined,
        billing_address: billingAddress || undefined,
        shipping_address: shippingAddress || undefined,
      });
      router.push("/contacts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Add Contact"
        subtitle="Create a new customer, vendor, or employee"
        actions={
          <Link href="/contacts" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Contacts
          </Link>
        }
      />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-gray-900/5 rounded-2xl border border-gray-100 sm:px-10">
          <ErrorAlert error={error} className="mb-6" />
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold leading-6 text-gray-900 mb-2">Contact Type</label>
              <div className="grid grid-cols-3 gap-0 rounded-xl ring-1 ring-inset ring-gray-300 overflow-hidden">
                {(["Customer", "Vendor", "Employee"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setContactType(type)}
                    className={`py-3 text-sm font-bold transition-all ${
                      contactType === type
                        ? "bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-700 ring-1 ring-cyan-200"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-bold leading-6 text-gray-900">Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold leading-6 text-gray-900">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-bold leading-6 text-gray-900">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="billingAddress" className="block text-sm font-bold leading-6 text-gray-900">Billing Address <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea id="billingAddress" rows={2} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
            </div>

            <div>
              <label htmlFor="shippingAddress" className="block text-sm font-bold leading-6 text-gray-900">Shipping Address <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea id="shippingAddress" rows={2} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm transition-all hover:ring-gray-400 resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 flex justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
                {loading ? "Saving..." : "Save Contact"}
              </button>
              <Link href="/contacts" className="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
