"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Contact } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { PageLoader, PageHeader, ErrorAlert } from "@/app/components";

const TYPE_FILTERS = [
  { value: "", label: "All Contacts" },
  { value: "Customer", label: "Customers" },
  { value: "Vendor", label: "Vendors" },
  { value: "Employee", label: "Employees" },
];

const TYPE_COLORS: Record<string, string> = {
  Customer: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Vendor: "bg-amber-50 text-amber-700 ring-amber-200",
  Employee: "bg-purple-50 text-purple-700 ring-purple-200",
};

export default function ContactsPage() {
  const { loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        let data: Contact[];
        if (typeFilter === "Customer") data = await api.getCustomers();
        else if (typeFilter === "Vendor") data = await api.getVendors();
        else if (typeFilter === "Employee") data = await api.getEmployees();
        else data = await api.listContacts();
        setContacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    load();
  }, [typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await api.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete contact");
    }
  };

  if (authLoading || loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} contact${contacts.length === 1 ? "" : "s"}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <ErrorAlert error={error} className="mb-6" />
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm bg-white"
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <Link
            href="/contacts/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Contact
          </Link>
        </div>

        {contacts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No contacts yet</h3>
            <p className="text-sm text-gray-500 mb-6">Add customers, vendors, or employees.</p>
            <Link href="/contacts/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md">
              Add Contact
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {contacts.map((contact) => (
                <div key={contact.id} className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-cyan-50/50 transition-all items-center">
                  <div className="col-span-3">
                    <p className="text-sm font-bold text-gray-900">{contact.name}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${TYPE_COLORS[contact.contact_type] || "bg-gray-100 text-gray-700"}`}>
                      {contact.contact_type}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600">{contact.email || "\u2014"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">{contact.phone || "\u2014"}</p>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Link
                      href={`/contacts/${contact.id}/edit`}
                      className="p-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                      title="Edit contact"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete contact"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
