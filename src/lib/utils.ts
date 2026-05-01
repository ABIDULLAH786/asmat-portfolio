import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `item-${Date.now()}`;
}

/**
 * Calculate experience duration between two dates.
 * Returns "1 yr 3 mos", "8 mos", etc.
 */
export function durationBetween(startISO: string, endISO: string | null): string {
  const start = new Date(startISO);
  const end = endISO ? new Date(endISO) : new Date();
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  if (months < 1) months = 1;

  const years = Math.floor(months / 12);
  const rem = months % 12;
  const yPart = years > 0 ? `${years} ${years === 1 ? "yr" : "yrs"}` : "";
  const mPart = rem > 0 ? `${rem} ${rem === 1 ? "mo" : "mos"}` : "";
  return [yPart, mPart].filter(Boolean).join(" ") || "1 mo";
}

export function formatDate(iso: string | null, fallback = "Present"): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
