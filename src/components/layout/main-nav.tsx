"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import {
  Compass,
  KanbanSquare,
  Sliders,
  FileCheck2,
  Smartphone,
  LogOut,
  Menu,
  X,
  Sparkles,
  FileText,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/tenders",
    label: "Discovery Feed",
    icon: Compass,
    badge: "Live",
  },
  {
    href: "/draft-bid",
    label: "AI Bid Drafter",
    icon: FileText,
  },
  {
    href: "/pipeline",
    label: "My Pipeline",
    icon: KanbanSquare,
  },
  {
    href: "/compliance",
    label: "AI Compliance",
    icon: FileCheck2,
  },
  {
    href: "/whatsapp-demo",
    label: "WhatsApp SDR",
    icon: Smartphone,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Sliders,
  },
];

export function MainNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-8">
          <Link href="/tenders" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition group-hover:bg-emerald-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                TenderOps
              </span>
              <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                AI SDR
              </span>
            </div>
          </Link>

          {/* Desktop Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href === "/tenders" && pathname === "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? "text-emerald-700 bg-emerald-50/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: WhatsApp SDR status & User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* WhatsApp SDR Live Indicator */}
          <Link
            href="/whatsapp-demo"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-emerald-50/80 hover:border-emerald-200 px-3 py-1 text-xs font-medium text-slate-700 hover:text-emerald-800 shadow-sm transition"
            title="Open Interactive WhatsApp SDR Simulation"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp SDR Live</span>
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WhatsApp Alerts Connected</span>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
