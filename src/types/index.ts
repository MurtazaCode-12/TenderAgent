import { z } from "zod";
import type { Database } from "./database";

// Re-export Database Enums & Rows
export type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CompanyICPRow = Database["public"]["Tables"]["company_icps"]["Row"];
export type TenderRow = Database["public"]["Tables"]["tenders"]["Row"];
export type TenderMatchRow = Database["public"]["Tables"]["tender_matches"]["Row"];
export type PipelineItemRow = Database["public"]["Tables"]["pipeline_items"]["Row"];
export type BidComplianceReviewRow = Database["public"]["Tables"]["bid_compliance_reviews"]["Row"];
export type WhatsAppLogRow = Database["public"]["Tables"]["whatsapp_logs"]["Row"];

export type {
  TenderPortalType,
  TenderStatus,
  PipelineStage,
  ComplianceStatus,
  NotificationStatus,
  UserRole,
} from "./database";

// ============================================================================
// AI Structured Output Zod Schemas (Enforced for Structured Outputs)
// ============================================================================

/**
 * Strict schema for AI-generated plain-language tender summary
 */
export const TenderSummarySchema = z.object({
  executive_summary: z.string().describe("Concise 2-3 sentence overview of what the government authority is procuring."),
  scope_of_work: z.array(z.string()).describe("List of core technical deliverables and work items required."),
  eligibility_requirements: z.object({
    min_turnover_inr: z.number().nullable().describe("Minimum annual turnover in INR, or null if not specified."),
    years_experience_required: z.number().nullable().describe("Minimum years in business or relevant contract execution."),
    mandatory_certifications: z.array(z.string()).describe("Required certifications (e.g., ISO 9001, CMMI, MSME)."),
    exemptions_available: z.array(z.string()).describe("Exemptions allowed for MSME or DPIIT Startups (e.g., EMD waiver, turnover relaxation)."),
  }),
  financials: z.object({
    estimated_value_inr: z.number().nullable().describe("Estimated contract value in INR."),
    emd_amount_inr: z.number().nullable().describe("Earnest Money Deposit (EMD) required in INR."),
    document_fee_inr: z.number().nullable().describe("Cost of tender document/processing fee."),
    payment_terms: z.string().describe("Summary of milestones or payment structure."),
  }),
  critical_dates: z.object({
    pre_bid_meeting: z.string().nullable().describe("ISO date string or human-readable pre-bid meeting date/time."),
    submission_deadline: z.string().describe("ISO date string or explicit deadline for bid submission."),
    bid_opening: z.string().nullable().describe("Opening date for technical evaluation."),
  }),
  critical_clauses: z.array(z.string()).describe("High-risk or special conditions (e.g. liquidated damages, local office clause, joint venture rules)."),
  bid_go_no_go_recommendation: z.enum(["STRONG_BID", "MODERATE_RISK", "DO_NOT_BID"]).describe("Preliminary assessment recommendation based on standard eligibility friction."),
  recommendation_rationale: z.string().describe("Clear reasoning for the Go / No-Go recommendation."),
});

export type TenderSummaryAI = z.infer<typeof TenderSummarySchema>;

/**
 * Strict schema for AI Bid Document Compliance Checker
 */
export const ComplianceChecklistResultSchema = z.object({
  overall_compliance_score: z.number().min(0).max(100).describe("Percentage score representing how fully the draft bid adheres to mandatory tender requirements."),
  verdict: z.enum(["READY_TO_SUBMIT", "MINOR_REVISIONS_NEEDED", "CRITICAL_GAPS_DISQUALIFICATION_RISK"]),
  executive_assessment: z.string().describe("Summary of whether this bid will pass technical scrutiny or faces immediate rejection."),
  clause_evaluations: z.array(
    z.object({
      clause_id: z.string().describe("Reference clause number or topic (e.g., Clause 4.2 - EMD Exemption)."),
      requirement: z.string().describe("What the tender document demanded."),
      found_in_bid: z.boolean().describe("Whether this requirement is addressed in the contractor's draft document."),
      bid_evidence: z.string().nullable().describe("Exact quote or page location from the contractor's uploaded document."),
      status: z.enum(["MET", "PARTIALLY_MET", "MISSING", "NON_COMPLIANT"]),
      severity: z.enum(["MANDATORY", "IMPORTANT", "OPTIONAL"]),
      remediation_step: z.string().describe("Actionable advice to fix or complete this requirement."),
    })
  ),
  missing_documents: z.array(z.string()).describe("Specific mandatory annexures, declarations, or certificates missing from the uploaded bid."),
  suggested_improvements: z.array(z.string()).describe("Tactical tips to improve technical evaluation ranking."),
});

export type ComplianceChecklistResult = z.infer<typeof ComplianceChecklistResultSchema>;

// ============================================================================
// Ideal Customer Profile (ICP) Configuration Schema
// ============================================================================

export const ICPFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  target_categories: z.array(z.string()).min(1, "Select at least one target category"),
  min_tender_value: z.number().min(0, "Minimum value must be 0 or positive"),
  max_tender_value: z.number().nullable().optional(),
  preferred_states: z.array(z.string()).min(1, "Select at least one state or 'PAN_INDIA'"),
  excluded_keywords: z.array(z.string()).default([]),
  required_certifications: z.array(z.string()).default([]),
  min_annual_turnover: z.number().min(0).optional(),
  max_emd_capacity: z.number().min(0).optional(),
  icp_summary: z.string().min(10, "Please describe your core competencies, past contracts, and target bids in at least 10 words"),
});

export type ICPFormData = z.infer<typeof ICPFormSchema>;

// ============================================================================
// WhatsApp Message & Webhook Interfaces
// ============================================================================

export interface WhatsAppSendInteractivePayload {
  to: string;
  tenderId: string;
  tenderRefNumber: string;
  title: string;
  authorityName: string;
  estimatedValueFormatted: string;
  submissionDeadline: string;
  matchScore: number;
  executiveSummary: string;
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: "whatsapp";
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: "text" | "interactive" | "button";
        text?: { body: string };
        interactive?: {
          type: "button_reply" | "list_reply";
          button_reply?: {
            id: string; // e.g. "save_pipeline:TENDER_UUID" or "analyze_bid:TENDER_UUID"
            title: string;
          };
        };
      }>;
      statuses?: Array<{
        id: string;
        status: "sent" | "delivered" | "read" | "failed";
        timestamp: string;
        recipient_id: string;
      }>;
    };
    field: "messages";
  }>;
}

// ============================================================================
// API Response Formats
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}


// ============================================================================
// Universal Contractor Trades Catalog (All Trades Coverage)
// ============================================================================

export interface ContractorTradeInfo {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  categoryName: string;
  qualTag: string;
  description: string;
  mandatoryDocs: string[];
}

export const CONTRACTOR_TRADES: ContractorTradeInfo[] = [
  {
    id: "civil",
    label: "Civil & Infrastructure",
    shortLabel: "Civil & Infra",
    icon: "🏗️",
    categoryName: "Civil Infrastructure & Works",
    qualTag: "PWD Class 1-A & Hot-Mix",
    description: "Highways, Bridges, PWD Buildings, Bituminous Overlay, Stormwater Drainage",
    mandatoryDocs: ["PWD/CPWD Class Registration", "Batch Mix Plant Ownership/Lease", "Bank Solvency Certificate"],
  },
  {
    id: "electrical_solar",
    label: "Electrical & Solar Power",
    shortLabel: "Electrical & Solar",
    icon: "☀️",
    categoryName: "Electrical & Solar Power",
    qualTag: "MNRE ALMM & Class-1 CEA",
    description: "Rooftop Solar PV, 132/33kV Substations, Smart LED Lighting, Transformers",
    mandatoryDocs: ["MNRE ALMM Module Compliance", "Class-1 Electrical Inspectorate License", "Discom Net-Metering Empanelment"],
  },
  {
    id: "it_software",
    label: "IT, Software & Cloud",
    shortLabel: "IT & Software",
    icon: "💻",
    categoryName: "Information Technology & Software",
    qualTag: "OEM MAF & CMMI Level 3+",
    description: "Cloud Compute, H100 AI Nodes, HIMS Health Software, Networking & Cyber AMC",
    mandatoryDocs: ["OEM Manufacturer Authorization Form (MAF)", "CMMI Level 3/5 Certificate", "ISO 27001 Information Security"],
  },
  {
    id: "healthcare",
    label: "Healthcare & Medical Devices",
    shortLabel: "Healthcare & Pharma",
    icon: "🏥",
    categoryName: "Healthcare & Medical Equipment",
    qualTag: "CDSCO Form 20B/21B & CE/FDA",
    description: "AIIMS ICU Telemetry, Digital Radiology, Oncology Medicines, Lab Analyzers",
    mandatoryDocs: ["CDSCO Wholesale Drug License", "US FDA / European CE Clearance", "Cold-Chain Logistics Declaration"],
  },
  {
    id: "facility_security",
    label: "Facility & Security Services",
    shortLabel: "Facility & Security",
    icon: "👮",
    categoryName: "Facility Management & Security",
    qualTag: "PSARA License & Min. Wages",
    description: "Armed PSU Security, Airport Mechanized Housekeeping, Pest Control, Station Staff",
    mandatoryDocs: ["State PSARA License", "EPFO & ESIC Compliance Statement", "Minimum Wages Act 1948 Undertaking"],
  },
  {
    id: "fleet_logistics",
    label: "Fleet, Transport & Logistics",
    shortLabel: "Fleet & Transport",
    icon: "🚚",
    categoryName: "Fleet, Transport & Logistics",
    qualTag: "AIS-140 GPS & Commercial RTO",
    description: "Electric Transit Buses, Reefer Container Freight, Heavy Commercial Haulage",
    mandatoryDocs: ["AIS-140 GPS Telematics Certificate", "Commercial RTO Fleet Permits & PUC", "Carrier Legal Liability Insurance"],
  },
  {
    id: "telecom",
    label: "Telecom & Optical Fiber",
    shortLabel: "Telecom & OFC",
    icon: "📡",
    categoryName: "Telecommunications & Networking",
    qualTag: "DoT IP-1 & HDD Boring Rig",
    description: "RailTel OFC Laying, BharatNet GPON Broadband, Aerial ADSS Fiber Splicing",
    mandatoryDocs: ["DoT IP-1 Infrastructure Registration", "Trenchless HDD Boring Rig Schedule", "OTDR Calibration & Splicing Report"],
  },
  {
    id: "general_supplies",
    label: "General Goods & MSME Supplies",
    shortLabel: "MSME & Goods",
    icon: "📦",
    categoryName: "General Goods & MSME Supplies",
    qualTag: "Make in India Class-1 (>50%)",
    description: "School Desks & Almirahs, Combat Uniforms, HDPE Submersible Pumps, DI Pipes",
    mandatoryDocs: ["Udyam MSME Registration Certificate", "MII Class-1 Local Content (>50%) Self-Declaration", "BIS / ISI Product Certification"],
  },
];
