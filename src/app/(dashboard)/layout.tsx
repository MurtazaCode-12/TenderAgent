import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import {
  ShieldCheck,
  Compass,
  KanbanSquare,
  FileCheck2,
  Sliders,
  LogOut,
  Smartphone,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                TenderOps AI
              </span>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                by MCodes
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 p-4">
            <Link
              href="/tenders"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Compass className="h-4 w-4 text-emerald-600" />
              Tender Discovery Feed
            </Link>

            <Link
              href="/pipeline"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <KanbanSquare className="h-4 w-4 text-emerald-600" />
              Bid Pipeline Kanban
            </Link>

            <Link
              href="/compliance"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
              AI Bid Compliance
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Sliders className="h-4 w-4 text-emerald-600" />
              ICP & WhatsApp Config
            </Link>
          </nav>
        </div>

        {/* WhatsApp SDR Status & Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 space-y-4">
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5" /> WhatsApp SDR Active
              </span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
              Matching GeM & CPPP bids daily
            </p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
