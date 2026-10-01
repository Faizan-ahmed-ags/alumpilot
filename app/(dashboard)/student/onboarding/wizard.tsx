"use client";

import { useActionState } from "react";
import { ArrowLeft, ArrowRight, Check, SkipForward } from "lucide-react";
import { saveOnboardingStepAction, type StepState } from "@/lib/student/actions";
import { Card, Progress } from "@/components/ui";

const STEP_TITLES = [
  "Basic profile",
  "Education",
  "Skills",
  "Career interests & target roles",
  "Industry & mentorship topics",
  "Mentorship preferences",
  "Profile visibility",
  "Your first goal",
];

export interface WizardInitial {
  headline: string;
  bio: string;
  degree: string;
  graduationYear: number;
  location: string;
  departmentId: string;
  visibility: "PUBLIC" | "PRIVATE";
  targetRoles: string;
  targetIndustries: string;
  mentorshipTopics: string;
  preferredMode: string;
  frequency: string;
}

export function OnboardingWizard({
  step,
  departments,
  skills,
  industries,
  topics,
  initial,
  completed,
  completeness,
}: {
  step: number;
  departments: Array<{ id: string; name: string }>;
  skills: Array<{ id: string; name: string; category: string }>;
  industries: string[];
  topics: string[];
  initial: WizardInitial;
  completed: boolean;
  completeness: number;
}) {
  const [state, formAction, pending] = useActionState<StepState, FormData>(saveOnboardingStepAction, {});
  const [state8, action8, pending8] = useActionState<StepState, FormData>(saveOnboardingStepAction, {});

  if (completed && step >= 8) {
    return (
      <Card title="Your career profile is ready.">
        <p style={{ margin: "0 0 14px" }}>
          Your Readiness Index baseline has been computed from your profile. As you complete goals,
          sessions and milestones with a mentor, it updates automatically.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="progress" style={{ flex: 1 }}><span style={{ width: `${completeness}%` }} /></div>
          <strong>{completeness}% complete</strong>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--ink-mute)", marginTop: 12 }}>
          Next: <a href="/mentors" style={{ color: "var(--brand)", fontWeight: 600 }}>discover mentors</a> matched to your goals.
        </p>
      </Card>
    );
  }

  return (
    <div className="stack-20">
      <Card
        title={`Step ${step} of 8 — ${STEP_TITLES[step - 1]}`}
        subtitle="Only the basics are required. Everything else can be skipped and refined later."
        action={<span className="badge badge-brand">{completeness}% complete</span>}
      >
        <div className="stepper" style={{ marginBottom: 8 }}>
          {STEP_TITLES.map((t, i) => (
            <span key={t} className={`step-pill ${i + 1 < step ? "done" : i + 1 === step ? "current" : ""}`}>
              <span className="n">{i + 1 < step ? <Check size={11} /> : i + 1}</span>
              {t}
            </span>
          ))}
        </div>
        <Progress value={(step / 8) * 100} />
      </Card>

      <Card>
        <form action={formAction} className="stack-16">
          <input type="hidden" name="step" value={step} />

          {step === 1 && (
            <>
              <div className="field">
                <label htmlFor="headline">Professional headline</label>
                <input id="headline" name="headline" className="input" defaultValue={initial.headline} placeholder="e.g. Aspiring Product Engineer" required />
                <span className="hint">This is the first thing mentors see.</span>
              </div>
              <div className="field">
                <label htmlFor="bio">About you</label>
                <textarea id="bio" name="bio" className="textarea" defaultValue={initial.bio} placeholder="What do you care about? What are you trying to become?" />
              </div>
              <div className="field">
                <label htmlFor="location">Location</label>
                <input id="location" name="location" className="input" defaultValue={initial.location} placeholder="City, Country" required />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="degree">Degree program</label>
                  <input id="degree" name="degree" className="input" defaultValue={initial.degree} placeholder="e.g. B.Tech, Computer Science" required />
                </div>
                <div className="field">
                  <label htmlFor="graduationYear">Graduation year</label>
                  <input id="graduationYear" name="graduationYear" type="number" min={2000} max={2100} className="input" defaultValue={initial.graduationYear} required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="departmentId">Department</label>
                <select id="departmentId" name="departmentId" className="select" defaultValue={initial.departmentId}>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="hint" style={{ margin: 0 }}>Pick at least 3 skills you're actively building. Mentors use these to close your gaps.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
                {skills.map((s) => (
                  <label key={s.id} className="check-row">
                    <input type="checkbox" name="skillIds" value={s.id} />
                    <span style={{ fontSize: "0.8438rem" }}>
                      {s.name} <small style={{ color: "var(--ink-mute)" }}>· {s.category}</small>
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="field">
                <label htmlFor="targetRoles">Target roles</label>
                <input id="targetRoles" name="targetRoles" className="input" defaultValue={initial.targetRoles} placeholder="e.g. Product Engineer, Associate Product Manager" required />
                <span className="hint">Comma-separated. These drive your match score (25% weight).</span>
              </div>
              <div className="field">
                <label htmlFor="targetIndustries">Industries you're interested in</label>
                <input id="targetIndustries" name="targetIndustries" className="input" defaultValue={initial.targetIndustries} placeholder="e.g. Product, Technology" list="industries" required />
                <datalist id="industries">
                  {industries.map((i) => <option key={i} value={i} />)}
                </datalist>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="field">
              <label htmlFor="mentorshipTopics">What do you want mentorship in?</label>
              <input id="mentorshipTopics" name="mentorshipTopics" className="input" defaultValue={initial.mentorshipTopics} placeholder="e.g. Interview preparation, Portfolio projects" list="topics" required />
              <datalist id="topics">
                {topics.map((t) => <option key={t} value={t} />)}
              </datalist>
              <span className="hint">Comma-separated. Mentors list the topics they coach on.</span>
            </div>
          )}

          {step === 6 && (
            <div className="form-grid">
              <div className="field">
                <label htmlFor="preferredMode">Preferred meeting mode</label>
                <select id="preferredMode" name="preferredMode" className="select" defaultValue={initial.preferredMode}>
                  <option>Video</option>
                  <option>Chat</option>
                  <option>In-person</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="frequency">Preferred frequency</label>
                <select id="frequency" name="frequency" className="select" defaultValue={initial.frequency}>
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          )}

          {step === 7 && (
            <>
              <div className="field">
                <label htmlFor="visibility">Who can see your full profile?</label>
                <select id="visibility" name="visibility" className="select" defaultValue={initial.visibility}>
                  <option value="PUBLIC">Verified alumni mentors (recommended)</option>
                  <option value="PRIVATE">Only mentors I request</option>
                </select>
              </div>
              <p className="hint">Your contact details are never shown. Mentors only see your career profile.</p>
            </>
          )}

          {step === 8 && (
            <>
              <div className="callout success">
                <Check size={18} />
                <div>
                  <strong>You're almost done</strong>
                  <p>Optionally set your first measurable goal. You can skip this and add goals with your mentor later.</p>
                </div>
              </div>
              <div className="field">
                <label htmlFor="goalTitle">First goal (optional)</label>
                <input id="goalTitle" name="goalTitle" className="input" placeholder="e.g. Build a strong software engineering portfolio" />
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="goalCategory">Category</label>
                  <select id="goalCategory" name="goalCategory" className="select">
                    <option>Portfolio project</option>
                    <option>Interview preparation</option>
                    <option>Skill development</option>
                    <option>Career planning</option>
                    <option>Internship search</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="goalTargetDate">Target date</label>
                  <input id="goalTargetDate" name="goalTargetDate" type="date" className="input" />
                </div>
              </div>
            </>
          )}

          {state.error && <div className="form-error" role="alert">{state.error}</div>}
          {state8.error && <div className="form-error" role="alert">{state8.error}</div>}

          <div className="form-actions">
            {step > 1 ? (
              <a href={`/student/onboarding?step=${step - 1}`} className="btn btn-ghost">
                <ArrowLeft size={15} /> Back
              </a>
            ) : <span />}
            <div style={{ display: "flex", gap: 10 }}>
              {step < 8 && (
                <button type="submit" name="skipped" value="1" className="btn btn-ghost" disabled={pending}>
                  Skip for now <SkipForward size={14} />
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {step === 8 ? "Finish — compute my readiness" : "Continue"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </form>

        {step === 8 && (
          <form action={action8} style={{ marginTop: 12 }}>
            <input type="hidden" name="step" value="8" />
            <input type="hidden" name="skipped" value="1" />
            <button type="submit" className="btn btn-ghost btn-sm" disabled={pending8}>
              Skip goal — finish now
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
