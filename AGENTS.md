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

| Component  | Technology                       |
| ---------- | -------------------------------- |
| Monorepo   | npm workspaces                   |
| Web App    | Next.js 16.1.6 + React 19        |
| Mobile App | React Native + Expo (scaffolded) |
| Language   | TypeScript 5.0                   |
| CSS        | Tailwind CSS 4                   |

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

### Page Structure

| Page             | Path                         | Description                                           |
| ---------------- | ---------------------------- | ----------------------------------------------------- |
| Landing          | `/`                          | Marketing page with hero, features, CTA               |
| Login            | `/auth/login`                | JWT authentication                                    |
| Register         | `/auth/register`             | User registration                                     |
| Business Setup   | `/onboarding/setup-business` | Create business workspace                             |
| Dashboard        | `/dashboard`                 | Safe-to-Spend, revenue/expenses, cashflow chart       |
| Transactions     | `/transactions`              | List, filter, bulk status, inline status change       |
| New Transaction  | `/transactions/new`          | Create transaction form                               |
| Edit Transaction | `/transactions/[id]/edit`    | Edit existing transaction                             |
| Import           | `/transactions/import`       | CSV/PDF upload, preview, confirm                      |
| Contacts         | `/contacts`                  | List with type tabs (All/Customers/Vendors/Employees) |
| New Contact      | `/contacts/new`              | Create contact form                                   |
| Edit Contact     | `/contacts/[id]/edit`        | Edit contact form                                     |
| Accounts         | `/accounts`                  | Chart of accounts list with type filter               |
| New Account      | `/accounts/new`              | Create account form                                   |
| Edit Account     | `/accounts/[id]/edit`        | Edit account form                                     |
| Bills            | `/bills`                     | List, filter, status management                       |
| New Bill         | `/bills/new`                 | Create bill form                                      |
| Edit Bill        | `/bills/[id]/edit`           | Edit existing bill                                    |
| Invoices         | `/invoices`                  | List, filter, status management                       |
| New Invoice      | `/invoices/new`              | Create invoice form                                   |
| Edit Invoice     | `/invoices/[id]/edit`        | Edit existing invoice                                 |
| Payments         | `/payments`                  | List, filter, apply to bills                          |
| New Payment      | `/payments/new`              | Record payment form                                   |
| Edit Payment     | `/payments/[id]/edit`        | Edit existing payment                                 |
| Reconciliation   | `/reconciliation`            | Bank statement reconciliation                         |
| Reports Hub      | `/reports`                   | Report selection with date inputs                     |
| Trial Balance    | `/reports/trial-balance`     | Trial balance report                                  |
| Profit & Loss    | `/reports/profit-loss`       | Income statement                                      |
| Balance Sheet    | `/reports/balance-sheet`     | Balance sheet report                                  |
| AR Aging         | `/reports/ar-aging`          | Accounts receivable aging                             |

### Key Frontend Patterns

- **`lib/api.ts`** — centralized API client with all backend calls, typed request/response DTOs
- **`hooks/useAuth.ts`** — authentication check + redirect for protected pages
- **`components/ui/`** — shared components: `ErrorAlert`, `PageLoader`, `PageHeader`
- **`lib/constants.ts`** — CRA T2125 categories, status labels
- **`lib/format.ts`** — currency formatting, date formatting
- **`components/Navigation.tsx`** — app navigation with links to all sections

### TypeScript Style

- Strict TypeScript configuration
- All API responses typed
- Use existing shared components and hooks — don't duplicate

---

## API Endpoints (LedgerForge)

### Authentication

- `POST /api/v1/auth/register` — User registration
- `POST /api/v1/auth/login` — Login (form-urlencoded)
- `GET /api/v1/auth/me` — Current user profile

### Businesses

- `POST /api/v1/businesses` — Create business
- `GET /api/v1/businesses` — List accessible businesses

### Transactions (business-scoped)

- `POST /api/v1/businesses/{id}/transactions` — Create transaction
- `GET /api/v1/businesses/{id}/transactions` — List (filterable by status, date, search)
- `GET /api/v1/businesses/{id}/transactions/{txn_id}` — Get transaction
- `PATCH /api/v1/businesses/{id}/transactions/{txn_id}` — Update transaction
- `DELETE /api/v1/businesses/{id}/transactions/{txn_id}` — Delete transaction
- `GET /api/v1/businesses/{id}/transactions/summary` — Dashboard summary
- `POST /api/v1/businesses/{id}/transactions/suggest-category` — AI category suggestion
- `PATCH /api/v1/businesses/{id}/transactions/bulk-status` — Bulk status update

### Import

- `POST /api/v1/businesses/{id}/transactions/import/parse` — Parse CSV/PDF file
- `POST /api/v1/businesses/{id}/transactions/import/confirm` — Confirm and import

### Jobs

- `GET /api/v1/businesses/{id}/transactions/jobs/{job_id}` — Poll async job status (PDF import)

### Contacts

- `GET/POST /api/v1/contacts` — List/create contacts
- `GET/PUT/DELETE /api/v1/contacts/{id}` — Contact CRUD
- `GET /api/v1/contacts/customers` — Filter by type
- `GET /api/v1/contacts/vendors`
- `GET /api/v1/contacts/employees`

### Accounts

- `GET/POST /api/v1/accounts` — List/create accounts
- `GET/PUT/DELETE /api/v1/accounts/{id}` — Account CRUD

### Reports

- `GET /api/v1/reports/trial-balance` — Trial balance
- `GET /api/v1/reports/profit-loss` — Profit & loss
- `GET /api/v1/reports/balance-sheet` — Balance sheet
- `GET /api/v1/reports/ar-aging` — AR aging

### Health & Docs

- `GET /health` — Service health check
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

1. **This is a frontend-only repo** — backend changes go in the LedgerForge repository
2. **Use existing frontend patterns** — `useAuth` hook, shared UI components, `lib/api.ts` for API calls
3. **Use Decimal for money** — never use float for financial calculations
4. **Type everything** — all API responses and requests should be typed in `lib/api.ts`
5. **Follow existing page patterns** — new pages should follow the structure of existing pages (layout, error handling, loading states)
6. **Keep `concept.md` in sync** — if implementing features from the spec, note progress
7. **Test with type checking** — run `npx tsc --noEmit -p apps/web/tsconfig.json` to verify

---

## Contact & Resources

- **Product Spec**: See `concept.md` for detailed feature specifications
- **Backend Docs**: See LedgerForge repo `CLAUDE.md` for backend conventions
- **API Docs**: Swagger UI at `/swagger-ui/` when backend is running
