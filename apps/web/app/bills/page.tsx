"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Bill, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ErrorAlert, ListPageLayout } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { formatCurrency, formatDate } from "@/app/lib/format";
import { toastError, toastSuccess } from "@/app/lib/toast";
import { BILL_STATUS_COLORS, BILL_STATUS_OPTIONS } from "@/app/lib/status";

export default function BillsPage() {
  const { loading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: bills,
    loading,
    error: billsError,
    filter: statusFilter,
    setFilter: setStatusFilter,
  } = useDataTable<Bill>({
    queryKey: ["bills"],
    queryFn: (params) =>
      api.listBills(user!.business_id!, params?.status ? { status: params.status } : undefined),
    defaultFilter: "",
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: vendors = [],
    error: vendorsError,
    isLoading: vendorsLoading,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => api.getVendors(user!.business_id!),
    enabled: !authLoading && !!user?.business_id,
  });

  const {
    data: overdueBills = [],
    error: overdueError,
    isLoading: overdueLoading,
  } = useQuery({
    queryKey: ["bills-overdue"],
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    deleteMutation.mutate(id);
  };

  const loadingState =
    authLoading || loading || vendorsLoading || overdueLoading;
  if (loadingState) return <PageLoader />;

  const combinedError =
    billsError ||
    (vendorsError instanceof Error ? vendorsError.message : "") ||
    (overdueError instanceof Error ? overdueError.message : "");

  return (
    <ListPageLayout
      title="Bills"
      subtitle={`${bills.length} bill${bills.length === 1 ? "" : "s"}`}
    >
      <ErrorAlert error={combinedError} className="mb-6" />

      {overdueBills.length > 0 && !statusFilter && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border border-red-200 dark:border-red-800 p-4 shadow-sm">
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
            <p className="text-sm font-bold text-red-700 dark:text-red-300">
              {overdueBills.length} overdue bill
              {overdueBills.length === 1 ? "" : "s"} require attention
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        <Link
          href="/bills/new"
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
          New Bill
        </Link>
      </div>

      {bills.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
          <h3 className="text-lg font-bold text-heading mb-2">No bills yet</h3>
          <p className="text-sm text-muted mb-6">
            Record bills from your vendors to track payables.
          </p>
          <Link
            href="/bills/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md"
          >
            New Bill
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
            <div className="col-span-2">Bill #</div>
            <div className="col-span-2">Vendor</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Due Date</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Balance</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1"></div>
          </div>
          <div className="divide-y divide-edge-subtle">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/50 transition-all items-center"
              >
                <Link href={`/bills/${bill.id}`} className="col-span-2">
                  <p className="text-sm font-bold text-heading">
                    {bill.bill_number || "\u2014"}
                  </p>
                </Link>
                <div className="col-span-2">
                  <p className="text-sm text-body truncate">
                    {vendorMap[bill.vendor_id] || "\u2014"}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-body">
                    {formatDate(bill.bill_date)}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-body">
                    {formatDate(bill.due_date)}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-bold text-heading">
                    {formatCurrency(bill.total_amount)}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p
                    className={`text-sm font-bold ${parseFloat(bill.balance) > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600"}`}
                  >
                    {formatCurrency(bill.balance)}
                  </p>
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset capitalize ${BILL_STATUS_COLORS[bill.status] || "bg-surface-tertiary text-body"}`}
                  >
                    {bill.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <Link
                    href={`/bills/${bill.id}`}
                    className="p-2 rounded-lg text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all"
                    title="View bill"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Link>
                  {bill.balance === bill.total_amount && (
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="p-2 rounded-lg text-caption hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                      title="Delete bill"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ListPageLayout>
  );
}
