import { NextRequest, NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/whatsapp/security";
import { sendWhatsAppTextMessage, normalizeWhatsAppNumber } from "@/lib/whatsapp/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { WhatsAppWebhookEntry } from "@/types";

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
  if (appSecret) {
    const isValid = verifyMetaSignature(rawBody, signature, appSecret);
    if (!isValid) {
      console.error("[WhatsApp Webhook] Invalid HMAC signature. Dropping request.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: WhatsAppWebhookEntry;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // 2. Process changes
  if (body.entry && body.entry.length > 0) {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;
        const messages = value.messages;

        if (messages && messages.length > 0) {
          for (const msg of messages) {
            const senderWaId = msg.from; // e.g. "919876543210"
            const normalizedSender = normalizeWhatsAppNumber(senderWaId);

            // Find contractor profile in database by phone number
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, company_id, full_name, companies(name)")
              .ilike("phone_number", `%${normalizedSender.slice(-10)}%`)
              .maybeSingle();

            if (!profile) {
              console.warn(`[WhatsApp Webhook] Message from unregistered phone: ${senderWaId}`);
              continue;
            }

            // Handle Interactive Button Clicks
            if (msg.type === "interactive" && msg.interactive?.button_reply) {
              const buttonId = msg.interactive.button_reply.id;
              const [action, tenderId] = buttonId.split(":");

              // Fetch tender info
              const { data: tender } = await supabase
                .from("tenders")
                .select("tender_ref_number, title")
                .eq("id", tenderId)
                .maybeSingle();

              const tenderRef = tender?.tender_ref_number || "Tender";

              if (action === "save_pipeline") {
                // Upsert into pipeline_items
                await supabase.from("pipeline_items").upsert(
                  {
                    company_id: profile.company_id,
                    tender_id: tenderId,
                    stage: "under_review",
                    assigned_user_id: profile.id,
                    internal_notes: "Auto-saved via WhatsApp SDR quick-reply button",
                  },
                  { onConflict: "company_id,tender_id" }
                );

                await sendWhatsAppTextMessage(
                  senderWaId,
                  `✅ *Saved to Pipeline!*

${tenderRef} is now active in your pipeline under *"Under Review"*.
Log in to your dashboard to assign teammates or run a Bid Compliance check.`
                );
              } else if (action === "check_compliance") {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.tenderops.ai";
                await sendWhatsAppTextMessage(
                  senderWaId,
                  `📄 *AI Bid Compliance Checker*

To audit your bid for ${tenderRef}:
1. Upload your draft PDF bid document at:
👉 ${appUrl}/compliance?tenderId=${tenderId}

Our AI will scan mandatory clauses, EMD formatting, and missing annexures in 30 seconds.`
                );
              } else if (action === "pass_tender") {
                await supabase.from("pipeline_items").upsert(
                  {
                    company_id: profile.company_id,
                    tender_id: tenderId,
                    stage: "passed",
                    internal_notes: "Marked as Pass via WhatsApp",
                  },
                  { onConflict: "company_id,tender_id" }
                );

                await sendWhatsAppTextMessage(
                  senderWaId,
                  `⏭️ *Tender Passed*

We've archived ${tenderRef}. We'll continue monitoring portals and notify you when stronger matches appear!`
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
