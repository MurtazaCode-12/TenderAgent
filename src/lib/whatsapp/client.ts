import { createAdminSupabaseClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { db } from "@/lib/db/store";
import { formatINR, formatTenderDate } from "@/lib/utils";
import { WhatsAppServiceError } from "@/lib/errors";

export interface SendTenderAlertInput {
  to: string;
  companyId: string;
  tenderId: string;
  tenderRefNumber: string;
  title: string;
  authorityName: string;
  estimatedValue?: number | null;
  submissionDeadline: string;
  matchScore: number;
  aiSummary?: Record<string, unknown>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Checks if live Meta WhatsApp credentials are configured (non-placeholder).
 */
export function isMetaWhatsAppConfigured(): boolean {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;
  if (token.includes("your-") || phoneNumberId.includes("your-")) return false;
  return true;
}

/**
 * Normalizes phone numbers to standard international E.164 format without '+' or spaces for Meta API.
 * E.g., "+91 98765 43210" -> "919876543210"
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`; // Default to India (+91) if 10 digits provided
  }
  return digitsOnly;
}

/**
 * Sends a high-converting, plain-language tender alert via WhatsApp Business Cloud API.
 * Uses interactive quick-reply buttons ("Save to Pipeline", "Analyze Bid", "Pass").
 */
export async function sendWhatsAppTenderAlert(input: SendTenderAlertInput): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
  const recipient = normalizeWhatsAppNumber(input.to);

  const valueFormatted = formatINR(input.estimatedValue);
  const deadlineFormatted = formatTenderDate(input.submissionDeadline);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Build high-converting executive text body
  const bodyText = 
`🔔 *TenderOps AI: High-Match Tender Alert* (Score: ${input.matchScore}%)

🏛️ *Authority:* ${input.authorityName}
📋 *Tender Ref:* ${input.tenderRefNumber}
💼 *Project:* ${input.title}

💰 *Estimated Value:* ${valueFormatted}
⏳ *Submission Deadline:* ${deadlineFormatted}

💡 *Executive Brief:*
${(input.aiSummary as any)?.executive_summary || "High-value public procurement contract matching your core capabilities and registered turnover thresholds."}

🔗 *View Full RFP & Direct Portal Documents:* ${appUrl}/tenders`;

  // Interactive message payload with quick-action buttons
  const interactivePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "interactive",
    interactive: {
      type: "button",
      header: {
        type: "text",
        text: `🎯 ${input.matchScore}% Match: New Tender Alert`,
      },
      body: {
        text: bodyText.slice(0, 1024), // Meta character limit for interactive body
      },
      footer: {
        text: "TenderOps AI by MCodes • WhatsApp SDR",
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: `save_pipeline:${input.tenderId}`,
              title: "📥 Save to Pipeline",
            },
          },
          {
            type: "reply",
            reply: {
              id: `check_compliance:${input.tenderId}`,
              title: "📄 Check Compliance",
            },
          },
          {
            type: "reply",
            reply: {
              id: `pass_tender:${input.tenderId}`,
              title: "⏭️ Pass",
            },
          },
        ],
      },
    },
  };

  // 1. If WhatsApp credentials are placeholder or unconfigured, run high-fidelity simulation
  if (!isMetaWhatsAppConfigured()) {
    console.log(`[WhatsApp Client] Simulating alert delivery to +${recipient} for ${input.tenderRefNumber}`);

    db.saveWhatsAppLog({
      company_id: input.companyId,
      phone_number: recipient,
      direction: "outbound",
      message_type: "interactive_tender_alert",
      message_text: bodyText,
      status: "delivered",
      external_message_id: `wamid_sim_${Date.now()}`,
    });

    if (isSupabaseAdminConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        await supabase.from("whatsapp_logs").insert({
          company_id: input.companyId,
          tender_id: input.tenderId,
          phone_number: recipient,
          direction: "outbound",
          message_type: "interactive",
          payload: interactivePayload,
          status: "delivered",
          external_message_id: `sim_${Date.now()}`,
        });
      } catch (err) {
        // Non-blocking
      }
    }

    return {
      success: true,
      messageId: `wamid_sim_${Date.now()}`,
    };
  }

  // 2. Dispatch to live Meta WhatsApp Cloud API
  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interactivePayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[Meta WhatsApp API Error]:", data);

      db.saveWhatsAppLog({
        company_id: input.companyId,
        phone_number: recipient,
        direction: "outbound",
        message_type: "interactive_tender_alert",
        message_text: bodyText,
        status: "failed",
        external_message_id: `fail_${Date.now()}`,
      });

      return {
        success: false,
        error: data.error?.message || "Failed to deliver WhatsApp message",
      };
    }

    const messageId = data.messages?.[0]?.id || `wa_${Date.now()}`;

    db.saveWhatsAppLog({
      company_id: input.companyId,
      phone_number: recipient,
      direction: "outbound",
      message_type: "interactive_tender_alert",
      message_text: bodyText,
      status: "sent",
      external_message_id: messageId,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error("[sendWhatsAppTenderAlert Exception]:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error contacting Meta API",
    };
  }
}

/**
 * Sends a standard plain text confirmation message back to the contractor on WhatsApp.
 */
export async function sendWhatsAppTextMessage(to: string, message: string): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
  const recipient = normalizeWhatsAppNumber(to);

  // Always log locally
  db.saveWhatsAppLog({
    company_id: "00000000-0000-0000-0000-000000000001",
    phone_number: recipient,
    direction: "outbound",
    message_type: "text_receipt",
    message_text: message,
    status: "delivered",
    external_message_id: `sim_reply_${Date.now()}`,
  });

  if (!isMetaWhatsAppConfigured()) {
    console.log(`[Simulated Inbound Reply to ${recipient}]: ${message}`);
    return { success: true, messageId: `sim_reply_${Date.now()}` };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await res.json();
    return {
      success: res.ok,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err) {
    console.error("[sendWhatsAppTextMessage error]:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to send text" };
  }
}
