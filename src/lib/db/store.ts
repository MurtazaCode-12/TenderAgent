import fs from "fs";
import path from "path";
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
        const parsed: DatabaseSchema = JSON.parse(raw);

        if (parsed.tenders && parsed.tenders.length > 0) {
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
            fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
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
        tenders: [...INITIAL_AUTHENTIC_TENDERS],
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
}

// Global Singleton Instance
export const db = new DatabaseStore();
