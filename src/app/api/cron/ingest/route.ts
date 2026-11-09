import { NextRequest } from "next/server";
import { GET as handlerGet, POST as handlerPost } from "../ingest-tenders/route";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handlerGet(req);
}

export async function POST(req: NextRequest) {
  return handlerPost(req);
}
