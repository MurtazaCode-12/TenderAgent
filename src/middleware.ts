import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

const SESSION_COOKIE_NAME = "tenderops_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // 1. Rate Limiting for API routes
  if (pathname.startsWith("/api")) {
    const isWebhook = pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/cron");
    if (!isWebhook) {
      const isAI = pathname.startsWith("/api/compliance");
      const { success } = await checkRateLimit(ip, isAI);

      if (!success) {
        return NextResponse.json(
          {
            error: "Too many requests. Please slow down and try again.",
            code: "RATE_LIMIT_EXCEEDED",
          },
          { status: 429 }
        );
      }
    }
  }

  // 2. Authentication and Onboarding Gate Check
  const hasAppSession = request.cookies.has(SESSION_COOKIE_NAME);
  // Also check for Supabase auth cookie if present
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  const isAuthenticated = hasAppSession || hasSupabaseCookie;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/onboarding");
  const isDashboardRoute =
    pathname === "/" ||
    pathname.startsWith("/tenders") ||
    pathname.startsWith("/draft-bid") ||
    pathname.startsWith("/whatsapp-demo") ||
    pathname.startsWith("/pipeline") ||
    pathname.startsWith("/compliance") ||
    pathname.startsWith("/settings");

  // If root "/" and authenticated -> redirect to /tenders
  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAuthenticated ? "/tenders" : "/register";
    return NextResponse.redirect(redirectUrl);
  }

  // If unauthenticated trying to access any dashboard route -> Redirect to /register (Profile Setup)
  if (!isAuthenticated && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/register";
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated user tries to visit /login or /register -> Redirect to /tenders
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/tenders";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
