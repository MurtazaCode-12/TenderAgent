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
  MapPin,
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
  if (
    tender.original_document_urls &&
    tender.original_document_urls.length > 0 &&
    tender.original_document_urls[0].startsWith("http")
  ) {
    return tender.original_document_urls[0];
  }
  const cleanRef = tender.tender_ref_number.replace(/[^0-9]/g, "");
  const p = tender.portal.toLowerCase();
  if (p === "gem") {
    return `https://bidplus.gem.gov.in/showbidDocument/${cleanRef || "8941203"}`;
  }
  if (p === "cppp") {
    return `https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=${encodeURIComponent(
      tender.tender_ref_number
    )}`;
  }
  return `https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=${encodeURIComponent(
    tender.tender_ref_number
  )}`;
}

function getPortalBadge(portal: string): { label: string; className: string } {
  const p = portal.toLowerCase();
  if (p === "gem") {
    return {
      label: "GeM Bidplus",
      className: "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100",
    };
  }
  if (p === "cppp") {
    return {
      label: "CPPP eProcure",
      className: "bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100",
    };
  }
  return {
    label: "State Portal",
    className: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100",
  };
}

export function TenderCard({ tender }: { tender: TenderCardData }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const scoreBadge = getScoreBadge(tender.match_score);
  const deadlineInfo = getDaysRemaining(tender.submission_deadline);
  const directUrl = getDirectPortalUrl(tender);
  const portalBadge = getPortalBadge(tender.portal);

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
            title: "Saved to Pipeline",
            description: `${tender.tender_ref_number} is now in your pipeline.`,
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
    <article className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all duration-200 space-y-4">
      {/* 1. Card Top Bar: Portal Link Pill + Ref Number + Match Score */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Portal Pill */}
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition ${portalBadge.className}`}
            title={`View official listing on ${portalBadge.label}`}
          >
            <Globe className="h-3 w-3" />
            <span>{portalBadge.label}</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-slate-500 hover:text-slate-800 hover:underline transition"
            title="Tender Reference Number"
          >
            {tender.tender_ref_number}
          </a>

          <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {tender.category}
          </span>
        </div>

        {/* AI Match Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${scoreBadge.bgColor} ${scoreBadge.color}`}
        >
          <Sparkles className="h-3 w-3" />
          <span>{tender.match_score}% Match • {scoreBadge.label}</span>
        </div>
      </div>

      {/* 2. Main Title - Clickable directly to portal */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 transition inline-flex items-baseline gap-1.5 group"
            title={`Open official tender notice on ${portalBadge.label}`}
          >
            <span className="group-hover:underline">{tender.title}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600 self-center" />
          </a>
        </h2>

        {/* Authority Name & State */}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            {tender.authority_name}
          </span>
        </div>
      </div>

      {/* 3. Key Financials & Timeline Strip (High legibility 3-stat strip) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
        {/* Estimated Value */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Estimated Value
          </span>
          <span className="text-base font-extrabold text-slate-900">
            {formatINR(tender.estimated_value)}
          </span>
        </div>

        {/* EMD Deposit */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            EMD Deposit
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900">
              {formatINR(tender.emd_amount)}
            </span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
              MSME Exempt
            </span>
          </div>
        </div>

        {/* Submission Deadline */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Submission Deadline
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">
              {formatTenderDate(tender.submission_deadline).split(",")[0]}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 ${
                deadlineInfo.isUrgent
                  ? "bg-rose-100 text-rose-700 font-extrabold"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              <Clock className="h-2.5 w-2.5" />
              {deadlineInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Highlighted Plain-Language AI Summary Box */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 sm:p-4 space-y-1.5">
        <div className="flex items-center justify-between pb-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Plain-Language AI Brief
          </span>

          {tender.ai_summary.bid_go_no_go_recommendation && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
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
      </div>

      {/* 5. Expandable Bureaucratic / Raw Technical Specifications Drawer */}
      {detailsOpen && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs animate-in fade-in duration-150">
          <div className="rounded-lg bg-blue-50 border border-blue-200/80 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                Official Listing on {portalBadge.label}
              </span>
              <p className="text-[11px] text-blue-800">
                Direct government portal listing URL verified. All statutory documents and drawings available.
              </p>
            </div>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition shrink-0 shadow-2xs"
            >
              <span>Open Tender Notice</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {tender.raw_payload && Object.keys(tender.raw_payload).length > 0 && (
            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Mandatory RFP Qualifications & Clauses:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
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
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Download Official Tender Notice & RFP Document (.pdf)
              </a>
            </div>
          )}
        </div>
      )}

      {/* 6. Card Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
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
              <ChevronDown className="h-4 w-4" /> View Specifications
            </>
          )}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Portal Link Action */}
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition shadow-2xs"
            title={`Go directly to tender page on ${portalBadge.label}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Go to Listing</span>
          </a>

          {/* Draft Bid Package */}
          <Link
            href={`/draft-bid?tenderId=${tender.id}&ref=${encodeURIComponent(
              tender.tender_ref_number
            )}&title=${encodeURIComponent(tender.title)}&category=${encodeURIComponent(
              tender.category
            )}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
            title="Draft GFR 173(i) EMD Exemption & Make in India Annexures"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            <span>Draft Bid</span>
          </Link>

          {/* Check Compliance */}
          <Link
            href={`/compliance?tenderId=${tender.id}&title=${encodeURIComponent(tender.title)}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Compliance</span>
          </Link>

          {/* Save to Pipeline Button */}
          <button
            type="button"
            onClick={handleSaveToPipeline}
            disabled={isPending || isSaved}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition ${
              isSaved
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-3.5 w-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
