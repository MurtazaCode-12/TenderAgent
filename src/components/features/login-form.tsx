"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction } from "@/actions/auth";
import { ShieldCheck, ArrowRight, Loader2, Eye, EyeOff, Lock, User } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("email", identifier);
    formData.append("password", password);

    startTransition(async () => {
      try {
        const res = await signInAction(formData);
        if (res?.error) {
          setErrorMessage(res.error);
        } else {
          router.push("/tenders");
          router.refresh();
        }
      } catch (err: any) {
        // In Next.js Server Actions, redirect() throws a NEXT_REDIRECT error which is expected
        if (err.message && err.message.includes("NEXT_REDIRECT")) {
          return;
        }
        setErrorMessage(err.message || "Sign in failed. Please check your credentials.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          Sign In to TenderOps AI
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          by MCodes • India Procurement Engine
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Access your live government tenders, active bid pipeline, and WhatsApp SDR alerts
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Username or Business Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. apex_bids or rahul@domain.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need to set up a new contractor profile?{" "}
          <Link href="/register" className="font-bold text-emerald-600 hover:underline">
            Create Profile & Search Live Tenders
          </Link>
        </div>
      </div>
    </div>
  );
}
