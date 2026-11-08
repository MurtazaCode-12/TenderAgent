import { NextRequest, NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/whatsapp/security";
import { sendWhatsAppTextMessage, normalizeWhatsAppNumber } from "@/lib/whatsapp/client";
import { createAdminSupabaseClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { db } from "@/lib/db/store";

/**
 * Meta Webhook Verification Handshake (GET)
 * Meta pings this endpoint during webhook setup with a challenge token.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[WhatsApp Webhook] Handshake verified successfully.");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[WhatsApp Webhook] Handshake verification failed. Token mismatch.");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Meta Webhook Event Receiver (POST)
 * Ingests inbound messages, interactive button replies, and delivery receipts.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  // 1. Validate signature if appSecret is configured in production
  if (appSecret && !appSecret.includes("your-")) {
    const isValid = verifyMetaSignature(rawBody, signature, appSecret);
    if (!isValid) {
      console.error("[WhatsApp Webhook] Invalid HMAC signature. Dropping request.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  // 2. Process changes
  if (body.entry && body.entry.length > 0) {
    for (const entry of body.entry) {
      if (!entry.changes) continue;
      for (const change of entry.changes) {
        const value = change.value;
        const messages = value?.messages;

        if (messages && messages.length > 0) {
          for (const msg of messages) {
            const senderWaId = msg.from; // e.g. "919876543210"
            const normalizedSender = normalizeWhatsAppNumber(senderWaId);

            // Find contractor profile in Database Store or Supabase
            let companyId = "00000000-0000-0000-0000-000000000001";
            let contractorName = "Contractor";

            // Local DB lookup
            const localUser = db.getUserByPhone(normalizedSender);
            if (localUser) {
              contractorName = localUser.full_name;
              const company = db.getUserCompany(localUser.id);
              if (company) companyId = company.id;
            } else if (isSupabaseAdminConfigured()) {
              try {
                const supabase = createAdminSupabaseClient();
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("id, company_id, full_name")
                  .ilike("phone_number", `%${normalizedSender.slice(-10)}%`)
                  .maybeSingle();

                if (profile) {
                  companyId = (profile as any).company_id;
                  contractorName = (profile as any).full_name;
                }
              } catch (err) {
                // Non-blocking
              }
            }

            // Log inbound message
            db.saveWhatsAppLog({
              company_id: companyId,
              phone_number: normalizedSender,
              direction: "inbound",
              message_type: msg.type || "text",
              message_text: msg.interactive?.button_reply?.title || msg.text?.body || "Inbound message",
              status: "received",
              external_message_id: msg.id,
            });

            // Handle Interactive Button Clicks
            if (msg.type === "interactive" && msg.interactive?.button_reply) {
              const buttonId = msg.interactive.button_reply.id;
              const [action, tenderId] = buttonId.split(":");

              // Fetch tender info from DB store
              const tender = db.getTenderById(tenderId);
              const tenderRef = tender?.tender_ref_number || "Tender";
              const tenderTitle = tender?.title || "Procurement Opportunity";

              if (action === "save_pipeline") {
                db.savePipelineItem(
                  companyId,
                  tenderId,
                  "under_review",
                  "Auto-saved via WhatsApp SDR quick-reply button"
                );

                if (isSupabaseAdminConfigured()) {
                  try {
                    const supabase = createAdminSupabaseClient();
                    await supabase.from("pipeline_items").upsert(
                      {
                        company_id: companyId,
                        tender_id: tenderId,
                        stage: "under_review",
                        internal_notes: "Auto-saved via WhatsApp SDR quick-reply button",
                      },
                      { onConflict: "company_id,tender_id" }
                    );
                  } catch (err) {
                    // Non-blocking
                  }
                }

                await sendWhatsAppTextMessage(
                  senderWaId,
                  `✅ *Saved to Pipeline!*

${tenderRef} is now active in your TenderOps pipeline under *"Under Review"*.
Project: ${tenderTitle.slice(0, 80)}...

👉 Open Dashboard to Draft Bid: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pipeline`
                );
              } else if (action === "check_compliance") {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                await sendWhatsAppTextMessage(
                  senderWaId,
                  `📄 *AI Bid Compliance Checker*

To audit your technical proposal for ${tenderRef} against mandatory RFP clauses:
${appUrl}/compliance?tenderId=${tenderId}

Key Pre-Bid Verification:
• MSME / Udyam GFR 173(i) Waiver
• Turnover Solvency Certificate
• OEM Authorization (MAF)`
                );
              } else if (action === "pass_tender") {
                db.savePipelineItem(
                  companyId,
                  tenderId,
                  "passed",
                  "Passed via WhatsApp SDR quick-action"
                );

                await sendWhatsAppTextMessage(
                  senderWaId,
                  `⏭️ *Tender Passed*

We've noted that ${tenderRef} was passed. We will tune our AI algorithm to show fewer contracts of this profile.`
                );
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ status: "EVENT_RECEIVED" });
}
