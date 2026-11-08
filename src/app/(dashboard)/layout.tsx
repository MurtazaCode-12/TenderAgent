import React from "react";
import { MainNavigation } from "@/components/layout/main-nav";
import { ToastProvider } from "@/components/ui/toast-context";
import { getCurrentUser } from "@/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#fbfbfb] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white flex flex-col">
        {/* Minimalist Top Navigation Header */}
        <MainNavigation user={currentUser?.user} company={currentUser?.company} />

        {/* Generous Whitespace Canvas */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Minimalist Subtle Footer */}
        <footer className="border-t border-slate-200/60 bg-white/60 py-6 text-center text-xs text-slate-400">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-slate-500">
              TenderOps AI — Autonomous Government Procurement Engine & WhatsApp SDR
            </p>
            <p className="text-slate-400">
              Live Listings across GeM, CPPP & State Portals
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
