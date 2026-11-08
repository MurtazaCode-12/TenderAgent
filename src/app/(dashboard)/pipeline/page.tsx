import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PipelineBoard, type PipelineCardItem } from "@/components/features/pipeline-board";
import type { PipelineStage } from "@/types";

export const dynamic = "force-dynamic";

const SAMPLE_PIPELINE: PipelineCardItem[] = [
  {
    id: "pipe-1",
    tender_id: "tender-1",
    stage: "under_review",
    title: "Supply, Installation & Maintenance of Cloud Server Infrastructure & High-Performance GPUs",
    authority_name: "Dept of Science & Technology",
    estimated_value: 48500000,
    submission_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Saved via WhatsApp SDR. Reviewing hardware warranty terms.",
    tender_ref_number: "GEM/2026/B/894120",
  },
  {
    id: "pipe-2",
    tender_id: "tender-2",
    stage: "bid_drafting",
    title: "Hospital Information Management System (HIMS) with Telemedicine & ABHA Integration",
    authority_name: "Ministry of Health and Family Welfare",
    estimated_value: 95000000,
    submission_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Drafting technical proposal and gathering CMMI Level 5 certificates.",
    tender_ref_number: "CPPP/2026/HIMS/48102",
  },
  {
    id: "pipe-3",
    tender_id: "tender-3",
    stage: "compliance_passed",
    title: "Comprehensive Annual Maintenance Contract for Enterprise Next-Gen Cisco Firewalls",
    authority_name: "National Informatics Centre Services Inc (NICSI)",
    estimated_value: 12500000,
    submission_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "AI Compliance Score: 96%. All OEM MAF certificates attached.",
    tender_ref_number: "NICSI/DEL/SEC/2026/09",
  },
  {
    id: "pipe-4",
    tender_id: "tender-4",
    stage: "submitted",
    title: "Smart Traffic Monitoring & AI Surveillance System Deployment for Pune Municipal Corp",
    authority_name: "Pune Smart City Development Corp Ltd",
    estimated_value: 142000000,
    submission_deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Bid submitted on Mahatenders. Token acknowledgement #PSCDCL-88401.",
    tender_ref_number: "MAHA/PMRDA/ITS/2026/41",
  },
];

export default async function PipelinePage() {
  let pipelineItems: PipelineCardItem[] = SAMPLE_PIPELINE;

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
    console.warn("Using sample pipeline items:", err);
  }

  return <PipelineBoard initialItems={pipelineItems} />;
}
