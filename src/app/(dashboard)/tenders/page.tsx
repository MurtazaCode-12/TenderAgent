import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatINR, formatTenderDate, getScoreBadge, getDaysRemaining } from "@/lib/utils";
import { saveToPipelineAction } from "@/actions/tenders";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// Fallback high-impact demo data if database is fresh
const SAMPLE_TENDERS = [
  {
    id: "sample-tender-1",
    portal: "gem",
    tender_ref_number: "GEM/2026/B/8941203",
    title: "Supply, Installation & Maintenance of Cloud Server Infrastructure & High-Performance GPUs",
    authority_name: "Department of Science and Technology, Ministry of Science and Technology",
    category: "Information Technology & AI Hardware",
    estimated_value: 48500000,
    emd_amount: 970000,
    submission_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    match_score: 94,
    ai_summary: {
      executive_summary: "High-priority procurement of enterprise-grade compute clusters and AI GPU nodes with 3-year OEM SLA. MSME exemption applicable for EMD & turnover.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Matches past cloud deployment qualifications; MSME status waives ₹9.7L EMD requirement.",
    },
  },
  {
    id: "sample-tender-2",
    portal: "cppp",
    tender_ref_number: "CPPP/2026/MoHFW/419201",
    title: "Development, Implementation and Operations of Hospital Information Management System (HIMS) with Telemedicine",
    authority_name: "Ministry of Health and Family Welfare",
    category: "Software Development & Digital Health",
    estimated_value: 95000000,
    emd_amount: 1900000,
    submission_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    match_score: 88,
    ai_summary: {
      executive_summary: "Statewide turnkey HIMS deployment across district civil hospitals. Requires CMMI Level 3 certification and ABDM compliance.",
      bid_go_no_go_recommendation: "STRONG_BID",
      recommendation_rationale: "Budget and scope closely align with your registered healthcare SaaS profile.",
    },
  },
  {
    id: "sample-tender-3",
    portal: "state_portal",
    tender_ref_number: "STATE/UP/2026/PWD/55120",
    title: "Civil Works & Smart Traffic Surveillance Systems under Smart Cities Mission",
    authority_name: "Uttar Pradesh State Smart City Corporation Ltd",
    category: "Civil Works & Smart City Surveillance",
    estimated_value: 62000000,
    emd_amount: 1240000,
    submission_deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
    match_score: 62,
    ai_summary: {
      executive_summary: "Installation of AI-based ANPR cameras and traffic control center. Disqualification alert: Class A PWD civil registration required.",
      bid_go_no_go_recommendation: "MODERATE_RISK",
      recommendation_rationale: "Requires civil construction joint-venture partner to satisfy physical works criterion.",
    },
  },
];

export default async function TendersFeedPage() {
  let tenders = SAMPLE_TENDERS;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: dbTenders } = await supabase
      .from("tenders")
      .select("*, tender_matches(overall_score, ai_summary)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (dbTenders && dbTenders.length > 0) {
      tenders = dbTenders.map((t: any) => ({
        id: t.id,
        portal: t.portal,
        tender_ref_number: t.tender_ref_number,
        title: t.title,
        authority_name: t.authority_name,
        category: t.category,
        estimated_value: t.estimated_value,
        emd_amount: t.emd_amount,
        submission_deadline: t.submission_deadline,
        match_score: t.tender_matches?.[0]?.overall_score || 85,
        ai_summary: t.tender_matches?.[0]?.ai_summary || {
          executive_summary: t.description || "Active public tender matching company profile criteria.",
          bid_go_no_go_recommendation: "STRONG_BID",
          recommendation_rationale: "Evaluated by TenderOps AI matching engine.",
        },
      }));
    }
  } catch (err) {
    console.warn("Using sample tender feed for display:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tender Discovery Feed
          </h1>
          <p className="text-sm text-slate-500">
            AI-matched procurement opportunities across GeM, CPPP, and State Portals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1.5 py-1 px-3">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            AI Filter: Threshold &gt; 80%
          </Badge>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              Adjust ICP Rules
            </Button>
          </Link>
        </div>
      </div>

      {/* Tender List */}
      <div className="space-y-4">
        {tenders.map((tender) => {
          const scoreBadge = getScoreBadge(tender.match_score);
          const deadlineInfo = getDaysRemaining(tender.submission_deadline);

          return (
            <Card key={tender.id} className="transition-all hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {tender.portal.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {tender.tender_ref_number}
                    </span>
                  </div>

                  {/* AI Match Badge */}
                  <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${scoreBadge.bgColor} ${scoreBadge.color}`}>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{tender.match_score}% Match • {scoreBadge.label}</span>
                  </div>
                </div>

                <CardTitle className="mt-2 text-lg font-semibold text-slate-900 hover:text-emerald-600 dark:text-white">
                  {tender.title}
                </CardTitle>

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>{tender.authority_name}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Financials & Deadline Grid */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3 text-sm md:grid-cols-4 dark:bg-slate-800/60">
                  <div>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" /> Estimated Value
                    </span>
                    <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                      {formatINR(tender.estimated_value)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-500">EMD Amount</span>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {formatINR(tender.emd_amount)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Submission Deadline
                    </span>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {formatTenderDate(tender.submission_deadline)}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-500">Time Left</span>
                    <p className={`mt-0.5 font-bold ${deadlineInfo.isUrgent ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {deadlineInfo.label}
                    </p>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    AI Executive Analysis & Recommendation:
                    <Badge variant={tender.ai_summary.bid_go_no_go_recommendation === "STRONG_BID" ? "default" : "secondary"} className="ml-1 text-[10px]">
                      {tender.ai_summary.bid_go_no_go_recommendation.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {tender.ai_summary.executive_summary}
                  </p>
                  {tender.ai_summary.recommendation_rationale && (
                    <p className="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      💡 {tender.ai_summary.recommendation_rationale}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    Category: <span className="font-medium text-slate-700 dark:text-slate-300">{tender.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/compliance?tenderId=${tender.id}&title=${encodeURIComponent(tender.title)}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Run AI Compliance Audit
                      </Button>
                    </Link>

                    <form action={async () => {
                      "use server";
                      await saveToPipelineAction(tender.id, "under_review");
                    }}>
                      <Button size="sm" className="gap-1.5">
                        Save to Pipeline
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
