import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { GemPortalScraper, CpppPortalScraper, StatePortalScraper } from "./scrapers";
import { generateEmbedding } from "@/lib/ai/config";
import { evaluateTenderICPMatch } from "@/lib/ai/matcher";
import { summarizeTender } from "@/lib/ai/summarizer";
import { sendWhatsAppTenderAlert } from "@/lib/whatsapp/client";
import type { IngestionResult, RawScrapedTender } from "./types";
import type { CompanyICPRow, TenderRow } from "@/types";

/**
 * Enterprise Ingestion Orchestrator
 * Ingests tenders from public portals, embeds text via AI, matches against contractor ICPs,
 * triggers structured summaries for high-value fits (Score > 80%), and dispatches WhatsApp alerts.
 */
export async function runIngestionPipeline(): Promise<IngestionResult> {
  const supabase = createAdminSupabaseClient();
  const scrapers = [
    new GemPortalScraper(),
    new CpppPortalScraper(),
    new StatePortalScraper(),
  ];

  const result: IngestionResult = {
    totalScraped: 0,
    newTendersInserted: 0,
    duplicateTendersSkipped: 0,
    errors: [],
  };

  // 1. Fetch active company ICPs along with contractor phone numbers
  const { data: icpData, error: icpError } = await supabase
    .from("company_icps")
    .select("*, companies!inner(id, name, profiles(id, phone_number, full_name, whatsapp_notifications_enabled))")
    .eq("is_active", true);

  if (icpError) {
    console.error("[runIngestionPipeline] Failed to fetch company ICPs:", icpError);
    throw icpError;
  }

  // 2. Fetch raw tenders from all portal connectors
  const rawTenders: RawScrapedTender[] = [];
  for (const scraper of scrapers) {
    try {
      const portalTenders = await scraper.fetchLatestTenders();
      rawTenders.push(...portalTenders);
    } catch (scraperErr) {
      console.error(`[Scraper Error: ${scraper.portalName}]:`, scraperErr);
    }
  }

  result.totalScraped = rawTenders.length;

  // 3. Process each tender
  for (const raw of rawTenders) {
    try {
      // Check if tender already exists in Supabase
      const { data: existing } = await supabase
        .from("tenders")
        .select("id")
        .eq("tender_ref_number", raw.tenderRefNumber)
        .maybeSingle();

      if (existing) {
        result.duplicateTendersSkipped++;
        continue;
      }

      // Generate vector embedding for semantic matching
      const textToEmbed = `${raw.title}. Category: ${raw.category}. Department: ${raw.authorityName}. Location: ${raw.locationState || "All India"}. Description: ${raw.description || ""}`;
      let embeddingVector: number[] | null = null;
      try {
        embeddingVector = await generateEmbedding(textToEmbed);
      } catch (embErr) {
        console.warn(`[Embedding warning for ${raw.tenderRefNumber}]:`, embErr);
      }

      // Insert tender into Supabase
      const { data: insertedTender, error: insertErr } = await supabase
        .from("tenders")
        .insert({
          portal: raw.portal,
          tender_ref_number: raw.tenderRefNumber,
          title: raw.title,
          description: raw.description,
          category: raw.category,
          authority_name: raw.authorityName,
          location_state: raw.locationState,
          location_city: raw.locationCity,
          estimated_value: raw.estimatedValue,
          emd_amount: raw.emdAmount,
          document_fee: raw.documentFee,
          published_date: raw.publishedDate,
          pre_bid_meeting_date: raw.preBidMeetingDate,
          submission_deadline: raw.submissionDeadline,
          opening_date: raw.openingDate,
          original_document_urls: raw.originalDocumentUrls || [],
          raw_payload: raw.rawPayload,
          embedding: embeddingVector ? JSON.stringify(embeddingVector) : null,
          status: "active",
        })
        .select()
        .single();

      if (insertErr || !insertedTender) {
        result.errors.push({
          tenderRef: raw.tenderRefNumber,
          error: insertErr?.message || "Failed to insert tender record",
        });
        continue;
      }

      result.newTendersInserted++;
      const tenderRow = insertedTender as TenderRow;

      // 4. Match against all registered company ICPs
      if (icpData && icpData.length > 0) {
        for (const item of icpData) {
          const icp = item as CompanyICPRow & {
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
            tenderRow,
            icp,
            embeddingVector || undefined,
            icpEmbedding
          );

          // Only process and notify if overall score > 80% (per architectural requirement)
          if (matchResult.overallScore >= 80) {
            // Generate structured executive summary via LLM
            let aiSummaryJson = {};
            try {
              aiSummaryJson = await summarizeTender({
                tenderRefNumber: tenderRow.tender_ref_number,
                title: tenderRow.title,
                authorityName: tenderRow.authority_name,
                category: tenderRow.category,
                description: tenderRow.description || "",
                estimatedValue: tenderRow.estimated_value,
                locationState: tenderRow.location_state,
                rawPayload: raw.rawPayload,
              });
            } catch (sumErr) {
              console.error(`[Summary Error for ${tenderRow.tender_ref_number}]:`, sumErr);
            }

            // Insert into tender_matches
            const { data: matchRecord, error: matchInsertErr } = await supabase
              .from("tender_matches")
              .insert({
                company_id: icp.company_id,
                tender_id: tenderRow.id,
                overall_score: matchResult.overallScore,
                semantic_score: matchResult.semanticScore,
                rule_score: matchResult.ruleScore,
                match_reasons: matchResult.matchReasons,
                disqualification_risks: matchResult.disqualificationRisks,
                ai_summary: aiSummaryJson,
                whatsapp_status: "queued",
              })
              .select()
              .single();

            if (matchInsertErr) {
              console.error("[Match Insert Error]:", matchInsertErr);
              continue;
            }

            // 5. Send WhatsApp SDR alert to eligible company bid managers
            const primaryRecipient = icp.companies.profiles.find(
              (p) => p.whatsapp_notifications_enabled && p.phone_number
            );

            if (primaryRecipient) {
              try {
                const sendResult = await sendWhatsAppTenderAlert({
                  to: primaryRecipient.phone_number,
                  companyId: icp.company_id,
                  tenderId: tenderRow.id,
                  tenderRefNumber: tenderRow.tender_ref_number,
                  title: tenderRow.title,
                  authorityName: tenderRow.authority_name,
                  estimatedValue: tenderRow.estimated_value,
                  submissionDeadline: tenderRow.submission_deadline,
                  matchScore: matchResult.overallScore,
                  aiSummary: aiSummaryJson,
                });

                if (sendResult.success) {
                  await supabase
                    .from("tender_matches")
                    .update({
                      whatsapp_status: "sent",
                      whatsapp_message_id: sendResult.messageId,
                    })
                    .eq("id", matchRecord.id);
                }
              } catch (waErr) {
                console.error(`[WhatsApp Dispatch Error for ${tenderRow.tender_ref_number}]:`, waErr);
              }
            }
          }
        }
      }
    } catch (itemErr) {
      result.errors.push({
        tenderRef: raw.tenderRefNumber,
        error: itemErr instanceof Error ? itemErr.message : "Unexpected error",
      });
    }
  }

  return result;
}
