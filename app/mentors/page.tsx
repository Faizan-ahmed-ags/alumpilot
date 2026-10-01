import Link from "next/link";
import { Briefcase, Compass, MapPin, Search, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Badge, EmptyState, LinkButton, PageHead } from "@/components/ui";
import { calculateMatchScore } from "@/lib/matching/engine";
import type { StudentProfile, User } from "@/lib/db/types";

export const metadata = { title: "Discover mentors" };

const MODES = ["Video", "Chat", "In-person", "Hybrid"];
const AVAILABILITIES = ["High", "Medium"];

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: { q?: string; industry?: string; mode?: string; availability?: string; topic?: string };
}) {
  const user = await getSessionUser();
  const db = getStore();
  const studentProfile =
    user?.role === "STUDENT" ? db.studentProfiles.find((p) => p.userId === user.id) : undefined;

  const q = (searchParams.q ?? "").trim().toLowerCase();
  const industry = searchParams.industry ?? "";
  const mode = searchParams.mode ?? "";
  const availability = searchParams.availability ?? "";
  const topic = searchParams.topic ?? "";

  const industries = Array.from(new Set(db.alumniProfiles.map((a) => a.industry))).sort();
  const topics = Array.from(new Set(db.alumniProfiles.flatMap((a) => a.mentorshipTopics))).sort();

  const mentors = db.alumniProfiles
    .filter((a) => a.isMentor && a.mentorshipAvailable)
    .map((a) => {
      const mu = db.users.find((u) => u.id === a.userId);
      const match = studentProfile && studentProfile.onboardingCompleted ? calculateMatchScore(studentProfile, a).score : null;
      return { a, mu, match };
    })
    .filter(({ a, mu }) => {
      if (!mu) return false;
      if (q) {
        const hay = `${mu.name} ${a.role} ${a.company} ${a.industry} ${a.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (industry && a.industry !== industry) return false;
      if (mode && a.preferredMode !== mode) return false;
      if (availability && a.availability !== availability) return false;
      if (topic && !a.mentorshipTopics.some((t) => t.toLowerCase().includes(topic.toLowerCase()))) return false;
      return true;
    })
    .sort((x, y) => (y.match ?? y.a.responseRate) - (x.match ?? x.a.responseRate));

  const filtersActive = Boolean(q || industry || mode || availability || topic);
  const hasAnyMentor = mentors.length > 0 || filtersActive;

  const body = (
    <>
      <PageHead
        eyebrow="Mentor discovery"
        title="Find the right mentor"
        lede={
          studentProfile
            ? "Match percentages come from a transparent, deterministic score — every factor is shown on the profile."
            : "Browse verified alumni mentors. Sign in as a student to see your personal match scores."
        }
      />

      <form method="get" className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="filterbar">
          <div className="searchbar">
            <Search size={16} aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={searchParams.q ?? ""}
              className="input"
              placeholder="Search mentors by skill, role, company or industry…"
              aria-label="Search mentors"
            />
          </div>
          <select name="industry" defaultValue={industry} className="select" style={{ width: 170 }} aria-label="Filter by industry">
            <option value="">All industries</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select name="topic" defaultValue={topic} className="select" style={{ width: 200 }} aria-label="Filter by mentorship topic">
            <option value="">All topics</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="mode" defaultValue={mode} className="select" style={{ width: 140 }} aria-label="Filter by meeting mode">
            <option value="">Any mode</option>
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select name="availability" defaultValue={availability} className="select" style={{ width: 150 }} aria-label="Filter by availability">
            <option value="">Any availability</option>
            {AVAILABILITIES.map((a) => <option key={a} value={a}>{a} availability</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Apply filters</button>
          {filtersActive && <Link href="/mentors" className="btn btn-ghost">Clear</Link>}
        </div>
      </form>

      {mentors.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Compass size={28} />}
            title="No mentors match those filters"
            hint="Try removing a filter or two — or search for a different skill or company."
            action={<LinkButton href="/mentors" variant="secondary" size="sm">Clear all filters</LinkButton>}
          />
        </Card>
      ) : (
        <div className="grid-3">
          {mentors.map(({ a, mu, match }) => (
            <article key={a.id} className="card mentor-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar name={mu!.name} />
                  <div>
                    <strong style={{ display: "block", fontSize: "0.9rem" }}>{mu!.name}</strong>
                    <small style={{ color: "var(--ink-mute)" }}>{a.role}</small>
                  </div>
                </div>
                {match !== null && <span className="match-pill" title="Deterministic match score">{match}%</span>}
              </div>

              <div className="mentor-meta">
                <span><Briefcase size={13} /> {a.company}</span>
                <span><MapPin size={13} /> {a.location}</span>
                <span><Users size={13} /> {a.studentsMentored} mentored</span>
              </div>

              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--ink-soft)", lineHeight: 1.5 }}>
                {a.bio}
              </p>

              <div className="chip-row">
                {a.skills.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}
                {a.skills.length > 3 && <span className="chip">+{a.skills.length - 3}</span>}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge tone={a.availability === "High" ? "success" : a.availability === "Medium" ? "warning" : "danger"} dot>
                  {a.availability} availability
                </Badge>
                <Badge tone="neutral">{a.responseRate}% response</Badge>
                <Badge tone="neutral">{a.preferredMode}</Badge>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <LinkButton href={`/mentors/${a.userId}`} variant="secondary" size="sm">View profile</LinkButton>
                {user?.role === "STUDENT" ? (
                  <LinkButton href={`/mentors/${a.userId}?request=1`} size="sm">Request mentorship</LinkButton>
                ) : (
                  <LinkButton href="/login" size="sm">Sign in to request</LinkButton>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
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

function Card({ children }: { children: React.ReactNode }) {
  return <section className="card"><div className="card-body">{children}</div></section>;
}
