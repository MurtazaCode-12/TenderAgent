import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes cleanly with clsx and twMerge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numeric values to Indian Rupee denomination (Crores, Lakhs, Thousands, or INR).
 * Example: 15000000 -> ₹1.50 Cr, 450000 -> ₹4.50 Lakh, 50000 -> ₹50,000
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Not Disclosed / Refer RFP";
  }

  if (amount === 0) {
    return "₹0.00";
  }

  const absAmount = Math.abs(amount);

  if (absAmount >= 10000000) {
    // Crores
    const inCrores = amount / 10000000;
    return `₹${inCrores.toFixed(2)} Cr`;
  }

  if (absAmount >= 100000) {
    // Lakhs
    const inLakhs = amount / 100000;
    return `₹${inLakhs.toFixed(2)} Lakh`;
  }

  // Standard Indian comma separator
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string into a standard readable Indian tender format
 * Example: "14 Nov 2026, 03:00 PM IST"
 */
export function formatTenderDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "TBD / Refer Notice";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Returns color classes and qualitative label based on an AI Match Score (0 - 100)
 */
export function getScoreBadge(score: number): {
  color: string;
  bgColor: string;
  label: string;
} {
  if (score >= 85) {
    return {
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800",
      label: "Strong Match",
    };
  }
  if (score >= 70) {
    return {
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800",
      label: "Moderate Match",
    };
  }
  if (score >= 50) {
    return {
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800",
      label: "Marginal Fit",
    };
  }
  return {
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800",
    label: "Low Relevance",
  };
}

/**
 * Calculates days remaining until a deadline
 */
export function getDaysRemaining(deadline: string | Date): {
  days: number;
  isUrgent: boolean;
  label: string;
} {
  const target = typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, isUrgent: true, label: "Closed / Expired" };
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isUrgent = days <= 3;

  return {
    days,
    isUrgent,
    label: days === 1 ? "1 day left" : `${days} days left`,
  };
}
