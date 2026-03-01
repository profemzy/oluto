"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Payment, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { ListSkeleton, ErrorAlert, ListPageLayout, DataTable, DataTableColumn, DataTableAction, EmptyState } from "@/app/components";
import { formatCurrency, formatDate } from "@/app/lib/format";

export default function PaymentsPage() {
  const { loading: authLoading, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: payments = [],
    error,
    isLoading: paymentsLoading,
  } = useQuery({
    queryKey: ["payments", user?.business_id],
    queryFn: () => api.listPayments(user!.business_id!),
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

  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customers.forEach((c: Contact) => {
      map[c.id] = c.name;
    });
    return map;
  }, [customers]);

  // Filter payments based on search
  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter(
      (p) =>
        (p.payment_number?.toLowerCase().includes(q) || false) ||
        customerMap[p.customer_id]?.toLowerCase().includes(q) ||
        p.payment_method.toLowerCase().includes(q)
    );
  }, [payments, searchQuery, customerMap]);

  const loadingState = authLoading || paymentsLoading || customersLoading;
  
  const combinedError =
    (error instanceof Error ? error.message : "") ||
    (customersError instanceof Error ? customersError.message : "");

  // Define table columns
  const columns: DataTableColumn<Payment>[] = useMemo(
    () => [
      {
        key: "payment_number",
        header: "Payment #",
        width: "1fr",
        sortable: true,
        render: (pmt) => (
          <span className="font-semibold text-heading">{pmt.payment_number || "—"}</span>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        width: "1.5fr",
        sortable: true,
        render: (pmt) => (
          <span className="text-sm text-body truncate">
            {customerMap[pmt.customer_id] || "—"}
          </span>
        ),
      },
      {
        key: "payment_date",
        header: "Date",
        width: "100px",
        sortable: true,
        render: (pmt) => (
          <span className="text-sm text-body">{formatDate(pmt.payment_date)}</span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        width: "120px",
        sortable: true,
        align: "right",
        render: (pmt) => (
          <span className="text-sm font-bold text-heading">
            {formatCurrency(pmt.amount)}
          </span>
        ),
      },
      {
        key: "payment_method",
        header: "Method",
        width: "100px",
        render: (pmt) => (
          <span className="text-sm text-body capitalize">
            {pmt.payment_method}
          </span>
        ),
      },
      {
        key: "unapplied",
        header: "Status",
        width: "130px",
        align: "right",
        render: (pmt) => {
          const hasUnapplied = pmt.unapplied_amount && parseFloat(pmt.unapplied_amount) > 0;
          return hasUnapplied ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-800">
              {formatCurrency(pmt.unapplied_amount)} unapplied
            </span>
          ) : (
            <span className="text-xs font-medium text-green-600">
              Fully applied
            </span>
          );
        },
      },
    ],
    [customerMap]
  );

  // Define table actions
  const actions: DataTableAction<Payment>[] = useMemo(
    () => [
      {
        key: "view",
        label: "View payment",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        href: (pmt) => `/payments/${pmt.id}`,
        variant: "primary",
      },
    ],
    []
  );

  if (loadingState) {
    return <ListSkeleton title="Payments Received" actionButton />;
  }

  return (
    <ListPageLayout
      title="Payments Received"
      subtitle={`${filteredPayments.length} payment${filteredPayments.length === 1 ? "" : "s"}`}
    >
      <ErrorAlert error={combinedError} className="mb-6" />

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Customer payments received. Bill payments can be recorded from
          individual bill pages.
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        keyExtractor={(pmt) => pmt.id}
        actions={actions}
        searchFields={["payment_number"]}
        searchPlaceholder="Search by payment number or customer..."
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        loading={loadingState}
        onRowClick={(pmt) => {
          window.location.href = `/payments/${pmt.id}`;
        }}
        pageSize={25}
        emptyState={{
          title: "No payments yet",
          description: "Record customer payments to track receivables.",
          action: { label: "Record Payment", href: "/payments/new" },
        }}
        noResultsState={{
          title: "No payments match your search",
          description: "Try adjusting your search terms.",
          onClearFilters: () => setSearchQuery(""),
        }}
      />
    </ListPageLayout>
  );
}
