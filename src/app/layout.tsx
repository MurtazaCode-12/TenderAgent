import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenderOps AI (by MCodes) - AI Procurement Engine & WhatsApp SDR",
  description: "End-to-end AI procurement engine, tender discovery, and WhatsApp SDR for Indian government contractors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
