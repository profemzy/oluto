"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { api, Payment, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA");
}

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paymentId } = use(params);
  const { loading: authLoading, user } = useAuth();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.business_id) return;
    const load = async () => {
      try {
        const pmt = await api.getPayment(user.business_id!, paymentId);
        setPayment(pmt);
        try {
          const customers = await api.getCustomers(user.business_id!);
          const customer = customers.find((c: Contact) => c.id === pmt.customer_id);
          if (customer) setCustomerName(customer.name);
        } catch {
          /* non-critical */
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [paymentId, user?.business_id]);

  if (authLoading || loading) return <PageLoader />;
  if (!payment) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Payment not found</h2>
          <Link href="/payments" className="text-sm text-cyan-600 hover:text-cyan-800 font-medium">Back to Payments</Link>
        </div>
      </div>
    );
  }

  const hasUnapplied = payment.unapplied_amount && parseFloat(payment.unapplied_amount) > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title={`Payment ${payment.payment_number || paymentId.slice(0, 8)}`}
        subtitle={customerName || undefined}
        actions={
          <Link href="/payments" className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Payments
          </Link>
        }
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">{payment.payment_number || "Payment"}</h2>
            {hasUnapplied ? (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                Partially Applied
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">
                Fully Applied
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Customer</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{customerName || "\u2014"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Payment Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(payment.payment_date)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Amount</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Unapplied</p>
              <p className={`text-sm font-bold mt-1 ${hasUnapplied ? "text-amber-600" : "text-green-600"}`}>
                {formatCurrency(payment.unapplied_amount || "0")}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Method</p>
              <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{payment.payment_method}</p>
            </div>
            {payment.reference_number && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Reference #</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{payment.reference_number}</p>
              </div>
            )}
            {payment.memo && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Memo</p>
                <p className="text-sm text-gray-700 mt-1">{payment.memo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
