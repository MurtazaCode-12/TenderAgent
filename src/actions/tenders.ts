"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PipelineStage } from "@/types";

export async function saveToPipelineAction(tenderId: string, stage: PipelineStage = "under_review") {
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

  const { error } = await supabase.from("pipeline_items").upsert(
    {
      company_id: profile.company_id,
      tender_id: tenderId,
      stage,
      assigned_user_id: user.id,
      internal_notes: "Added from TenderOps dashboard",
    },
    { onConflict: "company_id,tender_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tenders");
  revalidatePath("/pipeline");
  return { success: true };
}

export async function updatePipelineStageAction(pipelineItemId: string, newStage: PipelineStage) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("pipeline_items")
    .update({ stage: newStage })
    .eq("id", pipelineItemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pipeline");
  return { success: true };
}
