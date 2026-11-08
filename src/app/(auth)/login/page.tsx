import { LoginForm } from "@/components/features/login-form";

export const metadata = {
  title: "Sign In | TenderOps AI",
  description: "Sign in to access your Indian government tender discovery engine and active pipeline.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
