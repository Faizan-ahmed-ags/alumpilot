import Link from "next/link";
import { CheckCircle2, Target } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, LinkButton, PageHead, Progress, Stat, StatusBadge, fmtDate } from "@/components/ui";
import { LEVEL_LABELS, skillById } from "@/lib/db/compute";

export const metadata = { title: "Goals" };

export default async function StudentGoalsPage() {
  const user = await requireRole("STUDENT");
  const db = getStore();
  const goals = db.goals.filter((g) => g.studentUserId === user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  const done = goals.filter((g) => g.status === "COMPLETED").length;

  return (
    <AppShell user={user} title="Goals">
      <PageHead
        eyebrow="Student"
        title="Goals & milestones"
        lede="Measurable goals turn mentorship conversations into verified progress."
        action={<LinkButton href="/mentorship" size="sm">Create a goal in the workspace</LinkButton>}
      />

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Active goals" value={String(goals.length - done)} />
        <Stat label="Completed" value={String(done)} accent="success" />
        <Stat label="Mentor-verified" value={String(goals.filter((g) => g.mentorVerified).length)} accent="brand" />
        <Stat label="Readiness index" value={`${profile?.readinessIndex ?? 0}%`} sub="Updates with goal progress" />
      </div>

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Target size={28} />}
            title="No goals yet"
            hint="Goals are created inside your mentorship workspace — usually together with your mentor. Each goal can have milestones with evidence your mentor verifies."
            action={<LinkButton href="/mentors" size="sm">Find a mentor first</LinkButton>}
          />
        </Card>
      ) : (
        <div className="stack-16">
          {goals.map((goal) => {
            const milestones = db.milestones.filter((m) => m.goalId === goal.id);
            const mentor = db.users.find((u) => u.id === goal.mentorUserId);
            const overdue = new Date(goal.targetDate).getTime() < Date.now() && goal.status !== "COMPLETED";
            return (
              <Card key={goal.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  <div>
                    <strong style={{ fontSize: "0.9375rem" }}>{goal.title}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--ink-mute)", marginTop: 3 }}>
                      {goal.category} · target {fmtDate(goal.targetDate)} · mentor {mentor?.name ?? "unassigned"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {goal.mentorVerified && <span className="badge badge-success"><CheckCircle2 size={12} /> mentor verified</span>}
                    <StatusBadge status={overdue && goal.status !== "COMPLETED" ? "AT_RISK" : goal.status} />
                  </div>
                </div>
                {goal.description && <p style={{ fontSize: "0.8438rem", margin: "0 0 12px" }}>{goal.description}</p>}
                <div className="breakdown-row">
                  <div className="row-top"><span>Progress</span><strong>{goal.progress}%</strong></div>
                  <Progress value={goal.progress} tone={goal.status === "COMPLETED" ? "success" : undefined} />
                </div>
                {milestones.length > 0 && (
                  <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                    {milestones.map((m) => (
                      <li key={m.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.8438rem" }}>
                        <CheckCircle2 size={15} style={{ color: m.status === "DONE" ? "var(--success)" : "var(--ink-faint)", flex: "0 0 auto", marginTop: 2 }} />
                        <span>
                          {m.title}
                          {m.evidence && <small style={{ display: "block", color: "var(--ink-mute)" }}>Evidence: {m.evidence}</small>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {profile && profile.skills.length > 0 && (
        <Card title="Skill development" subtitle="Self-assessed levels vs. your targets — updated as goals complete" className="mt-20">
          <div className="stack-16" style={{ marginTop: 4 }}>
            {profile.skills.map((s) => {
              const skill = skillById(db.skills, s.skillId);
              const pct = Math.round((s.level / 5) * 100);
              return (
                <div className="breakdown-row" key={s.skillId}>
                  <div className="row-top">
                    <span>{skill?.name ?? s.skillId} <small style={{ color: "var(--ink-mute)" }}>· now {LEVEL_LABELS[s.level]} → target {LEVEL_LABELS[s.targetLevel]}</small></span>
                    <strong>{pct}%</strong>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </AppShell>
  );
}
