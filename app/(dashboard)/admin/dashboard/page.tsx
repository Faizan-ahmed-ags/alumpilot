import { AlertTriangle, GraduationCap, HeartHandshake, TrendingUp, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Card, EmptyState, LinkButton, PageHead, Progress, Stat, StatusBadge, fmtDate, timeAgo } from "@/components/ui";

export const metadata = { title: "Institution dashboard" };

const OUTCOME_LABELS: Record<string, string> = {
  INTERNSHIP: "Internship",
  EMPLOYED: "Employed",
  HIGHER_STUDIES: "Higher studies",
  ENTREPRENEUR: "Entrepreneurship",
  SEEKING_OPPORTUNITY: "Seeking opportunity",
  STUDENT: "Student",
};

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");
  const db = getStore();

  const students = db.users.filter((u) => u.role === "STUDENT");
  const studentProfiles = db.studentProfiles;
  const mentors = db.alumniProfiles.filter((a) => a.isMentor && a.verified);
  const activeMentorships = db.mentorships.filter((m) => m.status === "ACTIVE");
  const completedMentorships = db.mentorships.filter((m) => m.status === "COMPLETED");
  const requests = db.mentorRequests;
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const goals = db.goals;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const outcomes = db.careerOutcomes;
  const avgReadiness = studentProfiles.length > 0
    ? Math.round(studentProfiles.reduce((a, p) => a + p.readinessIndex, 0) / studentProfiles.length)
    : 0;

  // Funnel: students -> onboarded -> with mentor -> with goals -> with outcome
  const onboarded = studentProfiles.filter((p) => p.onboardingCompleted).length;
  const withMentor = new Set(activeMentorships.map((m) => m.studentUserId)).size;
  const withGoals = new Set(goals.map((g) => g.studentUserId)).size;
  const withOutcome = new Set(outcomes.map((c) => c.studentUserId)).size;

  // Early intervention — operational SUPPORT indicators (never evaluation)
  const now = Date.now();
  const attention: Array<{ name: string; dept: string; reasons: string[]; userId: string }> = [];
  for (const sp of studentProfiles) {
    const u = db.users.find((x) => x.id === sp.userId)!;
    const reasons: string[] = [];
    const hasMentor = db.mentorships.some((m) => m.studentUserId === sp.userId && m.status === "ACTIVE");
    if (!hasMentor && sp.onboardingCompleted) reasons.push("No active mentor");
    if (!sp.onboardingCompleted) reasons.push(`Onboarding at step ${sp.onboardingStep}/8`);
    if (sp.profileCompleteness < 70) reasons.push(`Profile ${sp.profileCompleteness}% complete`);
    const myGoals = db.goals.filter((g) => g.studentUserId === sp.userId);
    if (myGoals.some((g) => g.status !== "COMPLETED" && new Date(g.targetDate).getTime() < now)) {
      reasons.push("Overdue goal");
    }
    const lastGoalUpdate = myGoals.length > 0 ? Math.max(...myGoals.map((g) => g.updatedAt)) : null;
    if (lastGoalUpdate && now - new Date(lastGoalUpdate).getTime() > 21 * 86_400_000) {
      reasons.push("No progress update in 3+ weeks");
    }
    if (reasons.length >= 2) attention.push({ name: u.name, dept: db.departments.find((d) => d.id === sp.departmentId)?.code ?? "—", reasons, userId: sp.userId });
  }

  // Department outcomes
  const deptStats = db.departments.map((d) => {
    const sps = studentProfiles.filter((p) => p.departmentId === d.id);
    const outcomesFor = outcomes.filter((o) => sps.some((s) => s.userId === o.studentUserId));
    const positive = outcomesFor.filter((o) => ["INTERNSHIP", "EMPLOYED", "HIGHER_STUDIES", "ENTREPRENEUR"].includes(o.status)).length;
    return {
      dept: d,
      students: sps.length,
      mentored: sps.filter((s) => db.mentorships.some((m) => m.studentUserId === s.userId)).length,
      positiveOutcomes: positive,
      avgReadiness: sps.length > 0 ? Math.round(sps.reduce((a, p) => a + p.readinessIndex, 0) / sps.length) : 0,
    };
  });

  return (
    <AppShell user={user} title="Institution Dashboard">
      <PageHead
        eyebrow="Administrator"
        title="Institution dashboard"
        lede={`${db.meta.institutionName} · aggregate view across all mentorship activity. Individual records stay private to students and their mentors.`}
        action={<LinkButton href="/admin/analytics" variant="secondary" size="sm">Open analytics</LinkButton>}
      />

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Students" value={String(students.length)} sub={`${onboarded} onboarded`} accent="brand" />
        <Stat label="Verified mentors" value={String(mentors.length)} sub={`${pendingRequests.length} requests pending network-wide`} />
        <Stat label="Active mentorships" value={String(activeMentorships.length)} sub={`${completedMentorships.length} completed`} accent="success" />
        <Stat label="Avg. readiness" value={`${avgReadiness}%`} sub="Informational composite" />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Mentorship funnel */}
        <Card title="Mentorship funnel" subtitle="Where students are in the structured journey">
          <div className="stack-16">
            {[
              { label: "Students registered", value: students.length, total: students.length },
              { label: "Completed onboarding", value: onboarded, total: students.length },
              { label: "Matched with a mentor", value: withMentor, total: students.length },
              { label: "Working on goals", value: withGoals, total: students.length },
              { label: "Career outcome recorded", value: withOutcome, total: students.length },
            ].map((row) => (
              <div key={row.label} className="breakdown-row">
                <div className="row-top">
                  <span>{row.label}</span>
                  <strong>{row.value}{row.total > 0 && ` · ${Math.round((row.value / row.total) * 100)}%`}</strong>
                </div>
                <Progress value={row.total > 0 ? (row.value / row.total) * 100 : 0} />
              </div>
            ))}
          </div>
        </Card>

        {/* Early intervention */}
        <Card
          title="Students needing support"
          subtitle="Operational indicators for proactive outreach — never an evaluation of ability"
        >
          {attention.length === 0 ? (
            <EmptyState icon={<HeartHandshake size={28} />} title="Everyone is on track" hint="No students currently show multiple support indicators." />
          ) : (
            <div className="row-list" style={{ margin: "-20px" }}>
              {attention.map((a) => (
                <div key={a.userId} className="row-item" style={{ alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Avatar name={a.name} size="sm" />
                    <div>
                      <div className="row-title">{a.name} <span className="chip" style={{ marginLeft: 6 }}>{a.dept}</span></div>
                      <div className="row-sub">{a.reasons.join(" · ")}</div>
                    </div>
                  </div>
                  <span className="badge badge-warning"><AlertTriangle size={12} /> outreach</span>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: "0.7188rem", color: "var(--ink-mute)", margin: "12px 0 0" }}>
            Indicators: no mentor, incomplete onboarding/profile, overdue goal, or no recent progress.
            Designed for mentorship support, in line with the responsible-AI principles — no rankings, no labels on student records.
          </p>
        </Card>
      </div>

      <div className="grid-2">
        {/* Department outcomes */}
        <Card title="Department outcomes" subtitle="Mentorship coverage and positive career outcomes">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Department</th><th>Students</th><th>Mentored</th><th>Positive outcomes</th><th>Avg. readiness</th></tr>
              </thead>
              <tbody>
                {deptStats.map((row) => (
                  <tr key={row.dept.id}>
                    <td><strong>{row.dept.code}</strong> <span style={{ color: "var(--ink-mute)" }}>{row.dept.name}</span></td>
                    <td>{row.students}</td>
                    <td>{row.mentored}</td>
                    <td>{row.positiveOutcomes}</td>
                    <td>{row.avgReadiness}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent outcomes */}
        <Card title="Recent career outcomes" subtitle="Recorded by students, aggregated for the institution">
          {outcomes.length === 0 ? (
            <EmptyState icon={<GraduationCap size={28} />} title="No outcomes recorded yet" hint="When students record internships or jobs, they appear here as institutional impact." />
          ) : (
            <div className="row-list" style={{ margin: "-20px" }}>
              {outcomes
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                .slice(0, 6)
                .map((o) => {
                  const u = db.users.find((x) => x.id === o.studentUserId);
                  return (
                    <div key={o.id} className="row-item">
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Avatar name={u?.name ?? "?"} size="sm" />
                        <div>
                          <div className="row-title">{u?.name}</div>
                          <div className="row-sub">
                            {o.company ? `${o.company} · ${o.role ?? ""}` : OUTCOME_LABELS[o.status]}
                            {o.industry ? ` · ${o.industry}` : ""}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 4, justifyItems: "end" }}>
                        <StatusBadge status={o.status} />
                        <small style={{ color: "var(--ink-mute)", fontSize: "0.7188rem" }}>{timeAgo(o.updatedAt)}</small>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
