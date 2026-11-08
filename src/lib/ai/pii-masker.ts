/**
 * PII Masking & Data Sanitization Engine for TenderOps AI
 * Scrubs sensitive Indian company identifiers, director credentials,
 * bank details, and personal data before prompt injection into LLMs.
 */

export interface PIIMaskingResult {
  sanitizedText: string;
  maskedCount: number;
  detectedCategories: string[];
}

export class PIIMasker {
  // Regex definitions for standard Indian corporate and personal identifiers
  private static readonly PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  private static readonly GSTIN_REGEX = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g;
  private static readonly AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
  private static readonly PHONE_REGEX = /(?:\+91[\-\s]?)?[6789]\d{9}\b/g;
  private static readonly EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  private static readonly IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;
  private static readonly BANK_ACCOUNT_REGEX = /\b\d{9,18}\b/g;

  /**
   * Masks sensitive credentials while preserving contextual clause semantics.
   * 
   * @param rawText Unprocessed document text or bid draft
   * @returns Masked string and statistics
   */
  public static mask(rawText: string): PIIMaskingResult {
    if (!rawText) {
      return { sanitizedText: "", maskedCount: 0, detectedCategories: [] };
    }

    let sanitized = rawText;
    let maskedCount = 0;
    const detectedCategories: Set<string> = new Set();

    // 1. Mask GSTIN
    sanitized = sanitized.replace(this.GSTIN_REGEX, () => {
      maskedCount++;
      detectedCategories.add("GSTIN");
      return "[MASKED_GSTIN]";
    });

    // 2. Mask PAN
    sanitized = sanitized.replace(this.PAN_REGEX, () => {
      maskedCount++;
      detectedCategories.add("PAN");
      return "[MASKED_PAN]";
    });

    // 3. Mask Aadhaar
    sanitized = sanitized.replace(this.AADHAAR_REGEX, () => {
      maskedCount++;
      detectedCategories.add("AADHAAR");
      return "[MASKED_AADHAAR]";
    });

    // 4. Mask IFSC Code
    sanitized = sanitized.replace(this.IFSC_REGEX, () => {
      maskedCount++;
      detectedCategories.add("IFSC");
      return "[MASKED_IFSC]";
    });

    // 5. Mask Email
    sanitized = sanitized.replace(this.EMAIL_REGEX, () => {
      maskedCount++;
      detectedCategories.add("EMAIL");
      return "[MASKED_EMAIL]";
    });

    // 6. Mask Phone numbers
    sanitized = sanitized.replace(this.PHONE_REGEX, () => {
      maskedCount++;
      detectedCategories.add("PHONE");
      return "[MASKED_PHONE]";
    });

    return {
      sanitizedText: sanitized,
      maskedCount,
      detectedCategories: Array.from(detectedCategories),
    };
  }
}
