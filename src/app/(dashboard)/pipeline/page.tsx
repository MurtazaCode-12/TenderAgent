import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatINR, formatTenderDate } from "@/lib/utils";
import { updatePipelineStageAction } from "@/actions/tenders";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanbanSquare, ArrowRight, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { PipelineStage } from "@/types";

const PIPELINE_COLUMNS: Array<{ stage: PipelineStage; label: string; color: string }> = [
  { stage: "under_review", label: "Under Review", color: "border-t-blue-500" },
  { stage: "bid_drafting", label: "Bid Drafting", color: "border-t-amber-500" },
  { stage: "compliance_passed", label: "Compliance Cleared", color: "border-t-emerald-500" },
  { stage: "submitted", label: "Bid Submitted", color: "border-t-purple-500" },
];

const SAMPLE_PIPELINE = [
  {
    id: "pipe-1",
    tender_id: "tender-1",
    stage: "under_review" as PipelineStage,
    title: "Supply, Installation & Maintenance of Cloud Server Infrastructure & High-Performance GPUs",
    authority_name: "Dept of Science & Technology",
    estimated_value: 48500000,
    submission_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Saved via WhatsApp SDR quick-reply button",
  },
  {
    id: "pipe-2",
    tender_id: "tender-2",
    stage: "bid_drafting" as PipelineStage,
    title: "Hospital Information Management System (HIMS) with Telemedicine",
    authority_name: "Ministry of Health and Family Welfare",
    estimated_value: 95000000,
    submission_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "Drafting technical proposal and gathering CMMI certificates",
  },
  {
    id: "pipe-3",
    tender_id: "tender-3",
    stage: "compliance_passed" as PipelineStage,
    title: "Annual Maintenance Contract for Cisco Enterprise Firewalls",
    authority_name: "NICSI",
    estimated_value: 12500000,
    submission_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    internal_notes: "AI Compliance Score: 96%. All OEM MAF certificates attached.",
  },
];

export default async function PipelinePage() {
  let pipelineItems = SAMPLE_PIPELINE;

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
        estimated_value: item.tenders?.estimated_value || 0,
        submission_deadline: item.tenders?.submission_deadline || new Date().toISOString(),
        internal_notes: item.internal_notes || "",
      }));
    }
  } catch (err) {
    console.warn("Using sample pipeline items:", err);
  }

  // Calculate total active pipeline value
  const totalPipelineValue = pipelineItems.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <KanbanSquare className="h-6 w-6 text-emerald-600" />
            Bid Pipeline Tracker
          </h1>
          <p className="text-sm text-slate-500">
            Track active tenders from discovery to technical qualification and award
          </p>
        </div>

        <div className="rounded-lg bg-emerald-50 px-4 py-2 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Active Pipeline Value</span>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {formatINR(totalPipelineValue)}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {PIPELINE_COLUMNS.map((col) => {
          const itemsInCol = pipelineItems.filter((i) => i.stage === col.stage);

          return (
            <div key={col.stage} className="flex flex-col rounded-xl bg-slate-200/50 p-3 dark:bg-slate-900/50">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {col.label}
                </span>
                <Badge variant="secondary" className="text-xs font-bold">
                  {itemsInCol.length}
                </Badge>
              </div>

              {/* Items List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {itemsInCol.map((item) => (
                  <Card key={item.id} className={`border-t-4 ${col.color} shadow-sm transition hover:shadow-md`}>
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <p className="text-[11px] text-slate-500">
                        {item.authority_name}
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatINR(item.estimated_value)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Due: {formatTenderDate(item.submission_deadline).split(",")[0]}
                        </span>
                      </div>

                      {item.internal_notes && (
                        <p className="rounded bg-slate-50 p-1.5 text-[11px] text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
                          📝 {item.internal_notes}
                        </p>
                      )}

                      {/* Advance Stage button */}
                      {col.stage !== "submitted" && (
                        <form
                          action={async () => {
                            "use server";
                            const nextStage: Record<string, PipelineStage> = {
                              under_review: "bid_drafting",
                              bid_drafting: "compliance_passed",
                              compliance_passed: "submitted",
                            };
                            await updatePipelineStageAction(item.id, nextStage[col.stage]);
                          }}
                          className="pt-1"
                        >
                          <Button variant="ghost" size="sm" className="w-full text-xs h-7 justify-between text-slate-600 hover:text-emerald-600">
                            <span>Advance Stage</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {itemsInCol.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                    No tenders in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
