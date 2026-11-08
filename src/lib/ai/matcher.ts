import type { CompanyICPRow, TenderRow } from "@/types";

export interface MatchCalculationResult {
  overallScore: number;
  semanticScore: number;
  ruleScore: number;
  matchReasons: string[];
  disqualificationRisks: string[];
  isEligible: boolean;
}

/**
 * Computes cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return Math.max(0, Math.min(1, dotProduct / denominator));
}

/**
 * Evaluates the match between a tender and a company's Ideal Customer Profile (ICP).
 * Blends high-dimensional vector similarity (40%) with deterministic procurement qualification rules (60%).
 */
export function evaluateTenderICPMatch(
  tender: TenderRow,
  icp: CompanyICPRow,
  tenderEmbedding?: number[],
  icpEmbedding?: number[]
): MatchCalculationResult {
  const matchReasons: string[] = [];
  const disqualificationRisks: string[] = [];

  // 1. Vector Semantic Similarity (0 - 100)
  let semanticScore = 50; // default baseline if embeddings not present
  if (tenderEmbedding && icpEmbedding && tenderEmbedding.length === icpEmbedding.length) {
    const similarity = cosineSimilarity(tenderEmbedding, icpEmbedding);
    semanticScore = Math.round(similarity * 100);
    if (semanticScore >= 75) {
      matchReasons.push(`Strong semantic alignment (${semanticScore}%) with company core capabilities`);
    }
  }

  // 2. Deterministic Rule Scoring
  let ruleScore = 100;

  // 2.1 Excluded Keywords Check (Immediate Disqualification / -50 penalty)
  const tenderFullText = `${tender.title} ${tender.description || ""} ${tender.category}`.toLowerCase();
  const matchedExclusions: string[] = [];

  if (icp.excluded_keywords && icp.excluded_keywords.length > 0) {
    for (const kw of icp.excluded_keywords) {
      const trimmed = kw.trim().toLowerCase();
      if (trimmed && tenderFullText.includes(trimmed)) {
        matchedExclusions.push(kw);
      }
    }
  }

  if (matchedExclusions.length > 0) {
    ruleScore -= 50;
    disqualificationRisks.push(
      `Tender contains excluded domain keywords: ${matchedExclusions.join(", ")}`
    );
  }

  // 2.2 Financial Value Evaluation
  if (tender.estimated_value && tender.estimated_value > 0) {
    const value = tender.estimated_value;

    if (icp.min_tender_value > 0 && value < icp.min_tender_value) {
      ruleScore -= 25;
      disqualificationRisks.push(
        `Tender value (₹${(value / 100000).toFixed(1)}L) is below your minimum threshold of ₹${(icp.min_tender_value / 100000).toFixed(1)}L`
      );
    } else if (icp.max_tender_value && value > icp.max_tender_value) {
      ruleScore -= 35;
      disqualificationRisks.push(
        `Tender value (₹${(value / 10000000).toFixed(2)}Cr) exceeds your maximum bidding capacity of ₹${(icp.max_tender_value / 10000000).toFixed(2)}Cr`
      );
    } else {
      matchReasons.push("Tender value falls squarely within your target bidding bracket");
    }

    // EMD Capacity check
    if (icp.max_emd_capacity && tender.emd_amount && tender.emd_amount > icp.max_emd_capacity) {
      ruleScore -= 15;
      disqualificationRisks.push(
        `EMD requirement of ₹${(tender.emd_amount / 100000).toFixed(1)}L exceeds your maximum EMD ceiling`
      );
    }
  } else {
    matchReasons.push("Estimated value not capped in tender notice; open for estimation");
  }

  // 2.3 Geographic Preference
  if (icp.preferred_states && icp.preferred_states.length > 0) {
    const isPanIndia = icp.preferred_states.some((s) => s.toUpperCase() === "PAN_INDIA" || s.toUpperCase() === "ALL");
    const tenderState = tender.location_state || "";

    if (!isPanIndia && tenderState) {
      const stateMatch = icp.preferred_states.some(
        (s) => s.toLowerCase() === tenderState.toLowerCase()
      );
      if (stateMatch) {
        matchReasons.push(`Located in preferred operating state: ${tenderState}`);
      } else {
        ruleScore -= 20;
        disqualificationRisks.push(`Tender location (${tenderState}) is outside preferred operating states`);
      }
    } else if (isPanIndia) {
      matchReasons.push("Matches PAN-India operational mandate");
    }
  }

  // 2.4 Category Overlap
  if (icp.target_categories && icp.target_categories.length > 0) {
    const catMatch = icp.target_categories.some(
      (cat) =>
        tender.category.toLowerCase().includes(cat.toLowerCase()) ||
        tender.title.toLowerCase().includes(cat.toLowerCase())
    );
    if (catMatch) {
      matchReasons.push("Direct match with target procurement category");
    } else {
      ruleScore -= 15;
    }
  }

  // Normalize ruleScore to 0-100 range
  ruleScore = Math.max(0, Math.min(100, ruleScore));

  // 3. Weighted Composite Score
  // 40% Semantic Similarity + 60% Rule Fitness
  const overallScore = Math.round(semanticScore * 0.4 + ruleScore * 0.6);
  const isEligible = overallScore >= 70 && matchedExclusions.length === 0;

  return {
    overallScore,
    semanticScore,
    ruleScore,
    matchReasons,
    disqualificationRisks,
    isEligible,
  };
}
