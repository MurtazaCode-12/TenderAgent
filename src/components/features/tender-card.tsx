"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { formatINR, formatTenderDate, getScoreBadge, getDaysRemaining } from "@/lib/utils";
import { saveToPipelineAction } from "@/actions/tenders";
import { useToast } from "@/components/ui/toast-context";
import {
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookmarkPlus,
  Loader2,
  Clock,
} from "lucide-react";

export interface TenderCardData {
  id: string;
  portal: string;
  tender_ref_number: string;
  title: string;
  authority_name: string;
  category: string;
  estimated_value: number | null;
  emd_amount: number | null;
  submission_deadline: string;
  published_date?: string;
  opening_date?: string | null;
  original_document_urls?: string[];
  raw_payload?: Record<string, unknown>;
  match_score: number;
  ai_summary: {
    executive_summary: string;
    bid_go_no_go_recommendation?: string;
    recommendation_rationale?: string;
  };
}

export function TenderCard({ tender }: { tender: TenderCardData }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const scoreBadge = getScoreBadge(tender.match_score);
  const deadlineInfo = getDaysRemaining(tender.submission_deadline);

  const handleSaveToPipeline = () => {
    startTransition(async () => {
      try {
        const res = await saveToPipelineAction(tender.id, "under_review");
        if (res?.error) {
          toast({
            type: "error",
            title: "Failed to save tender",
            description: res.error,
          });
        } else {
          setIsSaved(true);
          toast({
            type: "success",
            title: "Saved to Bid Pipeline",
            description: `${tender.tender_ref_number} is now under review in your pipeline.`,
          });
        }
      } catch (err) {
        toast({
          type: "error",
          title: "Network error",
          description: "Could not connect to server. Please try again.",
        });
      }
    });
  };

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
            {tender.portal.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {tender.tender_ref_number}
          </span>
        </div>

        {/* AI Match Score Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${scoreBadge.bgColor} ${scoreBadge.color}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{tender.match_score}% Match • {scoreBadge.label}</span>
        </div>
      </div>

      {/* Tender Title */}
      <h2 className="mt-2 text-lg font-bold text-slate-900 leading-snug tracking-tight hover:text-emerald-700 transition">
        {tender.title}
      </h2>

      {/* Authority & Category */}
      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          {tender.authority_name}
        </span>
        <span>•</span>
        <span>{tender.category}</span>
      </div>

      {/* Highlighted Plain-Language AI Summary */}
      <div className="mt-4 rounded-xl border border-emerald-100/90 bg-emerald-50/40 p-4">
        <div className="flex items-center justify-between gap-2 pb-1.5">
          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Plain-Language AI Brief:
          </span>
          {tender.ai_summary.bid_go_no_go_recommendation && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                tender.ai_summary.bid_go_no_go_recommendation === "STRONG_BID"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {tender.ai_summary.bid_go_no_go_recommendation.replace("_", " ")}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {tender.ai_summary.executive_summary}
        </p>
        {tender.ai_summary.recommendation_rationale && (
          <p className="mt-2 text-[11px] font-medium text-emerald-800">
            💡 {tender.ai_summary.recommendation_rationale}
          </p>
        )}
      </div>

      {/* Key Stats Row: Value, EMD, Deadline, Time Left */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-50/80 p-3.5 text-xs border border-slate-100">
        <div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-0.5">
            <IndianRupee className="h-3 w-3" /> Estimated Value
          </span>
          <p className="mt-0.5 font-bold text-slate-900 text-sm">
            {formatINR(tender.estimated_value)}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-medium">EMD Amount</span>
          <p className="mt-0.5 font-semibold text-slate-800">
            {formatINR(tender.emd_amount)}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Due Date
          </span>
          <p className="mt-0.5 font-semibold text-slate-800">
            {formatTenderDate(tender.submission_deadline).split(",")[0]}
          </p>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" /> Countdown
          </span>
          <p className={`mt-0.5 font-bold ${deadlineInfo.isUrgent ? "text-rose-600" : "text-emerald-700"}`}>
            {deadlineInfo.label}
          </p>
        </div>
      </div>

      {/* Expandable Bureaucratic Details Accordion */}
      {detailsOpen && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-3 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="font-semibold text-slate-700">Tender ID / Ref:</span>
              <p className="font-mono text-slate-600 mt-0.5">{tender.tender_ref_number}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Issuing Department:</span>
              <p className="text-slate-600 mt-0.5">{tender.authority_name}</p>
            </div>
          </div>

          {tender.raw_payload && Object.keys(tender.raw_payload).length > 0 && (
            <div>
              <span className="font-semibold text-slate-700">Key Mandatory Clauses & Qualifications:</span>
              <ul className="mt-1 list-disc list-inside space-y-1 text-slate-600">
                {Object.entries(tender.raw_payload).map(([k, v]) => (
                  <li key={k}>
                    <strong className="capitalize">{k.replace(/_/g, " ")}:</strong>{" "}
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tender.original_document_urls && tender.original_document_urls.length > 0 && (
            <div className="pt-1">
              <a
                href={tender.original_document_urls[0]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Download Official Tender Notice & RFP Document (.pdf)
              </a>
            </div>
          )}
        </div>
      )}

      {/* Card Action Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          {detailsOpen ? (
            <>
              <ChevronUp className="h-4 w-4" /> Hide Specifications
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> View Original Details
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <Link
            href={`/compliance?tenderId=${tender.id}&title=${encodeURIComponent(tender.title)}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Check Compliance
          </Link>

          <button
            type="button"
            onClick={handleSaveToPipeline}
            disabled={isPending || isSaved}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition ${
              isSaved
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                Saved to Pipeline
              </>
            ) : (
              <>
                <BookmarkPlus className="h-3.5 w-3.5" />
                Save Tender
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
