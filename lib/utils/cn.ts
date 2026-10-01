import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a percent string. */
export function pct(value: number, digits = 0) {
  return `${Math.round(value * 10 ** digits) / 10 ** digits}%`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}