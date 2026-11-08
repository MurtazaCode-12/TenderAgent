"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { dispatchTenderToWhatsAppAction } from "@/actions/whatsapp";
import { saveToPipelineAction } from "@/actions/tenders";
import { useToast } from "@/components/ui/toast-context";
import {
  Smartphone,
  Send,
  Sparkles,
  ExternalLink,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Video,
  MoreVertical,
  BookmarkPlus,
  Loader2,
  Check,
} from "lucide-react";
import { CONTRACTOR_TRADES } from "@/types";

interface MessageItem {
  id: string;
  sender: "bot" | "user";
  text?: string;
  isInteractiveCard?: boolean;
  tenderData?: {
    trade: string;
    tenderRef: string;
    title: string;
    authority: string;
    value: string;
    emd: string;
    deadline: string;
    directUrl: string;
    qualPill: string;
  };
  timestamp: string;
}

const TRADE_ALERT_TEMPLATES: Record<string, {
  tenderRef: string;
  title: string;
  authority: string;
  value: string;
  emd: string;
  deadline: string;
  directUrl: string;
  qualPill: string;
  summary: string;
}> = {
  civil: {
    tenderRef: "PWD/MH/2026/ROAD/9182",
    title: "Widening, Strengthening & Bituminous Overlay of State Highway 42 with Concrete Bridges",
    authority: "Public Works Department (PWD), Maharashtra",
    value: "₹12.50 Cr",
    emd: "₹25.00 Lakhs (MSME Exempted)",
    deadline: "In 20 Days",
    directUrl: "https://mahatenders.gov.in/nicgep/app?page=FrontEndTenderDetailsExternal&tenderId=PWD_MH_ROAD_9182",
    qualPill: "PWD Class 1(A) & Hot-Mix Plant",
    summary: "High-value road widening project across 42 km. Requires asphalt batch mix plant within 50 km and Class 1(A) civil empanelment.",
  },
  electrical_solar: {
    tenderRef: "GEM/2026/B/8982310",
    title: "5MW Grid-Connected Rooftop Solar PV Plants with ALMM Tier-1 Modules",
    authority: "Solar Energy Corporation of India Ltd (SECI)",
    value: "₹19.50 Cr",
    emd: "₹39.00 Lakhs (MSME Exempted)",
    deadline: "In 25 Days",
    directUrl: "https://bidplus.gem.gov.in/showbidDocument/8982310",
    qualPill: "MNRE ALMM & Class-1 Electrical CEA",
    summary: "25-year O&M rooftop solar installation across 35 government offices. Tier-1 ALMM panels mandatory.",
  },
  it_software: {
    tenderRef: "CPPP/2026/MOHFW/HIMS/49102",
    title: "Cloud Hospital Information Management System (HIMS) across 22 Central AIIMS",
    authority: "Ministry of Health and Family Welfare (MoHFW)",
    value: "₹9.50 Cr",
    emd: "₹19.00 Lakhs (MSME Exempted)",
    deadline: "In 18 Days",
    directUrl: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=CPPP_2026_MOHFW_49102",
    qualPill: "OEM MAF & CMMI Level 3+",
    summary: "Turnkey software engineering, EHR cloud architecture, ABDM compliance, and 5-year operations.",
  },
  healthcare: {
    tenderRef: "CPPP/2026/AIIMS/MEDEQ/39201",
    title: "High-Resolution Digital Radiology, MRI Telemetry & ICU Monitoring Units",
    authority: "AIIMS New Delhi",
    value: "₹8.40 Cr",
    emd: "₹16.80 Lakhs (MSME Exempted)",
    deadline: "In 15 Days",
    directUrl: "https://eprocure.gov.in/eprocure/app?page=FrontEndTenderDetailsExternal&service=page&tnid=AIIMS_MEDEQ_39201",
    qualPill: "CDSCO Form 20B/21B & US FDA/CE",
    summary: "Supply and 5-year maintenance of digital imaging and telemetry monitors with NABL calibration.",
  },
  facility_security: {
    tenderRef: "GEM/2026/B/8966320",
    title: "24x7 Armed & Unarmed Security Guard Services across 14 PSU Campuses",
    authority: "Indian Oil Corporation Limited (IOCL) Refineries",
    value: "₹5.40 Cr",
    emd: "₹10.80 Lakhs (MSME Exempted)",
    deadline: "In 13 Days",
    directUrl: "https://bidplus.gem.gov.in/showbidDocument/8966320",
    qualPill: "PSARA License & Central Min. Wages",
    summary: "280+ certified personnel deployment with biometric muster roll and perimeter drone patrols.",
  },
  fleet_logistics: {
    tenderRef: "GEM/2026/B/8977410",
    title: "Wet-Lease Contracting for 250 Electric Air-Conditioned City Transit Buses",
    authority: "State Road Transport Undertaking (SRTU)",
    value: "₹38.00 Cr",
    emd: "₹76.00 Lakhs (MSME Exempted)",
    deadline: "In 30 Days",
    directUrl: "https://bidplus.gem.gov.in/showbidDocument/8977410",
    qualPill: "AIS-140 GPS & Commercial Fleet Fitness",
    summary: "10-year Gross Cost Contract (GCC) wet-lease with guaranteed minimum daily run and fast-charging depot setup.",
  },
  telecom: {
    tenderRef: "GEM/2026/B/8991050",
    title: "BharatNet Phase-III High-Speed Rural GPON Fiber Distribution Network",
    authority: "Bharat Broadband Network Limited (BBNL) / BSNL",
    value: "₹28.50 Cr",
    emd: "₹57.00 Lakhs (MSME Exempted)",
    deadline: "In 26 Days",
    directUrl: "https://bidplus.gem.gov.in/showbidDocument/8991050",
    qualPill: "DoT IP-1 & Trenchless HDD Rig Schedule",
    summary: "Optical fiber rollout covering 420 village clusters with solar-powered OLTs and Wi-Fi access nodes.",
  },
  general_supplies: {
    tenderRef: "GEM/2026/B/8933210",
    title: "Bulk Supply of Ergonomic Dual-Desk Student Furniture & Steel Almirahs",
    authority: "Kendriya Vidyalaya Sangathan (KVS)",
    value: "₹2.90 Cr",
    emd: "₹5.80 Lakhs (MSME Exempted)",
    deadline: "In 12 Days",
    directUrl: "https://bidplus.gem.gov.in/showbidDocument/8933210",
    qualPill: "Make In India Class-1 (>50%) & BIFMA",
    summary: "Supply of 15,000 dual-desk student benches across 45 schools. 100% EMD waiver for Udyam entities.",
  },
};

export function WhatsAppSimulator({ contractorPhone }: { contractorPhone: string }) {
  const { toast } = useToast();
  const [selectedTrade, setSelectedTrade] = useState<string>("civil");
  const [inputText, setInputText] = useState("");
  const [targetPhone, setTargetPhone] = useState(contractorPhone);
  const [isDispatching, startDispatch] = useTransition();

  const initialAlert = TRADE_ALERT_TEMPLATES[selectedTrade] || TRADE_ALERT_TEMPLATES.civil;

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-1",
      sender: "bot",
      isInteractiveCard: true,
      tenderData: {
        trade: selectedTrade,
        tenderRef: initialAlert.tenderRef,
        title: initialAlert.title,
        authority: initialAlert.authority,
        value: initialAlert.value,
        emd: initialAlert.emd,
        deadline: initialAlert.deadline,
        directUrl: initialAlert.directUrl,
        qualPill: initialAlert.qualPill,
      },
      timestamp: "10:42 AM",
    },
  ]);

  const switchTrade = (tradeId: string) => {
    setSelectedTrade(tradeId);
    const alert = TRADE_ALERT_TEMPLATES[tradeId] || TRADE_ALERT_TEMPLATES.civil;
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "bot",
        isInteractiveCard: true,
        tenderData: {
          trade: tradeId,
          tenderRef: alert.tenderRef,
          title: alert.title,
          authority: alert.authority,
          value: alert.value,
          emd: alert.emd,
          deadline: alert.deadline,
          directUrl: alert.directUrl,
          qualPill: alert.qualPill,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleActionClick = (action: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const currentAlert = TRADE_ALERT_TEMPLATES[selectedTrade];

    if (action === "save_pipeline") {
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          sender: "user",
          text: `📥 Save ${currentAlert.tenderRef} to Pipeline`,
          timestamp: now,
        },
        {
          id: `b-${Date.now() + 1}`,
          sender: "bot",
          text: `✅ **SAVED TO YOUR PIPELINE!**\n\n${currentAlert.tenderRef} is now recorded in your active bidding pipeline under *"Under Review"*.\n\nAll teammates can now view the specifications, calculate BOQ margins, or trigger a 1-click bid draft.`,
          timestamp: now,
        },
      ]);
      toast({
        type: "success",
        title: "Saved to Pipeline",
        description: `${currentAlert.tenderRef} is now in your active bidding pipeline.`,
      });
    } else if (action === "msme_exemption") {
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          sender: "user",
          text: `Check MSME EMD Exemption for ${currentAlert.tenderRef}`,
          timestamp: now,
        },
        {
          id: `b-${Date.now() + 1}`,
          sender: "bot",
          text: `✅ **100% EMD EXEMPTION CONFIRMED (Rule 173(i) GFR 2017)**\n\nUnder General Financial Rules 2017 and Ministry of MSME Public Procurement Policy 2012, your enterprise is **100% exempt from the ${currentAlert.emd} deposit**.\n\n📄 **Required Document:** Submit your Udyam Registration Certificate along with our 1-click **EMD Exemption Affidavit** in your technical envelope.\n\nWould you like me to draft this affidavit for you right now?`,
          timestamp: now,
        },
      ]);
    } else if (action === "eligibility") {
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          sender: "user",
          text: `Check my technical eligibility for this tender`,
          timestamp: now,
        },
        {
          id: `b-${Date.now() + 1}`,
          sender: "bot",
          text: `📊 **AI TECHNICAL ELIGIBILITY AUDIT: 94% MATCH**\n\n• **Mandatory Requirement:** ${currentAlert.qualPill}\n• **Turnover Criterion:** Min ₹${currentAlert.value.includes("Cr") ? (parseFloat(currentAlert.value.replace(/[^0-9.]/g, "")) * 0.4).toFixed(1) + " Cr" : "50 Lakhs"} average past 3 years\n• **Local Content Preference:** Class-1 MII (>50% domestic value addition applicable)\n• **Disqualification Risk:** LOW. No proprietary OEM lock-in clauses detected.`,
          timestamp: now,
        },
      ]);
    }
  };

  const handleDispatchRealWhatsApp = () => {
    startDispatch(async () => {
      try {
        const dummyTenderId = "00000000-0000-0000-0000-000000000010";
        const res = await dispatchTenderToWhatsAppAction(dummyTenderId, targetPhone);
        if (res.success) {
          toast({
            type: "success",
            title: "WhatsApp SDR Message Dispatched!",
            description: `Sent interactive tender alert to ${targetPhone}. Check your WhatsApp messages.`,
          });
        } else {
          toast({
            type: "info",
            title: "WhatsApp Sandbox Mode",
            description: "Message logged to database store. Configure META API credentials in .env.local to receive live SMS/WhatsApp on your handset.",
          });
        }
      } catch (err: any) {
        toast({
          type: "error",
          title: "WhatsApp Dispatch Error",
          description: err.message || "Failed to contact Meta WhatsApp API.",
        });
      }
    });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let botReply = `Thank you for your query. Regarding "${userText}": Under official GeM & CPPP guidelines, all mandatory clauses require verified documentary evidence. I have flagged this to your compliance dashboard.`;

    const lower = userText.toLowerCase();
    if (lower.includes("emd") || lower.includes("fee") || lower.includes("msme")) {
      botReply = `💡 **EMD Fee Status:** As a registered Udyam MSME, you do NOT need to pay any Earnest Money Deposit under Rule 173(i) of GFR 2017. Simply attach our pre-filled exemption affidavit.`;
    } else if (lower.includes("penalty") || lower.includes("delay") || lower.includes("ld")) {
      botReply = `⚠️ **Liquidated Damages (LD) Clause:** The standard penalty is 0.5% of contract value per week of delay, capped at a maximum of 10%. Extensions are granted for genuine Force Majeure events approved by the Superintending Engineer.`;
    } else if (lower.includes("machinery") || lower.includes("plant") || lower.includes("equipment")) {
      botReply = `🚜 **Equipment Qualification:** For ${TRADE_ALERT_TEMPLATES[selectedTrade].tenderRef}, you must declare: ${TRADE_ALERT_TEMPLATES[selectedTrade].qualPill}. Leased or owned plant certificates are accepted if verified by an authorized notary.`;
    } else if (lower.includes("make in india") || lower.includes("mii") || lower.includes("local")) {
      botReply = `🇮🇳 **Make in India Status:** This is a Class-1 Local Supplier tender (>50% local value addition). Bidders providing local content declarations receive purchase preference over foreign products.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: "user",
        text: userText,
        timestamp: now,
      },
      {
        id: `b-${Date.now() + 1}`,
        sender: "bot",
        text: botReply,
        timestamp: now,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Live Phone Dispatch Test */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive WhatsApp SDR Mobile Simulator & Live Dispatch
              </h2>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Experience how TenderOps AI alerts contractors on WhatsApp in real-time, provides 1-tap eligibility audits, MSME EMD waivers, and bid application receipts directly on mobile.
              </p>
            </div>
          </div>

          {/* Real Phone Number Test Strip */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 dark:bg-slate-800/80 dark:border-slate-700">
            <input
              type="text"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="+91 98201 44820"
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white w-36"
            />
            <button
              type="button"
              onClick={handleDispatchRealWhatsApp}
              disabled={isDispatching}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isDispatching ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              <span>Send Live Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trade Selector Switcher */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 px-1">
          Switch Contractor Trade to Test Alerts:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CONTRACTOR_TRADES.map((trade) => (
            <button
              key={trade.id}
              onClick={() => switchTrade(trade.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedTrade === trade.id
                  ? "bg-slate-900 text-white shadow-xs dark:bg-emerald-600 dark:text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <span>{trade.icon}</span>
              <span>{trade.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Smartphone Mockup */}
      <div className="flex justify-center py-2">
        <div className="w-full max-w-md rounded-[40px] border-8 border-slate-800 bg-slate-900 p-3 shadow-2xl overflow-hidden">
          {/* Phone Speaker & Camera Notch */}
          <div className="flex justify-center pb-2">
            <div className="h-4 w-32 rounded-full bg-slate-800 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-900 mr-2" />
              <div className="h-1.5 w-10 rounded-full bg-slate-700" />
            </div>
          </div>

          {/* WhatsApp Screen Body */}
          <div className="rounded-[28px] overflow-hidden bg-[#e5ddd5] flex flex-col h-[640px] border border-slate-300">
            {/* WhatsApp App Header */}
            <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>TenderOps AI SDR</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <div className="text-[10px] text-emerald-200">Official GovProcure Bot • Online</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-emerald-100">
                <PhoneCall className="h-4 w-4 cursor-pointer hover:text-white" />
                <Video className="h-4 w-4 cursor-pointer hover:text-white" />
                <MoreVertical className="h-4 w-4 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* WhatsApp Chat Message History */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans">
              {/* Date Header */}
              <div className="flex justify-center">
                <span className="bg-white/80 backdrop-blur-xs text-[10px] font-semibold text-slate-600 px-2.5 py-0.5 rounded-md shadow-2xs">
                  TODAY
                </span>
              </div>

              {messages.map((msg) => {
                const isUser = msg.sender === "user";

                if (msg.isInteractiveCard && msg.tenderData) {
                  const t = msg.tenderData;
                  return (
                    <div key={msg.id} className="max-w-[92%] rounded-2xl bg-white p-3.5 shadow-sm space-y-2 border border-slate-200/60 text-slate-900">
                      {/* Alert Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          🎯 95% Match • New Tender Alert
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>

                      {/* Title & Ref */}
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">{t.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{t.authority}</div>
                        <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">Ref: {t.tenderRef}</div>
                      </div>

                      {/* Financials & Qualification Grid */}
                      <div className="rounded-xl bg-slate-50 p-2 text-[11px] grid grid-cols-2 gap-1 border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Estimated Value</span>
                          <strong className="text-slate-900">{t.value}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Closing In</span>
                          <strong className="text-rose-600">{t.deadline}</strong>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200/60 mt-1">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">EMD Deposit</span>
                          <span className="text-emerald-700 font-semibold">{t.emd}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Mandatory Qualification</span>
                          <span className="text-slate-800 font-medium">{t.qualPill}</span>
                        </div>
                      </div>

                      {/* Interactive WhatsApp Quick Action Buttons */}
                      <div className="pt-1 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleActionClick("save_pipeline")}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-900 hover:bg-slate-800 py-1.5 text-xs font-bold text-white transition shadow-2xs"
                        >
                          <BookmarkPlus className="h-3 w-3" />
                          <span>📥 Save to Pipeline</span>
                        </button>

                        <a
                          href={t.directUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 py-1.5 text-xs font-bold text-blue-700 transition"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>📑 View Official Portal RFP</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleActionClick("msme_exemption")}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 py-1.5 text-xs font-bold text-emerald-800 transition"
                        >
                          <span>⚖️ Check MSME Exemption</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActionClick("eligibility")}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 py-1.5 text-xs font-semibold text-slate-800 transition"
                        >
                          <span>⚡ Check Eligibility</span>
                        </button>

                        <Link
                          href={`/draft-bid?ref=${encodeURIComponent(t.tenderRef)}&title=${encodeURIComponent(t.title)}`}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-1.5 text-xs font-bold text-white transition shadow-2xs"
                        >
                          <FileText className="h-3 w-3" />
                          <span>📝 Draft Bid Package</span>
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none"
                          : "bg-white text-slate-900 rounded-tl-none border border-slate-200/60"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-[9px] text-right text-slate-400 mt-1 font-mono">
                        {msg.timestamp} {isUser && "✓✓"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Query Pills */}
            <div className="bg-white/80 backdrop-blur-xs px-2 py-1.5 border-t border-slate-200 overflow-x-auto flex gap-1.5">
              {[
                "Is EMD exempt?",
                "What machinery required?",
                "Liquidated damages penalty?",
                "Make in India local %?",
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => {
                    setInputText(query);
                  }}
                  className="rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 whitespace-nowrap transition"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your tender or compliance query..."
                className="flex-1 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="h-8 w-8 rounded-full bg-[#075e54] text-white flex items-center justify-center hover:bg-emerald-700 transition shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
