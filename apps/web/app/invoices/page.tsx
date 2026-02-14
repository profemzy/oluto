"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Invoice, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ErrorAlert, ListPageLayout } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { formatCurrency, formatDate } from "@/app/lib/format";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_OPTIONS,
} from "@/app/lib/status";

export default function InvoicesPage() {
  const { loading: authLoading, user } = useAuth();
  const {
    data: invoices,
    loading,
    error,
    filter: statusFilter,
    setFilter: setStatusFilter,
  } = useDataTable<Invoice>({
    queryKey: ["invoices"],
    queryFn: (params) =>
      api.listInvoices(user!.business_id!, params?.status ? { status: params.status } : undefined),
    defaultFilter: "",
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: customers = [],
    error: customersError,
    isLoading: customersLoading,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.getCustomers(user!.business_id!),
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: overdueInvoices = [],
    error: overdueError,
    isLoading: overdueLoading,
  } = useQuery({
    queryKey: ["invoices-overdue"],
    queryFn: () => api.getOverdueInvoices(user!.business_id!),
    enabled: !authLoading && !!user?.business_id,
  });

  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customers.forEach((c: Contact) => {
      map[c.id] = c.name;
    });
    return map;
  }, [customers]);

  const loadingState =
    authLoading || loading || customersLoading || overdueLoading;
  if (loadingState) return <PageLoader />;

  const combinedError =
    error ||
    (customersError instanceof Error ? customersError.message : "") ||
    (overdueError instanceof Error ? overdueError.message : "");

  return (
    <ListPageLayout
      title="Invoices"
      subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}

    >
      <ErrorAlert error={combinedError} className="mb-6" />

      {overdueInvoices.length > 0 && !statusFilter && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-red-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm font-bold text-red-700">
              {overdueInvoices.length} overdue invoice
              {overdueInvoices.length === 1 ? "" : "s"} require attention
            </p>
            <button
              onClick={() => setStatusFilter("overdue")}
              className="ml-auto text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              View overdue
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-white"
        >
          {INVOICE_STATUS_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <Link
          href="/invoices/new"
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
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No invoices yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Create your first invoice to start tracking receivables.
          </p>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md"
          >
            New Invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Invoice #</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Due Date</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Balance</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1"></div>
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 transition-all items-center"
              >
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900">
                    {invoice.invoice_number}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 truncate">
                    {customerMap[invoice.customer_id] || "\u2014"}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-gray-600">
                    {formatDate(invoice.invoice_date)}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-gray-600">
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(invoice.total_amount)}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p
                    className={`text-sm font-bold ${parseFloat(invoice.balance) > 0 ? "text-amber-600" : "text-green-600"}`}
                  >
                    {formatCurrency(invoice.balance)}
                  </p>
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset capitalize ${INVOICE_STATUS_COLORS[invoice.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <span className="p-2 rounded-lg text-gray-400 group-hover:text-cyan-600 transition-all">
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
