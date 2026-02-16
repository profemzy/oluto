# Oluto Product Roadmap

**Last updated:** February 14, 2026
**Format:** Now / Next / Later
**Product status:** Alpha — Deployed (DEV + PROD)

---

## Status Overview

| Status | Count | Details |
|--------|-------|---------|
| **Done** | 3 phases | Phases 1–3 complete (core platform, trust layer, revenue accuracy) |
| **On Track** | 2 items | Landing page polish, infrastructure hardening |
| **Not Started** | 1 phase + 5 post-launch | Phase 4 (Bookkeeper Channel) + post-launch initiatives |

---

## NOW — Active & Imminent

These are in progress or ready to start immediately.

| Item | Description | Status | Owner | Dependencies |
|------|-------------|--------|-------|--------------|
| **Phase 1: The Onramp** | Multi-tenant foundations, CSV statement import, Safe-to-Spend (estimated), AI categorization (Fuelix), tax engine (all 13 provinces), dashboard, transactions, contacts, accounts, reports | **Done** | Engineering | — |
| **Phase 2: The Trust Layer** | PDF import (Mistral OCR), receipt upload with OCR tax extraction, receipt-to-transaction attachment, bank reconciliation with duplicate detection, generic multi-bank PDF parser | **Done** | Engineering | Phase 1 |
| **Phase 3: Revenue Accuracy** | Invoicing (create, line items, status tracking, payments), bills (AP with line items, receipts), customer payments (apply to invoices), vendor bill payments (apply to bills), AR aging reports | **Done** | Engineering | Phase 2 |
| **Landing page & auth polish** | Dark mode, forgot password flow, theme toggle, hero/features/CTA sections, privacy & terms pages | **Done** | Engineering | — |
| **Infrastructure (DEV + PROD)** | AKS clusters, ACR registries, CI/CD pipelines (Azure DevOps), cert-manager TLS, ExternalSecrets for Azure Key Vault, Redis, Ingress routing, Terraform for DB provisioning | **Done** | DevOps | — |
| **Phase 4: Bookkeeper Channel** | Co-branding, multi-client review queue, per-client Data Completeness Scores, accountant export package (CRA-ready workpapers), close checklist with soft lock | **Not Started** | — | Phase 3 |

### Risks & Notes (Now)

- **Phase 4 is the next major milestone** and the primary go-to-market unlock. Bookkeeper adoption = 10–30 client businesses per bookkeeper.
- **Email-to-Inbox was deferred** from Phase 2 in favor of receipt upload + OCR + reconciliation. It remains a gap for the low-friction onboarding habit loop.
- **Mobile app (Expo/React Native) is scaffolded but not implemented.** All current functionality is web-only.

---

## NEXT — Planned for Post-Launch (Months 9–14)

These follow Phase 4 completion and are ordered by strategic priority.

| Item | Description | Status | Priority | Dependencies |
|------|-------------|--------|----------|--------------|
| **Predictive Cashflow (Horizon)** | 30-day cash floor alerts (mobile), 90-day interactive chart (desktop), what-if sandbox for simulating expenses. Powered by verified Level 4 data. | **Not Started** | P0 | Phase 4, verified financial data pipeline |
| **Voice-to-Ledger** | Hands-free expense capture via OpenAI Whisper on mobile. "Paid Terry 200 bucks cash for cleanup" → parsed transaction in pending state. Core to Sarah persona. | **Not Started** | P1 | Mobile app implementation, Whisper integration |
| **Email-to-Inbox** | Per-business upload email (yourbiz@upload.oluto.app). Auto-ingest forwarded bank statements and receipts. Key habit loop for retention. | **Not Started** | P1 | Email infrastructure, attachment parsing pipeline |
| **MCP Server + API Tokens** | Expose Oluto data as an MCP server for external AI tools. Scoped read-only tokens. Pro tier feature. Turns AI tool ecosystem into distribution advantage. | **Not Started** | P2 | Stable API surface, token management |
| **Open Banking (Flinks/Plaid)** | Live bank feed connections via consumer-driven banking. Drop-in data source using existing Connection abstraction. Pro tier feature. | **Not Started** | P2 | Canadian open banking framework readiness, Connection abstraction |

### Risks & Notes (Next)

- **Voice-to-Ledger requires mobile app** — currently only scaffolded. Mobile investment is a prerequisite.
- **Open Banking timing depends on Canadian regulatory rollout** — legislation is progressing but not universally available yet.
- **MCP Server leverages existing OpenAPI schema** — lower effort than other items.

---

## LATER — Strategic Horizon

These are validated ideas that require user base scale or market timing.

| Item | Description | Status | Priority | Dependencies |
|------|-------------|--------|----------|--------------|
| **Peer Compass Benchmarking** | Anonymized industry/province spending benchmarks. "You spend 6% more on fuel than peers." Network effects create a moat. | **Not Started** | P3 | Critical mass of users for meaningful benchmarks |
| **Mobile App (Full)** | React Native/Expo implementation of core flows — Safe-to-Spend dashboard, exceptions inbox, receipt capture, voice input. | **Not Started** | P1 | Design system, API client shared package |
| **White-Label / Custom Domains** | True white-label for accounting firms beyond co-branding. Custom domains, full firm branding. | **Not Started** | P3 | Phase 4 co-branding validated |
| **CRA e-Filing Integration** | Direct filing to MyBusiness Account for GST/HST remittance. | **Not Started** | P3 | Regulatory approval, CRA API access |
| **Payment Processing Integration** | Stripe/Square reconciliation for businesses that accept card payments. | **Not Started** | P3 | Open Banking, reconciliation engine maturity |
| **Recurring Invoices & Time Tracking** | Advanced invoicing features beyond v1 scope. | **Not Started** | P3 | Phase 3 invoicing validated with users |

---

## Changes This Update

This is the **initial roadmap document**, created from the concept spec (v1.5) and current codebase state as of February 14, 2026.

**Key observations:**

- Phases 1–3 were completed ahead of the original 6-month schedule, which is a strong signal of execution velocity.
- The backend pivot from Python/FastAPI to Rust/Axum (LedgerForge) is fully realized and deployed.
- Infrastructure is production-ready with DEV and PROD environments on Azure AKS.
- The web app has 64 files and 13,500+ lines of TypeScript covering the full transaction lifecycle, invoicing, bills, payments, contacts, accounts, reconciliation, and reporting.
- The **12–18 month competitive window** (before US AI-native competitors expand to Canada) makes Phase 4 and bookkeeper channel activation time-critical.

---

## Capacity & Strategic Notes

- **Team capacity is not documented** — roadmap timing assumptions should be validated against actual team size and velocity.
- **Phase 4 is the highest-leverage next step.** It unlocks the bookkeeper distribution channel, which is the primary GTM strategy.
- **The general-purpose AI threat (Section 1.3 of concept)** reinforces that Oluto's defensibility lies in persistent state, audit trails, and multi-party collaboration — all of which are strengthened by Phase 4.
- **Email-to-Inbox should be reconsidered for earlier delivery** — it was deferred from Phase 2 but is critical for the daily habit loop that drives retention.
