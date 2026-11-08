"use client";

import React, { useState, useTransition } from "react";
import { saveICPAction } from "@/actions/icp";
import { useToast } from "@/components/ui/toast-context";
import { formatINR } from "@/lib/utils";
import {
  Sliders,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Check,
  Loader2,
  Building2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  IndianRupee,
  BadgeCheck,
  Radio,
} from "lucide-react";

export interface ICPSettingsData {
  title: string;
  target_categories: string[];
  min_tender_value: number;
  max_tender_value: number | null;
  preferred_states: string[];
  excluded_keywords: string[];
  required_certifications: string[];
  min_annual_turnover: number;
  max_emd_capacity: number | null;
  icp_summary: string;
  whatsapp_number?: string;
  min_match_score?: number;
}

const COMMON_TRADES = [
  "Civil Infrastructure & Works",
  "Electrical & Solar Power",
  "Information Technology & Software",
  "Healthcare & Medical Equipment",
  "Facility Management & Security",
  "Fleet, Transport & Logistics",
  "Telecommunications & Networking",
  "General Goods & MSME Supplies",
];

const COMMON_STATES = [
  "PAN_INDIA",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Gujarat",
  "Telangana",
  "West Bengal",
];

const COMMON_CERTS = [
  "MSME / Udyam (GFR 173(i) Waiver)",
  "Make in India Class-1 (>50% Local)",
  "PWD / CPWD Class 1-A License",
  "MNRE ALMM Solar Empanelment",
  "Class-1 Electrical CEA License",
  "CDSCO Form 20B/21B Wholesale License",
  "PSARA Security License",
  "AIS-140 GPS VLT Certified",
  "DoT IP-1 Infrastructure",
  "CMMI Level 3+",
  "ISO 9001 / ISO 27001",
  "DPIIT Startup India",
];

export function ICPSettingsForm({ initialData }: { initialData: ICPSettingsData }) {
  const [formData, setFormData] = useState<ICPSettingsData>(initialData);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleTradeToggle = (trade: string) => {
    setFormData((prev) => {
      const exists = prev.target_categories.includes(trade);
      return {
        ...prev,
        target_categories: exists
          ? prev.target_categories.filter((c) => c !== trade)
          : [...prev.target_categories, trade],
      };
    });
  };

  const handleStateToggle = (stateName: string) => {
    setFormData((prev) => {
      if (stateName === "PAN_INDIA") {
        return { ...prev, preferred_states: ["PAN_INDIA"] };
      }
      const cleaned = prev.preferred_states.filter((s) => s !== "PAN_INDIA");
      const exists = cleaned.includes(stateName);
      const nextStates = exists ? cleaned.filter((s) => s !== stateName) : [...cleaned, stateName];
      return {
        ...prev,
        preferred_states: nextStates.length === 0 ? ["PAN_INDIA"] : nextStates,
      };
    });
  };

  const handleCertToggle = (cert: string) => {
    setFormData((prev) => {
      const exists = prev.required_certifications.includes(cert);
      return {
        ...prev,
        required_certifications: exists
          ? prev.required_certifications.filter((c) => c !== cert)
          : [...prev.required_certifications, cert],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("target_categories", formData.target_categories.join(", "));
    data.append("min_tender_value", String(formData.min_tender_value || 0));
    data.append("max_tender_value", formData.max_tender_value ? String(formData.max_tender_value) : "");
    data.append("preferred_states", formData.preferred_states.join(", "));
    data.append("excluded_keywords", formData.excluded_keywords.join(", "));
    data.append("required_certifications", formData.required_certifications.join(", "));
    data.append("min_annual_turnover", String(formData.min_annual_turnover || 0));
    data.append("max_emd_capacity", formData.max_emd_capacity ? String(formData.max_emd_capacity) : "");
    data.append("icp_summary", formData.icp_summary);

    startTransition(async () => {
      try {
        const res = await saveICPAction(data);
        if (res.success) {
          toast({
            type: "success",
            title: "ICP Preferences Saved",
            description: "AI matching vectors and WhatsApp SDR filters updated successfully.",
          });
        } else {
          toast({
            type: "error",
            title: "Validation Error",
            description: res.error || "Please check your inputs.",
          });
        }
      } catch (err) {
        toast({
          type: "error",
          title: "Save Failed",
          description: "Could not save profile settings. Please try again.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Targeting & WhatsApp SDR Settings
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            Define your company trade, budget thresholds, and locations to guide AI tender recommendations.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving & Embedding...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Save & Compute Vectors</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: Trade & Sectors */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Briefcase className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">1. Target Trades & Industry Sectors</h2>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">
            Click to add or remove industry sectors from your tender scanner:
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_TRADES.map((trade) => {
              const selected = formData.target_categories.includes(trade);
              return (
                <button
                  key={trade}
                  type="button"
                  onClick={() => handleTradeToggle(trade)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {selected && <Check className="h-3 w-3 stroke-[3]" />}
                  <span>{trade}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Active Target Categories (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.target_categories.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  target_categories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="e.g. Cloud Infrastructure, Firewalls, Telecom..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Financial Thresholds */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <IndianRupee className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">2. Target Contract Value & Financial Capacity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Minimum Tender Value (INR)
            </label>
            <input
              type="number"
              value={formData.min_tender_value}
              onChange={(e) => setFormData({ ...formData, min_tender_value: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-medium text-emerald-700">
              {formatINR(formData.min_tender_value)}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Maximum Tender Value (INR)
            </label>
            <input
              type="number"
              value={formData.max_tender_value || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_tender_value: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="100000000 (Leave blank for no upper limit)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-medium text-emerald-700">
              {formData.max_tender_value ? formatINR(formData.max_tender_value) : "No Upper Cap"}
            </span>
          </div>
        </div>

        {/* Quick Value Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
          {[
            { label: "₹10L – ₹1 Cr", min: 1000000, max: 10000000 },
            { label: "₹50L – ₹5 Cr", min: 5000000, max: 50000000 },
            { label: "₹1 Cr – ₹20 Cr", min: 10000000, max: 200000000 },
            { label: "₹5 Cr – Unlimited", min: 50000000, max: null },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  min_tender_value: preset.min,
                  max_tender_value: preset.max,
                })
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Operating Geography & Certifications */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">3. Operating Geography</h2>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON_STATES.map((state) => {
              const selected = formData.preferred_states.includes(state);
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => handleStateToggle(state)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {selected && <Check className="h-3 w-3 stroke-[3]" />}
                  <span>{state}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">4. Certifications & MSME Status</h2>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Government tenders offer mandatory EMD exemptions and turnover relaxations for registered MSMEs & DPIIT startups.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON_CERTS.map((cert) => {
              const selected = formData.required_certifications.includes(cert);
              return (
                <button
                  key={cert}
                  type="button"
                  onClick={() => handleCertToggle(cert)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {selected && <Check className="h-3 w-3 stroke-[3]" />}
                  <span>{cert}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 4: WhatsApp SDR Alerts */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">5. WhatsApp SDR Real-Time Alerts</h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Meta Cloud API Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Contractor WhatsApp Mobile (+91)
            </label>
            <input
              type="text"
              value={formData.whatsapp_number || "+91 98765 43210"}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-400">
              Receives instant alerts with one-tap &ldquo;Save to Pipeline&rdquo; buttons.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Minimum AI Match Score Threshold
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[70, 80, 85, 90].map((score) => {
                const active = (formData.min_match_score || 80) === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setFormData({ ...formData, min_match_score: score })}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                      active
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {score}%+
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 block">
              Only dispatch alerts when composite match score meets this threshold.
            </span>
          </div>
        </div>
      </div>

      {/* Section 5: Core Competencies Semantic Embedding */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              6. AI Vector Semantic Profile (1536 Dimensions)
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            pgvector Semantic Match
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Describe past government project executions, OEM partnerships (e.g. Cisco, HP, Microsoft), key personnel, and past contract scopes. The AI uses this narrative to compute semantic cosine similarity against scraped tender RFPs.
        </p>

        <textarea
          rows={4}
          value={formData.icp_summary}
          onChange={(e) => setFormData({ ...formData, icp_summary: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          required
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving & Updating Vectors...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Save ICP & Update Matching Model</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
