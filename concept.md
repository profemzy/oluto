# Product Design Specification: Oluto (v1.5)
**"Financial Autopilot for the Modern Builder"**

- **Date:** February 14, 2026
- **Status:** Alpha — Deployed (DEV: dev.oluto.app, PROD: oluto.app)
- **Strategy:** Cashflow-First, Mobile-First, Voice-Enabled, Bookkeeper-Led, Co-Branded First.
- **Target Market:** Canadian small businesses (sole proprietors + incorporated) across all provinces/territories, and independent bookkeepers/fractional CFOs (10–30 clients) as the primary distribution wedge.
- **Competitive Position:** Oluto occupies the uncontested intersection of three dimensions no current competitor combines: cashflow-first UX, Canadian-native tax intelligence, and trust-first AI with human-in-the-loop verification. The strategic window is approximately 12–18 months before well-funded US AI-native competitors (Digits $100M, Puzzle $50M, Kick $20M) expand into Canada.

---

## 1. Product Vision & Philosophy
* **Vision:** To transition small business owners from reactive record-keeping to proactive financial mastery.
* **Philosophy:** "Control & Direction." Oluto is not just watching your money; it’s helping you steer it. Oluto means the guide or regulator, fitting the pivot from a passive "scribe" to an active Financial Copilot.
* **The "Anti-QuickBooks" Stance:**
    * *QuickBooks:* "Here is a report of what you did wrong last month."
    * *Oluto:* "Here is what you need to do today to be safe next month."
* **The Strategic Moat:**
    1.  **Low-Overwhelm UX:** A single cash command center + a 5-minute exceptions inbox (progressive disclosure by default). No competitor leads with safe-to-spend as the primary interface.
    2.  **Trust-First AI (Not Just AI-Powered):** AI categorization is now table stakes — every competitor from QuickBooks to Kick offers it. Oluto's differentiator is the *trust layer on top*: confidence scoring, exceptions routing, provenance tracking, and immutable audit logs so every number is explainable, reviewable, and CRA-audit-ready. Optimize for accuracy and verifiability, not automation speed.
    3.  **Bookkeeper Distribution Channel (Close Faster, Grow Faster):** Multi-tenant operations with cross-client review queues, client nudges, close checklists, and accountant-ready exports (co-branded in v1; true white-label later). Bookkeepers are not just users — they are the primary go-to-market channel. A single bookkeeper onboarding brings 10–30 client businesses. This is the Xero playbook, adapted for Canada.
    4.  **Canada Cashflow Semantics (Rails + Obligations):** "Safe-to-spend" tuned to Canadian payment rails (Interac/e-Transfer, real-time payments timing) and province-aware tax obligations/set-asides across all 13 provinces/territories. AI-native competitors (Digits, Puzzle, Kick, Zeni, Ember) have zero Canadian presence. Even incumbents treat Canadian tax as a configuration option, not a core design principle.
    5.  **Benchmark Network Effects (Earned):** Constrained categories + merchant normalization enables higher-quality anonymized benchmarks that improve nudges and advisory value over time.

## 1.1 Market Context & Trends (Feb 2026)
Oluto is being built into a market where accounting platforms are rapidly adding AI assistants/agents, regulators are advancing Canada's consumer-driven banking framework, and firms are prioritizing security and smaller, more integrated stacks.

* **AI is shifting from "features" to agents/autopilots** with increased focus on governance (explainability, oversight) and "slimmer tech stacks."
  Reference: https://www.accountingtoday.com/news/the-three-trends-shaping-accounting-technology-in-2026
* **Incumbents are leaning into AI-driven cashflow + collections** (e.g., QuickBooks Assist/Agents and payments automation).
  References: https://quickbooks.intuit.com/ai-accounting/ and https://quickbooks.intuit.com/payments-agent/
* **Canada consumer-driven banking (open banking) is progressing** but is not universally available yet; legislation and rollout planning have accelerated through 2025–2026.
  References: https://www.canada.ca/en/financial-consumer-agency/services/banking/open-banking.html and https://www.canada.ca/en/department-finance/programs/financial-sector-policy/open-banking-implementation/budget-2025-canadas-framework-for-consumer-driven-banking.html
* **Real-time payments are becoming central to "cashflow reality"** in Canada, alongside Interac rails; transaction descriptions and timing will change as instant rails roll out.
  References: https://www.thunes.com/insights/trends/canada-the-next-real-time-payments-powerhouse/ and https://www.payments.ca/sites/default/files/PaymentsCanada_Canadian_Payment_Methods_and_Trends_2025_EN.pdf
* **Digital-first record keeping is the default expectation** (keep records and supporting documents for 6 years, accept digital records).
  Reference: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/keeping-records/where-keep-your-records-long-request-permission-destroy-them-early.html

## 1.2 Competitive Landscape & Timing (Feb 2026)
The competitive field spans three tiers, each with exploitable weaknesses.

* **Incumbent Trust Crisis:** QuickBooks holds ~62% market share but carries a 1.1-star Trustpilot rating (support complaints, price escalation, per-user fees of $15–20 CAD). Wave Financial has unresolved payroll failures post-H&R Block acquisition (funds withdrawn, employees not paid). Bench collapsed in December 2024, displacing 30,000+ customers. Incumbent loyalty is shakeable.
* **AI-Native Geographic Blind Spot:** All seven well-funded AI newcomers (Digits $100M, Puzzle $50M, Zeni $47.5M, Docyt $25M, Kick $20M, Ember, Fiskl) are US-only or UK-only. None support CRA compliance, Canadian tax rules, or Canadian bank integrations. This gives Oluto a first-mover window in Canadian AI-native accounting.
* **Bookkeeper Channel Underleveraged:** Most competitors treat bookkeepers as users, not distribution partners. Docyt is purpose-built for firms but US-only. Xero has HQ/Practice Manager but is not Canadian-first. The Canadian bookkeeper channel is wide open.
* **Timing Window:** Approximately 12–18 months before AI-native competitors begin international expansion and before incumbents catch up on cashflow-first features. Oluto must achieve product-market fit and bookkeeper channel traction within this window.
* **Immediate Acquisition Opportunities:** Bench's 30,000+ displaced customers and Wave's eroding trust base represent immediate addressable demand for a trustworthy Canadian alternative.

**Implication for Oluto v1:** win with clarity + trust (cashflow-first + exceptions workflow), start with statement import (CSV first; PDF best-effort + verification), add low-friction "Email-to-Inbox" forwarding as a primary habit loop, and design the ingestion pipeline so Flinks/Plaid/consumer-driven banking connections become a drop-in source later.

## 1.3 The General-Purpose AI Threat & Opportunity (2026)

A new competitive axis has emerged that doesn't appear in traditional accounting software comparisons: general-purpose AI automation tools. Platforms like Anthropic Cowork, OpenClaw, and similar AI agents allow individuals to perform ad-hoc financial tasks — parse a bank statement CSV, categorize expenses by CRA T2125, estimate GST/HST owing, generate a summary report — with no purpose-built software at all. This is not a hypothetical future; it is happening now.

### 1.3.1 Where General-Purpose AI Threatens Oluto
The **Starter tier is most exposed.** A tech-comfortable sole proprietor can already hand a CSV to an AI agent and get reasonable categorization and tax estimates in under two minutes, at no marginal cost beyond their existing AI subscription. This puts downward pressure on what Oluto can charge for basic one-shot categorization and simple insights. Any feature that can be replicated by a single AI prompt on a flat file is at risk of commoditization.

### 1.3.2 Where Oluto Remains Defensible
General-purpose AI tools are **stateless, ephemeral, and single-user by design.** They cannot replicate what requires persistent state, ongoing compliance, or multi-party collaboration:

* **Persistent system of record:** AI agents don't maintain a database across sessions. Oluto tracks month-over-month trends, running balances, recurring patterns, and historical categorization decisions. A sole proprietor using Cowork for bookkeeping has to remember to do it, re-upload data each time, and trust themselves to be consistent — exactly the "reactive record-keeping" Oluto eliminates.
* **Immutable audit trail:** CRA doesn't accept "Claude told me" as documentation. Oluto's trust layer provides traceable, verifiable records with timestamps, actor attribution, source provenance, and confidence scoring. This is non-reproducible in a stateless AI session.
* **Bookkeeper collaboration:** A bookkeeper managing 20 clients cannot use a general-purpose AI tool for cross-client review queues, close checklists, client nudges, and export packages. Multi-tenant workflow tooling is purpose-built or nonexistent.
* **Real-time dashboards and alerts:** Safe-to-Spend, CRA Lockbox, and cash floor predictions require always-on infrastructure — not on-demand prompting.
* **Mobile-first UX:** Sarah the Service Pro isn't opening an AI agent in her truck. She's glancing at a fuel gauge on her phone.
* **Open Banking integrations:** Live bank feeds require maintained connections, webhook handling, and reconciliation pipelines — infrastructure a general-purpose AI tool will never own.

### 1.3.3 Strategic Response: Embrace, Don't Compete
Rather than competing with general-purpose AI tools, Oluto should **become the system of record they query.** The strategic play is to make Oluto the persistent, compliant, collaborative infrastructure layer — and let AI tools serve as flexible interface layers on top.

* **MCP Server (Model Context Protocol):** Expose Oluto's API as an MCP server so tools like Cowork, Claude Code, and future AI agents can read and interact with Oluto data natively. A founder could ask their AI assistant "what's my safe-to-spend this week?" or "show my top expense categories vs last quarter" and get answers grounded in Oluto's verified data — not a one-off CSV parse.
* **API-first extensibility:** The existing OpenAPI schema (auto-generated from FastAPI) already supports this posture. Expand with read-only scoped tokens for AI tool access, so founders and bookkeepers can query their own data through any AI interface without compromising write-level security.
* **Positioning shift:** Oluto's value proposition is not "AI does your bookkeeping" — every AI tool can claim that now. Oluto is **persistent, compliant, collaborative financial infrastructure** with AI built into the workflow. The AI is the how; the persistent trust layer, the bookkeeper channel, and the Canadian compliance are the what.

### 1.3.4 Implication for Pricing & Tier Design
* **Starter tier must compete on convenience, not capability.** The value of Starter is not "AI categorizes your expenses" (any AI tool does that). The value is "your financial data is always organized, always current, and always CRA-ready — without you having to remember to do it." Emphasize the habit loop (Email-to-Inbox, recurring import), the persistent dashboard, and the tax set-aside automation.
* **Core/Pro tiers are insulated.** The features that justify Core and Pro pricing — full audit logs, bookkeeper collaboration, open banking, accountant exports — are infrastructure problems that general-purpose AI tools cannot solve.
* **MCP access as a Pro feature:** Offering MCP/API access at the Pro tier turns AI tool proliferation into a distribution advantage rather than a threat. Every AI tool that can query Oluto becomes an additional interface to Oluto's data.

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
    * "Soft lock" at month-end: edits require an explicit unlock and leave an audit entry.
* **Client Nudges (Bookkeeper-controlled):**
    * Templates to request missing receipts/confirmations and track completion.

### 2.1.1 Transaction Lifecycle & Tax Review Gate
A transaction cannot be posted without the user or bookkeeper explicitly confirming the financial breakdown. This is the core accounting control — posting means "this number is correct and I'm putting it on the books."

**State Machine with Tax Review:**
```
draft → processing → inbox_user / inbox_firm → ready → [TAX REVIEW] → posted
```

**State Definitions:**
* **`draft`** — Created from import (CSV/PDF), manual entry, or voice. Tax is auto-calculated (estimated from gross amount using province rates). `tax_source = 'estimated'`.
* **`processing`** — AI categorization running. Category, confidence, and tax flags assigned.
* **`inbox_user`** — Needs founder attention (low-confidence category, missing receipt, possible personal expense, transfer match, recurring detection).
* **`inbox_firm`** — Needs bookkeeper/firm attention (anomaly, consistency check, re-coding required).
* **`ready`** — Categorized and reviewed. May still have estimated tax. Eligible for posting review.
* **`posted`** — On the books. Tax breakdown has been confirmed by a human. Immutable (edits require explicit unlock + audit entry).

**Tax Review Gate (ready → posted):**
When a user or bookkeeper moves a transaction from `ready` to `posted`, the system presents a **Tax Review Card** showing:
* **Transaction summary:** vendor, amount, date, category
* **Tax breakdown:** pre-tax amount, each tax component (GST / HST / PST / QST), total tax, net amount
* **Tax source indicator:** "Estimated from bank amount" (amber) vs. "Verified from receipt" (green) vs. "Verified from invoice" (green)
* **ITC eligibility:** eligible / not eligible / partial (with deductibility %)
* **Receipt status:** attached / missing (with option to attach before posting)
* **Action buttons:** "Confirm & Post" / "Edit Tax" / "Attach Receipt First" / "Flag for Review"

**Rules:**
* A transaction can be posted with estimated tax — Oluto doesn't block posting, it informs. But the Data Completeness Score reflects it, and the Exceptions Inbox will nudge the user to attach a receipt later.
* Bulk posting shows a summary: "12 transactions ready to post: 8 receipt-verified, 3 estimated, 1 missing receipt. Post all?" with option to review estimated ones individually.
* If a receipt is attached to a transaction that's already posted, and the receipt's tax amounts differ from the estimates, the system flags a **tax correction** in the Exceptions Inbox (bookkeeper review for firm users, founder review for self-serve).
* Every posting writes to the audit log: who posted, when, the tax breakdown at time of posting, and the tax source.

---

## 3. Core Modules & Platform Distribution

### Module A: The "Safe-to-Spend" Dashboard
**Platform:** [Mobile - Primary]
**Objective:** Immediate clarity on liquidity in <5 seconds.

* **Visual:** A "Fuel Gauge" visualization (Green/Yellow/Red).
* **Key Data Points:**
    * **Total Bank Balance:** (Statement-import baseline in v1; roadmap to Flinks/Plaid/consumer-driven banking connections).
    * **The "CRA Lockbox":** Tax set-aside based on actual tax data when available (invoices, receipts), falling back to estimates from bank transactions when not. Always shows the calculation basis (see Data Completeness Score below).
    * **The "Safe-to-Spend":** (Total Balance MINUS Lockbox).
* **Interaction:** Tap "Lockbox" to see breakdown. If *Safe-to-Spend* < 10%, background turns Amber.

#### Data Completeness Score ("Financial Picture")
The dashboard must be honest about how accurate its numbers are. A bank-statement-only view is a **cash activity summary**, not a true financial picture. The Data Completeness Score communicates this:

* **Level 1 — Cash Activity (bank statements only):** Revenue = deposits (undifferentiated), Expenses = withdrawals, Tax = reverse-calculated estimates. Label: "Estimated — based on bank activity only." Dashboard shows an amber indicator.
* **Level 2 — Categorized Cash (+ AI categorization + manual classification):** Deposits classified as revenue vs. non-revenue (owner contributions, loans, transfers). Withdrawals classified as expenses vs. non-expenses (draws, loan repayments, asset purchases). Tax estimates improve because non-taxable items are excluded. Label: "Partially verified."
* **Level 3 — Receipt-Verified (+ receipt upload with tax extraction):** Actual GST/HST/PST/QST paid is extracted from receipts (supplier name, business number, tax amounts). ITCs are calculated from real data, not estimates. Lockbox reflects actual tax collected minus actual ITCs. Label: "Receipt-verified."
* **Level 4 — Full Picture (+ invoicing + receipt matching):** Revenue is tracked from invoices (tax collected is known exactly). Expenses are matched to receipts (tax paid is known exactly). CRA Lockbox = actual GST/HST collected (invoices) minus actual ITCs (receipts). Accounts receivable is visible. Label: "Fully verified — CRA-ready."

The score gamifies data entry (founders want to reach Level 4), sets honest expectations (don't over-trust a Level 1 picture), and gives bookkeepers a per-client view of what's missing. The Exceptions Inbox prioritizes items that would move the score up.

### Module A1: The "Exceptions Inbox" (5-Minute Daily)
**Platform:** [Mobile & Web]
**Objective:** Keep bookkeeping from becoming overwhelming by focusing only on what needs attention.

* **Examples of Inbox Items:**
    * Needs category (low-confidence suggestion)
    * Missing receipt (prioritized for high-value transactions and transactions with estimated tax)
    * Possible personal expense
    * Possible transfer match
    * Recurring detected (subscription/bill confirmation)
    * **Tax correction needed:** receipt attached post-posting and tax amounts differ from estimates
    * **Deposit classification:** unmatched deposit needs classification (revenue / owner contribution / loan / refund / transfer)
    * **Invoice-to-deposit match:** AI suggests a match between an invoice payment and a bank deposit — confirm or reject
    * **ITC eligibility review:** mixed-use expense needs deductibility percentage confirmed
* **Priority Ordering:** Items that improve the Data Completeness Score are surfaced first — a missing receipt on a $5,000 transaction outranks a low-confidence category on a $12 coffee.
* **Design Rule:** Every AI suggestion must include confidence + "why" + one-tap undo; all actions write to an audit log.

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

### Module A4: Receipts & Tax Extraction
**Platform:** [Mobile & Web]
**Objective:** Capture the actual tax paid on purchases — required for accurate ITC (Input Tax Credit) calculations and CRA compliance.

* **The Accounting Problem:** Bank statements show gross amounts ($113.00) but not the tax breakdown ($100.00 + $13.00 HST). CRA requires actual tax amounts from source documents to claim ITCs. Without receipts, the CRA Lockbox is estimating tax owed based on reverse-calculations — which are wrong for exempt supplies, zero-rated items, mixed-use expenses, and purchases made in different provinces.
* **Receipt Capture:**
    * Photo capture (mobile), file upload (web), or Email-to-Inbox forwarding.
    * AI extracts: vendor name, vendor business number (BN/GST registration), date, pre-tax amount, tax breakdown (GST/HST/PST/QST line items), total, and category suggestion.
    * Confidence scoring on extraction — low-confidence fields route to Exceptions Inbox.
* **Receipt-to-Transaction Matching:**
    * AI suggests matches between receipts and bank transactions (by amount, date, vendor).
    * Unmatched receipts flag for review (cash purchases with no bank record, or timing mismatches).
    * Matched receipts upgrade the transaction's tax data from "estimated" to "verified" — the Data Completeness Score moves up.
* **ITC Eligibility:**
    * Track `itc_eligible` per transaction (based on CRA rules: business-use %, supply type, registration status).
    * `deductibility_pct` for mixed personal/business expenses (e.g., home office, vehicle).
    * Actual ITC = sum of verified tax paid on eligible expenses — replaces estimated ITCs.

### Module A5: Basic Invoicing
**Platform:** [Web - Primary, Mobile - Lite]
**Objective:** Capture actual revenue and tax collected — required for accurate GST/HST remittance calculations.

* **The Accounting Problem:** Bank statement deposits include revenue, owner contributions, loan proceeds, refunds, inter-account transfers, and other non-revenue items. Without invoicing, Oluto cannot distinguish taxable revenue from non-revenue deposits, cannot calculate actual GST/HST collected, and cannot determine accounts receivable (what's been billed but not yet paid).
* **Invoice Features (v1 — intentionally minimal):**
    * Create invoices with: client name, line items (description, quantity, rate), province-aware tax calculation (GST/HST/PST/QST auto-applied based on place of supply), payment terms, and due date.
    * Invoice numbering (sequential, configurable prefix).
    * PDF generation + email delivery.
    * Status tracking: draft → sent → viewed → paid → overdue.
    * Record payment against invoice (manual in v1; auto-match to bank deposits in v2).
* **Revenue Accuracy:**
    * Revenue = sum of invoiced amounts (not deposits). Non-invoiced deposits classified as "other income" or "non-revenue" via Exceptions Inbox.
    * GST/HST collected = actual tax on invoices (not estimated from deposits).
    * Accounts receivable = sent/overdue invoices not yet paid — visible on dashboard.
* **Tax Collected vs Tax Paid:**
    * With invoicing (tax collected) + receipts (tax paid/ITCs), the CRA Lockbox can show: **Net tax owing = GST/HST collected − eligible ITCs**. This is the real number, not an estimate.
* **Scope Boundary:** Oluto v1 invoicing is intentionally simple — it is not competing with FreshBooks or Wave on invoicing features. The purpose is revenue capture and tax accuracy, not a full invoicing/billing platform. Advanced features (recurring invoices, time tracking, project billing, payment processing) are post-v1.

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
**Strategy:** "Rust Engine, TypeScript Face" (Optimized for Performance & Safety).

> **Implementation Note (Feb 2026):** The backend was built with **Rust/Axum** instead of the originally planned Python/FastAPI. This provides superior performance, memory safety, and type-safe financial calculations via `rust_decimal`. The frontend follows the original TypeScript monorepo plan.

* **Frontend Monorepo (TypeScript):**
    * **Mobile:** **React Native (Expo)** — scaffolded, not yet implemented.
    * **Web:** **Next.js 16** + React 19 + Tailwind CSS 4 + TanStack Query.
    * **API Client:** Hand-written typed client in `lib/api.ts` (100+ endpoints, 35+ TypeScript interfaces).
* **Backend API (Rust) — [LedgerForge](https://github.com/profemzy/ledger-forge):**
    * **Framework:** **Axum** 0.8.6 + Tokio (Async).
    * **Database:** PostgreSQL + **SQLx** 0.8 (raw type-safe queries, no ORM).
    * **Cache:** Redis via `redis` crate.
    * **Auth:** JWT (jsonwebtoken 10) + Argon2 password hashing.
    * **Financial Precision:** `rust_decimal` 1.36 for DECIMAL(15,2) financial values.
    * **Multi-Tenant:** Business workspaces, strict `business_id` scoping, role-based access control (Viewer/Accountant/Admin).
    * **API Docs:** Auto-generated via utoipa + Swagger UI.
* **Intelligence Layer (The "Autopilot" Core):**
    * **AI Categorization:** Fuelix (OpenAI-compatible API) for CRA T2125 expense categories. Graceful fallback to keyword-based matching when AI unavailable.
    * **OCR:** Azure Mistral Document AI for PDF bank statement text extraction.
    * **PDF Parsing:** Generic multi-bank parser with pipe table, HTML table, and line-based strategies. Supports BMO, TD, RBC, Scotiabank formats.
    * **Tax Logic:** Province-aware GST/HST/PST calculation for all 13 provinces/territories using `rust_decimal` for precision.
    * **Voice:** **OpenAI Whisper** (planned — not yet implemented).
    * **Benchmarks:** Planned for post-launch.
* **Ingestion Layer (implemented):**
    * **Statement Import:** CSV + PDF parsing into a canonical `Transaction` model with dedupe + confidence scoring + async job processing.
    * **Receipt Upload:** Azure Blob Storage with OCR text extraction (vendor, amount, date, tax breakdown).
    * **Open Banking Readiness:** Architecture supports future Flinks/Plaid/consumer-driven banking connections.
* **Extensibility Layer (AI Tool Ecosystem — planned):**
    * **MCP Server (Model Context Protocol):** Expose Oluto's core data as an MCP server so external AI agents can query Oluto data natively.
    * **API Tokens:** Scoped, read-only API tokens for AI tool access.
    * **Webhook Events:** Publish events for external automation.

## 4.1 Security & Compliance Posture (v1)
This is essential for firm-led adoption and to support future SOC 2-style assurance.

* **Tenant Isolation:** strict `business_id` scoping on every query; no cross-tenant access paths. Enforced at the service layer in LedgerForge.
* **Access Control:** JWT authentication (access + refresh tokens) + Argon2 password hashing. Role-based permissions: Viewer(0) < Accountant(1) < Admin(2).
* **Memory Safety:** Rust compile-time guarantees prevent buffer overflows, use-after-free, and data races.
* **SQL Injection Prevention:** SQLx prepared statements with type-safe query building.
* **Data Protection:** HTTPS via cert-manager + Let's Encrypt. Azure Blob Storage for receipts with scoped containers and signed URLs. Non-root Docker container user.
* **Infrastructure:** Azure Key Vault secrets synced via ExternalSecrets Operator to K8s. No credentials in code or config files.

## 5. UI/UX Guidelines
* **Mobile Principle:** "Thumb Zone & Voice First." Key actions must be reachable with one thumb; voice input must have haptic feedback.
* **Desktop Principle:** "Information Density." Use screen real estate for deep analysis.
* **Visual Language:**
    * 🟢 Green: Safe / Under Budget.
    * 🔴 Red: Danger / Over Budget.
    * 🔵 Blue: Community Insight / Benchmark Data.

---

## 6. Development Roadmap (First 8 Months)

### 6.0 Data Accuracy Philosophy
Bank statements alone produce a **cash activity summary**, not accurate financials. The roadmap is structured around progressive data accuracy — each phase adds a data source that makes the dashboard more trustworthy. The Data Completeness Score on the dashboard communicates this honestly to users and bookkeepers.

| Data Source | What It Unlocks | Without It |
| :--- | :--- | :--- |
| Bank statements (CSV/PDF) | Cash in/out, running balance | No financial data at all |
| AI categorization | Revenue vs. expense vs. non-business classification | All deposits look like "revenue," all withdrawals look like "expenses" |
| Receipt upload + tax extraction | Actual GST/HST/PST paid (ITCs), verified expense amounts | Tax is reverse-calculated from gross amounts — wrong for exempt/zero-rated supplies, wrong province rates, wrong for mixed-use |
| Basic invoicing | Actual revenue, actual GST/HST collected, accounts receivable | Revenue = deposits (includes loans, refunds, transfers). Tax collected is a guess |
| Receipt-to-transaction matching | Verified end-to-end: revenue (invoices) → bank (statements) → expenses (receipts) | Disconnected data islands with no reconciliation |

### 6.1 Phase-by-Phase Build

| Phase | Timeline | Focus | Key Deliverables | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Month 1-2 | **The "Onramp"** | Multi-tenant foundations + statement import (CSV) + Safe-to-Spend (estimated) + AI categorization. **Tax engine for all 13 provinces/territories.** Dashboard, transactions, contacts, accounts, reports. | ✅ **Complete** |
| **Phase 2** | Month 3-4 | **The "Trust Layer"** | PDF import via Mistral OCR + **receipt upload with OCR tax extraction** + receipt-to-transaction attachment + bank reconciliation with duplicate detection. Generic multi-bank PDF parser. | ✅ **Complete** |
| **Phase 3** | Month 5-6 | **Revenue Accuracy** | **Invoicing** (create with line items, status tracking, payment association) + **Bills** (AP with line items, bill receipts) + **Customer payments** (apply to invoices) + **Vendor bill payments** (apply to bills). AR aging reports. Accounts receivable visible on dashboard. | ✅ **Complete** |
| **Phase 4** | Month 7-8 | **The "Bookkeeper Channel"** | Co-branding + multi-client review queue (with per-client Data Completeness Scores) + accountant export package (CRA-ready workpapers with verified tax data) + close checklist (soft lock). | 🔲 **Planned** |

> **Implementation Note:** Phases 1–3 were completed ahead of schedule. The backend was built with Rust/Axum (LedgerForge) instead of Python/FastAPI. Email-to-Inbox (originally Phase 2 P0) was deferred in favor of receipt upload + OCR + reconciliation. Dark mode, forgot password, and bill attachment support were added as polish items.

### 6.2 Post-Launch Roadmap (Months 9–14)
| Priority | Focus | Rationale |
| :--- | :--- | :--- |
| **P0** | Predictive Cashflow (Horizon) | Only Xero (Analytics Plus add-on) and QBO (basic) offer this. 30/90-day cash floor alerts + what-if simulations. Now powered by verified data (Level 4), not estimates. |
| **P1** | Voice-to-Ledger (Mobile) | Zoho launched voice invoice creation. No one has voice-to-expense for field workers. Core to "Sarah the Service Pro" persona. |
| **P2** | MCP Server + API Tokens | Expose Oluto data to external AI tools (Cowork, Claude Code, etc.). Turns AI tool proliferation into a distribution advantage. Pro tier feature. |
| **P2** | Open Banking / Flinks / Plaid integration | Design the `Connection` abstraction in Phase 1–2 so live bank feeds become a drop-in data source. Gate behind Pro tier. |
| **P3** | Peer Compass Benchmarking | Anonymized industry/province benchmarks. Network effects create a moat that grows with adoption. Requires critical mass of users. |

---

## 7. Pricing Strategy

### 7.1 Positioning
Price between the free/low-cost players (Wave free, Kashoo CAD$19.95) and premium incumbents (QBO Plus CAD$68, Xero Standard CAD$48). Follow Xero's unlimited-users model — no per-user fees. This directly attacks QuickBooks' $15–20/user add-on pricing, which is a top complaint.

### 7.2 Tiers

| | **Starter** | **Core** | **Pro** |
| :--- | :--- | :--- | :--- |
| **Price** | CAD $15–19/month | CAD $29–39/month | CAD $49–69/month |
| **Target** | Sole proprietors, side hustles, early-stage businesses | Established small businesses, service companies | Bookkeepers, fractional CFOs, growing businesses |
| **AI Engine** | Open-source LLMs (Llama, Mistral) — lower cost, good-enough categorization + suggestions | Premium AI (OpenAI/Anthropic-class) — higher accuracy, richer explanations, advanced insights | Premium AI + priority processing |
| **Data Ingestion** | CSV + PDF statement import only | CSV + PDF + Email-to-Inbox | CSV + PDF + Email-to-Inbox + Open Banking (Flinks/Plaid when available) |
| **Safe-to-Spend** | Yes | Yes | Yes |
| **Exceptions Inbox** | Yes (basic) | Yes (full with confidence scoring + provenance) | Yes (full) |
| **Tax Set-Asides** | GST/HST only | All provinces (GST/HST/PST/QST) | All provinces + filing reminders |
| **Receipts** | Manual upload | Manual + Email-to-Inbox auto-attach | Manual + Email + OCR matching |
| **Audit Log** | Basic (30-day) | Full immutable log | Full + export for workpapers |
| **Multi-Client** | — | — | Cross-client review queue, health dashboards, close checklists, accountant export package |
| **Users** | Unlimited | Unlimited | Unlimited |
| **Co-Branding** | — | — | Bookkeeper branding on client portal + invite emails |
| **API / MCP Access** | — | Read-only API tokens | Full API + MCP server + webhook events |

### 7.3 AI Cost Architecture
The tiered LLM approach keeps unit economics healthy across segments:
* **Starter tier** uses open-source models (Llama 3, Mistral, or equivalent) self-hosted or via low-cost inference providers. Categorization accuracy target: 85–90%. Adequate for straightforward expense categorization and basic insights. Inference cost: ~$0.01–0.03 per categorization batch.
* **Core/Pro tiers** use premium models (OpenAI GPT-4o, Anthropic Claude, or Fuelix-hosted equivalents) for higher accuracy (95%+), richer natural-language explanations, and advanced features like anomaly detection and predictive insights. Inference cost: ~$0.05–0.15 per categorization batch.
* **Fallback pattern:** All tiers use the same trust layer (confidence scoring + exceptions routing). The difference is the underlying model's accuracy, not the workflow. Lower-accuracy Starter models route more items to the exceptions inbox for human review — which is consistent with the trust-first philosophy.

### 7.4 Free Trial
14-day free trial of Core tier (no credit card required). After trial, users choose a tier. No permanent free tier — avoids the Wave trap of racing to zero and monetizing through payment processing fees.

---

## 8. Integration & Ecosystem Strategy

### 8.1 Philosophy: Opinionated and Focused, Not Broad
Oluto is not building an app marketplace. Competitors like Xero (1,000+ integrations) and QuickBooks (massive ecosystem) win on breadth. Oluto wins on depth in a specific niche. Integrations should be few, high-quality, and directly support the cashflow-first + bookkeeper workflow.

### 8.2 Integration Priorities
* **Phase 1 (v1):** No third-party integrations. CSV/PDF import + Email-to-Inbox are the data sources. Keep the surface area small and reliable.
* **Phase 2 (post-launch):** Open banking connections (Flinks/Plaid/consumer-driven banking) as the primary integration — this is the biggest gap relative to incumbents.
* **Phase 3 (growth):** Selective integrations based on customer demand: CRA e-filing (MyBusiness Account), payroll data import (for tax set-aside accuracy), Stripe/Square for payment reconciliation.
* **API-first posture:** Oluto's own API should be well-documented and stable so bookkeeper firms and power users can build their own workflows. OpenAPI schema auto-generation (already implemented) supports this.

---

## 9. Go-to-Market Strategy

### 9.1 Primary Channel: Bookkeeper-Led Distribution
The bookkeeper is the wedge. One bookkeeper adoption = 10–30 client businesses onboarded. This is the Xero playbook adapted for Canada.

* **Phase 1 — Founder Self-Serve:** Early adopters find Oluto directly. Validate the cashflow-first UX and exceptions workflow with founder-only users. Build case studies.
* **Phase 2 — Bookkeeper Outreach:** Target independent bookkeepers and fractional CFOs (10–30 clients) with the multi-client console, close checklists, and accountant export package. Offer a bookkeeper partner program with co-branding and referral incentives.
* **Phase 3 — Firm Partnerships:** Formalize relationships with small accounting firms. White-label capabilities. Conference presence (e.g., Accountex Canada, CPA Canada events).

### 9.2 Immediate Acquisition Opportunities
* **Bench refugees (30,000+ displaced customers):** Bench collapsed December 2024. Post-acquisition service is unstable. Target these customers with a "Switch to Oluto" campaign emphasizing trust, transparency, and Canadian-first design.
* **Wave defectors:** Wave's payroll failures and post-acquisition decline are creating active churn. Position Oluto as the reliable Canadian alternative.

### 9.3 Positioning to Avoid
* **"AI-powered accounting"** — now claimed by every competitor. Generic and undifferentiated.
* **"Free accounting"** — Wave's territory. Competing on price alone is not viable against H&R Block's resources.
* **"All-in-one business platform"** — Zoho's territory. Oluto should be focused, not broad.

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
Role: Senior Architect & Rust/TypeScript Engineer.
Project: "Oluto" (Financial Autopilot for Canada).
Stack: Next.js 16 (TypeScript) + LedgerForge (Rust/Axum) + PostgreSQL.
Note: Original spec called for FastAPI/Python. Implemented with Rust/Axum for performance and type safety.

### ARCHITECTURAL GOALS
1. **Rust Backend (Axum) — "LedgerForge":**
   - Use Axum + Tokio for async HTTP API.
   - Use SQLx for type-safe PostgreSQL queries (no ORM).
   - Use rust_decimal for financial precision (DECIMAL(15,2)).
   - Expose OpenAPI/Swagger UI via utoipa.
   - Implement strict multi-tenant scoping (Business workspaces) with RBAC and audit logging.
   - Store receipts in Azure Blob Storage (scoped containers, signed URLs).

2. **Ingestion Module (v1-first):**
   - **Statement Import (CSV):** guided column mapping, saved templates per institution, dedupe/idempotency, and import preview.
   - **Statement Import (PDF):** table extraction, per-row confidence scoring, statement period + opening/closing balance confirmation, and integrity checks (running-balance when available).
   - **Email-to-Inbox (P0):** per-business upload email address to accept statements/receipts as attachments; create uploads/attachments and route uncertainty to the Exceptions Inbox.
   - Normalize all sources into a canonical 'Transaction' model with source provenance and `tax_source` field ('estimated', 'receipt_verified', 'invoice_verified').
   - Create a 'Connection' abstraction so future Flinks/Plaid/consumer-driven banking can reuse the same pipeline.

3. **Autopilot Services (AI + Rules):**
   - **Voice:** Create a service that accepts audio files, sends them to OpenAI Whisper, and returns text.
   - **Categorization:** Create an explainable suggestion engine (rules + model) that outputs: {Suggested_Category, Confidence, Why, Provenance}. Abstract the model provider behind a common interface to support tiered AI: open-source LLMs (Llama 3, Mistral) for Starter tier, premium models (OpenAI/Anthropic/Fuelix) for Core/Pro tiers. Both feed into the same confidence scoring + exceptions routing pipeline.
   - **Exceptions Inbox:** Create a workflow for items that require attention (missing receipt, low-confidence category, possible transfer, possible personal, recurring detected, tax correction needed, deposit classification, invoice-to-deposit match, ITC eligibility review) with assignment, status, and priority ordering by Data Completeness Score impact.
   - **Benchmarks:** Create a Pandas service that calculates "Average Spend %" per industry category.

4. **Tax Logic (Canada):**
   - Create a 'tax_engine.py' module using Python's 'Decimal' class.
   - Support two modes: **Estimated** (reverse-calculate tax from gross bank amounts using province rates) and **Verified** (use actual tax amounts from receipts and invoices).
   - Track `tax_source` per transaction: 'estimated', 'receipt_verified', or 'invoice_verified'.
   - CRA Lockbox calculation: estimated tax collected (from categorized deposits, or actual from invoices) minus estimated ITCs (from categorized expenses, or actual from receipts). Progressively upgrades as source documents are added.
   - Implement province-aware tax set-aside targets (GST/HST/PST/QST) for all 13 provinces/territories.
   - Provide reminder scaffolding for filing/obligation cadence (configurable per business).

5. **Transaction Posting & Tax Review Gate:**
   - State machine: `draft → processing → inbox_user/inbox_firm → ready → [TAX REVIEW] → posted`.
   - The `ready → posted` transition requires the user/bookkeeper to review a Tax Review Card showing: pre-tax amount, each tax component (GST/HST/PST/QST), tax source indicator (estimated vs receipt-verified vs invoice-verified), ITC eligibility, receipt attachment status.
   - Posting is not blocked by estimated tax — the system informs, not blocks. But the Data Completeness Score reflects it.
   - Bulk posting shows a summary with verification breakdown and allows selective review of estimated items.
   - Post-posting receipt attachment that reveals different tax amounts triggers a tax correction exception.
   - Every posting writes to the audit log: actor, timestamp, tax breakdown, tax source.

6. **Receipt & Tax Extraction Module:**
   - Accept receipt images/PDFs via upload, email forwarding, or mobile capture.
   - AI extracts: vendor name, vendor business number (BN/GST registration), date, pre-tax amount, tax line items (GST/HST/PST/QST breakdown), total, and category suggestion.
   - Match receipts to bank transactions (by amount, date, vendor). Upgrade matched transactions from 'estimated' to 'receipt_verified' tax.
   - Track ITC eligibility per transaction: business-use percentage, supply type (taxable/exempt/zero-rated), and registration status.

7. **Basic Invoicing Module:**
   - Create invoices: client name, line items, province-aware tax calculation, payment terms, due date.
   - Invoice lifecycle: draft → sent → viewed → paid → overdue.
   - Record payment against invoice (manual match to bank deposit in v1; auto-match in v2).
   - Revenue = invoiced amounts (not deposits). GST/HST collected = actual tax on invoices.
   - Accounts receivable tracking: outstanding invoices visible on dashboard.

8. **Exports (Accountant Package):**
   - Export period transactions (CSV) with tax verification status per line item.
   - Attachments bundle (receipts + invoices matched to transactions).
   - Audit log extract + rules summary.
   - Data Completeness Score per period (percentage of transactions at Level 3+ verification).

9. **Extensibility Layer (AI Tool Ecosystem):**
   - **MCP Server:** Expose core Oluto data (safe-to-spend, transactions, categories, tax set-asides, audit trail) via the Model Context Protocol so external AI agents can query Oluto natively. Read-only by default; scoped write access via explicit user grants.
   - **Scoped API Tokens:** Read-only tokens for AI tool access, manageable via web console. Tenant-scoped (never cross-tenant).
   - **Webhook Events:** Publish state-change events (transaction imported, exception flagged, period closed) for external automation.

### OUTPUT DELIVERABLES
1. **Folder Structure:** Tree view of 'backend-api' (Python) and 'frontend-app' (TS).
2. **FastAPI Main:** Example endpoints for statement upload (CSV/PDF), inbox, and receipt attachment.
3. **Pydantic Models:** Schemas for Tenant/Firm/Business, Account, StatementUpload, Transaction (with `tax_source` field), Receipt (with tax extraction fields), Invoice (with line items and tax collected), InboxItem, Attachment, AuditLog, TaxProfile, DataCompletenessScore.
4. **Ingestion Notes:** How dedupe, confidence scoring, provenance, and progressive tax verification (estimated → receipt-verified → invoice-verified) are implemented.
```
