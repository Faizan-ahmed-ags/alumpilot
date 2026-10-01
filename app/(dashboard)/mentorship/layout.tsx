import { requireRole } from "@/lib/auth/guard";

export default async function MentorshipLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT", "ALUMNI");
  return <>{children}</>;
}
