import { ArrowRight, CalendarClock, CheckCircle2, Compass, HeartHandshake, XCircle } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Card, EmptyState, LinkButton, PageHead, Progress, StatusBadge, fmtDate, timeAgo } from "@/components/ui";

export const metadata = { title: "Mentorship" };

export default async function StudentMentorshipPage() {
  const user = await requireRole("STUDENT");
  const db = getStore();
  const requests = db.mentorRequests
    .filter((r) => r.studentUserId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const mentorships = db.mentorships.filter((m) => m.studentUserId === user.id);
  const active = mentorships.find((m) => m.status === "ACTIVE");

  return (
    <AppShell user={user} title="Mentorship">
      <PageHead
        eyebrow="Student"
        title="Mentorship"
        lede="Your requests, your mentor, and everything that happens after acceptance."
        action={active ? undefined : <LinkButton href="/mentors" size="sm"><Compass size={15} /> Discover mentors</LinkButton>}
      />

      <div className="stack-16">
        {active && (
          <Card title="Active mentorship" subtitle={`Started ${fmtDate(active.startedAt)}`}
            action={<LinkButton href="/mentorship" size="sm">Open workspace <ArrowRight size={14} /></LinkButton>}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <Avatar name={db.users.find((u) => u.id === active.mentorUserId)?.name ?? "Mentor"} />
              <div>
                <strong>{db.users.find((u) => u.id === active.mentorUserId)?.name}</strong>
                <div style={{ fontSize: "0.78rem", color: "var(--ink-mute)" }}>
                  {(() => {
                    const ap = db.alumniProfiles.find((a) => a.userId === active.mentorUserId);
                    return ap ? `${ap.role} · ${ap.company}` : "";
                  })()}
                </div>
              </div>
              <div style={{ marginLeft: "auto", minWidth: 220 }}>
                <div className="row-top" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span>Progress</span><strong>{active.progress}%</strong>
                </div>
                <Progress value={active.progress} />
              </div>
            </div>
          </Card>
        )}

        <Card title="Your requests" subtitle="Track every mentorship request you've sent">
          {requests.length === 0 ? (
            <EmptyState
              icon={<HeartHandshake size={28} />}
              title="No requests yet"
              hint="Browse mentors — the match score shows exactly why each one fits your goals before you send anything."
              action={<LinkButton href="/mentors" size="sm">Discover mentors</LinkButton>}
            />
          ) : (
            <div className="row-list" style={{ margin: "-20px" }}>
              {requests.map((r) => {
                const mentor = db.users.find((u) => u.id === r.mentorUserId);
                return (
                  <div key={r.id} className="row-item" style={{ alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <Avatar name={mentor?.name ?? "Mentor"} size="sm" />
                      <div>
                        <div className="row-title">{mentor?.name}</div>
                        <div className="row-sub" style={{ maxWidth: "52ch" }}>“{r.goal}”</div>
                        <div className="row-sub">Sent {timeAgo(r.createdAt)} · {r.meetingPreference}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                      <StatusBadge status={r.status} />
                      {r.status === "PENDING" && <small style={{ color: "var(--ink-mute)", fontSize: "0.7188rem" }}>awaiting response</small>}
                      {r.status === "ACCEPTED" && <LinkButton href="/mentorship" variant="ghost" size="sm">Workspace</LinkButton>}
                      {r.status === "DECLINED" && <LinkButton href="/mentors" variant="ghost" size="sm">Find another</LinkButton>}
                      {r.status === "COMPLETED" && <span style={{ fontSize: "0.7188rem", color: "var(--ink-mute)" }}>journey complete</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {!active && requests.some((r) => r.status === "PENDING") && (
          <Card>
            <div className="callout">
              <CalendarClock size={18} />
              <div>
                <strong>While you wait</strong>
                <p>You can keep browsing — it's fine to have more than one request pending. A complete profile noticeably improves response rates.</p>
              </div>
              <LinkButton href="/student/onboarding" variant="secondary" size="sm">Improve profile</LinkButton>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
