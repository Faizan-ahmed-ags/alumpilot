import type { AppNotification, Db, Goal, Mentorship, Skill, SkillAssessment, StudentProfile } from "./types";
import { uid } from "@/lib/utils/id";
import { computeReadiness, baselineReadiness } from "@/lib/analytics/readiness";

/**
 * Profile completeness — how much of a student's career profile is filled.
 * Used by onboarding, dashboards and early-intervention lists.
 */
export function computeProfileCompleteness(profile: Partial<StudentProfile>): number {
  interface Check {
    ok: boolean;
  }
  const checks: Check[] = [
    { ok: Boolean(profile.headline && profile.headline.trim().length > 0) },
    { ok: Boolean(profile.bio && profile.bio.trim().length > 0) },
    { ok: Boolean(profile.degree && profile.degree.trim().length > 0) },
    { ok: Boolean(profile.graduationYear && profile.graduationYear > 0) },
    { ok: Boolean(profile.location && profile.location.trim().length > 0) },
    { ok: (profile.skills ?? []).length >= 3 },
    { ok: (profile.careerInterests ?? []).length >= 1 },
    { ok: (profile.targetRoles ?? []).length >= 1 },
    { ok: (profile.targetIndustries ?? []).length >= 1 },
    { ok: (profile.mentorshipTopics ?? []).length >= 1 },
  ];
  const done = checks.filter((c) => c.ok).length;
  return Math.round((done / checks.length) * 100);
}

/** Levelled skills nicely labelled. */
export const LEVEL_LABELS = ["", "Exploring", "Beginner", "Intermediate", "Advanced", "Expert"];

export function averageLevel(assessments: SkillAssessment[]): number {
  if (assessments.length === 0) return 0;
  const sum = assessments.reduce((acc, a) => acc + a.level, 0);
  return sum / assessments.length;
}

export function gapScore(assessments: SkillAssessment[]): number {
  if (assessments.length === 0) return 0;
  const gaps = assessments.map((a) => Math.max(0, a.targetLevel - a.level));
  const sum = gaps.reduce((acc, g) => acc + g, 0);
  return sum / assessments.length;
}

export function skillById(skills: Skill[], id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ */
/* Cross-entity derived computations used by dashboards & actions      */
/* ------------------------------------------------------------------ */

export function addNotification(
  db: Db,
  userId: string,
  n: { title: string; body: string; type: AppNotification["type"] }
): void {
  db.notifications.push({
    id: uid("n"),
    userId,
    title: n.title,
    body: n.body,
    type: n.type,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function addActivity(db: Db, userId: string, type: import("./types").ActivityEvent["type"], description: string): void {
  db.activity.push({
    id: uid("act"),
    userId,
    type,
    description,
    createdAt: new Date().toISOString(),
  });
}

/** Mentorship progress = average goal progress, penalised by overdue goals. */
export function computeMentorshipProgress(db: Db, mentorshipId: string): void {
  const m = db.mentorships.find((x) => x.id === mentorshipId);
  if (!m) return;
  const goals = db.goals.filter((g) => g.mentorshipId === m.id);
  const now = Date.now();
  let avg = 0;
  if (goals.length > 0) {
    const total = goals.reduce((acc, g) => {
      let p = g.progress;
      const overdue = new Date(g.targetDate).getTime() < now && g.status !== "COMPLETED";
      if (overdue) p = Math.min(p, 60); // overdue goals cap their contribution
      return acc + p;
    }, 0);
    avg = Math.round(total / goals.length);
    for (const g of goals) {
      const overdue = new Date(g.targetDate).getTime() < now && g.status !== "COMPLETED";
      if (overdue && g.status !== "AT_RISK") {
        g.status = "AT_RISK";
        g.updatedAt = new Date().toISOString();
      }
    }
  }
  m.progress = Math.min(100, Math.max(0, avg));
  m.lastActivityAt = new Date().toISOString();
}

/**
 * Recompute the deterministic Readiness Index for a student from live
 * entity data. Informational only — always shown with its explanation.
 */
export function recomputeReadinessForStudent(db: Db, studentUserId: string): number {
  const profile = db.studentProfiles.find((p) => p.userId === studentUserId);
  if (!profile) return 0;

  const skillAvg = averageLevel(profile.skills);
  const skillsScore = Math.round((skillAvg / 5) * 100);

  const goals = db.goals.filter((g) => g.studentUserId === studentUserId);
  const goalsProgress = goals.length === 0 ? 0 : Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length);
  const projectsScore = Math.min(100, Math.round(goals.filter((g) => g.category === "Portfolio project").reduce((a, g) => a + g.progress, 0) / 1.5));

  const mentorships = db.mentorships.filter((m) => m.studentUserId === studentUserId);
  const sessionsDone = db.sessions.filter((s) => mentorships.some((m) => m.id === s.mentorshipId) && s.status === "COMPLETED").length;
  const feedbackCount = db.feedback.filter((f) => f.studentUserId === studentUserId).length;
  const mentorshipEngagement = Math.min(100, sessionsDone * 22 + feedbackCount * 12 + (mentorships.length > 0 ? 20 : 0));

  const interviewScore = Math.min(100, goals.filter((g) => g.category === "Interview preparation").reduce((a, g) => a + g.progress, 0));
  const hasInternship = db.careerOutcomes.some(
    (c) => c.studentUserId === studentUserId && (c.status === "INTERNSHIP" || c.status === "EMPLOYED")
  );

  const result = computeReadiness({
    profile,
    skillsScore,
    projectsScore,
    mentorshipEngagement,
    goalsProgress,
    interviewScore,
    hasInternship,
    profileCompleteness: profile.profileCompleteness,
  }, db.meta.readinessConfig);

  profile.readinessIndex = result.index;
  profile.readinessBreakdown = result.breakdown;
  profile.updatedAt = new Date().toISOString();
  return result.index;
}

/** End-of-onboarding baseline (skills + profile only). */
export function computeBaselineReadiness(db: Db, studentUserId: string): number {
  const profile = db.studentProfiles.find((p) => p.userId === studentUserId);
  if (!profile) return 0;
  const result = baselineReadiness(profile, db.meta.readinessConfig);
  profile.readinessIndex = result.index;
  profile.readinessBreakdown = result.breakdown;
  profile.updatedAt = new Date().toISOString();
  return result.index;
}