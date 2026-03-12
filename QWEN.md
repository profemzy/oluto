# Oluto - AI Agent Context Guide

> **"Financial Autopilot for the Modern Builder"**
>
> Oluto is a cashflow-first financial management platform for Canadian small businesses.

---

## Project Overview

**Oluto** is a TypeScript/Next.js frontend repository for a Canadian small business financial management platform. It provides bank statement import (CSV/PDF), AI-powered categorization, invoicing, bill management, and financial reporting with province-aware GST/HST/PST tax calculations.

### Architecture

| Layer | Technology | Repository |
|-------|-----------|------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 | This repo (`oluto/`) |
| **Backend** | LedgerForge — Rust/Axum double-entry accounting API | `../ledger-forge` |
| **AI Gateway** | ZeroClaw — Rust/Axum agent gateway | `../zeroclaw/` |
| **Desktop App** | Tauri + React | `../oluto-desktop/` |
| **Infrastructure** | AKS, Azure DevOps CI/CD, Terraform, Docker Compose | This repo (`k8s/`, `azure-pipelines/`) |

### Key Differentiators

1. **Cashflow-first UX** — "Safe-to-Spend" metric as the primary dashboard feature
2. **Canadian-native** — Province-aware GST/HST/PST for all 13 provinces/territories
3. **Trust-first AI** — AI categorization with confidence scoring, exceptions routing, and immutable audit logs
4. **Bookkeeper channel** — Multi-tenant operations designed for bookkeepers managing 10-30 clients
5. **Mobile-first** — Optimized for service professionals working in the field

---

## Quick Start

### Full Stack (Recommended for Local Development)

```bash
# Clone and start all services (Keycloak + LedgerForge + Frontend + Redis)
git clone <repo-url> && cd oluto
docker-compose up --build
```

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3001 | Next.js frontend |
| API | http://localhost:3000 | LedgerForge backend |
| Swagger UI | http://localhost:3000/swagger-ui/ | API documentation |
| Keycloak | http://localhost:8080 | OIDC authentication |
| Health | http://localhost:3000/api/v1/health | Backend health check |

> **Data persistence:** `docker-compose down` preserves data. `docker-compose down -v` **deletes all data**.

### Frontend Only

```bash
npm install
npm run dev -w apps/web    # Next.js dev server on port 3001
```

> Requires LedgerForge backend running at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` to override.

---

## Project Structure

```
oluto/
├── apps/
│   ├── web/                     # Next.js application (main codebase)
│   │   ├── app/
│   │   │   ├── auth/            # Login/Register/Forgot Password → Keycloak redirect
│   │   │   ├── dashboard/       # Safe-to-Spend, cashflow, overdue items
│   │   │   ├── onboarding/      # Business workspace setup
│   │   │   ├── transactions/    # CRUD, import (CSV/PDF), bulk operations
│   │   │   ├── invoices/        # AR: create, list, detail, payments
│   │   │   ├── bills/           # AP: create, list, detail, receipts
│   │   │   ├── payments/        # Customer + vendor bill payments
│   │   │   ├── contacts/        # Customers/Vendors/Employees CRUD
│   │   │   ├── accounts/        # Chart of accounts
│   │   │   ├── reconciliation/  # Bank reconciliation UI
│   │   │   ├── reports/         # Trial balance, P&L, Balance sheet, AR aging
│   │   │   ├── chat/            # AI chat with ZeroClaw agent
│   │   │   ├── gateway/         # API routes (chat proxy to ZeroClaw)
│   │   │   ├── components/      # Shared UI, Navigation, ThemeProvider
│   │   │   ├── hooks/           # useAuth, useDataTable
│   │   │   ├── lib/             # API client, constants, formatters, status
│   │   │   └── sections/        # Landing page sections
│   │   ├── Dockerfile
│   │   └── package.json
│   └── mobile/                  # React Native / Expo (scaffolded)
├── k8s/
│   ├── dev/                     # DEV Kubernetes manifests
│   ├── prod/                    # PROD Kubernetes manifests (2 replicas)
│   └── external-secrets/        # Azure Key Vault → K8s secret sync
├── azure-pipelines/             # Azure DevOps CI/CD definitions
├── keycloak/                    # OIDC realm + custom theme
│   ├── oluto-realm.json         # Realm import (clients, roles, mappers)
│   └── themes/oluto/            # Custom login theme (FreeMarker + CSS)
├── docker-compose.yml           # Full stack orchestration
├── concept.md                   # Product specification (v1.5)
├── AGENTS.md                    # Agent instructions
└── CLAUDE.md                    # Developer guide
```

---

## Technology Stack

### Frontend

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.1.6 + React 19 |
| Language | TypeScript 5.0 (`strict: false`) |
| Styling | Tailwind CSS 4 |
| State | TanStack React Query 5.90 |
| Notifications | react-hot-toast 2.6 |
| Validation | Zod |
| Testing | Vitest + Testing Library |
| Package Manager | npm workspaces |

### Backend (LedgerForge)

| Category | Technology |
|----------|-----------|
| Framework | Axum (Rust) |
| Database | PostgreSQL 17 (raw SQLx queries) |
| Cache | Redis 8 |
| Auth | Keycloak OIDC (PKCE) + JWT validation |
| AI | Fuelix (OpenAI-compatible) for CRA T2125 categories |
| OCR | Mistral Document AI via Azure |
| Docs | utoipa + Swagger UI |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| Orchestration | Azure Kubernetes Service (AKS) |
| CI/CD | Azure DevOps Pipelines |
| Container Registry | Azure Container Registry (ACR) |
| Secrets | Azure Key Vault + ExternalSecrets Operator |
| TLS | cert-manager + Let's Encrypt |
| Ingress | ingress-nginx (path-based routing) |

---

## Key Features

### Authentication & Multi-Tenancy

- **Keycloak OIDC** with PKCE authorization code flow
- **Business-scoped** — all API calls require `business_id`
- **User roles:** Viewer(0), Accountant(1), Admin(2)
- **Hosted login pages** — custom Oluto theme on Keycloak

### Transactions

- **CRUD operations** with status workflow: `draft → posted → void`
- **Bank import:** CSV (BMO, TD, RBC, Scotiabank auto-detection) + PDF (Mistral OCR)
- **AI categorization:** CRA T2125 expense categories via Fuelix
- **Bulk operations:** Status updates by transaction IDs or import batch
- **Receipt upload:** Attach receipts with OCR extraction (vendor, amount, date, tax)
- **Duplicate detection:** Flag potential duplicates on import

### Invoicing & Bills (AR/AP)

- **Invoices:** Create with line items, status tracking, customer payments
- **Bills:** Create with line items, status tracking, vendor payments, receipt uploads
- **Payments:** Apply customer payments to invoices, vendor bill payments
- **Overdue tracking:** Dashboard alerts for overdue invoices/bills

### Financial Management

- **Dashboard:** Safe-to-Spend, revenue/expenses, tax reserved, receivables/payables, AR aging
- **Chart of Accounts:** Hierarchical account management by type
- **Reports:** Trial balance, profit & loss, balance sheet, AR aging
- **Bank reconciliation:** Match suggestions, confirm/reject, auto-reconcile

### AI Chat (ZeroClaw)

- **Conversational bookkeeper** via `/chat` route
- **File upload:** Drag-and-drop receipts, bank statements (multipart/form-data)
- **Quick actions:** Pre-built prompts (Daily Briefing, Receipt Snap, etc.)
- **Markdown rendering:** Custom renderer (no `dangerouslySetInnerHTML`)
- **Conversation management:** Server-side storage via LedgerForge API

---

## Development Conventions

### Code Style

- **TypeScript:** `strict: false` (incremental strictness planned)
- **Financial precision:** Use `Decimal` for money — never `float`
- **Type everything:** All API responses typed in `lib/api.ts`
- **DRY patterns:** Use existing hooks (`useAuth`, `useDataTable`), shared UI components, constants

### Data Fetching

- **TanStack Query:** All data fetching uses `useQuery`/`useMutation`
- **Cache invalidation:** Mutations must invalidate relevant queries
- **Error handling:** Use `lib/toast.ts` helpers (`toastError`, `toastSuccess`)

### Styling

- **Tailwind CSS:** Use utility classes exclusively
- **Dark mode:** Always include `dark:` variant for new UI elements
- **Status badges:** Use `lib/status.ts` for consistent entity status colors

### Page Patterns

New pages should follow existing structure:
- Loading states with `PageLoader`
- Error handling with `ErrorAlert` and `ErrorBoundary`
- Layout with `ListPageLayout` or `PageHeader`
- Auth check with `useAuth` hook

---

## Build & Test Commands

```bash
# Install dependencies
npm install

# Development
npm run dev -w apps/web           # Next.js dev server (port 3001)

# Build
npm run build -w apps/web         # Production build

# Type checking
npx tsc --noEmit -p apps/web/tsconfig.json

# Linting
npm run lint -w apps/web          # ESLint

# Formatting
npm run format -w apps/web        # Prettier (write)
npm run format:check -w apps/web  # Prettier (check)

# Testing
npm run test -w apps/web          # Vitest
npm run test:ui -w apps/web       # Vitest with UI
npm run test:coverage -w apps/web # Vitest with coverage
```

---

## Deployment

### Environments

| Environment | Domain | AKS Cluster | ACR |
|-------------|--------|-------------|-----|
| DEV | https://dev.oluto.app | `wackopscoach-dev-aks` | `wackopscoachdevacr` |
| PROD | https://oluto.app | `wackopscoach-prod-aks` | `wackopscoachprodacr` |

### CI/CD Flow

1. **Frontend CI:** Code push → Build Docker image → Push to DEV ACR (tag: `$BUILD_ID`)
2. **Frontend CD-DEV:** Auto-deploy to DEV namespace
3. **Frontend CD-PROD:** Manual trigger with build ID → Rebuild with PROD Keycloak URL → Deploy to PROD

### Key Deployment Notes

- **`NEXT_PUBLIC_*` vars are build-time** — DEV and PROD require separate builds
- **LedgerForge handles migrations** — no K8s migration Job needed
- **Keycloak realm import** — uses `IGNORE_EXISTING`, runtime changes require Admin API
- **Path-based ingress:** `/api/*` → backend, `/agent/*` → ZeroClaw, `/*` → frontend

---

## Important Files

| File | Description |
|------|-------------|
| `apps/web/app/lib/api.ts` | API client (1,600+ lines, 100+ endpoints, 35+ interfaces) |
| `apps/web/app/lib/keycloak.ts` | Keycloak OIDC client configuration |
| `apps/web/app/hooks/useAuth.ts` | Auth check + redirect hook |
| `apps/web/app/components/Navigation.tsx` | App navigation with dropdowns |
| `apps/web/app/components/ThemeProvider.tsx` | Dark/light mode with system sync |
| `apps/web/app/lib/constants.ts` | CRA T2125 categories, classification options |
| `apps/web/app/lib/format.ts` | Currency, date, file size formatters |
| `apps/web/app/lib/status.ts` | Status enums + badge color schemes |
| `apps/web/app/lib/toast.ts` | Toast notification helpers |
| `keycloak/oluto-realm.json` | Realm definition (clients, roles, mappers) |
| `k8s/dev/` | DEV Kubernetes manifests |
| `azure-pipelines/` | CI/CD pipeline definitions |
| `concept.md` | Full product specification (v1.5) |

---

## API Reference (LedgerForge)

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/businesses/{id}/transactions` | Create transaction |
| `GET` | `/api/v1/businesses/{id}/transactions` | List transactions |
| `PATCH` | `/api/v1/businesses/{id}/transactions/{tid}` | Update transaction |
| `POST` | `/api/v1/businesses/{id}/transactions/import/parse` | Parse CSV/PDF |
| `GET` | `/api/v1/businesses/{id}/invoices` | List invoices |
| `POST` | `/api/v1/businesses/{id}/invoices` | Create invoice |
| `GET` | `/api/v1/businesses/{id}/bills` | List bills |
| `POST` | `/api/v1/businesses/{id}/bills` | Create bill |
| `GET` | `/api/v1/businesses/{id}/payments` | List payments |
| `POST` | `/api/v1/businesses/{id}/payments` | Create payment |
| `GET` | `/api/v1/businesses/{id}/contacts` | List contacts |
| `POST` | `/api/v1/businesses/{id}/contacts` | Create contact |
| `GET` | `/api/v1/businesses/{id}/accounts` | List accounts |
| `GET` | `/api/v1/businesses/{id}/reports/profit-loss` | P&L report |
| `GET` | `/api/v1/health` | Health check |

> Full API documentation: `/swagger-ui/` when backend is running

---

## Test Credentials (DEV Keycloak)

| Field | Value |
|-------|-------|
| Email | `oluto@oluto.ca` |
| Password | `OlutoAgent2026` |
| Business ID | `1e472eec-6f3a-4f7f-aa70-e6c0a65f3795` |
| Business Name | Oluto Demo Business (Ontario) |
| Keycloak Admin | `kcadmin` / see `docker-compose.yml` |

---

## Agent Guidelines

When working with this codebase:

1. **Frontend-only changes** — Backend changes belong in `../ledger-forge`
2. **Use existing patterns** — Don't duplicate hooks, components, or API methods
3. **Type all API calls** — Use interfaces from `lib/api.ts`
4. **Decimal for money** — Never use `float` for financial calculations
5. **Dark mode support** — Always include `dark:` Tailwind variants
6. **Status colors** — Use `lib/status.ts` for entity status badges
7. **TanStack Query** — Use `useQuery`/`useMutation` with cache invalidation
8. **Run type checking** — `npx tsc --noEmit -p apps/web/tsconfig.json`
9. **Keep `concept.md` synced** — Note progress on implemented features
10. **Test before committing** — Run lint, type check, and tests

---

## Resources

- **Product Spec:** `concept.md`
- **Developer Guide:** `CLAUDE.md`
- **Agent Instructions:** `AGENTS.md`
- **Roadmap:** `ROADMAP.md`
- **Backend Docs:** `../ledger-forge/CLAUDE.md`
- **API Docs:** `/swagger-ui/` (when backend running)
