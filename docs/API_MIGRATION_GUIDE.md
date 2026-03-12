# API Client Migration Guide

**Date:** March 11, 2026  
**Status:** In Progress  
**Breaking Change:** Yes — requires updating all API calls

---

## Overview

The API client has been refactored from a single 1,600+ line file (`apps/web/app/lib/api.ts`) into a modular structure organized by domain. This improves:

- **Maintainability** — Easier to find and update endpoints
- **IDE Performance** — Faster type checking and autocomplete
- **Tree Shaking** — Smaller bundle sizes
- **Testing** — Isolated domain testing

---

## New Structure

```
apps/web/app/lib/api/
├── index.ts              # Main export, unified API client
├── client.ts             # Base API client (fetch, error handling)
├── types.ts              # All TypeScript interfaces
├── auth.ts               # Authentication endpoints
├── businesses.ts         # Business management
├── transactions.ts       # Transactions + import
├── contacts.ts           # Customers, vendors, employees
├── accounts.ts           # Chart of accounts
├── invoices.ts           # Accounts receivable
├── bills.ts              # Accounts payable
├── payments.ts           # Customer + vendor payments
├── receipts.ts           # Receipt upload + OCR
├── reports.ts            # Financial statements
├── reconciliation.ts     # Bank reconciliation
├── chat.ts               # AI chat conversations
└── quickbooks.ts         # QuickBooks import
```

---

## Migration Examples

### Before (Old API)

```typescript
import { api } from '@/app/lib/api';

// Get current user
const user = await api.getCurrentUser();

// List transactions
const transactions = await api.listTransactions(businessId, { status: 'posted' });

// Get business
const business = await api.getBusiness(businessId);

// Create invoice
const invoice = await api.createInvoice(businessId, invoiceData);
```

### After (New Modular API)

```typescript
import { api } from '@/app/lib/api';

// Get current user
const user = await api.auth.getCurrentUser();

// List transactions
const transactions = await api.transactions.list(businessId, { status: 'posted' });

// Get business
const business = await api.businesses.getBusiness(businessId);

// Create invoice
const invoice = await api.invoices.create(businessId, invoiceData);
```

---

## Method Name Changes

| Old Method | New Method | Module |
|------------|------------|--------|
| `api.getCurrentUser()` | `api.auth.getCurrentUser()` | auth |
| `api.createBusiness()` | `api.businesses.create()` | businesses |
| `api.listBusinesses()` | `api.businesses.list()` | businesses |
| `api.getBusiness()` | `api.businesses.get()` | businesses |
| `api.updateBusiness()` | `api.businesses.update()` | businesses |
| `api.createTransaction()` | `api.transactions.create()` | transactions |
| `api.listTransactions()` | `api.transactions.list()` | transactions |
| `api.getTransaction()` | `api.transactions.get()` | transactions |
| `api.updateTransaction()` | `api.transactions.update()` | transactions |
| `api.deleteTransaction()` | `api.transactions.delete()` | transactions |
| `api.getDashboardSummary()` | `api.transactions.getDashboardSummary()` | transactions |
| `api.parseImportFile()` | `api.transactions.parseImportFile()` | transactions |
| `api.confirmImport()` | `api.transactions.confirmImport()` | transactions |
| `api.suggestCategory()` | `api.transactions.suggestCategory()` | transactions |
| `api.bulkUpdateStatus()` | `api.transactions.bulkUpdateStatus()` | transactions |
| `api.getJobStatus()` | `api.transactions.getJobStatus()` | transactions |
| `api.findDuplicates()` | `api.transactions.findDuplicates()` | transactions |
| `api.listContacts()` | `api.contacts.list()` | contacts |
| `api.getCustomers()` | `api.contacts.getCustomers()` | contacts |
| `api.getVendors()` | `api.contacts.getVendors()` | contacts |
| `api.getEmployees()` | `api.contacts.getEmployees()` | contacts |
| `api.getContact()` | `api.contacts.get()` | contacts |
| `api.createContact()` | `api.contacts.create()` | contacts |
| `api.updateContact()` | `api.contacts.update()` | contacts |
| `api.deleteContact()` | `api.contacts.delete()` | contacts |
| `api.listAccounts()` | `api.accounts.list()` | accounts |
| `api.getAccount()` | `api.accounts.get()` | accounts |
| `api.createAccount()` | `api.accounts.create()` | accounts |
| `api.updateAccount()` | `api.accounts.update()` | accounts |
| `api.deactivateAccount()` | `api.accounts.deactivate()` | accounts |
| `api.listInvoices()` | `api.invoices.list()` | invoices |
| `api.getInvoice()` | `api.invoices.get()` | invoices |
| `api.createInvoice()` | `api.invoices.create()` | invoices |
| `api.updateInvoiceStatus()` | `api.invoices.updateStatus()` | invoices |
| `api.getOverdueInvoices()` | `api.invoices.getOverdue()` | invoices |
| `api.getCustomerInvoices()` | `api.invoices.getCustomerInvoices()` | invoices |
| `api.getInvoicePayments()` | `api.invoices.getPayments()` | invoices |
| `api.listBills()` | `api.bills.list()` | bills |
| `api.getBill()` | `api.bills.get()` | bills |
| `api.createBill()` | `api.bills.create()` | bills |
| `api.updateBillStatus()` | `api.bills.updateStatus()` | bills |
| `api.deleteBill()` | `api.bills.delete()` | bills |
| `api.getOverdueBills()` | `api.bills.getOverdue()` | bills |
| `api.getVendorBills()` | `api.bills.getVendorBills()` | bills |
| `api.listPayments()` | `api.payments.list()` | payments |
| `api.getPayment()` | `api.payments.get()` | payments |
| `api.createPayment()` | `api.payments.create()` | payments |
| `api.applyPayment()` | `api.payments.apply()` | payments |
| `api.getUnappliedPayments()` | `api.payments.getUnapplied()` | payments |
| `api.createBillPayment()` | `api.payments.createBillPayment()` | payments |
| `api.uploadReceipt()` | `api.receipts.uploadReceipt()` | receipts |
| `api.listReceipts()` | `api.receipts.list()` | receipts |
| `api.getReceipt()` | `api.receipts.get()` | receipts |
| `api.deleteReceipt()` | `api.receipts.delete()` | receipts |
| `api.getReceiptDownloadUrl()` | `api.receipts.getDownloadUrl()` | receipts |
| `api.uploadBillReceipt()` | `api.receipts.uploadBillReceipt()` | receipts |
| `api.listBillReceipts()` | `api.receipts.listBillReceipts()` | receipts |
| `api.extractOcrFromReceipt()` | `api.receipts.extractOcr()` | receipts |
| `api.getTrialBalance()` | `api.reports.getTrialBalance()` | reports |
| `api.getProfitLoss()` | `api.reports.getProfitLoss()` | reports |
| `api.getBalanceSheet()` | `api.reports.getBalanceSheet()` | reports |
| `api.getArAging()` | `api.reports.getArAging()` | reports |
| `api.getReconciliationSummary()` | `api.reconciliation.getSummary()` | reconciliation |
| `api.getReconciliationSuggestions()` | `api.reconciliation.getSuggestions()` | reconciliation |
| `api.getUnreconciledTransactions()` | `api.reconciliation.getUnreconciled()` | reconciliation |
| `api.confirmMatch()` | `api.reconciliation.confirmMatch()` | reconciliation |
| `api.rejectMatch()` | `api.reconciliation.rejectMatch()` | reconciliation |
| `api.unlinkMatch()` | `api.reconciliation.unlinkMatch()` | reconciliation |
| `api.autoReconcile()` | `api.reconciliation.autoReconcile()` | reconciliation |
| `api.markReconciled()` | `api.reconciliation.markReconciled()` | reconciliation |
| `api.markUnreconciled()` | `api.reconciliation.markUnreconciled()` | reconciliation |
| `api.findDuplicates()` | `api.reconciliation.findDuplicates()` | reconciliation |
| `api.listConversations()` | `api.chat.listConversations()` | chat |
| `api.createConversation()` | `api.chat.createConversation()` | chat |
| `api.updateConversation()` | `api.chat.updateConversation()` | chat |
| `api.deleteConversation()` | `api.chat.deleteConversation()` | chat |
| `api.listMessages()` | `api.chat.listMessages()` | chat |
| `api.createMessage()` | `api.chat.createMessage()` | chat |
| `api.deleteMessage()` | `api.chat.deleteMessage()` | chat |
| `api.sendChatMessage()` | `api.chat.sendChatMessage()` | chat |
| `api.sendChatMessageWithFile()` | `api.chat.sendChatMessageWithFile()` | chat |
| `api.parseQuickBooksImport()` | `api.quickbooks.parseImport()` | quickbooks |
| `api.confirmQuickBooksImport()` | `api.quickbooks.confirmImport()` | quickbooks |

---

## Backward Compatibility

A backward compatibility layer exists in `apps/web/app/lib/api.ts` that re-exports from the modular structure. However, **this will be removed in a future version**. All code should migrate to the new API.

---

## Migration Checklist

- [ ] `apps/web/app/accounts/` — Update account API calls
- [ ] `apps/web/app/bills/` — Update bill API calls
- [ ] `apps/web/app/chat/` — Update chat API calls
- [ ] `apps/web/app/contacts/` — Update contact API calls
- [ ] `apps/web/app/dashboard/` — Update dashboard API calls
- [ ] `apps/web/app/invoices/` — Update invoice API calls
- [ ] `apps/web/app/onboarding/` — Update business API calls
- [ ] `apps/web/app/payments/` — Update payment API calls
- [ ] `apps/web/app/reconciliation/` — Update reconciliation API calls
- [ ] `apps/web/app/reports/` — Update report API calls
- [ ] `apps/web/app/transactions/` — Update transaction API calls
- [ ] `apps/web/app/hooks/` — Update hook API calls
- [ ] `apps/web/app/components/` — Update component API calls
- [ ] `apps/web/test/` — Update test API calls

---

## Testing After Migration

After updating each module, run:

```bash
# Type check
npx tsc --noEmit -p apps/web/tsconfig.json

# Run tests
npm run test -w apps/web

# Build
npm run build -w apps/web
```

---

## Rollback Plan

If issues are found:

1. Revert the modular API structure
2. Restore the original `api.ts` from git history
3. Update tests to use the old API

```bash
git checkout HEAD~1 -- apps/web/app/lib/api.ts
```

---

## Questions?

See `docs/CODE_REVIEW_PROGRESS.md` for the full implementation status.
