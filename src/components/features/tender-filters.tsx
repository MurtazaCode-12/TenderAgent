"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal, Layers, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-4">
      {/* 1. Universal Multi-Trade Horizontal Selector Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>Select Contractor Trade:</span>
          </div>
          {currentCategory !== "all" && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Active Trade Filter
            </span>
          )}
        </div>

        {/* Scrollable Horizontal Trade Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {/* All Trades Option */}
          <button
            type="button"
            onClick={() => updateParam("category", "all")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              currentCategory === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            <span>🌐</span>
            <span>All Trades</span>
          </button>

          {/* Each Dedicated Trade */}
          {CONTRACTOR_TRADES.map((trade) => {
            const isSelected = currentCategory.toLowerCase() === trade.id.toLowerCase();
            return (
              <button
                key={trade.id}
                type="button"
                onClick={() => updateParam("category", trade.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                }`}
                title={trade.description}
              >
                <span>{trade.icon}</span>
                <span>{trade.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Keyword Search & Government Portal Filter Pills */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            defaultValue={currentQuery}
            placeholder="Search tenders by tender number, authority (AIIMS, PWD, NHAI), or keywords..."
            onChange={(e) => updateParam("query", e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {[
            { id: "all", label: "All Portals" },
            { id: "gem", label: "GeM Bidplus" },
            { id: "cppp", label: "CPPP eProcure" },
            { id: "state_portal", label: "State Portals" },
          ].map((portal) => (
            <button
              key={portal.id}
              onClick={() => updateParam("portal", portal.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                currentPortal === portal.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {portal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Status Summary & Clear Action */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span>Filtering active results</span>
            {isPending && <span className="text-emerald-600 font-medium animate-pulse">• Updating feed...</span>}
          </div>

          <button
            onClick={clearAllFilters}
            className="font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
          >
            <X className="h-3 w-3" /> Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
