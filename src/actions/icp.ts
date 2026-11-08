"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/config";
import { ICPFormSchema } from "@/types";

export async function saveICPAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Company profile not found." };
  }

  const rawCategories = (formData.get("target_categories") as string) || "";
  const rawStates = (formData.get("preferred_states") as string) || "";
  const rawExclusions = (formData.get("excluded_keywords") as string) || "";
  const rawCerts = (formData.get("required_certifications") as string) || "";

  const parsed = ICPFormSchema.safeParse({
    title: formData.get("title") || "Primary Bidding ICP",
    target_categories: rawCategories.split(",").map((s) => s.trim()).filter(Boolean),
    min_tender_value: Number(formData.get("min_tender_value") || 0),
    max_tender_value: formData.get("max_tender_value") ? Number(formData.get("max_tender_value")) : null,
    preferred_states: rawStates.split(",").map((s) => s.trim()).filter(Boolean),
    excluded_keywords: rawExclusions.split(",").map((s) => s.trim()).filter(Boolean),
    required_certifications: rawCerts.split(",").map((s) => s.trim()).filter(Boolean),
    min_annual_turnover: Number(formData.get("min_annual_turnover") || 0),
    max_emd_capacity: formData.get("max_emd_capacity") ? Number(formData.get("max_emd_capacity")) : null,
    icp_summary: formData.get("icp_summary") as string,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const icpData = parsed.data;

  // Generate vector embedding for this ICP to power pgvector semantic matching
  let embeddingVector: number[] | null = null;
  try {
    const textToEmbed = `${icpData.title}. Target Categories: ${icpData.target_categories.join(", ")}. Operating States: ${icpData.preferred_states.join(", ")}. Core Competencies: ${icpData.icp_summary}`;
    embeddingVector = await generateEmbedding(textToEmbed);
  } catch (err) {
    console.warn("[ICP Embedding Generation Warning]:", err);
  }

  // Upsert company ICP
  const { error: upsertErr } = await supabase.from("company_icps").upsert(
    {
      company_id: profile.company_id,
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
    },
    { onConflict: "company_id" }
  );

  if (upsertErr) {
    return { error: upsertErr.message };
  }

  revalidatePath("/settings");
  revalidatePath("/tenders");
  return { success: true };
}
