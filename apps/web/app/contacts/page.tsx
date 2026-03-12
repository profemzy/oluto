"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { ListSkeleton, ErrorAlert, ListPageLayout, DataTable, DataTableColumn, DataTableAction } from "@/app/components";
import { useDataTable } from "@/app/hooks/useDataTable";
import { toastError, toastSuccess } from "@/app/lib/toast";
import { CONTACT_TYPE_COLORS, CONTACT_TYPE_FILTERS } from "@/app/lib/status";

export default function ContactsPage() {
  const { loading: authLoading, user, canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const listContacts = (params?: Record<string, string>) => {
    const type = params?.type;
    if (!user?.business_id) return Promise.resolve([]);
    if (type === "Customer") return api.getCustomers(user.business_id);
    if (type === "Vendor") return api.getVendors(user.business_id);
    if (type === "Employee") return api.getEmployees(user.business_id);
    return api.listContacts(user.business_id);
  };

  const {
    data: contacts,
    loading,
    error,
    filter: typeFilter,
    setFilter: setTypeFilter,
  } = useDataTable<Contact>({
    queryKey: ["contacts", user?.business_id],
    queryFn: listContacts,
    filterParam: "type",
    defaultFilter: "",
    enabled: !authLoading && !!user?.business_id,
  });

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery || !contacts) return contacts || [];
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteContact(user!.business_id!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toastSuccess("Contact deleted");
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to delete contact");
    },
  });

  // Define table columns
  const columns: DataTableColumn<Contact>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        width: "1.5fr",
        sortable: true,
        render: (contact) => (
          <span className="font-semibold text-heading">{contact.name}</span>
        ),
      },
      {
        key: "contact_type",
        header: "Type",
        width: "120px",
        sortable: true,
        render: (contact) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
              CONTACT_TYPE_COLORS[contact.contact_type] || "bg-surface-tertiary text-body"
            }`}
          >
            {contact.contact_type}
          </span>
        ),
      },
      {
        key: "email",
        header: "Email",
        width: "1.5fr",
        sortable: true,
        render: (contact) => (
          <span className="text-sm text-body">{contact.email || "—"}</span>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        width: "1fr",
        sortable: true,
        render: (contact) => (
          <span className="text-sm text-body">{contact.phone || "—"}</span>
        ),
      },
    ],
    []
  );

  // Define table actions
  const actions: DataTableAction<Contact>[] = useMemo(
    () => [
      {
        key: "edit",
        label: "Edit contact",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        href: (contact) => `/contacts/${contact.id}/edit`,
        variant: "primary",
      },
      {
        key: "delete",
        label: "Delete contact",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: (contact) => {
          if (confirm("Are you sure you want to delete this contact?")) {
            deleteMutation.mutate(contact.id);
          }
        },
        variant: "danger",
      },
    ],
    [deleteMutation]
  );

  if (authLoading || loading) {
    return <ListSkeleton title="Contacts" actionButton rowCount={6} />;
  }

  return (
    <ListPageLayout
      title="Contacts"
      subtitle={`${filteredContacts.length} contact${filteredContacts.length === 1 ? "" : "s"}`}
    >
      <ErrorAlert error={error} className="mb-6" />

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
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
          {typeFilter && (
            <button
              onClick={() => setTypeFilter("")}
              className="text-sm text-muted hover:text-heading transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {canWrite && (
          <Link
            href="/contacts/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Contact
          </Link>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredContacts}
        keyExtractor={(contact) => contact.id}
        actions={canWrite ? actions : []}
        searchFields={["name", "email", "phone"]}
        searchPlaceholder="Search by name, email, or phone..."
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        loading={loading}
        pageSize={25}
        emptyState={{
          title: "No contacts yet",
          description: canWrite ? "Add customers, vendors, or employees." : "No contacts have been added yet.",
          action: canWrite ? { label: "Add Contact", href: "/contacts/new" } : undefined,
        }}
        noResultsState={{
          title: "No contacts match your search",
          description: "Try adjusting your search terms.",
          onClearFilters: () => setSearchQuery(""),
        }}
      />
    </ListPageLayout>
  );
}
