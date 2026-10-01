"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SESSION_COOKIE, sessionDuration, signSession } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { homeFor } from "@/lib/auth/guard";
import { getStore, persist } from "@/lib/db/client";
import { uid } from "@/lib/utils/id";
import type { Role, User } from "@/lib/db/types";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

export interface ActionState {
  error?: string;
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check your details and try again." };
  }
  const { email, password, next } = parsed.data;
  const db = getStore();
  const user = db.users.find((u) => u.email.toLowerCase() === email);

  // Generic error message: never reveal whether the account exists.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password combination doesn't match our records." };
  }
  if (user.status !== "ACTIVE") {
    return { error: "This account has been disabled. Contact your institution administrator." };
  }

  const token = await signSession({ sub: user.id, role: user.role });
  const jar = cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDuration(),
  });

  user.lastActiveAt = new Date().toISOString();
  persist();

  redirect(next && next.startsWith("/") ? next : homeFor(user.role));
}

const DEMO_ROLES: Role[] = ["STUDENT", "ALUMNI", "ADMIN", "CAREER_TEAM"];

export async function demoLoginAction(formData: FormData): Promise<void> {
  const role = String(formData.get("role") ?? "");
  if (!DEMO_ROLES.includes(role as Role)) redirect("/login");
  const db = getStore();
  const user = db.users.find((u) => u.role === role && u.status === "ACTIVE");
  if (!user) redirect("/login");

  const token = await signSession({ sub: user.id, role: user.role });
  const jar = cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDuration(),
  });
  redirect(homeFor(user.role));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Tell us your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  role: z.enum(["STUDENT", "ALUMNI"]),
  departmentId: z.string().optional(),
  graduationYear: z.string().optional(),
});

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId") ?? undefined,
    graduationYear: formData.get("graduationYear") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check your details and try again." };
  }
  const { name, email, password, role, departmentId, graduationYear } = parsed.data;
  const db = getStore();
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    return { error: "An account with this email already exists. Try signing in instead." };
  }

  const gradYear = graduationYear ? parseInt(graduationYear, 10) : undefined;
  const newUser: User = {
    id: uid("u"),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    status: "ACTIVE",
    avatarColor: "bg-brand-600",
    departmentId: departmentId && db.departments.some((d) => d.id === departmentId) ? departmentId : undefined,
    graduationYear: gradYear && gradYear > 1990 && gradYear < 2100 ? gradYear : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  db.users.push(newUser);

  if (role === "STUDENT") {
    db.studentProfiles.push({
      id: uid("sp"),
      userId: newUser.id,
      visibility: "PUBLIC",
      headline: "",
      bio: "",
      departmentId: newUser.departmentId ?? db.departments[0].id,
      degree: "",
      graduationYear: newUser.graduationYear ?? new Date().getFullYear() + 1,
      location: "",
      hasCV: false,
      skills: [],
      careerInterests: [],
      targetRoles: [],
      targetIndustries: [],
      mentorshipTopics: [],
      mentorshipPreferences: { mode: "Video", frequency: "Bi-weekly", language: "English" },
      onboardingCompleted: false,
      onboardingStep: 1,
      profileCompleteness: 0,
      readinessIndex: 0,
      readinessBreakdown: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    db.alumniProfiles.push({
      id: uid("al"),
      userId: newUser.id,
      headline: "",
      bio: "",
      company: "",
      role: "",
      industry: db.industries[0],
      location: "",
      graduationYear: newUser.graduationYear ?? new Date().getFullYear() - 5,
      departmentId: newUser.departmentId ?? db.departments[0].id,
      workExperienceYears: 0,
      isMentor: true,
      mentorshipAvailable: false,
      availability: "Medium",
      preferredMode: "Video",
      responseRate: 100,
      studentsMentored: 0,
      sessionsCompleted: 0,
      goalsCompleted: 0,
      referralsMade: 0,
      skills: [],
      mentorshipTopics: [],
      languages: ["English"],
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  db.auditLogs.push({
    id: uid("audit"),
    actorUserId: newUser.id,
    action: "REGISTER",
    entity: "USER",
    entityId: newUser.id,
    detail: `New ${role.toLowerCase()} account created`,
    createdAt: new Date().toISOString(),
  });
  persist();

  const token = await signSession({ sub: newUser.id, role: newUser.role });
  const jar = cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDuration(),
  });

  redirect(role === "STUDENT" ? "/student/onboarding" : "/alumni/profile");
}

export async function logoutAction(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}
