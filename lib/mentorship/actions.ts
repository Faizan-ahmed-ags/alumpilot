"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser, requireRole } from "@/lib/auth/guard";
import { getStore, persist } from "@/lib/db/client";
import { uid } from "@/lib/utils/id";
import { badRequest, forbidden, notFound } from "@/lib/api/errors";
import { computeMentorshipProgress, recomputeReadinessForStudent, addNotification, addActivity } from "@/lib/db/compute";

/* ------------------------------------------------------------------ */
/* Mentorship requests                                                */
/* ------------------------------------------------------------------ */

const requestSchema = z.object({
  mentorUserId: z.string().min(1),
  goal: z.string().trim().min(20, "Describe your mentorship goal in at least 20 characters").max(400),
  message: z.string().trim().min(20, "Write a short message of at least 20 characters").max(2000),
  meetingPreference: z.string().min(2).max(80),
  availability: z.string().min(2).max(120),
});

export interface RequestState {
  error?: string;
  success?: string;
}

export async function createMentorshipRequestAction(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in to continue." };
  if (user.role !== "STUDENT") return { error: "Only students can request mentorship." };

  const mentorUserId = String(formData.get("mentorUserId") ?? "");
  const parsed = requestSchema.safeParse({
    mentorUserId,
    goal: formData.get("goal"),
    message: formData.get("message"),
    meetingPreference: formData.get("meetingPreference"),
    availability: formData.get("availability"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check your request details." };
  }

  const db = getStore();
  const mentor = db.users.find((u) => u.id === parsed.data.mentorUserId && u.role === "ALUMNI");
  if (!mentor) return { error: "That mentor could not be found." };

  const mentorProfile = db.alumniProfiles.find((a) => a.userId === mentor.id);
  if (!mentorProfile || !mentorProfile.mentorshipAvailable) {
    return { error: "This mentor isn't accepting requests right now." };
  }

  const alreadyPending = db.mentorRequests.some(
    (r) => r.studentUserId === user.id && r.mentorUserId === mentor.id && r.status === "PENDING"
  );
  const alreadyActive = db.mentorships.some(
    (m) => m.studentUserId === user.id && m.mentorUserId === mentor.id && m.status === "ACTIVE"
  );
  if (alreadyPending) return { error: "You already have a pending request with this mentor." };
  if (alreadyActive) return { error: "You're already mentored by them — open your mentorship workspace." };

  const now = new Date().toISOString();
  db.mentorRequests.push({
    id: uid("mreq"),
    studentUserId: user.id,
    mentorUserId: mentor.id,
    goal: parsed.data.goal,
    reason: "Matched on shared goals, role and skill fit.",
    message: parsed.data.message,
    meetingPreference: parsed.data.meetingPreference,
    availability: parsed.data.availability,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  });
  addNotification(db, mentor.id, {
    title: "New mentorship request",
    body: `${user.name} requested mentorship: “${parsed.data.goal}”.`,
    type: "MENTOR_REQUEST",
  });
  addActivity(db, user.id, "MENTOR_REQUEST", `Requested mentorship from ${mentor.name}`);
  persist();
  revalidatePath("/mentors");
  revalidatePath("/student/mentorship");
  return { success: `Request sent to ${mentor.name}. We'll notify you when they respond.` };
}

export async function respondToRequestAction(formData: FormData): Promise<void> {
  const user = await requireRole("ALUMNI");
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "ACCEPTED" && decision !== "DECLINED") throw badRequest("Invalid decision");

  const db = getStore();
  const request = db.mentorRequests.find((r) => r.id === requestId);
  if (!request) throw notFound("Request not found");
  if (request.mentorUserId !== user.id) throw forbidden("This request belongs to another mentor");
  if (request.status !== "PENDING") throw badRequest("This request has already been handled");

  const now = new Date().toISOString();
  request.status = decision;
  request.updatedAt = now;

  const student = db.users.find((u) => u.id === request.studentUserId);

  if (decision === "ACCEPTED") {
    db.mentorships.push({
      id: uid("mentorship"),
      requestId: request.id,
      studentUserId: request.studentUserId,
      mentorUserId: user.id,
      status: "ACTIVE",
      startedAt: now,
      progress: 0,
      goalsCompleted: 0,
      sessionCount: 0,
      lastActivityAt: now,
      createdAt: now,
    });
    addNotification(db, request.studentUserId, {
      title: "Mentorship request accepted 🎉",
      body: `${user.name} accepted your request. Your mentorship workspace is ready.`,
      type: "MENTOR_REQUEST",
    });
    addActivity(db, user.id, "MENTOR_REQUEST", `Accepted ${student?.name ?? "a student"}'s mentorship request`);
  } else {
    addNotification(db, request.studentUserId, {
      title: "Mentorship request declined",
      body: `${user.name} isn't able to take this mentorship right now. Try another mentor — matching will suggest alternatives.`,
      type: "MENTOR_REQUEST",
    });
  }
  persist();
  revalidatePath("/alumni/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/mentorship");
  if (decision === "ACCEPTED") {
    redirect(`/mentorship?after=accepted`);
  }
}

export async function completeMentorshipAction(formData: FormData): Promise<void> {
  const user = await requireRole("ALUMNI", "STUDENT", "ADMIN");
  const mentorshipId = String(formData.get("mentorshipId") ?? "");
  const db = getStore();
  const m = db.mentorships.find((x) => x.id === mentorshipId);
  if (!m) throw notFound("Mentorship not found");
  const isParticipant = m.studentUserId === user.id || m.mentorUserId === user.id;
  if (!isParticipant && user.role !== "ADMIN") throw forbidden("Only participants can complete this mentorship");
  if (m.status !== "ACTIVE") throw badRequest("Mentorship already completed");

  m.status = "COMPLETED";
  m.completedAt = new Date().toISOString();
  m.progress = 100;

  const request = db.mentorRequests.find((r) => r.id === m.requestId);
  if (request && request.status === "ACCEPTED") {
    request.status = "COMPLETED";
    request.updatedAt = new Date().toISOString();
  }
  const mentorProfile = db.alumniProfiles.find((a) => a.userId === m.mentorUserId);
  if (mentorProfile) mentorProfile.studentsMentored += 1;

  const otherId = m.studentUserId === user.id ? m.mentorUserId : m.studentUserId;
  addNotification(db, otherId, {
    title: "Mentorship completed",
    body: `${user.name} marked your mentorship as complete. It now appears in your impact journey.`,
    type: "SYSTEM",
  });
  persist();
  revalidatePath("/mentorship");
  revalidatePath("/alumni/dashboard");
  revalidatePath("/student/dashboard");
}

/* ------------------------------------------------------------------ */
/* Goals & milestones                                                 */
/* ------------------------------------------------------------------ */

const goalSchema = z.object({
  mentorshipId: z.string().min(1),
  title: z.string().trim().min(8, "Give the goal a clear title (8+ characters)").max(140),
  description: z.string().trim().max(600).optional(),
  category: z.string().min(2).max(60),
  targetDate: z.string().min(4),
  milestones: z.string().max(1000).optional(),
});

export async function createGoalAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in to continue." };
  const parsed = goalSchema.safeParse({
    mentorshipId: formData.get("mentorshipId"),
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    category: formData.get("category"),
    targetDate: formData.get("targetDate"),
    milestones: formData.get("milestones") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check the goal details." };
  }

  const db = getStore();
  const m = db.mentorships.find((x) => x.id === parsed.data.mentorshipId);
  if (!m) return { error: "Mentorship not found." };
  const isParticipant = m.studentUserId === user.id || m.mentorUserId === user.id;
  if (!isParticipant) throw forbidden("You are not part of this mentorship");
  if (m.status !== "ACTIVE") return { error: "This mentorship is completed — goals can no longer be added." };

  const target = new Date(parsed.data.targetDate);
  if (isNaN(target.getTime())) return { error: "Pick a valid target date." };

  const now = new Date().toISOString();
  const goalId = uid("goal");
  db.goals.push({
    id: goalId,
    mentorshipId: m.id,
    studentUserId: m.studentUserId,
    mentorUserId: m.mentorUserId,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    category: parsed.data.category,
    targetDate: target.toISOString(),
    status: "IN_PROGRESS",
    progress: 0,
    mentorVerified: false,
    createdAt: now,
    updatedAt: now,
  });

  // Optional comma/newline separated milestones created inline.
  const milestoneLines = (parsed.data.milestones ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 10);
  for (const line of milestoneLines) {
    db.milestones.push({ id: uid("ms"), goalId, title: line, status: "TODO", createdAt: now });
  }

  addActivity(db, user.id, "GOAL", `Created goal “${parsed.data.title}”`);
  recomputeReadinessForStudent(db, m.studentUserId);
  persist();
  revalidatePath("/mentorship");
  revalidatePath("/student/goals");
  revalidatePath("/student/dashboard");
  return {};
}

const milestoneActionSchema = z.object({
  milestoneId: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  evidence: z.string().trim().max(400).optional(),
});

export async function updateMilestoneAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const parsed = milestoneActionSchema.safeParse({
    milestoneId: formData.get("milestoneId"),
    status: formData.get("status"),
    evidence: formData.get("evidence") ?? undefined,
  });
  if (!parsed.success) throw badRequest("Invalid milestone update");

  const db = getStore();
  const ms = db.milestones.find((x) => x.id === parsed.data.milestoneId);
  if (!ms) throw notFound("Milestone not found");
  const goal = db.goals.find((g) => g.id === ms.goalId);
  if (!goal) throw notFound("Goal not found");
  const m = db.mentorships.find((x) => x.id === goal.mentorshipId);
  const isParticipant = m && (m.studentUserId === user.id || m.mentorUserId === user.id);
  if (!isParticipant) throw forbidden("You are not part of this mentorship");

  ms.status = parsed.data.status;
  if (parsed.data.evidence !== undefined) ms.evidence = parsed.data.evidence || undefined;
  if (parsed.data.status === "DONE") {
    ms.completedAt = new Date().toISOString();
    // Mentor marking DONE counts as verification of the milestone evidence.
    if (user.id === goal.mentorUserId) goal.mentorVerified = true;
  } else {
    ms.completedAt = undefined;
  }

  // Recompute goal progress from milestone completion (deterministic).
  const siblings = db.milestones.filter((x) => x.goalId === goal.id);
  const done = siblings.filter((x) => x.status === "DONE").length;
  goal.progress = siblings.length === 0 ? (goal.mentorVerified ? 100 : 0) : Math.round((done / siblings.length) * 100);
  goal.updatedAt = new Date().toISOString();
  if (goal.progress === 100 && goal.status !== "COMPLETED") {
    goal.status = "COMPLETED";
    const mentorship = db.mentorships.find((x) => x.id === goal.mentorshipId);
    if (mentorship) mentorship.goalsCompleted += 1;
    addNotification(db, goal.studentUserId, {
      title: "Goal completed 🎉",
      body: `“${goal.title}” is complete. Your readiness index has been updated.`,
      type: "GOAL",
    });
  } else if (goal.status === "COMPLETED" && goal.progress < 100) {
    goal.status = "IN_PROGRESS";
  }

  computeMentorshipProgress(db, goal.mentorshipId);
  recomputeReadinessForStudent(db, goal.studentUserId);
  persist();
  revalidatePath("/mentorship");
  revalidatePath("/student/goals");
  revalidatePath("/student/dashboard");
  revalidatePath("/alumni/dashboard");
}

const verifyGoalSchema = z.object({ goalId: z.string().min(1), verified: z.enum(["true", "false"]) });

export async function verifyGoalAction(formData: FormData): Promise<void> {
  const user = await requireRole("ALUMNI");
  const parsed = verifyGoalSchema.safeParse({
    goalId: formData.get("goalId"),
    verified: formData.get("verified"),
  });
  if (!parsed.success) throw badRequest("Invalid verification request");
  const db = getStore();
  const goal = db.goals.find((g) => g.id === parsed.data.goalId);
  if (!goal) throw notFound("Goal not found");
  if (goal.mentorUserId !== user.id) throw forbidden("Only the assigned mentor can verify this goal");
  goal.mentorVerified = parsed.data.verified === "true";
  goal.updatedAt = new Date().toISOString();
  addActivity(db, user.id, "GOAL", `${goal.mentorVerified ? "Verified" : "Un-verified"} goal “${goal.title}”`);
  recomputeReadinessForStudent(db, goal.studentUserId);
  persist();
  revalidatePath("/mentorship");
  revalidatePath("/alumni/dashboard");
}

/* ------------------------------------------------------------------ */
/* Sessions                                                           */
/* ------------------------------------------------------------------ */

const sessionSchema = z.object({
  mentorshipId: z.string().min(1),
  title: z.string().trim().min(4, "Give the session a short title").max(120),
  scheduledAt: z.string().min(10),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  mode: z.enum(["Video", "Chat", "In-person", "Hybrid"]),
  agenda: z.string().trim().max(600).optional(),
});

export async function scheduleSessionAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in to continue." };
  const parsed = sessionSchema.safeParse({
    mentorshipId: formData.get("mentorshipId"),
    title: formData.get("title"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
    mode: formData.get("mode"),
    agenda: formData.get("agenda") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check the session details." };
  }
  const db = getStore();
  const m = db.mentorships.find((x) => x.id === parsed.data.mentorshipId);
  if (!m) return { error: "Mentorship not found." };
  if (m.studentUserId !== user.id && m.mentorUserId !== user.id) throw forbidden("You are not part of this mentorship");

  const when = new Date(parsed.data.scheduledAt);
  if (isNaN(when.getTime())) return { error: "Pick a valid date and time." };

  db.sessions.push({
    id: uid("sess"),
    mentorshipId: m.id,
    title: parsed.data.title,
    scheduledAt: when.toISOString(),
    durationMinutes: parsed.data.durationMinutes,
    mode: parsed.data.mode,
    status: "SCHEDULED",
    agenda: parsed.data.agenda,
    createdAt: new Date().toISOString(),
  });
  const otherId = m.studentUserId === user.id ? m.mentorUserId : m.studentUserId;
  addNotification(db, otherId, {
    title: "Session scheduled",
    body: `${user.name} scheduled “${parsed.data.title}”.`,
    type: "SESSION",
  });
  persist();
  revalidatePath("/mentorship");
  return {};
}

const sessionCompleteSchema = z.object({
  sessionId: z.string().min(1),
  notes: z.string().trim().max(2000).optional(),
});

export async function completeSessionAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const parsed = sessionCompleteSchema.safeParse({
    sessionId: formData.get("sessionId"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) throw badRequest("Invalid session update");

  const db = getStore();
  const sess = db.sessions.find((s) => s.id === parsed.data.sessionId);
  if (!sess) throw notFound("Session not found");
  const m = db.mentorships.find((x) => x.id === sess.mentorshipId);
  if (!m || (m.studentUserId !== user.id && m.mentorUserId !== user.id)) {
    throw forbidden("You are not part of this mentorship");
  }
  if (sess.status === "COMPLETED") throw badRequest("Session already completed");

  sess.status = "COMPLETED";
  if (parsed.data.notes) sess.notes = parsed.data.notes;
  m.sessionCount += 1;
  m.lastActivityAt = new Date().toISOString();

  const mentorProfile = db.alumniProfiles.find((a) => a.userId === m.mentorUserId);
  if (mentorProfile) mentorProfile.sessionsCompleted += 1;

  const otherId = m.studentUserId === user.id ? m.mentorUserId : m.studentUserId;
  addActivity(db, user.id, "SESSION", `Completed “${sess.title}”`);
  addNotification(db, otherId, {
    title: "Session completed",
    body: `“${sess.title}” was marked complete. Notes were saved to your workspace.`,
    type: "SESSION",
  });

  computeMentorshipProgress(db, m.id);
  recomputeReadinessForStudent(db, m.studentUserId);
  persist();
  revalidatePath("/mentorship");
  revalidatePath("/alumni/dashboard");
  revalidatePath("/student/dashboard");
}

/* ------------------------------------------------------------------ */
/* Notes & messages                                                   */
/* ------------------------------------------------------------------ */

const noteSchema = z.object({ mentorshipId: z.string().min(1), body: z.string().trim().min(2).max(600) });

export async function addNoteAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const parsed = noteSchema.safeParse({
    mentorshipId: formData.get("mentorshipId"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw badRequest("Write a short note first");
  const db = getStore();
  const m = db.mentorships.find((x) => x.id === parsed.data.mentorshipId);
  if (!m || (m.studentUserId !== user.id && m.mentorUserId !== user.id)) {
    throw forbidden("You are not part of this mentorship");
  }
  db.notes.push({
    id: uid("note"),
    mentorshipId: m.id,
    authorUserId: user.id,
    authorRole: user.role === "ALUMNI" ? "ALUMNI" : "STUDENT",
    body: parsed.data.body,
    createdAt: new Date().toISOString(),
  });
  m.lastActivityAt = new Date().toISOString();
  persist();
  revalidatePath("/mentorship");
}

const messageSchema = z.object({ conversationId: z.string().min(1), body: z.string().trim().min(1).max(2000) });

export async function sendMessageAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw badRequest("Message cannot be empty");
  const db = getStore();
  const conv = db.conversations.find((c) => c.id === parsed.data.conversationId);
  if (!conv || !conv.participantIds.includes(user.id)) throw forbidden("You are not part of this conversation");
  db.messages.push({
    id: uid("msg"),
    conversationId: conv.id,
    senderUserId: user.id,
    body: parsed.data.body,
    createdAt: new Date().toISOString(),
  });
  conv.updatedAt = new Date().toISOString();
  const other = conv.participantIds.find((p) => p !== user.id);
  if (other) {
    addNotification(db, other, { title: `New message from ${user.name}`, body: parsed.data.body.slice(0, 120), type: "SYSTEM" });
  }
  persist();
  revalidatePath("/mentorship");
}

/* ------------------------------------------------------------------ */
/* Feedback                                                           */
/* ------------------------------------------------------------------ */

const feedbackSchema = z.object({
  mentorshipId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  strengths: z.string().trim().min(10, "Describe at least one strength (10+ characters)").max(800),
  areasToImprove: z.string().trim().min(10, "Describe at least one growth area (10+ characters)").max(800),
});

export async function addFeedbackAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in to continue." };
  if (user.role !== "ALUMNI") return { error: "Only mentors can add session feedback." };
  const parsed = feedbackSchema.safeParse({
    mentorshipId: formData.get("mentorshipId"),
    rating: formData.get("rating"),
    strengths: formData.get("strengths"),
    areasToImprove: formData.get("areasToImprove"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check the feedback details." };
  }
  const db = getStore();
  const m = db.mentorships.find((x) => x.id === parsed.data.mentorshipId);
  if (!m) return { error: "Mentorship not found." };
  if (m.mentorUserId !== user.id) throw forbidden("Only the assigned mentor can add feedback");

  db.feedback.push({
    id: uid("fb"),
    mentorshipId: m.id,
    mentorUserId: user.id,
    studentUserId: m.studentUserId,
    rating: parsed.data.rating,
    strengths: parsed.data.strengths,
    areasToImprove: parsed.data.areasToImprove,
    createdAt: new Date().toISOString(),
  });
  m.lastActivityAt = new Date().toISOString();
  addActivity(db, user.id, "FEEDBACK", `Left feedback for ${db.users.find((u) => u.id === m.studentUserId)?.name ?? "student"}`);
  addNotification(db, m.studentUserId, {
    title: "New mentor feedback",
    body: `${user.name} shared feedback on your mentorship. Review it in your workspace.`,
    type: "GOAL",
  });
  recomputeReadinessForStudent(db, m.studentUserId);
  persist();
  revalidatePath("/mentorship");
  revalidatePath("/student/dashboard");
  return {};
}

/* ------------------------------------------------------------------ */
/* Career outcomes                                                    */
/* ------------------------------------------------------------------ */

const outcomeSchema = z.object({
  status: z.enum(["STUDENT", "INTERNSHIP", "EMPLOYED", "HIGHER_STUDIES", "ENTREPRENEUR", "SEEKING_OPPORTUNITY"]),
  company: z.string().trim().max(120).optional(),
  role: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(80).optional(),
  location: z.string().trim().max(120).optional(),
  joiningDate: z.string().optional(),
  salaryRange: z.string().trim().max(60).optional(),
  internshipDuration: z.string().trim().max(60).optional(),
  higherEducation: z.string().trim().max(200).optional(),
});

export async function saveCareerOutcomeAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in to continue." };
  if (user.role !== "STUDENT") return { error: "Only students record their own career outcomes." };
  const parsed = outcomeSchema.safeParse({
    status: formData.get("status"),
    company: formData.get("company") ?? undefined,
    role: formData.get("role") ?? undefined,
    industry: formData.get("industry") ?? undefined,
    location: formData.get("location") ?? undefined,
    joiningDate: formData.get("joiningDate") ?? undefined,
    salaryRange: formData.get("salaryRange") ?? undefined,
    internshipDuration: formData.get("internshipDuration") ?? undefined,
    higherEducation: formData.get("higherEducation") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check the outcome details." };
  }

  const db = getStore();
  const now = new Date().toISOString();
  const existing = db.careerOutcomes.find((c) => c.studentUserId === user.id);
  const data = {
    ...parsed.data,
    joiningDate: parsed.data.joiningDate && !isNaN(new Date(parsed.data.joiningDate).getTime())
      ? new Date(parsed.data.joiningDate).toISOString()
      : undefined,
  };
  if (existing) {
    Object.assign(existing, data, { updatedAt: now });
  } else {
    db.careerOutcomes.push({ id: uid("co"), studentUserId: user.id, createdAt: now, updatedAt: now, ...data });
  }
  addActivity(db, user.id, "OUTCOME", "Updated career outcome");
  recomputeReadinessForStudent(db, user.id);
  persist();
  revalidatePath("/student/journey");
  revalidatePath("/student/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/analytics");
  return {};
}
