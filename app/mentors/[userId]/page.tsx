import { notFound, redirect } from "next/navigation";
import { Briefcase, Building2, CalendarClock, CheckCircle2, GraduationCap, Languages, MapPin, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Badge, LinkButton } from "@/components/ui";
import { calculateMatchScore } from "@/lib/matching/engine";
import { explainMatch } from "@/lib/ai";
import { MentorRequestForm } from "./request-form";
import type { StudentProfile } from "@/lib/db/types";

export default async function MentorProfilePage({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: { request?: string };
}) {
  const db = getStore();
  const mentorUser = db.users.find((u) => u.id === params.userId && u.role === "ALUMNI");
  if (!mentorUser) notFound();
  const mentor = db.alumniProfiles.find((a) => a.userId === mentorUser.id);
  if (!mentor) notFound();

  const user = await getSessionUser();
  const studentProfile: StudentProfile | undefined =
    user?.role === "STUDENT" ? db.studentProfiles.find((p) => p.userId === user.id) : undefined;

  const existingActive = user
    ? db.mentorships.find((m) => m.studentUserId === user.id && m.mentorUserId === mentorUser.id && m.status === "ACTIVE")
    : undefined;
  const existingPending = user
    ? db.mentorRequests.find((r) => r.studentUserId === user.id && r.mentorUserId === mentorUser.id && r.status === "PENDING")
    : undefined;

  const match = studentProfile && studentProfile.onboardingCompleted
    ? calculateMatchScore(studentProfile, mentor)
    : null;
  const explanation = studentProfile ? explainMatch(studentProfile, mentor, mentorUser.name) : null;

  const department = db.departments.find((d) => d.id === mentorUser.departmentId);
  const studentDept = studentProfile ? db.departments.find((d) => d.id === studentProfile.departmentId) : undefined;
  const sharedDept = department && studentDept && department.id === studentDept.id;

  const body = (
    <div className="stack-20">
      {/* Header card */}
      <section className="card card-pad">
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <Avatar name={mentorUser.name} size="lg" />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "1.375rem" }}>{mentorUser.name}</h1>
              {mentor.verified && <Badge tone="brand">✓ Verified alumni</Badge>}
              {match !== null && <span className="match-pill">{match.score}% match</span>}
            </div>
            <p style={{ margin: "6px 0 10px", fontWeight: 600 }}>{mentor.headline}</p>
            <div className="mentor-meta">
              <span><Building2 size={13} /> {mentor.company}</span>
              <span><Briefcase size={13} /> {mentor.industry}</span>
              <span><MapPin size={13} /> {mentor.location}</span>
              <span><GraduationCap size={13} /> {department?.code ?? "—"} {mentor.graduationYear}</span>
              <span><Languages size={13} /> {mentor.languages.join(", ")}</span>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
            <Badge tone={mentor.availability === "High" ? "success" : mentor.availability === "Medium" ? "warning" : "danger"} dot>
              {mentor.availability} availability
            </Badge>
            <Badge tone="neutral">{mentor.responseRate}% response rate</Badge>
            <Badge tone="neutral">Prefers {mentor.preferredMode}</Badge>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
        <div className="stack-16">
          {/* About */}
          <section className="card card-pad">
            <h2 style={{ margin: "0 0 8px", fontSize: "1rem" }}>About</h2>
            <p style={{ margin: 0 }}>{mentor.bio}</p>
            <div className="divider" style={{ margin: "16px 0" }} />
            <div className="grid-4" style={{ textAlign: "center" }}>
              <div><strong style={{ display: "block", fontSize: "1.3rem" }}>{mentor.studentsMentored}</strong><small style={{ color: "var(--ink-mute)" }}>students mentored</small></div>
              <div><strong style={{ display: "block", fontSize: "1.3rem" }}>{mentor.sessionsCompleted}</strong><small style={{ color: "var(--ink-mute)" }}>sessions</small></div>
              <div><strong style={{ display: "block", fontSize: "1.3rem" }}>{mentor.goalsCompleted}</strong><small style={{ color: "var(--ink-mute)" }}>goals completed</small></div>
              <div><strong style={{ display: "block", fontSize: "1.3rem" }}>{mentor.workExperienceYears}y</strong><small style={{ color: "var(--ink-mute)" }}>experience</small></div>
            </div>
          </section>

          {/* Skills & topics */}
          <section className="card card-pad">
            <h2 style={{ margin: "0 0 10px", fontSize: "1rem" }}>Skills</h2>
            <div className="chip-row" style={{ marginBottom: 16 }}>{mentor.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            <h2 style={{ margin: "0 0 10px", fontSize: "1rem" }}>Mentorship topics</h2>
            <div className="chip-row">
              {mentor.mentorshipTopics.map((t) => (
                <span key={t} className={`chip ${studentProfile?.mentorshipTopics.some((st) => st.toLowerCase() === t.toLowerCase()) ? "chip-active" : ""}`}>
                  {t}{studentProfile?.mentorshipTopics.some((st) => st.toLowerCase() === t.toLowerCase()) ? " ✓" : ""}
                </span>
              ))}
            </div>
          </section>

          {/* Request */}
          <section className="card card-pad" id="request">
            <h2 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Request mentorship</h2>
            <p style={{ margin: "0 0 16px", fontSize: "0.8438rem", color: "var(--ink-mute)" }}>
              Mentors see your goal, message and availability before accepting. Most respond within a few days.
            </p>
            {existingActive ? (
              <div className="callout success">
                <CheckCircle2 size={18} />
                <div>
                  <strong>You're already mentored by {mentorUser.name}</strong>
                  <p>Open your mentorship workspace to continue.</p>
                </div>
                <LinkButton href="/mentorship" size="sm">Open workspace</LinkButton>
              </div>
            ) : existingPending ? (
              <div className="callout">
                <CalendarClock size={18} />
                <div>
                  <strong>Request already pending</strong>
                  <p>{mentorUser.name} received your request and will respond soon.</p>
                </div>
              </div>
            ) : user?.role === "STUDENT" ? (
              <MentorRequestForm mentorUserId={mentorUser.id} defaultOpen={searchParams.request === "1"} />
            ) : (
              <div className="callout">
                <Sparkles size={18} />
                <div>
                  <strong>Sign in as a student to request mentorship</strong>
                  <p>Mentorship requests connect students with verified alumni mentors.</p>
                </div>
                <LinkButton href={`/login?next=/mentors/${mentorUser.id}`} size="sm">Sign in</LinkButton>
              </div>
            )}
          </section>
        </div>

        {/* Right rail: matching transparency */}
        <div className="stack-16">
          {match && (
            <section className="card card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: "1rem" }}>Why this match?</h2>
                <span className="match-pill">{match.score}%</span>
              </div>
              {explanation && (
                <div style={{ marginBottom: 14 }}>
                  <span className="ai-tag" title="Generated from your structured profile data by the deterministic engine">
                    <Sparkles size={11} /> AI-assisted explanation
                  </span>
                  <p style={{ fontSize: "0.8438rem", margin: "8px 0 0", lineHeight: 1.6 }}>{explanation.summary}</p>
                </div>
              )}
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {match.reasons.map((r) => (
                  <li key={r} className="match-reason"><CheckCircle2 size={15} /> {r}</li>
                ))}
                {sharedDept && <li className="match-reason"><CheckCircle2 size={15} /> Same department ({studentDept?.code})</li>}
              </ul>
              <div className="divider" style={{ margin: "14px 0" }} />
              <p style={{ fontSize: "0.7188rem", color: "var(--ink-mute)", margin: 0 }}>
                Deterministic weighted score: target role 25 · industry 20 · skills 20 · topics 15 ·
                availability 10 · mode 10. Not scientifically validated — a transparency aid, not a verdict.
              </p>
            </section>
          )}

          <section className="card card-pad">
            <h2 style={{ margin: "0 0 10px", fontSize: "1rem" }}>Mentoring style</h2>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.875rem", color: "var(--ink-soft)", display: "grid", gap: 6 }}>
              <li>Typical cadence: bi-weekly, 45-minute sessions</li>
              <li>Mode: {mentor.preferredMode}</li>
              <li>Languages: {mentor.languages.join(", ")}</li>
              <li>Class of {mentor.graduationYear} · {department?.name ?? "Alumni"}</li>
            </ul>
            <LinkButton href="/mentors" variant="ghost" size="sm" >← All mentors</LinkButton>
          </section>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return <div className="content" style={{ margin: "0 auto", maxWidth: 1100 }}>{body}</div>;
  }
  return (
    <AppShell user={user} title="Discover Mentors">
      {body}
    </AppShell>
  );
}
