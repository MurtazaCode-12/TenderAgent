import { generateObject } from "ai";
import { getExtractionModel, AI_CONFIG } from "./config";
import { PIIMasker } from "./pii-masker";
import { ComplianceChecklistResultSchema, type ComplianceChecklistResult } from "@/types";
import { AIServiceError } from "@/lib/errors";

export interface RunComplianceAuditInput {
  tenderTitle: string;
  tenderRefNumber: string;
  tenderAuthority: string;
  tenderRequirementsSummary: string;
  contractorDraftBidText: string;
}

/**
 * AI Bid Document Compliance Engine
 * Compares a contractor's drafted bid against government tender RFP requirements.
 * Sanitizes PII before sending to LLM, enforces temperature 0.1, and returns
 * a strictly-typed clause evaluation matrix and missing-items checklist.
 */
export async function runBidComplianceAudit(
  input: RunComplianceAuditInput
): Promise<{
  audit: ComplianceChecklistResult;
  piiMaskedCount: number;
  piiCategoriesDetected: string[];
}> {
  try {
    const model = getExtractionModel();

    // 1. Sanitize sensitive corporate PII and banking info
    const piiResult = PIIMasker.mask(input.contractorDraftBidText);

    const systemPrompt = `You are a Chief Legal Auditor and Senior Procurement Tender Evaluator for Indian government contracts (GFR 2017, GeM, CPPP).
Your job is to rigorously audit a contractor's draft bid submission against the mandatory tender requirements to PREVENT DISQUALIFICATION.

EVALUATION PROTOCOL:
1. Identify all mandatory qualification criteria (PQ), financial turnover requirements, EMD exemption rules, technical specifications, and mandatory affidavits.
2. Check if the contractor's draft bid satisfies each criterion. If a document or statement is missing (e.g., non-blacklisting affidavit, CA net-worth certificate, OEM authorization), mark it as MISSING.
3. Be ultra-vigilant on clerical technical disqualifiers:
   - Missing stamp/signature declarations
   - Failure to claim MSME / Startup India exemption properly
   - Outdated audited balance sheet years
   - Non-compliant EMD submission
4. Temperature is strictly calibrated for zero-hallucination. Only cite what is actually present in the contractor's bid text.`;

    const userPrompt = `GOVERNMENT TENDER SPECIFICATIONS:
Tender Reference: ${input.tenderRefNumber}
Authority: ${input.tenderAuthority}
Title: ${input.tenderTitle}

MANDATORY TENDER CLAUSES & REQUIREMENTS:
${input.tenderRequirementsSummary}

--------------------------------------------------
CONTRACTOR'S DRAFTED BID (SANITIZED):
${piiResult.sanitizedText.slice(0, 30000)}

--------------------------------------------------
Perform a rigorous clause-by-clause audit and return the structured compliance report.`;

    const { object } = await generateObject({
      model,
      schema: ComplianceChecklistResultSchema,
      temperature: AI_CONFIG.extractionTemperature,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return {
      audit: object,
      piiMaskedCount: piiResult.maskedCount,
      piiCategoriesDetected: piiResult.detectedCategories,
    };
  } catch (error) {
    console.error("[runBidComplianceAudit Error]:", error);
    throw new AIServiceError("Failed to complete AI bid compliance audit.", error);
  }
}
