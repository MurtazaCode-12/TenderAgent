import { createAdminSupabaseClient } from "@/lib/supabase/admin";
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
  const supabase = createAdminSupabaseClient();
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
  const recipient = normalizeWhatsAppNumber(input.to);

  const valueFormatted = formatINR(input.estimatedValue);
  const deadlineFormatted = formatTenderDate(input.submissionDeadline);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.tenderops.ai";

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

🔗 *View Full RFP & Clauses:* ${appUrl}/tenders/${input.tenderId}`;

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

  // If WhatsApp credentials are not yet configured, log to Supabase in demo mode
  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp Client] WhatsApp credentials not configured. Running in simulated sandbox mode.");

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

    return {
      success: true,
      messageId: `sim_${Date.now()}`,
    };
  }

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

      // Audit failure log
      await supabase.from("whatsapp_logs").insert({
        company_id: input.companyId,
        tender_id: input.tenderId,
        phone_number: recipient,
        direction: "outbound",
        message_type: "interactive",
        payload: interactivePayload,
        status: "failed",
        error_details: JSON.stringify(data),
      });

      throw new WhatsAppServiceError(data.error?.message || "Failed to deliver WhatsApp message", data);
    }

    const messageId = data.messages?.[0]?.id || `wa_${Date.now()}`;

    // Audit success log
    await supabase.from("whatsapp_logs").insert({
      company_id: input.companyId,
      tender_id: input.tenderId,
      phone_number: recipient,
      direction: "outbound",
      message_type: "interactive",
      payload: interactivePayload,
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

  if (!token || !phoneNumberId) {
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
