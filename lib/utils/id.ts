import { randomUUID } from "crypto";

/** Short unique identifier prefix helper. */
export function uid(prefix = "id") {
  return `${prefix}_${randomUUID().slice(0, 18)}`;
}

export function uuid() {
  return randomUUID();
}

/** Reasonably unique numeric-looking string for demo charts. */
export function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}