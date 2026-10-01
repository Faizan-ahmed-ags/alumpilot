import Link from "next/link";
import type { ReactNode } from "react";
import { demoPersonas } from "@/components/demo-data";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  active?: "student" | "alumni" | "admin" | "career";
}

export function DemoBar({ active = "student" }: { active?: "student" | "alumni" | "admin" | "career" }) {
  return (
    <div className="demo-bar">
      <div className="demo-bar-title">
        <span className="eyebrow dark">Judge mode</span>
      </div>
      <div className="persona-switcher">
        {demoPersonas.map((persona) => (
          <Link
            key={persona.id}
            href={
              persona.id === "student"
                ? "/student/dashboard"
                : persona.id === "alumni"
                  ? "/alumni/impact"
                  : persona.id === "admin"
                    ? "/admin/dashboard"
                    : "/admin/analytics"
            }
            className={active === persona.id ? "demo-persona active" : "demo-persona"}
          >
            <span>{persona.label}</span>
            <small>{persona.name}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DashboardShell({ title, subtitle, children, active = "student" }: DashboardShellProps) {
  const nav = {
    student: [
      ["Dashboard", "/student/dashboard"],
      ["Onboarding", "/student/onboarding"],
      ["Mentorship", "/student/mentorship"],
      ["Goals", "/student/goals"],
      ["Journey", "/student/journey"],
    ],
    alumni: [["Impact", "/alumni/impact"], ["Mentorship", "/student/mentorship"], ["Mentors", "/mentors"]],
    admin: [["Dashboard", "/admin/dashboard"], ["Analytics", "/admin/analytics"], ["Resources", "/resources"]],
    career: [["Dashboard", "/admin/analytics"], ["Resources", "/resources"], ["Mentors", "/mentors"]],
  } as const;

  return (
    <div className="dashboard-shell">
      <DemoBar active={active} />
      <div className="dashboard-body">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">A</div>
            <div>
              <strong>AlumniBridge</strong>
              <small>Career OS</small>
            </div>
          </div>

          <nav className="sidebar-nav">
            {nav[active].map(([label, href]) => (
              <Link key={href} href={href} className="nav-item">
                {label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-card">
            <span className="mini-label">Focus</span>
            <strong>{title}</strong>
            <p>{subtitle}</p>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="page-header">
            <div>
              <span className="eyebrow dark">Overview</span>
              <h1>{title}</h1>
            </div>
            <Link href="/" className="ghost-button small-button">
              Back to home
            </Link>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export function MetricCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "warning" }) {
  return (
    <div className={`metric-card tone-${tone}`}>
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-card">
      <div className="section-card-head">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-wrap">
      <div className="progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}
