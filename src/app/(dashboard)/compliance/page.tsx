import { ComplianceCheckerUI } from "@/components/features/compliance-checker";

interface PageProps {
  searchParams: Promise<{
    tenderId?: string;
    title?: string;
  }>;
}

export default async function CompliancePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI Bid Compliance Engine
        </h1>
        <p className="text-sm text-slate-500">
          Upload drafted bids to scan for missing annexures, EMD exemptions, and clerical disqualifiers.
        </p>
      </div>

      <ComplianceCheckerUI
        initialTenderId={resolvedParams.tenderId}
        initialTitle={resolvedParams.title}
      />
    </div>
  );
}
