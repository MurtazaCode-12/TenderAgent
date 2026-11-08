"use client";

import React, { useState, useTransition } from "react";
import { formatINR } from "@/lib/utils";
import { submitBidApplicationAction } from "@/actions/applications";
import { useToast } from "@/components/ui/toast-context";
import type { DBBidApplication } from "@/lib/db/store";
import {
  FileCheck2,
  X,
  ShieldCheck,
  CheckCircle2,
  IndianRupee,
  Clock,
  ArrowRight,
  Loader2,
  ExternalLink,
  Smartphone,
  Building2,
  Receipt,
  AlertTriangle,
} from "lucide-react";

interface TenderApplicationModalProps {
  tender: {
    id: string;
    tender_ref_number: string;
    title: string;
    authority_name: string;
    estimated_value: number | null;
    emd_amount: number | null;
    submission_deadline: string;
    direct_portal_url: string;
    category?: string;
  };
  contractorPhone?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (application: DBBidApplication) => void;
}

export function TenderApplicationModal({
  tender,
  contractorPhone = "+91 98201 44820",
  isOpen,
  onClose,
  onSubmitted,
}: TenderApplicationModalProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form State
  const defaultBid = tender.estimated_value ? Math.round(tender.estimated_value * 0.96) : 5000000;
  const [bidValue, setBidValue] = useState<number>(defaultBid);
  const [emdOption, setEmdOption] = useState<"exempted_msme" | "paid" | "bg_submitted">("exempted_msme");
  const [signatoryName, setSignatoryName] = useState("Director / Authorized Signatory");
  const [signatoryPhone, setSignatoryPhone] = useState(contractorPhone);
  const [complianceAccepted, setComplianceAccepted] = useState(true);

  // Result State
  const [submittedApp, setSubmittedApp] = useState<DBBidApplication | null>(null);

  if (!isOpen) return null;

  const estimated = tender.estimated_value || 0;
  const diffPercent = estimated > 0 ? (((bidValue - estimated) / estimated) * 100).toFixed(1) : "0";
  const isBelowEstimated = Number(diffPercent) <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complianceAccepted) {
      toast({
        type: "error",
        title: "Compliance Declaration Required",
        description: "Please accept the statutory non-blacklisting and GFR compliance declaration.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("tenderId", tender.id);
    formData.append("bidValue", String(bidValue));
    formData.append("emdStatus", emdOption);
    formData.append("signatoryName", signatoryName);
    formData.append("signatoryPhone", signatoryPhone);

    startTransition(async () => {
      try {
        const res = await submitBidApplicationAction(formData);
        if (res.success && res.application) {
          setSubmittedApp(res.application);
          toast({
            type: "success",
            title: "Bid Application Submitted!",
            description: `Official Receipt ${res.application.portal_receipt_number} issued. Live tracking started.`,
          });
          if (onSubmitted) onSubmitted(res.application);
        } else {
          toast({
            type: "error",
            title: "Submission Error",
            description: res.error || "Failed to submit bid.",
          });
        }
      } catch (err: any) {
        toast({
          type: "error",
          title: "Submission Error",
          description: err.message || "Failed to submit application.",
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {!submittedApp ? (
          /* Application Form View */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800">
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direct In-App Tender Application</span>
              </div>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white line-clamp-2">
                {tender.title}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {tender.authority_name}
                </span>
                <span>•</span>
                <span className="font-mono">{tender.tender_ref_number}</span>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Official Estimated Value
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatINR(tender.estimated_value)}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  EMD Required
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {tender.emd_amount ? formatINR(tender.emd_amount) : "Exempted"}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Submission Deadline
                </span>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {tender.submission_deadline}
                </span>
              </div>
            </div>

            {/* 1. Commercial Bid Value */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                1. Commercial Bid Price (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  required
                  value={bidValue}
                  onChange={(e) => setBidValue(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
                  placeholder="e.g. 95000000"
                />
              </div>

              {/* Competitive Indicator */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatINR(bidValue)}
                </span>
                <span
                  className={`font-semibold ${
                    isBelowEstimated
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isBelowEstimated
                    ? `${Math.abs(Number(diffPercent))}% below estimated cost (L1 competitive advantage)`
                    : `+${diffPercent}% above estimated cost`}
                </span>
              </div>
            </div>

            {/* 2. EMD Clause Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                2. Earnest Money Deposit (EMD) Compliance
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "exempted_msme",
                    label: "MSME / Udyam Waiver",
                    sub: "GFR 173(i) 100% Exemption",
                  },
                  {
                    id: "paid",
                    label: "Demand Draft / e-Payment",
                    sub: "Receipt attached",
                  },
                  {
                    id: "bg_submitted",
                    label: "Bank Guarantee (e-PBG)",
                    sub: "Schedule bank letter",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEmdOption(opt.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      emdOption === opt.id
                        ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Authorized Signatory & WhatsApp Tracking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Authorized Signatory Name
                </label>
                <input
                  type="text"
                  required
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  WhatsApp Number for Live Updates
                </label>
                <input
                  type="text"
                  required
                  value={signatoryPhone}
                  onChange={(e) => setSignatoryPhone(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Statutory Attestation Checkbox */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-800 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="attest"
                checked={complianceAccepted}
                onChange={(e) => setComplianceAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="attest" className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                I declare that our company satisfies all mandatory eligibility conditions, GFR Rule 144(xi) Land Border compliance, and has not been debarred/blacklisted by any Central/State Ministry.
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sealing & Encrypting Bid Packet...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Submit Official Bid Application</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Application Submitted Success View */
          <div className="py-4 text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 shadow-sm">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Bid Application Successfully Submitted!
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your encrypted bid packet has been vaulted. An official receipt has been issued and WhatsApp live notifications are active.
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-5 text-left space-y-3 dark:border-emerald-800/80 dark:bg-emerald-950/40">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Official Portal Acknowledgment
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">
                  {submittedApp.portal_receipt_number}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Application ID</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{submittedApp.id}</span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Commercial Offer</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatINR(submittedApp.bid_value)}</span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Current Stage</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{submittedApp.status_label}</span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Live WhatsApp Alert</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{submittedApp.signatory_phone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                Track Live Updates in Pipeline
              </button>

              <a
                href={tender.direct_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <span>View Official Portal Page</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
