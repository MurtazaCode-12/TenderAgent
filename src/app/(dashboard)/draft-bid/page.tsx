import { getCurrentUser } from "@/actions/auth";
import { db } from "@/lib/db/store";
import { BidPackageGenerator } from "@/components/features/bid-package-generator";

export const dynamic = "force-dynamic";

interface DraftBidPageProps {
  searchParams: Promise<{
    tenderId?: string;
    ref?: string;
    title?: string;
    category?: string;
  }>;
}

export default async function DraftBidPage({ searchParams }: DraftBidPageProps) {
  const resolvedParams = await searchParams;
  const currentUser = await getCurrentUser();

  const companyName = currentUser?.company?.name || currentUser?.user?.company_name || "Apex Infotech Pvt Ltd";
  const directorName = currentUser?.user?.full_name || "Rahul Sharma";

  // Fetch all authentic tenders for selection
  const allTenders = db.getAllTenders();

  const simplifiedTenders = allTenders.map((t) => ({
    id: t.id,
    portal: t.portal,
    tender_ref_number: t.tender_ref_number,
    title: t.title,
    category: t.category,
    authority_name: t.authority_name,
    estimated_value: t.estimated_value,
    emd_amount: t.emd_amount,
    direct_portal_url: t.direct_portal_url,
  }));

  return (
    <div className="space-y-6">
      <BidPackageGenerator
        initialTenderId={resolvedParams.tenderId}
        initialRef={resolvedParams.ref}
        initialTitle={resolvedParams.title}
        initialCategory={resolvedParams.category}
        companyName={companyName}
        directorName={directorName}
        tenders={simplifiedTenders}
      />
    </div>
  );
}
