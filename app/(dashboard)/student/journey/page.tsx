import { Award, Briefcase, CheckCircle2, GraduationCap, Route, Send } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageHead, Ring, Stat, StatusBadge, fmtDate } from "@/components/ui";
import { CareerOutcomeForm } from "./outcome-form";

export const metadata = { title: "Career journey" };

export default async function StudentJourneyPage() {
  const user = await requireRole("STUDENT");
  const db = getStore();
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  const mentorships = db.mentorships.filter((m) => m.studentUserId === user.id);
  const goals = db.goals.filter((g) => g.studentUserId === user.id);
  const doneGoals = goals.filter((g) => g.status === "COMPLETED");
  const milestones = db.milestones.filter((m) => goals.some((g) => g.id === m.goalId));
  const doneMilestones = milestones.filter((m) => m.status === "DONE" && m.evidence);
  const sessions = db.sessions.filter((s) => mentorships.some((m) => m.id === s.mentorshipId && s.status === "COMPLETED"));
  const outcome = db.careerOutcomes.find((c) => c.studentUserId === user.id);

  const timeline: Array<{ label: string; sub: string; done: boolean; current?: boolean }> = [
    { label: "Profile created", sub: profile ? fmtDate(profile.createdAt) : "", done: Boolean(profile?.headline) },
    { label: "Onboarding completed", sub: "Readiness baseline computed", done: profile?.onboardingCompleted ?? false },
    { label: "Mentor matched", sub: mentorships.length > 0 ? `${mentorships.length} mentorship${mentorships.length > 1 ? "s" : ""}` : "Find a mentor to continue", done: mentorships.length > 0, current: mentorships.length === 0 },
    { label: "First session completed", sub: sessions.length > 0 ? `${sessions.length} completed` : "Sessions appear here", done: sessions.length > 0 },
    { label: "First mentor-verified goal", sub: doneGoals.some((g) => g.mentorVerified) ? "Verified evidence on record" : "Complete a goal with mentor verification", done: doneGoals.some((g) => g.mentorVerified) },
    { label: "Portfolio milestone shipped", sub: doneMilestones.length > 0 ? `${doneMilestones.length} verified milestone${doneMilestones.length > 1 ? "s" : ""}` : "Ship work your mentor can verify", done: doneMilestones.length > 0 },
    { label: "Career outcome recorded", sub: outcome ? outcomeLabel(outcome.status) : "Tell the institution where you landed", done: Boolean(outcome), current: !outcome },
    { label: "Graduation & beyond", sub: "Your journey becomes part of institutional impact", done: false },
    { label: "Return as an alumni mentor", sub: "The network continues with you", done: false },
  ];

  return (
    <AppShell user={user} title="Career Journey">
      <PageHead
        eyebrow="Student"
        title="Your career journey"
        lede="One timeline from first login to your outcome — and eventually back as a mentor yourself."
      />

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Readiness index" value={`${profile?.readinessIndex ?? 0}%`} accent="brand" />
        <Stat label="Goals completed" value={String(doneGoals.length)} sub={`${goals.length} total`} />
        <Stat label="Verified milestones" value={String(doneMilestones.length)} accent="success" />
        <Stat label="Sessions completed" value={String(sessions.length)} />
      </div>

      <div className="grid-2">
        <Card title="Journey timeline" subtitle="Auto-built from your real platform activity">
          <div className="timeline">
            {timeline.map((item) => (
              <div key={item.label} className={`t-item ${item.done ? "done" : item.current ? "current" : ""}`}>
                <span className="t-dot"><CheckCircle2 size={14} /></span>
                <div className="t-body">
                  <strong>{item.label}</strong>
                  <small>{item.done ? item.sub : item.sub}</small>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="stack-16">
          <Card title="Career outcome" subtitle="Private by default — institutions see aggregate statistics only">
            <CareerOutcomeForm
              industries={db.industries}
              initial={
                outcome
                  ? {
                      status: outcome.status,
                      company: outcome.company ?? "",
                      role: outcome.role ?? "",
                      industry: outcome.industry ?? "",
                      location: outcome.location ?? "",
                      joiningDate: outcome.joiningDate?.slice(0, 10) ?? "",
                      salaryRange: outcome.salaryRange ?? "",
                      internshipDuration: outcome.internshipDuration ?? "",
                      higherEducation: outcome.higherEducation ?? "",
                    }
                  : undefined
              }
            />
          </Card>

          <Card title="Achievements" subtitle="Evidence-backed records from your mentorship">
            {doneMilestones.length === 0 && doneGoals.length === 0 && sessions.length === 0 ? (
              <EmptyState icon={<Award size={28} />} title="No achievements yet" hint="Verified milestones, completed goals and finished sessions collect here as durable evidence." />
            ) : (
              <div className="row-list" style={{ margin: "-20px" }}>
                {doneMilestones.map((m) => (
                  <div key={m.id} className="row-item">
                    <div>
                      <div className="row-title">🏆 Milestone: {m.title}</div>
                      <div className="row-sub">Verified evidence · {m.completedAt ? fmtDate(m.completedAt) : ""}</div>
                    </div>
                    <span className="badge badge-success">verified</span>
                  </div>
                ))}
                {doneGoals.map((g) => (
                  <div key={g.id} className="row-item">
                    <div>
                      <div className="row-title">🎯 Goal: {g.title}</div>
                      <div className="row-sub">Mentor {g.mentorVerified ? "verified" : "completion"} · {fmtDate(g.updatedAt)}</div>
                    </div>
                    <span className="badge badge-success">done</span>
                  </div>
                ))}
                {sessions.slice(0, 3).map((s) => (
                  <div key={s.id} className="row-item">
                    <div>
                      <div className="row-title">🎙 Session: {s.title}</div>
                      <div className="row-sub">{fmtDate(s.scheduledAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {outcome && (
            <Card title="Current outcome" subtitle="Recorded — thank you for closing the loop">
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <StatusBadge status={outcome.status} />
                {outcome.company && <strong>{outcome.company}</strong>}
                {outcome.role && <span style={{ color: "var(--ink-mute)", fontSize: "0.8438rem" }}>{outcome.role}</span>}
                {outcome.industry && <span className="chip">{outcome.industry}</span>}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--ink-mute)", margin: "10px 0 0" }}>
                Aggregate, de-identified outcome data powers your institution's placement analytics.
                Salary-range and similar details are optional and never shown to other students.
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function outcomeLabel(status: string): string {
  switch (status) {
    case "INTERNSHIP": return "Internship recorded";
    case "EMPLOYED": return "Employment recorded";
    case "HIGHER_STUDIES": return "Higher studies recorded";
    case "ENTREPRENEUR": return "Venture recorded";
    case "SEEKING_OPPORTUNITY": return "Actively seeking — support available";
    default: return "Student";
  }
}
