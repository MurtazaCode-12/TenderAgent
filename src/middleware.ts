import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // 1. Rate Limiting for API routes
  if (pathname.startsWith("/api")) {
    // Exempt webhooks and cron from standard user IP rate limits
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

  // 2. Supabase Auth Session Refresh & Route Protection
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isSupabaseReady =
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseAnonKey.includes("your-");

  if (!isSupabaseReady) {
    // If Supabase credentials are placeholder in local development, allow exploratory access
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isDashboardRoute =
      pathname.startsWith("/tenders") ||
      pathname.startsWith("/pipeline") ||
      pathname.startsWith("/compliance") ||
      pathname.startsWith("/settings");

    // Redirect unauthenticated users attempting to access dashboard
    if (!user && isDashboardRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    if (user && isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/tenders";
      return NextResponse.redirect(redirectUrl);
    }
  } catch (authErr) {
    console.warn("[Middleware Auth Check Warning]:", authErr);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
