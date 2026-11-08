import React from "react";
import { ToastProvider } from "@/components/ui/toast-context";
import { ThemeToggle } from "@/components/theme/theme-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white flex flex-col justify-center relative transition-colors duration-200">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </ToastProvider>
  );
}
