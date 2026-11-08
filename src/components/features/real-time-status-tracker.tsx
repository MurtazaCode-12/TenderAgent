"use client";

import React, { useState, useTransition } from "react";
import { formatINR } from "@/lib/utils";
import { syncPortalStatusAction } from "@/actions/applications";
import { useToast } from "@/components/ui/toast-context";
import type { DBBidApplication } from "@/lib/db/store";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Receipt,
  FileCheck2,
  AlertCircle,
  Loader2,
  Award,
} from "lucide-react";

interface RealTimeStatusTrackerProps {
  application: DBBidApplication;
  directPortalUrl?: string;
  onUpdated?: (updated: DBBidApplication) => void;
}

export function RealTimeStatusTracker({
  application: initialApp,
  directPortalUrl = "https://bidplus.gem.gov.in/all-bids",
  onUpdated,
}: RealTimeStatusTrackerProps) {
  const { toast } = useToast();
  const [app, setApp] = useState<DBBidApplication>(initialApp);
  const [isSyncing, startSync] = useTransition();

  const handleSyncStatus = () => {
    startSync(async () => {
      try {
        const res = await syncPortalStatusAction(app.id);
        if (res.success && res.application) {
          setApp(res.application);
          if (onUpdated) onUpdated(res.application);
          toast({
            type: "success",
            title: "Live Portal Sync Complete!",
            description: `Portal Status: ${res.application.status_label}`,
          });
        } else {
          toast({
            type: "error",
            title: "Sync Error",
            description: res.error || "Failed to sync with government portal.",
          });
        }
      } catch (err: any) {
        toast({
          type: "error",
          title: "Sync Error",
          description: err.message || "Network error syncing with portal.",
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-5 dark:border-slate-800 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Live Government Portal Evaluation Tracker
            </span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
            {app.tender_title}
          </h3>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Ref: {app.tender_ref_number}</span>
            <span>•</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Receipt: {app.portal_receipt_number}
            </span>
          </div>
        </div>

        {/* Sync Action */}
        <button
          type="button"
          onClick={handleSyncStatus}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50 shrink-0"
          title="Poll portal API for latest committee minutes and decryption records"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing Portal API..." : "Sync Latest Portal Status"}</span>
        </button>
      </div>

      {/* Progress Bar & Live Status Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Current Stage: <strong className="text-emerald-700 dark:text-emerald-400">{app.status_label}</strong></span>
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {app.progress_percent}% Evaluated
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
          <div
            className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${app.progress_percent}%` }}
          />
        </div>
      </div>

      {/* Real-Time Milestones Timeline */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Evaluation Milestones & Audit Log
        </h4>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {app.timeline_events.map((event, idx) => {
            const isCompleted = event.status === "completed";
            const isInProgress = event.status === "in_progress";

            return (
              <div key={event.id || idx} className="relative flex items-start gap-3 pl-1">
                {/* Node Icon */}
                <div
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isInProgress
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-slate-100 text-slate-400 border border-slate-300 dark:bg-slate-800 dark:border-slate-700"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                  ) : isInProgress ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[10px]">{idx + 1}</span>
                  )}
                </div>

                {/* Node Content */}
                <div className="flex-1 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className={`text-xs font-bold ${
                      isCompleted ? "text-slate-900 dark:text-white" : isInProgress ? "text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {event.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
          <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Real-time WhatsApp alerts active for <strong>{app.signatory_phone}</strong></span>
        </div>

        <a
          href={directPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-[11px]"
        >
          <span>View Live Portal Source</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
