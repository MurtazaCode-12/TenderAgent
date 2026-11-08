# TenderOps AI (by MCodes) 🚀
> **Autonomous AI Procurement Engine & WhatsApp SDR for Government Contractors**

TenderOps AI discovers, filters, and summarizes Indian public sector tenders (**GeM**, **CPPP**, **State Portals**) matching them against a contractor's Ideal Customer Profile (ICP). It delivers daily plain-language digests via WhatsApp with interactive action buttons and features a web dashboard for bid management and AI-powered compliance checking.

---

## 🌟 Key Capabilities

1. **Multi-Portal Scraping & Aggregation Engine:**
   - Ingests opportunities from GeM (Government e-Marketplace), CPPP (Central Public Procurement Portal), and State Portals.
   - Eliminates duplicate tenders and normalizes dates, values, and EMDs.

2. **Vector Semantic ICP Matching (`pgvector` + Heuristic Rules):**
   - High-dimensional vector embeddings (1536-dim) representing contractor competencies and tender scopes.
   - Evaluates budget thresholds, location preferences, MSME exemptions, and disqualification penalties.

3. **WhatsApp SDR (System of Record & Engagement):**
   - Proactive mobile-first digests sent directly to contractor WhatsApp accounts.
   - One-tap quick actions: `Save to Pipeline`, `Check Compliance`, and `Pass`.
   - Cryptographic HMAC-SHA256 signature verification for inbound webhooks.

4. **AI Bid Compliance Co-Pilot:**
   - Audits draft technical bids against mandatory RFP clauses to prevent disqualification.
   - Zero-hallucination calibrated extraction (temperature 0.1) using Vercel AI SDK.
   - Cryptographic PII Masking: Redacts PAN, GSTIN, Aadhaar, Bank Details, and Phone numbers before LLM processing.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Actions, TypeScript) |
| **Database & Auth** | Supabase (PostgreSQL 15+, `pgvector`, Row Level Security) |
| **AI / LLMs** | Vercel AI SDK with Google Gemini (`gemini-1.5-pro`) & OpenAI (`gpt-4o`) |
| **Mobile Integration** | Meta WhatsApp Business Cloud API (Interactive Buttons) |
| **Security & Rate Limiting** | Upstash Redis (Sliding Window), HMAC-SHA256 Signature Checks, PII Masker |
| **Styling & UI** | Tailwind CSS, Shadcn UI, Lucide Icons |
| **Deployment** | Vercel (Fluid Compute, Edge Middleware, Vercel Cron) |

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Contractor login
│   │   └── register/page.tsx        # Company registration
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Sidebar, WhatsApp SDR status banner
│   │   ├── tenders/page.tsx         # AI Tender Discovery Feed
│   │   ├── pipeline/page.tsx        # Bid Pipeline Kanban Board
│   │   ├── compliance/page.tsx      # AI Bid Document Compliance Checker
│   │   └── settings/page.tsx        # ICP Configurator & WhatsApp preferences
│   ├── api/
│   │   ├── cron/ingest-tenders/     # Scheduled ingestion & AI matching worker
│   │   ├── webhooks/whatsapp/       # Meta Webhook verification & button handler
│   │   ├── compliance/check/        # AI Compliance Audit endpoint
│   │   └── health/                  # Service health & uptime probe
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                          # Button, Card, Badge, Input
│   └── features/
│       └── compliance-checker.tsx   # Interactive Compliance audit UI
├── lib/
│   ├── ai/
│   │   ├── config.ts                # Vercel AI SDK configuration & models
│   │   ├── matcher.ts               # Cosine similarity + rule scoring engine
│   │   ├── summarizer.ts            # Structured JSON executive summarizer
│   │   ├── compliance-checker.ts    # RFP clause vs bid auditor
│   │   └── pii-masker.ts            # Indian corporate PII scrubber
│   ├── ingestion/
│   │   ├── types.ts                 # Scraped data interfaces
│   │   ├── scrapers.ts              # GeM, CPPP, State Portal connectors
│   │   └── orchestrator.ts          # Ingestion coordinator & vector store
│   ├── supabase/
│   │   ├── client.ts                # Browser client
│   │   ├── server.ts                # Next.js Server Components client
│   │   └── admin.ts                 # Service-role admin client (Cron/AI)
│   ├── whatsapp/
│   │   ├── client.ts                # Meta WhatsApp Cloud API wrapper
│   │   └── security.ts              # HMAC-SHA256 signature verification
│   ├── utils.ts                     # INR Currency & Date formatting
│   ├── errors.ts                    # Centralized error boundaries & classes
│   └── rate-limiter.ts              # Upstash Redis sliding window limiter
├── actions/
│   ├── auth.ts                      # Supabase Auth Server Actions
│   ├── tenders.ts                   # Pipeline management mutations
│   └── icp.ts                       # ICP configuration & embedding updates
├── types/
│   ├── index.ts                     # Zod schemas & application types
│   └── database.ts                  # Supabase schema typings
└── middleware.ts                    # Route protection & API rate limiting
```

---

## ⚡ Getting Started

### 1. Database Migration (Supabase)
Run the migration file located in `supabase/migrations/20261108000000_init_tenderops.sql` in your Supabase SQL Editor.
This provisions:
- `vector` and `uuid-ossp` extensions
- Tables: `companies`, `profiles`, `company_icps`, `tenders`, `tender_matches`, `pipeline_items`, `bid_compliance_reviews`, `whatsapp_logs`
- HNSW indexes on 1536-dimensional embeddings
- Granular Row-Level Security (RLS) policies for multi-tenant isolation
- Automated `updated_at` triggers

### 2. Environment Variables
Copy `.env.example` to `.env.local` and configure your keys:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing the AI & Ingestion Pipeline

### Test Ingestion & AI Matching
Trigger the cron ingestion endpoint:
```bash
curl -X GET http://localhost:3000/api/cron/ingest-tenders \
  -H "Authorization: Bearer your-high-entropy-cron-secret-token"
```

### Test WhatsApp Webhook Verification
Meta handshake verification:
```bash
curl "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=tenderops-secure-verify-token-change-this&hub.challenge=CHALLENGE_ACCEPTED"
```

### Test Bid Compliance Check
Send a draft bid text payload to `/api/compliance/check` or use the interactive interface on `/compliance`.

---

## 🛡️ Production Standards
- **Zero Hallucination:** Extraction temperature set to `0.1` and schema-enforced with Zod.
- **PII Scrubbing:** Indian GSTIN, PAN, Bank Accounts, and Aadhaar scrubbed prior to LLM submission.
- **Multi-Tenant RLS:** Strict row isolation ensuring contractors only access their company's bids and profiles.
- **Webhook Security:** Cryptographic timing-safe HMAC-SHA256 signature verification.
