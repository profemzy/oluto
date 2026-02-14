"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, ErrorAlert, ListPageLayout } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { toastError, toastSuccess } from "@/app/lib/toast";
import { CONTACT_TYPE_COLORS, CONTACT_TYPE_FILTERS } from "@/app/lib/status";

export default function ContactsPage() {
  const { loading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const listContacts = (params?: Record<string, string>) => {
    const type = params?.type;
    if (type === "Customer") return api.getCustomers(user.business_id!);
    if (type === "Vendor") return api.getVendors(user.business_id!);
    if (type === "Employee") return api.getEmployees(user.business_id!);
    return api.listContacts(user.business_id!);
  };

  const {
    data: contacts,
    loading,
    error,
    filter: typeFilter,
    setFilter: setTypeFilter,
  } = useDataTable<Contact>({
    queryKey: ["contacts"],
    queryFn: listContacts,
    filterParam: "type",
    defaultFilter: "",
    enabled: !authLoading,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteContact(user.business_id!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toastSuccess("Contact deleted");
    },
    onError: (err) => {
      toastError(
        err instanceof Error ? err.message : "Failed to delete contact",
      );
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    deleteMutation.mutate(id);
  };

  if (authLoading || loading) return <PageLoader />;

  return (
    <ListPageLayout
      title="Contacts"
      subtitle={`${contacts.length} contact${contacts.length === 1 ? "" : "s"}`}
    >
      <ErrorAlert error={error} className="mb-6" />
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border-0 py-2.5 px-4 text-heading shadow-sm ring-1 ring-inset ring-[var(--color-ring-default)] focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-surface"
        >
          {CONTACT_TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <Link
          href="/contacts/new"
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
          Add Contact
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm p-12 text-center">
          <h3 className="text-lg font-bold text-heading mb-2">
            No contacts yet
          </h3>
          <p className="text-sm text-muted mb-6">
            Add customers, vendors, or employees.
          </p>
          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md"
          >
            Add Contact
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-edge-subtle shadow-sm overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-surface-secondary to-surface-tertiary border-b border-edge text-xs font-bold text-muted uppercase tracking-wider">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2"></div>
          </div>
          <div className="divide-y divide-edge-subtle">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/50 transition-all items-center"
              >
                <div className="col-span-3">
                  <p className="text-sm font-bold text-heading">
                    {contact.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${CONTACT_TYPE_COLORS[contact.contact_type] || "bg-surface-tertiary text-body"}`}
                  >
                    {contact.contact_type}
                  </span>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-body">
                    {contact.email || "\u2014"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-body">
                    {contact.phone || "\u2014"}
                  </p>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <Link
                    href={`/contacts/${contact.id}/edit`}
                    className="p-2 rounded-lg text-caption hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all"
                    title="Edit contact"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 rounded-lg text-caption hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                    title="Delete contact"
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ListPageLayout>
  );
}
