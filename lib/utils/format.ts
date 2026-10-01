/** Shared display helpers. */

const initialsCache = new Map<string, string>();

export function initials(name: string) {
  const cached = initialsCache.get(name);
  if (cached) return cached;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value =
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : `${(parts[0] ?? "?").slice(0, 2)}`;
  const result = value.toUpperCase();
  initialsCache.set(name, result);
  return result;
}

const AVATAR_COLORS = [
  "bg-brand-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-cyan-700",
  "bg-indigo-500",
];

export function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatExperienceYears(years: number) {
  return years >= 1 ? `${years} yr${years > 1 ? "s" : ""}` : "<1 yr";
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}