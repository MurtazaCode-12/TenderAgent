"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/store";
import { searchLiveGovernmentTenders } from "@/lib/ingestion/search";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

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
  const fullName = (
    (formData.get("full_name") as string) ||
    (formData.get("fullName") as string) ||
    ""
  ).trim();
  const companyName = (
    (formData.get("company_name") as string) ||
    (formData.get("companyName") as string) ||
    ""
  ).trim();
  const phoneNumber = (
    (formData.get("phone_number") as string) ||
    (formData.get("phoneNumber") as string) ||
    ""
  ).trim();

  // Industry & targeting attributes
  const rawCategories = (formData.get("trades") as string) || (formData.get("targetCategories") as string) || "";
  const rawStates = (formData.get("preferred_states") as string) || (formData.get("preferredStates") as string) || "";
  const rawCerts = (formData.get("certifications") as string) || "";
  const minTenderValue = Number(formData.get("min_tender_value") || formData.get("minTenderValue") || 0);
  const maxTenderValue = (formData.get("max_tender_value") || formData.get("maxTenderValue"))
    ? Number(formData.get("max_tender_value") || formData.get("maxTenderValue"))
    : null;
  const summary = ((formData.get("summary") as string) || "").trim();

  if (!username || !email || !password || !fullName || !companyName) {
    return { error: "Please fill in all required fields (username, email, password, full name, company name)." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  let targetCategories: string[] = [];
  if (rawCategories) {
    try {
      if (rawCategories.trim().startsWith("[")) {
        targetCategories = JSON.parse(rawCategories);
      } else {
        targetCategories = rawCategories.split(",").map((c) => c.trim()).filter(Boolean);
      }
    } catch {
      targetCategories = rawCategories.split(",").map((c) => c.trim()).filter(Boolean);
    }
  }

  if (targetCategories.length === 0) {
    targetCategories.push("Metro Rail & Mass Transit", "Government Offices & Buildings", "Civil Infrastructure & Works");
  }

  let preferredStates: string[] = [];
  if (rawStates) {
    try {
      if (rawStates.trim().startsWith("[")) {
        preferredStates = JSON.parse(rawStates);
      } else {
        preferredStates = rawStates.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      preferredStates = rawStates.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  let certifications: string[] = [];
  if (rawCerts) {
    try {
      if (rawCerts.trim().startsWith("[")) {
        certifications = JSON.parse(rawCerts);
      } else {
        certifications = rawCerts.split(",").map((c) => c.trim()).filter(Boolean);
      }
    } catch {
      certifications = rawCerts.split(",").map((c) => c.trim()).filter(Boolean);
    }
  }

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
      summary: summary || `Contractor enterprise specializing in ${targetCategories.join(", ")}`,
    });

    // 2. Also register in Supabase if active
    if (isSupabaseConfigured()) {
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

    // 4. Background portal crawler (fire-and-forget, non-blocking)
    searchLiveGovernmentTenders({
      targetCategories,
      preferredStates,
      minTenderValue,
      maxTenderValue,
      certifications,
      keywords: summary ? summary.split(" ") : [],
    }).catch((ingestErr) => {
      console.warn("[searchLiveGovernmentTenders background warning]:", ingestErr);
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
  const user = db.verifyUserPassword(identifier, password);
  if (user) {
    const session = db.createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return {
      success: true,
      redirectUrl: "/tenders",
    };
  }

  // 2. Also check Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (!error && data.user) {
        return {
          success: true,
          redirectUrl: "/tenders",
        };
      }
    } catch (sbErr) {
      // Fallback
    }
  }

  return { error: "Invalid username/email or password. Please try again." };
}

/**
 * Signs out current user session.
 */
export async function signOutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      db.deleteSession(token);
      cookieStore.delete(SESSION_COOKIE_NAME);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.auth.signOut();
      } catch (err) {
        // Fallback
      }
    }
  } catch (err) {
    console.warn("[signOutAction warning]:", err);
  }

  redirect("/login");
}

/**
 * Retrieves the currently authenticated user and company profile.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const session = db.getSession(token);
      if (session) {
        const user = db.getUserById(session.user_id);
        const company = user ? db.getUserCompany(user.id) : null;
        const icp = company ? db.getCompanyICP(company.id) : null;
        return { user, company, icp };
      }
    }

    // Fallback to Supabase if local session not present
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const {
          data: { user: sbUser },
        } = await supabase.auth.getUser();

        if (sbUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*, company:companies(*, company_icps(*))")
            .eq("id", sbUser.id)
            .single();

          if (profile) {
            return {
              user: {
                id: profile.id,
                username: profile.email.split("@")[0],
                email: profile.email,
                full_name: profile.full_name,
                company_name: (profile as any).company?.name || "Contractor Org",
                phone_number: profile.phone_number || "",
                created_at: profile.created_at,
              },
              company: (profile as any).company,
              icp: (profile as any).company?.company_icps?.[0],
            };
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    // Default demo contractor if no session exists yet
    const allUsers = db.getAllUsers();
    if (allUsers.length > 0) {
      const user = allUsers[0];
      const company = db.getUserCompany(user.id);
      const icp = company ? db.getCompanyICP(company.id) : null;
      return { user, company, icp };
    }

    return null;
  } catch (err) {
    console.warn("[getCurrentUser warning]:", err);
    return null;
  }
}
