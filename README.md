# Oluto

Cashflow-first financial management for Canadian small businesses.

Oluto gives founders proactive control over their finances with automated statement import, province-aware tax calculation, and an exceptions-based workflow that surfaces only what needs attention. Instead of retroactive bookkeeping, Oluto answers the question that matters most: *"How much can I safely spend right now?"*

> **Status:** Alpha — pre-release software under active development. See [concept.md](concept.md) for the full product vision.

## Architecture

Oluto is a **frontend-only** repository. The backend is [LedgerForge](https://github.com/profemzy/ledger-forge) — a Rust/Axum double-entry accounting API deployed separately with its own CI/CD pipeline.

| Layer | Technology |
|-------|-----------|
| Frontend | TypeScript, Next.js 16, React 19, Tailwind CSS 4 |
| Backend | LedgerForge (Rust/Axum) — separate repository |
| Infrastructure | AKS, Azure DevOps CI/CD, Terraform, Docker Compose |

## Features

- **User registration and JWT authentication**
- **Multi-tenant business workspaces** with strict tenant isolation
- **Transaction management** — CRUD, filtering, status workflow (draft → posted → void)
- **Bank statement import: CSV** — column auto-detection, duplicate detection, two-phase parse → preview → confirm flow
- **Bank statement import: PDF** — Mistral Document AI OCR on Azure, async processing with progress tracking
- **Dashboard** — Safe-to-Spend metric, revenue/expenses summary, cashflow breakdown, transaction status overview
- **Contacts** — customers, vendors, employees with CRUD and type filtering
- **Chart of Accounts** — hierarchical account management with type filtering
- **Reports** — trial balance, profit & loss, balance sheet, AR aging
- **Bulk operations** — bulk status updates by transaction IDs or import batch
- **AI category suggestions** — CRA T2125 expense categorization
- **Interactive API documentation** via Swagger UI at `/swagger-ui/`

## Prerequisites

- **Node.js 20+** and **npm**
- **Docker** and **Docker Compose** (for full-stack local development)

## Quick Start

```bash
git clone <repo-url> && cd oluto
docker-compose up --build
```

Once the stack is running:

| Service | URL |
|---------|-----|
| Web App | http://localhost:3001 |
| API (LedgerForge) | http://localhost:3000 |
| Swagger UI | http://localhost:3000/swagger-ui/ |
| Health Check | http://localhost:3000/api/v1/health |

> **Data persistence:** `docker-compose down` preserves all data. `docker-compose down -v` **permanently deletes** Redis data. `docker-compose up --build` is always safe.

## Development Setup

### Frontend (this repo)

```bash
npm install
npm run dev -w apps/web    # Next.js dev server on port 3001
```

> The frontend expects the API at `http://localhost:3000/api/v1` by default. Set `NEXT_PUBLIC_API_URL` to override.

### Backend (LedgerForge — separate repo)

```bash
cd ../ledger-forge
cargo run                  # API server on port 3000
```

> See the [LedgerForge README](https://github.com/profemzy/ledger-forge) for full setup instructions including database and Redis.

## Project Structure

```
oluto/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/
│   │   │   ├── auth/           # Login + Register
│   │   │   ├── dashboard/      # Dashboard
│   │   │   ├── onboarding/     # Business setup
│   │   │   ├── transactions/   # List, New, Edit, Import
│   │   │   ├── contacts/       # List, New, Edit
│   │   │   ├── accounts/       # List, New, Edit
│   │   │   ├── reports/        # Hub, Trial Balance, P&L, Balance Sheet, AR Aging
│   │   │   ├── sections/       # Landing page sections
│   │   │   ├── components/     # Shared UI components + Navigation + Footer
│   │   │   ├── hooks/          # useAuth
│   │   │   └── lib/            # API client, constants, formatters
│   │   ├── Dockerfile
│   │   └── package.json
│   └── mobile/                 # React Native / Expo (scaffolded)
├── packages/                   # Shared packages (scaffolded)
├── k8s/                        # Kubernetes manifests
│   ├── dev/                    # DEV environment
│   ├── prod/                   # PROD environment
│   └── external-secrets/       # Azure Key Vault → K8s secret sync
├── azure-pipelines/            # Azure DevOps CI/CD
│   ├── 01-app-ci.yml          # Build & push frontend image to ACR
│   ├── 02-app-cd.yml          # Deploy DEV → approve → PROD
│   └── 03-secrets-setup.yml   # One-time Key Vault population
├── docker-compose.yml          # Full stack (LedgerForge backend + frontend + Redis)
├── concept.md                  # Product specification
├── CLAUDE.md                   # Developer guide
└── AGENTS.md                   # Agent instructions
```

## Environment Variables

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` | LedgerForge API URL |

### Backend (LedgerForge — configured in its own repo)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key |
| `REDIS_URL` | Redis connection string |
| `FUELIX_API_KEY` | AI categorization API key (optional) |
| `AZURE_API_KEY` | Azure OCR API key for PDF import (optional) |

## Testing

```bash
# Frontend type checking
npx tsc --noEmit -p apps/web/tsconfig.json

# Frontend linting
npm run lint -w apps/web
```

## Deployment

Oluto runs on Azure Kubernetes Service (AKS) with Azure DevOps CI/CD pipelines.

### Environments

| Environment | URL | Cluster |
|-------------|-----|---------|
| DEV | https://dev.oluto.app | `wackopscoach-dev-aks` |
| PROD | https://oluto.app | `wackopscoach-prod-aks` |

### CI/CD Pipelines

| Pipeline | Repo | Trigger | Purpose |
|----------|------|---------|---------|
| `01-app-ci.yml` | Oluto | Push to `apps/**` or `packages/**` | Build & push frontend image to DEV ACR |
| `02-app-cd.yml` | Oluto | CI success or manual | Deploy frontend + infra to DEV → approve → PROD |
| `01-ci.yml` | LedgerForge | Push to `src/**`, `migrations/**`, or `Cargo.*` | Build & push backend image to DEV ACR |
| `02-cd.yml` | LedgerForge | CI success or manual | Deploy backend to DEV → approve → PROD |
| `03-secrets-setup.yml` | Oluto | Manual | One-time Key Vault secret population |

### Deploying

Frontend code pushed to `master`/`main` triggers the Oluto CI/CD pipeline. Backend code changes trigger the LedgerForge CI/CD pipeline independently.

## License

TBD
