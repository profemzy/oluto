"use client";

import { useMemo, useState } from "react";
import type {
  ApprovalRequestResponse,
  ArtifactResponse,
  InputRequestResponse,
} from "@/app/lib/generated/agent-api";
import type { Account } from "@/app/lib/api/types";

type ReviewSelection = {
  accepted: true;
  expense_account_id: string;
  payment_account_id: string;
  gst_hst_account_id: string | null;
  pst_account_id: string | null;
  qst_account_id: string | null;
};

export function ReceiptReviewDialog({
  request,
  accounts,
  submitting,
  onSubmit,
  onCancel,
}: {
  request: InputRequestResponse;
  accounts: Account[];
  submitting: boolean;
  onSubmit: (selection: ReviewSelection) => void;
  onCancel: () => void;
}) {
  const extraction = request.safe_context.extraction as Record<string, unknown>;
  const activeAccounts = useMemo(() => accounts.filter((account) => account.is_active), [accounts]);
  const expenseAccounts = activeAccounts.filter((account) => account.account_type === "Expense");
  const paymentAccounts = activeAccounts.filter((account) =>
    ["Asset", "Liability"].includes(account.account_type)
  );
  const taxAccounts = activeAccounts.filter((account) => account.account_type === "Asset");
  const [expense, setExpense] = useState("");
  const [payment, setPayment] = useState("");
  const [gstHst, setGstHst] = useState("");
  const [pst, setPst] = useState("");
  const [qst, setQst] = useState("");
  const taxRequired = (field: string) => Number(extraction[field] ?? 0) > 0;
  const selected = [expense, payment, gstHst, pst, qst].filter(Boolean);
  const valid =
    Boolean(expense && payment) &&
    (!taxRequired("gst_hst") || Boolean(gstHst)) &&
    (!taxRequired("pst") || Boolean(pst)) &&
    (!taxRequired("qst") || Boolean(qst)) &&
    new Set(selected).size === selected.length;

  return (
    <Dialog title="Review receipt details" onCancel={onCancel}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-900">
        <ReceiptField label="Vendor" value={extraction.vendor_name} />
        <ReceiptField label="Date" value={extraction.transaction_date} />
        <ReceiptField label="Subtotal" value={money(extraction.subtotal)} />
        <ReceiptField label="Discount" value={money(extraction.discount)} />
        <ReceiptField label="GST/HST" value={money(extraction.gst_hst)} />
        <ReceiptField label="PST" value={money(extraction.pst)} />
        <ReceiptField label="QST" value={money(extraction.qst)} />
        <ReceiptField label="Total" value={money(extraction.total)} strong />
      </dl>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        Confirm the exact ledger accounts. Oluto will prepare a proposal only. Nothing is recorded
        until you approve it separately.
      </p>
      <div className="mt-4 space-y-3">
        <AccountSelect
          label="Expense account"
          value={expense}
          onChange={setExpense}
          accounts={expenseAccounts}
        />
        <AccountSelect
          label="Paid from account"
          value={payment}
          onChange={setPayment}
          accounts={paymentAccounts}
        />
        {taxRequired("gst_hst") && (
          <AccountSelect
            label="GST/HST recoverable account"
            value={gstHst}
            onChange={setGstHst}
            accounts={taxAccounts}
          />
        )}
        {taxRequired("pst") && (
          <AccountSelect
            label="PST recoverable account"
            value={pst}
            onChange={setPst}
            accounts={taxAccounts}
          />
        )}
        {taxRequired("qst") && (
          <AccountSelect
            label="QST recoverable account"
            value={qst}
            onChange={setQst}
            accounts={taxAccounts}
          />
        )}
      </div>
      {selected.length !== new Set(selected).size && (
        <p className="mt-2 text-sm font-medium text-red-600">
          Choose a different account for each journal line.
        </p>
      )}
      <DialogActions
        primaryLabel="Prepare proposal"
        primaryDisabled={!valid || submitting}
        onPrimary={() =>
          onSubmit({
            accepted: true,
            expense_account_id: expense,
            payment_account_id: payment,
            gst_hst_account_id: taxRequired("gst_hst") ? gstHst : null,
            pst_account_id: taxRequired("pst") ? pst : null,
            qst_account_id: taxRequired("qst") ? qst : null,
          })
        }
        onCancel={onCancel}
      />
    </Dialog>
  );
}

export function ReceiptApprovalDialog({
  request,
  artifact,
  submitting,
  onDecide,
}: {
  request: ApprovalRequestResponse;
  artifact: ArtifactResponse;
  submitting: boolean;
  onDecide: (decision: "approve" | "reject") => void;
}) {
  const journal = (artifact.inline_content as Record<string, unknown>)?.journal as
    | Record<string, unknown>
    | undefined;
  const lines = Array.isArray(journal?.line_items)
    ? (journal.line_items as Array<Record<string, unknown>>)
    : [];
  return (
    <Dialog title="Approve journal entry">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        Approval creates a real financial entry. Review every amount before continuing.
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <p className="font-semibold text-gray-900 dark:text-white">
          {String(journal?.description ?? "Receipt journal")}
        </p>
        <p className="text-gray-500">{String(journal?.transaction_date ?? "")}</p>
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"
          >
            <span>{String(line.description ?? line.account_id ?? "Journal line")}</span>
            <span>Dr {money(line.debit_amount)}</span>
            <span>Cr {money(line.credit_amount)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={() => onDecide("reject")}
          aria-label="Reject journal proposal"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Reject
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => onDecide("approve")}
          aria-label="Approve and record journal entry"
          className="rounded-lg bg-[#087E78] dark:bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-[#066762] dark:hover:bg-teal-500 disabled:opacity-50 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
        >
          Approve and record
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">Proposal {request.ledgerforge_proposal_id}</p>
    </Dialog>
  );
}

function Dialog({
  title,
  children,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  onCancel?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-dialog-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#12121d]">
        <div className="flex items-center justify-between gap-4">
          <h2 id="receipt-dialog-title" className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close dialog"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            >
              ✕
            </button>
          )}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function DialogActions({
  primaryLabel,
  primaryDisabled,
  onPrimary,
  onCancel,
}: {
  primaryLabel: string;
  primaryDisabled: boolean;
  onPrimary: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel receipt run"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-700 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
      >
        Cancel Run
      </button>
      <button
        type="button"
        disabled={primaryDisabled}
        onClick={onPrimary}
        aria-label={primaryLabel}
        className="rounded-lg bg-[#087E78] dark:bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-[#066762] dark:hover:bg-teal-500 disabled:opacity-50 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
      >
        {primaryLabel}
      </button>
    </div>
  );
}

function AccountSelect({
  label,
  value,
  onChange,
  accounts,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accounts: Account[];
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        required
      >
        <option value="">Select an account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.code ? `${account.code} - ` : ""}
            {account.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReceiptField({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: unknown;
  strong?: boolean;
}) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={
          strong ? "font-bold text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-100"
        }
      >
        {String(value ?? "")}
      </dd>
    </div>
  );
}

function money(value: unknown): string {
  const normalized = String(value ?? "0.00");
  return normalized === "0.00" ? "$0.00" : `$${normalized}`;
}
