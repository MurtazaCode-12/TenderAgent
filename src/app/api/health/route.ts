import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "TenderOps AI (by MCodes)",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    features: {
      pgvectorSemanticSearch: true,
      whatsAppSDREngine: true,
      aiBidComplianceChecker: true,
      piiMasker: true,
      rateLimiting: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    },
  });
}
