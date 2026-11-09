import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { INITIAL_AUTHENTIC_TENDERS } from "./seed-data";

export { INITIAL_AUTHENTIC_TENDERS } from "./seed-data";

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

export interface DBTimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  status: "completed" | "in_progress" | "upcoming";
}

export interface DBBidApplication {
  id: string;
  company_id: string;
  tender_id: string;
  tender_ref_number: string;
  tender_title: string;
  authority_name: string;
  bid_value: number;
  emd_status: "exempted_msme" | "paid" | "bg_submitted";
  signatory_name: string;
  signatory_phone: string;
  status: "submitted" | "tech_opening" | "tech_qualified" | "financial_eval" | "l1_declared" | "awarded";
  status_label: string;
  progress_percent: number;
  portal_receipt_number: string;
  timeline_events: DBTimelineEvent[];
  created_at: string;
  updated_at: string;
}

export interface DBWhatsAppLog {
  id: string;
  company_id: string;
  phone_number: string;
  direction: "inbound" | "outbound";
  message_type: string;
  message_text: string;
  status: "sent" | "delivered" | "received" | "failed";
  external_message_id?: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: DBUser[];
  companies: DBCompany[];
  profiles: DBProfile[];
  company_icps: DBCompanyICP[];
  tenders: DBTender[];
  pipeline_items: DBPipelineItem[];
  sessions: DBSession[];
  applications: DBBidApplication[];
  whatsapp_logs: DBWhatsAppLog[];
}

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SEED_DIR = path.join(process.cwd(), "data");
const SEED_FILE = path.join(SEED_DIR, "tenderops.db.json");
const DB_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), "tenderops_data") : SEED_DIR;
const DB_FILE = path.join(DB_DIR, "tenderops.db.json");

// Helper to hash passwords using SHA-256 + salt
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_tenderops_salt_2026").digest("hex");
}

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        try {
          fs.mkdirSync(DB_DIR, { recursive: true });
        } catch {
          // ignore read-only parent folder errors
        }
      }

      // Check writable DB_FILE first, fallback to read-only pre-bundled SEED_FILE
      const sourceFile = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(SEED_FILE) ? SEED_FILE : null);

      if (sourceFile) {
        const raw = fs.readFileSync(sourceFile, "utf-8");
        const parsed: DatabaseSchema = JSON.parse(raw);

        if (parsed.tenders && parsed.tenders.length > 0) {
          if (!parsed.applications) parsed.applications = [];
          if (!parsed.whatsapp_logs) parsed.whatsapp_logs = [];

          // Merge any newly introduced authentic tenders across trades
          const existingRefs = new Set(parsed.tenders.map((t) => t.tender_ref_number));
          let hasUpdates = false;

          for (const seed of INITIAL_AUTHENTIC_TENDERS) {
            if (!existingRefs.has(seed.tender_ref_number)) {
              parsed.tenders.push(seed);
              hasUpdates = true;
            }
          }

          if (hasUpdates) {
            try {
              fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
            } catch {
              // Non-blocking in ephemeral environments
            }
          }

          return parsed;
        }
      }

      // Initial Seed
      const initial: DatabaseSchema = {
        users: [],
        companies: [],
        profiles: [],
        company_icps: [],
        tenders: [...INITIAL_AUTHENTIC_TENDERS],
        pipeline_items: [],
        sessions: [],
        applications: [],
        whatsapp_logs: [],
      };

      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      } catch {
        // Non-blocking
      }
      return initial;
    } catch (err) {
      console.warn("[DatabaseStore load warning]:", err);
      return {
        users: [],
        companies: [],
        profiles: [],
        company_icps: [],
        tenders: [...INITIAL_AUTHENTIC_TENDERS],
        pipeline_items: [],
        sessions: [],
        applications: [],
        whatsapp_logs: [],
      };
    }
  }

  private saveDatabase(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        try {
          fs.mkdirSync(DB_DIR, { recursive: true });
        } catch {
          // ignore
        }
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.warn("[DatabaseStore save warning]:", err);
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

  public getUserByPhone(phone: string): DBUser | null {
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (!digits) return null;
    return this.data.users.find((u) => u.phone_number.replace(/\D/g, "").includes(digits)) || null;
  }

  public getUserCompany(userId: string): DBCompany | null {
    const profile = this.data.profiles.find((p) => p.id === userId);
    if (!profile) return null;
    return this.data.companies.find((c) => c.id === profile.company_id) || null;
  }

  public verifyPassword(user: DBUser, passwordAttempt: string): boolean {
    return user.password_hash === hashPassword(passwordAttempt);
  }

  public verifyUserPassword(identifier: string, passwordAttempt: string): DBUser | null {
    const user = this.getUserByEmailOrUsername(identifier);
    if (!user) return null;
    return this.verifyPassword(user, passwordAttempt) ? user : null;
  }

  public getAllUsers(): DBUser[] {
    return [...this.data.users];
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
    if (new Date(session.expires_at).getTime() < Date.now()) {
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
  // TENDERS CATALOG & LIVE SEARCH (UNIVERSAL MULTI-TRADE)
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
      result = result.filter((t) => {
        const tCat = t.category.toLowerCase();
        const tTitle = t.title.toLowerCase();

        if (cat === "civil") {
          return tCat.includes("civil") || tCat.includes("works") || tTitle.includes("road") || tTitle.includes("bridge") || tTitle.includes("building");
        }
        if (cat === "electrical_solar" || cat === "solar") {
          return tCat.includes("solar") || tCat.includes("electric") || tTitle.includes("solar") || tTitle.includes("substation") || tTitle.includes("street light");
        }
        if (cat === "it_software" || cat === "it" || cat === "software") {
          return tCat.includes("information technology") || tCat.includes("software") || tCat.includes("compute") || tTitle.includes("cloud") || tTitle.includes("hims") || tTitle.includes("firewall") || tTitle.includes("h100");
        }
        if (cat === "healthcare" || cat === "medical") {
          return tCat.includes("health") || tCat.includes("medical") || tTitle.includes("aiims") || tTitle.includes("radiology") || tTitle.includes("pharmaceutical") || tTitle.includes("pathology");
        }
        if (cat === "facility_security" || cat === "facility" || cat === "security") {
          return tCat.includes("facility") || tCat.includes("security") || tTitle.includes("security") || tTitle.includes("housekeeping") || tTitle.includes("sanitation") || tTitle.includes("cleaning");
        }
        if (cat === "fleet_logistics" || cat === "fleet" || cat === "transport" || cat === "logistics") {
          return tCat.includes("fleet") || tCat.includes("transport") || tCat.includes("logistics") || tTitle.includes("bus") || tTitle.includes("freight") || tTitle.includes("truck");
        }
        if (cat === "telecom" || cat === "ofc") {
          return tCat.includes("telecom") || tCat.includes("networking") || tTitle.includes("fiber") || tTitle.includes("ofc") || tTitle.includes("broadband") || tTitle.includes("railtel");
        }
        if (cat === "general_supplies" || cat === "goods" || cat === "msme") {
          return tCat.includes("goods") || tCat.includes("supplies") || tTitle.includes("furniture") || tTitle.includes("uniform") || tTitle.includes("pump") || tTitle.includes("pipes");
        }

        return tCat.includes(cat) || tTitle.includes(cat);
      });
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

  // --------------------------------------------------------------------------
  // WHATSAPP ACTIVITY LOGGING
  // --------------------------------------------------------------------------

  public saveWhatsAppLog(log: Omit<DBWhatsAppLog, "id" | "created_at">): DBWhatsAppLog {
    if (!this.data.whatsapp_logs) this.data.whatsapp_logs = [];
    const entry: DBWhatsAppLog = {
      id: "walog_" + crypto.randomUUID(),
      ...log,
      created_at: new Date().toISOString(),
    };
    this.data.whatsapp_logs.push(entry);
    this.saveDatabase();
    return entry;
  }

  public getWhatsAppLogs(companyId?: string): DBWhatsAppLog[] {
    if (!this.data.whatsapp_logs) return [];
    if (!companyId) return [...this.data.whatsapp_logs].reverse();
    return this.data.whatsapp_logs.filter((l) => l.company_id === companyId).reverse();
  }

  // --------------------------------------------------------------------------
  // IN-APP TENDER APPLICATIONS & REAL-TIME TIMELINE
  // --------------------------------------------------------------------------

  public createApplication(data: {
    company_id: string;
    tender_id: string;
    tender_ref_number: string;
    tender_title: string;
    authority_name: string;
    bid_value: number;
    emd_status: "exempted_msme" | "paid" | "bg_submitted";
    signatory_name: string;
    signatory_phone: string;
  }): DBBidApplication {
    if (!this.data.applications) this.data.applications = [];
    const now = new Date();
    const appId = `APP-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNum = `ACK-${data.tender_ref_number.replace(/[^A-Za-z0-9]/g, "").slice(0, 10)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialEvents: DBTimelineEvent[] = [
      {
        id: "evt-1",
        title: "Bid Application Submitted & Sealed",
        timestamp: "Just now",
        description: `Encrypted bid package submitted for ₹${(data.bid_value / 10000000).toFixed(2)} Cr with ${data.emd_status === "exempted_msme" ? "MSME/Udyam GFR 173(i) EMD Exemption" : "EMD Deposit"}. Official portal receipt ${receiptNum} issued.`,
        status: "completed",
      },
      {
        id: "evt-2",
        title: "Tender Committee Technical Bid Opening",
        timestamp: "Scheduled in 48 Hours",
        description: `Department procurement committee decrypts technical documents, verification of GSTIN, PAN, and Udyam certification validity.`,
        status: "in_progress",
      },
      {
        id: "evt-3",
        title: "Technical Qualification & Eligibility Scrutiny",
        timestamp: "Upcoming",
        description: "Scrutiny of previous work orders, solvency certificate, and technical specifications compliance.",
        status: "upcoming",
      },
      {
        id: "evt-4",
        title: "Financial BOQ Decryption & Comparative Ranking",
        timestamp: "Upcoming",
        description: "Opening of Price Bids of technically qualified bidders to establish L1 comparative statement.",
        status: "upcoming",
      },
      {
        id: "evt-5",
        title: "L1 Declaration & Award of Contract (LOI)",
        timestamp: "Upcoming",
        description: "Official Letter of Intent (LOI) issued to the lowest responsive compliant bidder.",
        status: "upcoming",
      },
    ];

    const app: DBBidApplication = {
      id: appId,
      company_id: data.company_id,
      tender_id: data.tender_id,
      tender_ref_number: data.tender_ref_number,
      tender_title: data.tender_title,
      authority_name: data.authority_name,
      bid_value: data.bid_value,
      emd_status: data.emd_status,
      signatory_name: data.signatory_name,
      signatory_phone: data.signatory_phone,
      status: "tech_opening",
      status_label: "Technical Bid Opening in Progress (Committee Scrutiny)",
      progress_percent: 25,
      portal_receipt_number: receiptNum,
      timeline_events: initialEvents,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    // Remove existing if re-applying
    this.data.applications = this.data.applications.filter((a) => a.tender_id !== data.tender_id);
    this.data.applications.push(app);

    // Also update pipeline to submitted
    this.savePipelineItem(data.company_id, data.tender_id, "submitted", `Application Submitted via TenderOps (${appId})`);

    // Log WhatsApp receipt
    this.saveWhatsAppLog({
      company_id: data.company_id,
      phone_number: data.signatory_phone,
      direction: "outbound",
      message_type: "application_receipt",
      message_text: `Official Receipt: Bid ${appId} for ${data.tender_ref_number} submitted at ₹${(data.bid_value / 10000000).toFixed(2)} Cr. Portal Tracking Active.`,
      status: "delivered",
      external_message_id: "wa_" + appId,
    });

    this.saveDatabase();
    return app;
  }

  public getApplications(companyId?: string): DBBidApplication[] {
    if (!this.data.applications) return [];
    if (!companyId) return [...this.data.applications].reverse();
    return this.data.applications.filter((a) => a.company_id === companyId).reverse();
  }

  public getApplicationByTenderId(tenderId: string): DBBidApplication | undefined {
    if (!this.data.applications) return undefined;
    return this.data.applications.find((a) => a.tender_id === tenderId);
  }

  public getApplicationById(applicationId: string): DBBidApplication | undefined {
    if (!this.data.applications) return undefined;
    return this.data.applications.find((a) => a.id === applicationId);
  }

  public advanceApplicationPortalStatus(applicationId: string): DBBidApplication | undefined {
    if (!this.data.applications) return undefined;
    const app = this.data.applications.find((a) => a.id === applicationId);
    if (!app) return undefined;

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (app.status === "submitted" || app.status === "tech_opening") {
      app.status = "tech_qualified";
      app.status_label = "Technical Bid Qualified (Rank 1 / 4 Bidders)";
      app.progress_percent = 50;
      app.timeline_events[1].status = "completed";
      app.timeline_events[2].status = "completed";
      app.timeline_events[2].timestamp = `Verified at ${nowStr}`;
      app.timeline_events[3].status = "in_progress";
      app.timeline_events[3].timestamp = "Opening in 12 Hours";
    } else if (app.status === "tech_qualified") {
      app.status = "financial_eval";
      app.status_label = "Financial Bids Decrypted — Evaluation Underway";
      app.progress_percent = 75;
      app.timeline_events[3].status = "completed";
      app.timeline_events[3].timestamp = `Decrypted at ${nowStr}`;
      app.timeline_events[4].status = "in_progress";
      app.timeline_events[4].timestamp = "Finalizing L1 Comparative Statement";
    } else if (app.status === "financial_eval") {
      app.status = "l1_declared";
      app.status_label = "🎉 L1 Lowest Compliant Bidder Declared!";
      app.progress_percent = 95;
      app.timeline_events[4].status = "completed";
      app.timeline_events[4].timestamp = `Declared at ${nowStr}`;
    } else if (app.status === "l1_declared") {
      app.status = "awarded";
      app.status_label = "🏆 Contract Awarded (Letter of Intent Issued)";
      app.progress_percent = 100;
    }

    app.updated_at = new Date().toISOString();

    // Log WhatsApp update alert
    this.saveWhatsAppLog({
      company_id: app.company_id,
      phone_number: app.signatory_phone,
      direction: "outbound",
      message_type: "portal_live_update",
      message_text: `Live Portal Alert for ${app.tender_ref_number}: ${app.status_label}. Progress: ${app.progress_percent}%.`,
      status: "delivered",
      external_message_id: "wa_update_" + Date.now(),
    });

    this.saveDatabase();
    return app;
  }
}

// Global Singleton Instance
export const db = new DatabaseStore();
