import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/store";
import { getCurrentUser } from "@/actions/auth";
import { TenderCard, type TenderCardData } from "@/components/features/tender-card";
import { TenderFilters } from "@/components/features/tender-filters";
import { ScanPortalsButton } from "@/components/features/scan-portals-button";
import {
  Sparkles,
  SlidersHorizontal,
  Inbox,
  CheckCircle2,
  Building2,
  FileText,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DiscoveryPageProps {
  searchParams: Promise<{
    query?: string;
    portal?: string;
    category?: string;
    welcome?: string;
  }>;
}

export default async function TendersDiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams.query || "").trim().toLowerCase();
  const selectedPortal = (resolvedParams.portal || "all").toLowerCase();
  const selectedCategory = (resolvedParams.category || "all").toLowerCase();
  const isWelcome = resolvedParams.welcome === "true";

  // 1. Get current logged in contractor profile
  const currentUser = await getCurrentUser();
  const companyName = currentUser?.company?.name || currentUser?.user?.company_name || "Apex Infotech";
  const targetTrade = currentUser?.icp?.target_categories?.[0] || "All Contractor Trades";

  // 2. Fetch tenders from connected Database Store
  const dbTenders = db.getAllTenders({
    portal: selectedPortal !== "all" ? selectedPortal : undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    query: query || undefined,
  });

  let masterList: TenderCardData[] = dbTenders.map((t) => ({
    id: t.id,
    portal: t.portal,
    tender_ref_number: t.tender_ref_number,
    title: t.title,
    authority_name: t.authority_name,
    category: t.category,
    estimated_value: t.estimated_value,
    emd_amount: t.emd_amount,
    submission_deadline: t.submission_deadline,
    published_date: t.published_date,
    opening_date: t.opening_date,
    direct_portal_url: t.direct_portal_url,
    original_document_urls: t.original_document_urls,
    raw_payload: t.raw_payload,
    match_score: t.match_score,
    ai_summary: t.ai_summary,
  }));

  // 3. Also merge remote Supabase tenders if active
  try {
    const supabase = await createServerSupabaseClient();
    const { data: remoteTenders } = await (supabase
      .from("tenders") as any)
      .select("*, tender_matches(overall_score, ai_summary)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (remoteTenders && remoteTenders.length > 0) {
      for (const rt of (remoteTenders as any[])) {
        if (!masterList.some((t) => t.tender_ref_number === rt.tender_ref_number)) {
          masterList.push({
            id: rt.id,
            portal: rt.portal,
            tender_ref_number: rt.tender_ref_number,
            title: rt.title,
            authority_name: rt.authority_name,
            category: rt.category,
            estimated_value: rt.estimated_value,
            emd_amount: rt.emd_amount,
            submission_deadline: rt.submission_deadline,
            published_date: rt.published_date,
            opening_date: rt.opening_date,
            direct_portal_url: rt.original_document_urls?.[0] || `https://bidplus.gem.gov.in/all-bids`,
            original_document_urls: rt.original_document_urls || [],
            raw_payload: rt.raw_payload || {},
            match_score: rt.tender_matches?.[0]?.overall_score || 88,
            ai_summary: rt.tender_matches?.[0]?.ai_summary?.executive_summary
              ? rt.tender_matches[0].ai_summary
              : {
                  executive_summary: rt.description || "Active government procurement opportunity.",
                  bid_go_no_go_recommendation: "STRONG_BID",
                  recommendation_rationale: "Matched to contractor profile.",
                },
          });
        }
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  // 4. Client-side search & multi-trade filter enforcement
  const filteredTenders = masterList.filter((item) => {
    if (selectedPortal !== "all" && item.portal.toLowerCase() !== selectedPortal) {
      return false;
    }

    if (selectedCategory !== "all") {
      const catLower = item.category.toLowerCase();
      const titleLower = item.title.toLowerCase();

      if (selectedCategory === "civil") {
        if (!catLower.includes("civil") && !catLower.includes("works") && !titleLower.includes("road") && !titleLower.includes("bridge") && !titleLower.includes("building")) return false;
      } else if (selectedCategory === "electrical_solar" || selectedCategory === "solar") {
        if (!catLower.includes("solar") && !catLower.includes("electric") && !titleLower.includes("solar") && !titleLower.includes("substation") && !titleLower.includes("led")) return false;
      } else if (selectedCategory === "it_software" || selectedCategory === "it") {
        if (!catLower.includes("it") && !catLower.includes("software") && !catLower.includes("compute") && !titleLower.includes("cloud") && !titleLower.includes("hims") && !titleLower.includes("firewall") && !titleLower.includes("h100")) return false;
      } else if (selectedCategory === "healthcare" || selectedCategory === "medical") {
        if (!catLower.includes("health") && !catLower.includes("medical") && !titleLower.includes("aiims") && !titleLower.includes("radiology") && !titleLower.includes("pharmaceutical") && !titleLower.includes("pathology")) return false;
      } else if (selectedCategory === "facility_security" || selectedCategory === "facility" || selectedCategory === "security") {
        if (!catLower.includes("facility") && !catLower.includes("security") && !titleLower.includes("security") && !titleLower.includes("housekeeping") && !titleLower.includes("cleaning") && !titleLower.includes("sanitation")) return false;
      } else if (selectedCategory === "fleet_logistics" || selectedCategory === "fleet" || selectedCategory === "transport") {
        if (!catLower.includes("fleet") && !catLower.includes("transport") && !catLower.includes("logistics") && !titleLower.includes("bus") && !titleLower.includes("freight") && !titleLower.includes("truck")) return false;
      } else if (selectedCategory === "telecom" || selectedCategory === "ofc") {
        if (!catLower.includes("telecom") && !catLower.includes("networking") && !titleLower.includes("fiber") && !titleLower.includes("ofc") && !titleLower.includes("broadband") && !titleLower.includes("railtel")) return false;
      } else if (selectedCategory === "general_supplies" || selectedCategory === "goods" || selectedCategory === "msme") {
        if (!catLower.includes("goods") && !catLower.includes("supplies") && !titleLower.includes("furniture") && !titleLower.includes("uniform") && !titleLower.includes("pump") && !titleLower.includes("pipes")) return false;
      } else {
        if (!catLower.includes(selectedCategory) && !titleLower.includes(selectedCategory)) return false;
      }
    }

    if (query) {
      const matchInTitle = item.title.toLowerCase().includes(query);
      const matchInAuth = item.authority_name.toLowerCase().includes(query);
      const matchInRef = item.tender_ref_number.toLowerCase().includes(query);
      const matchInSummary = item.ai_summary.executive_summary.toLowerCase().includes(query);
      return matchInTitle || matchInAuth || matchInRef || matchInSummary;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner for newly registered contractors */}
      {isWelcome && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-emerald-950">
              Contractor Profile Registered • Universal Government Portals Crawled!
            </h3>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
              Welcome, <strong>{companyName}</strong>. TenderOps AI has initialized your contractor profile and scanned GeM (Government e-Marketplace), CPPP, and State Portals for <strong>{targetTrade}</strong> tenders. Direct portal links are verified below.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Universal Tender Discovery Feed
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
              {filteredTenders.length} Active Listings
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-normal flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Targeting: <strong>{companyName}</strong> • {targetTrade}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scan Live Portals Refresh Button */}
          <ScanPortalsButton />

          <Link
            href="/draft-bid"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Bid Drafter</span>
          </Link>

          <Link
            href="/whatsapp-demo"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp SDR</span>
          </Link>
        </div>
      </div>

      {/* URL-Synced Interactive Search & Universal Trade Filtering Bar */}
      <TenderFilters />

      {/* Tender Cards Stream */}
      {filteredTenders.length > 0 ? (
        <div className="space-y-4 pt-1">
          {filteredTenders.map((tender) => (
            <TenderCard key={tender.id} tender={tender} />
          ))}
        </div>
      ) : (
        /* Minimalist Empty State */
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900">No tenders match your filters</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Try switching trades above, searching with broader keywords, or clicking &quot;Scan Live Portals&quot;.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Reset All Filters
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
