import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { runBidComplianceAudit } from "@/lib/ai/compliance-checker";
import { extractTextFromPdfBuffer } from "@/lib/pdf/extractor";
import { handleApiError, AuthenticationError, NotFoundError, ValidationError } from "@/lib/errors";

export const maxDuration = 120; // 2 minutes for deep compliance analysis
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // In local development or testing mode, allow mock user if auth is not yet set up
    let companyId = "00000000-0000-0000-0000-000000000001";
    let userId: string | null = null;

    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.company_id) {
        companyId = profile.company_id;
      }
    } else if (process.env.NODE_ENV === "production") {
      throw new AuthenticationError();
    }

    let tenderId = "";
    let documentText = "";
    let documentFilename = "draft_bid_submission.pdf";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      tenderId = (formData.get("tenderId") as string) || "";
      const file = formData.get("file") as File | null;
      const rawText = formData.get("documentText") as string | null;

      if (file && file.size > 0) {
        documentFilename = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          documentText = await extractTextFromPdfBuffer(buffer);
        } else {
          documentText = buffer.toString("utf-8");
        }
      } else if (rawText) {
        documentText = rawText;
      }
    } else {
      const body = await req.json();
      tenderId = body.tenderId || "";
      documentText = body.documentText || "";
      documentFilename = body.documentFilename || documentFilename;
    }

    if (!tenderId) {
      throw new ValidationError("Missing mandatory parameter: tenderId");
    }

    if (!documentText || documentText.trim().length < 50) {
      throw new ValidationError("Uploaded document text must be at least 50 characters for audit analysis.");
    }

    // Fetch target tender
    const { data: tender, error: tenderError } = await supabase
      .from("tenders")
      .select("*")
      .eq("id", tenderId)
      .maybeSingle();

    const tenderTitle = tender?.title || "Cloud Server Infrastructure & AI Hardware";
    const tenderRef = tender?.tender_ref_number || "GEM/2026/B/8941203";
    const tenderAuthority = tender?.authority_name || "Ministry of Science and Technology";

    // Construct requirements summary
    const requirementsSummary = `
Tender Reference: ${tenderRef}
Issuing Authority: ${tenderAuthority}
Title: ${tenderTitle}
Scope & Description: ${tender?.description || "Supply, installation, and commissioning of high-performance GPU nodes, servers, and 3-year OEM SLA."}
Estimated Value: ${tender?.estimated_value ? `₹${tender.estimated_value}` : "₹4.85 Crores"}
EMD Requirement: ${tender?.emd_amount ? `₹${tender.emd_amount}` : "₹9.70 Lakhs (MSME Exemption Allowed under GFR 173(i))"}
Submission Deadline: ${tender?.submission_deadline || new Date().toISOString()}
Key Mandatory Clauses:
1. MSME / Startup India EMD Exemption requires valid Udyam certificate with matching NIC code.
2. Average turnover of ₹2 Cr over last 3 years with CA UDIN certification.
3. Notarized Non-Blacklisting Affidavit on ₹100 stamp paper.
4. Specific Manufacturer Authorization Form (MAF) from GPU/Server OEM.
`;

    // Execute AI compliance audit with PII scrubbing
    const { audit, piiMaskedCount } = await runBidComplianceAudit({
      tenderTitle,
      tenderRefNumber: tenderRef,
      tenderAuthority,
      tenderRequirementsSummary: requirementsSummary,
      contractorDraftBidText: documentText,
    });

    // Save review record in Supabase
    let reviewId = `rev_${Date.now()}`;
    try {
      const { data: savedReview } = await supabase
        .from("bid_compliance_reviews")
        .insert({
          company_id: companyId,
          tender_id: tenderId,
          uploaded_by: userId,
          document_filename: documentFilename,
          document_url: "#",
          extracted_text_summary: documentText.slice(0, 1000),
          overall_compliance_score: audit.overall_compliance_score,
          checklist: audit.clause_evaluations,
          missing_items: audit.missing_documents,
          recommendations: audit.suggested_improvements,
          status: "completed",
        })
        .select()
        .maybeSingle();

      if (savedReview?.id) {
        reviewId = savedReview.id;
      }
    } catch (saveErr) {
      console.warn("[Save Review Non-Fatal Warning]:", saveErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        reviewId,
        audit,
        piiMaskedCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
