# Product Design Specification: Oluto (v1.4)
**"Financial Autopilot for the Modern Builder"**

- **Date:** February 10, 2026
- **Status:** Draft / Alpha
- **Strategy:** Cashflow-First, Mobile-First, Voice-Enabled, Bookkeeper-Led, Co-Branded First.
- **Target Market:** Canadian small businesses (sole proprietors + incorporated) across all provinces/territories, and independent bookkeepers/fractional CFOs (10–30 clients) as the primary distribution wedge.

---

## 1. Product Vision & Philosophy
* **Vision:** To transition small business owners from reactive record-keeping to proactive financial mastery.
* **Philosophy:** "Control & Direction." Oluto is not just watching your money; it’s helping you steer it. Oluto means the guide or regulator, fitting the pivot from a passive "scribe" to an active Financial Copilot.
* **The "Anti-QuickBooks" Stance:**
    * *QuickBooks:* "Here is a report of what you did wrong last month."
    * *Oluto:* "Here is what you need to do today to be safe next month."
* **The Strategic Moat:**
    1.  **Low-Overwhelm UX:** A single cash command center + a 5-minute exceptions inbox (progressive disclosure by default).
    2.  **Trust & Verifiability (Audit-Traceable by Design):** Import integrity checks + confidence scoring + provenance + immutable audit logs so every number is explainable and reviewable.
    3.  **Workflow Moat for Bookkeepers (Close Faster):** Multi-tenant operations with cross-client review queues, client nudges, close checklists, and accountant-ready exports (co-branded in v1; true white-label later).
    4.  **Canada Cashflow Semantics (Rails + Obligations):** “Safe-to-spend” tuned to Canadian payment rails (Interac/e-Transfer, real-time payments timing) and province-aware tax obligations/set-asides.
    5.  **Benchmark Network Effects (Earned):** Constrained categories + merchant normalization enables higher-quality anonymized benchmarks that improve nudges and advisory value over time.

## 1.1 Market Context & Trends (Feb 2026)
Oluto is being built into a market where accounting platforms are rapidly adding AI assistants/agents, regulators are advancing Canada’s consumer-driven banking framework, and firms are prioritizing security and smaller, more integrated stacks.

* **AI is shifting from “features” to agents/autopilots** with increased focus on governance (explainability, oversight) and “slimmer tech stacks.”  
  Reference: https://www.accountingtoday.com/news/the-three-trends-shaping-accounting-technology-in-2026
* **Incumbents are leaning into AI-driven cashflow + collections** (e.g., QuickBooks Assist/Agents and payments automation).  
  References: https://quickbooks.intuit.com/ai-accounting/ and https://quickbooks.intuit.com/payments-agent/
* **Canada consumer-driven banking (open banking) is progressing** but is not universally available yet; legislation and rollout planning have accelerated through 2025–2026.  
  References: https://www.canada.ca/en/financial-consumer-agency/services/banking/open-banking.html and https://www.canada.ca/en/department-finance/programs/financial-sector-policy/open-banking-implementation/budget-2025-canadas-framework-for-consumer-driven-banking.html
* **Real-time payments are becoming central to “cashflow reality”** in Canada, alongside Interac rails; transaction descriptions and timing will change as instant rails roll out.  
  References: https://www.thunes.com/insights/trends/canada-the-next-real-time-payments-powerhouse/ and https://www.payments.ca/sites/default/files/PaymentsCanada_Canadian_Payment_Methods_and_Trends_2025_EN.pdf
* **Digital-first record keeping is the default expectation** (keep records and supporting documents for 6 years, accept digital records).  
  Reference: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/keeping-records/where-keep-your-records-long-request-permission-destroy-them-early.html

**Implication for Oluto v1:** win with clarity + trust (cashflow-first + exceptions workflow), start with statement import (CSV first; PDF best-effort + verification), add low-friction “Email-to-Inbox” forwarding as a primary habit loop, and design the ingestion pipeline so Flinks/Plaid/consumer-driven banking connections become a drop-in source later.

## 2. Target User Personas
**Primary Persona: "Sarah the Service Pro" (Mobile User)**
* **Role:** Owner of a service-based small business (Trades, Consulting, Home Services) anywhere in Canada.
* **Context:** In the truck, hands often dirty, dislikes typing on glass.
* **Goal:** "I want to finish my admin work *during* the day via voice so I can relax at night."

**Secondary Persona: "The Accountant / Bookkeeper" (Firm User)**
* **Role:** Independent bookkeeper/fractional CFO managing multiple Canadian clients (sole props + corporations).
* **Context:** Client review queues, month-end close, frequent context switching, needs repeatable processes.
* **Goal:** "Are the records reviewable and complete?" & "Can I close faster with fewer back-and-forths?"

## 2.2 Self-Serve vs Assisted (No Bookkeeper Required)
Oluto is designed to be **self-serve by default** for founders. Bookkeepers are a **distribution wedge and an optional support layer**, not a requirement.

* **Self-Serve (Founder-Only):** founders use Oluto’s Cash dashboard, Exceptions Inbox, Email-to-Inbox, receipts, and tax set-asides without hiring anyone.
* **Assisted (Founder + Bookkeeper):** founders optionally invite a bookkeeper for monthly close, cleanup, review, and export support; periods can be soft-locked after review.

## 2.1 Collaboration & Governance Model (Founder ↔ Firm)
**Goal:** Founders do the minimum (confirm/attach/flag), and firms do the professional review—without losing traceability.

* **Division of Labor:**
    * **Founder clears the Inbox:** receipts, personal vs business, transfers, recurring confirmations, basic categorization confirmations.
    * **Firm reviews exceptions + closes periods:** low-confidence items, re-coding, consistency checks, client follow-ups, exports.
* **Governance Rules (v1):**
    * Every automated suggestion exposes **confidence + reason + provenance** (rule-based, model-based, historical pattern, etc.).
    * Every change writes to an **audit log** (who/when/what/why).
    * “Soft lock” at month-end: edits require an explicit unlock and leave an audit entry.
* **Client Nudges (Bookkeeper-controlled):**
    * Templates to request missing receipts/confirmations and track completion.

---

## 3. Core Modules & Platform Distribution

### Module A: The "Safe-to-Spend" Dashboard
**Platform:** [Mobile - Primary]
**Objective:** Immediate clarity on liquidity in <5 seconds.

* **Visual:** A "Fuel Gauge" visualization (Green/Yellow/Red).
* **Key Data Points:**
    * **Total Bank Balance:** (Statement-import baseline in v1; roadmap to Flinks/Plaid/consumer-driven banking connections).
    * **The "CRA Lockbox":** (Tax set-aside targets for GST/HST/PST/QST + estimated income tax, configurable and explainable).
    * **The "Safe-to-Spend":** (Total Balance MINUS Lockbox).
* **Interaction:** Tap "Lockbox" to see breakdown. If *Safe-to-Spend* < 10%, background turns Amber.

### Module A1: The "Exceptions Inbox" (5-Minute Daily)
**Platform:** [Mobile & Web]
**Objective:** Keep bookkeeping from becoming overwhelming by focusing only on what needs attention.

* **Examples of Inbox Items:**
    * Needs category (low-confidence suggestion)
    * Missing receipt
    * Possible personal expense
    * Possible transfer match
    * Recurring detected (subscription/bill confirmation)
* **Design Rule:** Every AI suggestion must include confidence + “why” + one-tap undo; all actions write to an audit log.

### Module A2: The "Trust Layer" (Import Integrity + Audit Trail)
**Platform:** [Web & Mobile]
**Objective:** Make statement import and AI outputs reviewable and accountant-grade.

* **Import Integrity Checks:**
    * Statement period capture + opening/closing balances (user-confirmed when needed)
    * Running-balance validation (when balance is available)
    * Duplicate detection + idempotent imports
    * Per-row confidence scoring for PDF extraction, with low-confidence routed to Inbox
    * Graceful failure: “I can’t read this statement with high certainty; please verify these rows”
* **PDF Parsing Strategy (v1):**
    * Prefer deterministic extraction where possible (table extraction libraries and/or specialized vendor APIs).
    * Wrap parsing with human-in-the-loop verification for early customers and iterate on bank-specific templates over the first 1,000 imports.
* **Audit Trail & Provenance:**
    * Trace every transaction field back to source (CSV/PDF/email/voice/manual) and subsequent edits (with actor + timestamp).

### Module A3: "Email-to-Inbox" (Low-Friction Onboarding + Habit Loop)
**Platform:** [Email + Web]
**Objective:** Reduce onboarding friction by letting founders forward statements/receipts without logging into a bank portal every month.

* **Mechanic:** Every business gets a unique upload address (e.g., `yourbiz@upload.oluto.app`) that accepts:
    * bank e-statements (PDF/CSV attachments)
    * receipts (images/PDF)
* **System Behavior:**
    * Auto-creates a `StatementUpload` or `Attachment` and routes uncertainty to the Exceptions Inbox.
    * Replies/notifications confirm success and explicitly call out what needs verification.

### Module B: The "Voice-to-Ledger" (Hands-Free Mode)
**Platform:** [Mobile - Exclusive]
**Objective:** Capture data without typing.
* **The "Big Button":** A prominent microphone button on the home screen accessible without looking.
* **User Flow:**
    1.  User taps button.
    2.  User speaks: *"Paid Terry 200 bucks cash for the site cleanup."*
    3.  **AI Processing:**
        * Transcribes audio (Whisper).
        * Extracts Entity: `Vendor="Terry"`, `Amount=200`, `Category="Subcontractor"`.
        * Flags: `Receipt_Missing=True`, `Payment_Method="Cash"`.
    4.  **Result:** Transaction created in "Pending" state for review.

### Module C: "The Peer Compass" (Benchmarking)
**Platform:** [Mobile & Web]
**Objective:** Contextualize spending using anonymized community data.
* **Feature:** "Smart Nudge" Notifications.
* **Logic Example:**
    * *User Spend:* $800 on Fuel this month (18% of revenue).
    * *Benchmark:* Avg business in your industry + province spends 12% of revenue on fuel.
    * *Alert:* "You are spending 6% more on fuel than peers. Tap to see why."

### Module D: The "Horizon" (Predictive Cash Flow)
**Platform:** [Hybrid]
* **Mobile View (Lite):** 30-day "Cash Floor" alert (e.g., "Dip predicted on March 14th").
* **Desktop View (Pro):** Full 90-day interactive chart powered by **Pandas** time-series forecasting.
* **"What-If" Sandbox:** Drag-and-drop simulated expenses on Desktop to see future impact.

### Module E: The "Bookkeeper Console" (Multi-Client Operations)
**Platform:** [Web - Primary]
**Objective:** Turn Oluto into a distribution and workflow engine for independent bookkeepers and fractional CFOs.

* **Client List + Health:** import integrity status, inbox backlog, receipt completeness, safe-to-spend risk flags.
* **Cross-Client Review Queue:** low-confidence categorizations, anomalies, missing receipts, new merchants/recurring items.
* **Accountant Package Export:** period CSV + attachments bundle + audit log extract + summary for workpapers.
* **Co-Brand Controls (v1):** “Powered by Oluto” + bookkeeper logo, invite emails, client portal presentation (true white-label/custom domains later).

---

## 4. Technical Architecture
**Strategy:** "Python Brain, TypeScript Face" (Optimized for AI & Data Science).

* **Frontend Monorepo (TypeScript):**
    * **Mobile:** **React Native (Expo)**.
    * **Web:** **Next.js**.
    * **API Client:** Auto-generated from Backend OpenAPI schema (Ensures strict typing).
* **Backend API (Python):**
    * **Framework:** **FastAPI** (Async).
    * **Manager:** **uv** (Package management).
    * **Database:** PostgreSQL (Supabase) + SQLAlchemy (Async).
    * **Multi-Tenant:** Firm → Business workspaces, strict tenant scoping, role-based access control, audit logging.
* **Intelligence Layer (The "Autopilot" Core):**
    * **Voice:** **OpenAI Whisper** (via API or local distil-whisper).
    * **Logic:** **LangChain (Python)** using Pydantic for structured data extraction.
    * **Benchmarks:** **Pandas** jobs running nightly to aggregate peer statistics.
    * **Tax Logic:** `tax_engine.py` using Python's `Decimal` type for precise CRA math.
* **Ingestion Layer (v1-first):**
    * **Statement Import:** CSV + PDF parsing into a canonical `Transaction` model with dedupe + confidence scoring.
    * **Open Banking Readiness:** A `Connection` abstraction so future Flinks/Plaid/consumer-driven banking sync plugs into the same pipeline.

## 4.1 Security & Compliance Posture (v1)
This is essential for firm-led adoption and to support future SOC 2-style assurance.

* **Tenant Isolation:** strict firm/business scoping on every query; no cross-tenant access paths.
* **Access Control:** role-based permissions + least privilege defaults (firm admin/staff; business owner/member/read-only).
* **Auditability:** immutable audit log for key actions; export/download logs for sensitive operations.
* **Data Protection:** encryption in transit; encrypt sensitive data at rest where feasible; secure object storage for receipts/statements with scoped access.

## 5. UI/UX Guidelines
* **Mobile Principle:** "Thumb Zone & Voice First." Key actions must be reachable with one thumb; voice input must have haptic feedback.
* **Desktop Principle:** "Information Density." Use screen real estate for deep analysis.
* **Visual Language:**
    * 🟢 Green: Safe / Under Budget.
    * 🔴 Red: Danger / Over Budget.
    * 🔵 Blue: Community Insight / Benchmark Data.

---

## 6. Development Roadmap (First 6 Months)
| Phase | Timeline | Focus | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Month 1-2 | **The "Onramp"** | Multi-tenant foundations + statement import (CSV) + Safe-to-Spend + Exceptions Inbox. |
| **Phase 2** | Month 3-4 | **The "Trust Layer"** | Email-to-Inbox (P0) + PDF import (best-effort + verification) + receipts + audit log + tax set-aside guardrails (all provinces). |
| **Phase 3** | Month 5-6 | **The "Bookkeeper Channel"** | Co-branding + multi-client review queue + accountant export package + close checklist (soft lock). |

---
---

# Appendix: System Design Prompt (Python + Voice)
**Usage:** Copy/Paste this into your AI Coding Assistant to generate the project scaffolding.

## Stack Decision Notes (2026)
This stack remains a strong fit for Oluto’s 2026 goals (cashflow-first UX, statement ingestion, AI governance, and firm workflows), with a few explicit choices to reduce future rework.

* **Backend API: FastAPI + Pydantic + OpenAPI** remains well-aligned for API-first products and audit-friendly typed contracts. AI systems in 2026 are trending toward more governance and traceability, which benefits from strict schemas and explicit provenance.
  Reference: https://www.accountingtoday.com/news/the-three-trends-shaping-accounting-technology-in-2026
* **Database: Postgres (Supabase) + Row Level Security (RLS)** is recommended for multi-tenant isolation. RLS reduces the risk of “missed tenant filter” classes of bugs by enforcing isolation at the database layer.
  Reference: https://supabase.com/features/row-level-security
* **Storage: private buckets + signed URLs + Storage policies (RLS)** for statements and receipts, plus download/export audit logs (important for firm trust and audit-readiness).
  Reference: https://supabase.com/docs/guides/storage/security/access-control
* **Jobs/Orchestration:** Oluto needs background processing for PDF ingestion, integrity checks, exports, and benchmarks; pick and standardize a worker/orchestrator early (retries + idempotency are non-negotiable).
* **AI Orchestration:** Keep the “Autopilot” core as a thin abstraction with observability and deterministic fallbacks. Frameworks shift quickly in 2026; avoid deep coupling to any single agent framework (e.g., LangChain-only).
* **Frontend: React Native (Expo) + Next.js** is suitable for mobile-first + firm console. White-label/multi-tenant is primarily theming + build configuration; plan for both runtime theming (tenant branding) and build-time variants (icons, app name) where required.
* **Hosting posture:** Next.js hosting can become cost- and compliance-sensitive as you scale; plan for portability (self-host or alternative platforms) even if you start on a managed provider.
* **Canada landscape readiness:** keep ingestion connection-agnostic (statement import now; consumer-driven banking/open banking later) and model payment descriptor changes as RTR rolls out.
  References: https://www.canada.ca/en/financial-consumer-agency/services/banking/open-banking.html and https://www.payments.ca/systems-services/payment-systems/real-time-rail-payment-system

### Master Prompt
```text
Role: Senior Architect & Python Engineer.
Project: "Oluto" (Financial Autopilot for Canada).
Stack: React Native (Expo) + FastAPI (Python) + PostgreSQL.

### ARCHITECTURAL GOALS
1. **Python Backend (FastAPI):**
   - Use 'uv' for dependency management.
   - Implement 'SQLAlchemy' (Async) for DB access.
   - Expose 'openapi.json' for frontend type generation.
   - Implement strict multi-tenant scoping (Firm -> Business) with RBAC and an immutable audit log.
   - Store statements/receipts in secure object storage (scoped access, signed URLs, download audit logs).

2. **Ingestion Module (v1-first):**
   - **Statement Import (CSV):** guided column mapping, saved templates per institution, dedupe/idempotency, and import preview.
   - **Statement Import (PDF):** table extraction, per-row confidence scoring, statement period + opening/closing balance confirmation, and integrity checks (running-balance when available).
   - **Email-to-Inbox (P0):** per-business upload email address to accept statements/receipts as attachments; create uploads/attachments and route uncertainty to the Exceptions Inbox.
   - Normalize all sources into a canonical 'Transaction' model with source provenance.
   - Create a 'Connection' abstraction so future Flinks/Plaid/consumer-driven banking can reuse the same pipeline.

3. **Autopilot Services (AI + Rules):**
   - **Voice:** Create a service that accepts audio files, sends them to OpenAI Whisper, and returns text.
   - **Categorization:** Create an explainable suggestion engine (rules + model) that outputs: {Suggested_Category, Confidence, Why, Provenance}.
   - **Exceptions Inbox:** Create a workflow for items that require attention (missing receipt, low-confidence category, possible transfer, possible personal, recurring detected) with assignment and status.
   - **Benchmarks:** Create a Pandas service that calculates "Average Spend %" per industry category.

4. **Tax Logic (Canada):**
   - Create a 'tax_engine.py' module using Python's 'Decimal' class.
   - Implement province-aware tax set-aside targets (GST/HST/PST/QST) and configurable reserve logic (explainable defaults, not full tax calculation in v1).
   - Provide reminder scaffolding for filing/obligation cadence (configurable per business).

5. **Exports (Accountant Package):**
   - Export period transactions (CSV), attachments bundle, rules summary, and audit log extract.

### OUTPUT DELIVERABLES
1. **Folder Structure:** Tree view of 'backend-api' (Python) and 'frontend-app' (TS).
2. **FastAPI Main:** Example endpoints for statement upload (CSV/PDF), inbox, and receipt attachment.
3. **Pydantic Models:** Schemas for Tenant/Firm/Business, Account, StatementUpload, Transaction, InboxItem, Attachment, AuditLog, TaxProfile.
4. **Ingestion Notes:** How dedupe, confidence scoring, and provenance are implemented.
```
