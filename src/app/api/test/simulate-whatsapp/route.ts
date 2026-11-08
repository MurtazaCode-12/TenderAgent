import { NextRequest, NextResponse } from "next/server";
import { POST as whatsappWebhookHandler } from "@/app/api/webhooks/whatsapp/route";

/**
 * Developer Sandbox Route for WhatsApp SDR Testing
 * Simulates incoming WhatsApp button clicks ("Save to Pipeline", "Check Compliance", "Pass")
 * without requiring an active ngrok / Cloudflare tunnel during local development.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderNumber = "919876543210",
      action = "save_pipeline",
      tenderId = "00000000-0000-0000-0000-000000000010",
    } = body;

    const simulatedWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_ID_TEST",
          changes: [
            {
              value: {
                messaging_product: "whatsapp" as const,
                metadata: {
                  display_phone_number: "+15551234567",
                  phone_number_id: "PHONE_ID_TEST",
                },
                contacts: [
                  {
                    profile: { name: "Contractor Tester" },
                    wa_id: senderNumber,
                  },
                ],
                messages: [
                  {
                    from: senderNumber,
                    id: `wamid_sim_${Date.now()}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "interactive" as const,
                    interactive: {
                      type: "button_reply" as const,
                      button_reply: {
                        id: `${action}:${tenderId}`,
                        title:
                          action === "save_pipeline"
                            ? "📥 Save to Pipeline"
                            : action === "check_compliance"
                            ? "📄 Check Compliance"
                            : "⏭️ Pass",
                      },
                    },
                  },
                ],
              },
              field: "messages" as const,
            },
          ],
        },
      ],
    };

    // Forward synthetic request to the live WhatsApp webhook handler
    const syntheticRequest = new NextRequest(new URL("/api/webhooks/whatsapp", req.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(simulatedWebhookPayload),
    });

    const response = await whatsappWebhookHandler(syntheticRequest);
    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: `Simulated WhatsApp action '${action}' dispatched successfully.`,
      result: data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Simulation failed",
      },
      { status: 500 }
    );
  }
}
