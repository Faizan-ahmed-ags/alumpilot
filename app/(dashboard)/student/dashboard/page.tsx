import { redirect } from "next/navigation";
import { ArrowRight, CalendarClock, CheckCircle2, Compass, Sparkles, Target } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Card, EmptyState, LinkButton, PageHead, Progress, Ring, Stat, StatusBadge, fmtDateTime, timeAgo } from "@/components/ui";
import { nextBestAction } from "@/lib/ai";
import { calculateMatchScore } from "@/lib/matching/engine";

export const metadata = { title: "Student dashboard" };

export default async function StudentDashboard() {
  const user = await requireRole("STUDENT");
  if (!user) redirect("/login");
  const db = getStore();
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  const myMentorships = db.mentorships.filter((m) => m.studentUserId === user.id);
  const active = myMentorships.find((m) => m.status === "ACTIVE");
  const myGoals = db.goals.filter((g) => g.studentUserId === user.id);
  const openGoals = myGoals.filter((g) => g.status !== "COMPLETED");
  const upcoming = active
    ? db.sessions
        .filter((s) => s.mentorshipId === active.id && s.status === "SCHEDULED")
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0]
    : undefined;
  const unreadFeedback = db.feedback.filter((f) => f.studentUserId === user.id).length;
  const outcome = db.careerOutcomes.find((c) => c.studentUserId === user.id);

  const next = nextBestAction({
    hasMentor: Boolean(active),
    onboardingDone: profile?.onboardingCompleted ?? false,
    openGoals: openGoals.length,
    hasOutcome: Boolean(outcome),
    unreadFeedback: 0,
    upcomingSession: upcoming
      ? { title: upcoming.title, when: fmtDateTime(upcoming.scheduledAt), href: active ? "/mentorship" : "/student/mentorship" }
      : undefined,
  });

  // Recommended mentors (deterministic match, top 3)
  const recommended = db.alumniProfiles
    .filter((a) => a.isMentor && a.mentorshipAvailable)
    .map((a) => {
      const mentorUser = db.users.find((u) => u.id === a.userId);
      return { profile: a, user: mentorUser, match: profile ? calculateMatchScore(profile, a).score : 0 };
    })
    .sort((x, y) => y.match - x.match)
    .slice(0, 3);

  const recent = db.activity.filter((a) => a.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const breakdown = profile?.readinessBreakdown ?? {};
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell user={user} title="Dashboard">
      <PageHead
        eyebrow="Student"
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        lede="Let's move your career forward. Here's where you stand today."
      />

      {!profile?.onboardingCompleted && (
        <div className="callout warn" style={{ marginBottom: 20 }}>
          <Sparkles size={18} />
          <div>
            <strong>Finish your career profile</strong>
            <p>You're on step {profile?.onboardingStep ?? 1} of 8. A complete profile unlocks better matches and your readiness baseline.</p>
          </div>
          <LinkButton href="/student/onboarding" variant="secondary" size="sm">Continue</LinkButton>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Readiness index" value={`${profile?.readinessIndex ?? 0}%`} sub="Informational — see breakdown" accent="brand" />
        <Stat label="Profile completeness" value={`${profile?.profileCompleteness ?? 0}%`} sub={profile?.onboardingCompleted ? "Profile complete" : "Onboarding in progress"} />
        <Stat label="Active mentorship" value={active ? "1" : "0"} sub={active ? `with ${db.users.find((u) => u.id === active.mentorUserId)?.name}` : "Find a mentor"} accent={active ? "success" : "warning"} />
        <Stat label="Open goals" value={String(openGoals.length)} sub={`${myGoals.length - openGoals.length} completed`} />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <Card
          title="Recommended next action"
          subtitle="The one thing that moves you forward today"
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div className="callout">
              <Target size={18} />
              <div>
                <strong>{next.label}</strong>
                <p>{next.detail}</p>
              </div>
            </div>
            <LinkButton href={next.href}>{next.cta} <ArrowRight size={15} /></LinkButton>
          </div>
        </Card>

        <Card title="Career readiness" subtitle="AlumniBridge Readiness Index — informational only">
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
            <Ring value={profile?.readinessIndex ?? 0} label="Readiness" />
            <div className="stack-16">
              {Object.entries({
                Skills: breakdown.skills ?? 0,
                Projects: breakdown.projects ?? 0,
                Mentorship: breakdown.mentorship ?? 0,
                Goals: breakdown.goals ?? 0,
                "Interview prep": breakdown.interview ?? 0,
                Profile: breakdown.profile ?? 0,
              }).map(([k, v]) => (
                <div className="breakdown-row" key={k}>
                  <div className="row-top"><span>{k}</span><strong>{v}%</strong></div>
                  <Progress value={v as number} />
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--ink-mute)", margin: "14px 0 0" }}>
            Computed from skill levels, goal progress, session attendance and profile completeness.
            It's a private signal for you and your mentors — never a public ranking.
          </p>
        </Card>
      </div>

      {active ? (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <Card title="Active mentorship" subtitle={`Started ${timeAgo(active.startedAt)}`}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <Avatar name={db.users.find((u) => u.id === active.mentorUserId)?.name ?? "Mentor"} />
              <div>
                <strong style={{ display: "block" }}>{db.users.find((u) => u.id === active.mentorUserId)?.name}</strong>
                <small style={{ color: "var(--ink-mute)" }}>
                  {(() => {
                    const mp = db.alumniProfiles.find((a) => a.userId === active.mentorUserId);
                    return mp ? `${mp.role} · ${mp.company}` : "Alumni mentor";
                  })()}
                </small>
              </div>
            </div>
            <div className="breakdown-row" style={{ marginBottom: 14 }}>
              <div className="row-top"><span>Mentorship progress</span><strong>{active.progress}%</strong></div>
              <Progress value={active.progress} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <LinkButton href="/mentorship" variant="primary" size="sm">Open workspace</LinkButton>
              {upcoming && (
                <span className="badge badge-brand"><CalendarClock size={13} /> Next: {upcoming.title} · {fmtDateTime(upcoming.scheduledAt)}</span>
              )}
            </div>
          </Card>

          <Card title="Upcoming sessions" subtitle="Prepared beats spontaneous">
            {db.sessions.filter((s) => s.mentorshipId === active.id && s.status === "SCHEDULED").length === 0 ? (
              <EmptyState icon={<CalendarClock size={28} />} title="No sessions scheduled" hint="Ask your mentor for the next 45-minute session, or schedule one from the workspace." />
            ) : (
              <div className="row-list" style={{ margin: "-20px" }}>
                {db.sessions
                  .filter((s) => s.mentorshipId === active.id && s.status === "SCHEDULED")
                  .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
                  .map((s) => (
                    <div key={s.id} className="row-item">
                      <div>
                        <div className="row-title">{s.title}</div>
                        <div className="row-sub">{fmtDateTime(s.scheduledAt)} · {s.durationMinutes} min · {s.mode}</div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <Card title="Find your mentor" subtitle="Transparent matches from your profile" className="span-2">
            {profile?.onboardingCompleted ? (
              <div className="grid-3">
                {recommended.map(({ profile: a, user: mu, match }) => (
                  <div key={a.id} className="card mentor-card" style={{ boxShadow: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Avatar name={mu?.name ?? "Mentor"} />
                      <span className="match-pill">{match}%</span>
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.9rem" }}>{mu?.name}</strong>
                      <small style={{ color: "var(--ink-mute)" }}>{a.role} · {a.company}</small>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <LinkButton href={`/mentors/${a.userId}`} variant="secondary" size="sm">View</LinkButton>
                      <LinkButton href={`/mentors/${a.userId}?request=1`} size="sm">Request</LinkButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Compass size={28} />}
                title="Complete onboarding to unlock matches"
                hint="Your target roles, skills and topics drive the matching score."
                action={<LinkButton href="/student/onboarding" size="sm">Continue onboarding</LinkButton>}
              />
            )}
          </Card>
        </div>
      )}

      <div className="grid-2">
        <Card title="Recent activity" subtitle="Your mentorship momentum">
          {recent.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={28} />} title="Nothing yet" hint="Your milestone completions and sessions will appear here." />
          ) : (
            <div className="row-list" style={{ margin: "-20px" }}>
              {recent.map((a) => (
                <div key={a.id} className="row-item">
                  <div>
                    <div className="row-title">{a.description}</div>
                    <div className="row-sub">{timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Your career journey" subtitle="Where you are in the loop">
          <div className="timeline">
            {[
              { s: "Profile created", done: true },
              { s: "Mentor matched", done: Boolean(active) },
              { s: "First session completed", done: db.sessions.some((s) => myMentorships.some((m) => m.id === s.mentorshipId) && s.status === "COMPLETED") },
              { s: "First goal completed", done: myGoals.some((g) => g.status === "COMPLETED") },
              { s: "Career outcome recorded", done: Boolean(outcome) },
              { s: "Return as alumni mentor", done: false },
            ].map((item) => (
              <div key={item.s} className={`t-item ${item.done ? "done" : ""}`}>
                <span className="t-dot"><CheckCircle2 size={14} /></span>
                <div className="t-body">
                  <strong>{item.s}</strong>
                  <small>{item.done ? "Completed" : "Upcoming"}</small>
                </div>
              </div>
            ))}
          </div>
          <LinkButton href="/student/journey" variant="ghost" size="sm">View full journey</LinkButton>
        </Card>
      </div>
    </AppShell>
  );
}
