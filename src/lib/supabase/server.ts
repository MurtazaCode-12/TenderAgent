import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured with valid credentials.");
  }

  return createServerClient<any>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  });
}
