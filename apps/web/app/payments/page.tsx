"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Payment, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA");
}

export default function PaymentsPage() {
  const { loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [paymentData, customerData] = await Promise.all([
          api.listPayments(),
          api.getCustomers(),
        ]);
        setPayments(paymentData);
        const map: Record<string, string> = {};
        customerData.forEach((c: Contact) => { map[c.id] = c.name; });
        setCustomers(map);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (authLoading || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Payments Received"
        subtitle={`${payments.length} payment${payments.length === 1 ? "" : "s"}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Customer payments received. Bill payments can be recorded from individual bill pages.
          </p>
          <Link
            href="/payments/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Record Payment
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No payments yet</h3>
            <p className="text-sm text-gray-500 mb-6">Record customer payments to track receivables.</p>
            <Link href="/payments/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md">
              Record Payment
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Payment #</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1">Method</div>
              <div className="col-span-2 text-right">Unapplied</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {payments.map((pmt) => (
                <Link
                  key={pmt.id}
                  href={`/payments/${pmt.id}`}
                  className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 transition-all items-center"
                >
                  <div className="col-span-2">
                    <p className="text-sm font-bold text-gray-900">{pmt.payment_number || "\u2014"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 truncate">{customers[pmt.customer_id] || "\u2014"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">{formatDate(pmt.payment_date)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(pmt.amount)}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600 capitalize truncate">{pmt.payment_method}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    {pmt.unapplied_amount && parseFloat(pmt.unapplied_amount) > 0 ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                        {formatCurrency(pmt.unapplied_amount)}
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 font-medium">Fully applied</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="p-2 rounded-lg text-gray-400 group-hover:text-cyan-600 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
