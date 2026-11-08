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
  Globe,
  FileText,
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
  direct_portal_url?: string;
  original_document_urls?: string[];
  raw_payload?: Record<string, unknown>;
  match_score: number;
  ai_summary: {
    executive_summary: string;
    bid_go_no_go_recommendation?: string;
    recommendation_rationale?: string;
  };
}

function getDirectPortalUrl(tender: TenderCardData): string {
  if (tender.direct_portal_url && tender.direct_portal_url.startsWith("http")) {
    return tender.direct_portal_url;
  }
  if (tender.original_document_urls && tender.original_document_urls.length > 0 && tender.original_document_urls[0].startsWith("http")) {
    return tender.original_document_urls[0];
  }
  const cleanRef = tender.tender_ref_number.replace(/[^0-9]/g, "");
  const p = tender.portal.toLowerCase();
  if (p === "gem") {
    return `https://bidplus.gem.gov.in/showbidDocument/${cleanRef || "8941203"}`;
  }
  if (p === "cppp") {
    return `https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=${encodeURIComponent(tender.tender_ref_number)}`;
  }
  return `https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=${encodeURIComponent(tender.tender_ref_number)}`;
}

function getPortalLabel(portal: string): string {
  const p = portal.toLowerCase();
  if (p === "gem") return "GeM Bidplus";
  if (p === "cppp") return "CPPP eProcure";
  if (p === "state_portal") return "State Portal";
  return portal.toUpperCase();
}

export function TenderCard({ tender }: { tender: TenderCardData }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const scoreBadge = getScoreBadge(tender.match_score);
  const deadlineInfo = getDaysRemaining(tender.submission_deadline);
  const directUrl = getDirectPortalUrl(tender);
  const portalLabel = getPortalLabel(tender.portal);

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
          {/* Direct link on portal badge */}
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 transition"
            title={`View official listing on ${portalLabel}`}
          >
            <Globe className="h-3 w-3" />
            <span>{portalLabel}</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-slate-500 hover:text-blue-600 transition"
            title="Open official tender notice"
          >
            {tender.tender_ref_number}
          </a>
        </div>

        {/* AI Match Score Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${scoreBadge.bgColor} ${scoreBadge.color}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{tender.match_score}% Match • {scoreBadge.label}</span>
        </div>
      </div>

      {/* Main Title - Clickable directly to portal */}
      <h2 className="mt-2 text-base font-bold text-slate-900 leading-snug">
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-700 hover:underline transition inline-flex items-baseline gap-1.5"
          title={`Click to open official tender page on ${portalLabel}`}
        >
          <span>{tender.title}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 self-center" />
        </a>
      </h2>

      {/* Authority Name & Category */}
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          {tender.authority_name}
        </span>
        <span>•</span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {tender.category}
        </span>
      </div>

      {/* Highlighted Plain-Language AI Summary Box */}
      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
        <div className="flex items-center justify-between pb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Plain-Language AI Brief
          </span>

          {tender.ai_summary.bid_go_no_go_recommendation && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                tender.ai_summary.bid_go_no_go_recommendation === "STRONG_BID"
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {tender.ai_summary.bid_go_no_go_recommendation.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed text-slate-700">
          {tender.ai_summary.executive_summary}
        </p>

        {tender.ai_summary.recommendation_rationale && (
          <p className="mt-2 text-[11px] text-emerald-900/80 font-medium border-t border-emerald-200/50 pt-1.5">
            <strong>AI Rationale:</strong> {tender.ai_summary.recommendation_rationale}
          </p>
        )}
      </div>

      {/* 4-Stat High-Legibility Metrics Strip */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block">
            Estimated Value
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            {formatINR(tender.estimated_value)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block">
            EMD Deposit
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            {formatINR(tender.emd_amount)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block">
            Closing Date
          </span>
          <span className="text-xs font-semibold text-slate-900 block truncate">
            {formatTenderDate(tender.submission_deadline).split(",")[0]}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 block">
            Time Left
          </span>
          <span
            className={`text-xs font-bold inline-flex items-center gap-1 ${
              deadlineInfo.isUrgent ? "text-rose-600 font-extrabold" : "text-emerald-700"
            }`}
          >
            <Clock className="h-3 w-3" />
            {deadlineInfo.label}
          </span>
        </div>
      </div>

      {/* Expandable Bureaucratic / Raw Technical Specifications Drawer */}
      {detailsOpen && (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs">
          {/* Direct Government Portal Banner */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                Official Listing on {portalLabel}
              </span>
              <p className="text-xs text-blue-800 font-mono truncate max-w-md">
                {directUrl}
              </p>
            </div>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Portal Page
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Tender Reference ID:</span>{" "}
              <span className="font-mono text-slate-900">{tender.tender_ref_number}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Procuring Authority:</span>{" "}
              {tender.authority_name}
            </div>
            {tender.published_date && (
              <div>
                <span className="font-semibold text-slate-700">Notice Published:</span>{" "}
                {formatTenderDate(tender.published_date)}
              </div>
            )}
            {tender.opening_date && (
              <div>
                <span className="font-semibold text-slate-700">Technical Bid Opening:</span>{" "}
                {formatTenderDate(tender.opening_date)}
              </div>
            )}
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Direct Portal Link Button */}
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 px-3.5 py-2 text-xs font-bold text-blue-700 hover:text-blue-800 transition shadow-2xs"
            title={`Go directly to tender page on ${portalLabel}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Go to {portalLabel} Listing</span>
          </a>

          <Link
            href={`/draft-bid?tenderId=${tender.id}&ref=${encodeURIComponent(tender.tender_ref_number)}&title=${encodeURIComponent(tender.title)}&category=${encodeURIComponent(tender.category)}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
            title="Draft GFR 173(i) EMD Exemption, Make in India Declaration & Trade Schedules"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            <span>Draft Bid</span>
          </Link>

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
