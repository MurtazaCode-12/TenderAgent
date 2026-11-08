import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { runBidComplianceAudit } from "@/lib/ai/compliance-checker";
import { handleApiError, AuthenticationError, NotFoundError, ValidationError } from "@/lib/errors";

export const maxDuration = 120; // 2 minutes for deep compliance analysis
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new AuthenticationError();
    }

    // Fetch user profile to get company_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      throw new AuthenticationError("User profile not found.");
    }

    const body = await req.json();
    const { tenderId, documentText, documentFilename } = body;

    if (!tenderId) {
      throw new ValidationError("Missing mandatory parameter: tenderId");
    }

    if (!documentText || typeof documentText !== "string" || documentText.trim().length < 50) {
      throw new ValidationError("Uploaded document text must be at least 50 characters for audit analysis.");
    }

    // Fetch target tender
    const { data: tender, error: tenderError } = await supabase
      .from("tenders")
      .select("*")
      .eq("id", tenderId)
      .single();

    if (tenderError || !tender) {
      throw new NotFoundError("Tender", "Specified tender not found.");
    }

    // Construct requirements text from description and raw_payload
    const requirementsSummary = `
Scope & Description: ${tender.description || "Refer to tender RFP."}
Estimated Value: ${tender.estimated_value ? `₹${tender.estimated_value}` : "Not stated"}
EMD Requirement: ${tender.emd_amount ? `₹${tender.emd_amount}` : "Exempt / None"}
Submission Deadline: ${tender.submission_deadline}
Key Specifications: ${JSON.stringify(tender.raw_payload, null, 2)}
`;

    // Execute AI compliance audit with PII scrubbing
    const { audit, piiMaskedCount } = await runBidComplianceAudit({
      tenderTitle: tender.title,
      tenderRefNumber: tender.tender_ref_number,
      tenderAuthority: tender.authority_name,
      tenderRequirementsSummary: requirementsSummary,
      contractorDraftBidText: documentText,
    });

    // Save review record in Supabase
    const { data: savedReview, error: saveError } = await supabase
      .from("bid_compliance_reviews")
      .insert({
        company_id: profile.company_id,
        tender_id: tenderId,
        uploaded_by: user.id,
        document_filename: documentFilename || "draft_bid_submission.pdf",
        document_url: "#",
        extracted_text_summary: documentText.slice(0, 1000),
        overall_compliance_score: audit.overall_compliance_score,
        checklist: audit.clause_evaluations,
        missing_items: audit.missing_documents,
        recommendations: audit.suggested_improvements,
        status: "completed",
      })
      .select()
      .single();

    if (saveError) {
      console.error("[Save Review Error]:", saveError);
    }

    return NextResponse.json({
      success: true,
      data: {
        reviewId: savedReview?.id,
        audit,
        piiMaskedCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
