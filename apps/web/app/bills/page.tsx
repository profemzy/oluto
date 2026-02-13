"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Bill, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const STATUS_FILTERS = [
  { value: "", label: "All Bills" },
  { value: "open", label: "Open" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
];

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 ring-blue-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-green-50 text-green-700 ring-green-200",
  void: "bg-slate-100 text-slate-500 ring-slate-300",
};

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA");
}

export default function BillsPage() {
  const { loading: authLoading } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Record<string, string>>({});
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [billData, vendorData, overdueData] = await Promise.all([
          api.listBills(statusFilter ? { status: statusFilter } : undefined),
          api.getVendors(),
          api.getOverdueBills(),
        ]);
        setBills(billData);
        const map: Record<string, string> = {};
        vendorData.forEach((v: Contact) => { map[v.id] = v.name; });
        setVendors(map);
        setOverdueCount(overdueData.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bills");
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    load();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      await api.deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete bill");
    }
  };

  if (authLoading || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Bills"
        subtitle={`${bills.length} bill${bills.length === 1 ? "" : "s"}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />

        {overdueCount > 0 && !statusFilter && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-bold text-red-700">
                {overdueCount} overdue bill{overdueCount === 1 ? "" : "s"} require attention
              </p>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-white"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <Link
            href="/bills/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Bill
          </Link>
        </div>

        {bills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bills yet</h3>
            <p className="text-sm text-gray-500 mb-6">Record bills from your vendors to track payables.</p>
            <Link href="/bills/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md">
              New Bill
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Bill #</div>
              <div className="col-span-2">Vendor</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Due Date</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {bills.map((bill) => (
                <div key={bill.id} className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 transition-all items-center">
                  <Link href={`/bills/${bill.id}`} className="col-span-2">
                    <p className="text-sm font-bold text-gray-900">{bill.bill_number || "\u2014"}</p>
                  </Link>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 truncate">{vendors[bill.vendor_id] || "\u2014"}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600">{formatDate(bill.bill_date)}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600">{formatDate(bill.due_date)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(bill.total_amount)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className={`text-sm font-bold ${parseFloat(bill.balance) > 0 ? "text-amber-600" : "text-green-600"}`}>
                      {formatCurrency(bill.balance)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset capitalize ${STATUS_COLORS[bill.status] || "bg-gray-100 text-gray-700"}`}>
                      {bill.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <Link
                      href={`/bills/${bill.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                      title="View bill"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    {bill.balance === bill.total_amount && (
                      <button
                        onClick={() => handleDelete(bill.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete bill"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
