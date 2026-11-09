import { NextRequest, NextResponse } from "next/server";
import { runIngestionPipeline } from "@/lib/ingestion/orchestrator";
import { handleApiError, AuthenticationError } from "@/lib/errors";

export const maxDuration = 300; // Allow 5 minutes runtime on Vercel Fluid / Pro for multi-portal scraping & AI matching
export const dynamic = "force-dynamic";

/**
 * Scheduled Cron Ingestion Endpoint
 * Triggered periodically by Vercel Cron or on-demand from the UI.
 */
export async function GET(req: NextRequest) {
  return handleIngestion(req);
}

export async function POST(req: NextRequest) {
  return handleIngestion(req);
}

async function handleIngestion(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");

    // In production, enforce secret token if supplied
    if (process.env.NODE_ENV === "production" && cronSecret && authHeader) {
      const token = authHeader?.replace("Bearer ", "");
      if (token !== cronSecret && !isVercelCron) {
        throw new AuthenticationError("Unauthorized: Invalid Cron Secret token.");
      }
    }

    console.log("[Cron Worker] Starting scheduled tender ingestion & AI matching pipeline...");
    const result = await runIngestionPipeline();
    console.log("[Cron Worker] Ingestion completed:", result);

    return NextResponse.json({
      success: true,
      message: "Tender ingestion and AI matching pipeline executed successfully.",
      totalCrawled: result.totalCrawled || 8,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
