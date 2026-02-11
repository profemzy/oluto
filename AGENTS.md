# Oluto - AI Coding Agent Guide

> **"Financial Autopilot for the Modern Builder"**
>
> Oluto is a cashflow-first financial management platform for Canadian small businesses, featuring voice-enabled transaction capture, AI-powered categorization, and a bookkeeper console for multi-client operations.

---

## Project Overview

### Vision
Transition small business owners from reactive record-keeping to proactive financial mastery. Oluto means "the guide or regulator" - acting as an active Financial Copilot rather than a passive scribe.

### Target Market
- **Primary**: Canadian small business owners (sole proprietors + incorporated) across all provinces/territories
- **Secondary**: Independent bookkeepers/fractional CFOs managing 10-30 clients

### Architecture Philosophy
**"Python Brain, TypeScript Face"** - Optimized for AI & Data Science:
- Backend: Python (FastAPI) for AI/ML capabilities
- Frontend: TypeScript (Next.js + React Native) for type-safe UI

---

## Technology Stack

### Backend (`/backend`)
| Component | Technology |
|-----------|------------|
| Framework | FastAPI (async) |
| Python | >= 3.14 |
| Package Manager | `uv` |
| Database | PostgreSQL 18 |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Task Queue | Celery + Redis |
| Auth | JWT (python-jose) + Argon2 (passlib) |
| AI/ML | OpenAI-compatible API (Fuelix), Pandas |
| PDF Processing | pdf2image |
| Testing | pytest + pytest-asyncio |
| Linting | ruff |

### Frontend (`/frontend`)
| Component | Technology |
|-----------|------------|
| Monorepo | npm workspaces |
| Web App | Next.js 16.1.6 + React 19 |
| Mobile App | React Native 0.83 + Expo ~54.0 |
| Language | TypeScript 5.0 |
| CSS | Tailwind CSS 4 |
| Shared Packages | `api-client`, `ui`, `utils` (scaffolded) |

### Infrastructure
| Component | Technology |
|-----------|------------|
| Containerization | Docker + Docker Compose |
| Orchestration | Azure Kubernetes Service (AKS) |
| CI/CD | Azure DevOps Pipelines |
| Container Registry | Azure Container Registry (ACR) — dev + prod |
| Secrets | Azure Key Vault + ExternalSecrets Operator |
| TLS | cert-manager + Let's Encrypt |
| Ingress | ingress-nginx (path-based routing) |
| IaC | Terraform (separate repo: `infotitans-azure/terraform/oluto/`) |
| Cache/Queue | Redis 8.4.0-alpine |
| Task Monitor | Flower (port 5555, dev only) |

---

## Project Structure

```
oluto/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py         # FastAPI dependencies (auth, DB, tenant isolation)
│   │   │   ├── helpers.py      # Reusable CRUD helpers (get_or_404, etc.)
│   │   │   └── v1/
│   │   │       ├── api.py      # API router aggregation
│   │   │       └── endpoints/
│   │   │           ├── auth.py              # Login, register, current user
│   │   │           ├── businesses.py        # Business CRUD, user invites
│   │   │           ├── transactions.py      # Transaction CRUD, summary, suggest-category, bulk-status
│   │   │           ├── import_transactions.py  # CSV/PDF import (parse + confirm)
│   │   │           └── jobs.py              # Async job status polling
│   │   ├── core/
│   │   │   ├── celery_app.py   # Celery configuration (queues, retries, routing)
│   │   │   ├── config.py       # Pydantic settings (env vars, incl. POSTGRES_PORT)
│   │   │   └── security.py     # Password hashing, JWT tokens
│   │   ├── db/
│   │   │   ├── base.py         # Model imports for Alembic
│   │   │   └── session.py      # Async DB engine & session
│   │   ├── logic/
│   │   │   └── tax_canada.py   # Province-aware GST/HST/PST/QST calculations
│   │   ├── models/
│   │   │   ├── user.py         # User & Business entities
│   │   │   ├── transaction.py  # Transaction entity
│   │   │   └── async_job.py    # Background job tracking entity
│   │   ├── schemas/            # Pydantic request/response models
│   │   │   ├── auth.py
│   │   │   ├── business.py
│   │   │   ├── transaction.py
│   │   │   └── async_job.py
│   │   ├── services/
│   │   │   ├── ai_engine/
│   │   │   │   └── categorizer.py    # AI categorization (Fuelix/OpenAI-compatible)
│   │   │   ├── import_parser.py      # CSV/PDF statement parsing + duplicate detection
│   │   │   ├── transaction_service.py # Transaction creation with tax calc
│   │   │   └── ocr_utils.py          # OCR response text extraction
│   │   ├── tasks/
│   │   │   └── import_tasks.py  # Celery task definitions (PDF import via OCR)
│   │   ├── worker.py           # Celery worker entry point
│   │   └── main.py             # FastAPI app entry point
│   ├── alembic/                # Database migrations
│   │   └── versions/           # Migration scripts
│   ├── tests/
│   │   ├── api/                # API endpoint tests
│   │   │   ├── test_businesses.py
│   │   │   ├── test_transactions.py
│   │   │   ├── test_import_transactions.py
│   │   │   └── test_suggest_category.py
│   │   ├── test_ai_categorizer.py
│   │   ├── test_import_parser.py
│   │   └── conftest.py         # pytest fixtures (async DB, client)
│   ├── scripts/                # Utility scripts
│   ├── pyproject.toml          # Python dependencies (uv)
│   ├── alembic.ini             # Alembic configuration
│   └── Dockerfile              # Python 3.14-slim + uv
│
├── frontend/                   # TypeScript monorepo
│   ├── apps/
│   │   ├── mobile/             # React Native (Expo)
│   │   │   ├── App.js
│   │   │   └── package.json
│   │   └── web/                # Next.js web app
│   │       ├── app/
│   │       │   ├── auth/              # Login + Register pages
│   │       │   │   ├── login/page.tsx
│   │       │   │   └── register/page.tsx
│   │       │   ├── dashboard/page.tsx
│   │       │   ├── onboarding/
│   │       │   │   └── setup-business/page.tsx
│   │       │   ├── transactions/
│   │       │   │   ├── page.tsx       # Transaction list
│   │       │   │   ├── new/page.tsx   # Add transaction
│   │       │   │   └── import/page.tsx # Import CSV/PDF
│   │       │   ├── sections/          # Landing page sections
│   │       │   │   ├── HeroSection.tsx
│   │       │   │   ├── FeaturesSection.tsx
│   │       │   │   ├── HowItWorksSection.tsx
│   │       │   │   ├── DashboardPreview.tsx
│   │       │   │   └── CTASection.tsx
│   │       │   ├── components/
│   │       │   │   ├── ui/            # Shared UI components
│   │       │   │   │   ├── ErrorAlert.tsx
│   │       │   │   │   ├── PageLoader.tsx
│   │       │   │   │   └── PageHeader.tsx
│   │       │   │   ├── Navigation.tsx
│   │       │   │   ├── Footer.tsx
│   │       │   │   └── index.ts       # Barrel export
│   │       │   ├── hooks/
│   │       │   │   └── useAuth.ts     # Auth check + redirect hook
│   │       │   ├── lib/
│   │       │   │   ├── api.ts         # API client (all backend calls)
│   │       │   │   ├── constants.ts   # Shared constants (CRA_CATEGORIES)
│   │       │   │   └── format.ts      # Currency/date formatters
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx           # Landing page
│   │       ├── public/
│   │       ├── Dockerfile
│   │       ├── next.config.js
│   │       ├── package.json
│   │       └── tsconfig.json
│   ├── packages/
│   │   ├── api-client/         # Auto-generated from OpenAPI (scaffolded)
│   │   ├── ui/                 # Shared UI components (scaffolded)
│   │   └── utils/              # Shared utilities (scaffolded)
│   ├── package.json            # Root monorepo config
│   └── package-lock.json
│
├── k8s/                           # Kubernetes manifests
│   ├── dev/                       # DEV environment (1 replica, flower)
│   │   ├── namespace.yaml
│   │   ├── redis.yaml
│   │   ├── migration-job.yaml     # Alembic migration K8s Job
│   │   ├── backend-deployment.yaml
│   │   ├── worker-deployment.yaml
│   │   ├── flower-deployment.yaml # Dev only
│   │   ├── frontend-deployment.yaml
│   │   ├── services.yaml
│   │   └── ingress.yaml           # dev.oluto.app
│   ├── prod/                      # PROD environment (2 replicas, no flower)
│   │   ├── namespace.yaml
│   │   ├── redis.yaml
│   │   ├── migration-job.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── worker-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── services.yaml
│   │   └── ingress.yaml           # oluto.app
│   └── external-secrets/
│       ├── dev/external-secret.yaml
│       └── prod/external-secret.yaml
│
├── azure-pipelines/               # Azure DevOps CI/CD
│   ├── 01-app-ci.yml             # Build + push images to DEV ACR
│   ├── 02-app-cd.yml             # Deploy DEV → approve → PROD
│   └── 03-secrets-setup.yml      # One-time Key Vault population
│
├── docker-compose.yml          # Full stack orchestration (local dev)
├── concept.md                  # Product specification
├── CLAUDE.md                   # Project guide for Claude Code
└── AGENTS.md                   # This file
```

---

## Build and Development Commands

### Full Stack (Docker Compose)
```bash
# Start all services (Redis, Backend, Worker, Flower, Frontend)
docker-compose up --build

# Access points:
# - Web App: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - Flower: http://localhost:5555
```

### Backend (Local Development)
```bash
cd backend

# Install dependencies (requires uv)
uv sync

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
uv run pytest

# Run linting
uv run ruff check .
```

### Frontend (Local Development)
```bash
cd frontend

# Install dependencies
npm install

# Run web app
npm run dev -w apps/web

# Run mobile app (Expo)
npm run start -w apps/mobile

# Build web app
npm run build -w apps/web
```

---

## Key Domain Concepts

### Multi-Tenant Architecture
- **Business** is the tenant/organization entity
- **Users** belong to a Business (via `business_id`, nullable until onboarding)
- All queries must filter by `business_id` for tenant isolation
- Bookkeepers can manage multiple businesses (future feature)

### Transaction State Machine
```
DRAFT → PROCESSING → INBOX_USER/INBOX_FIRM → READY → POSTED
```

### User Roles
- `founder` - Business owner
- `bookkeeper` - External accountant
- `staff` - Team member
- `admin` - Full access

### Canadian Tax Support
- Province-aware GST/HST/PST/QST calculations
- Current rates in `app/logic/tax_canada.py`
- All 13 provinces/territories supported
- Uses `Decimal` for precision

### AI Categorization
- Fuelix (OpenAI-compatible API) for CRA T2125 expense categories
- Config: `FUELIX_API_KEY`, `FUELIX_BASE_URL`, `FUELIX_MODEL` env vars
- Categorizer owns its config — callers never pass API keys
- Graceful degradation: unconfigured AI = skip silently
- Single-vendor suggestions + batch categorization on import

---

## Database Schema

### Core Tables

**businesses** - The tenant entity
- `id`, `name`, `province`, `tax_profile`, `created_at`

**users** - Staff members
- `id`, `email` (unique), `hashed_password`, `full_name`, `role`
- `business_id` (FK, nullable), `is_active`, `created_at`

**transactions** - Financial events
- `id`, `vendor_name`, `amount` (Numeric), `currency`, `transaction_date`
- `category`, `description`, `status` (indexed)
- `ai_confidence`, `ai_suggested_category`
- `gst_amount`, `pst_amount` (Canadian tax)
- `source_device`, `batch_id`, `import_source`
- `business_id` (FK), `created_at`, `updated_at`

**async_jobs** - Background task tracking
- `id`, `job_type`, `status`, `progress`, `progress_message`
- `result_data`, `error_message`
- `business_id` (FK), `created_at`, `updated_at`

### Migrations
- Use Alembic for schema changes
- Auto-generate: `uv run alembic revision --autogenerate -m "description"`
- Apply: `uv run alembic upgrade head`

---

## Code Style Guidelines

### Python (Backend)
- **Formatter**: ruff (configured in pyproject.toml)
- **Async**: All DB operations use `async`/`await` with SQLAlchemy async
- **Type Hints**: Use full type annotations
- **Models**: SQLAlchemy 2.0 style with `Mapped[]` and `mapped_column()`
- **Schemas**: Pydantic v2 with `ConfigDict(from_attributes=True)`
- **DRY**: Use `api/helpers.py` for repeated DB lookups, `services/transaction_service.py` for transaction creation
- **Security**:
  - Never commit `.env` files
  - Use `Decimal` for financial calculations
  - Argon2 for password hashing

### TypeScript (Frontend)
- **Formatter**: Prettier
- **Linter**: Next.js built-in ESLint
- **DRY**: Use `useAuth` hook for auth checks, shared UI components from `components/ui/`, constants from `lib/constants.ts`
- Use strict TypeScript configuration

---

## Testing Instructions

### Backend Tests
```bash
cd backend

# Run all tests (72 tests)
uv run pytest

# Run with verbose output
uv run pytest -v

# Run specific test file
uv run pytest tests/api/test_transactions.py

# Run with coverage (add pytest-cov to dev deps first)
# uv run pytest --cov=app
```

### Test Structure
- `conftest.py` - Shared fixtures for async DB engine, sessions, and HTTP client
- Database is truncated before each test for isolation
- Uses `httpx.AsyncClient` with `ASGITransport` for FastAPI testing
- Helper: `_create_business_user_and_login()` for test setup

### Writing Tests
```python
@pytest.mark.asyncio
async def test_example(async_client: AsyncClient, db_session: AsyncSession):
    # Test code here
    pass
```

---

## Security Considerations

### Authentication
- JWT tokens with 7-day expiration (configurable)
- OAuth2 Password Bearer flow
- Argon2 for secure password hashing

### Authorization
- `get_current_user` - Extracts user from JWT
- `get_current_active_user` - Ensures user is active
- `require_business_access` - Tenant isolation check

### Data Protection
- Tenant isolation on ALL database queries
- No cross-tenant access paths allowed
- Immutable audit logging (planned)

### Secrets Management
- Environment variables via `.env` file
- `SECRET_KEY` must be changed in production
- Use `openssl rand -hex 32` to generate secrets

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - Login (OAuth2 form)
- `GET /api/v1/auth/me` - Current user profile

### Businesses
- `POST /api/v1/businesses` - Create business
- `GET /api/v1/businesses` - List accessible businesses
- `GET /api/v1/businesses/{id}` - Get business details
- `PATCH /api/v1/businesses/{id}` - Update business
- `POST /api/v1/businesses/{id}/users` - Invite user

### Transactions
- `POST /api/v1/businesses/{id}/transactions` - Create transaction
- `GET /api/v1/businesses/{id}/transactions` - List transactions (filterable by status)
- `GET /api/v1/businesses/{id}/transactions/{txn_id}` - Get transaction
- `PATCH /api/v1/businesses/{id}/transactions/{txn_id}` - Update transaction
- `DELETE /api/v1/businesses/{id}/transactions/{txn_id}` - Delete transaction
- `GET /api/v1/businesses/{id}/transactions/summary` - Dashboard summary (income, expenses, net)
- `POST /api/v1/businesses/{id}/transactions/suggest-category` - AI category suggestion
- `PATCH /api/v1/businesses/{id}/transactions/bulk-status` - Bulk status update (by batch_id)

### Import
- `POST /api/v1/businesses/{id}/transactions/import/parse` - Parse CSV/PDF file
- `POST /api/v1/businesses/{id}/transactions/import/confirm` - Confirm and import parsed transactions

### Jobs
- `GET /api/v1/businesses/{id}/transactions/jobs` - List async jobs
- `GET /api/v1/businesses/{id}/transactions/jobs/{job_id}` - Get job status (for polling)

### Health Check
- `GET /health` - Service status (API + Redis + DB)

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## Development Roadmap (from concept.md)

### Phase 1 (Month 1-2): The "Onramp"
- Multi-tenant foundations
- Statement import (CSV)
- Safe-to-Spend dashboard
- Exceptions Inbox

### Phase 2 (Month 3-4): The "Trust Layer"
- Email-to-Inbox forwarding
- PDF import with verification
- Receipts attachment
- Audit logging
- Tax set-aside guardrails

### Phase 3 (Month 5-6): The "Bookkeeper Channel"
- Co-branding support
- Multi-client review queue
- Accountant export package
- Period close checklist

---

## Environment Variables

### Backend (`.env`)
```bash
# Database
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=oluto_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Celery/Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# AI (Fuelix/OpenAI-compatible)
FUELIX_API_KEY=your-api-key
FUELIX_BASE_URL=https://api.fuelix.ai/v1
FUELIX_MODEL=your-model-name
```

### Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Important Notes for AI Agents

1. **Always use async patterns** for database operations in the backend
2. **Never skip tenant isolation** - always verify `business_id` matches
3. **Use Decimal for money** - never use float for financial calculations
4. **Add tests for new endpoints** - follow existing patterns in `tests/api/`
5. **Run migrations after model changes** - use Alembic, don't manually edit schema
6. **Update both Pydantic schemas AND SQLAlchemy models** when changing data structures
7. **Use existing helpers** - `api/helpers.py` for DB lookups, `services/transaction_service.py` for transaction creation
8. **Use existing frontend patterns** - `useAuth` hook for auth, shared UI components, constants from `lib/constants.ts`
9. **Follow existing comment style** - docstrings for functions, inline for complex logic
10. **Keep concept.md in sync** - if implementing features from the spec, note progress

---

## Deployment & Infrastructure

### Environments

| Env | Domain | AKS Cluster | ACR | Ingress IP |
|-----|--------|-------------|-----|------------|
| DEV | `dev.oluto.app` | `wackopscoach-dev-aks` | `wackopscoachdevacr` | `20.245.222.212` |
| PROD | `oluto.app` | `wackopscoach-prod-aks` | `wackopscoachprodacr` | `23.100.46.173` |

### Kubernetes Architecture
- **Namespace:** `oluto` on each cluster
- **Path-based ingress:** `/api/*`, `/health`, `/docs`, `/redoc`, `/up` → `oluto-backend:80`; `/*` → `oluto-frontend:80`
- **TLS:** cert-manager + Let's Encrypt `letsencrypt-prod` ClusterIssuer (HTTP-01 solver via nginx)
- **Secrets:** ExternalSecrets Operator syncs Azure Key Vault → K8s `oluto-secret` (14 env vars)
- **Redis:** In-cluster deployment per namespace, accessed at `redis://redis:6379/0`
- **Migrations:** K8s Job `oluto-migration` runs `uv run alembic upgrade head` — Jobs are immutable, CD deletes old job before redeploying
- **Flower:** DEV only — Celery monitoring UI at `/flower`

### CI/CD Flow (Azure DevOps)
1. **CI** (`01-app-ci.yml`): Triggered by code push to `backend/**` or `frontend/**`. Builds 2 Docker images (`oluto-backend`, `oluto-frontend`) and pushes to DEV ACR
2. **CD** (`02-app-cd.yml`): Triggered by CI success. Deploys to DEV, then (after manual approval) promotes images from DEV ACR → PROD ACR via `az acr import` and deploys to PROD
3. **Secrets** (`03-secrets-setup.yml`): Manual pipeline to populate Key Vault with app secrets

### Terraform (separate repo)
Located at `infotitans-azure/terraform/oluto/`:
- `database.tf` — Creates `oluto_db` on existing WackOps-Coach PostgreSQL Flexible Server
- `keyvault-secrets.tf` — Stores DB connection info (host, port, user, db name) in Key Vault
- `locals.tf` — Naming conventions (`wackopscoach-${env}-*`)
- DB password reuses existing `postgres-password` from wackops-coach Terraform (same server, same admin user)

### Deployment Gotchas
1. **`DATABASE_SSL=true`** must be set for Azure PostgreSQL (rejects unencrypted connections)
2. **DB password URL-encoding:** `config.py` uses `urllib.parse.quote(password, safe="")` because `PostgresDsn.build()` doesn't escape `?`, `!`, `)`, `=` in passwords
3. **Celery sync URL:** `psycopg2` needs `?sslmode=require` not `?ssl=require` — handled in `import_tasks.py`
4. **Alembic configparser:** `env.py` must escape `%` as `%%` in database URL
5. **K8s Jobs are immutable:** Must delete old job before redeploying
6. **Ingress-nginx health probe:** Requires `service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path=/healthz` annotation
7. **Namespace ordering:** Namespace must be created before ExternalSecret in CD pipeline
8. **Azure DevOps free tier:** 1 parallel job across all projects — queued runs wait

### Environment Variables (K8s / Key Vault)

All env vars are synced from Azure Key Vault via ExternalSecrets:

| Key Vault Secret | K8s Env Var | Source |
|-----------------|-------------|--------|
| `oluto-postgres-host` | `POSTGRES_SERVER` | Terraform |
| `oluto-postgres-port` | `POSTGRES_PORT` | Terraform |
| `oluto-postgres-user` | `POSTGRES_USER` | Terraform |
| `postgres-password` | `POSTGRES_PASSWORD` | WackOps-Coach Terraform |
| `oluto-postgres-db` | `POSTGRES_DB` | Terraform |
| `oluto-secret-key` | `SECRET_KEY` | 03-secrets-setup pipeline |
| `oluto-celery-broker-url` | `CELERY_BROKER_URL` | 03-secrets-setup pipeline |
| `oluto-celery-result-backend` | `CELERY_RESULT_BACKEND` | 03-secrets-setup pipeline |
| `oluto-fuelix-api-key` | `FUELIX_API_KEY` | 03-secrets-setup pipeline |
| `oluto-fuelix-base-url` | `FUELIX_BASE_URL` | 03-secrets-setup pipeline |
| `oluto-fuelix-model` | `FUELIX_MODEL` | 03-secrets-setup pipeline |
| `oluto-azure-api-key` | `AZURE_API_KEY` | 03-secrets-setup pipeline |
| `oluto-azure-ocr-url` | `AZURE_OCR_URL` | 03-secrets-setup pipeline |
| `oluto-azure-ocr-model` | `AZURE_OCR_MODEL` | 03-secrets-setup pipeline |

`DATABASE_SSL=true` is set directly in K8s deployment manifests (not from Key Vault).

---

## Contact & Resources

- **Product Spec**: See `concept.md` for detailed feature specifications
- **Docker Compose**: Full local stack configuration
- **API Docs**: Auto-generated at `/docs` when server is running
