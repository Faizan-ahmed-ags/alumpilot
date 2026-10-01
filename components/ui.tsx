import type { ReactNode } from "react";
import Link from "next/link";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Badges ---------------- */

export function Badge({
  tone = "neutral",
  children,
  dot = false,
}: {
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={cn("badge", `badge-${tone}`)}>
      {dot && <span className="dot" aria-hidden />}
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, "brand" | "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "warning",
  ACCEPTED: "brand",
  DECLINED: "danger",
  COMPLETED: "success",
  ACTIVE: "success",
  PAUSED: "neutral",
  IN_PROGRESS: "brand",
  AT_RISK: "warning",
  OVERDUE: "danger",
  TODO: "neutral",
  NOT_STARTED: "neutral",
  SCHEDULED: "brand",
  CANCELLED: "danger",
  DONE: "success",
  INTERNSHIP: "brand",
  EMPLOYED: "success",
  HIGHER_STUDIES: "brand",
  ENTREPRENEUR: "brand",
  SEEKING_OPPORTUNITY: "warning",
  STUDENT: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? "neutral";
  return <Badge tone={tone}>{status.replace(/_/g, " ").toLowerCase()}</Badge>;
}

/* ---------------- Cards & stats ---------------- */

export function Card({
  title,
  subtitle,
  action,
  children,
  className,
  flush = false,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section className={cn("card", className)}>
      {title && (
        <div className="card-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="sub">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={flush ? "card-body-flush" : "card-body"}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: "default" | "brand" | "success" | "warning";
}) {
  const cls = accent === "default" ? "" : `stat-${accent}`;
  return (
    <div className={cn("card stat", cls)}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

export function Progress({ value, tone }: { value: number; tone?: "success" | "warning" }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn("progress", tone === "success" && "progress-success", tone === "warning" && "progress-warning")}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function Ring({ value, size = "lg", label }: { value: number; size?: "lg" | "sm"; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const deg = Math.round((v / 100) * 360);
  const color = v >= 70 ? "#16a34a" : v >= 40 ? "#4f46e5" : "#d97706";
  const dims = size === "lg" ? "132px" : "84px";
  return (
    <div
      className={cn("ring", size === "sm" && "ring-sm")}
      role="img"
      aria-label={`${label ?? "Score"}: ${v} out of 100`}
      style={{ background: `conic-gradient(${color} 0deg ${deg}deg, #eaecf0 ${deg}deg 360deg)`, width: dims, height: dims }}
    >
      <span>{v}%</span>
    </div>
  );
}

/* ---------------- States ---------------- */

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon}
      <strong>{title}</strong>
      <p>{hint}</p>
      {action}
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed", "#db2777"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  const bg = colors[h % colors.length];
  return (
    <span className={cn("avatar", size === "lg" && "avatar-lg", size === "sm" && "avatar-sm")} style={{ background: bg }} aria-hidden>
      {initials || "?"}
    </span>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const cls = cn(
    "btn",
    `btn-${variant}`,
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg"
  );
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
