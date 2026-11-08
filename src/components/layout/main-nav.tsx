"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react";

interface MainNavProps {
  user?: {
    full_name?: string;
    email?: string;
    company_name?: string;
    username?: string;
  } | null;
  company?: {
    name?: string;
    legal_name?: string;
  } | null;
}

const PRIMARY_NAV = [
  {
    href: "/tenders",
    label: "Discovery",
    icon: Compass,
    liveDot: true,
  },
  {
    href: "/pipeline",
    label: "Pipeline",
    icon: KanbanSquare,
  },
  {
    href: "/draft-bid",
    label: "Bid Drafter",
    icon: FileText,
  },
  {
    href: "/compliance",
    label: "Compliance",
    icon: FileCheck2,
  },
];

export function MainNavigation({ user, company }: MainNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const companyName = company?.name || user?.company_name || "Contractor Co";
  const fullName = user?.full_name || user?.username || "Contractor";
  const initial = (companyName[0] || fullName[0] || "C").toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-2xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/tenders" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition group-hover:bg-emerald-600">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-center">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                TenderOps
              </span>
              <span className="ml-1.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                AI SDR
              </span>
            </div>
          </Link>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const isActive =
                pathname === item.href || (item.href === "/tenders" && pathname === "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive ? "text-emerald-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.liveDot && !isActive && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Right Utility Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* WhatsApp SDR Live Button */}
          <Link
            href="/whatsapp-demo"
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              pathname === "/whatsapp-demo"
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800"
            }`}
            title="Open Interactive WhatsApp SDR Simulation"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp SDR</span>
          </Link>

          {/* Profile & Settings Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              aria-label="User account menu"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white text-[11px] shadow-inner">
                {initial}
              </div>
              <span className="max-w-[110px] truncate font-semibold text-slate-900">
                {companyName}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Floating Dropdown Card */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white text-xs shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        <span>{companyName}</span>
                        <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{fullName}</div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-0.5 text-xs">
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    <Sliders className="h-4 w-4 text-slate-400" />
                    <span>Profile & ICP Settings</span>
                  </Link>

                  <Link
                    href="/whatsapp-demo"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp Alerts Demo</span>
                  </Link>

                  <Link
                    href="/draft-bid"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span>AI Statutory Annexures</span>
                  </Link>
                </div>

                {/* Divider & Sign Out */}
                <div className="mt-1 pt-1 border-t border-slate-100">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 5. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-3 animate-in fade-in slide-in-from-top-1">
          {/* User Profile Card on Mobile */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white text-xs shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{companyName}</div>
              <div className="text-[11px] text-slate-500 truncate">{fullName}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {[
              ...PRIMARY_NAV,
              {
                href: "/whatsapp-demo",
                label: "WhatsApp SDR Live",
                icon: Smartphone,
              },
              {
                href: "/settings",
                label: "Profile & ICP Settings",
                icon: Sliders,
              },
            ].map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-emerald-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sign Out Button on Mobile */}
          <div className="pt-2 border-t border-slate-100">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
