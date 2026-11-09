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
  "Metro Rail & Mass Transit",
  "Government Offices & Bhavans",
  "Railways & Station Redevelopment",
  "Civil Infrastructure & Works",
  "Airports & Aviation Infrastructure",
  "Water Supply & Smart Cities",
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

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [minTenderValue, setMinTenderValue] = useState<number>(500000);
  const [maxTenderValue, setMaxTenderValue] = useState<number | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([
    "Civil Infrastructure & Works",
  ]);
  const [customTrade, setCustomTrade] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>(["PAN_INDIA"]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([
    "MSME / Udyam Registered (GFR 173(i) Waiver)",
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanningStep, setScanningStep] = useState<string>("");

  const toggleTrade = (trade: string) => {
    if (selectedTrades.includes(trade)) {
      if (selectedTrades.length > 1) {
        setSelectedTrades(selectedTrades.filter((t) => t !== trade));
      }
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const toggleState = (st: string) => {
    if (st === "PAN_INDIA") {
      setSelectedStates(["PAN_INDIA"]);
      return;
    }
    const filtered = selectedStates.filter((s) => s !== "PAN_INDIA");
    if (filtered.includes(st)) {
      const remaining = filtered.filter((s) => s !== st);
      setSelectedStates(remaining.length === 0 ? ["PAN_INDIA"] : remaining);
    } else {
      setSelectedStates([...filtered, st]);
    }
  };

  const toggleCert = (cert: string) => {
    if (selectedCerts.includes(cert)) {
      setSelectedCerts(selectedCerts.filter((c) => c !== cert));
    } else {
      setSelectedCerts([...selectedCerts, cert]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    const allTrades = [...selectedTrades];
    if (customTrade.trim() && !allTrades.includes(customTrade.trim())) {
      allTrades.push(customTrade.trim());
    }

    if (allTrades.length === 0) {
      setErrorMessage("Please select at least one industry/trade to search tenders.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("email", email.trim());
    formData.append("password", password);
    formData.append("full_name", fullName.trim());
    formData.append("fullName", fullName.trim());
    formData.append("company_name", companyName.trim());
    formData.append("companyName", companyName.trim());
    formData.append("phone_number", phoneNumber.trim());
    formData.append("phoneNumber", phoneNumber.trim());
    formData.append("min_tender_value", String(minTenderValue));
    formData.append("minTenderValue", String(minTenderValue));
    if (maxTenderValue) {
      formData.append("max_tender_value", String(maxTenderValue));
      formData.append("maxTenderValue", String(maxTenderValue));
    }
    formData.append("trades", JSON.stringify(allTrades));
    formData.append("targetCategories", JSON.stringify(allTrades));
    formData.append("preferred_states", JSON.stringify(selectedStates));
    formData.append("preferredStates", JSON.stringify(selectedStates));
    formData.append("certifications", JSON.stringify(selectedCerts));

    startTransition(async () => {
      setScanningStep("1/2: Saving contractor profile & preferences...");
      try {
        const res = await registerContractorProfile(formData);

        if (res.error) {
          setErrorMessage(res.error);
          setScanningStep("");
          return;
        }

        setScanningStep("2/2: Opening your live Discovery Feed...");
        window.location.href = res.redirectUrl || "/tenders?welcome=true";
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
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white shadow-md">
          <ShieldCheck className="h-6 w-6 text-emerald-400 dark:text-white" />
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          TenderOps AI
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          by MCodes • India Procurement Engine & WhatsApp SDR
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Create your contractor profile below. Once submitted, TenderOps AI immediately queries live listings from GeM, CPPP, and State Portals matching your exact industry.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm transition-colors">
        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 text-xs font-semibold text-rose-800 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {isPending && scanningStep && (
          <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-5 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>{scanningStep}</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Live crawler scanning GeM (Bidplus), CPPP (eProcure), and State Portals for {selectedTrades[0] || "your industry"}...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Account Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                1. Account Credentials & Login
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. apex_bids"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Business Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@apexinfotech.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Account Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Contractor & Company Entity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                2. Contractor & Company Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Managing Director / Contractor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Company Legal Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Infotech Pvt Ltd"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                WhatsApp SDR Mobile (+91)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Receives automated daily WhatsApp SDR alerts for new tenders exceeding 80% relevance score.
              </span>
            </div>
          </div>

          {/* Section 3: Industry & Trade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                3. Industry & Bidding Trade (For Live Portal Search)
              </h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
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
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{trade}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Or Add Custom Trade / Specialty
              </label>
              <input
                type="text"
                value={customTrade}
                onChange={(e) => setCustomTrade(e.target.value)}
                placeholder="e.g. Drone Surveying, Hospital Medical Gas Pipeline, Solar Microgrids"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Budget Range & Locations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                4. Contract Value Bracket & Locations
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Minimum Tender Value (INR)
                </label>
                <input
                  type="number"
                  value={minTenderValue}
                  onChange={(e) => setMinTenderValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {formatINR(minTenderValue)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Maximum Tender Value (INR)
                </label>
                <input
                  type="number"
                  value={maxTenderValue || ""}
                  onChange={(e) =>
                    setMaxTenderValue(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Leave empty for unlimited cap"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {maxTenderValue ? formatINR(maxTenderValue) : "No Upper Limit"}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
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
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
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
                          ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
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

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
              Already created a contractor profile?{" "}
              <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Sign in to your account
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
