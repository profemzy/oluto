"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Invoice, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { ListSkeleton, ErrorAlert, ListPageLayout, DataTable, DataTableColumn, DataTableAction } from "@/app/components";
import { formatCurrency, formatDate } from "@/app/lib/format";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_OPTIONS,
} from "@/app/lib/status";

export default function InvoicesPage() {
  const { loading: authLoading, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices", user?.business_id],
    queryFn: () => api.listInvoices(user!.business_id!, statusFilter ? { status: statusFilter } : undefined),
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: customers = [],
    error: customersError,
    isLoading: customersLoading,
  } = useQuery({
    queryKey: ["customers", user?.business_id],
    queryFn: () => api.getCustomers(user!.business_id!),
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: overdueInvoices = [],
    error: overdueError,
    isLoading: overdueLoading,
  } = useQuery({
    queryKey: ["invoices-overdue", user?.business_id],
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

  // Filter invoices based on search
  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        customerMap[inv.customer_id]?.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery, customerMap]);

  const loadingState = authLoading || invoicesLoading || customersLoading || overdueLoading;
  const combinedError =
    (invoicesError instanceof Error ? invoicesError.message : "") ||
    (customersError instanceof Error ? customersError.message : "") ||
    (overdueError instanceof Error ? overdueError.message : "");

  // Define table columns
  const columns: DataTableColumn<Invoice>[] = useMemo(
    () => [
      {
        key: "invoice_number",
        header: "Invoice #",
        width: "1fr",
        sortable: true,
        render: (invoice) => (
          <span className="font-semibold text-heading">{invoice.invoice_number}</span>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        width: "1.5fr",
        sortable: true,
        render: (invoice) => (
          <span className="text-sm text-body truncate">
            {customerMap[invoice.customer_id] || "—"}
          </span>
        ),
      },
      {
        key: "invoice_date",
        header: "Date",
        width: "100px",
        sortable: true,
        render: (invoice) => (
          <span className="text-sm text-body">{formatDate(invoice.invoice_date)}</span>
        ),
      },
      {
        key: "due_date",
        header: "Due Date",
        width: "100px",
        sortable: true,
        render: (invoice) => (
          <span className="text-sm text-body">{formatDate(invoice.due_date)}</span>
        ),
      },
      {
        key: "total_amount",
        header: "Total",
        width: "120px",
        sortable: true,
        align: "right",
        render: (invoice) => (
          <span className="text-sm font-bold text-heading">
            {formatCurrency(invoice.total_amount)}
          </span>
        ),
      },
      {
        key: "balance",
        header: "Balance",
        width: "120px",
        sortable: true,
        align: "right",
        render: (invoice) => (
          <span
            className={`text-sm font-bold ${
              parseFloat(invoice.balance) > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600"
            }`}
          >
            {formatCurrency(invoice.balance)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "110px",
        render: (invoice) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset capitalize ${
              INVOICE_STATUS_COLORS[invoice.status] || "bg-surface-tertiary text-body"
            }`}
          >
            {invoice.status}
          </span>
        ),
      },
    ],
    [customerMap]
  );

  // Define table actions
  const actions: DataTableAction<Invoice>[] = useMemo(
    () => [
      {
        key: "view",
        label: "View invoice",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        href: (invoice) => `/invoices/${invoice.id}`,
        variant: "primary",
      },
    ],
    []
  );

  if (loadingState) {
    return <ListSkeleton title="Invoices" actionButton />;
  }

  return (
    <ListPageLayout
      title="Invoices"
      subtitle={`${filteredInvoices.length} invoice${filteredInvoices.length === 1 ? "" : "s"}`}
    >
      <ErrorAlert error={combinedError} className="mb-6" />

      {/* Overdue alert */}
      {overdueInvoices.length > 0 && !statusFilter && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border border-red-200 dark:border-red-800 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-bold text-red-700 dark:text-red-300">
              {overdueInvoices.length} overdue invoice{overdueInvoices.length === 1 ? "" : "s"} require attention
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

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-surface"
          >
            {INVOICE_STATUS_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter("")}
              className="text-sm text-muted hover:text-heading transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <Link
          href="/invoices/new"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Invoice
        </Link>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        keyExtractor={(invoice) => invoice.id}
        actions={actions}
        searchFields={["invoice_number"]}
        searchPlaceholder="Search by invoice number..."
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        loading={loadingState}
        onRowClick={(invoice) => {
          window.location.href = `/invoices/${invoice.id}`;
        }}
        pageSize={25}
        emptyState={{
          title: "No invoices yet",
          description: "Create your first invoice to start tracking receivables.",
          action: { label: "New Invoice", href: "/invoices/new" },
        }}
        noResultsState={{
          title: "No invoices match your search",
          description: "Try adjusting your search terms.",
          onClearFilters: () => setSearchQuery(""),
        }}
      />
    </ListPageLayout>
  );
}
