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
import { RealTimeStatusTracker } from "@/components/features/real-time-status-tracker";
import type { DBBidApplication } from "@/lib/db/store";
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
  Radio,
  X,
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
  application?: DBBidApplication;
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
    description: "Compiling BOQ pricing, annexures & qualifications",
    color: "bg-amber-500",
    borderClass: "border-t-amber-500",
  },
  {
    stage: "compliance_passed",
    label: "Compliance Passed",
    description: "Passed AI RFP verification (Zero Disqualification Risk)",
    color: "bg-emerald-500",
    borderClass: "border-t-emerald-500",
  },
  {
    stage: "submitted",
    label: "Bid Submitted",
    description: "Encrypted submission acknowledged on government portal",
    color: "bg-indigo-500",
    borderClass: "border-t-indigo-500",
  },
];

const NEXT_STAGE_MAP: Record<PipelineStage, { next: PipelineStage; label: string } | null> = {
  discovered: { next: "under_review", label: "Review Tender" },
  under_review: { next: "bid_drafting", label: "Start Drafting" },
  bid_drafting: { next: "compliance_passed", label: "Run Compliance" },
  compliance_passed: { next: "submitted", label: "Mark Submitted" },
  submitted: null,
  won: null,
  lost: null,
  passed: null,
};

export function PipelineBoard({ initialItems }: { initialItems: PipelineCardItem[] }) {
  const [items, setItems] = useState<PipelineCardItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activeApp, setActiveApp] = useState<DBBidApplication | null>(null);
  const { toast } = useToast();

  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state, update: { id: string; nextStage?: PipelineStage; remove?: boolean; notes?: string }) => {
      if (update.remove) {
        return state.filter((item) => item.id !== update.id);
      }
      return state.map((item) => {
        if (item.id === update.id) {
          return {
            ...item,
            stage: update.nextStage || item.stage,
            internal_notes: update.notes !== undefined ? update.notes : item.internal_notes,
          };
        }
        return item;
      });
    }
  );

  const handleAdvanceStage = (itemId: string, currentStage: PipelineStage) => {
    const config = NEXT_STAGE_MAP[currentStage];
    if (!config) return;

    setPendingId(itemId);

    startTransition(async () => {
      setOptimisticItems({ id: itemId, nextStage: config.next });

      try {
        const res = await updatePipelineStageAction(itemId, config.next);
        if (res.success) {
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, stage: config.next } : i))
          );
          toast({
            type: "success",
            title: `Moved to ${config.next.replace(/_/g, " ").toUpperCase()}`,
            description: "Pipeline card stage successfully updated.",
          });
        }
      } catch (err) {
        toast({
          type: "error",
          title: "Update failed",
          description: "Could not update pipeline stage. Please try again.",
        });
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleDismiss = (itemId: string, tenderTitle: string) => {
    setPendingId(itemId);

    startTransition(async () => {
      setOptimisticItems({ id: itemId, remove: true });

      try {
        const res = await dismissFromPipelineAction(itemId);
        if (res.success) {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
          toast({
            type: "info",
            title: "Tender Archived",
            description: `Archived "${tenderTitle.slice(0, 30)}..." from active pipeline.`,
          });
        }
      } catch (err) {
        toast({
          type: "error",
          title: "Action failed",
          description: "Could not archive card.",
        });
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleSaveNote = (itemId: string) => {
    startTransition(async () => {
      setOptimisticItems({ id: itemId, notes: noteText });

      try {
        await updatePipelineNotesAction(itemId, noteText);
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, internal_notes: noteText } : i))
        );
        setEditingNoteId(null);
        toast({
          type: "success",
          title: "Note Saved",
          description: "Internal tender note updated.",
        });
      } catch (err) {
        toast({
          type: "error",
          title: "Error saving note",
          description: "Please try again.",
        });
      }
    });
  };

  const totalValue = optimisticItems.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Board Header & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Bid Pipeline
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-normal">
            Track active tenders as they progress through drafting, compliance check, submission, and live portal evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Active Pipeline Value
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatINR(totalValue)}
            </span>
          </div>

          <Link
            href="/compliance"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition shadow-2xs"
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
              className="flex flex-col rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 min-h-[500px] dark:border-slate-800 dark:bg-slate-900/60"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                    {col.label}
                  </span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
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
                      className={`group relative rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${col.borderClass} border-t-4`}
                    >
                      {/* Card Header: Value & Authority */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                          {item.tender_ref_number || "REF-TENDER"}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {formatINR(item.estimated_value)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mt-1 text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {/* Authority */}
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        {item.authority_name}
                      </p>

                      {/* Live Status Pill for Submitted / Applied Tenders */}
                      {item.application && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setActiveApp(item.application || null)}
                            className="w-full flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 transition"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Radio className="h-3 w-3 text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
                              <span className="truncate">{item.application.status_label}</span>
                            </span>
                            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 ml-1 shrink-0">
                              {item.application.progress_percent}% ↗
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Due Date */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Due: {formatTenderDate(item.submission_deadline).split(",")[0]}
                        </span>

                        <Link
                          href={`/draft-bid?tenderId=${item.tender_id}&ref=${encodeURIComponent(
                            item.tender_ref_number || ""
                          )}&title=${encodeURIComponent(item.title)}`}
                          className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          Draft Bid
                        </Link>
                      </div>

                      {/* Internal Notes / Scratchpad */}
                      {editingNoteId === item.id ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add internal notes, assignees, or estimates..."
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs font-sans text-slate-800 focus:outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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
                          className="mt-2.5 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition flex items-start justify-between gap-1"
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
                          className="mt-2 text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Edit3 className="h-3 w-3" /> Add note
                        </button>
                      )}

                      {/* Card Action Buttons */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleDismiss(item.id, item.title)}
                          disabled={isCurrentPending}
                          className="text-[11px] font-medium text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1"
                        >
                          <Archive className="h-3 w-3" /> Archive
                        </button>

                        {nextConfig && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStage(item.id, item.stage)}
                            disabled={isCurrentPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 transition disabled:opacity-50"
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
                  <div className="rounded-xl border border-dashed border-slate-200/80 p-8 text-center dark:border-slate-800">
                    <p className="text-xs text-slate-400 dark:text-slate-500">No tenders in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Live Status Tracker Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setActiveApp(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <RealTimeStatusTracker
              application={activeApp}
              onUpdated={(updated) => {
                setActiveApp(updated);
                setItems((prev) =>
                  prev.map((i) =>
                    i.tender_id === updated.tender_id ? { ...i, application: updated } : i
                  )
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
