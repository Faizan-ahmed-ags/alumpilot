import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { getStore } from "@/lib/db/client";
import type { Role, User } from "@/lib/db/types";

/**
 * Server-side session guard. Reads the signed cookie, verifies the HMAC
 * and expiry, and re-loads the user from the database — never trusting
 * the role claim inside the token alone for authorization decisions.
 */
export async function getSessionUser(): Promise<User | null> {
  const jar = cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const user = getStore().users.find((u) => u.id === payload.sub && u.status === "ACTIVE");
  return user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

export function homeFor(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "/student/dashboard";
    case "ALUMNI":
      return "/alumni/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "CAREER_TEAM":
      return "/admin/analytics";
  }
}

export async function getRole(): Promise<Role | null> {
  const user = await getSessionUser();
  return user?.role ?? null;
}
