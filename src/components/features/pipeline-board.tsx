"use client";

import React, { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { formatINR, formatTenderDate } from "@/lib/utils";
import {
  updatePipelineStageAction,
  dismissFromPipelineAction,
  updatePipelineNotesAction,
} from "@/actions/tenders";
import { useToast } from "@/components/ui/toast-context";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  Archive,
  MoreVertical,
  Loader2,
  IndianRupee,
  Calendar,
  Building2,
  Edit3,
  Check,
} from "lucide-react";
import type { PipelineStage } from "@/types";

export interface PipelineCardItem {
  id: string;
  tender_id: string;
  stage: PipelineStage;
  title: string;
  authority_name: string;
  estimated_value: number | null;
  submission_deadline: string;
  internal_notes: string;
  tender_ref_number?: string;
}

const STAGES: Array<{
  stage: PipelineStage;
  label: string;
  description: string;
  color: string;
  borderClass: string;
}> = [
  {
    stage: "under_review",
    label: "Under Review",
    description: "Evaluating RFP specifications & initial feasibility",
    color: "bg-blue-500",
    borderClass: "border-t-blue-500",
  },
  {
    stage: "bid_drafting",
    label: "Bid Drafting",
    description: "Compiling BOQ, technical proposal & annexures",
    color: "bg-amber-500",
    borderClass: "border-t-amber-500",
  },
  {
    stage: "compliance_passed",
    label: "Compliance Cleared",
    description: "AI audit verified; ready for final portal upload",
    color: "bg-emerald-500",
    borderClass: "border-t-emerald-500",
  },
  {
    stage: "submitted",
    label: "Submitted",
    description: "Acknowledged bid reference generated on portal",
    color: "bg-purple-500",
    borderClass: "border-t-purple-500",
  },
];

const NEXT_STAGE_MAP: Record<PipelineStage, { next: PipelineStage; label: string } | null> = {
  discovered: { next: "under_review", label: "Start Review" },
  under_review: { next: "bid_drafting", label: "Move to Drafting" },
  bid_drafting: { next: "compliance_passed", label: "Mark Compliant" },
  compliance_passed: { next: "submitted", label: "Mark Submitted" },
  submitted: null,
  won: null,
  lost: null,
  passed: null,
};

export function PipelineBoard({ initialItems }: { initialItems: PipelineCardItem[] }) {
  const [items, setItems] = useState<PipelineCardItem[]>(initialItems);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // React 19 Optimistic UI state
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state: PipelineCardItem[], update: { id: string; newStage: PipelineStage }) =>
      state.map((item) => (item.id === update.id ? { ...item, stage: update.newStage } : item))
  );

  // Recalculate total pipeline value in real-time
  const totalValue = optimisticItems
    .filter((i) => i.stage !== "passed" && i.stage !== "lost")
    .reduce((sum, i) => sum + (i.estimated_value || 0), 0);

  const handleAdvanceStage = (itemId: string, currentStage: PipelineStage) => {
    const nextConfig = NEXT_STAGE_MAP[currentStage];
    if (!nextConfig) return;

    const nextStage = nextConfig.next;
    setPendingId(itemId);

    startTransition(async () => {
      // 1. Instantly update UI optimistically
      setOptimisticItems({ id: itemId, newStage: nextStage });

      try {
        const res = await updatePipelineStageAction(itemId, nextStage);
        if (res.success) {
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, stage: nextStage } : i))
          );
          toast({
            type: "success",
            title: "Pipeline Updated",
            description: `Tender moved to ${nextStage.replace(/_/g, " ")}.`,
          });
        }
      } catch (err) {
        toast({
          type: "error",
          title: "Update failed",
          description: "Could not update tender stage. Please try again.",
        });
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleDismiss = (itemId: string, title: string) => {
    setPendingId(itemId);

    startTransition(async () => {
      // Optimistically set to passed
      setOptimisticItems({ id: itemId, newStage: "passed" });

      try {
        const res = await dismissFromPipelineAction(itemId);
        if (res.success) {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
          toast({
            type: "info",
            title: "Tender Archived",
            description: `Removed from active pipeline.`,
          });
        }
      } catch (err) {
        toast({
          type: "error",
          title: "Failed to archive",
          description: "Could not archive tender.",
        });
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleSaveNote = (itemId: string) => {
    startTransition(async () => {
      try {
        await updatePipelineNotesAction(itemId, noteText);
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, internal_notes: noteText } : i))
        );
        setEditingNoteId(null);
        toast({
          type: "success",
          title: "Notes Saved",
          description: "Internal tender note updated.",
        });
      } catch (err) {
        toast({
          type: "error",
          title: "Failed to save note",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Board Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            My Bid Pipeline
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            Track active tenders as they progress through drafting, compliance check, and submission.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Pipeline Value
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {formatINR(totalValue)}
            </span>
          </div>

          <Link
            href="/compliance"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-2xs"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Audit Bid PDF</span>
          </Link>
        </div>
      </div>

      {/* 4-Column Responsive Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STAGES.map((col) => {
          const colItems = optimisticItems.filter((item) => item.stage === col.stage);

          return (
            <div
              key={col.stage}
              className="flex flex-col rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  <span className="text-xs font-bold text-slate-900 tracking-tight">
                    {col.label}
                  </span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
                  {colItems.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 pt-3 flex-1">
                {colItems.map((item) => {
                  const nextConfig = NEXT_STAGE_MAP[item.stage];
                  const isCurrentPending = pendingId === item.id && isPending;

                  return (
                    <div
                      key={item.id}
                      className={`group relative rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm ${col.borderClass} border-t-4`}
                    >
                      {/* Card Header: Value & Authority */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                        <span className="font-mono text-[11px] text-slate-400">
                          {item.tender_ref_number || "REF-TENDER"}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs">
                          {formatINR(item.estimated_value)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-1 text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {/* Authority */}
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        {item.authority_name}
                      </p>

                      {/* Due Date */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Due: {formatTenderDate(item.submission_deadline).split(",")[0]}
                        </span>

                        <Link
                          href={`/compliance?tenderId=${item.tender_id}&title=${encodeURIComponent(item.title)}`}
                          className="font-medium text-emerald-700 hover:underline"
                        >
                          Audit Bid
                        </Link>
                      </div>

                      {/* Internal Notes / Scratchpad */}
                      {editingNoteId === item.id ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add internal notes, assignees, or estimates..."
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs font-sans text-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNote(item.id)}
                              className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : item.internal_notes ? (
                        <div
                          onClick={() => {
                            setEditingNoteId(item.id);
                            setNoteText(item.internal_notes);
                          }}
                          className="mt-2.5 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 cursor-pointer hover:bg-slate-100/80 transition flex items-start justify-between gap-1"
                        >
                          <p className="line-clamp-2">📝 {item.internal_notes}</p>
                          <Edit3 className="h-3 w-3 text-slate-400 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingNoteId(item.id);
                            setNoteText("");
                          }}
                          className="mt-2 text-[10px] font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Edit3 className="h-3 w-3" /> Add note
                        </button>
                      )}

                      {/* Card Action Buttons */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleDismiss(item.id, item.title)}
                          disabled={isCurrentPending}
                          className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
                        >
                          <Archive className="h-3 w-3" /> Archive
                        </button>

                        {nextConfig && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStage(item.id, item.stage)}
                            disabled={isCurrentPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50"
                          >
                            {isCurrentPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <span>{nextConfig.label}</span>
                                <ArrowRight className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200/80 p-8 text-center">
                    <p className="text-xs text-slate-400">No tenders in this stage</p>
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
