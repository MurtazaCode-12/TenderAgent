import Link from "next/link";
import { signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Join TenderOps AI
          </h1>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            by MCodes
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Automate tender discovery, daily WhatsApp alerts, and AI bid compliance
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Contractor Account</CardTitle>
            <CardDescription>Setup your company and WhatsApp SDR profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signUpAction} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Full Name
                  </label>
                  <Input name="fullName" placeholder="e.g. Rahul Sharma" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Company Legal Name
                  </label>
                  <Input name="companyName" placeholder="e.g. Apex Infotech Pvt Ltd" required />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Business Email
                  </label>
                  <Input name="email" type="email" placeholder="bids@apexinfotech.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    WhatsApp Phone (+91)
                  </label>
                  <Input name="phoneNumber" placeholder="+919876543210" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <Input name="password" type="password" placeholder="Create a strong password" required />
              </div>

              <Button type="submit" className="w-full mt-2">
                Create Account & Configure ICP <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
