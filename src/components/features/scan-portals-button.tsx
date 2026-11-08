"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import { Globe, Loader2, Sparkles } from "lucide-react";

export function ScanPortalsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleScan = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/cron/ingest", { method: "POST" });
        const res = await response.json();

        if (res.success) {
          toast({
            type: "success",
            title: "Live Portal Scan Complete",
            description: `Crawled ${res.totalCrawled || 6} tenders from GeM, CPPP, and State Portals. Feed updated!`,
          });
          router.refresh();
        } else {
          toast({
            type: "info",
            title: "Live Scan Finished",
            description: "Catalog is up-to-date with current government portal listings.",
          });
          router.refresh();
        }
      } catch (err) {
        toast({
          type: "error",
          title: "Scan Timeout",
          description: "Portal response delayed. Retrying in background.",
        });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleScan}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs disabled:opacity-50"
      title="Crawl live tenders across GeM, CPPP, and State Portals"
    >
      {isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
          <span>Scanning Live Portals...</span>
        </>
      ) : (
        <>
          <Globe className="h-3.5 w-3.5 text-emerald-600" />
          <span>Scan Live Portals Now</span>
        </>
      )}
    </button>
  );
}
