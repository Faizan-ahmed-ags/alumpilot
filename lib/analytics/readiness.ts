import type { ReadinessConfig, StudentProfile } from "@/lib/db/types";
import { averageLevel } from "@/lib/db/compute";

/**
 * AlumniBridge Readiness Index.
 *
 * IMPORTANT: This is an informational product indicator that summarises
 * observable engagement signals. It is NOT a scientifically validated
 * assessment and must never be used to reject or rank students. Scores
 * are always shown alongside an explanation of how they were computed.
 */

export interface ReadinessContext {
  profile: StudentProfile;
  skillsScore: number; // 0-100 based on skill levels & gaps
  projectsScore: number; // 0-100 based on portfolio goals/milestones
  mentorshipEngagement: number; // 0-100 session completion & activity
  goalsProgress: number; // 0-100 average goal progress
  interviewScore: number; // 0-100 based on interview-prep engagement
  hasInternship: boolean;
  profileCompleteness: number;
}

export interface ReadinessResult {
  index: number;
  breakdown: Record<string, number>;
  explanation: string[];
}

export function defaultReadinessConfig(): ReadinessConfig {
  return {
    weights: {
      skills: 0.25,
      projects: 0.15,
      mentorship: 0.2,
      goals: 0.15,
      interview: 0.1,
      profile: 0.1,
      internship: 0.05,
    },
    version: 1,
  };
}

const clamp100 = (n: number) => Math.round(Math.min(100, Math.max(0, n)));

export function computeReadiness(
  ctx: ReadinessContext,
  config: ReadinessConfig = defaultReadinessConfig()
): ReadinessResult {
  const w = config.weights;
  const skills = clamp100(ctx.skillsScore);
  const projects = clamp100(ctx.projectsScore);
  const mentorship = clamp100(ctx.mentorshipEngagement);
  const goals = clamp100(ctx.goalsProgress);
  const interview = clamp100(ctx.interviewScore);
  const profile = clamp100(ctx.profileCompleteness);
  const internship = ctx.hasInternship ? 100 : 0;

  const raw =
    skills * w.skills +
    projects * w.projects +
    mentorship * w.mentorship +
    goals * w.goals +
    interview * w.interview +
    profile * w.profile +
    internship * w.internship;

  const index = clamp100(Math.round(raw));

  return {
    index,
    breakdown: { skills, projects, mentorship, goals, interview, profile, internship },
    explanation: [
      `${skills}% skill development (current level vs. target).`,
      `${projects}% portfolio/project evidence.`,
      `${mentorship}% mentorship engagement (sessions & consistency).`,
      `${goals}% goal completion pace.`,
      `${interview}% interview preparation.`,
      `${profile}% profile completeness.`,
      internship === 100 ? "Internship experience recorded." : "No internship recorded yet.",
      `Combined with weights ${Math.round(w.skills * 100)}% skills, ${Math.round(
        w.mentorship * 100
      )}% mentorship, ${Math.round(w.goals * 100)}% goals, and smaller factors for projects, interview, profile and internship.`,
    ],
  };
}

/** Baseline score used at the end of onboarding (skills + profile only). */
export function baselineReadiness(
  profile: StudentProfile,
  config: ReadinessConfig = defaultReadinessConfig()
): ReadinessResult {
  const skillAvg = averageLevel(profile.skills) ?? 0;
  const skillsScore = Math.round((skillAvg / 5) * 100);
  return computeReadiness(
    {
      profile,
      skillsScore,
      projectsScore: 0,
      mentorshipEngagement: 0,
      goalsProgress: 0,
      interviewScore: 0,
      hasInternship: false,
      profileCompleteness: profile.profileCompleteness,
    },
    config
  );
}