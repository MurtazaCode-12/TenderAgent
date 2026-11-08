# TenderOps AI (by MCodes) 🚀
> **Autonomous AI Procurement Engine & WhatsApp SDR for Indian Government Contractors**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Public_Repo-emerald?logo=github)](https://github.com/MurtazaCode-12/TenderAgent)

TenderOps AI is a production-grade GovTech SaaS designed for Indian contractors across all industries (Civil, Solar, IT, Healthcare, Logistics, Security, and Supplies). It aggregates, deduplicates, and evaluates live public sector tenders from **GeM (Government e-Marketplace)**, **CPPP (Central Public Procurement Portal)**, and **State e-Procurement Portals (Mahatenders, KPPP, etc.)**, matching them against each contractor's Ideal Customer Profile (ICP). 

It features daily plain-language digests delivered via **Meta WhatsApp Business Cloud API**, an instant high-performance **Discovery Feed**, an interactive **Kanban Pipeline**, an **AI Bid Drafter**, and an **AI Compliance Checker**.

---

## 🌟 Key Capabilities

### 1. Multi-Portal Aggregation & Direct Portal Links
- Real-time ingestion from **GeM (Bidplus)**, **CPPP (eProcure Central)**, and **State Portals**.
- Every single tender card features a direct, authentic one-click link (`Go to Listing ↗`) opening the official government RFP document or portal page.
- Normalizes tender reference numbers, EMDs, estimated contract values, closing deadlines, and published dates.

### 2. Universal Multi-Trade Coverage
Designed for all contractor categories with dedicated taxonomy filters:
- 🏗️ **Civil Infrastructure & Works** (NHAI highways, PWD bridges, CPWD buildings)
- ⚡ **Electrical & Solar Power** (Rooftop solar, substations, smart street lighting)
- 💻 **Information Technology & Software** (Cloud computing, HIMS, ERP, AI compute clusters)
- 🏥 **Healthcare & Medical Equipment** (AIIMS diagnostics, MRI/CT, pharmaceuticals)
- 🛡️ **Facility Management & Security** (PSARA guarding, mechanized housekeeping)
- 🚛 **Fleet, Transport & Logistics** (Electric buses, freight hauling, fleet management)
- 📡 **Telecommunications & Networking** (BharatNet OFC, fiber-to-the-home, towers)
- 📦 **General Goods & MSME Supplies** (Office furniture, uniforms, industrial pumps)

### 3. WhatsApp SDR (Autonomous Contractor Agent)
- Proactive mobile-first digests sent directly to contractor WhatsApp numbers.
- One-tap quick actions: `Save to Pipeline`, `Draft Bid`, `Check Compliance`, and `Pass`.
- Interactive interactive buttons powered by the Meta WhatsApp Cloud API.
- Cryptographic timing-safe HMAC-SHA256 signature verification for inbound webhooks.

### 4. AI Bid Drafter (`/draft-bid`)
- Generates 4-part tender-winning bid packages in under 15 seconds:
  1. **Executive Summary & Bidder Credentials**
  2. **Technical Methodology & Execution Plan**
  3. **Past Experience & Eligibility Compliance Matrix**
  4. **Bill of Quantities (BOQ) & Commercial Pricing Strategy**
- Exportable to PDF/DOCX or single-click clipboard copy.

### 5. AI Bid Document Compliance Checker (`/compliance`)
- Audits draft technical proposals against mandatory RFP clauses to prevent disqualification.
- Zero-hallucination calibrated extraction (temperature 0.1) using Vercel AI SDK.
- Cryptographic Indian PII Scrubber: Automatically redacts PAN, GSTIN, Aadhaar, Bank Details, and Phone numbers prior to LLM processing.

### 6. Sub-100ms Instant Speed & In-Memory Fallback
- High-speed local database store (`data/tenderops.db.json`) provides **<100ms response times**.
- Smart Supabase configuration guard (`isSupabaseConfigured`) completely eliminates network timeouts when running in offline or self-hosted modes.
- Debounced search (280ms) and instant optimistic trade switching prevent UI freezes.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15.2.1 (App Router, Server Actions, TypeScript) |
| **Database & Auth** | Supabase (PostgreSQL 15+, `pgvector`, Row Level Security) + High-Speed In-Memory Store |
| **AI / LLMs** | Vercel AI SDK with Google Gemini (`gemini-1.5-pro`) & OpenAI (`gpt-4o`) |
| **Mobile Integration** | Meta WhatsApp Business Cloud API (Interactive Action Buttons) |
| **Security & Rate Limiting** | Upstash Redis (Sliding Window), HMAC-SHA256 Signature Verification, PII Masker |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Modern Sans-Serif Typography |
| **Deployment** | Vercel (Fluid Compute, Edge Middleware, Cron Jobs) |

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Contractor account sign-in
│   │   └── register/page.tsx            # Multi-trade contractor profile creation
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # Top navigation header & toast provider
│   │   ├── tenders/page.tsx             # Live Tender Discovery Feed & Trade Filters
│   │   ├── pipeline/page.tsx            # Bid Pipeline Kanban Board (Drag/Move)
│   │   ├── draft-bid/page.tsx           # AI 4-Part Bid Proposal Generator
│   │   ├── compliance/page.tsx          # AI RFP Compliance Auditor
│   │   ├── whatsapp-demo/page.tsx       # Live WhatsApp SDR Simulation Sandbox
│   │   └── settings/page.tsx            # ICP Configurator & WhatsApp Preferences
│   ├── api/
│   │   ├── cron/ingest-tenders/         # Scheduled multi-portal scraping worker
│   │   ├── webhooks/whatsapp/           # Meta WhatsApp webhook & button handler
│   │   ├── compliance/check/            # AI Compliance audit endpoint
│   │   ├── test/simulate-whatsapp/      # WhatsApp message simulator
│   │   └── health/                      # Health & uptime probe
│   ├── globals.css                      # Tailwind base & system typography
│   └── layout.tsx                       # Root layout & font hierarchy
├── components/
│   ├── layout/
│   │   └── main-nav.tsx                 # Responsive minimalist navbar & profile menu
│   ├── ui/                              # Toast context & UI primitives
│   └── features/
│       ├── tender-card.tsx              # Authentic tender card with direct portal link
│       ├── tender-filters.tsx           # Debounced search & trade pills
│       ├── bid-package-generator.tsx    # 4-Part AI bid proposal drafter
│       ├── compliance-checker.tsx       # RFP clause vs bid auditor UI
│       ├── register-form.tsx            # Multi-trade onboarding form
│       └── login-form.tsx               # Secure authentication form
├── lib/
│   ├── db/
│   │   ├── store.ts                     # In-memory database store with session management
│   │   └── seed-data.ts                 # Authentic tenders across 8 industry sectors
│   ├── ai/
│   │   ├── config.ts                    # Vercel AI SDK setup (Gemini & OpenAI)
│   │   ├── matcher.ts                   # Vector semantic similarity & ICP scoring
│   │   ├── summarizer.ts                # Structured JSON plain-language summarizer
│   │   ├── compliance-checker.ts        # RFP clause auditor
│   │   └── pii-masker.ts                # Indian corporate PII scrubber
│   ├── ingestion/
│   │   ├── connectors/                  # GeM, CPPP & State Portal connectors
│   │   ├── search.ts                    # Multi-portal crawler & match engine
│   │   └── orchestrator.ts              # Ingestion coordinator & vector store
│   ├── supabase/
│   │   ├── client.ts                    # Client-side Supabase client with config guard
│   │   ├── server.ts                    # Server Component Supabase client
│   │   └── admin.ts                     # Service-role admin client for workers
│   ├── whatsapp/
│   │   ├── client.ts                    # Meta WhatsApp Cloud API client
│   │   └── security.ts                  # HMAC-SHA256 signature verification
│   └── rate-limiter.ts                  # Upstash Redis sliding window limiter
├── actions/
│   ├── auth.ts                          # Registration & authentication actions
│   ├── tenders.ts                       # Pipeline mutation server actions
│   └── icp.ts                           # ICP preference updates
└── middleware.ts                        # Route protection & API rate limiting
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 22.x)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/MurtazaCode-12/TenderAgent.git
cd TenderAgent
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys as needed:
- `NEXT_PUBLIC_APP_URL`="http://localhost:3000"
- `NEXT_PUBLIC_SUPABASE_URL` *(Optional — automatically falls back to high-speed local store if not configured)*
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY` *(For Gemini 1.5 Pro AI summarization)*
- `WHATSAPP_ACCESS_TOKEN` & `WHATSAPP_PHONE_NUMBER_ID` *(For live WhatsApp SDR)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view TenderOps AI.

### 5. Production Build & Type-Check
```bash
npm run type-check   # tsc --noEmit
npm run build        # Production Next.js build
npm start            # Production server
```

---

## 🛡️ Security & Enterprise Reliability

- **High-Entropy Webhook Security:** Timing-safe HMAC-SHA256 verification on all inbound WhatsApp actions.
- **Corporate PII Redaction:** Sensitive contractor documents are scrubbed of PAN, GSTIN, Bank Accounts, and Aadhaar prior to AI model transmission.
- **Zero Hallucination:** Bid compliance evaluation strictly grounded in extracted RFP requirements (temperature 0.1).
- **Sub-100ms Latency:** In-memory caching engine with debounced search prevents UI stuttering.

---

## 📄 License
Private & Proprietary © 2026 MCodes. All rights reserved.
