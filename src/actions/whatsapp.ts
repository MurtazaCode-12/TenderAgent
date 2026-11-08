"use server";

import { getCurrentUser } from "@/actions/auth";
import { db } from "@/lib/db/store";
import { sendWhatsAppTenderAlert, normalizeWhatsAppNumber } from "@/lib/whatsapp/client";

export interface WhatsAppActionResult {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

/**
 * Dispatches an instant WhatsApp tender alert with interactive quick-action buttons
 * to the contractor's registered mobile number.
 */
export async function dispatchTenderToWhatsAppAction(
  tenderId: string,
  targetPhone?: string
): Promise<WhatsAppActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const tender = db.getTenderById(tenderId);

    if (!tender) {
      return { success: false, error: "Tender not found in database catalog." };
    }

    const companyId = currentUser?.company?.id || "00000000-0000-0000-0000-000000000001";
    const phone = targetPhone || currentUser?.user?.phone_number || "+91 98201 44820";

    const res = await sendWhatsAppTenderAlert({
      to: phone,
      companyId,
      tenderId: tender.id,
      tenderRefNumber: tender.tender_ref_number,
      title: tender.title,
      authorityName: tender.authority_name,
      estimatedValue: tender.estimated_value,
      submissionDeadline: tender.submission_deadline,
      matchScore: tender.match_score,
      aiSummary: tender.ai_summary,
    });

    if (res.success) {
      return {
        success: true,
        message: `Tender alert sent to WhatsApp (+${normalizeWhatsAppNumber(phone)})!`,
        messageId: res.messageId,
      };
    } else {
      return {
        success: false,
        error: res.error || "Failed to deliver WhatsApp message.",
      };
    }
  } catch (err: any) {
    console.error("[dispatchTenderToWhatsAppAction Error]:", err);
    return {
      success: false,
      error: err.message || "Failed to send WhatsApp alert.",
    };
  }
}
