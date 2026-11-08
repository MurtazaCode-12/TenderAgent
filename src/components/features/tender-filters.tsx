"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react";
import { CONTRACTOR_TRADES } from "@/types";

export function TenderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("query") || "";
  const currentPortal = searchParams.get("portal") || "all";
  const currentCategory = searchParams.get("category") || "all";

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
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
      {/* Row 1: Search Bar & Segmented Portal Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            defaultValue={currentQuery}
            placeholder="Search tenders by authority (AIIMS, PWD, NHAI), ref ID, or scope..."
            onChange={(e) => updateParam("query", e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          {currentQuery && (
            <button
              onClick={() => updateParam("query", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Compact Segmented Portal Filter */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60 overflow-x-auto">
          {[
            { id: "all", label: "All Portals" },
            { id: "gem", label: "GeM" },
            { id: "cppp", label: "CPPP" },
            { id: "state_portal", label: "State Portals" },
          ].map((portal) => (
            <button
              key={portal.id}
              onClick={() => updateParam("portal", portal.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                currentPortal === portal.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {portal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Smooth Horizontal Trade Switcher */}
      <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Scrollable Trade Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin flex-1">
          <button
            type="button"
            onClick={() => updateParam("category", "all")}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
              currentCategory === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
            }`}
          >
            <span>🌐</span>
            <span>All Trades</span>
          </button>

          {CONTRACTOR_TRADES.map((trade) => {
            const isSelected = currentCategory.toLowerCase() === trade.id.toLowerCase();
            return (
              <button
                key={trade.id}
                type="button"
                onClick={() => updateParam("category", trade.id)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                }`}
                title={trade.description}
              >
                <span>{trade.icon}</span>
                <span>{trade.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Clear Filters Action */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 whitespace-nowrap flex items-center gap-1 shrink-0 transition"
          >
            <X className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
