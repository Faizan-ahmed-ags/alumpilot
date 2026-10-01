"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/guard";
import { getStore, persist } from "@/lib/db/client";
import { uid } from "@/lib/utils/id";
import { badRequest, forbidden, notFound } from "@/lib/api/errors";
import { addActivity, computeMentorshipProgress, recomputeReadinessForStudent } from "@/lib/db/compute";

const schema = z.object({
  goalId: z.string().min(1),
  title: z.string().trim().min(4, "Milestone needs a short title").max(160),
});

export async function createMilestoneAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const parsed = schema.safeParse({ goalId: formData.get("goalId"), title: formData.get("title") });
  if (!parsed.success) throw badRequest("Invalid milestone");

  const db = getStore();
  const goal = db.goals.find((g) => g.id === parsed.data.goalId);
  if (!goal) throw notFound("Goal not found");
  const m = db.mentorships.find((x) => x.id === goal.mentorshipId);
  if (!m || (m.studentUserId !== user.id && m.mentorUserId !== user.id)) {
    throw forbidden("Not your mentorship");
  }
  db.milestones.push({
    id: uid("ms"),
    goalId: goal.id,
    title: parsed.data.title,
    status: "TODO",
    createdAt: new Date().toISOString(),
  });
  computeMentorshipProgress(db, m.id);
  addActivity(db, user.id, "MILESTONE", `Added milestone “${parsed.data.title}”`);
  persist();
  revalidatePath("/mentorship");
  revalidatePath("/student/goals");
}
