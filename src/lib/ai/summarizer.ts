import { generateObject } from "ai";
import { getExtractionModel, AI_CONFIG } from "./config";
import { TenderSummarySchema, type TenderSummaryAI } from "@/types";
import { AIServiceError } from "@/lib/errors";

interface TenderSummarizerInput {
  tenderRefNumber: string;
  title: string;
  authorityName: string;
  category: string;
  description: string;
  estimatedValue?: number | null;
  locationState?: string | null;
  rawPayload?: Record<string, unknown>;
}

/**
 * Generates an executive, plain-language summary of a government tender.
 * Enforces strict JSON schema via Vercel AI SDK and runs at temperature 0.1
 * to eliminate hallucinations of values, EMD amounts, or deadlines.
 */
export async function summarizeTender(input: TenderSummarizerInput): Promise<TenderSummaryAI> {
  try {
    const model = getExtractionModel();

    const systemPrompt = `You are a Principal Government Procurement Specialist and Chief Estimator for Indian public sector tenders (GeM, CPPP, State Portals).
Your objective is to distill complex, legalistic RFP/tender documents into clear, factual, plain-language executive intelligence for business owners.

GUARDRAILS:
1. Never hallucinate or guess financial values, EMD, or deadlines. If a field is not explicitly present, use null or state "Not Specified in Notice".
2. Clearly identify MSME / Startup India exemptions (EMD exemption, prior turnover/experience relaxation under Rule 173(i) of GFR 2017).
3. Highlight critical traps: Liquidated damages, restrictive OEM authorization clauses, mandatory local office requirements, or bank guarantee terms.
4. Provide a definitive Go / No-Go recommendation with transparent logic.`;

    const userPrompt = `Analyze the following government tender details and generate a structured summary:
Tender Reference Number: ${input.tenderRefNumber}
Issuing Authority: ${input.authorityName}
Tender Title: ${input.title}
Category: ${input.category}
Location: ${input.locationState || "PAN-India"}
Stated Estimated Value: ${input.estimatedValue ? `₹${input.estimatedValue}` : "Unstated in initial notice"}

Tender Description & RFP Excerpt:
${input.description || JSON.stringify(input.rawPayload, null, 2)}
`;

    const { object } = await generateObject({
      model,
      schema: TenderSummarySchema,
      temperature: AI_CONFIG.extractionTemperature,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return object;
  } catch (error) {
    console.error("[summarizeTender Error]:", error);
    throw new AIServiceError("Failed to generate structured tender summary.", error);
  }
}
