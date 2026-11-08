"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/tenders");
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const companyName = formData.get("companyName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (!email || !password || !fullName || !companyName || !phoneNumber) {
    return { error: "All fields are required." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create account." };
  }

  // Create company & user profile
  const { data: company, error: compErr } = await supabase
    .from("companies")
    .insert({
      name: companyName,
      legal_name: companyName,
    })
    .select("id")
    .single();

  if (compErr || !company) {
    return { error: "Failed to create company profile." };
  }

  const { error: profileErr } = await supabase.from("profiles").insert({
    id: authData.user.id,
    company_id: company.id,
    full_name: fullName,
    email,
    phone_number: phoneNumber,
    role: "owner",
    whatsapp_notifications_enabled: true,
  });

  if (profileErr) {
    return { error: "Failed to initialize user profile." };
  }

  redirect("/settings");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
