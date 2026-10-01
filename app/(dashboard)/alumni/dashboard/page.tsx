import { CalendarClock, CheckCircle2, HeartHandshake, Sparkles, TrendingUp, XCircle } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Card, EmptyState, LinkButton, PageHead, Progress, Stat, StatusBadge, fmtDateTime, timeAgo } from "@/components/ui";
import { respondToRequestAction } from "@/lib/mentorship/actions";

export const metadata = { title: "Alumni dashboard" };

export default async function AlumniDashboardPage() {
  const user = await requireRole("ALUMNI");
  const db = getStore();
  const profile = db.alumniProfiles.find((a) => a.userId === user.id);

  const pending = db.mentorRequests
    .filter((r) => r.mentorUserId === user.id && r.status === "PENDING")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const activeMentorships = db.mentorships.filter((m) => m.mentorUserId === user.id && m.status === "ACTIVE");
  const myRequests = db.mentorRequests.filter((r) => r.mentorUserId === user.id);
  const upcoming = db.sessions
    .filter((s) => activeMentorships.some((m) => m.id === s.mentorshipId) && s.status === "SCHEDULED")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const totals = {
    students: profile?.studentsMentored ?? 0,
    sessions: profile?.sessionsCompleted ?? 0,
    goals: profile?.goalsCompleted ?? 0,
    referrals: profile?.referralsMade ?? 0,
  };

  return (
    <AppShell user={user} title="Dashboard">
      <PageHead
        eyebrow="Alumni mentor"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        lede={pending.length > 0 ? `${pending.length} student request${pending.length > 1 ? "s" : ""} awaiting your response.` : "You're all caught up. Your mentees are in good hands."}
      />

      {/* My impact */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <Stat label="Students mentored" value={String(totals.students)} accent="brand" />
        <Stat label="Sessions completed" value={String(totals.sessions)} />
        <Stat label="Goals completed (all time)" value={String(totals.goals)} accent="success" />
        <Stat label="Referrals made" value={String(totals.referrals)} />
      </div>

      {/* Request inbox */}
      <Card
        title="Mentorship requests"
        subtitle="Every request includes the student's goal, message and availability — accept with one click"
      >
        {pending.length === 0 ? (
          <EmptyState
            icon={<HeartHandshake size={28} />}
            title="No pending requests"
            hint="When students request your mentorship, you'll see their full context here and can accept or decline thoughtfully."
          />
        ) : (
          <div className="stack-16">
            {pending.map((r) => {
              const student = db.users.find((u) => u.id === r.studentUserId)!;
              const sp = db.studentProfiles.find((p) => p.userId === student.id);
              return (
                <div key={r.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <Avatar name={student.name} />
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <strong style={{ display: "block" }}>{student.name}</strong>
                      <small style={{ color: "var(--ink-mute)" }}>
                        {sp?.degree ?? "Student"} · {sp?.graduationYear ? `Class of ${sp.graduationYear}` : ""} · requested {timeAgo(r.createdAt)}
                      </small>
                      <p style={{ margin: "10px 0 4px", fontWeight: 600, fontSize: "0.875rem" }}>“{r.goal}”</p>
                      <p style={{ margin: "0 0 8px", fontSize: "0.8438rem", color: "var(--ink-soft)" }}>{r.message}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="chip">{r.meetingPreference}</span>
                        <span className="chip">{r.availability}</span>
                        {sp && <span className="chip">{sp.profileCompleteness}% profile</span>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      <form action={respondToRequestAction}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <input type="hidden" name="decision" value="ACCEPTED" />
                        <button type="submit" className="btn btn-primary btn-sm btn-block">
                          <CheckCircle2 size={14} /> Accept
                        </button>
                      </form>
                      <form action={respondToRequestAction}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <input type="hidden" name="decision" value="DECLINED" />
                        <button type="submit" className="btn btn-secondary btn-sm btn-block">
                          <XCircle size={14} /> Decline
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid-2" style={{ marginTop: 20 }}>
        {/* Active mentees */}
        <Card title={`Active mentees (${activeMentorships.length})`} subtitle="Your current mentorships">
          {activeMentorships.length === 0 ? (
            <EmptyState icon={<HeartHandshake size={28} />} title="No active mentorships" hint="Accept a request above to start mentoring — structured goals included." />
          ) : (
            <div className="row-list" style={{ margin: "-20px" }}>
              {activeMentorships.map((m) => {
                const student = db.users.find((u) => u.id === m.studentUserId)!;
                const goals = db.goals.filter((g) => g.mentorshipId === m.id);
                return (
                  <div key={m.id} className="row-item">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <Avatar name={student.name} size="sm" />
                      <div>
                        <div className="row-title">{student.name}</div>
                        <div className="row-sub">{goals.length} goal{goals.length === 1 ? "" : "s"} · {m.sessionCount} sessions · active {timeAgo(m.lastActivityAt)}</div>
                        <div style={{ width: 180, marginTop: 6 }}><Progress value={m.progress} /></div>
                      </div>
                    </div>
                    <LinkButton href={`/mentorship?m=${m.id}`} variant="secondary" size="sm">Open</LinkButton>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Upcoming sessions */}
        <Card title="Upcoming sessions" subtitle="Across all your mentees">
          {upcoming.length === 0 ? (
            <EmptyState icon={<CalendarClock size={28} />} title="Nothing scheduled" hint="Mentees can schedule sessions from the shared workspace — or you can." />
          ) : (
            <div className="row-list" style={{ margin: "-20px" }}>
              {upcoming.map((s) => {
                const m = db.mentorships.find((x) => x.id === s.mentorshipId)!;
                const student = db.users.find((u) => u.id === m.studentUserId);
                return (
                  <div key={s.id} className="row-item">
                    <div>
                      <div className="row-title">{s.title}</div>
                      <div className="row-sub">with {student?.name} · {fmtDateTime(s.scheduledAt)}</div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <Card title="Recent history" subtitle="Handled requests">
          {myRequests.filter((r) => r.status !== "PENDING").length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={28} />} title="No history yet" hint="Accepted and declined requests appear here." />
          ) : (
            <div className="row-list" style={{ margin: "-20px" }}>
              {myRequests
                .filter((r) => r.status !== "PENDING")
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                .map((r) => {
                  const student = db.users.find((u) => u.id === r.studentUserId);
                  return (
                    <div key={r.id} className="row-item">
                      <div>
                        <div className="row-title">{student?.name} — “{r.goal.slice(0, 60)}{r.goal.length > 60 ? "…" : ""}”</div>
                        <div className="row-sub">updated {timeAgo(r.updatedAt)}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <Card title="Mentoring tips" subtitle="Small habits, compounding impact">
          <div className="stack-16">
            <div className="callout">
              <Sparkles size={18} />
              <div><strong>End every session with one milestone</strong><p>Specific next steps keep momentum between sessions.</p></div>
            </div>
            <div className="callout success">
              <TrendingUp size={18} />
              <div><strong>Verify milestones with evidence</strong><p>Verified milestones feed your mentee's Readiness Index and your impact dashboard.</p></div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
