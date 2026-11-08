import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/store";
import { getCurrentUser } from "@/actions/auth";
import { ICPSettingsForm, type ICPSettingsData } from "@/components/features/icp-settings-form";

export const dynamic = "force-dynamic";

const DEFAULT_ICP_DATA: ICPSettingsData = {
  title: "Primary IT & Cloud Bidding ICP",
  target_categories: [
    "Information Technology & Software",
    "Cloud Infrastructure & Data Centers",
    "Cyber Security & Networking",
  ],
  min_tender_value: 5000000, // 50 Lakhs
  max_tender_value: 100000000, // 10 Crores
  preferred_states: ["PAN_INDIA", "Delhi", "Maharashtra", "Karnataka"],
  excluded_keywords: ["Civil Works", "Sanitation", "Road Construction", "Housekeeping"],
  required_certifications: ["MSME / Udyam Registered", "ISO 9001:2015", "ISO 27001", "CMMI Level 3+"],
  min_annual_turnover: 20000000, // 2 Crores
  max_emd_capacity: 2000000, // 20 Lakhs
  icp_summary:
    "We are an enterprise cloud solutions provider, cybersecurity firm, and digital health software integrator bidding on Central & State Government procurements across India with active CMMI-3 and ISO credentials.",
  whatsapp_number: "+91 98765 43210",
  min_match_score: 80,
};

export default async function SettingsPage() {
  let icpData: ICPSettingsData = DEFAULT_ICP_DATA;

  const currentUser = await getCurrentUser();
  const companyId = currentUser?.company?.id || "00000000-0000-0000-0000-000000000001";

  // 1. Check Database Store
  const localIcp = db.getCompanyICP(companyId);
  if (localIcp) {
    icpData = {
      title: localIcp.title,
      target_categories: localIcp.target_categories || DEFAULT_ICP_DATA.target_categories,
      min_tender_value: localIcp.min_tender_value ?? 0,
      max_tender_value: localIcp.max_tender_value ?? null,
      preferred_states: localIcp.preferred_states || DEFAULT_ICP_DATA.preferred_states,
      excluded_keywords: localIcp.excluded_keywords || [],
      required_certifications: localIcp.required_certifications || [],
      min_annual_turnover: localIcp.min_annual_turnover ?? 0,
      max_emd_capacity: localIcp.max_emd_capacity ?? null,
      icp_summary: localIcp.icp_summary || DEFAULT_ICP_DATA.icp_summary,
      whatsapp_number: currentUser?.user?.phone_number || "+91 98765 43210",
      min_match_score: 80,
    };
  } else {
    // 2. Check Supabase
    try {
      const supabase = await createServerSupabaseClient();
      const { data: existingIcp } = await (supabase
        .from("company_icps") as any)
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (existingIcp) {
        icpData = {
          title: (existingIcp as any).title,
          target_categories: (existingIcp as any).target_categories || DEFAULT_ICP_DATA.target_categories,
          min_tender_value: (existingIcp as any).min_tender_value ?? 0,
          max_tender_value: (existingIcp as any).max_tender_value ?? null,
          preferred_states: (existingIcp as any).preferred_states || DEFAULT_ICP_DATA.preferred_states,
          excluded_keywords: (existingIcp as any).excluded_keywords || [],
          required_certifications: (existingIcp as any).required_certifications || [],
          min_annual_turnover: (existingIcp as any).min_annual_turnover ?? 0,
          max_emd_capacity: (existingIcp as any).max_emd_capacity ?? null,
          icp_summary: (existingIcp as any).icp_summary || DEFAULT_ICP_DATA.icp_summary,
          whatsapp_number: "+91 98765 43210",
          min_match_score: 80,
        };
      }
    } catch (err) {
      // Non-blocking
    }
  }

  return <ICPSettingsForm initialData={icpData} />;
}
