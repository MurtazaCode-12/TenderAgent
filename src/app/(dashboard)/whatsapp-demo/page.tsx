import { getCurrentUser } from "@/actions/auth";
import { WhatsAppSimulator } from "@/components/features/whatsapp-simulator";

export const dynamic = "force-dynamic";

export default async function WhatsAppDemoPage() {
  const currentUser = await getCurrentUser();
  const phone = currentUser?.user?.phone_number || "+91 98201 44820";

  return (
    <div className="space-y-6">
      <WhatsAppSimulator contractorPhone={phone} />
    </div>
  );
}
