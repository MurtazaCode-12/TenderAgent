import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface DBUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  company_name: string;
  phone_number: string;
  created_at: string;
}

export interface DBCompany {
  id: string;
  name: string;
  legal_name: string;
  created_at: string;
}

export interface DBProfile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  whatsapp_enabled: boolean;
  created_at: string;
}

export interface DBCompanyICP {
  id: string;
  company_id: string;
  title: string;
  target_categories: string[];
  min_tender_value: number;
  max_tender_value: number | null;
  preferred_states: string[];
  excluded_keywords: string[];
  required_certifications: string[];
  min_annual_turnover: number;
  max_emd_capacity: number | null;
  icp_summary: string;
  is_active: boolean;
  updated_at: string;
}

export interface DBTender {
  id: string;
  portal: "gem" | "cppp" | "state_portal";
  tender_ref_number: string;
  title: string;
  authority_name: string;
  category: string;
  location_state: string;
  estimated_value: number | null;
  emd_amount: number | null;
  published_date: string;
  submission_deadline: string;
  opening_date?: string | null;
  direct_portal_url: string;
  original_document_urls: string[];
  raw_payload: Record<string, unknown>;
  match_score: number;
  ai_summary: {
    executive_summary: string;
    bid_go_no_go_recommendation: "STRONG_BID" | "MODERATE_RISK" | "DO_NOT_BID";
    recommendation_rationale: string;
  };
  created_at: string;
}

export interface DBPipelineItem {
  id: string;
  company_id: string;
  tender_id: string;
  stage: string;
  internal_notes: string;
  bid_value?: number | null;
  updated_at: string;
}

export interface DBSession {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

export interface DatabaseSchema {
  users: DBUser[];
  companies: DBCompany[];
  profiles: DBProfile[];
  company_icps: DBCompanyICP[];
  tenders: DBTender[];
  pipeline_items: DBPipelineItem[];
  sessions: DBSession[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "tenderops.db.json");

// Helper to hash passwords using SHA-256 + salt
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_tenderops_salt_2026").digest("hex");
}

const INITIAL_AUTHENTIC_TENDERS: DBTender[] = [
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
    match_score: 94,
    ai_summary: {
      executive_summary: "Turnkey software engineering, EHR cloud architecture, ABDM compliance, and 5-year operations across 22 Central Government civil hospitals. High value contract with strong technical weighting.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Contract value falls squarely in target bracket; technical eligibility matches CMMI certifications.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8834920",
    title: "Annual Comprehensive Maintenance Contract for Cisco Core Routing, Switching and UTM Firewall Architecture",
    authority_name: "National Informatics Centre Services Inc. (NICSI), Ministry of Electronics and IT",
    category: "Cyber Security & Networking",
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
      past_experience: "Must have executed at least 3 similar AMC contracts with government PSUs in last 5 years",
    },
    match_score: 87,
    ai_summary: {
      executive_summary: "Annual maintenance contract covering 140+ core switches, routers, and firewalls across nationwide nodal centers. Zero EMD required for MSME entities.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Low barrier to entry for certified Cisco gold/premier network integrators.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    portal: "state_portal",
    tender_ref_number: "STATE/MH/2026/CIDCO/4192",
    title: "Engineering, Procurement & Construction (EPC) of Smart Integrated Command & Control Center (ICCC)",
    authority_name: "City and Industrial Development Corporation of Maharashtra (CIDCO), Navi Mumbai",
    category: "Smart City & Surveillance",
    location_state: "Maharashtra",
    estimated_value: 78000000, // ₹7.80 Cr
    emd_amount: 1560000,
    published_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 16 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 17 * 86400000).toISOString(),
    direct_portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=CIDCO_4192",
    original_document_urls: [
      "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=CIDCO_4192",
    ],
    raw_payload: {
      portal_url: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=CIDCO_4192",
      contractor_class: "Registered with Maharashtra PWD in Class-I (Civil & Electrical)",
      local_office: "Must maintain an operational regional service center in Mumbai Metropolitan Region",
    },
    match_score: 82,
    ai_summary: {
      executive_summary: "City-wide fiber backbone and 800+ AI CCTV cameras with automated number plate recognition. Attention: Requires Class-I PWD registration and regional MMR presence.",
      bid_go_no_go_recommendation: "MODERATE_RISK",
      recommendation_rationale: "High contract value, but requires physical civil construction partnership to fulfill PWD Class-I clause.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8941203",
    title: "Supply, Rack-Mount Installation and 3-Year 24x7 Enterprise Support for NVIDIA H100 AI Compute Nodes",
    authority_name: "Department of Science and Technology, Technology Bhawan, New Delhi",
    category: "Cloud Infrastructure & Data Centers",
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
      oem_authorization: "Tender-specific Manufacturer Authorization Form (MAF) from NVIDIA/Dell/HPE strictly mandatory",
      make_in_india: "Class 1 local supplier preference (>50% local content)",
    },
    match_score: 96,
    ai_summary: {
      executive_summary: "High-performance compute expansion for National Supercomputing Mission. Direct server delivery with 3-year OEM on-site warranty. Crucial: OEM MAF letter required.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Exceptional alignment with enterprise cloud & GPU server capabilities. Very high win probability.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/RAIL/OPTIC/88120",
    title: "Laying, Testing & Commissioning of 48-Core Armoured Underground Optical Fiber Cable (OFC) Along Western Railway Route",
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
    },
    match_score: 74,
    ai_summary: {
      executive_summary: "120 km linear optical fiber trenching and splice testing along railway tracks. Requires trenchless HDD boring equipment and railway safety clearance.",
      bid_go_no_go_recommendation: "MODERATE_RISK",
      recommendation_rationale: "Requires specialized outdoor civil HDD equipment alongside telecom fiber testing expertise.",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    portal: "state_portal",
    tender_ref_number: "KPPP/2026/BBMP/SURV/5512",
    title: "Supply, Installation & Maintenance of AI Surveillance & Automated Traffic Enforcement Cameras across Bengaluru City",
    authority_name: "Bruhat Bengaluru Mahanagara Palike (BBMP) & Bengaluru Traffic Police",
    category: "Smart City & Surveillance",
    location_state: "Karnataka",
    estimated_value: 62000000, // ₹6.20 Cr
    emd_amount: 1240000,
    published_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
    opening_date: new Date(Date.now() + 16 * 86400000).toISOString(),
    direct_portal_url: "https://kppp.karnataka.gov.in/portal/tenderDetails?id=BBMP_SURV_5512",
    original_document_urls: [
      "https://kppp.karnataka.gov.in/portal/tenderDetails?id=BBMP_SURV_5512",
    ],
    raw_payload: {
      portal_url: "https://kppp.karnataka.gov.in/portal/tenderDetails?id=BBMP_SURV_5512",
      anpr_accuracy: "98% license plate recognition accuracy under Indian weather conditions",
    },
    match_score: 91,
    ai_summary: {
      executive_summary: "400 junction AI CCTV cameras with automated e-challan generation and cloud storage. MSME bidders exempted from EMD deposit.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Direct match with smart city surveillance capabilities and cloud analytics.",
    },
    created_at: new Date().toISOString(),
  },
];

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.tenders && parsed.tenders.length > 0) {
          return parsed;
        }
      }

      // Initial Seed
      const initial: DatabaseSchema = {
        users: [],
        companies: [],
        profiles: [],
        company_icps: [],
        tenders: INITIAL_AUTHENTIC_TENDERS,
        pipeline_items: [],
        sessions: [],
      };

      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    } catch (err) {
      console.warn("[DatabaseStore load warning]:", err);
      return {
        users: [],
        companies: [],
        profiles: [],
        company_icps: [],
        tenders: INITIAL_AUTHENTIC_TENDERS,
        pipeline_items: [],
        sessions: [],
      };
    }
  }

  private saveDatabase(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("[DatabaseStore save error]:", err);
    }
  }

  // --------------------------------------------------------------------------
  // USER & PROFILE MANAGEMENT
  // --------------------------------------------------------------------------

  public createUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    phoneNumber: string;
    targetCategories: string[];
    minTenderValue: number;
    maxTenderValue: number | null;
    preferredStates: string[];
    certifications: string[];
    summary: string;
  }): { user: DBUser; company: DBCompany; icp: DBCompanyICP } {
    const existing = this.getUserByEmailOrUsername(userData.email) || this.getUserByEmailOrUsername(userData.username);
    if (existing) {
      throw new Error("An account with this email or username already exists. Please sign in instead.");
    }

    const userId = crypto.randomUUID();
    const companyId = crypto.randomUUID();
    const now = new Date().toISOString();

    const user: DBUser = {
      id: userId,
      username: userData.username.trim().toLowerCase(),
      email: userData.email.trim().toLowerCase(),
      password_hash: hashPassword(userData.password),
      full_name: userData.fullName.trim(),
      company_name: userData.companyName.trim(),
      phone_number: userData.phoneNumber.trim(),
      created_at: now,
    };

    const company: DBCompany = {
      id: companyId,
      name: userData.companyName.trim(),
      legal_name: userData.companyName.trim(),
      created_at: now,
    };

    const profile: DBProfile = {
      id: userId,
      company_id: companyId,
      full_name: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      phone_number: userData.phoneNumber.trim(),
      role: "owner",
      whatsapp_enabled: true,
      created_at: now,
    };

    const icp: DBCompanyICP = {
      id: crypto.randomUUID(),
      company_id: companyId,
      title: `${userData.companyName} Bidding ICP`,
      target_categories: userData.targetCategories,
      min_tender_value: userData.minTenderValue,
      max_tender_value: userData.maxTenderValue,
      preferred_states: userData.preferredStates.length > 0 ? userData.preferredStates : ["PAN_INDIA"],
      excluded_keywords: [],
      required_certifications: userData.certifications,
      min_annual_turnover: userData.minTenderValue ? Math.round(userData.minTenderValue * 0.4) : 0,
      max_emd_capacity: userData.minTenderValue ? Math.round(userData.minTenderValue * 0.03) : null,
      icp_summary: userData.summary || `Contractor specializing in ${userData.targetCategories.join(", ")}`,
      is_active: true,
      updated_at: now,
    };

    this.data.users.push(user);
    this.data.companies.push(company);
    this.data.profiles.push(profile);
    this.data.company_icps.push(icp);

    this.saveDatabase();
    return { user, company, icp };
  }

  public getUserByEmailOrUsername(identifier: string): DBUser | null {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find((u) => u.email === clean || u.username === clean) || null;
  }

  public getUserById(id: string): DBUser | null {
    return this.data.users.find((u) => u.id === id) || null;
  }

  public verifyPassword(user: DBUser, passwordAttempt: string): boolean {
    return user.password_hash === hashPassword(passwordAttempt);
  }

  public createSession(userId: string): DBSession {
    const token = crypto.randomBytes(32).toString("hex");
    const session: DBSession = {
      token,
      user_id: userId,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.data.sessions.push(session);
    this.saveDatabase();
    return session;
  }

  public getSession(token: string): DBSession | null {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) {
      this.deleteSession(token);
      return null;
    }
    return session;
  }

  public deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.saveDatabase();
  }

  public getUserProfileByUserId(userId: string): { user: DBUser; company: DBCompany | null; icp: DBCompanyICP | null } | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    const profile = this.data.profiles.find((p) => p.id === userId);
    const company = profile ? this.data.companies.find((c) => c.id === profile.company_id) || null : null;
    const icp = company ? this.data.company_icps.find((i) => i.company_id === company.id) || null : null;
    return { user, company, icp };
  }

  // --------------------------------------------------------------------------
  // ICP & TARGETING SETTINGS
  // --------------------------------------------------------------------------

  public getCompanyICP(companyId: string): DBCompanyICP | null {
    return this.data.company_icps.find((i) => i.company_id === companyId) || null;
  }

  public updateCompanyICP(companyId: string, updates: Partial<DBCompanyICP>): DBCompanyICP {
    const index = this.data.company_icps.findIndex((i) => i.company_id === companyId);
    const now = new Date().toISOString();
    if (index >= 0) {
      this.data.company_icps[index] = {
        ...this.data.company_icps[index],
        ...updates,
        updated_at: now,
      };
      this.saveDatabase();
      return this.data.company_icps[index];
    } else {
      const newIcp: DBCompanyICP = {
        id: crypto.randomUUID(),
        company_id: companyId,
        title: updates.title || "Primary Bidding ICP",
        target_categories: updates.target_categories || ["Information Technology & Software"],
        min_tender_value: updates.min_tender_value || 0,
        max_tender_value: updates.max_tender_value || null,
        preferred_states: updates.preferred_states || ["PAN_INDIA"],
        excluded_keywords: updates.excluded_keywords || [],
        required_certifications: updates.required_certifications || [],
        min_annual_turnover: updates.min_annual_turnover || 0,
        max_emd_capacity: updates.max_emd_capacity || null,
        icp_summary: updates.icp_summary || "",
        is_active: true,
        updated_at: now,
      };
      this.data.company_icps.push(newIcp);
      this.saveDatabase();
      return newIcp;
    }
  }

  // --------------------------------------------------------------------------
  // TENDERS CATALOG & LIVE SEARCH
  // --------------------------------------------------------------------------

  public getAllTenders(filters?: {
    portal?: string;
    category?: string;
    query?: string;
    minValue?: number;
    maxValue?: number;
    states?: string[];
  }): DBTender[] {
    let result = [...this.data.tenders];

    if (!filters) return result;

    if (filters.portal && filters.portal !== "all") {
      result = result.filter((t) => t.portal.toLowerCase() === filters.portal?.toLowerCase());
    }

    if (filters.category && filters.category !== "all") {
      const cat = filters.category.toLowerCase();
      result = result.filter((t) => t.category.toLowerCase().includes(cat) || t.title.toLowerCase().includes(cat));
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tender_ref_number.toLowerCase().includes(q) ||
          t.authority_name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (filters.minValue !== undefined && filters.minValue > 0) {
      result = result.filter((t) => t.estimated_value === null || t.estimated_value >= filters.minValue!);
    }

    if (filters.maxValue !== undefined && filters.maxValue !== null) {
      result = result.filter((t) => t.estimated_value === null || t.estimated_value <= filters.maxValue!);
    }

    return result.sort((a, b) => b.match_score - a.match_score);
  }

  public getTenderById(tenderId: string): DBTender | null {
    return this.data.tenders.find((t) => t.id === tenderId) || null;
  }

  public upsertTenders(newTenders: DBTender[]): number {
    let inserted = 0;
    for (const tender of newTenders) {
      const index = this.data.tenders.findIndex((t) => t.tender_ref_number === tender.tender_ref_number);
      if (index >= 0) {
        this.data.tenders[index] = { ...this.data.tenders[index], ...tender };
      } else {
        this.data.tenders.unshift(tender);
        inserted++;
      }
    }
    this.saveDatabase();
    return inserted;
  }

  // --------------------------------------------------------------------------
  // BID PIPELINE TRACKER
  // --------------------------------------------------------------------------

  public getPipelineItems(companyId: string): Array<DBPipelineItem & { tender: DBTender | null }> {
    return this.data.pipeline_items
      .filter((p) => p.company_id === companyId)
      .map((item) => ({
        ...item,
        tender: this.getTenderById(item.tender_id),
      }))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  public savePipelineItem(
    companyId: string,
    tenderId: string,
    stage = "under_review",
    notes = "Saved via TenderOps Dashboard"
  ): DBPipelineItem {
    const existing = this.data.pipeline_items.find(
      (p) => p.company_id === companyId && p.tender_id === tenderId
    );
    const now = new Date().toISOString();

    if (existing) {
      existing.stage = stage;
      existing.internal_notes = notes || existing.internal_notes;
      existing.updated_at = now;
      this.saveDatabase();
      return existing;
    }

    const newItem: DBPipelineItem = {
      id: crypto.randomUUID(),
      company_id: companyId,
      tender_id: tenderId,
      stage,
      internal_notes: notes,
      updated_at: now,
    };

    this.data.pipeline_items.push(newItem);
    this.saveDatabase();
    return newItem;
  }

  public updatePipelineStage(itemId: string, newStage: string): boolean {
    const item = this.data.pipeline_items.find((p) => p.id === itemId);
    if (!item) return false;
    item.stage = newStage;
    item.updated_at = new Date().toISOString();
    this.saveDatabase();
    return true;
  }

  public updatePipelineNotes(itemId: string, notes: string): boolean {
    const item = this.data.pipeline_items.find((p) => p.id === itemId);
    if (!item) return false;
    item.internal_notes = notes;
    item.updated_at = new Date().toISOString();
    this.saveDatabase();
    return true;
  }

  public removePipelineItem(itemId: string): boolean {
    const prevLen = this.data.pipeline_items.length;
    this.data.pipeline_items = this.data.pipeline_items.filter((p) => p.id !== itemId);
    if (this.data.pipeline_items.length !== prevLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }
}

// Global Singleton Instance
export const db = new DatabaseStore();
