"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerContractorProfile } from "@/actions/auth";
import { formatINR } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  Briefcase,
  IndianRupee,
  MapPin,
  BadgeCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  Search,
  Globe,
} from "lucide-react";

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
  "MSME / Udyam Registered (GFR 173(i) Waiver)",
  "Make in India Class-1 (>50% Local Content)",
  "PWD / CPWD Class 1-A License",
  "MNRE ALMM Empanelled (Solar PV)",
  "Class-1 Electrical Inspectorate License",
  "CDSCO Form 20B/21B Wholesale License",
  "PSARA Security Agency License",
  "AIS-140 GPS VLT Certified Fleet",
  "DoT IP-1 Infrastructure Registration",
  "CMMI Level 3+ / ISO 27001",
  "ISO 9001:2015",
  "DPIIT Startup India Recognized",
];

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanningStep, setScanningStep] = useState<string>("");

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [selectedTrades, setSelectedTrades] = useState<string[]>([
    "Information Technology & Software",
    "Cloud Infrastructure & Data Centers",
  ]);
  const [customTrade, setCustomTrade] = useState("");
  const [minTenderValue, setMinTenderValue] = useState<number>(5000000); // 50 Lakhs
  const [maxTenderValue, setMaxTenderValue] = useState<number | null>(100000000); // 10 Crores
  const [selectedStates, setSelectedStates] = useState<string[]>(["PAN_INDIA", "Delhi", "Maharashtra"]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([
    "MSME / Udyam Registered",
    "ISO 9001:2015",
  ]);
  const [summary, setSummary] = useState(
    "Enterprise IT system integrator providing cloud computing, networking firewalls, and digital software solutions to Central & State Government departments."
  );

  const toggleTrade = (trade: string) => {
    setSelectedTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
    );
  };

  const toggleState = (state: string) => {
    if (state === "PAN_INDIA") {
      setSelectedStates(["PAN_INDIA"]);
      return;
    }
    const filtered = selectedStates.filter((s) => s !== "PAN_INDIA");
    if (filtered.includes(state)) {
      const next = filtered.filter((s) => s !== state);
      setSelectedStates(next.length === 0 ? ["PAN_INDIA"] : next);
    } else {
      setSelectedStates([...filtered, state]);
    }
  };

  const toggleCert = (cert: string) => {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullName", fullName);
    formData.append("companyName", companyName);
    formData.append("phoneNumber", phoneNumber);

    const allTrades = [...selectedTrades];
    if (customTrade.trim() && !allTrades.includes(customTrade.trim())) {
      allTrades.push(customTrade.trim());
    }

    formData.append("targetCategories", allTrades.join(", "));
    formData.append("preferredStates", selectedStates.join(", "));
    formData.append("certifications", selectedCerts.join(", "));
    formData.append("minTenderValue", String(minTenderValue));
    formData.append("maxTenderValue", maxTenderValue ? String(maxTenderValue) : "");
    formData.append("summary", summary);

    setScanningStep("1/4: Storing contractor profile in connected database...");

    startTransition(async () => {
      try {
        setScanningStep("2/4: Connecting to GeM & CPPP government portals...");
        const res = await registerContractorProfile(formData);

        if (res.error) {
          setErrorMessage(res.error);
          setScanningStep("");
          return;
        }

        setScanningStep("3/4: Matching live listings against your industry profile...");
        setTimeout(() => {
          setScanningStep("4/4: Opening your live Discovery Feed...");
          router.push(res.redirectUrl || "/tenders?welcome=true");
          router.refresh();
        }, 800);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to create profile. Please try again.");
        setScanningStep("");
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          TenderOps AI
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          by MCodes • India Procurement Engine & WhatsApp SDR
        </p>
        <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
          Create your contractor profile below. Once submitted, TenderOps AI immediately queries live listings from GeM, CPPP, and State Portals matching your exact industry.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
            {errorMessage}
          </div>
        )}

        {isPending && scanningStep && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span>{scanningStep}</span>
            </div>
            <p className="text-xs text-emerald-700">
              Live crawler scanning GeM (Bidplus), CPPP (eProcure), and State Portals for {selectedTrades[0] || "your industry"}...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Account Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Account Credentials & Login
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. apex_bids"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Business Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@apexinfotech.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Account Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Contractor & Company Entity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Contractor & Company Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Managing Director / Contractor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Company Legal Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Infotech Pvt Ltd"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                WhatsApp SDR Mobile (+91)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400">
                Receives automated daily WhatsApp SDR alerts for new tenders exceeding 80% relevance score.
              </span>
            </div>
          </div>

          {/* Section 3: Industry & Trade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Briefcase className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Industry & Bidding Trade (For Live Portal Search)
              </h2>
            </div>

            <p className="text-xs text-slate-500">
              Select one or more sectors. Live crawlers will immediately filter GeM, CPPP, and State Portals for opportunities in these categories:
            </p>

            <div className="flex flex-wrap gap-2">
              {COMMON_TRADES.map((trade) => {
                const selected = selectedTrades.includes(trade);
                return (
                  <button
                    key={trade}
                    type="button"
                    onClick={() => toggleTrade(trade)}
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

            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Or Add Custom Trade / Specialty
              </label>
              <input
                type="text"
                value={customTrade}
                onChange={(e) => setCustomTrade(e.target.value)}
                placeholder="e.g. Drone Surveying, Hospital Medical Gas Pipeline, Solar Microgrids"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Budget Range & Locations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Contract Value Bracket & Locations
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Minimum Tender Value (INR)
                </label>
                <input
                  type="number"
                  value={minTenderValue}
                  onChange={(e) => setMinTenderValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-medium text-emerald-700">
                  {formatINR(minTenderValue)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Maximum Tender Value (INR)
                </label>
                <input
                  type="number"
                  value={maxTenderValue || ""}
                  onChange={(e) =>
                    setMaxTenderValue(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Leave empty for unlimited cap"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-medium text-emerald-700">
                  {maxTenderValue ? formatINR(maxTenderValue) : "No Upper Limit"}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Operating States
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_STATES.map((state) => {
                  const selected = selectedStates.includes(state);
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => toggleState(state)}
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

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Certifications (Unlocks Tender EMD & Turnover Exemptions)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CERTS.map((cert) => {
                  const selected = selectedCerts.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
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

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Connecting to Government Portals & Searching...</span>
                </>
              ) : (
                <>
                  <Globe className="h-5 w-5" />
                  <span>Save Profile & Search Live Government Tenders</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-500 pt-2">
              Already created a contractor profile?{" "}
              <Link href="/login" className="font-bold text-emerald-600 hover:underline">
                Sign in to your account
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
