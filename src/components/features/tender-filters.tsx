"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";

export function TenderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("query") || "";
  const currentPortal = searchParams.get("portal") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "score";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = currentQuery || currentPortal !== "all" || currentCategory !== "all";

  return (
    <div className="space-y-3">
      {/* Search Bar & Primary Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            defaultValue={currentQuery}
            placeholder="Search tenders by keyword, authority, or RFP clause..."
            onChange={(e) => updateParam("query", e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition"
          />
          {currentQuery && (
            <button
              onClick={() => updateParam("query", "")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Portal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Portals" },
            { id: "gem", label: "GeM" },
            { id: "cppp", label: "CPPP" },
            { id: "state_portal", label: "State Portals" },
          ].map((portal) => (
            <button
              key={portal.id}
              onClick={() => updateParam("portal", portal.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                currentPortal === portal.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {portal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Filters: Category & Clear Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter Category:
          </span>
          <select
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Sectors</option>
            <option value="it">IT & Cloud Compute</option>
            <option value="telecom">Telecom & Networks</option>
            <option value="smart_city">Smart Cities & Surveillance</option>
            <option value="software">Healthcare & Enterprise Software</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
