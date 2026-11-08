import { RegisterForm } from "@/components/features/register-form";

export const metadata = {
  title: "Create Contractor Profile | TenderOps AI",
  description: "Configure industry and credentials to crawl live tenders across GeM, CPPP, and State Portals.",
};

export default function RegisterPage() {
  return (
    <main className="w-full py-8">
      <RegisterForm />
    </main>
  );
}
