import { createServerSupabaseClient } from "@/lib/supabase/server";
import { saveICPAction } from "@/actions/icp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sliders, Smartphone, Sparkles, ShieldCheck, Check } from "lucide-react";

export default async function SettingsPage() {
  let icpData = {
    title: "Primary IT & Cloud Bidding ICP",
    target_categories: "Information Technology, Cloud Infrastructure, Cyber Security, Software Development",
    min_tender_value: 5000000, // 50 Lakhs
    max_tender_value: 100000000, // 10 Crores
    preferred_states: "Delhi, Maharashtra, Karnataka, PAN_INDIA",
    excluded_keywords: "Civil Works, Sanitation, Road Construction, Housekeeping",
    required_certifications: "ISO 9001, ISO 27001, CMMI Level 3, MSME",
    min_annual_turnover: 20000000, // 2 Crores
    max_emd_capacity: 2000000, // 20 Lakhs
    icp_summary: "We are an enterprise cloud solutions provider, cybersecurity firm, and digital health software integrator bidding on Central & State Government procurements.",
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        const { data: existingIcp } = await supabase
          .from("company_icps")
          .select("*")
          .eq("company_id", profile.company_id)
          .maybeSingle();

        if (existingIcp) {
          icpData = {
            title: existingIcp.title,
            target_categories: existingIcp.target_categories.join(", "),
            min_tender_value: existingIcp.min_tender_value,
            max_tender_value: existingIcp.max_tender_value || 0,
            preferred_states: existingIcp.preferred_states.join(", "),
            excluded_keywords: existingIcp.excluded_keywords.join(", "),
            required_certifications: existingIcp.required_certifications.join(", "),
            min_annual_turnover: existingIcp.min_annual_turnover || 0,
            max_emd_capacity: existingIcp.max_emd_capacity || 0,
            icp_summary: existingIcp.icp_summary || "",
          };
        }
      }
    }
  } catch (err) {
    console.warn("Using default ICP parameters:", err);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="h-6 w-6 text-emerald-600" />
          Ideal Customer Profile (ICP) & WhatsApp SDR
        </h1>
        <p className="text-sm text-slate-500">
          Configure matching parameters, vector search preferences, and WhatsApp alert thresholds.
        </p>
      </div>

      <form action={saveICPAction} className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bidding Capabilities & Category Targeting</CardTitle>
            <CardDescription>
              TenderOps AI compares all daily GeM, CPPP, and State Portal notices against these exact rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                ICP Configuration Title
              </label>
              <Input name="title" defaultValue={icpData.title} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Target Procurement Categories (comma separated)
              </label>
              <Input
                name="target_categories"
                defaultValue={icpData.target_categories}
                placeholder="e.g. Information Technology, Cloud Infrastructure, Data Center"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Minimum Tender Value (INR)
                </label>
                <Input
                  name="min_tender_value"
                  type="number"
                  defaultValue={icpData.min_tender_value}
                  placeholder="5000000"
                />
                <span className="text-[11px] text-slate-500">e.g. ₹50,00,000 (50 Lakhs)</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Maximum Tender Value (INR)
                </label>
                <Input
                  name="max_tender_value"
                  type="number"
                  defaultValue={icpData.max_tender_value}
                  placeholder="100000000"
                />
                <span className="text-[11px] text-slate-500">e.g. ₹10,00,00,000 (10 Crores)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Preferred Operating States
                </label>
                <Input
                  name="preferred_states"
                  defaultValue={icpData.preferred_states}
                  placeholder="e.g. Maharashtra, Delhi, PAN_INDIA"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Excluded Domain Keywords (Zero-Match Penalty)
                </label>
                <Input
                  name="excluded_keywords"
                  defaultValue={icpData.excluded_keywords}
                  placeholder="e.g. Civil, Sanitation, Construction"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Company Certifications & Empanelments
              </label>
              <Input
                name="required_certifications"
                defaultValue={icpData.required_certifications}
                placeholder="e.g. ISO 9001, ISO 27001, CMMI Level 3, MSME"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Core Competencies & Track Record Summary (pgvector Semantic Embedding)
                </label>
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-600" /> Embedded to 1536-dim vector
                </Badge>
              </div>
              <textarea
                name="icp_summary"
                rows={4}
                defaultValue={icpData.icp_summary}
                className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Describe past completed government projects, technical team certifications, and target RFPs..."
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp SDR Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                  WhatsApp SDR Real-Time Delivery Settings
                </CardTitle>
                <CardDescription>
                  Configure automated alert triggers delivered directly to contractor mobile devices.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-600 text-white">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Score Threshold Filter
                </p>
                <p className="text-xs text-slate-500">
                  Only dispatch WhatsApp alerts when composite relevance score is &ge; 80%
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-emerald-600">
                80% Minimum
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Interactive Quick Actions
                </p>
                <p className="text-xs text-slate-500">
                  Include &ldquo;Save to Pipeline&rdquo; and &ldquo;Check Compliance&rdquo; one-tap buttons
                </p>
              </div>
              <Check className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Save ICP & Recompute Embeddings
          </Button>
        </div>
      </form>
    </div>
  );
}
