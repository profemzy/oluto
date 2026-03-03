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
apps/web/                      # Next.js app (74 files, 16,400+ lines)
  app/
    auth/                      # Auth pages
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
    dashboard/page.tsx
    onboarding/
      setup-business/page.tsx
    chat/                      # AI chat interface (ZeroClaw agent)
      page.tsx                 # Chat orchestration (conversations, messages, gateway calls)
      components/
        ChatArea.tsx           # Message display, date grouping, loading indicators, drag-drop
        ChatSidebar.tsx        # Conversation list, search, create/archive/delete
        InputBar.tsx           # Message input with file attachment, quick actions toggle
        MessageBubble.tsx      # User/assistant/error message bubbles with copy, avatars
        MarkdownRenderer.tsx   # Custom text-to-React-nodes renderer (no dangerouslySetInnerHTML)
        QuickActions.tsx       # Pre-built agent actions (Daily Briefing, Receipt Snap, etc.)
    transactions/
      page.tsx                 # Transaction list (filter, bulk status, inline editing)
      new/page.tsx             # Add expense transaction
      [id]/edit/page.tsx       # Edit transaction
      import/page.tsx          # Import CSV/PDF bank statements
      import-quickbooks/page.tsx # QuickBooks CSV import wizard (upload, review, confirm)
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
    gateway/                   # API route handlers
      chat/route.ts            # POST proxy to ZeroClaw gateway (/agent/webhook)
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
      Navigation.tsx           # App nav with Sales/Purchases/Reports groups + chat icon
      Footer.tsx
      ThemeProvider.tsx         # Dark/light mode with system sync (useSyncExternalStore)
      ThemeToggle.tsx
      ThemeLogo.tsx            # Inline SVG logo (dark/light variants)
      QueryProvider.tsx        # TanStack Query provider
      index.ts                 # Barrel export
    hooks/
      useAuth.ts               # Auth check + redirect hook
      useDataTable.ts          # Data table state management
    lib/
      api.ts                   # API client (1,620 lines, 100+ endpoints, 35+ types)
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

keycloak/                      # Keycloak OIDC configuration
  oluto-realm.json             # Realm import JSON (local/docker-compose)
  themes/oluto/login/          # Custom login theme (FreeMarker)
    theme.properties           # Theme config: parent=base, CSS ref
    template.ftl               # Base HTML shell (logo, orbs, alerts, glass card)
    login.ftl                  # Login form
    register.ftl               # Registration form
    login-reset-password.ftl   # Password reset form
    resources/css/
      oluto-login.css          # Full Oluto design system (dark/light mode, animations)

k8s/                           # Kubernetes manifests
  dev/                         # DEV environment
    namespace.yaml
    redis.yaml
    backend-deployment.yaml    # LedgerForge (Rust/Axum)
    frontend-deployment.yaml   # Next.js (with KEYCLOAK env vars)
    keycloak-deployment.yaml   # Keycloak OIDC (with initContainer for theme)
    keycloak-realm-configmap.yaml  # Realm import JSON
    keycloak-theme-configmap.yaml  # Theme files (flat keys → initContainer)
    keycloak-ingress.yaml      # auth.dev.oluto.app
    agent-deployment.yaml      # ZeroClaw agent (mounts zeroclaw-config ConfigMap)
    agent-ingress.yaml         # /agent/* ingress with 180s timeout
    services.yaml              # Backend + frontend + agent + keycloak ClusterIP services
    ingress.yaml               # dev.oluto.app (path-based routing)
  prod/                        # PROD environment (same layout, 2 replicas)
  external-secrets/
    dev/
      external-secret.yaml    # Maps Azure Key Vault → K8s oluto-secret
    prod/                      # Same layout as dev

azure-pipelines/               # Azure DevOps CI/CD
  ci-frontend.yml              # Frontend-CI: Build & push frontend image to DEV ACR
  cd-frontend-dev.yml          # Frontend-CD-DEV: Deploy frontend to DEV
  cd-frontend-prod.yml         # Frontend-CD-PROD: Rebuild with PROD Keycloak URL + deploy
  cd-infra-dev.yml             # Infra-CD-DEV: Deploy shared infra (namespace, redis, keycloak, ingress, external-secrets)
  cd-infra-prod.yml            # Infra-CD-PROD: Deploy shared infra to PROD
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
- **Path-based routing:** Ingress routes `/api/*`, `/swagger-ui/*`, `/api-docs/*` → backend; `/agent/*` → ZeroClaw agent (180s timeout); `/*` → frontend
- **Keycloak (OIDC):** Separate ingress on `auth.dev.oluto.app` (DEV) / `auth.oluto.app` (PROD). Uses initContainer pattern to copy theme files from ConfigMap into correct directory structure
- **TLS:** cert-manager with Let's Encrypt (`letsencrypt-prod` ClusterIssuer, HTTP-01 solver)
- **Secrets:** ExternalSecrets Operator syncs Azure Key Vault → K8s `oluto-secret` (includes `KEYCLOAK_DB_URL`, `KEYCLOAK_DB_USERNAME`, `KEYCLOAK_DB_PASSWORD`, `KEYCLOAK_ADMIN_PASSWORD`)
- **Redis:** In-cluster deployment (per-namespace), URL: `redis://redis:6379`
- **Migrations:** LedgerForge runs migrations automatically on startup (no separate K8s Job needed)

### CI/CD Pipelines

Each service has separate CI, CD-DEV, and CD-PROD pipelines. PROD deploys are manual-trigger only.

| Pipeline | Repo | Trigger | Purpose |
|----------|------|---------|---------|
| `ci-frontend.yml` | Oluto | Push to `apps/**`, `packages/**`, `package.json` | Build frontend image → DEV ACR (tag `$BUILD_ID`) |
| `cd-frontend-dev.yml` | Oluto | Frontend-CI completion or manual | Apply `frontend-deployment.yaml` to DEV |
| `cd-frontend-prod.yml` | Oluto | Manual (`imageTag` param) | Rebuild with PROD Keycloak URL → PROD ACR → deploy |
| `cd-infra-dev.yml` | Oluto | Push to `k8s/dev/**`, `k8s/external-secrets/dev/**`, `keycloak/**` | Apply shared infra (namespace, redis, keycloak, ingress, external-secrets) to DEV |
| `cd-infra-prod.yml` | Oluto | Push to `k8s/prod/**`, `k8s/external-secrets/prod/**` | Apply shared infra to PROD (requires `prod` env approval) |
| `ci.yml` | LedgerForge | Push to `src/**`, `tests/**`, `migrations/**`, `Cargo.*`, `Dockerfile` | Test + build backend image → DEV ACR |
| `cd-dev.yml` | LedgerForge | LedgerForge-CI completion or manual | Apply `backend-deployment.yaml` to DEV |
| `cd-prod.yml` | LedgerForge | Manual (`imageTag` param) | Promote image DEV→PROD ACR, apply to PROD |
| `ci.yml` | ZeroClaw | Push to `src/**`, `crates/**`, `skills/**`, `Cargo.*`, `Dockerfile`, `dev/**` | Build agent image (`--target dev`) → DEV ACR |
| `cd-dev.yml` | ZeroClaw | ZeroClaw-CI completion or manual | Apply `agent-deployment.yaml` to DEV |
| `cd-prod.yml` | ZeroClaw | Manual (`imageTag` param) | Promote image DEV→PROD ACR, apply to PROD |
| `03-secrets-setup.yml` | Oluto | Manual | One-time Key Vault population |

**CD flow:** CI builds push to DEV ACR with `$(Build.BuildId)` tag (no `latest`). CD-DEV auto-triggers and seds the tag into the deployment manifest before `kubectl apply`. For PROD, operator manually triggers CD-PROD with a verified build ID. Frontend PROD must rebuild (not promote) because `NEXT_PUBLIC_*` vars are baked at build time. Backend and agent PROD use `az acr import` to promote the same binary.

### Terraform (separate repo: `infotitans-azure/terraform/oluto/`)

- Creates `oluto_db` on existing WackOps-Coach PostgreSQL Flexible Server
- State backend: `terraformstatewakopsaks` storage account

### Key Deployment Notes

- **LedgerForge handles migrations on startup** — no K8s migration Job needed
- **LedgerForge handles background jobs in-process** — no separate worker containers
- **Ingress-nginx health probe:** Requires `service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path=/healthz` annotation
- **Namespace before ExternalSecret:** Namespace must exist before deploying ExternalSecret resources
- **NEXT_PUBLIC_* vars are build-time** — Keycloak URL, realm, and client ID are baked into the Next.js bundle at `docker build`. DEV and PROD need separate builds with different `--build-arg` values
- **Keycloak realm import uses IGNORE_EXISTING** — ConfigMap realm JSON only applies on first startup. Runtime changes (loginTheme, registrationAllowed, User Profile attributes) must use the Keycloak Admin REST API
- **Keycloak 26+ declarative User Profile** — Custom user attributes (e.g., `business_id`) must be declared in the realm's User Profile configuration before they can be stored on users. Without this, attributes are silently dropped
- **Keycloak theme deployment** — Theme files are stored in a ConfigMap (`keycloak-theme-files`) and copied into the correct directory structure by a busybox initContainer before Keycloak starts

## Key Conventions

- **Decimal for money:** Never use `float` for financial calculations — always proper decimal types
- **Tenant isolation:** All queries scoped by `business_id`
- **DRY frontend patterns:** Use `useAuth` hook for auth checks, shared UI components from `components/ui/`, constants from `lib/constants.ts`, API methods from `lib/api.ts`
- **TanStack Query:** All data fetching uses `useQuery`/`useMutation` via `QueryProvider` — cache invalidation on mutations
- **Dark mode:** Use Tailwind `dark:` variant classes — theme state in `ThemeProvider` (localStorage + system sync)
- **Status management:** Entity status enums and badge colors defined in `lib/status.ts`
- **Toast notifications:** Use helpers from `lib/toast.ts` (`toastError`, `toastSuccess`)
- **Navigation groups:** Sales (Invoices, Payments) and Purchases (Bills, Bill Payments) are grouped in nav dropdowns; Chat is an icon button in the nav action area
- **Chat UI:** Desktop-parity design with date-grouped messages, loading banner + typing indicator, drag-and-drop file upload, quick actions, markdown rendering, conversation sidebar
- **Gateway proxy:** Chat messages route through Next.js API route (`/gateway/chat`) to ZeroClaw webhook, passing JWT for auth
- **SSR-safe patterns:** `useSyncExternalStore` used in ThemeProvider and Navigation for safe localStorage/mount detection
- **Authentication:** OIDC via Keycloak. Frontend uses `keycloak-js` for PKCE authorization code flow. Login/register/forgot-password are Keycloak-hosted pages with custom Oluto theme (FreeMarker templates). The app never handles passwords directly
- **Keycloak theme development:** Theme files are vanilla FreeMarker + CSS (no React). Dark mode uses `prefers-color-scheme` CSS media queries. Test locally with `docker-compose up` (theme cache disabled). FreeMarker null-safety: use `${(var.field)!'default'}` pattern for nullable chains

## Access Points

### Local Dev

| Service | URL |
|---------|-----|
| Web App | http://localhost:3001 |
| API | http://localhost:3000 |
| Keycloak | http://localhost:8080 |
| Keycloak Admin | http://localhost:8080/admin (kcadmin / see docker-compose) |
| Swagger UI | http://localhost:3000/swagger-ui/ |
| OpenAPI JSON | http://localhost:3000/api-docs/openapi.json |
| Health | http://localhost:3000/api/v1/health |

### Deployed

| Service | DEV | PROD |
|---------|-----|------|
| Web App | https://dev.oluto.app | https://oluto.app |
| Keycloak | https://auth.dev.oluto.app | https://auth.oluto.app |
| Keycloak Admin | https://auth.dev.oluto.app/admin | https://auth.oluto.app/admin |
| API | https://dev.oluto.app/api/v1 | https://oluto.app/api/v1 |
| Swagger UI | https://dev.oluto.app/swagger-ui/ | https://oluto.app/swagger-ui/ |
| Health | https://dev.oluto.app/api/v1/health | https://oluto.app/api/v1/health |

## Important Files

- `concept.md` — Full product specification
- `AGENTS.md` — Agent instructions
- `docker-compose.yml` — Full stack (LedgerForge backend + frontend + Redis + Keycloak)
- `apps/web/app/lib/api.ts` — API client (all backend calls)
- `apps/web/app/lib/keycloak.ts` — Keycloak OIDC client configuration
- `apps/web/app/hooks/useAuth.ts` — Auth check + redirect hook
- `apps/web/app/components/Navigation.tsx` — App navigation
- `keycloak/oluto-realm.json` — Keycloak realm definition (clients, scopes, mappers, roles)
- `keycloak/themes/oluto/login/` — Custom login theme (FreeMarker templates + CSS)
- `k8s/` — Kubernetes manifests per environment
- `azure-pipelines/` — CI/CD pipeline definitions
