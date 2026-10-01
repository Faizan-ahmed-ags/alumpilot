import { Download, TrendingUp } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Card, LinkButton, PageHead, Progress, Stat } from "@/components/ui";
import { computeMonthlyActivity, computeOutcomeDistribution, computeIndustryDemand } from "@/lib/analytics/reports";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const user = await requireRole("ADMIN", "CAREER_TEAM");
  const db = getStore();

  const months = computeMonthlyActivity(db);
  const outcomes = computeOutcomeDistribution(db);
  const industries = computeIndustryDemand(db);
  const maxMonth = Math.max(...months.map((m) => m.count), 1);
  const totalOutcomes = Object.values(outcomes).reduce((a, b) => a + b, 0);
  const mentors = db.alumniProfiles;
  const avgResponse = mentors.length > 0 ? Math.round(mentors.reduce((a, m) => a + m.responseRate, 0) / mentors.length) : 0;

  const goalCompletion = (() => {
    const total = db.goals.length;
    if (total === 0) return 0;
    return Math.round((db.goals.filter((g) => g.status === "COMPLETED").length / total) * 100);
  })();

  const summary = [
    `${db.users.filter((u) => u.role === "STUDENT").length} students and ${mentors.length} alumni mentors are active.`,
    `${db.mentorships.filter((m) => m.status === "ACTIVE").length} mentorships are running, with ${goalCompletion}% of all goals completed.`,
    `Top demand signals: ${industries.slice(0, 3).map((i) => `${i.industry} (${i.count})`).join(", ")}.`,
    totalOutcomes > 0
      ? `${totalOutcomes} career outcomes recorded — ${outcomes.EMPLOYED ?? 0} employed, ${outcomes.INTERNSHIP ?? 0} interns.`
      : "No career outcomes recorded yet.",
  ].join(" ");

  return (
    <AppShell user={user} title="Analytics">
      <PageHead
        eyebrow={user.role === "ADMIN" ? "Administrator" : "Career team"}
        title="Mentorship & career analytics"
        lede="Institutional impact across the full lifecycle — engagement, goals, skills and outcomes. Export everything for accreditation reports."
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <LinkButton href="/api/analytics/export?type=outcomes" variant="secondary" size="sm"><Download size={14} /> Outcomes CSV</LinkButton>
            <LinkButton href="/api/analytics/export?type=engagement" variant="secondary" size="sm"><Download size={14} /> Engagement CSV</LinkButton>
          </div>
        }
      />

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Mentorship participation" value={`${Math.round((new Set(db.mentorships.map((m) => m.studentUserId)).size / Math.max(db.users.filter((u) => u.role === "STUDENT").length, 1)) * 100)}%`} sub="students with a mentorship" accent="brand" />
        <Stat label="Avg. mentor response rate" value={`${avgResponse}%`} />
        <Stat label="Goal completion" value={`${goalCompletion}%`} accent="success" />
        <Stat label="Outcomes recorded" value={String(totalOutcomes)} sub="internships, jobs, studies" />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <Card title="Monthly activity" subtitle="Sessions completed + milestones verified per month (last 6 months)">
          <div className="chart-bars" role="img" aria-label="Bar chart of monthly mentorship activity">
            {months.map((m) => (
              <div key={m.label} className="bar" style={{ height: `${Math.max(6, (m.count / maxMonth) * 100)}%` }} title={`${m.label}: ${m.count}`} />
            ))}
          </div>
          <div className="chart-labels">
            {months.map((m) => <span key={m.label}>{m.label}</span>)}
          </div>
        </Card>

        <Card title="Career outcome distribution" subtitle="All recorded outcomes by type">
          <div className="stack-16">
            {Object.entries(outcomes).length === 0 ? (
              <p style={{ color: "var(--ink-mute)", fontSize: "0.875rem" }}>No outcomes recorded yet.</p>
            ) : (
              Object.entries(outcomes)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="breakdown-row">
                    <div className="row-top">
                      <span>{status.replace(/_/g, " ").toLowerCase()}</span>
                      <strong>{count} · {Math.round((count / totalOutcomes) * 100)}%</strong>
                    </div>
                    <Progress value={(count / totalOutcomes) * 100} tone={status === "EMPLOYED" ? "success" : undefined} />
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Industry demand signals" subtitle="Where student interest and alumni supply overlap">
          <div className="stack-16">
            {industries.map((i) => (
              <div key={i.industry} className="breakdown-row">
                <div className="row-top"><span>{i.industry}</span><strong>{i.studentDemand} students ↔ {i.mentorSupply} mentors</strong></div>
                <Progress value={(i.count / Math.max(...industries.map((x) => x.count), 1)) * 100} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Auto-generated summary" subtitle="Rule-based narrative from the live data above">
          <div className="callout">
            <TrendingUp size={18} />
            <div>
              <strong>This term at a glance</strong>
              <p style={{ margin: "6px 0 0", lineHeight: 1.7 }}>{summary}</p>
            </div>
          </div>
          <p style={{ fontSize: "0.7188rem", color: "var(--ink-mute)", margin: "12px 0 0" }}>
            Generated deterministically from platform data — no external AI service required, nothing invented.
            Department-level drill-downs and date filters are on the roadmap.
          </p>
          <div className="divider" style={{ margin: "16px 0" }} />
          <div className="stack-16">
            <div className="breakdown-row">
              <div className="row-top"><span>Mentor coverage (mentored / students)</span><strong>{new Set(db.mentorships.map((m) => m.studentUserId)).size}/{db.users.filter((u) => u.role === "STUDENT").length}</strong></div>
              <Progress value={(new Set(db.mentorships.map((m) => m.studentUserId)).size / Math.max(db.users.filter((u) => u.role === "STUDENT").length, 1)) * 100} />
            </div>
            <div className="breakdown-row">
              <div className="row-top"><span>Verified mentor supply</span><strong>{mentors.filter((m) => m.mentorshipAvailable).length} accepting requests</strong></div>
              <Progress value={(mentors.filter((m) => m.mentorshipAvailable).length / Math.max(mentors.length, 1)) * 100} tone="success" />
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
