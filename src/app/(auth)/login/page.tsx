import { LoginForm } from "@/components/features/login-form";

export const metadata = {
  title: "Sign In | TenderOps AI",
  description: "Sign in to access your Indian government tender discovery engine and active pipeline.",
};

export default function LoginPage() {
  return (
    <main className="w-full py-8">
      <LoginForm />
    </main>
  );
}
