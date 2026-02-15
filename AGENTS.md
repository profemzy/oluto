# Oluto - AI Coding Agent Guide

> **"Financial Autopilot for the Modern Builder"**
>
> Oluto is a cashflow-first financial management platform for Canadian small businesses, featuring bank statement import, AI-powered categorization, and financial reporting.

---

## Project Overview

### Vision

Transition small business owners from reactive record-keeping to proactive financial mastery. Oluto means "the guide or regulator" — acting as an active Financial Copilot rather than a passive scribe.

### Target Market

- **Primary**: Canadian small business owners (sole proprietors + incorporated) across all provinces/territories
- **Secondary**: Independent bookkeepers/fractional CFOs managing 10-30 clients

### Architecture

- **Frontend:** TypeScript monorepo — Next.js 16 (web) + Expo/React Native (mobile, scaffolded)
- **Backend:** [LedgerForge](https://github.com/profemzy/ledger-forge) — Rust/Axum double-entry accounting API (separate repository)
- **Infrastructure:** AKS, Azure DevOps CI/CD, Terraform, Docker Compose

---

## Technology Stack

### Frontend (this repo)

| Component     | Technology                       |
| ------------- | -------------------------------- |
| Monorepo      | npm workspaces                   |
| Web App       | Next.js 16.1.6 + React 19        |
| Mobile App    | React Native + Expo (scaffolded) |
| Language      | TypeScript 5.0                   |
| CSS           | Tailwind CSS 4                   |
| Data Fetching | TanStack React Query 5.90        |
| Notifications | react-hot-toast 2.6              |
| Theme         | Dark/light mode with system sync |

### Backend (LedgerForge — separate repo)

| Component      | Technology                                          |
| -------------- | --------------------------------------------------- |
| Framework      | Axum (Rust)                                         |
| Database       | PostgreSQL, raw SQLx queries                        |
| Cache          | Redis                                               |
| Auth           | JWT (jsonwebtoken crate), Argon2                    |
| AI             | Fuelix (OpenAI-compatible) for CRA T2125 categories |
| PDF Processing | Mistral Document AI OCR via Azure                   |
| API Docs       | utoipa + Swagger UI                                 |

### Infrastructure

| Component          | Technology                                  |
| ------------------ | ------------------------------------------- |
| Containerization   | Docker + Docker Compose                     |
| Orchestration      | Azure Kubernetes Service (AKS)              |
| CI/CD              | Azure DevOps Pipelines                      |
| Container Registry | Azure Container Registry (ACR) — dev + prod |
| Secrets            | Azure Key Vault + ExternalSecrets Operator  |
| TLS                | cert-manager + Let's Encrypt                |
| Ingress            | ingress-nginx (path-based routing)          |
| IaC                | Terraform (separate repo)                   |
| Cache              | Redis 8.4.0-alpine                          |

---

## Build and Development Commands

### Full Stack (Docker Compose)

```bash
# Start all services (Redis, LedgerForge backend, Next.js frontend)
docker-compose up --build

# Access points:
# - Web App: http://localhost:3001
# - Backend API: http://localhost:3000
# - Swagger UI: http://localhost:3000/swagger-ui/
# - Health: http://localhost:3000/api/v1/health
```

### Frontend (Local Development)

```bash
# Install dependencies
npm install

# Run web app
npm run dev -w apps/web       # Next.js dev server on port 3001

# Build web app
npm run build -w apps/web

# Type checking
npx tsc --noEmit -p apps/web/tsconfig.json

# Lint
npm run lint -w apps/web
```

---

## Key Domain Concepts

### Multi-Tenant Architecture

- **Business** is the tenant/organization entity
- **Users** belong to a Business (via `business_id`, nullable until onboarding)
- All API calls scoped to the user's business
- Bookkeepers can manage multiple businesses (future feature)

### Transaction State Machine

```
draft → posted → void
```

### User Roles (LedgerForge)

- `Viewer(0)` — read-only
- `Accountant(1)` — standard operations
- `Admin(2)` — full access

### Canadian Tax Support

- Province-aware GST/HST/PST calculations
- All 13 provinces/territories supported
- Uses `Decimal` for precision

### AI Categorization

- Fuelix (OpenAI-compatible API) for CRA T2125 expense categories
- Single-vendor suggestions + batch categorization on import
- Graceful degradation when AI service is unavailable

---

## Frontend Architecture

### Page Structure (35 pages)

| Page             | Path                         | Description                                           |
| ---------------- | ---------------------------- | ----------------------------------------------------- |
| Landing          | `/`                          | Marketing page with hero, features, CTA               |
| Login            | `/auth/login`                | JWT authentication                                    |
| Register         | `/auth/register`             | User registration                                     |
| Forgot Password  | `/auth/forgot-password`      | Password reset                                        |
| Business Setup   | `/onboarding/setup-business` | Create business workspace                             |
| Dashboard        | `/dashboard`                 | Safe-to-Spend, revenue/expenses, cashflow, overdue items |
| Transactions     | `/transactions`              | List, filter, bulk status, inline status change       |
| New Transaction  | `/transactions/new`          | Create expense transaction form + receipt upload      |
| Edit Transaction | `/transactions/[id]/edit`    | Edit existing transaction + receipt upload             |
| Import           | `/transactions/import`       | CSV/PDF upload, preview, duplicate flagging, confirm  |
| Invoices         | `/invoices`                  | Invoice list with status filters                      |
| New Invoice      | `/invoices/new`              | Create invoice with line items                        |
| Invoice Detail   | `/invoices/[id]`             | View invoice detail + associated payments             |
| Bills            | `/bills`                     | Bill list with status filters                         |
| New Bill         | `/bills/new`                 | Create bill with line items                           |
| Bill Detail      | `/bills/[id]`                | View bill detail + line items + receipt uploads       |
| Payments         | `/payments`                  | Customer payment list                                 |
| New Payment      | `/payments/new`              | Create payment (apply to invoices)                    |
| New Bill Payment | `/payments/new/bill`         | Create bill payment (apply to bills)                  |
| Payment Detail   | `/payments/[id]`             | View payment detail                                   |
| Contacts         | `/contacts`                  | List with type tabs (All/Customers/Vendors/Employees) |
| New Contact      | `/contacts/new`              | Create contact form                                   |
| Edit Contact     | `/contacts/[id]/edit`        | Edit contact form                                     |
| Accounts         | `/accounts`                  | Chart of accounts list with type filter               |
| New Account      | `/accounts/new`              | Create account form                                   |
| Edit Account     | `/accounts/[id]/edit`        | Edit account form                                     |
| Reconciliation   | `/reconciliation`            | Bank reconciliation with match suggestions            |
| Reports Hub      | `/reports`                   | Report selection with date inputs                     |
| Trial Balance    | `/reports/trial-balance`     | Trial balance report                                  |
| Profit & Loss    | `/reports/profit-loss`       | Income statement                                      |
| Balance Sheet    | `/reports/balance-sheet`     | Balance sheet report                                  |
| AR Aging         | `/reports/ar-aging`          | Accounts receivable aging                             |
| Privacy          | `/privacy`                   | Privacy policy                                        |
| Terms            | `/terms`                     | Terms of service                                      |

### Key Frontend Patterns

- **`lib/api.ts`** — centralized API client (1,372 lines) with 100+ endpoints, 35+ TypeScript interfaces
- **`hooks/useAuth.ts`** — authentication check + redirect for protected pages
- **`hooks/useDataTable.ts`** — data table state management (sorting, filtering, pagination)
- **`components/ui/`** — shared components: `ErrorAlert`, `PageLoader`, `PageHeader`, `ListPageLayout`, `ErrorBoundary`, `Toast`, `ReceiptUploadSection`, `BillReceiptSection`
- **`lib/constants.ts`** — CRA T2125 categories, classification options, receipt constraints
- **`lib/format.ts`** — currency, date, file size, relative time formatters
- **`lib/status.ts`** — status enums + badge color schemes for all entity types
- **`lib/toast.ts`** — toast notification helpers (`toastError`, `toastSuccess`, etc.)
- **`components/Navigation.tsx`** — app navigation with Sales/Purchases/Reports dropdown groups
- **`components/ThemeProvider.tsx`** — dark/light mode with system color scheme sync
- **`components/QueryProvider.tsx`** — TanStack Query provider with cache invalidation patterns

### TypeScript Style

- Strict TypeScript configuration
- All API responses typed in `lib/api.ts`
- Use existing shared components and hooks — don't duplicate
- TanStack Query for all data fetching (`useQuery`/`useMutation`)
- Tailwind `dark:` variant for dark mode styling

---

## API Endpoints (LedgerForge — 80+ total)

### Authentication
- `POST /api/v1/auth/register` — User registration
- `POST /api/v1/auth/login` — Login (form-urlencoded)
- `POST /api/v1/auth/refresh` — Refresh access token
- `GET /api/v1/auth/me` — Current user profile

### Businesses
- `POST /api/v1/businesses` — Create business
- `GET /api/v1/businesses` — List accessible businesses
- `GET /api/v1/businesses/{id}` — Get business details
- `PATCH /api/v1/businesses/{id}` — Update business

### Transactions (business-scoped)
- `POST /api/v1/businesses/{id}/transactions` — Create transaction
- `GET /api/v1/businesses/{id}/transactions` — List (filterable by status, date, search)
- `GET /api/v1/businesses/{id}/transactions/{tid}` — Get transaction
- `PATCH /api/v1/businesses/{id}/transactions/{tid}` — Update transaction
- `DELETE /api/v1/businesses/{id}/transactions/{tid}` — Delete transaction
- `GET /api/v1/businesses/{id}/transactions/summary` — Dashboard summary
- `POST /api/v1/businesses/{id}/transactions/suggest-category` — AI category suggestion
- `PATCH /api/v1/businesses/{id}/transactions/bulk-status` — Bulk status update
- `GET /api/v1/businesses/{id}/transactions/duplicates` — Find duplicate transactions

### Import & Jobs
- `POST /api/v1/businesses/{id}/transactions/import/parse` — Parse CSV/PDF file
- `POST /api/v1/businesses/{id}/transactions/import/confirm` — Confirm and import
- `GET /api/v1/businesses/{id}/transactions/jobs/{job_id}` — Poll async job status

### Invoices
- `GET /api/v1/businesses/{id}/invoices` — List invoices
- `POST /api/v1/businesses/{id}/invoices` — Create invoice with line items
- `GET /api/v1/businesses/{id}/invoices/{iid}` — Get invoice with line items
- `PUT /api/v1/businesses/{id}/invoices/{iid}/status` — Update invoice status
- `GET /api/v1/businesses/{id}/invoices/overdue` — Get overdue invoices
- `GET /api/v1/businesses/{id}/customers/{cid}/invoices` — Get customer's invoices
- `GET /api/v1/businesses/{id}/invoices/{iid}/payments` — Get invoice payments

### Bills
- `GET /api/v1/businesses/{id}/bills` — List bills
- `POST /api/v1/businesses/{id}/bills` — Create bill with line items
- `GET /api/v1/businesses/{id}/bills/{bid}` — Get bill with line items
- `DELETE /api/v1/businesses/{id}/bills/{bid}` — Delete bill
- `PUT /api/v1/businesses/{id}/bills/{bid}/status` — Update bill status
- `GET /api/v1/businesses/{id}/bills/overdue` — Get overdue bills
- `GET /api/v1/businesses/{id}/vendors/{vid}/bills` — Get vendor's bills

### Payments
- `GET /api/v1/businesses/{id}/payments` — List payments
- `POST /api/v1/businesses/{id}/payments` — Create customer payment
- `GET /api/v1/businesses/{id}/payments/{pid}` — Get payment details
- `PUT /api/v1/businesses/{id}/payments/{pid}/apply` — Apply to invoices
- `GET /api/v1/businesses/{id}/payments/unapplied` — Get unapplied payments
- `POST /api/v1/businesses/{id}/bill-payments` — Create vendor bill payment

### Contacts (business-scoped)
- `GET /api/v1/businesses/{id}/contacts` — List contacts
- `POST /api/v1/businesses/{id}/contacts` — Create contact
- `GET /api/v1/businesses/{id}/contacts/customers` — List customers
- `GET /api/v1/businesses/{id}/contacts/vendors` — List vendors
- `GET /api/v1/businesses/{id}/contacts/employees` — List employees
- `GET /api/v1/businesses/{id}/contacts/{cid}` — Get contact
- `PUT /api/v1/businesses/{id}/contacts/{cid}` — Update contact
- `DELETE /api/v1/businesses/{id}/contacts/{cid}` — Delete contact

### Accounts (business-scoped)
- `GET /api/v1/businesses/{id}/accounts` — List accounts
- `POST /api/v1/businesses/{id}/accounts` — Create account
- `GET /api/v1/businesses/{id}/accounts/{aid}` — Get account
- `PUT /api/v1/businesses/{id}/accounts/{aid}` — Update account
- `DELETE /api/v1/businesses/{id}/accounts/{aid}` — Deactivate account

### Reconciliation
- `GET /api/v1/businesses/{id}/reconciliation/summary` — Summary
- `GET /api/v1/businesses/{id}/reconciliation/suggestions` — Match suggestions
- `GET /api/v1/businesses/{id}/reconciliation/unreconciled` — Unreconciled items
- `POST /api/v1/businesses/{id}/reconciliation/confirm` — Confirm match
- `POST /api/v1/businesses/{id}/reconciliation/reject` — Reject match
- `POST /api/v1/businesses/{id}/reconciliation/unlink` — Unlink match
- `POST /api/v1/businesses/{id}/reconciliation/auto` — Auto-reconcile
- `POST /api/v1/businesses/{id}/reconciliation/mark-reconciled` — Mark reconciled
- `POST /api/v1/businesses/{id}/reconciliation/mark-unreconciled` — Mark unreconciled

### Receipts & OCR
- `GET /api/v1/businesses/{id}/transactions/{tid}/receipts` — List receipts
- `POST /api/v1/businesses/{id}/transactions/{tid}/receipts` — Upload receipt
- `GET /api/v1/businesses/{id}/receipts/{rid}` — Get receipt
- `DELETE /api/v1/businesses/{id}/receipts/{rid}` — Delete receipt
- `GET /api/v1/businesses/{id}/receipts/{rid}/download` — Download receipt
- `POST /api/v1/businesses/{id}/receipts/extract-ocr` — Extract OCR only
- `GET /api/v1/businesses/{id}/bills/{bid}/receipts` — List bill receipts
- `POST /api/v1/businesses/{id}/bills/{bid}/receipts` — Upload bill receipt

### Reports
- `GET /api/v1/businesses/{id}/reports/trial-balance` — Trial balance
- `GET /api/v1/businesses/{id}/reports/profit-loss` — Profit & loss
- `GET /api/v1/businesses/{id}/reports/balance-sheet` — Balance sheet
- `GET /api/v1/businesses/{id}/reports/ar-aging` — AR aging

### Health & Docs
- `GET /api/v1/health` — Service health check (DB + Redis status)
- Swagger UI: `/swagger-ui/`
- OpenAPI JSON: `/api-docs/openapi.json`

---

## Deployment & Infrastructure

### Environments

| Env  | Domain          | AKS Cluster             | ACR                   |
| ---- | --------------- | ----------------------- | --------------------- |
| DEV  | `dev.oluto.app` | `wackopscoach-dev-aks`  | `wackopscoachdevacr`  |
| PROD | `oluto.app`     | `wackopscoach-prod-aks` | `wackopscoachprodacr` |

### Kubernetes Architecture

- **Namespace:** `oluto` on each cluster
- **Path-based ingress:** `/api/*`, `/swagger-ui/*`, `/api-docs/*` → `oluto-backend:80`; `/*` → `oluto-frontend:80`
- **TLS:** cert-manager + Let's Encrypt
- **Secrets:** ExternalSecrets Operator syncs Azure Key Vault → K8s `oluto-secret`
- **Redis:** In-cluster deployment per namespace
- **Migrations:** LedgerForge runs migrations automatically on startup

### CI/CD Flow

Two independent pipelines:

1. **Oluto (frontend):** Code push → CI builds frontend image → CD deploys all K8s manifests + updates frontend image tag → approve → PROD
2. **LedgerForge (backend):** Code push → CI builds backend image → CD updates backend deployment image → approve → PROD

### Environment Variables (K8s / Key Vault)

| Key Vault Secret        | K8s Env Var       | Used By |
| ----------------------- | ----------------- | ------- |
| `oluto-database-url`    | `DATABASE_URL`    | Backend |
| `oluto-jwt-secret`      | `JWT_SECRET`      | Backend |
| `oluto-fuelix-api-key`  | `FUELIX_API_KEY`  | Backend |
| `oluto-fuelix-base-url` | `FUELIX_BASE_URL` | Backend |
| `oluto-fuelix-model`    | `FUELIX_MODEL`    | Backend |
| `oluto-azure-api-key`   | `AZURE_API_KEY`   | Backend |
| `oluto-azure-ocr-url`   | `AZURE_OCR_URL`   | Backend |
| `oluto-azure-ocr-model` | `AZURE_OCR_MODEL` | Backend |

`REDIS_URL=redis://redis:6379` is set directly in K8s deployment manifests.

---

## Important Notes for AI Agents

1. **This is a frontend-only repo** — backend changes go in the LedgerForge repository (`../ledger-forge`)
2. **Use existing frontend patterns** — `useAuth` hook, shared UI components, `lib/api.ts` for API calls
3. **Use Decimal for money** — never use float for financial calculations
4. **Type everything** — all API responses and requests should be typed in `lib/api.ts`
5. **Follow existing page patterns** — new pages should follow the structure of existing pages (layout, error handling, loading states)
6. **Use TanStack Query** — all data fetching should use `useQuery`/`useMutation` with proper cache invalidation
7. **Dark mode support** — always include `dark:` Tailwind variants for new UI elements
8. **Status badge colors** — use `lib/status.ts` for consistent entity status styling
9. **Keep `concept.md` in sync** — if implementing features from the spec, note progress
10. **Test with type checking** — run `npx tsc --noEmit -p apps/web/tsconfig.json` to verify

---

## Contact & Resources

- **Product Spec**: See `concept.md` for detailed feature specifications
- **Backend Docs**: See LedgerForge repo `CLAUDE.md` for backend conventions
- **API Docs**: Swagger UI at `/swagger-ui/` when backend is running
