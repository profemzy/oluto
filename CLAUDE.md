# CLAUDE.md — Oluto Project Guide

Oluto is a cashflow-first financial management platform for Canadian small businesses. Frontend-only repository backed by [LedgerForge](https://github.com/profemzy/ledger-forge) (Rust/Axum).

## Architecture

- **Frontend:** TypeScript monorepo (npm workspaces) — Next.js 16 (web) + Expo/React Native (mobile, scaffolded)
- **Backend:** LedgerForge (Rust/Axum) — separate repository at `../ledger-forge`
- **Package manager:** npm

## Common Commands

```bash
# Full stack via Docker Compose (frontend + LedgerForge backend + Redis)
docker-compose up --build

# Frontend development
npm install
npm run dev -w apps/web       # Next.js dev server (port 3001)
npm run build -w apps/web     # Build web app
npm run lint -w apps/web      # Lint

# Type checking
npx tsc --noEmit -p apps/web/tsconfig.json
```

## Project Structure

```
apps/web/                      # Next.js app (64 files, 13,500+ lines)
  app/
    auth/                      # Auth pages
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
    dashboard/page.tsx
    onboarding/
      setup-business/page.tsx
    transactions/
      page.tsx                 # Transaction list (filter, bulk status, inline editing)
      new/page.tsx             # Add expense transaction
      [id]/edit/page.tsx       # Edit transaction
      import/page.tsx          # Import CSV/PDF bank statements
    invoices/
      page.tsx                 # Invoice list with status filters
      new/page.tsx             # Create invoice with line items
      [id]/page.tsx            # Invoice detail + payments
    bills/
      page.tsx                 # Bill list with status filters
      new/page.tsx             # Create bill with line items
      [id]/page.tsx            # Bill detail + line items + receipts
    payments/
      page.tsx                 # Customer payment list
      new/page.tsx             # Create payment (apply to invoices)
      new/bill/page.tsx        # Create bill payment (apply to bills)
      [id]/page.tsx            # Payment detail
    contacts/
      page.tsx                 # Contact list (tabs: All/Customers/Vendors/Employees)
      new/page.tsx             # Add contact
      [id]/edit/page.tsx       # Edit contact
    accounts/
      page.tsx                 # Chart of accounts list
      new/page.tsx             # Add account
      [id]/edit/page.tsx       # Edit account
    reconciliation/
      page.tsx                 # Bank reconciliation UI
    reports/
      page.tsx                 # Reports hub
      trial-balance/page.tsx
      profit-loss/page.tsx
      balance-sheet/page.tsx
      ar-aging/page.tsx
    privacy/page.tsx           # Privacy policy
    terms/page.tsx             # Terms of service
    sections/                  # Landing page sections
      HeroSection.tsx
      FeaturesSection.tsx
      HowItWorksSection.tsx
      DashboardPreview.tsx
      AccountantSection.tsx
      CTASection.tsx
    components/
      ui/                      # Shared UI (ErrorAlert, PageLoader, PageHeader, ListPageLayout, ErrorBoundary, Toast, ReceiptUploadSection, BillReceiptSection)
      Navigation.tsx           # App nav with Sales/Purchases/Reports groups
      Footer.tsx
      ThemeProvider.tsx         # Dark/light mode with system sync
      ThemeToggle.tsx
      ThemeLogo.tsx            # Inline SVG logo (dark/light variants)
      QueryProvider.tsx        # TanStack Query provider
      index.ts                 # Barrel export
    hooks/
      useAuth.ts               # Auth check + redirect hook
      useDataTable.ts          # Data table state management
    lib/
      api.ts                   # API client (1,372 lines, 100+ endpoints, 35+ types)
      constants.ts             # CRA_CATEGORIES, classification options, receipt constraints
      format.ts                # Currency/date/file size formatters
      status.ts                # Status enums + color schemes for all entities
      toast.ts                 # Toast helper wrappers
    layout.tsx
    page.tsx                   # Landing page
  Dockerfile
  next.config.js
  package.json
  tsconfig.json
apps/mobile/                   # React Native / Expo (scaffolded)
packages/                      # Shared packages (scaffolded)

k8s/                           # Kubernetes manifests
  dev/                         # DEV environment
    namespace.yaml
    redis.yaml
    backend-deployment.yaml    # LedgerForge (Rust/Axum)
    frontend-deployment.yaml   # Next.js
    agent-deployment.yaml      # PicoClaw agent (skills symlink + HEARTBEAT.md at startup)
    agent-ingress.yaml         # /agent/* ingress with 180s timeout
    services.yaml              # Backend + frontend ClusterIP services
    ingress.yaml               # dev.oluto.app (path-based routing)
  prod/                        # PROD environment (same layout, 2 replicas)
  external-secrets/
    dev/
      external-secret.yaml    # Maps Azure Key Vault → K8s oluto-secret
      picoclaw-external-secret.yaml  # PicoClaw config.json + oluto-config.json from Key Vault
    prod/                      # Same layout as dev

azure-pipelines/               # Azure DevOps CI/CD
  01-app-ci.yml                # Build & push frontend image to DEV ACR
  02-app-cd.yml                # Deploy DEV → (approve) → PROD
  03-secrets-setup.yml         # One-time Key Vault secret population
```

## Deployment & Infrastructure

### Environments

| Environment | Domain | AKS Cluster | ACR |
|-------------|--------|-------------|-----|
| DEV | `https://dev.oluto.app` | `wackopscoach-dev-aks` | `wackopscoachdevacr` |
| PROD | `https://oluto.app` | `wackopscoach-prod-aks` | `wackopscoachprodacr` |

### Kubernetes Architecture

- **Namespace:** `oluto` on each cluster
- **Path-based routing:** Ingress routes `/api/*`, `/swagger-ui/*`, `/api-docs/*` → backend; `/agent/*` → PicoClaw (180s timeout); `/*` → frontend
- **TLS:** cert-manager with Let's Encrypt (`letsencrypt-prod` ClusterIssuer, HTTP-01 solver)
- **Secrets:** ExternalSecrets Operator syncs Azure Key Vault → K8s `oluto-secret`
- **Redis:** In-cluster deployment (per-namespace), URL: `redis://redis:6379`
- **Migrations:** LedgerForge runs migrations automatically on startup (no separate K8s Job needed)

### CI/CD Pipelines

| Pipeline | Repo | Trigger | Purpose |
|----------|------|---------|---------|
| `01-app-ci.yml` | Oluto | Push to `apps/**` or `packages/**` | Build & push frontend image to DEV ACR |
| `02-app-cd.yml` | Oluto | CI success or manual | Deploy all K8s manifests (frontend, agent, ingress, secrets), update image tags |
| `01-ci.yml` | LedgerForge | Push to `src/**`, `migrations/**`, `Cargo.*` | Build & push backend image to DEV ACR |
| `02-cd.yml` | LedgerForge | CI success or manual | Update backend image on AKS, promote DEV → PROD |
| `03-secrets-setup.yml` | Oluto | Manual | One-time Key Vault population |

**CD flow:** Oluto CI pushes frontend image to DEV ACR. LedgerForge CI pushes backend image to DEV ACR. Each CD pipeline manages its own image promotion from DEV → PROD ACR.

### Terraform (separate repo: `infotitans-azure/terraform/oluto/`)

- Creates `oluto_db` on existing WackOps-Coach PostgreSQL Flexible Server
- State backend: `terraformstatewakopsaks` storage account

### Key Deployment Notes

- **LedgerForge handles migrations on startup** — no K8s migration Job needed
- **LedgerForge handles background jobs in-process** — no separate worker containers
- **Ingress-nginx health probe:** Requires `service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path=/healthz` annotation
- **Namespace before ExternalSecret:** Namespace must exist before deploying ExternalSecret resources

## Key Conventions

- **Decimal for money:** Never use `float` for financial calculations — always proper decimal types
- **Tenant isolation:** All queries scoped by `business_id`
- **DRY frontend patterns:** Use `useAuth` hook for auth checks, shared UI components from `components/ui/`, constants from `lib/constants.ts`, API methods from `lib/api.ts`
- **TanStack Query:** All data fetching uses `useQuery`/`useMutation` via `QueryProvider` — cache invalidation on mutations
- **Dark mode:** Use Tailwind `dark:` variant classes — theme state in `ThemeProvider` (localStorage + system sync)
- **Status management:** Entity status enums and badge colors defined in `lib/status.ts`
- **Toast notifications:** Use helpers from `lib/toast.ts` (`toastError`, `toastSuccess`)
- **Navigation groups:** Sales (Invoices, Payments) and Purchases (Bills, Bill Payments) are grouped in nav dropdowns

## Access Points

### Local Dev

| Service | URL |
|---------|-----|
| Web App | http://localhost:3001 |
| API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/swagger-ui/ |
| OpenAPI JSON | http://localhost:3000/api-docs/openapi.json |
| Health | http://localhost:3000/api/v1/health |

### Deployed

| Service | DEV | PROD |
|---------|-----|------|
| Web App | https://dev.oluto.app | https://oluto.app |
| API | https://dev.oluto.app/api/v1 | https://oluto.app/api/v1 |
| Swagger UI | https://dev.oluto.app/swagger-ui/ | https://oluto.app/swagger-ui/ |
| Health | https://dev.oluto.app/api/v1/health | https://oluto.app/api/v1/health |

## Important Files

- `concept.md` — Full product specification
- `AGENTS.md` — Agent instructions
- `docker-compose.yml` — Full stack (LedgerForge backend + frontend + Redis)
- `apps/web/app/lib/api.ts` — API client (all backend calls)
- `apps/web/app/hooks/useAuth.ts` — Auth check + redirect hook
- `apps/web/app/components/Navigation.tsx` — App navigation
- `k8s/` — Kubernetes manifests per environment
- `azure-pipelines/` — CI/CD pipeline definitions
