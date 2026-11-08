import { z } from "zod";

/**
 * Robust date parser for varied Indian Government procurement formats:
 * - "DD-MM-YYYY HH:mm" (CPPP / GeM)
 * - "DD/MM/YYYY"
 * - "DD-Mon-YYYY hh:mm a" (e.g. "15-Nov-2026 03:00 PM")
 * - Standard ISO 8601
 */
export function parseTenderDate(dateStr: unknown): string {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date().toISOString();
  }

  const trimmed = dateStr.trim();

  // If already standard ISO
  const directDate = new Date(trimmed);
  if (!isNaN(directDate.getTime())) {
    return directDate.toISOString();
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY with optional time
  const dmyMatch = trimmed.match(
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?/i
  );

  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    let hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minutes = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const ampm = dmyMatch[7]?.toUpperCase();

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const parsed = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Handle DD-Mon-YYYY (e.g., "14-Nov-2026")
  const monMatch = trimmed.match(
    /^(\d{1,2})[-\/]([a-zA-Z]{3})[-\/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?/i
  );

  if (monMatch) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const day = parseInt(monMatch[1], 10);
    const month = months[monMatch[2].toLowerCase()];
    const year = parseInt(monMatch[3], 10);

    if (month !== undefined) {
      let hours = monMatch[4] ? parseInt(monMatch[4], 10) : 0;
      const minutes = monMatch[5] ? parseInt(monMatch[5], 10) : 0;
      const ampm = monMatch[7]?.toUpperCase();

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const parsed = new Date(Date.UTC(year, month, day, hours, minutes));
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  return new Date().toISOString();
}

/**
 * Robust currency parser handling:
 * - "₹ 4,50,000" -> 450000
 * - "Rs. 1.50 Cr" -> 15000000
 * - "50 Lakhs" -> 5000000
 * - Raw numeric inputs
 */
export function parseIndianCurrency(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return isNaN(val) ? null : Math.max(0, val);

  if (typeof val !== "string") return null;

  const raw = val.trim().toLowerCase();
  if (!raw || raw.includes("not disclosed") || raw.includes("refer document") || raw.includes("na")) {
    return null;
  }

  // Check for Crore notation (e.g. "1.5 Cr", "₹ 2.50 Crores")
  const crMatch = raw.match(/([\d,.]+)\s*(?:cr|crore|crores)/i);
  if (crMatch) {
    const num = parseFloat(crMatch[1].replace(/,/g, ""));
    if (!isNaN(num)) return Math.round(num * 10000000);
  }

  // Check for Lakh notation (e.g. "45 Lakh", "₹ 12.5 Lakhs")
  const lakhMatch = raw.match(/([\d,.]+)\s*(?:lakh|lakhs|lac|lacs)/i);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1].replace(/,/g, ""));
    if (!isNaN(num)) return Math.round(num * 100000);
  }

  // Standard digits cleanup: remove ₹, Rs, commas, whitespace
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Strict Zod Schema for Validating Raw Ingested Government Tenders
 * Guaranteed clean input before hitting the PostgreSQL / Supabase layer.
 */
export const ScrapedTenderValidationSchema = z.object({
  portal: z.enum(["gem", "cppp", "state_portal", "custom"]),
  tenderRefNumber: z
    .string()
    .min(3, "Tender Reference Number must be at least 3 characters")
    .max(255)
    .transform((s) => s.trim().replace(/\s+/g, " ")),
  title: z
    .string()
    .min(8, "Tender title must be at least 8 characters")
    .transform((s) => s.trim().replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ")),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((s) => (s ? s.trim().replace(/<[^>]*>?/gm, "") : "")),
  category: z
    .string()
    .min(2, "Category is required")
    .default("General Procurement")
    .transform((s) => s.trim()),
  authorityName: z
    .string()
    .min(2, "Authority/Department name is required")
    .transform((s) => s.trim().replace(/<[^>]*>?/gm, "")),
  locationState: z
    .string()
    .optional()
    .nullable()
    .default("PAN_INDIA")
    .transform((s) => (s ? s.trim() : "PAN_INDIA")),
  locationCity: z.string().optional().nullable(),
  estimatedValue: z
    .preprocess((v) => parseIndianCurrency(v), z.number().nullable().optional()),
  emdAmount: z
    .preprocess((v) => parseIndianCurrency(v), z.number().nullable().optional())
    .default(0),
  documentFee: z
    .preprocess((v) => parseIndianCurrency(v), z.number().nullable().optional())
    .default(0),
  publishedDate: z
    .preprocess((v) => parseTenderDate(v), z.string()),
  preBidMeetingDate: z
    .preprocess((v) => (v ? parseTenderDate(v) : null), z.string().nullable().optional()),
  submissionDeadline: z
    .preprocess((v) => parseTenderDate(v), z.string()),
  openingDate: z
    .preprocess((v) => (v ? parseTenderDate(v) : null), z.string().nullable().optional()),
  originalDocumentUrls: z
    .array(z.string().url("Must be a valid document URL"))
    .default([]),
  rawPayload: z.record(z.unknown()).default({}),
});

export type ValidatedScrapedTender = z.infer<typeof ScrapedTenderValidationSchema>;
