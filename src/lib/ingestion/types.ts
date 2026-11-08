import type { TenderPortalType } from "@/types";

export interface RawScrapedTender {
  portal: TenderPortalType;
  tenderRefNumber: string;
  title: string;
  description?: string;
  category: string;
  authorityName: string;
  locationState?: string;
  locationCity?: string;
  estimatedValue?: number;
  emdAmount?: number;
  documentFee?: number;
  publishedDate: string;
  preBidMeetingDate?: string;
  submissionDeadline: string;
  openingDate?: string;
  originalDocumentUrls?: string[];
  rawPayload: Record<string, unknown>;
}

export interface IngestionResult {
  totalScraped: number;
  newTendersInserted: number;
  duplicateTendersSkipped: number;
  errors: Array<{
    tenderRef: string;
    error: string;
  }>;
}
