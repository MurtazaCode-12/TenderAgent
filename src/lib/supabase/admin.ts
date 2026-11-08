import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function isSupabaseAdminConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return false;
  if (
    supabaseUrl.includes("your-project") ||
    supabaseUrl.includes("placeholder") ||
    serviceRoleKey.includes("your-supabase") ||
    serviceRoleKey.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

/**
 * Creates an admin Supabase client with the Service Role Key.
 * Bypasses Row Level Security (RLS).
 * 
 * IMPORTANT: This client must only be used in secure server-side environments 
 * (Vercel Cron jobs, background workers, and internal webhook listeners).
 * Never import or execute this on client-facing code.
 */
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isSupabaseAdminConfigured() || !supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase Admin is not configured with active credentials."
    );
  }

  return createClient<any>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
