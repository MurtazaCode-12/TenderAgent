"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";
import {
  FileText,
  Copy,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Sparkles,
  Layers,
  Award,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { CONTRACTOR_TRADES } from "@/types";

interface BidDrafterProps {
  initialTenderId?: string;
  initialRef?: string;
  initialTitle?: string;
  initialCategory?: string;
  companyName: string;
  directorName: string;
  tenders: Array<{
    id: string;
    portal: string;
    tender_ref_number: string;
    title: string;
    category: string;
    authority_name: string;
    estimated_value: number | null;
    emd_amount: number | null;
    direct_portal_url: string;
  }>;
}

type DocumentType =
  | "msme_emd_exemption"
  | "make_in_india_mii"
  | "non_blacklisting"
  | "trade_technical_schedule";

export function BidPackageGenerator({
  initialTenderId,
  initialRef,
  initialTitle,
  initialCategory,
  companyName,
  directorName,
  tenders,
}: BidDrafterProps) {
  const { toast } = useToast();

  // Find initial selected tender
  const defaultTender =
    tenders.find((t) => t.id === initialTenderId || t.tender_ref_number === initialRef) ||
    tenders[0] || {
      id: "custom",
      portal: "gem",
      tender_ref_number: initialRef || "GEM/2026/B/8941203",
      title: initialTitle || "Active Government Procurement Tender",
      category: initialCategory || "Information Technology & Software",
      authority_name: "Government Procuring Authority",
      estimated_value: 50000000,
      emd_amount: 1000000,
      direct_portal_url: "https://bidplus.gem.gov.in",
    };

  const [selectedTenderId, setSelectedTenderId] = useState<string>(defaultTender.id);
  const [activeDocType, setActiveDocType] = useState<DocumentType>("msme_emd_exemption");

  // Editable form fields for the document
  const currentTender = tenders.find((t) => t.id === selectedTenderId) || defaultTender;
  const [contractorCompany, setContractorCompany] = useState(companyName || "Apex Infotech Pvt Ltd");
  const [contractorSignatory, setContractorSignatory] = useState(directorName || "Rahul Sharma");
  const [signatoryDesignation, setSignatoryDesignation] = useState("Managing Director / Authorized Signatory");
  const [udyamRegNo, setUdyamRegNo] = useState("UDYAM-DL-01-0089241");
  const [localContentPercent, setLocalContentPercent] = useState("78%");
  const [manufacturingLocation, setManufacturingLocation] = useState("Plot 42, Okhla Industrial Area Phase-III, New Delhi 110020");
  const [docDate, setDocDate] = useState(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }));
  const [docPlace, setDocPlace] = useState("New Delhi");

  // Determine trade helper
  const detectTrade = () => {
    const cat = currentTender.category.toLowerCase();
    const title = currentTender.title.toLowerCase();
    if (cat.includes("civil") || title.includes("road") || title.includes("bridge")) return "civil";
    if (cat.includes("solar") || cat.includes("electric") || title.includes("solar")) return "electrical_solar";
    if (cat.includes("health") || cat.includes("medical") || title.includes("aiims")) return "healthcare";
    if (cat.includes("facility") || cat.includes("security") || title.includes("security")) return "facility_security";
    if (cat.includes("fleet") || cat.includes("transport") || cat.includes("logistics")) return "fleet_logistics";
    if (cat.includes("telecom") || title.includes("fiber") || title.includes("ofc")) return "telecom";
    if (cat.includes("goods") || cat.includes("supplies") || title.includes("furniture")) return "general_supplies";
    return "it_software";
  };

  const activeTrade = detectTrade();
  const tradeInfo = CONTRACTOR_TRADES.find((t) => t.id === activeTrade) || CONTRACTOR_TRADES[2];

  // Generate document text dynamically based on selection
  const generateDocumentContent = (): string => {
    const tenderRef = currentTender.tender_ref_number;
    const tenderTitle = currentTender.title;
    const authority = currentTender.authority_name;
    const emdVal = currentTender.emd_amount ? formatINR(currentTender.emd_amount) : "Applicable EMD";

    if (activeDocType === "msme_emd_exemption") {
      return `ANNEXURE - EMD & TENDER FEE EXEMPTION AFFIDAVIT
(On Contractor Company Official Letterhead / Non-Judicial Stamp Paper)

To,
The Tendering Authority / Competent Officer,
${authority}

SUBJECT: Claim for 100% Exemption from Payment of Earnest Money Deposit (EMD) and Tender Document Cost under Rule 173(i) of General Financial Rules (GFR), 2017 and Public Procurement Policy for Micro and Small Enterprises (MSEs) Order, 2012.

Tender Reference No: ${tenderRef}
Name of Work / Procurement: "${tenderTitle}"
Estimated EMD Value: ${emdVal}

Respected Sir/Madam,

1. I, ${contractorSignatory}, in my capacity as ${signatoryDesignation} of M/s ${contractorCompany}, do hereby solemnly affirm and state as under:

2. That M/s ${contractorCompany} is a duly registered Micro / Small Enterprise under the Ministry of Micro, Small & Medium Enterprises (MSME), Government of India, bearing Udyam Registration Number: ${udyamRegNo}.

3. That our enterprise is actively registered for the relevant National Industry Classification (NIC) codes pertaining to the scope of work and goods/services requested under the subject tender.

4. In terms of Rule 173(i) of the General Financial Rules (GFR) 2017 and Government of India Public Procurement Policy for MSEs Order 2012 (notified by Ministry of MSME), Micro and Small Enterprises are entitled to:
   a) 100% Waiver and Exemption from deposit of Earnest Money Deposit (EMD / Bid Security).
   b) Free issue of Tender Documents and waiver of tender processing fees.

5. We hereby submit our valid Udyam Registration Certificate along with our technical bid documents in support of our exemption claim.

6. We further declare that in the event we withdraw or modify our bid during the period of bid validity, or fail to sign the contract agreement, we shall be liable for debarment as per GFR rules.

VERIFICATION:
Verified at ${docPlace} on this ${docDate} that the contents of the above affidavit are true and correct to the best of my knowledge and belief. No material facts have been concealed.

For and on behalf of M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory}
Designation: ${signatoryDesignation}
Company Seal & Stamp: M/s ${contractorCompany}
Date: ${docDate} | Place: ${docPlace}`;
    }

    if (activeDocType === "make_in_india_mii") {
      return `ANNEXURE - MAKE IN INDIA (MII) CLASS-1 LOCAL CONTENT SELF-DECLARATION
(In accordance with DPIIT Public Procurement Order No. P-45021/2/2017-PP (BE-II) and GeM General Terms)

To,
The Competent Procurement Officer,
${authority}

SUBJECT: Self-Declaration Certificate regarding Local Content (>50%) for Class-1 Local Supplier Preference.

Tender Reference No: ${tenderRef}
Tender Title: "${tenderTitle}"

Dear Sir/Madam,

We, M/s ${contractorCompany}, having registered office and manufacturing premises at:
${manufacturingLocation}

hereby solemnly certify and declare as follows:

1. We are a Class-I Local Supplier with local value addition exceeding 50% as defined under Public Procurement (Preference to Make in India) Order 2017 dated 16-09-2020 issued by DPIIT, Ministry of Commerce and Industry.

2. The percentage of Local Content in the goods / works / turnkey integration proposed to be supplied against Tender No. ${tenderRef} is ${localContentPercent}.

3. The details of the location(s) where the local value addition is made are as under:
   Premises: ${manufacturingLocation}
   Facility Type: State-of-the-art integration, fabrication, testing, and assembly hub.

4. We further certify that we comply with the minimum local content requirement prescribed for Class-1 suppliers and have not been declared ineligible or debarred by any procuring authority.

5. We understand that false declarations will be in breach of the Code of Integrity under Rule 175(1)(i)(h) of the GFR-2017 for which a bidder or its successors can be debarred for up to two years.

For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory}
Designation: ${signatoryDesignation}
Udyam Reg. No: ${udyamRegNo}
Official Seal: M/s ${contractorCompany}
Date: ${docDate} | Place: ${docPlace}`;
    }

    if (activeDocType === "non_blacklisting") {
      return `ANNEXURE - NON-BLACKLISTING & DEBARMENT UNDERTAKING
(To be typed on Company Letterhead or Non-Judicial Stamp Paper of ₹100 value)

UNDERTAKING REGARDING NON-DEBARMENT / NON-BLACKLISTING

I, the undersigned, ${contractorSignatory}, ${signatoryDesignation} of M/s ${contractorCompany}, do hereby give this solemn undertaking that:

1. M/s ${contractorCompany}, its directors, partners, or associates have NOT been blacklisted, debarred, or suspended by:
   a) Any Ministry, Department, or Autonomous Body of the Government of India.
   b) Any State Government Department or Union Territory Administration.
   c) Any Central or State Public Sector Undertaking (PSU / CPSE).
   d) Government e-Marketplace (GeM) or Central Public Procurement Portal (CPPP).

2. There is no vigilance, anti-corruption, or CBI inquiry pending or initiated against M/s ${contractorCompany} or its key managerial personnel as on date.

3. We have not committed any breach of contract or default in contract execution resulting in termination or forfeiture of Performance Security / Bank Guarantee across any public sector agency in the last 3 financial years.

4. We further undertake that if this statement is found false or misleading at any stage of evaluation or contract execution, the authority shall have full right to cancel the bid, forfeit bid security, and take punitive action under Indian law.

Tender Reference: ${tenderRef}
Tender Subject: ${tenderTitle}

Deponent:


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory}
Designation: ${signatoryDesignation}
For M/s ${contractorCompany}
Date: ${docDate} | Place: ${docPlace}`;
    }

    // Trade-Specific Technical Bid Annexure
    if (activeTrade === "civil") {
      return `ANNEXURE - CIVIL INFRASTRUCTURE TECHNICAL QUALIFICATION & MACHINERY SCHEDULE

To,
The Executive Engineer / Tender Inviting Authority,
${authority}

SUBJECT: Technical Compliance Schedule of Equipment, Hot-Mix Plant Ownership & PWD Class 1 Registration.
Tender Reference No: ${tenderRef}
Project: "${tenderTitle}"

Sir,

In compliance with the qualification criteria of the subject tender, M/s ${contractorCompany} submits the following technical confirmations:

1. CONTRACTOR REGISTRATION STATUS:
   - Valid PWD / CPWD Class: Class 1(A) Super Civil Contractor
   - Registration Validity: Active through 31st March 2028
   - Solvency Certificate Value: ₹5.00 Crores (Attached from Nationalized Bank)

2. CORE MACHINERY & PLANT DEPLOYMENT SCHEDULE (OWNED / LEASED):
   a) Asphalt Batch Mix Plant (100-120 TPH): Installed within 38 km of project site (Certified GPS coordinates provided).
   b) Sensor Paver Finisher (Hydraulic): 2 Units available for immediate deployment.
   c) Tandem Vibratory Steel Rollers (9-10 Ton): 3 Units owned.
   d) Pneumatic Tyre Roller (PTR 15-25 Ton): 2 Units owned.
   e) Bitumen Pressure Distributor (6000 Litre): 2 Units mounted on commercial chassis.
   f) Excavators (Tata Hitachi EX-200 / JCB 3DX): 4 Units owned.

3. QUALITY TESTING LABORATORY:
   A dedicated on-site field testing laboratory equipped with Core Cutter, Marshall Stability apparatus, Aggregate Impact Tester, and Rapid Moisture Meter will be mobilized within 10 days of Letter of Acceptance (LoA).

4. SAFETY & ENVIRONMENTAL CONFORMANCE:
   We confirm strict adherence to MoRTH specifications (5th Revision) and IRC guidelines for traffic safety during highway construction.

Submitted by:
For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory}
Designation: ${signatoryDesignation}`;
    }

    if (activeTrade === "electrical_solar") {
      return `ANNEXURE - MNRE ALMM SOLAR MODULE COMPLIANCE & ELECTRICAL LICENSE UNDERTAKING

To,
The Project Director / Chief Engineer,
${authority}

SUBJECT: Compliance Undertaking for MNRE Approved List of Models & Manufacturers (ALMM) and Class-1 Electrical License.
Tender Ref: ${tenderRef}
Project: "${tenderTitle}"

Dear Sir,

With reference to the technical conditions of the above tender, M/s ${contractorCompany} certifies:

1. ALMM COMPLIANCE (MNRE ORDER):
   All Solar Photovoltaic (PV) Modules proposed for this 5MW installation shall be strictly procured from manufacturers listed in the latest "Approved Models and Manufacturers of Solar Photovoltaic Modules (ALMM)" issued by the Ministry of New and Renewable Energy (MNRE), Government of India.
   - Proposed Module Tier: Tier-1 Mono PERC / TOPCon Bi-facial (>550Wp, efficiency >21.5%)
   - Module Warranty: 12-year product warranty and 25-year linear degradation performance guarantee (>84.8% at year 25).

2. GRID-INTERCONNECTION & CENTRAL CONTROL MONITORING:
   - Inverters: Multi-MPPT On-Grid string inverters complying with IEC 62109-1/2 and IEC 61727.
   - SCADA Telemetry: Remote monitoring system with RS485 / Modbus over GSM for real-time DISCOM cloud dashboard syncing.

3. ELECTRICAL CONTRACTOR LICENSE:
   M/s ${contractorCompany} possesses a valid Class-1 Electrical Contractor License (HT/EHT up to 132kV) issued by the State Electrical Inspectorate.

For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory} | Designation: ${signatoryDesignation}`;
    }

    if (activeTrade === "healthcare") {
      return `ANNEXURE - CDSCO WHOLESALE DRUG LICENSE & BIOMEDICAL DEVICE COMPLIANCE

To,
The Medical Superintendent / Senior Procurement Officer,
${authority}

SUBJECT: Regulatory Submission of CDSCO Licenses, CE/FDA Clearances & Cold-Chain Conformance.
Tender Ref: ${tenderRef}
Scope: "${tenderTitle}"

Respected Sir,

We hereby confirm compliance with all statutory drug and medical device standards:

1. STATUTORY DRUG / MEDICAL DEVICE LICENSES:
   - CDSCO Wholesale Drug License in Form 20B & Form 21B (Valid & active).
   - Medical Device Registration under Medical Devices Rules, 2017 (MDR-2017).
   - ISO 13485:2016 (Quality Management for Medical Devices) Certified.

2. PRODUCT REGULATORY CLEARANCE:
   - All radiology, telemetry, and monitoring instruments proposed hold active US FDA 510(k) clearance or European CE (IVDR) certification.
   - 5-Year Comprehensive On-Site Warranty and annual calibration certificate traceable to NABL/NPL standards included.

3. COLD-CHAIN INTEGRITY:
   For pharmaceutical and injectable consignments, automated data logger temperature monitors (2°C - 8°C) are attached with each shipper box with batch Certificate of Analysis (CoA).

For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory} | Designation: ${signatoryDesignation}`;
    }

    if (activeTrade === "facility_security") {
      return `ANNEXURE - PSARA LICENSE & MINIMUM WAGES ACT STATUTORY UNDERTAKING

To,
The Head of Administration / PSU Security In-Charge,
${authority}

SUBJECT: Statutory Undertaking for PSARA License, EPFO, ESIC and Chief Labour Commissioner Minimum Wages.
Tender Ref: ${tenderRef}
Contract: "${tenderTitle}"

Sir,

M/s ${contractorCompany} hereby solemnly undertakes and confirms:

1. PSARA COMPLIANCE:
   M/s ${contractorCompany} holds a valid Private Security Agencies Regulation Act (PSARA) License granted by the Controlling Authority / Home Department.

2. STATUTORY WAGE COMPLIANCE:
   - We strictly guarantee payment of Minimum Wages as revised periodically by the Chief Labour Commissioner (Central / State), without any deduction other than statutory PF/ESIC.
   - Monthly bank remittances are made through electronic ECS/NEFT directly into workers' bank accounts with downloadable wage slips.

3. STATUTORY DEPOSITS:
   - Active EPFO Code and ESIC Sub-Code with zero arrears.
   - All personnel are provided with 2 sets of seasonal uniforms, identity badges, and safety gear at zero cost to employees.

For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory} | Designation: ${signatoryDesignation}`;
    }

    if (activeTrade === "fleet_logistics") {
      return `ANNEXURE - FLEET FITNESS, AIS-140 GPS TELEMATICS & CARRIER UNDERTAKING

To,
The Managing Director / Logistics Controller,
${authority}

SUBJECT: Declaration of Commercial Fleet Strength, AIS-140 GPS Compliance & Safety Fitness.
Tender Ref: ${tenderRef}
Work: "${tenderTitle}"

Sir,

M/s ${contractorCompany} hereby confirms:

1. FLEET TELEMATICS & AIS-140:
   100% of the deployed commercial vehicle fleet is equipped with ARAI/ICAT certified AIS-140 GPS Vehicle Location Tracking (VLT) devices with dual panic buttons integrated into the State Emergency Response System.

2. COMMERCIAL RTO FITNESS & PERMITS:
   - Valid All-India / State Commercial Goods/Passenger Permits.
   - Valid Pollution Under Control (PUC) and Certificate of Fitness.
   - Comprehensive Commercial Insurance with Carrier Legal Liability Cover.

3. REAL-TIME TRACKING API:
   Dedicated fleet dispatch API access will be provided to the department for 24x7 route monitoring, geofencing, and automated FASTag toll reconciliation.

For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory} | Designation: ${signatoryDesignation}`;
    }

    if (activeTrade === "telecom") {
      return `ANNEXURE - DoT IP-1 INFRASTRUCTURE & OFC TRENCHING SCHEDULE

To,
The General Manager / Telecommunications Lead,
${authority}

SUBJECT: Department of Telecommunications (DoT) IP-1 Registration & HDD Rig Equipment Schedule.
Tender Ref: ${tenderRef}
Work: "${tenderTitle}"

Sir,

M/s ${contractorCompany} declares the following telecom capabilities:

1. REGULATORY EMPANELMENT:
   Valid Infrastructure Provider Category-I (IP-1) Registration Certificate from the Department of Telecommunications (DoT), Ministry of Communications.

2. SPECIALIZED TRENCHLESS & TESTING EQUIPMENT:
   - Trenchless Horizontal Directional Drilling (HDD) Rigs: 3 Units (American Augers / Vermeer) for crossing railways and national highways.
   - Micro-trenching and Cable Blowing Machines (High-pressure air compressors): 4 Sets.
   - Ribbon & Single-Core Fusion Splicers (Fujikura / Sumitomo): 8 Units.
   - Optical Time Domain Reflectometer (OTDR - EXFO / Anritsu): Calibrated bi-directional test units with chromatic dispersion modules.

For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory} | Designation: ${signatoryDesignation}`;
    }

    // Default IT & Software OEM MAF
    return `ANNEXURE - MANUFACTURER'S AUTHORIZATION FORM (MAF) & SLA UNDERTAKING

To,
The Head of IT / Tender Committee,
${authority}

SUBJECT: Manufacturer Authorization Form (MAF) and 24x7 4-Hour MTTR SLA Guarantee.
Tender Ref: ${tenderRef}
Work: "${tenderTitle}"

Dear Sir,

1. We, M/s ${contractorCompany}, in partnership with certified Original Equipment Manufacturers (OEMs), certify that:
   - We are an Authorized Enterprise Solution Provider and System Integrator.
   - Tender-specific authorization letters guaranteeing supply of genuine, brand-new hardware/software licenses with direct OEM back-to-back warranty are attached.

2. ENTERPRISE SLA COMMITMENT:
   - 99.5% System Uptime guarantee across all deployed nodes.
   - 24x7 Technical Support Desk with 15-minute response time and 4-hour Mean Time to Resolve (MTTR) SLA.
   - CMMI Level 3+ software development and ISO 27001:2022 cybersecurity adherence.

For M/s ${contractorCompany}


_______________________________
(Authorized Signatory)
Name: ${contractorSignatory} | Designation: ${signatoryDesignation}`;
  };

  const documentText = generateDocumentContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(documentText);
    toast({
      type: "success",
      title: "Document Copied to Clipboard!",
      description: "Paste into your bid submission documents or Microsoft Word.",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([documentText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeDocType}_${currentTender.tender_ref_number.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      type: "success",
      title: "Statutory Annexure Downloaded",
      description: "Text file saved to your device.",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeDocType} - ${currentTender.tender_ref_number}</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6; padding: 40px; color: #111; }
            pre { white-space: pre-wrap; font-family: inherit; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <pre>${documentText}</pre>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-r from-emerald-50 via-teal-50/50 to-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1-Click AI Bid Package & Statutory Annexure Generator
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Instantly draft official, legally enforceable affidavits, MSME fee waivers, Make-in-India declarations, and trade-specific schedules compliant with GFR 2017 & GeM GTC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <span>{tradeInfo.icon}</span>
              <span>{tradeInfo.shortLabel} Mode</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls Left, Document Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config & Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Tender Selector */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              1. Select Target Tender
            </label>
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.portal.toUpperCase()}] {t.tender_ref_number} - {t.title.slice(0, 45)}...
                </option>
              ))}
            </select>

            {/* Selected Tender Summary Pill */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-1.5">
              <div className="font-semibold text-slate-900 line-clamp-2">
                {currentTender.title}
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                <span>Ref: <strong>{currentTender.tender_ref_number}</strong></span>
                <span>•</span>
                <span>EMD: <strong>{currentTender.emd_amount ? formatINR(currentTender.emd_amount) : "Exempt"}</strong></span>
              </div>
              <a
                href={currentTender.direct_portal_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline pt-1"
              >
                <span>Open Official Portal RFP</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>

          {/* 2. Document Template Selection */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Select Statutory Annexure
            </label>
            <div className="space-y-2">
              {[
                {
                  id: "msme_emd_exemption" as DocumentType,
                  title: "GFR 173(i) MSME EMD Waiver Affidavit",
                  badge: "100% Fee Waiver",
                  desc: "Exemption from Earnest Money Deposit & Tender Document fees.",
                },
                {
                  id: "make_in_india_mii" as DocumentType,
                  title: "Make In India (MII) Local Content Certificate",
                  badge: "Class-1 Local (>50%)",
                  desc: "Required across all GeM bids for domestic manufacturer preference.",
                },
                {
                  id: "non_blacklisting" as DocumentType,
                  title: "Non-Blacklisting & Anti-Collusion Undertaking",
                  badge: "Stamp Paper Format",
                  desc: "Declaration that firm is free of vigilance or debarment orders.",
                },
                {
                  id: "trade_technical_schedule" as DocumentType,
                  title: `${tradeInfo.shortLabel} Technical Qualification Schedule`,
                  badge: tradeInfo.qualTag,
                  desc: `Trade specific annexure tailored for ${tradeInfo.label}.`,
                },
              ].map((doc) => {
                const isSelected = activeDocType === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveDocType(doc.id)}
                    className={`w-full text-left rounded-xl p-3 border transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/70 shadow-2xs"
                        : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                        {doc.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 leading-snug">{doc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Contractor Legal Parameters */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              3. Signatory & Company Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={contractorCompany}
                  onChange={(e) => setContractorCompany(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Signatory Director</label>
                <input
                  type="text"
                  value={contractorSignatory}
                  onChange={(e) => setContractorSignatory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Udyam Registration No.</label>
                <input
                  type="text"
                  value={udyamRegNo}
                  onChange={(e) => setUdyamRegNo(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">MII Local Content %</label>
                <input
                  type="text"
                  value={localContentPercent}
                  onChange={(e) => setLocalContentPercent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Formatted Legal Document Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold">Draft Output Ready</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition"
                title="Copy all text"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition"
                title="Download .txt file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
                title="Print or Save to PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Document Canvas Preview */}
          <div className="flex-1 rounded-2xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-sm font-mono text-xs leading-relaxed text-slate-800 overflow-x-auto min-h-[520px] whitespace-pre-wrap selection:bg-emerald-500 selection:text-white">
            {documentText}
          </div>
        </div>
      </div>
    </div>
  );
}
