"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { getStore, persist } from "@/lib/db/client";
import { addActivity, computeProfileCompleteness, computeBaselineReadiness } from "@/lib/db/compute";

/* ------------------------------------------------------------------ */
/* Onboarding wizard                                                  */
/* ------------------------------------------------------------------ */

export interface StepState {
  error?: string;
}

const onboardingSchema = z.object({
  step: z.coerce.number().int().min(1).max(8),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600).optional(),
  degree: z.string().trim().max(120).optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2100).optional(),
  location: z.string().trim().max(120).optional(),
  departmentId: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  skillIds: z.string().optional(),
  targetRoles: z.string().trim().max(240).optional(),
  targetIndustries: z.string().trim().max(240).optional(),
  mentorshipTopics: z.string().trim().max(400).optional(),
  preferredMode: z.enum(["Video", "Chat", "In-person", "Hybrid"]).optional(),
  frequency: z.string().trim().max(60).optional(),
  goalTitle: z.string().trim().max(140).optional(),
  goalCategory: z.string().trim().max(60).optional(),
  goalTargetDate: z.string().optional(),
  skipped: z.string().optional(),
});

export async function saveOnboardingStepAction(_prev: StepState, formData: FormData): Promise<StepState> {
  const user = await requireRole("STUDENT");
  const parsed = onboardingSchema.safeParse({
    step: formData.get("step"),
    headline: formData.get("headline") ?? undefined,
    bio: formData.get("bio") ?? undefined,
    degree: formData.get("degree") ?? undefined,
    graduationYear: formData.get("graduationYear") || undefined,
    location: formData.get("location") ?? undefined,
    departmentId: formData.get("departmentId") ?? undefined,
    visibility: formData.get("visibility") ?? undefined,
    skillIds: formData.get("skillIds") ?? undefined,
    targetRoles: formData.get("targetRoles") ?? undefined,
    targetIndustries: formData.get("targetIndustries") ?? undefined,
    mentorshipTopics: formData.get("mentorshipTopics") ?? undefined,
    preferredMode: formData.get("preferredMode") ?? undefined,
    frequency: formData.get("frequency") ?? undefined,
    goalTitle: formData.get("goalTitle") ?? undefined,
    goalCategory: formData.get("goalCategory") ?? undefined,
    goalTargetDate: formData.get("goalTargetDate") ?? undefined,
    skipped: formData.get("skipped") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check your answers." };
  }

  const db = getStore();
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  if (!profile) return { error: "Student profile missing. Contact support." };

  const d = parsed.data;
  const now = new Date().toISOString();

  switch (d.step) {
    case 1:
      profile.headline = d.headline ?? profile.headline;
      profile.bio = d.bio ?? profile.bio;
      profile.location = d.location ?? profile.location;
      break;
    case 2:
      profile.degree = d.degree ?? profile.degree;
      profile.graduationYear = d.graduationYear ?? profile.graduationYear;
      if (d.departmentId && db.departments.some((dep) => dep.id === d.departmentId)) {
        profile.departmentId = d.departmentId;
      }
      break;
    case 3: {
      const ids = (d.skillIds ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const valid = ids.filter((id) => db.skills.some((s) => s.id === id));
      profile.skills = valid.map((id) => ({ skillId: id, level: 2, targetLevel: 4 }));
      break;
    }
    case 4: {
      const split = (s?: string) => (s ?? "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 6);
      const roles = split(d.targetRoles);
      const inds = split(d.targetIndustries);
      if (roles.length > 0) {
        profile.targetRoles = roles;
        profile.careerInterests = roles.slice(0, 2).map((r) => ({ targetRole: r, industry: inds[0] ?? "Technology", interestLevel: "Primary" as const }));
      }
      if (inds.length > 0) profile.targetIndustries = inds;
      break;
    }
    case 5: {
      const topics = (d.mentorshipTopics ?? "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 6);
      if (topics.length > 0) profile.mentorshipTopics = topics;
      break;
    }
    case 6:
      if (d.preferredMode) profile.mentorshipPreferences.mode = d.preferredMode;
      if (d.frequency) profile.mentorshipPreferences.frequency = d.frequency;
      break;
    case 7:
      if (d.visibility) profile.visibility = d.visibility;
      break;
    case 8: {
      if (d.goalTitle && d.goalTitle.length >= 8) {
        db.goals.push({
          id: `goal_${Date.now().toString(36)}`,
          mentorshipId: "",
          studentUserId: user.id,
          mentorUserId: "",
          title: d.goalTitle,
          description: "Set during onboarding",
          category: d.goalCategory ?? "Career planning",
          targetDate: d.goalTargetDate && !isNaN(new Date(d.goalTargetDate).getTime())
            ? new Date(d.goalTargetDate).toISOString()
            : new Date(Date.now() + 60 * 86_400_000).toISOString(),
          status: "NOT_STARTED",
          progress: 0,
          mentorVerified: false,
          createdAt: now,
          updatedAt: now,
        });
      }
      break;
    }
  }

  profile.onboardingStep = Math.max(profile.onboardingStep, d.step + 1);
  profile.profileCompleteness = computeProfileCompleteness(profile);
  persist();

  const nextStep = Math.min(8, d.step + 1);
  revalidatePath("/student/onboarding");
  if (d.step >= 8) {
    profile.onboardingCompleted = true;
    computeBaselineReadiness(db, user.id);
    addActivity(db, user.id, "GOAL", "Completed career onboarding");
    persist();
    redirect("/student/dashboard?welcome=1");
  }
  redirect(`/student/onboarding?step=${nextStep}`);
}

/** Mark onboarding as complete early (skip-ahead) — computes baseline readiness. */
export async function finishOnboardingAction(formData: FormData): Promise<void> {
  const user = await requireRole("STUDENT");
  const db = getStore();
  const profile = db.studentProfiles.find((p) => p.userId === user.id);
  if (!profile) redirect("/login");
  profile.onboardingCompleted = true;
  profile.profileCompleteness = computeProfileCompleteness(profile);
  computeBaselineReadiness(db, user.id);
  addActivity(db, user.id, "GOAL", "Completed career onboarding");
  persist();
  revalidatePath("/student/dashboard");
  redirect("/student/dashboard");
}
