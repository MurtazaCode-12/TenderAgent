import React from "react";
import { ToastProvider } from "@/components/ui/toast-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white flex flex-col justify-center">
        {children}
      </div>
    </ToastProvider>
  );
}
