-- ============================================================================
-- TenderOps AI (by MCodes) - Supabase Development Seed Data
-- File: supabase/seed.sql
-- ============================================================================

-- 1. Insert Demo Company
INSERT INTO companies (id, name, legal_name, pan_number, gstin, website, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Apex Infotech Pvt Ltd',
    'Apex Infotech Private Limited',
    'AABCA1234F',
    '27AABCA1234F1Z5',
    'https://apexinfotech.example.com',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Demo Company ICP
INSERT INTO company_icps (
    id,
    company_id,
    title,
    target_categories,
    min_tender_value,
    max_tender_value,
    preferred_states,
    excluded_keywords,
    required_certifications,
    min_annual_turnover,
    max_emd_capacity,
    icp_summary,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Primary IT & Cloud Infrastructure ICP',
    ARRAY['Information Technology', 'Cloud Infrastructure', 'Cyber Security', 'Software Development', 'Data Center'],
    5000000.00,  -- ₹50 Lakhs
    100000000.00, -- ₹10 Crores
    ARRAY['Delhi', 'Maharashtra', 'Karnataka', 'PAN_INDIA'],
    ARRAY['Civil Works', 'Sanitation', 'Road Construction', 'Housekeeping', 'Catering'],
    ARRAY['ISO 9001', 'ISO 27001', 'CMMI Level 3', 'MSME'],
    20000000.00, -- ₹2 Crores
    2000000.00,  -- ₹20 Lakhs
    'Enterprise system integrator, cloud infrastructure engineering, and cybersecurity provider for Central and State government procurements.',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Master Tenders
-- 3.1 GeM Tender (High Match)
INSERT INTO tenders (
    id,
    portal,
    tender_ref_number,
    title,
    description,
    category,
    authority_name,
    location_state,
    location_city,
    estimated_value,
    emd_amount,
    document_fee,
    published_date,
    submission_deadline,
    original_document_urls,
    raw_payload,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000010',
    'gem',
    'GEM/2026/B/8941203',
    'Supply, Installation & Maintenance of Cloud Server Infrastructure & High-Performance GPUs',
    'Procurement of enterprise-grade cloud compute clusters, AI GPU nodes, storage arrays, and 3-year 24x7 SLA support for Department of Science & Technology data centers.',
    'Information Technology & AI Hardware',
    'Department of Science and Technology, Ministry of Science and Technology',
    'Delhi',
    'New Delhi',
    48500000.00, -- ₹4.85 Crore
    970000.00,   -- ₹9.70 Lakh
    0.00,
    NOW(),
    NOW() + INTERVAL '7 days',
    '["https://gem.gov.in/bids/view/mock-bid-doc-1.pdf"]'::jsonb,
    '{"msme_exemption": true, "turnover_rule": "Average ₹2 Cr in last 3 years"}'::jsonb,
    'active'
) ON CONFLICT (tender_ref_number) DO NOTHING;

-- 3.2 CPPP Tender (Moderate Match)
INSERT INTO tenders (
    id,
    portal,
    tender_ref_number,
    title,
    description,
    category,
    authority_name,
    location_state,
    location_city,
    estimated_value,
    emd_amount,
    document_fee,
    published_date,
    submission_deadline,
    original_document_urls,
    raw_payload,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000011',
    'cppp',
    'CPPP/2026/MoHFW/419201',
    'Development, Implementation and Operations of Hospital Information Management System (HIMS) with Telemedicine',
    'Turnkey software development, cloud deployment, and operations support for ABDM-compliant Hospital Information Management System across state civil hospitals.',
    'Software Development & Digital Health',
    'Ministry of Health and Family Welfare',
    'Maharashtra',
    'Mumbai',
    95000000.00, -- ₹9.5 Crore
    1900000.00,  -- ₹19 Lakh
    10000.00,
    NOW(),
    NOW() + INTERVAL '14 days',
    '["https://eprocure.gov.in/epublish/mock-tender-doc.pdf"]'::jsonb,
    '{"cmmi_required": "CMMI Level 3"}'::jsonb,
    'active'
) ON CONFLICT (tender_ref_number) DO NOTHING;

-- 3.3 State Portal Tender (Marginal Match)
INSERT INTO tenders (
    id,
    portal,
    tender_ref_number,
    title,
    description,
    category,
    authority_name,
    location_state,
    location_city,
    estimated_value,
    emd_amount,
    document_fee,
    published_date,
    submission_deadline,
    original_document_urls,
    raw_payload,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000012',
    'state_portal',
    'STATE/UP/2026/PWD/55120',
    'Civil Works & Smart Traffic Surveillance Systems under Smart Cities Mission',
    'Installation of AI-based ANPR cameras and traffic monitoring control center.',
    'Civil Works & Smart City Surveillance',
    'Uttar Pradesh State Smart City Corporation Ltd',
    'Uttar Pradesh',
    'Lucknow',
    62000000.00, -- ₹6.2 Crore
    1240000.00,
    5000.00,
    NOW(),
    NOW() + INTERVAL '11 days',
    '["https://etender.up.nic.in/mock-smartcity.pdf"]'::jsonb,
    '{"class_contractor": "Class A"}'::jsonb,
    'active'
) ON CONFLICT (tender_ref_number) DO NOTHING;

-- 4. Insert Matches for Demo Company
INSERT INTO tender_matches (
    id,
    company_id,
    tender_id,
    overall_score,
    semantic_score,
    rule_score,
    match_reasons,
    disqualification_risks,
    ai_summary,
    whatsapp_status
) VALUES (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    94,
    96,
    92,
    '["Strong semantic alignment (96%) with cloud and server capabilities", "Tender value (₹4.85 Cr) squarely within target range", "MSME status waives ₹9.70L EMD requirement"]'::jsonb,
    '["Requires formal OEM authorization letter from GPU manufacturer"]'::jsonb,
    '{
        "executive_summary": "High-priority procurement of enterprise-grade compute clusters and AI GPU nodes with 3-year OEM SLA. MSME exemption applicable for EMD & turnover.",
        "bid_go_no_go_recommendation": "STRONG_BID",
        "recommendation_rationale": "Direct alignment with core competencies; MSME certificate waives ₹9.7L EMD requirement."
    }'::jsonb,
    'sent'
) ON CONFLICT (company_id, tender_id) DO NOTHING;

-- 5. Insert Pipeline Item
INSERT INTO pipeline_items (
    id,
    company_id,
    tender_id,
    stage,
    internal_notes,
    bid_value
) VALUES (
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'under_review',
    'Saved via WhatsApp SDR interactive alert button',
    48500000.00
) ON CONFLICT (company_id, tender_id) DO NOTHING;
