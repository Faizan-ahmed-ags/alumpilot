import Link from "next/link";
import {
  ArrowRight, BarChart3, BookOpen, Building2, CheckCircle2, Compass, GraduationCap,
  HeartHandshake, LineChart, Route, ShieldCheck, Sparkles, Target, Users,
} from "lucide-react";
import { getStore } from "@/lib/db/client";
import { Avatar } from "@/components/ui";

const LOOP = ["Student", "Career Goal", "Skills", "Mentor Match", "Mentorship", "Milestones", "Progress", "Career Outcome", "Future Mentor"];

export default function HomePage() {
  const db = getStore();
  const mentors = db.alumniProfiles.filter((a) => a.isMentor && a.mentorshipAvailable);
  const students = db.users.filter((u) => u.role === "STUDENT");
  const activeMentorships = db.mentorships.filter((m) => m.status === "ACTIVE");
  const goalsDone = db.goals.filter((g) => g.status === "COMPLETED").length;
  const outcomes = db.careerOutcomes;
  const riya = db.users.find((u) => u.email === "student@demo.com");
  const ananya = db.users.find((u) => u.email === "alumni@demo.com");
  const ananyaProfile = db.alumniProfiles.find((a) => a.userId === ananya?.id);

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" className="sidenav-brand" style={{ padding: 0 }}>
          <span className="brand-mark" aria-hidden>AB</span>
          <span>
            <strong>AlumniBridge</strong>
            <small>Career Development OS</small>
          </span>
        </Link>
        <nav className="landing-links" aria-label="Sections">
          <a href="#how">How it works</a>
          <a href="#roles">Who it's for</a>
          <a href="#journey">Career journey</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div>
          <p className="eyebrow">Structured mentorship for institutions</p>
          <h1>Your career journey shouldn't depend on who you already know.</h1>
          <p className="sub">
            AlumniBridge connects students with experienced alumni, turns mentorship into measurable
            goals, and helps institutions understand career outcomes.
          </p>
          <div className="hero-ctas">
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Explore the platform
            </Link>
          </div>
          <div className="flow-strip" aria-label="The AlumniBridge loop">
            {LOOP.map((s, i) => (
              <span key={s} className="f-step">
                {s}
                {i < LOOP.length - 1 && <ArrowRight size={12} aria-hidden />}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="card hero-card" aria-label="Product preview">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow">Transparent match</span>
              <span className="match-pill">92% match</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name={ananya?.name ?? "Ananya Iyer"} size="lg" />
              <div>
                <strong style={{ display: "block" }}>{ananya?.name ?? "Ananya Iyer"}</strong>
                <small style={{ color: "var(--ink-mute)" }}>
                  {ananyaProfile?.role} · {ananyaProfile?.company}
                </small>
              </div>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
              {["Target role: Product Engineer", "Technology industry focus", "Mentors interview preparation", "Evening availability"].map((r) => (
                <li key={r} className="match-reason">
                  <CheckCircle2 size={15} aria-hidden /> {r}
                </li>
              ))}
            </ul>
            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--ink-mute)" }}>
              <span>Readiness index</span>
              <strong style={{ color: "var(--ink)" }}>68 → 81 after mentorship</strong>
            </div>
          </div>
          <div className="hero-float">
            <small>Institution impact</small>
            <strong style={{ fontSize: "1.05rem" }}>Career outcomes, finally measurable</strong>
          </div>
        </div>
      </section>

      {/* ---------------- Metrics band ---------------- */}
      <section className="landing-section" style={{ paddingTop: 0 }}>
        <div className="metrics-band">
          <div><div className="m-val">{mentors.length}</div><div className="m-label">verified alumni mentors in the demo network</div></div>
          <div><div className="m-val">{activeMentorships.length}</div><div className="m-label">structured mentorships running now</div></div>
          <div><div className="m-val">{goalsDone}</div><div className="m-label">mentor-verified goals completed</div></div>
          <div><div className="m-val">{outcomes.length}</div><div className="m-label">career outcomes recorded & attributable</div></div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="landing-section" id="how">
        <span className="eyebrow">How it works</span>
        <h2>From first profile to first job — one connected system.</h2>
        <p className="section-sub">Mentorship stops being a one-off chat and becomes a measurable program.</p>
        <div className="steps-4">
          {[
            { icon: Target, t: "Set the direction", d: "Students define a career goal, target roles and an honest skill baseline in a guided onboarding." },
            { icon: Compass, t: "Match, transparently", d: "A deterministic engine scores every mentor on role, industry, skills, topics and availability — and shows its work." },
            { icon: HeartHandshake, t: "Mentor with structure", d: "Accepted mentorships get a shared workspace: goals, milestones, evidence, sessions and feedback." },
            { icon: LineChart, t: "See the outcome", d: "Readiness updates as milestones complete. Institutions watch outcomes aggregate in real time." },
          ].map((s, i) => (
            <div key={s.t} className="card step-card">
              <span className="step-n">{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Roles ---------------- */}
      <section className="landing-section" id="roles" style={{ background: "var(--card)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <span className="eyebrow">Who it's for</span>
        <h2>One platform, four stakeholder views.</h2>
        <p className="section-sub">Each role gets a purpose-built surface — not a resized dashboard.</p>
        <div className="role-cards">
          <div className="card role-card">
            <span className="icon-tile"><GraduationCap size={22} /></span>
            <h3>Students</h3>
            <p>Clarity, structure and access — regardless of personal networks.</p>
            <ul>
              <li><CheckCircle2 size={15} /> Explainable mentor matches</li>
              <li><CheckCircle2 size={15} /> Goals with mentor-verified milestones</li>
              <li><CheckCircle2 size={15} /> A living career journey timeline</li>
            </ul>
          </div>
          <div className="card role-card">
            <span className="icon-tile"><Users size={22} /></span>
            <h3>Alumni mentors</h3>
            <p>Give back with clear boundaries and visible impact.</p>
            <ul>
              <li><CheckCircle2 size={15} /> Request inbox with full context</li>
              <li><CheckCircle2 size={15} /> Session agendas & feedback tools</li>
              <li><CheckCircle2 size={15} /> An honest “My Impact” dashboard</li>
            </ul>
          </div>
          <div className="card role-card">
            <span className="icon-tile"><Building2 size={22} /></span>
            <h3>Institutions</h3>
            <p>Placement teams and administrators finally see the whole picture.</p>
            <ul>
              <li><CheckCircle2 size={15} /> Mentorship funnel & engagement analytics</li>
              <li><CheckCircle2 size={15} /> Early-intervention indicators (support, never ranking)</li>
              <li><CheckCircle2 size={15} /> CSV export for accreditation reports</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- Career journey ---------------- */}
      <section className="landing-section" id="journey">
        <span className="eyebrow">The signature view</span>
        <h2>Every student gets a visible career journey.</h2>
        <p className="section-sub">The timeline that makes the long-term value of mentorship impossible to miss.</p>
        <div className="grid-2">
          <div className="card card-pad">
            <div className="timeline">
              {["Profile created", "Mentor matched", "First session completed", "Portfolio milestone verified", "Internship recorded", "Graduation", "First job", "Returns as alumni mentor"].map((s, i) => (
                <div key={s} className={`t-item ${i < 5 ? "done" : ""}`}>
                  <span className="t-dot"><CheckCircle2 size={14} /></span>
                  <div className="t-body">
                    <strong>{s}</strong>
                    <small>{i < 5 ? "Completed" : i === 5 ? "Upcoming" : "The loop continues"}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="stack-16">
            <div className="card card-pad">
              <span className="eyebrow">AlumniBridge Readiness Index</span>
              <p style={{ fontSize: "0.875rem" }}>
                A transparent, informational composite of skills, projects, mentorship engagement,
                goals and interview preparation. Always explained. Never a public ranking.
              </p>
              <span className="ai-tag"><Sparkles size={11} /> Explainable by design</span>
            </div>
            <div className="card card-pad">
              <span className="eyebrow">Responsible AI</span>
              <p style={{ fontSize: "0.875rem" }}>
                Core matching works without AI. AI only explains and suggests — humans approve
                mentorships, verify milestones and certify outcomes.
              </p>
              <span className="badge badge-brand"><ShieldCheck size={13} /> Human review on high-stakes steps</span>
            </div>
            <div className="card card-pad">
              <span className="eyebrow">Built for institutions</span>
              <p style={{ fontSize: "0.875rem" }}>
                Role-based access control enforced server-side, audit logs on every sensitive
                action, and privacy by design — students control profile visibility.
              </p>
              <span className="badge badge-success"><BookOpen size={13} /> Audit trail enabled</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="landing-section" id="faq">
        <span className="eyebrow">FAQ</span>
        <h2>Questions judges and deans usually ask.</h2>
        <div className="faq">
          <details>
            <summary>Is the match score AI?</summary>
            <p>No — and that's intentional. It's a deterministic, fully explainable weighted score (role, industry, skills, topics, availability, mode). AI is layered on top only to explain matches in natural language and suggest goal drafts. Essential functionality never depends on AI.</p>
          </details>
          <details>
            <summary>Is the Readiness Index a ranking of students?</summary>
            <p>Never. It's a private, informational signal for the student and their mentors, always shown with the factors behind it. Institutions see aggregate distributions only — designed for support outreach, not evaluation.</p>
          </details>
          <details>
            <summary>How is student privacy handled?</summary>
            <p>Students control profile visibility, salary fields are optional, contact details are never exposed publicly, and every privileged action is authorized server-side against the database — not just hidden in the UI.</p>
          </details>
          <details>
            <summary>What does the institution actually get?</summary>
            <p>A live picture: mentorship funnel, engagement, goal completion, skill gaps, department outcomes and exportable career-outcome reports that connect alumni programs to placement results.</p>
          </details>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="cta-band">
        <h2>Turn alumni goodwill into structured, sustained mentorship.</h2>
        <p>Experience the complete journey: student → mentor match → verified milestones → career outcome → institutional analytics.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" className="btn btn-lg" style={{ background: "#fff", color: "var(--brand-strong)" }}>
            Try the live demo <ArrowRight size={16} />
          </Link>
          <Link href="/register" className="btn btn-lg btn-secondary">Create an account</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span>© {new Date().getFullYear()} AlumniBridge · Demo data is entirely fictional</span>
          <span style={{ display: "inline-flex", gap: 16 }}>
            <Link href="/login">Sign in</Link>
            <Link href="/register">Register</Link>
            <Link href="/resources">Resources</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
