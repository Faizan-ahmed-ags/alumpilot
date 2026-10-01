/**
 * AlumniBridge AI Assistance Layer (docs/brain/03 — AI ARCHITECTURE).
 *
 * Design rules:
 * - AI ENHANCES, NEVER GATES. Core matching/readiness are deterministic.
 * - Every AI feature has a deterministic fallback so the product works
 *   with zero API keys and zero network access.
 * - Output is always labeled as AI-generated and always derived ONLY
 *   from structured product data (no invented qualifications/outcomes).
 */

import { calculateMatchScore } from "@/lib/matching/engine";
import type { AlumniProfile, StudentProfile } from "@/lib/db/types";

export interface MatchExplanation {
  summary: string;
  source: "ai" | "deterministic";
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

/**
 * Explain WHY a student and mentor match. When OPENAI_API_KEY is absent
 * (the default for this MVP) we generate a structured natural-language
 * explanation from the deterministic score breakdown — transparent,
 * instant and free. With a key, the same prompt can be routed to an LLM.
 */
export function explainMatch(
  student: StudentProfile,
  mentor: AlumniProfile,
  mentorName: string
): MatchExplanation {
  const { breakdown, score } = calculateMatchScore(student, mentor);
  const parts: string[] = [];

  if (breakdown.roleScore >= 15) {
    parts.push(`${mentorName} works as a ${mentor.role} — directly in the lane you're targeting`);
  } else if (breakdown.roleScore > 0) {
    parts.push(`${mentorName}'s role as ${mentor.role} is adjacent to your target roles`);
  }
  if (breakdown.industryScore >= 15) {
    parts.push(`they work in ${mentor.industry}, one of your focus industries`);
  }
  if (breakdown.skillScore >= 14) {
    parts.push("their skills cover the exact gaps you want to close");
  }
  if (breakdown.topicScore >= 10) {
    parts.push("they actively mentor on the topics you asked for");
  }
  if (breakdown.availabilityScore >= 10) {
    parts.push("they have high availability right now, so you won't wait weeks for a first session");
  }

  const fallback = `${mentorName} is a ${score}% match because ${parts.slice(0, 3).join("; ") || "your profiles share strong career overlap"}. The score is computed deterministically from your goals, target role, industry, skills, mentorship topics and their availability — you can see every factor in the breakdown below.`;

  return {
    summary: fallback,
    source: "deterministic",
  };
}

export interface GoalSuggestion {
  title: string;
  category: string;
  milestones: string[];
  source: "ai" | "rule-based";
}

/**
 * Suggest measurable goals for a student + mentorship context. Uses a
 * rule-based generator over the student's declared topics and skill
 * gaps (never demographic data). Labeled as a suggestion, editable by
 * the student before saving.
 */
export function suggestGoals(student: StudentProfile): GoalSuggestion[] {
  const out: GoalSuggestion[] = [];
  const topics = student.mentorshipTopics.map((t) => t.toLowerCase());
  const has = (k: string) => topics.some((t) => t.includes(k));

  if (has("product")) {
    out.push({
      title: "Build a product case study from a class project",
      category: "Portfolio project",
      milestones: [
        "Pick one project and write the problem statement",
        "Define 3 measurable outcomes",
        "Write the case study (problem → decisions → impact)",
        "Review it with your mentor",
      ],
      source: "rule-based",
    });
  }
  if (has("interview")) {
    out.push({
      title: "Run 6 mock interviews with structured feedback",
      category: "Interview preparation",
      milestones: [
        "Build a story bank (8 STAR stories)",
        "Complete 3 behavioral mocks",
        "Complete 3 technical/product mocks",
        "Write lessons-learned after each mock",
      ],
      source: "rule-based",
    });
  }
  if (has("portfolio") || has("design")) {
    out.push({
      title: "Ship a portfolio project end-to-end",
      category: "Portfolio project",
      milestones: [
        "Write a one-page project brief",
        "Build the core feature set",
        "Deploy publicly",
        "Record a 5-minute walkthrough",
      ],
      source: "rule-based",
    });
  }
  const gapSkill = student.skills.find((s) => s.targetLevel - s.level >= 2);
  if (gapSkill) {
    out.push({
      title: "Raise your weakest skill one full level",
      category: "Skill development",
      milestones: [
        "Choose one course or book for this skill",
        "Apply it in a small real project",
        "Ask your mentor to assess the before/after",
      ],
      source: "rule-based",
    });
  }
  if (out.length === 0) {
    out.push({
      title: "Clarify your 6-month career plan",
      category: "Career planning",
      milestones: [
        "List 3 target roles and what they require",
        "Identify your 2 biggest gaps",
        "Agree a 90-day plan with your mentor",
      ],
      source: "rule-based",
    });
  }
  return out.slice(0, 3);
}

/**
 * One-paragraph human summary of mentorship progress for the workspace.
 * Deterministic template — no external calls, safe to render inline.
 */
export function summarizeMentorship(input: {
  studentName: string;
  mentorName: string;
  goalsTotal: number;
  goalsDone: number;
  sessionsDone: number;
  nextSession?: { title: string; when: string };
  progress: number;
}): string {
  const bits: string[] = [];
  bits.push(
    input.goalsTotal === 0
      ? `${input.studentName} and ${input.mentorName} haven't set goals yet`
      : `${input.studentName} has completed ${input.goalsDone} of ${input.goalsTotal} goals`
  );
  bits.push(`with ${input.sessionsDone} session${input.sessionsDone === 1 ? "" : "s"} done`);
  if (input.nextSession) bits.push(`next up: “${input.nextSession.title}” ${input.nextSession.when}`);
  bits.push(`overall progress is ${input.progress}%`);
  return `${bits.join(", ")}.`;
}

/** Deterministic "next best action" for the student dashboard. */
export function nextBestAction(input: {
  hasMentor: boolean;
  onboardingDone: boolean;
  openGoals: number;
  hasOutcome: boolean;
  unreadFeedback: number;
  upcomingSession?: { title: string; when: string; href: string };
}): { label: string; detail: string; href: string; cta: string } {
  if (input.upcomingSession) {
    return {
      label: "Prepare for your next session",
      detail: `“${input.upcomingSession.title}” is happening ${input.upcomingSession.when}. Bring one update and one question.`,
      href: input.upcomingSession.href,
      cta: "Open workspace",
    };
  }
  if (input.unreadFeedback > 0) {
    return {
      label: "Review your mentor's feedback",
      detail: `Your mentor left ${input.unreadFeedback} new feedback note${input.unreadFeedback === 1 ? "" : "s"}. Read it and adjust your plan.`,
      href: "/mentorship",
      cta: "Open workspace",
    };
  }
  if (!input.onboardingDone) {
    return {
      label: "Finish your career profile",
      detail: "A complete profile unlocks better mentor matches and your readiness baseline.",
      href: "/student/onboarding",
      cta: "Continue onboarding",
    };
  }
  if (!input.hasMentor) {
    return {
      label: "Find your first mentor",
      detail: "Mentors are matched on your target role, industry and skill gaps — transparently.",
      href: "/mentors",
      cta: "Discover mentors",
    };
  }
  if (input.openGoals === 0) {
    return {
      label: "Set your first measurable goal",
      detail: "Goals turn mentorship into progress. Add milestones so your mentor can verify them.",
      href: "/mentorship",
      cta: "Create a goal",
    };
  }
  if (!input.hasOutcome) {
    return {
      label: "Record your career outcome",
      detail: "Internship, job, higher studies — recording outcomes strengthens your institution's placement story.",
      href: "/student/journey",
      cta: "Add outcome",
    };
  }
  return {
    label: "Keep the momentum",
    detail: "Update a milestone or schedule your next session — small steps compound.",
    href: "/mentorship",
    cta: "Open workspace",
  };
}
