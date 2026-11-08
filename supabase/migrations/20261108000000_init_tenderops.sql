-- ============================================================================
-- TenderOps AI (by MCodes) - Enterprise Supabase Migration
-- File: supabase/migrations/20261108000000_init_tenderops.sql
-- Description: Core Schema, pgvector embeddings, HNSW indexing, 
--              Row Level Security (RLS) policies, and automated audit triggers.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE tender_portal_type AS ENUM ('gem', 'cppp', 'state_portal', 'custom');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tender_status AS ENUM ('active', 'archived', 'cancelled', 'awarded');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_stage AS ENUM (
        'discovered', 
        'under_review', 
        'bid_drafting', 
        'compliance_passed', 
        'submitted', 
        'won', 
        'lost', 
        'passed'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'bid_manager', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Utility Function: Updated At Timestamp Trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Tables Creation

-- 4.1 Companies (Tenant Entity)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    pan_number VARCHAR(10),
    gstin VARCHAR(15),
    website VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 User Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL, -- Format: +919876543210 (E.164)
    role user_role NOT NULL DEFAULT 'bid_manager',
    whatsapp_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Company ICPs (Ideal Customer Profiles)
CREATE TABLE IF NOT EXISTS company_icps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Primary ICP',
    target_categories TEXT[] NOT NULL DEFAULT '{}',
    min_tender_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    max_tender_value NUMERIC(15, 2), -- NULL means uncapped
    preferred_states TEXT[] NOT NULL DEFAULT '{}',
    excluded_keywords TEXT[] NOT NULL DEFAULT '{}',
    required_certifications TEXT[] NOT NULL DEFAULT '{}', -- e.g. ['ISO 9001', 'MSME', 'Startup India']
    min_annual_turnover NUMERIC(15, 2) DEFAULT 0.00,
    max_emd_capacity NUMERIC(15, 2),
    icp_summary TEXT, -- Plain text descriptive summary of target projects
    embedding vector(1536), -- Vector embedding of the company profile & past bids
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Tenders (Master Aggregation Store)
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portal tender_portal_type NOT NULL DEFAULT 'gem',
    tender_ref_number VARCHAR(255) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    authority_name VARCHAR(255) NOT NULL,
    location_state VARCHAR(100),
    location_city VARCHAR(100),
    estimated_value NUMERIC(15, 2), -- Estimated tender value in INR
    emd_amount NUMERIC(15, 2) DEFAULT 0.00, -- Earnest Money Deposit
    document_fee NUMERIC(10, 2) DEFAULT 0.00,
    published_date TIMESTAMPTZ NOT NULL,
    pre_bid_meeting_date TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ NOT NULL,
    opening_date TIMESTAMPTZ,
    original_document_urls JSONB DEFAULT '[]'::JSONB,
    raw_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    embedding vector(1536), -- Vector representation of title, category, scope, requirements
    status tender_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.5 Tender Matches (AI Scoring & Summaries)
CREATE TABLE IF NOT EXISTS tender_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    semantic_score INTEGER NOT NULL CHECK (semantic_score >= 0 AND semantic_score <= 100),
    rule_score INTEGER NOT NULL CHECK (rule_score >= 0 AND rule_score <= 100),
    match_reasons JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of strings explaining why it matches
    disqualification_risks JSONB NOT NULL DEFAULT '[]'::JSONB, -- E.g. high turnover required, local office clause
    ai_summary JSONB NOT NULL DEFAULT '{}'::JSONB, -- Structured JSON summary (key scope, eligibility, deadlines)
    whatsapp_status notification_status NOT NULL DEFAULT 'queued',
    whatsapp_message_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_tender_match UNIQUE (company_id, tender_id)
);

-- 4.6 Pipeline Items (Contractor Bid Management Pipeline)
CREATE TABLE IF NOT EXISTS pipeline_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    stage pipeline_stage NOT NULL DEFAULT 'discovered',
    internal_notes TEXT,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    bid_value NUMERIC(15, 2),
    target_submission_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_pipeline_item UNIQUE (company_id, tender_id)
);

-- 4.7 Bid Compliance Reviews (AI Compliance Checker output)
CREATE TABLE IF NOT EXISTS bid_compliance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    document_filename VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    extracted_text_summary TEXT,
    overall_compliance_score INTEGER CHECK (overall_compliance_score >= 0 AND overall_compliance_score <= 100),
    checklist JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of { requirement: string, met: boolean, notes: string, severity: 'mandatory' | 'optional' }
    missing_items JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of missing certificates or annexures
    recommendations JSONB NOT NULL DEFAULT '[]'::JSONB,
    status compliance_status NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8 WhatsApp Logs (Audit Log for Inbound & Outbound WhatsApp Traffic)
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type VARCHAR(50) NOT NULL, -- 'template', 'interactive', 'text', 'button_reply'
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    status notification_status NOT NULL DEFAULT 'sent',
    external_message_id VARCHAR(255),
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for High-Performance Queries

-- 5.1 Vector Indexes (HNSW for Approximate Nearest Neighbor Search)
CREATE INDEX IF NOT EXISTS idx_tenders_embedding ON tenders 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_company_icps_embedding ON company_icps 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5.2 Relational & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_tenders_portal ON tenders (portal);
CREATE INDEX IF NOT EXISTS idx_tenders_status_deadline ON tenders (status, submission_deadline DESC);
CREATE INDEX IF NOT EXISTS idx_tenders_value ON tenders (estimated_value);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders (category);

CREATE INDEX IF NOT EXISTS idx_tender_matches_company ON tender_matches (company_id, overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_tender_matches_tender ON tender_matches (tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_matches_whatsapp ON tender_matches (whatsapp_status);

CREATE INDEX IF NOT EXISTS idx_pipeline_items_company_stage ON pipeline_items (company_id, stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_items_tender ON pipeline_items (tender_id);

CREATE INDEX IF NOT EXISTS idx_compliance_reviews_company ON bid_compliance_reviews (company_id, status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_phone ON whatsapp_logs (phone_number, created_at DESC);

-- 6. Attach Updated_at Triggers
CREATE TRIGGER tr_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_company_icps_updated_at BEFORE UPDATE ON company_icps FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_tenders_updated_at BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_tender_matches_updated_at BEFORE UPDATE ON tender_matches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_pipeline_items_updated_at BEFORE UPDATE ON pipeline_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_bid_compliance_reviews_updated_at BEFORE UPDATE ON bid_compliance_reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. Helper Security Functions (Used in RLS Policies)

-- Get current authenticated user's company_id
CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 8. Row Level Security (RLS) Configuration

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_compliance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- 8.1 Companies Policies
CREATE POLICY "Users can view their own company"
    ON companies FOR SELECT
    TO authenticated
    USING (id = get_current_user_company_id());

CREATE POLICY "Company Admins can update their company"
    ON companies FOR UPDATE
    TO authenticated
    USING (id = get_current_user_company_id())
    WITH CHECK (id = get_current_user_company_id());

-- 8.2 Profiles Policies
CREATE POLICY "Users can view profiles in their company"
    ON profiles FOR SELECT
    TO authenticated
    USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- 8.3 Company ICPs Policies
CREATE POLICY "Users can view company ICPs"
    ON company_icps FOR SELECT
    TO authenticated
    USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can manage company ICPs"
    ON company_icps FOR ALL
    TO authenticated
    USING (company_id = get_current_user_company_id())
    WITH CHECK (company_id = get_current_user_company_id());

-- 8.4 Tenders Policies (Public Read for Authenticated, Write restricted to Service Role)
CREATE POLICY "Authenticated users can view active tenders"
    ON tenders FOR SELECT
    TO authenticated
    USING (status = 'active');

-- Note: Ingestion workers run with SUPABASE_SERVICE_ROLE_KEY which bypasses RLS for inserts/updates.

-- 8.5 Tender Matches Policies
CREATE POLICY "Users can view matches for their company"
    ON tender_matches FOR SELECT
    TO authenticated
    USING (company_id = get_current_user_company_id());

-- 8.6 Pipeline Items Policies
CREATE POLICY "Users can view pipeline items for their company"
    ON pipeline_items FOR SELECT
    TO authenticated
    USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can manage pipeline items for their company"
    ON pipeline_items FOR ALL
    TO authenticated
    USING (company_id = get_current_user_company_id())
    WITH CHECK (company_id = get_current_user_company_id());

-- 8.7 Bid Compliance Reviews Policies
CREATE POLICY "Users can view compliance reviews for their company"
    ON bid_compliance_reviews FOR SELECT
    TO authenticated
    USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can create and edit compliance reviews for their company"
    ON bid_compliance_reviews FOR ALL
    TO authenticated
    USING (company_id = get_current_user_company_id())
    WITH CHECK (company_id = get_current_user_company_id());

-- 8.8 WhatsApp Logs Policies
CREATE POLICY "Users can view whatsapp logs for their company"
    ON whatsapp_logs FOR SELECT
    TO authenticated
    USING (company_id = get_current_user_company_id());

-- 9. RPC Functions for Vector Search & Semantic Matching

-- Match tenders against an ICP embedding with cosine distance
CREATE OR REPLACE FUNCTION match_tenders_for_icp(
    p_company_id UUID,
    p_match_threshold FLOAT,
    p_match_count INT
)
RETURNS TABLE (
    tender_id UUID,
    tender_ref_number VARCHAR,
    title TEXT,
    category VARCHAR,
    authority_name VARCHAR,
    estimated_value NUMERIC,
    submission_deadline TIMESTAMPTZ,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH company_target AS (
        SELECT embedding, min_tender_value, max_tender_value, preferred_states
        FROM company_icps
        WHERE company_id = p_company_id AND is_active = TRUE
        LIMIT 1
    )
    SELECT 
        t.id AS tender_id,
        t.tender_ref_number,
        t.title,
        t.category,
        t.authority_name,
        t.estimated_value,
        t.submission_deadline,
        (1 - (t.embedding <=> c.embedding))::FLOAT AS similarity_score
    FROM tenders t, company_target c
    WHERE t.status = 'active'
      AND t.submission_deadline > NOW()
      AND t.embedding IS NOT NULL
      AND (c.min_tender_value IS NULL OR t.estimated_value IS NULL OR t.estimated_value >= c.min_tender_value)
      AND (c.max_tender_value IS NULL OR t.estimated_value IS NULL OR t.estimated_value <= c.max_tender_value)
      AND (1 - (t.embedding <=> c.embedding)) >= p_match_threshold
    ORDER BY similarity_score DESC
    LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
