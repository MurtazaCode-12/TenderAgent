import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { GemPortalConnector } from "./connectors/gem";
import { CpppPortalConnector } from "./connectors/cppp";
import { StatePortalConnector } from "./connectors/state";
import { ScrapedTenderValidationSchema, type ValidatedScrapedTender } from "./validation";
import { generateEmbedding } from "@/lib/ai/config";
import { evaluateTenderICPMatch } from "@/lib/ai/matcher";
import { summarizeTender } from "@/lib/ai/summarizer";
import { sendWhatsAppTenderAlert } from "@/lib/whatsapp/client";
import type { CompanyICPRow, TenderRow } from "@/types";

export interface ProductionIngestionMetrics {
  totalCrawled: number;
  totalValidated: number;
  newTendersInserted: number;
  duplicatesSkipped: number;
  highMatchNotificationsDispatched: number;
  quarantinedErrors: Array<{
    portal: string;
    tenderRef: string;
    reason: string;
  }>;
  executionTimeMs: number;
}

/**
 * Enterprise Multi-Portal Ingestion Orchestrator
 * Crawls GeM, CPPP, and State Portals, validates through Zod, deduplicates,
 * computes 1536-dim vector embeddings, and triggers AI semantic matching.
 */
export async function runIngestionPipeline(): Promise<ProductionIngestionMetrics> {
  const startTime = Date.now();
  const supabase = createAdminSupabaseClient();

  const connectors = [
    new GemPortalConnector(),
    new CpppPortalConnector(),
    new StatePortalConnector(),
  ];

  const metrics: ProductionIngestionMetrics = {
    totalCrawled: 0,
    totalValidated: 0,
    newTendersInserted: 0,
    duplicatesSkipped: 0,
    highMatchNotificationsDispatched: 0,
    quarantinedErrors: [],
    executionTimeMs: 0,
  };

  // 1. Fetch active company ICPs and recipient phone numbers
  const { data: icpData, error: icpError } = await supabase
    .from("company_icps")
    .select("*, companies!inner(id, name, profiles(id, phone_number, full_name, whatsapp_notifications_enabled))")
    .eq("is_active", true);

  if (icpError) {
    console.error("[IngestionPipeline] Failed to fetch active ICPs:", icpError);
  }

  // 2. Crawl and Validate from all portal connectors
  const validatedBatch: ValidatedScrapedTender[] = [];

  for (const connector of connectors) {
    try {
      const portalTenders = await connector.fetchLatestTenders();
      metrics.totalCrawled += portalTenders.length;

      for (const item of portalTenders) {
        const validation = ScrapedTenderValidationSchema.safeParse(item);
        if (validation.success) {
          validatedBatch.push(validation.data);
          metrics.totalValidated++;
        } else {
          metrics.quarantinedErrors.push({
            portal: connector.portalName,
            tenderRef: item.tenderRefNumber || "UNKNOWN_REF",
            reason: validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
          });
        }
      }
    } catch (portalErr) {
      console.error(`[IngestionPipeline] Connector error for ${connector.portalName}:`, portalErr);
      metrics.quarantinedErrors.push({
        portal: connector.portalName,
        tenderRef: "CONNECTOR_FAULT",
        reason: portalErr instanceof Error ? portalErr.message : "Unknown portal error",
      });
    }
  }

  // 3. Process Validated Tenders (Deduplication + Embedding + Storage)
  for (const tender of validatedBatch) {
    try {
      // Deduplication check by unique tender reference number
      const { data: existing } = await supabase
        .from("tenders")
        .select("id, status")
        .eq("tender_ref_number", tender.tenderRefNumber)
        .maybeSingle();

      if (existing) {
        metrics.duplicatesSkipped++;
        continue;
      }

      // Generate 1536-dimensional vector embedding for semantic search
      let embeddingVector: number[] | null = null;
      try {
        const textForEmbedding = `${tender.title}. Category: ${tender.category}. Issuing Department: ${tender.authorityName}. State: ${tender.locationState || "All India"}. Description: ${tender.description || ""}`;
        embeddingVector = await generateEmbedding(textForEmbedding);
      } catch (embErr) {
        console.warn(`[Embedding warning for ${tender.tenderRefNumber}]:`, embErr);
      }

      // Insert clean record into Supabase
      const { data: insertedTender, error: insertErr } = await supabase
        .from("tenders")
        .insert({
          portal: tender.portal,
          tender_ref_number: tender.tenderRefNumber,
          title: tender.title,
          description: tender.description || "",
          category: tender.category,
          authority_name: tender.authorityName,
          location_state: tender.locationState,
          location_city: tender.locationCity,
          estimated_value: tender.estimatedValue,
          emd_amount: tender.emdAmount,
          document_fee: tender.documentFee,
          published_date: tender.publishedDate,
          pre_bid_meeting_date: tender.preBidMeetingDate,
          submission_deadline: tender.submissionDeadline,
          opening_date: tender.openingDate,
          original_document_urls: tender.originalDocumentUrls,
          raw_payload: tender.rawPayload,
          embedding: embeddingVector ? JSON.stringify(embeddingVector) : null,
          status: "active",
        })
        .select()
        .single();

      if (insertErr || !insertedTender) {
        metrics.quarantinedErrors.push({
          portal: tender.portal,
          tenderRef: tender.tenderRefNumber,
          reason: insertErr?.message || "Failed to insert into Supabase",
        });
        continue;
      }

      metrics.newTendersInserted++;
      const savedTender = insertedTender as TenderRow;

      // 4. Semantic ICP Matching & WhatsApp SDR Triggering
      if (icpData && icpData.length > 0) {
        for (const rawIcp of icpData) {
          const icp = rawIcp as CompanyICPRow & {
            companies: {
              id: string;
              name: string;
              profiles: Array<{
                id: string;
                phone_number: string;
                full_name: string;
                whatsapp_notifications_enabled: boolean;
              }>;
            };
          };

          const icpEmbedding = icp.embedding ? JSON.parse(icp.embedding) : undefined;
          const matchResult = evaluateTenderICPMatch(
            savedTender,
            icp,
            embeddingVector || undefined,
            icpEmbedding
          );

          // Trigger plain-language summary and WhatsApp SDR alert when match >= 80%
          if (matchResult.overallScore >= 80) {
            let aiSummaryJson = {};
            try {
              aiSummaryJson = await summarizeTender({
                tenderRefNumber: savedTender.tender_ref_number,
                title: savedTender.title,
                authorityName: savedTender.authority_name,
                category: savedTender.category,
                description: savedTender.description || "",
                estimatedValue: savedTender.estimated_value,
                locationState: savedTender.location_state,
                rawPayload: tender.rawPayload,
              });
            } catch (sumErr) {
              console.warn(`[Summary AI Warning for ${savedTender.tender_ref_number}]:`, sumErr);
            }

            // Save match record in database
            const { data: matchRecord } = await supabase
              .from("tender_matches")
              .insert({
                company_id: icp.company_id,
                tender_id: savedTender.id,
                overall_score: matchResult.overallScore,
                semantic_score: matchResult.semanticScore,
                rule_score: matchResult.ruleScore,
                match_reasons: matchResult.matchReasons,
                disqualification_risks: matchResult.disqualificationRisks,
                ai_summary: aiSummaryJson,
                whatsapp_status: "queued",
              })
              .select("id")
              .maybeSingle();

            // Dispatch WhatsApp SDR interactive alert to bid manager
            const recipient = icp.companies.profiles.find(
              (p) => p.whatsapp_notifications_enabled && p.phone_number
            );

            if (recipient) {
              try {
                const sendResult = await sendWhatsAppTenderAlert({
                  to: recipient.phone_number,
                  companyId: icp.company_id,
                  tenderId: savedTender.id,
                  tenderRefNumber: savedTender.tender_ref_number,
                  title: savedTender.title,
                  authorityName: savedTender.authority_name,
                  estimatedValue: savedTender.estimated_value,
                  submissionDeadline: savedTender.submission_deadline,
                  matchScore: matchResult.overallScore,
                  aiSummary: aiSummaryJson,
                });

                if (sendResult.success && matchRecord) {
                  metrics.highMatchNotificationsDispatched++;
                  await supabase
                    .from("tender_matches")
                    .update({
                      whatsapp_status: "sent",
                      whatsapp_message_id: sendResult.messageId,
                    })
                    .eq("id", matchRecord.id);
                }
              } catch (waErr) {
                console.warn("[WhatsApp SDR dispatch warning]:", waErr);
              }
            }
          }
        }
      }
    } catch (procErr) {
      metrics.quarantinedErrors.push({
        portal: tender.portal,
        tenderRef: tender.tenderRefNumber,
        reason: procErr instanceof Error ? procErr.message : "Processing exception",
      });
    }
  }

  metrics.executionTimeMs = Date.now() - startTime;
  return metrics;
}
