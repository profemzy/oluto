"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Bill, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { ListSkeleton, ErrorAlert, ListPageLayout, DataTable, DataTableColumn, DataTableAction } from "@/app/components";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { toastError, toastSuccess } from "@/app/lib/toast";
import { BILL_STATUS_COLORS, BILL_STATUS_OPTIONS } from "@/app/lib/status";

export default function BillsPage() {
  const { loading: authLoading, user, canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    data: bills = [],
    isLoading: billsLoading,
    error: billsError,
  } = useQuery({
    queryKey: ["bills", user?.business_id, statusFilter],
    queryFn: () => api.listBills(user!.business_id!, statusFilter ? { status: statusFilter } : undefined),
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: vendors = [],
    error: vendorsError,
    isLoading: vendorsLoading,
  } = useQuery({
    queryKey: ["vendors", user?.business_id],
    queryFn: () => api.getVendors(user!.business_id!),
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: overdueBills = [],
    error: overdueError,
    isLoading: overdueLoading,
  } = useQuery({
    queryKey: ["bills-overdue", user?.business_id],
    queryFn: () => api.getOverdueBills(user!.business_id!),
    enabled: !authLoading && !!user?.business_id,
  });

  const vendorMap = useMemo(() => {
    const map: Record<string, string> = {};
    vendors.forEach((v: Contact) => {
      map[v.id] = v.name;
    });
    return map;
  }, [vendors]);

  // Filter bills based on search
  const filteredBills = useMemo(() => {
    if (!searchQuery) return bills;
    const q = searchQuery.toLowerCase();
    return bills.filter(
      (bill) =>
        (bill.bill_number?.toLowerCase().includes(q) || false) ||
        vendorMap[bill.vendor_id]?.toLowerCase().includes(q)
    );
  }, [bills, searchQuery, vendorMap]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBill(user!.business_id!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bills-overdue"] });
      toastSuccess("Bill deleted");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to delete bill");
    },
  });

  const loadingState = authLoading || billsLoading || vendorsLoading || overdueLoading;
  
  const combinedError =
    (billsError instanceof Error ? billsError.message : "") ||
    (vendorsError instanceof Error ? vendorsError.message : "") ||
    (overdueError instanceof Error ? overdueError.message : "");

  // Define table columns
  const columns: DataTableColumn<Bill>[] = useMemo(
    () => [
      {
        key: "bill_number",
        header: "Bill #",
        width: "1fr",
        sortable: true,
        render: (bill) => (
          <span className="font-semibold text-heading">{bill.bill_number || "—"}</span>
        ),
      },
      {
        key: "vendor",
        header: "Vendor",
        width: "1.5fr",
        sortable: true,
        render: (bill) => (
          <span className="text-sm text-body truncate">
            {vendorMap[bill.vendor_id] || "—"}
          </span>
        ),
      },
      {
        key: "bill_date",
        header: "Date",
        width: "100px",
        sortable: true,
        render: (bill) => (
          <span className="text-sm text-body">{formatDate(bill.bill_date)}</span>
        ),
      },
      {
        key: "due_date",
        header: "Due Date",
        width: "100px",
        sortable: true,
        render: (bill) => (
          <span className="text-sm text-body">{formatDate(bill.due_date)}</span>
        ),
      },
      {
        key: "total_amount",
        header: "Total",
        width: "120px",
        sortable: true,
        align: "right",
        render: (bill) => (
          <span className="text-sm font-bold text-heading">
            {formatCurrency(bill.total_amount)}
          </span>
        ),
      },
      {
        key: "balance",
        header: "Balance",
        width: "120px",
        sortable: true,
        align: "right",
        render: (bill) => (
          <span
            className={`text-sm font-bold ${
              parseFloat(bill.balance) > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600"
            }`}
          >
            {formatCurrency(bill.balance)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "110px",
        render: (bill) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset capitalize ${
              BILL_STATUS_COLORS[bill.status] || "bg-surface-tertiary text-body"
            }`}
          >
            {bill.status}
          </span>
        ),
      },
    ],
    [vendorMap]
  );

  // Define table actions
  const actions: DataTableAction<Bill>[] = useMemo(
    () => [
      {
        key: "view",
        label: "View bill",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        href: (bill) => `/bills/${bill.id}`,
        variant: "primary",
      },
      {
        key: "delete",
        label: "Delete bill",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: (bill) => {
          if (confirm("Are you sure you want to delete this bill?")) {
            deleteMutation.mutate(bill.id);
          }
        },
        variant: "danger",
        show: (bill) => bill.balance === bill.total_amount,
      },
    ],
    [deleteMutation]
  );

  if (loadingState) {
    return <ListSkeleton title="Bills" actionButton />;
  }

  return (
    <ListPageLayout
      title="Bills"
      subtitle={`${filteredBills.length} bill${filteredBills.length === 1 ? "" : "s"}`}
    >
      <ErrorAlert error={combinedError} className="mb-6" />

      {/* Overdue alert */}
      {overdueBills.length > 0 && !statusFilter && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border border-red-200 dark:border-red-800 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-bold text-red-700 dark:text-red-300">
              {overdueBills.length} overdue bill{overdueBills.length === 1 ? "" : "s"} require attention
            </p>
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
            {BILL_STATUS_OPTIONS.map((f) => (
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
        {canWrite && (
          <Link
            href="/bills/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Bill
          </Link>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBills}
        keyExtractor={(bill) => bill.id}
        actions={canWrite ? actions : []}
        searchFields={["bill_number"]}
        searchPlaceholder="Search by bill number or vendor..."
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        loading={loadingState}
        onRowClick={(bill) => {
          window.location.href = `/bills/${bill.id}`;
        }}
        pageSize={25}
        emptyState={{
          title: "No bills yet",
          description: canWrite ? "Record bills from your vendors to track payables." : "No bills have been recorded yet.",
          action: canWrite ? { label: "New Bill", href: "/bills/new" } : undefined,
        }}
        noResultsState={{
          title: "No bills match your search",
          description: "Try adjusting your search terms.",
          onClearFilters: () => setSearchQuery(""),
        }}
      />
    </ListPageLayout>
  );
}
