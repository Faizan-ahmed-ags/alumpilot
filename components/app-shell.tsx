import Link from "next/link";
import {
  Bell, BarChart3, Compass, HeartHandshake, LayoutDashboard, Library,
  LogOut, Route, Sparkles, Target, UserRound, Users,
} from "lucide-react";
import type { User } from "@/lib/db/types";
import { getStore } from "@/lib/db/client";
import { demoLoginAction, logoutAction } from "@/lib/auth/actions";
import { Avatar, cn } from "@/components/ui";

type Role = User["role"];

interface NavDef {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string }>;
  badge?: number;
}

const PERSONAS: Array<{ role: Role; label: string; email: string }> = [
  { role: "STUDENT", label: "Student", email: "student@demo.com" },
  { role: "ALUMNI", label: "Mentor", email: "alumni@demo.com" },
  { role: "ADMIN", label: "Admin", email: "admin@demo.com" },
  { role: "CAREER_TEAM", label: "Career Team", email: "career@demo.com" },
];

const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  ALUMNI: "Alumni Mentor",
  ADMIN: "Administrator",
  CAREER_TEAM: "Career Team",
};

function navFor(role: Role): NavDef[] {
  const db = getStore();
  switch (role) {
    case "STUDENT": {
      return [
        { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/student/onboarding", label: "Profile & Onboarding", icon: UserRound },
        { href: "/mentors", label: "Discover Mentors", icon: Compass },
        { href: "/student/mentorship", label: "Mentorship", icon: HeartHandshake },
        { href: "/student/goals", label: "Goals", icon: Target },
        { href: "/student/journey", label: "Career Journey", icon: Route },
        { href: "/resources", label: "Resources", icon: Library },
      ];
    }
    case "ALUMNI": {
      const me = db.users.find((u) => u.role === "ALUMNI" && u.email === "alumni@demo.com");
      const pending = db.mentorRequests.filter((r) => r.mentorUserId === me?.id && r.status === "PENDING").length;
      return [
        { href: "/alumni/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: pending || undefined },
        { href: "/mentorship", label: "Mentorship Workspace", icon: HeartHandshake },
        { href: "/resources", label: "Resources", icon: Library },
        { href: "/student/journey", label: "Career Journey", icon: Route },
      ];
    }
    case "ADMIN":
      return [
        { href: "/admin/dashboard", label: "Institution Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/resources", label: "Resources", icon: Library },
      ];
    case "CAREER_TEAM":
      return [
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/resources", label: "Resources", icon: Library },
      ];
  }
}

function PersonaSwitcher({ current }: { current: Role | null }) {
  return (
    <div className="persona-bar" role="region" aria-label="Judge mode: switch demo persona">
      <span className="p-label">
        <Sparkles size={12} aria-hidden /> Judge mode
      </span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PERSONAS.map((p) => (
          <form key={p.role} action={demoLoginAction} className="persona-form">
            <input type="hidden" name="role" value={p.role} />
            <button
              type="submit"
              className={cn("persona-btn", current === p.role && "active")}
              title={`Instantly sign in as ${p.label} (${p.email})`}
            >
              {p.label}
            </button>
          </form>
        ))}
      </div>
      <span style={{ marginLeft: "auto", color: "#9ca3af" }}>Password for all demo accounts: demo1234</span>
    </div>
  );
}

export function AppShell({
  user,
  title,
  children,
}: {
  user: User;
  title: string;
  children: React.ReactNode;
}) {
  const db = getStore();
  const nav = navFor(user.role);
  const unread = db.notifications.filter((n) => n.userId === user.id && !n.read).length;

  return (
    <div className="app-frame">
      <PersonaSwitcher current={user.role} />
      <div className="shell">
        <aside className="sidenav">
          <div className="sidenav-brand">
            <div className="brand-mark" aria-hidden>AB</div>
            <div>
              <strong>AlumniBridge</strong>
              <small>Career Development OS</small>
            </div>
          </div>

          <nav className="sidenav-nav" aria-label="Primary">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = title === item.label;
              return (
                <Link key={item.href} href={item.href} className={cn("nav-item", active && "active")} aria-current={active ? "page" : undefined}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                  {item.badge ? <span className="nav-count">{item.badge}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="sidenav-foot">
            <div className="user-chip">
              <Avatar name={user.name} size="sm" />
              <div>
                <div className="u-name">{user.name}</div>
                <div className="u-role">{ROLE_LABEL[user.role]}</div>
              </div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost btn-sm btn-block">
                <LogOut size={14} /> Sign out
              </button>
            </form>
          </div>
        </aside>

        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header className="topbar">
            <span className="crumb">{ROLE_LABEL[user.role]} · {title}</span>
            <div className="topbar-right">
              <Link href="/notifications" className="bell" aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}>
                <Bell size={17} />
                {unread > 0 && <span className="bell-dot">{unread > 9 ? "9+" : unread}</span>}
              </Link>
              <Avatar name={user.name} size="sm" />
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
    </div>
  );
}
