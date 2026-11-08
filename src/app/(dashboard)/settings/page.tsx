import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ICPSettingsForm, type ICPSettingsData } from "@/components/features/icp-settings-form";

export const dynamic = "force-dynamic";

const DEFAULT_ICP_DATA: ICPSettingsData = {
  title: "Primary IT & Cloud Bidding ICP",
  target_categories: [
    "Information Technology & Software",
    "Cloud Infrastructure & Data Centers",
    "Cyber Security & Firewalls",
  ],
  min_tender_value: 5000000, // 50 Lakhs
  max_tender_value: 100000000, // 10 Crores
  preferred_states: ["PAN_INDIA", "Delhi", "Maharashtra", "Karnataka"],
  excluded_keywords: ["Civil Works", "Sanitation", "Road Construction", "Housekeeping"],
  required_certifications: ["MSME / Udyam", "ISO 9001", "ISO 27001", "CMMI Level 3"],
  min_annual_turnover: 20000000, // 2 Crores
  max_emd_capacity: 2000000, // 20 Lakhs
  icp_summary:
    "We are an enterprise cloud solutions provider, cybersecurity firm, and digital health software integrator bidding on Central & State Government procurements across India with active CMMI-3 and ISO credentials.",
  whatsapp_number: "+91 98765 43210",
  min_match_score: 80,
};

export default async function SettingsPage() {
  let icpData: ICPSettingsData = DEFAULT_ICP_DATA;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    let companyId = "00000000-0000-0000-0000-000000000001";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.company_id) {
        companyId = profile.company_id;
      }
    }

    const { data: existingIcp } = await supabase
      .from("company_icps")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();

    if (existingIcp) {
      icpData = {
        title: existingIcp.title,
        target_categories: existingIcp.target_categories || DEFAULT_ICP_DATA.target_categories,
        min_tender_value: existingIcp.min_tender_value ?? 0,
        max_tender_value: existingIcp.max_tender_value ?? null,
        preferred_states: existingIcp.preferred_states || DEFAULT_ICP_DATA.preferred_states,
        excluded_keywords: existingIcp.excluded_keywords || [],
        required_certifications: existingIcp.required_certifications || [],
        min_annual_turnover: existingIcp.min_annual_turnover ?? 0,
        max_emd_capacity: existingIcp.max_emd_capacity ?? null,
        icp_summary: existingIcp.icp_summary || DEFAULT_ICP_DATA.icp_summary,
        whatsapp_number: "+91 98765 43210",
        min_match_score: 80,
      };
    }
  } catch (err) {
    console.warn("Using default ICP configuration:", err);
  }

  return <ICPSettingsForm initialData={icpData} />;
}
