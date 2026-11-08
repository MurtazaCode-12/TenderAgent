import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/store";
import { getCurrentUser } from "@/actions/auth";
import { PipelineBoard, type PipelineCardItem } from "@/components/features/pipeline-board";
import type { PipelineStage } from "@/types";

export const dynamic = "force-dynamic";

const SAMPLE_PIPELINE: PipelineCardItem[] = [
  {
    id: "pipe-1",
    tender_id: "00000000-0000-0000-0000-000000000014",
    stage: "under_review",
    title: "Supply, Rack-Mount Installation and 3-Year Enterprise Support for NVIDIA H100 AI Compute Nodes",
    authority_name: "Department of Science and Technology",
    estimated_value: 48500000,
    submission_deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Saved via WhatsApp SDR. Reviewing hardware warranty terms.",
    tender_ref_number: "GEM/2026/B/8941203",
  },
  {
    id: "pipe-2",
    tender_id: "00000000-0000-0000-0000-000000000011",
    stage: "bid_drafting",
    title: "Procurement, Implementation & Operations of Cloud Hospital Information Management System (HIMS)",
    authority_name: "Ministry of Health and Family Welfare",
    estimated_value: 95000000,
    submission_deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Drafting technical proposal and gathering CMMI Level 5 certificates.",
    tender_ref_number: "CPPP/2026/MOHFW/HIMS/49102",
  },
  {
    id: "pipe-3",
    tender_id: "00000000-0000-0000-0000-000000000012",
    stage: "compliance_passed",
    title: "Annual Comprehensive Maintenance Contract for Cisco Core Routing, Switching and UTM Firewall Architecture",
    authority_name: "National Informatics Centre Services Inc (NICSI)",
    estimated_value: 12500000,
    submission_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "AI Compliance Score: 96%. All OEM MAF certificates attached.",
    tender_ref_number: "GEM/2026/B/8834920",
  },
  {
    id: "pipe-4",
    tender_id: "00000000-0000-0000-0000-000000000013",
    stage: "submitted",
    title: "Engineering, Procurement & Construction (EPC) of Smart Integrated Command & Control Center (ICCC)",
    authority_name: "CIDCO Maharashtra",
    estimated_value: 78000000,
    submission_deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Bid submitted on Mahatenders. Token acknowledgement #CIDCO-4192.",
    tender_ref_number: "STATE/MH/2026/CIDCO/4192",
  },
];

export default async function PipelinePage() {
  const currentUser = await getCurrentUser();
  const companyId = currentUser?.company?.id || "00000000-0000-0000-0000-000000000001";

  let pipelineItems: PipelineCardItem[] = [];

  // 1. Fetch from connected Database Store
  const localItems = db.getPipelineItems(companyId);
  if (localItems.length > 0) {
    pipelineItems = localItems.map((item) => ({
      id: item.id,
      tender_id: item.tender_id,
      stage: item.stage as PipelineStage,
      title: item.tender?.title || "Government Tender",
      authority_name: item.tender?.authority_name || "Public Authority",
      estimated_value: item.tender?.estimated_value ?? null,
      submission_deadline: item.tender?.submission_deadline || new Date().toISOString(),
      internal_notes: item.internal_notes || "",
      tender_ref_number: item.tender?.tender_ref_number || "",
    }));
  }

  // 2. Fallback to Supabase or Sample Pipeline if empty
  if (pipelineItems.length === 0) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: dbItems } = await supabase
        .from("pipeline_items")
        .select("*, tenders(*)")
        .order("updated_at", { ascending: false });

      if (dbItems && dbItems.length > 0) {
        pipelineItems = dbItems.map((item: any) => ({
          id: item.id,
          tender_id: item.tender_id,
          stage: item.stage as PipelineStage,
          title: item.tenders?.title || "Government Tender",
          authority_name: item.tenders?.authority_name || "Public Authority",
          estimated_value: item.tenders?.estimated_value ?? null,
          submission_deadline: item.tenders?.submission_deadline || new Date().toISOString(),
          internal_notes: item.internal_notes || "",
          tender_ref_number: item.tenders?.tender_ref_number || "",
        }));
      }
    } catch (err) {
      // Non-blocking
    }
  }

  if (pipelineItems.length === 0) {
    pipelineItems = SAMPLE_PIPELINE;
  }

  return <PipelineBoard initialItems={pipelineItems} />;
}
