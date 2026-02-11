# Oluto

Cashflow-first financial management for Canadian small businesses.

Oluto gives founders proactive control over their finances with automated statement import, province-aware tax calculation, and an exceptions-based workflow that surfaces only what needs attention. Instead of retroactive bookkeeping, Oluto answers the question that matters most: *"How much can I safely spend right now?"*

> **Status:** Alpha — pre-release software under active development. See [concept.md](concept.md) for the full product vision.

## Features

- **User registration and JWT authentication** with Argon2 password hashing
- **Multi-tenant business workspaces** with strict tenant isolation on all queries
- **Transaction management** — full CRUD, filtering by status/date/search, status workflow (draft → processing → review → ready → posted)
- **Bank statement import: CSV** — column auto-detection, duplicate detection, two-phase parse → preview → confirm flow
- **Bank statement import: PDF** — Mistral Document AI OCR on Azure, handles credit card and bank account formats, processed asynchronously via Celery with real-time progress tracking
- **Background task processing** — production-ready Celery workers with Redis broker, PostgreSQL-backed job tracking, progress polling API, and Flower monitoring dashboard
- **Dashboard** — Safe-to-Spend metric, CRA Lockbox (tax reserved), revenue/expenses summary, cashflow breakdown chart, transaction status overview
- **Bulk operations** — bulk status updates by transaction IDs or import batch
- **Province-aware tax calculation** — GST/HST/PST for BC, ON, and AB
- **Exceptions inbox** — surfaces transactions needing user or firm review
- **Expense/Income toggle** — intuitive transaction entry without manual negative numbers
- **Interactive API documentation** via Swagger UI and ReDoc

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.14, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| Database | PostgreSQL 18, Alembic migrations |
| Frontend | TypeScript, Next.js 16, React 19, Tailwind CSS 4 |
| Mobile | React Native / Expo (scaffolded) |
| Auth | JWT (python-jose), Argon2 (passlib) |
| Task Queue | Celery 5.6 + Redis 8, Flower monitoring |
| AI Categorization | Fuelix (OpenAI-compatible) for CRA T2125 expense categories |
| PDF Processing | Mistral Document AI OCR via Azure |
| Package Managers | uv (backend), npm (frontend monorepo) |
| Infrastructure | AKS, Azure DevOps CI/CD, Terraform, Docker Compose |

## Prerequisites

- **Docker** and **Docker Compose** (for full-stack or database only)
- **Python 3.12+** and **[uv](https://docs.astral.sh/uv/)** (for local backend development)
- **Node.js 20+** and **npm** (for local frontend development)

## Quick Start

```bash
git clone <repo-url> && cd oluto
docker-compose up --build
```

Once the stack is running:

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Flower (task monitor) | http://localhost:5555 |
| Health Check | http://localhost:8000/health |
| DB Admin (Adminer) | http://localhost:8080 |

> **Data persistence:** `docker-compose down` preserves all data. `docker-compose down -v` **permanently deletes** the database and Redis data. `docker-compose up --build` is always safe — it rebuilds images without touching data.

## Development Setup

### Backend

```bash
cd backend
uv sync                                                          # Install dependencies
uv run alembic upgrade head                                      # Run migrations
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 # Dev server
```

> Requires a running PostgreSQL instance. Use `docker-compose up db -d` to start just the database.

### Celery Worker (for background tasks)

```bash
# Start Redis + DB if not already running
docker-compose up db redis -d

# Run the Celery worker (processes PDF imports, etc.)
cd backend
celery -A app.worker worker --loglevel=info --queues=default,imports

# Optional: run Flower for task monitoring (http://localhost:5555)
celery -A app.worker flower --port=5555
```

> The worker is included in `docker-compose up` automatically. Manual startup is only needed for local development without Docker.

### Frontend

```bash
cd frontend
npm install
npm run dev -w apps/web    # Next.js dev server on port 3000
```

> The frontend expects the API at `http://localhost:8000/api/v1` by default. Set `NEXT_PUBLIC_API_URL` to override.

## Project Structure

```
oluto/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/endpoints/    # Route handlers
│   │   │   └── deps.py          # Auth & tenant isolation
│   │   ├── core/                # config, security, celery_app
│   │   ├── db/                  # Async session, model registry
│   │   ├── logic/               # Domain logic (tax_canada.py)
│   │   ├── models/              # SQLAlchemy models (incl. async_job.py)
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Business logic (import_parser.py)
│   │   ├── tasks/               # Celery task definitions (import_tasks.py)
│   │   ├── worker.py            # Celery worker entry point
│   │   └── main.py              # FastAPI app entry point
│   ├── alembic/versions/        # Database migrations
│   └── tests/                   # pytest test suite
├── frontend/
│   ├── apps/
│   │   ├── web/                 # Next.js app (app router)
│   │   └── mobile/              # Expo / React Native (scaffolded)
│   └── packages/                # Shared packages (scaffolded)
├── k8s/                         # Kubernetes manifests
│   ├── dev/                     # DEV (1 replica, includes Flower)
│   ├── prod/                    # PROD (2 replicas, no Flower)
│   └── external-secrets/        # Azure Key Vault → K8s secret sync
├── azure-pipelines/             # Azure DevOps CI/CD
│   ├── 01-app-ci.yml           # Build & push Docker images
│   ├── 02-app-cd.yml           # Deploy DEV → approve → PROD
│   └── 03-secrets-setup.yml    # One-time Key Vault population
├── docker-compose.yml           # Full stack (API, worker, Flower, DB, Redis)
├── concept.md                   # Product specification
├── CLAUDE.md                    # Developer guide
└── AGENTS.md                    # Agent instructions
```

## API Documentation

The API is self-documenting via OpenAPI. With the server running, visit:

- **Swagger UI** — http://localhost:8000/docs (interactive)
- **ReDoc** — http://localhost:8000/redoc (reference)

### Endpoint Groups

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/v1/auth` | Register, login, current user |
| Businesses | `/api/v1/businesses` | CRUD for business workspaces |
| Transactions | `/api/v1/businesses/{id}/transactions` | CRUD, filtering, dashboard summary, bulk status |
| Import | `/api/v1/businesses/{id}/transactions/import` | CSV/PDF parse and confirm |
| Jobs | `/api/v1/businesses/{id}/transactions/jobs` | Background task status polling and listing |

## Environment Variables

Configure via `.env` file in `backend/` or through Docker environment.

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_SERVER` | `localhost` | PostgreSQL host |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `oluto_db` | Database name |
| `SECRET_KEY` | *(must change in production)* | JWT signing key |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/0` | Celery results |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `DATABASE_SSL` | `false` | Enable SSL for DB connection (`true` for Azure) |
| `FUELIX_API_KEY` | *(optional)* | AI categorization API key |
| `FUELIX_BASE_URL` | `https://api.fuelix.ai/v1` | AI API endpoint |
| `FUELIX_MODEL` | `claude-haiku-4-5` | AI model name |
| `AZURE_API_KEY` | *(optional)* | Azure API key for PDF import |
| `AZURE_OCR_URL` | *(set in config)* | Mistral Document AI endpoint |
| `AZURE_OCR_MODEL` | `mistral-document-ai-2505` | OCR model name |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | API URL for frontend |

## Testing

```bash
cd backend
uv run pytest              # Run all tests
uv run pytest -v           # Verbose output
uv run ruff check .        # Lint check
```

Tests require a running PostgreSQL instance. Tables are truncated between test runs via the conftest fixtures.

```bash
# Frontend type checking
cd frontend/apps/web
npx tsc --noEmit
```

## Deployment

Oluto runs on Azure Kubernetes Service (AKS) with Azure DevOps CI/CD pipelines.

### Environments

| Environment | URL | Cluster |
|-------------|-----|---------|
| DEV | https://dev.oluto.app | `wackopscoach-dev-aks` |
| PROD | https://oluto.app | `wackopscoach-prod-aks` |

### Architecture

```
                  ┌─────────────────────────────────────────┐
                  │           AKS Cluster (oluto ns)        │
┌──────┐         │                                         │
│ User ├──HTTPS──►  ingress-nginx (path-based routing)     │
└──────┘         │    │                                    │
                  │    ├── /api/*, /docs, /up → backend    │
                  │    └── /*             → frontend       │
                  │                                         │
                  │  ┌──────────┐  ┌──────────┐  ┌───────┐│
                  │  │ backend  │  │ frontend │  │ redis ││
                  │  │ (FastAPI)│  │ (Next.js)│  │       ││
                  │  └────┬─────┘  └──────────┘  └───┬───┘│
                  │       │                          │    │
                  │  ┌────┴─────┐              ┌─────┴──┐ │
                  │  │  worker  │              │ flower │ │
                  │  │ (Celery) │              │(dev only)│
                  │  └──────────┘              └────────┘ │
                  └──────────┬──────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Azure PostgreSQL │
                    │  Flexible Server │
                    └─────────────────┘
```

- **TLS:** cert-manager + Let's Encrypt (automatic certificate provisioning)
- **Secrets:** Azure Key Vault → ExternalSecrets Operator → K8s `oluto-secret`
- **Migrations:** Run as a K8s Job before each deployment
- **Infrastructure as Code:** Terraform (in separate `infotitans-azure` repo)

### CI/CD Pipelines (Azure DevOps)

| Pipeline | Trigger | What it does |
|----------|---------|-------------|
| `01-app-ci.yml` | Push to `backend/**` or `frontend/**` | Build & push `oluto-backend` and `oluto-frontend` images to DEV ACR |
| `02-app-cd.yml` | CI success or manual | Deploy to DEV; after approval, promote images to PROD ACR and deploy to PROD |
| `03-secrets-setup.yml` | Manual | One-time population of application secrets in Key Vault |

### Deploying

Code pushed to `master`/`main` that touches `backend/` or `frontend/` automatically triggers the CI/CD pipeline:

1. **CI** builds Docker images and pushes to the DEV container registry
2. **CD DEV** deploys to the dev cluster and verifies with a health check
3. **CD PROD** (requires manual approval) promotes images from DEV → PROD registry and deploys

For manual deployments, trigger the CD pipeline in Azure DevOps with a specific image tag.

## Roadmap

Development follows a three-phase plan. See [concept.md](concept.md) for the full specification.

| Phase | Name | Focus | Status |
|-------|------|-------|--------|
| 1 | The Onramp | Multi-tenant, statement import, dashboard, exceptions inbox | In progress (~65%) |
| 2 | The Trust Layer | Email-to-Inbox, receipts, audit log, all provinces | Early (~15%) |
| 3 | The Bookkeeper Channel | Co-branding, multi-client review, export, period close | Not started |

### Planned Modules

- **Module A** — Safe-to-Spend Dashboard (partial)
- **Module A1** — Exceptions Inbox (partial)
- **Module A2** — Trust Layer / Import Integrity (partial)
- **Module A3** — Email-to-Inbox (not started)
- **Module B** — Voice-to-Ledger (not started)
- **Module C** — Peer Compass / Benchmarking (not started)
- **Module D** — The Horizon / Predictive Cashflow (not started)
- **Module E** — Bookkeeper Console (not started)

## Contributing

1. Follow existing code patterns and conventions (see [CLAUDE.md](CLAUDE.md))
2. Use `Decimal` for all monetary values — never `float`
3. Maintain tenant isolation: always scope queries by `business_id`
4. Use async/await for all database operations
5. Add tests for new endpoints and logic
6. Run `uv run ruff check .` before submitting changes
7. See [AGENTS.md](AGENTS.md) for detailed technical guidelines

## License

TBD
