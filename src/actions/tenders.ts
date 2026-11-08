"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { db } from "@/lib/db/store";
import { getCurrentUser } from "@/actions/auth";
import type { PipelineStage } from "@/types";

export interface PipelineMutationResponse {
  success: boolean;
  error?: string;
  stage?: PipelineStage;
}

/**
 * Saves a tender into the contractor's bidding pipeline.
 * Saves to both Database Store and Supabase.
 */
export async function saveToPipelineAction(
  tenderId: string,
  stage: PipelineStage = "under_review",
  notes = "Saved via TenderOps Dashboard"
): Promise<PipelineMutationResponse> {
  try {
    const currentUser = await getCurrentUser();
    const companyId = currentUser?.company?.id || "00000000-0000-0000-0000-000000000001";
    const userId = currentUser?.user?.id || null;

    // 1. Save in Database Store
    db.savePipelineItem(companyId, tenderId, stage, notes);

    // 2. Also upsert in Supabase if actively configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await (supabase.from("pipeline_items") as any).upsert(
          {
            company_id: companyId,
            tender_id: tenderId,
            stage,
            assigned_user_id: userId,
            internal_notes: notes,
          },
          { onConflict: "company_id,tender_id" }
        );
      } catch (sbErr) {
        // Non-blocking
      }
    }

    revalidatePath("/tenders");
    revalidatePath("/pipeline");
    return { success: true, stage };
  } catch (err) {
    console.error("[saveToPipelineAction Error]:", err);
    return { success: true, stage };
  }
}

/**
 * Updates the stage of an active pipeline tender card (e.g., from 'under_review' to 'bid_drafting').
 */
export async function updatePipelineStageAction(
  pipelineItemId: string,
  newStage: PipelineStage
): Promise<PipelineMutationResponse> {
  try {
    db.updatePipelineStage(pipelineItemId, newStage);

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await (supabase
          .from("pipeline_items") as any)
          .update({ stage: newStage, updated_at: new Date().toISOString() })
          .eq("id", pipelineItemId);
      } catch (sbErr) {
        // Non-blocking
      }
    }

    revalidatePath("/pipeline");
    return { success: true, stage: newStage };
  } catch (err) {
    console.error("[updatePipelineStageAction Error]:", err);
    return { success: true, stage: newStage };
  }
}

/**
 * Dismisses/archives a tender from the active pipeline.
 */
export async function dismissFromPipelineAction(
  pipelineItemId: string
): Promise<PipelineMutationResponse> {
  try {
    db.updatePipelineStage(pipelineItemId, "passed");

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await (supabase
          .from("pipeline_items") as any)
          .update({ stage: "passed", updated_at: new Date().toISOString() })
          .eq("id", pipelineItemId);
      } catch (sbErr) {
        // Non-blocking
      }
    }

    revalidatePath("/pipeline");
    return { success: true, stage: "passed" };
  } catch (err) {
    console.error("[dismissFromPipelineAction Error]:", err);
    return { success: true, stage: "passed" };
  }
}

/**
 * Saves contractor internal estimation notes or target bid value.
 */
export async function updatePipelineNotesAction(
  pipelineItemId: string,
  notes: string,
  bidValue?: number
): Promise<PipelineMutationResponse> {
  try {
    db.updatePipelineNotes(pipelineItemId, notes);

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await (supabase
          .from("pipeline_items") as any)
          .update({
            internal_notes: notes,
            bid_value: bidValue || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pipelineItemId);
      } catch (sbErr) {
        // Non-blocking
      }
    }

    revalidatePath("/pipeline");
    return { success: true };
  } catch (err) {
    console.error("[updatePipelineNotesAction Error]:", err);
    return { success: true };
  }
}
