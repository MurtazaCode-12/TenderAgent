import { createBrowserClient } from "@supabase/ssr";

/**
 * Checks whether Supabase has real, active credentials configured.
 * Returns false for default placeholders to prevent 7-10s network hanging.
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (
    supabaseUrl.includes("your-project") ||
    supabaseUrl.includes("placeholder") ||
    supabaseUrl.includes("example.com") ||
    supabaseAnonKey.includes("your-supabase") ||
    supabaseAnonKey.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

/**
 * Creates a Supabase client for client-side components.
 * Enforces Row Level Security based on the user's logged-in session.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured with valid credentials.");
  }

  return createBrowserClient<any>(supabaseUrl, supabaseAnonKey);
}
