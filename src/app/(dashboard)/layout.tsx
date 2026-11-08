import React from "react";
import { MainNavigation } from "@/components/layout/main-nav";
import { ToastProvider } from "@/components/ui/toast-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#fbfbfb] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white flex flex-col">
        {/* Minimalist Top Navigation Header */}
        <MainNavigation />

        {/* Generous Whitespace Canvas */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Minimalist Subtle Footer */}
        <footer className="border-t border-slate-200/60 bg-white/50 py-6 text-center text-xs text-slate-400">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>TenderOps AI — Autonomous Government Procurement Engine & WhatsApp SDR</p>
            <p>Built for Contractors on GeM, CPPP & State Portals</p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
