import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock, CheckCircle2, MessageSquare, Plus, Star, Target,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Card, EmptyState, LinkButton, PageHead, Progress, StatusBadge, fmtDate, fmtDateTime, timeAgo } from "@/components/ui";
import {
  CompleteMentorshipButton, FeedbackForm, GoalCreateForm, MessageComposer,
  MilestoneCreateInline, MilestoneRow, NoteComposer, SessionCompleteInline, SessionScheduleForm,
} from "./workspace-forms";
import { summarizeMentorship } from "@/lib/ai";

export const metadata = { title: "Mentorship workspace" };

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: { m?: string; after?: string };
}) {
  const user = await requireRole("STUDENT", "ALUMNI");
  const db = getStore();

  const myMentorships = db.mentorships.filter(
    (m) => (m.studentUserId === user.id || m.mentorUserId === user.id)
  );
  if (myMentorships.length === 0) {
    redirect(user.role === "STUDENT" ? "/student/mentorship" : "/alumni/dashboard");
  }
  const mentorship = searchParams.m ? myMentorships.find((m) => m.id === searchParams.m) ?? myMentorships[0] : myMentorships[0];

  const student = db.users.find((u) => u.id === mentorship.studentUserId)!;
  const mentor = db.users.find((u) => u.id === mentorship.mentorUserId)!;
  const mentorProfile = db.alumniProfiles.find((a) => a.userId === mentor.id);
  const studentProfile = db.studentProfiles.find((p) => p.userId === student.id);
  const isMentor = user.id === mentor.id;
  const counterparty = isMentor ? student : mentor;

  const goals = db.goals.filter((g) => g.mentorshipId === mentorship.id);
  const sessions = db.sessions
    .filter((s) => s.mentorshipId === mentorship.id)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  const upcoming = sessions.filter((s) => s.status === "SCHEDULED").sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const feedback = db.feedback.filter((f) => f.mentorshipId === mentorship.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const conversation = db.conversations.find((c) => c.mentorshipId === mentorship.id);
  const messages = conversation ? db.messages.filter((m) => m.conversationId === conversation.id) : [];
  const notes = db.notes.filter((n) => n.mentorshipId === mentorship.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const request = db.mentorRequests.find((r) => r.id === mentorship.requestId);

  const summary = summarizeMentorship({
    studentName: student.name.split(" ")[0],
    mentorName: mentor.name.split(" ")[0],
    goalsTotal: goals.length,
    goalsDone: goals.filter((g) => g.status === "COMPLETED").length,
    sessionsDone: sessions.filter((s) => s.status === "COMPLETED").length,
    nextSession: upcoming[0] ? { title: upcoming[0].title, when: fmtDateTime(upcoming[0].scheduledAt) } : undefined,
    progress: mentorship.progress,
  });

  return (
    <AppShell user={user} title="Mentorship Workspace">
      <PageHead
        eyebrow={isMentor ? "Mentor view" : "Student view"}
        title={`Mentorship: ${student.name.split(" ")[0]} × ${mentor.name.split(" ")[0]}`}
        lede={`Started ${fmtDate(mentorship.startedAt)} · ${mentorship.sessionCount} sessions · status ${mentorship.status.toLowerCase()}`}
        action={<CompleteMentorshipButton mentorshipId={mentorship.id} />}
      />

      {searchParams.after === "accepted" && (
        <div className="callout success" style={{ marginBottom: 20 }}>
          <CheckCircle2 size={18} />
          <div>
            <strong>Mentorship accepted!</strong>
            <p>
              {isMentor
                ? "Set the first goal together so every session has a purpose."
                : "Your mentor said yes. The fastest way to a great start: agree your first goal below."}
            </p>
          </div>
        </div>
      )}

      {myMentorships.length > 1 && (
        <div className="tabs" role="tablist" aria-label="Your mentorships">
          {myMentorships.map((m) => {
            const other = db.users.find((u) => u.id === (m.studentUserId === user.id ? m.mentorUserId : m.studentUserId));
            return (
              <Link key={m.id} href={`/mentorship?m=${m.id}`} aria-current={m.id === mentorship.id ? "page" : undefined}>
                {other?.name} {m.status === "COMPLETED" ? "(completed)" : ""}
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="card stat stat-brand">
          <span className="stat-label">Progress</span>
          <span className="stat-value">{mentorship.progress}%</span>
          <span className="stat-sub">{summary}</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Partner</span>
          <span style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <Avatar name={counterparty.name} size="sm" />
            <span>
              <strong style={{ display: "block", fontSize: "0.875rem" }}>{counterparty.name}</strong>
              <small style={{ color: "var(--ink-mute)" }}>{isMentor ? `Student · ${studentProfile?.degree ?? ""}` : `${mentorProfile?.role} · ${mentorProfile?.company}`}</small>
            </span>
          </span>
        </div>
        <div className="card stat">
          <span className="stat-label">Next session</span>
          <span className="stat-value" style={{ fontSize: "1.1rem" }}>
            {upcoming[0] ? fmtDateTime(upcoming[0].scheduledAt) : "—"}
          </span>
          <span className="stat-sub">{upcoming[0]?.title ?? "Nothing scheduled"}</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Feedback</span>
          <span className="stat-value">{feedback.length}</span>
          <span className="stat-sub">{feedback[0] ? `latest ${timeAgo(feedback[0].createdAt)}` : "none yet"}</span>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* LEFT: goals */}
        <div className="stack-16">
          <Card
            title="Goals & milestones"
            subtitle="Progress updates automatically as milestones complete"
            action={mentorship.status === "ACTIVE" ? <LinkButton href="#create-goal" variant="secondary" size="sm"><Plus size={14} /> New goal</LinkButton> : undefined}
          >
            {goals.length === 0 ? (
              <EmptyState
                icon={<Target size={28} />}
                title="No goals yet"
                hint={isMentor
                  ? "Create the first goal with your mentee — measurable goals are what make mentorship compound."
                  : "Create your first goal below, or agree one in your next session."}
              />
            ) : (
              <div className="stack-16">
                {goals.map((goal) => {
                  const milestones = db.milestones.filter((m) => m.goalId === goal.id);
                  return (
                    <div key={goal.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <div>
                          <strong style={{ fontSize: "0.9rem" }}>{goal.title}</strong>
                          <div style={{ fontSize: "0.75rem", color: "var(--ink-mute)", marginTop: 2 }}>
                            {goal.category} · target {fmtDate(goal.targetDate)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {goal.mentorVerified && <span className="badge badge-success"><CheckCircle2 size={12} /> verified</span>}
                          <StatusBadge status={goal.status} />
                        </div>
                      </div>
                      {goal.description && <p style={{ fontSize: "0.8125rem", margin: "0 0 10px", color: "var(--ink-soft)" }}>{goal.description}</p>}
                      <div className="breakdown-row">
                        <div className="row-top"><span>{milestones.filter((m) => m.status === "DONE").length}/{milestones.length} milestones</span><strong>{goal.progress}%</strong></div>
                        <Progress value={goal.progress} tone={goal.status === "COMPLETED" ? "success" : undefined} />
                      </div>

                      {mentorship.status === "ACTIVE" && (
                        <div className="stack-16" style={{ marginTop: 12 }}>
                          {milestones.map((ms) => (
                            <MilestoneRow key={ms.id} milestone={{ id: ms.id, title: ms.title, status: ms.status, evidence: ms.evidence }} isMentor={isMentor} />
                          ))}
                          <MilestoneCreateInline goalId={goal.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {mentorship.status === "ACTIVE" && (
            <Card title="Create a goal" subtitle="Goals + milestones + evidence = verified progress">
              <GoalCreateForm mentorshipId={mentorship.id} suggested={[] as string[]} />
            </Card>
          )}
        </div>

        {/* RIGHT: sessions, messages, feedback, notes */}
        <div className="stack-16">
          <Card title="Sessions" subtitle="45 focused minutes, every time">
            {sessions.length === 0 ? (
              <EmptyState icon={<CalendarClock size={28} />} title="No sessions yet" hint="Schedule the first one — cadence is the #1 predictor of mentorship success." />
            ) : (
              <div className="row-list" style={{ margin: "-20px" }}>
                {sessions.slice(0, 6).map((s) => (
                  <div key={s.id} className="row-item" style={{ alignItems: "flex-start" }}>
                    <div>
                      <div className="row-title">{s.title}</div>
                      <div className="row-sub">{fmtDateTime(s.scheduledAt)} · {s.durationMinutes} min · {s.mode}</div>
                      {s.agenda && <div className="row-sub">Agenda: {s.agenda}</div>}
                      {s.notes && <div className="row-sub">Notes: {s.notes}</div>}
                    </div>
                    <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                      <StatusBadge status={s.status} />
                      {s.status === "SCHEDULED" && <SessionCompleteInline sessionId={s.id} isMentor={isMentor} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {mentorship.status === "ACTIVE" && (
              <div style={{ marginTop: 16 }}>
                <SessionScheduleForm mentorshipId={mentorship.id} />
              </div>
            )}
          </Card>

          <Card title="Messages" subtitle={`Direct line with ${counterparty.name}`}>
            {conversation ? (
              <>
                <div className="msg-thread">
                  {messages.map((m) => (
                    <div key={m.id} className={`msg ${m.senderUserId === user.id ? "mine" : ""}`}>
                      <div>
                        <div className="bubble">{m.body}</div>
                        <time>{m.senderUserId === user.id ? "You" : counterparty.name} · {timeAgo(m.createdAt)}</time>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <p style={{ color: "var(--ink-mute)", fontSize: "0.8438rem" }}>No messages yet — say hello.</p>}
                </div>
                <MessageComposer conversationId={conversation.id} />
              </>
            ) : (
              <EmptyState icon={<MessageSquare size={28} />} title="No conversation yet" hint="Conversations open automatically when the mentorship starts." />
            )}
          </Card>

          {isMentor ? (
            <Card title="Give feedback" subtitle="Specific feedback within 24h is the highest-leverage mentoring act">
              <FeedbackForm mentorshipId={mentorship.id} />
            </Card>
          ) : feedback.length > 0 ? (
            <Card title="Mentor feedback" subtitle="From your mentor">
              <div className="stack-16">
                {feedback.slice(0, 3).map((f) => (
                  <div key={f.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", gap: 2, marginBottom: 8 }} aria-label={`${f.rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} color={i <= f.rating ? "#f59e0b" : "#e5e7eb"} fill={i <= f.rating ? "#f59e0b" : "none"} />
                      ))}
                    </div>
                    <p style={{ margin: "0 0 6px", fontSize: "0.8438rem" }}><strong>Strengths:</strong> {f.strengths}</p>
                    <p style={{ margin: 0, fontSize: "0.8438rem" }}><strong>Growth:</strong> {f.areasToImprove}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <EmptyState icon={<Star size={28} />} title="No feedback yet" hint="After your next session, your mentor will record strengths and growth areas here." />
            </Card>
          )}

          <Card title="Shared notes" subtitle="Quick context between sessions">
            <div className="stack-16">
              {notes.map((n) => (
                <div key={n.id} className="row-item" style={{ alignItems: "flex-start" }}>
                  <div>
                    <div className="row-title" style={{ fontWeight: 500 }}>{n.body}</div>
                    <div className="row-sub">{n.authorRole === "ALUMNI" ? mentor.name : student.name} · {timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))}
              {notes.length === 0 && <p style={{ margin: 0, fontSize: "0.8438rem", color: "var(--ink-mute)" }}>Nothing noted yet.</p>}
              {mentorship.status === "ACTIVE" && <NoteComposer mentorshipId={mentorship.id} />}
            </div>
          </Card>

          {request && (
            <Card title="Original request" subtitle="Why this mentorship exists">
              <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: "0.875rem" }}>“{request.goal}”</p>
              <p style={{ margin: 0, fontSize: "0.8438rem" }}>{request.message}</p>
              <div className="row-sub" style={{ marginTop: 8 }}>Availability: {request.availability} · Preference: {request.meetingPreference}</div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
