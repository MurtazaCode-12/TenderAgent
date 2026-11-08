import type { RawScrapedTender } from "./types";

/**
 * Base abstract class for Portal Scrapers
 */
export abstract class BasePortalScraper {
  abstract readonly portalName: string;
  abstract fetchLatestTenders(): Promise<RawScrapedTender[]>;
}

/**
 * GeM (Government e-Marketplace) Connector
 * Ingests and normalizes product and service tenders published on GeM.
 */
export class GemPortalScraper extends BasePortalScraper {
  readonly portalName = "gem";

  async fetchLatestTenders(): Promise<RawScrapedTender[]> {
    // In production, this connects to the GeM RSS/API or scheduled headless scraper
    // Provides realistic normalized tender structures for Indian public procurement
    const now = new Date();
    const deadline1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const deadline2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    return [
      {
        portal: "gem",
        tenderRefNumber: `GEM/${now.getFullYear()}/B/${Math.floor(1000000 + Math.random() * 9000000)}`,
        title: "Supply, Installation & Maintenance of Cloud Server Infrastructure & High-Performance GPUs",
        description: "Procurement of enterprise-grade cloud compute clusters, AI GPU nodes, storage arrays, and 3-year 24x7 SLA support for Department of Science & Technology data centers.",
        category: "Information Technology & AI Hardware",
        authorityName: "Department of Science and Technology, Ministry of Science and Technology",
        locationState: "Delhi",
        locationCity: "New Delhi",
        estimatedValue: 48500000, // ₹4.85 Crore
        emdAmount: 970000, // ₹9.7 Lakh (2%)
        documentFee: 0, // GeM exempts document fee
        publishedDate: now.toISOString(),
        submissionDeadline: deadline1.toISOString(),
        openingDate: new Date(deadline1.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        originalDocumentUrls: ["https://gem.gov.in/bids/view/mock-bid-doc-1.pdf"],
        rawPayload: {
          bid_type: "Custom Bid for Services & Goods",
          turnover_rule: "Average ₹2 Cr in last 3 financial years",
          msme_relaxation: "Allowed for turnover and past experience",
          startup_exemption: "Eligible for DPIIT recognized startups",
        },
      },
      {
        portal: "gem",
        tenderRefNumber: `GEM/${now.getFullYear()}/B/${Math.floor(1000000 + Math.random() * 9000000)}`,
        title: "Comprehensive Annual Maintenance Contract (CAMC) for Cisco Networking & Perimeter Security Firewalls",
        description: "Annual maintenance contract for core switches, unified threat management firewalls, and campus-wide Wi-Fi 6 APs across 12 zonal offices.",
        category: "Network & Cyber Security Maintenance",
        authorityName: "National Informatics Centre Services Inc. (NICSI)",
        locationState: "PAN_INDIA",
        locationCity: "Multiple Locations",
        estimatedValue: 12500000, // ₹1.25 Crore
        emdAmount: 250000,
        documentFee: 0,
        publishedDate: now.toISOString(),
        submissionDeadline: deadline2.toISOString(),
        originalDocumentUrls: ["https://gem.gov.in/bids/view/mock-bid-doc-2.pdf"],
        rawPayload: {
          oem_authorization: "Mandatory MAF from Cisco required",
          iso_cert_required: "ISO 9001 and ISO 27001 mandatory",
        },
      },
    ];
  }
}

/**
 * CPPP (Central Public Procurement Portal - eProcure) Connector
 */
export class CpppPortalScraper extends BasePortalScraper {
  readonly portalName = "cppp";

  async fetchLatestTenders(): Promise<RawScrapedTender[]> {
    const now = new Date();
    const deadline = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    return [
      {
        portal: "cppp",
        tenderRefNumber: `CPPP/${now.getFullYear()}/MoHFW/${Math.floor(100000 + Math.random() * 900000)}`,
        title: "Development, Implementation and Operations of Hospital Information Management System (HIMS) with Telemedicine",
        description: "Turnkey software development, cloud deployment, and operations support for ABDM-compliant Hospital Information Management System across state civil hospitals.",
        category: "Software Development & Digital Health",
        authorityName: "Ministry of Health and Family Welfare",
        locationState: "Maharashtra",
        locationCity: "Mumbai",
        estimatedValue: 95000000, // ₹9.5 Crore
        emdAmount: 1900000,
        documentFee: 10000,
        publishedDate: now.toISOString(),
        preBidMeetingDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        submissionDeadline: deadline.toISOString(),
        openingDate: new Date(deadline.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        originalDocumentUrls: ["https://eprocure.gov.in/epublish/mock-tender-doc.pdf"],
        rawPayload: {
          cmmi_level: "CMMI Level 3 or higher mandatory",
          gst_compliance: "Mandatory active GST registration in Maharashtra",
        },
      },
    ];
  }
}

/**
 * State Public Procurement Portal Connector (e.g. MahaTenders, Karnataka e-Proc)
 */
export class StatePortalScraper extends BasePortalScraper {
  readonly portalName = "state_portal";

  async fetchLatestTenders(): Promise<RawScrapedTender[]> {
    const now = new Date();
    const deadline = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);

    return [
      {
        portal: "state_portal",
        tenderRefNumber: `STATE/UP/${now.getFullYear()}/PWD/${Math.floor(10000 + Math.random() * 90000)}`,
        title: "Civil Works & Smart Traffic Surveillance Systems under Smart Cities Mission",
        description: "Installation of high-definition AI-based ANPR cameras, traffic monitoring control center, and integrated command dashboard.",
        category: "Civil Works & Smart City Surveillance",
        authorityName: "Uttar Pradesh State Smart City Corporation Ltd",
        locationState: "Uttar Pradesh",
        locationCity: "Lucknow",
        estimatedValue: 62000000, // ₹6.2 Crore
        emdAmount: 1240000,
        documentFee: 5000,
        publishedDate: now.toISOString(),
        submissionDeadline: deadline.toISOString(),
        originalDocumentUrls: ["https://etender.up.nic.in/mock-smartcity.pdf"],
        rawPayload: {
          class_contractor: "Class A Contractor Registration required",
        },
      },
    ];
  }
}
