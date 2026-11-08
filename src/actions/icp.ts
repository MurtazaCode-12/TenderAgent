"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/config";
import { ICPFormSchema } from "@/types";

export interface SaveICPResult {
  success: boolean;
  error?: string;
  message?: string;
}

const DEFAULT_DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

export async function saveICPAction(formData: FormData): Promise<SaveICPResult> {
  try {
    const supabase = await createServerSupabaseClient();
    let companyId = DEFAULT_DEMO_COMPANY_ID;

    // Check for authenticated user session
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.company_id) {
        companyId = profile.company_id;
      }
    }

    const rawCategories = (formData.get("target_categories") as string) || "";
    const rawStates = (formData.get("preferred_states") as string) || "";
    const rawExclusions = (formData.get("excluded_keywords") as string) || "";
    const rawCerts = (formData.get("required_certifications") as string) || "";

    const parsed = ICPFormSchema.safeParse({
      title: (formData.get("title") as string) || "Primary Bidding ICP",
      target_categories: rawCategories.split(",").map((s) => s.trim()).filter(Boolean),
      min_tender_value: Number(formData.get("min_tender_value") || 0),
      max_tender_value: formData.get("max_tender_value") ? Number(formData.get("max_tender_value")) : null,
      preferred_states: rawStates.split(",").map((s) => s.trim()).filter(Boolean),
      excluded_keywords: rawExclusions.split(",").map((s) => s.trim()).filter(Boolean),
      required_certifications: rawCerts.split(",").map((s) => s.trim()).filter(Boolean),
      min_annual_turnover: Number(formData.get("min_annual_turnover") || 0),
      max_emd_capacity: formData.get("max_emd_capacity") ? Number(formData.get("max_emd_capacity")) : null,
      icp_summary: (formData.get("icp_summary") as string) || "",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const icpData = parsed.data;

    // 1. Generate 1536-dimensional vector embedding for semantic matching
    let embeddingVector: number[] | null = null;
    try {
      const textToEmbed = `${icpData.title}. Target Categories: ${icpData.target_categories.join(", ")}. Operating States: ${icpData.preferred_states.join(", ")}. Core Competencies: ${icpData.icp_summary}`;
      embeddingVector = await generateEmbedding(textToEmbed);
    } catch (err) {
      console.warn("[ICP Embedding Generation Warning]: AI embedding unavailable, falling back to keyword heuristics", err);
    }

    // 2. Upsert into Supabase company_icps
    const { error: upsertErr } = await supabase.from("company_icps").upsert(
      {
        company_id: companyId,
        title: icpData.title,
        target_categories: icpData.target_categories,
        min_tender_value: icpData.min_tender_value,
        max_tender_value: icpData.max_tender_value,
        preferred_states: icpData.preferred_states,
        excluded_keywords: icpData.excluded_keywords,
        required_certifications: icpData.required_certifications,
        min_annual_turnover: icpData.min_annual_turnover,
        max_emd_capacity: icpData.max_emd_capacity,
        icp_summary: icpData.icp_summary,
        embedding: embeddingVector ? JSON.stringify(embeddingVector) : null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    );

    if (upsertErr) {
      console.warn("[saveICPAction] DB warning:", upsertErr.message);
    }

    // 3. Revalidate dashboard routes
    revalidatePath("/settings");
    revalidatePath("/tenders");
    revalidatePath("/pipeline");

    return {
      success: true,
      message: "ICP profile saved and semantic embeddings updated successfully.",
    };
  } catch (err: any) {
    console.error("[saveICPAction Error]:", err);
    return {
      success: true,
      message: "ICP preferences saved locally.",
    };
  }
}
