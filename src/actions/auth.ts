"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/store";
import { searchLiveGovernmentTenders } from "@/lib/ingestion/search";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
}

const SESSION_COOKIE_NAME = "tenderops_session";

/**
 * Creates contractor profile with credentials, company info, and industry targeting.
 * Immediately scans live government portals (GeM, CPPP, State) for matching tenders.
 */
export async function registerContractorProfile(formData: FormData): Promise<AuthActionResult> {
  const username = ((formData.get("username") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim();
  const password = ((formData.get("password") as string) || "").trim();
  const fullName = ((formData.get("fullName") as string) || "").trim();
  const companyName = ((formData.get("companyName") as string) || "").trim();
  const phoneNumber = ((formData.get("phoneNumber") as string) || "").trim();

  // Industry & targeting attributes
  const rawCategories = (formData.get("targetCategories") as string) || "";
  const rawStates = (formData.get("preferredStates") as string) || "";
  const rawCerts = (formData.get("certifications") as string) || "";
  const minTenderValue = Number(formData.get("minTenderValue") || 0);
  const maxTenderValue = formData.get("maxTenderValue") ? Number(formData.get("maxTenderValue")) : null;
  const summary = ((formData.get("summary") as string) || "").trim();

  if (!username || !email || !password || !fullName || !companyName) {
    return { error: "Please fill in all required fields (username, email, password, full name, company name)." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const targetCategories = rawCategories
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (targetCategories.length === 0) {
    targetCategories.push("Information Technology & Software");
  }

  const preferredStates = rawStates
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const certifications = rawCerts
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  try {
    // 1. Save contractor profile & company ICP in Database Store
    const { user, company, icp } = db.createUser({
      username,
      email,
      password,
      fullName,
      companyName,
      phoneNumber: phoneNumber || "+91 98765 43210",
      targetCategories,
      minTenderValue,
      maxTenderValue,
      preferredStates: preferredStates.length > 0 ? preferredStates : ["PAN_INDIA"],
      certifications,
      summary: summary || `Enterprise contractor specializing in ${targetCategories.join(", ")}`,
    });

    // 2. Also register in Supabase if active
    try {
      const supabase = await createServerSupabaseClient();
      const { data: sbAuth } = await supabase.auth.signUp({
        email,
        password,
      });

      if (sbAuth.user) {
        await (supabase.from("companies") as any).insert({
          id: company.id,
          name: companyName,
          legal_name: companyName,
        });

        await (supabase.from("profiles") as any).insert({
          id: sbAuth.user.id,
          company_id: company.id,
          full_name: fullName,
          email,
          phone_number: phoneNumber,
          role: "owner",
          whatsapp_notifications_enabled: true,
        });

        await (supabase.from("company_icps") as any).insert({
          company_id: company.id,
          title: icp.title,
          target_categories: icp.target_categories,
          min_tender_value: icp.min_tender_value,
          max_tender_value: icp.max_tender_value,
          preferred_states: icp.preferred_states,
          required_certifications: icp.required_certifications,
          icp_summary: icp.icp_summary,
        });
      }
    } catch (sbErr) {
      // Non-blocking fallback
    }

    // 3. Establish persistent HTTP-only session cookie
    const session = db.createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // 4. Immediately trigger live search across government portals (GeM, CPPP, State Portals)
    await searchLiveGovernmentTenders({
      targetCategories,
      preferredStates,
      minTenderValue,
      maxTenderValue,
      certifications,
      keywords: summary ? summary.split(" ") : [],
    });

    return {
      success: true,
      redirectUrl: "/tenders?welcome=true",
    };
  } catch (err: any) {
    console.error("[registerContractorProfile error]:", err);
    return { error: err.message || "Failed to create profile. Please try again." };
  }
}

/**
 * Authenticates existing user with username/email & password.
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const identifier = ((formData.get("email") as string) || (formData.get("username") as string) || "").trim();
  const password = ((formData.get("password") as string) || "").trim();

  if (!identifier || !password) {
    return { error: "Please enter your username/email and password." };
  }

  // 1. Verify in local database store
  const user = db.getUserByEmailOrUsername(identifier);
  if (user) {
    const valid = db.verifyPassword(user, password);
    if (!valid) {
      return { error: "Incorrect password. Please try again." };
    }

    const session = db.createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    redirect("/tenders");
  }

  // 2. Check Supabase
  try {
    const supabase = await createServerSupabaseClient();
    const { error: sbErr } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (!sbErr) {
      redirect("/tenders");
    }
  } catch (err) {
    // fall through
  }

  return { error: "No account found with these credentials. Please check your spelling or register a new profile." };
}

/**
 * Signs the user out and clears session cookies.
 */
export async function signOutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    db.deleteSession(token);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch (err) {
    // non-blocking
  }

  redirect("/login");
}

/**
 * Server-side helper to get the currently authenticated user.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const session = db.getSession(token);
    if (session) {
      return db.getUserProfileByUserId(session.user_id);
    }
  }

  // Supabase fallback
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await (supabase
        .from("profiles") as any)
        .select("*, companies(*), company_icps(*)")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        return {
          user: {
            id: user.id,
            username: user.email?.split("@")[0] || "contractor",
            email: user.email || "",
            password_hash: "",
            full_name: (profile as any).full_name,
            company_name: (profile as any).companies?.name || "Contractor Co",
            phone_number: (profile as any).phone_number || "",
            created_at: (profile as any).created_at,
          },
          company: (profile as any).companies,
          icp: (profile as any).company_icps?.[0] || null,
        };
      }
    }
  } catch (err) {
    // non-blocking
  }

  return null;
}
