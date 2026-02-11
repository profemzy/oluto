# CLAUDE.md — Oluto Project Guide

Oluto is a cashflow-first financial management platform for Canadian small businesses. "Python Brain, TypeScript Face" architecture.

## Architecture

- **Backend:** FastAPI (async Python 3.14), SQLAlchemy 2.0, PostgreSQL 18, Redis, Celery
- **Frontend:** TypeScript monorepo (npm workspaces) — Next.js 16 (web) + Expo/React Native (mobile)
- **Package managers:** `uv` (backend), `npm` (frontend)

## Common Commands

```bash
# Full stack (includes API, worker, Flower, Redis, frontend)
docker-compose up --build

# Backend
cd backend
uv sync                                    # Install dependencies
uv run alembic upgrade head                # Run migrations
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  # Dev server
uv run pytest                              # Tests
uv run ruff check .                        # Lint
uv run alembic revision --autogenerate -m "description"  # New migration

# Celery worker (requires Redis — run docker-compose up redis -d first)
cd backend
celery -A app.worker worker --loglevel=info --queues=default,imports  # Worker
celery -A app.worker flower --port=5555                               # Monitoring UI

# Frontend
cd frontend
npm install                                # Install dependencies
npm run dev -w apps/web                    # Next.js dev server (port 3000)
npm run start -w apps/mobile               # Expo mobile
npm run build -w apps/web                  # Build web app
```

## Project Structure

```
backend/
  app/
    api/
      v1/endpoints/       # Route handlers
        auth.py            #   Login, register, current user
        businesses.py      #   Business CRUD, user invites
        transactions.py    #   Transaction CRUD, summary, suggest-category, bulk-status
        import_transactions.py  # CSV/PDF import (parse + confirm)
        jobs.py            #   Async job status polling
      helpers.py           # Reusable CRUD helpers (get_or_404, get_business_or_404, etc.)
      deps.py              # Auth & tenant isolation dependencies
    core/                  # config.py, security.py, celery_app.py
    db/                    # session.py, base.py (model registry)
    models/                # SQLAlchemy models (user, transaction, async_job)
    schemas/               # Pydantic schemas (auth, business, transaction, async_job)
    services/
      ai_engine/
        categorizer.py     # AI categorization (Fuelix/OpenAI-compatible)
      import_parser.py     # CSV/PDF statement parsing
      transaction_service.py  # Transaction creation with tax calc
      ocr_utils.py         # OCR response extraction
    tasks/
      import_tasks.py      # Celery task definitions (PDF import)
    logic/
      tax_canada.py        # Province-aware GST/HST/PST/QST calculations
    worker.py              # Celery worker entry point
    main.py                # FastAPI app entry point
  alembic/versions/        # Migration scripts
  tests/                   # pytest test suite

frontend/
  apps/web/                # Next.js app
    app/
      auth/                # Login + Register pages
      dashboard/           # Dashboard page
      onboarding/          # Business setup page
      transactions/        # List, New, Import pages
      sections/            # Landing page sections (Hero, Features, etc.)
      components/
        ui/                # Shared UI (ErrorAlert, PageLoader, PageHeader)
        Navigation.tsx
        Footer.tsx
      hooks/
        useAuth.ts         # Auth check + redirect hook
      lib/
        api.ts             # API client
        constants.ts       # Shared constants (CRA_CATEGORIES)
        format.ts          # Currency/date formatters
  apps/mobile/             # Expo/React Native app
  packages/                # Shared: api-client, ui, utils (scaffolded)

k8s/                       # Kubernetes manifests (per-environment)
  dev/
    namespace.yaml         # Namespace: oluto
    redis.yaml             # Redis deployment + service
    migration-job.yaml     # Alembic migration K8s Job
    backend-deployment.yaml   # FastAPI (1 replica)
    worker-deployment.yaml    # Celery worker (1 replica, concurrency 1)
    flower-deployment.yaml    # Celery Flower (dev only)
    frontend-deployment.yaml  # Next.js (1 replica)
    services.yaml          # Backend + frontend + flower ClusterIP services
    ingress.yaml           # Ingress for dev.oluto.app (path-based routing)
  prod/
    namespace.yaml         # (same layout, no flower, 2 replicas each)
    redis.yaml
    migration-job.yaml
    backend-deployment.yaml
    worker-deployment.yaml
    frontend-deployment.yaml
    services.yaml
    ingress.yaml
  external-secrets/
    dev/external-secret.yaml   # Maps Azure Key Vault → K8s oluto-secret
    prod/external-secret.yaml

azure-pipelines/           # Azure DevOps CI/CD pipelines
  01-app-ci.yml            # Build & push backend + frontend images to DEV ACR
  02-app-cd.yml            # Deploy DEV → (approve) → PROD
  03-secrets-setup.yml     # One-time Key Vault secret population
```

## Deployment & Infrastructure

### Environments

| Environment | Domain | AKS Cluster | Resource Group | ACR |
|-------------|--------|-------------|----------------|-----|
| DEV | `https://dev.oluto.app` | `wackopscoach-dev-aks` | `wackopscoach-dev-rg` | `wackopscoachdevacr` |
| PROD | `https://oluto.app` | `wackopscoach-prod-aks` | `wackopscoach-prod-rg` | `wackopscoachprodacr` |

### Kubernetes Architecture
- **Namespace:** `oluto` on each cluster
- **Path-based routing:** Ingress routes `/api/*`, `/health`, `/docs`, `/redoc` → backend; `/*` → frontend (same-origin, no CORS issues)
- **TLS:** cert-manager with Let's Encrypt (`letsencrypt-prod` ClusterIssuer, HTTP-01 solver)
- **Secrets:** ExternalSecrets Operator syncs Azure Key Vault → K8s `oluto-secret`
- **Redis:** In-cluster deployment (per-namespace), URL: `redis://redis:6379/0`
- **Migrations:** K8s Job (`oluto-migration`) runs `uv run alembic upgrade head` before deployments
- **Flower:** Deployed to DEV only (Celery monitoring UI)

### CI/CD Pipelines (Azure DevOps)

| Pipeline | File | Trigger | Purpose |
|----------|------|---------|---------|
| 01-App-CI | `azure-pipelines/01-app-ci.yml` | Push to `backend/**` or `frontend/**` | Build & push 2 Docker images to DEV ACR |
| 02-App-CD | `azure-pipelines/02-app-cd.yml` | CI success or manual | Deploy DEV → approve → PROD |
| 03-Secrets | `azure-pipelines/03-secrets-setup.yml` | Manual only | One-time Key Vault population |

**CD flow:** CI pushes to DEV ACR only. CD PROD stage promotes images via `az acr import` from DEV → PROD ACR before deploying.

### Terraform (separate repo: `infotitans-azure/terraform/oluto/`)
- Creates `oluto_db` on existing WackOps-Coach PostgreSQL Flexible Server
- Stores DB connection secrets (host, port, user, db name) in existing Key Vault
- DB password reuses `postgres-password` from wackops-coach Terraform (same server)
- State backend: `terraformstatewakopsaks` storage account

### Key Deployment Gotchas
- **`DATABASE_SSL=true`** required for Azure PostgreSQL (rejects unencrypted connections)
- **DB password URL-encoding:** `config.py` uses `urllib.parse.quote()` because Pydantic's `PostgresDsn.build()` doesn't escape special characters (`?`, `!`, `)`, `=`) in passwords
- **Celery sync URL:** `psycopg2` needs `?sslmode=require` not `?ssl=require` — `import_tasks.py` does `.replace("?ssl=require", "?sslmode=require")`
- **Alembic `env.py`:** Must escape `%` as `%%` in URL (Python configparser interpolation)
- **K8s Jobs are immutable:** CD pipeline must `kubectl delete job --ignore-not-found` before redeploying
- **Ingress-nginx health probe:** Requires annotation `service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path=/healthz`
- **Namespace before ExternalSecret:** Namespace must exist before deploying ExternalSecret resources

## Key Conventions

- **Async everywhere:** All DB operations use async/await with SQLAlchemy 2.0
- **Decimal for money:** Never use `float` for financial calculations — always `Decimal`
- **Tenant isolation:** Always filter queries by `business_id`. Use `require_business_access` dependency
- **Schema + Model parity:** Update both Pydantic schemas AND SQLAlchemy models when changing data structures
- **Migrations via Alembic:** Never manually edit the DB schema
- **Test patterns:** Follow existing patterns in `tests/api/`. Use `pytest-asyncio` fixtures from `conftest.py`
- **No secrets in code:** Use `.env` files and `app/core/config.py` Pydantic Settings
- **Background tasks:** Long-running operations (PDF OCR, AI calls) go through Celery. Track state via `AsyncJob` model, not Celery result backend. Celery tasks use sync DB sessions (`psycopg2`), not async
- **DRY helpers:** Use `api/helpers.py` for DB lookups (`get_or_404`, `get_business_or_404`, `get_transaction_for_business`). Use `services/transaction_service.py` for transaction creation with tax calc.

## Domain Concepts

- **Multi-tenant:** Business = Tenant. All data scoped to `business_id`
- **User roles:** `founder`, `bookkeeper`, `staff`, `admin`
- **Transaction states:** `draft` → `processing` → `inbox_user`/`inbox_firm` → `ready` → `posted`
- **Canadian tax:** Province-aware GST/HST/PST/QST calculations in `backend/app/logic/tax_canada.py`
- **Auth:** JWT tokens (7-day expiry), Argon2 password hashing, OAuth2 bearer flow
- **AI categorization:** Fuelix (OpenAI-compatible) for CRA T2125 expense categories. Config via `FUELIX_*` env vars.

## Access Points

### Local Dev

| Service     | URL                          |
|-------------|------------------------------|
| Web App     | http://localhost:3000        |
| API         | http://localhost:8000        |
| Swagger UI  | http://localhost:8000/docs   |
| ReDoc       | http://localhost:8000/redoc  |
| Flower      | http://localhost:5555        |
| Health      | http://localhost:8000/health |

### Deployed

| Service     | DEV                                  | PROD                          |
|-------------|--------------------------------------|-------------------------------|
| Web App     | https://dev.oluto.app                | https://oluto.app             |
| API         | https://dev.oluto.app/api/v1         | https://oluto.app/api/v1      |
| Swagger UI  | https://dev.oluto.app/docs           | https://oluto.app/docs        |
| Health      | https://dev.oluto.app/up             | https://oluto.app/up          |
| Flower      | https://dev.oluto.app/flower         | N/A (dev only)                |

## Important Files

- `concept.md` — Full product specification
- `AGENTS.md` — Developer guide and agent instructions
- `docker-compose.yml` — Full stack infrastructure (API, worker, Flower, Redis, frontend)
- `backend/app/core/config.py` — All settings, env vars, `DATABASE_URL` builder (with URL-encoding)
- `backend/app/core/celery_app.py` — Celery configuration (queues, retries, routing)
- `backend/app/worker.py` — Celery worker entry point
- `backend/app/tasks/import_tasks.py` — Background task definitions (includes sync DB URL with `sslmode` fix)
- `backend/app/models/async_job.py` — Background job tracking model
- `backend/app/api/deps.py` — Auth middleware and tenant scoping
- `backend/app/api/helpers.py` — Reusable CRUD/lookup helpers
- `backend/app/services/ai_engine/categorizer.py` — AI categorization engine
- `backend/app/services/import_parser.py` — CSV/PDF statement parser
- `backend/app/logic/tax_canada.py` — Province-aware tax calculations
- `backend/tests/conftest.py` — Test fixtures (async DB, client setup)
- `backend/alembic/env.py` — Alembic config (escapes `%` as `%%` for configparser)
- `k8s/` — Kubernetes manifests per environment (dev/prod)
- `k8s/external-secrets/` — ExternalSecret CRDs mapping Key Vault → K8s secrets
- `azure-pipelines/01-app-ci.yml` — CI: build + push Docker images
- `azure-pipelines/02-app-cd.yml` — CD: deploy DEV → PROD with ACR image promotion
- `azure-pipelines/03-secrets-setup.yml` — One-time Key Vault secret setup
