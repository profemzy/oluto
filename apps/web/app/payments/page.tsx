"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Payment, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ErrorAlert, ListPageLayout } from "@/app/components";
import { formatCurrency, formatDate } from "@/app/lib/format";

export default function PaymentsPage() {
  const { loading: authLoading, user } = useAuth();
  const {
    data: payments = [],
    error,
    isLoading: paymentsLoading,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.listPayments(user.business_id!),
    enabled: !authLoading,
  });

  const {
    data: customers = [],
    error: customersError,
    isLoading: customersLoading,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.getCustomers(user.business_id!),
    enabled: !authLoading,
  });

  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customers.forEach((c: Contact) => {
      map[c.id] = c.name;
    });
    return map;
  }, [customers]);

  const loadingState = authLoading || paymentsLoading || customersLoading;
  if (loadingState) return <PageLoader />;

  const combinedError =
    (error instanceof Error ? error.message : "") ||
    (customersError instanceof Error ? customersError.message : "");

  return (
    <ListPageLayout
      title="Payments Received"
      subtitle={`${payments.length} payment${payments.length === 1 ? "" : "s"}`}

    >
      <ErrorAlert error={combinedError} className="mb-6" />

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Customer payments received. Bill payments can be recorded from
          individual bill pages.
        </p>
        <Link
          href="/payments/new"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Record Payment
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
          <h3 className="text-lg font-bold text-heading mb-2">
            No payments yet
          </h3>
          <p className="text-sm text-muted mb-6">
            Record customer payments to track receivables.
          </p>
          <Link
            href="/payments/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md"
          >
            Record Payment
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
            <div className="col-span-2">Payment #</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1">Method</div>
            <div className="col-span-2 text-right">Unapplied</div>
            <div className="col-span-1"></div>
          </div>
          <div className="divide-y divide-edge-subtle">
            {payments.map((pmt) => (
              <Link
                key={pmt.id}
                href={`/payments/${pmt.id}`}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/50 transition-all items-center"
              >
                <div className="col-span-2">
                  <p className="text-sm font-bold text-heading">
                    {pmt.payment_number || "\u2014"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-body truncate">
                    {customerMap[pmt.customer_id] || "\u2014"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-body">
                    {formatDate(pmt.payment_date)}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-bold text-heading">
                    {formatCurrency(pmt.amount)}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-body capitalize truncate">
                    {pmt.payment_method}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  {pmt.unapplied_amount &&
                  parseFloat(pmt.unapplied_amount) > 0 ? (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-800">
                      {formatCurrency(pmt.unapplied_amount)}
                    </span>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">
                      Fully applied
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  <span className="p-2 rounded-lg text-caption group-hover:text-cyan-600 transition-all">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </ListPageLayout>
  );
}
