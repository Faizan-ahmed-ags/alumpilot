import type { Db } from "@/lib/db/types";

export interface MonthPoint {
  label: string;
  count: number;
}

/** Sessions completed + milestones completed per month, last 6 months. */
export function computeMonthlyActivity(db: Db): MonthPoint[] {
  const out: MonthPoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.getTime();
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
    const sessions = db.sessions.filter(
      (s) => s.status === "COMPLETED" && new Date(s.scheduledAt).getTime() >= start && new Date(s.scheduledAt).getTime() < end
    ).length;
    const milestones = db.milestones.filter(
      (m) => m.status === "DONE" && m.completedAt && new Date(m.completedAt).getTime() >= start && new Date(m.completedAt).getTime() < end
    ).length;
    out.push({
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      count: sessions + milestones,
    });
  }
  return out;
}

export function computeOutcomeDistribution(db: Db): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const o of db.careerOutcomes) {
    dist[o.status] = (dist[o.status] ?? 0) + 1;
  }
  return dist;
}

export interface IndustryRow {
  industry: string;
  studentDemand: number;
  mentorSupply: number;
  count: number;
}

/** Student target industries vs mentor industry supply. */
export function computeIndustryDemand(db: Db): IndustryRow[] {
  const rows: IndustryRow[] = [];
  const all = new Set<string>([
    ...db.industries,
    ...db.studentProfiles.flatMap((s) => s.targetIndustries),
    ...db.alumniProfiles.map((a) => a.industry),
  ]);
  for (const industry of all) {
    const studentDemand = db.studentProfiles.filter((s) => s.targetIndustries.includes(industry)).length;
    const mentorSupply = db.alumniProfiles.filter((a) => a.industry === industry && a.mentorshipAvailable).length;
    if (studentDemand > 0 || mentorSupply > 0) {
      rows.push({ industry, studentDemand, mentorSupply, count: studentDemand + mentorSupply });
    }
  }
  return rows.sort((a, b) => b.count - a.count);
}

/* ---------------- CSV export ---------------- */

function csvEscape(v: string | number | undefined | null): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function outcomesCsv(db: Db): string {
  const header = "student,department,status,company,role,industry,location,joining_date,recorded_at";
  const lines = db.careerOutcomes.map((o) => {
    const u = db.users.find((x) => x.id === o.studentUserId);
    const sp = db.studentProfiles.find((p) => p.userId === o.studentUserId);
    const dept = db.departments.find((d) => d.id === sp?.departmentId);
    return [
      u?.name ?? "",
      dept?.code ?? "",
      o.status,
      o.company ?? "",
      o.role ?? "",
      o.industry ?? "",
      o.location ?? "",
      o.joiningDate ? o.joiningDate.slice(0, 10) : "",
      o.updatedAt.slice(0, 10),
    ].map(csvEscape).join(",");
  });
  return [header, ...lines].join("\n");
}

export function engagementCsv(db: Db): string {
  const header = "student,department,onboarded,profile_completeness,readiness_index,has_mentor,goals_total,goals_completed,sessions_completed";
  const lines = db.studentProfiles.map((sp) => {
    const u = db.users.find((x) => x.id === sp.userId);
    const dept = db.departments.find((d) => d.id === sp.departmentId);
    const goals = db.goals.filter((g) => g.studentUserId === sp.userId);
    const mentorIds = db.mentorships.filter((m) => m.studentUserId === sp.userId).map((m) => m.id);
    const sessions = db.sessions.filter((s) => mentorIds.includes(s.mentorshipId) && s.status === "COMPLETED").length;
    return [
      u?.name ?? "",
      dept?.code ?? "",
      sp.onboardingCompleted ? "yes" : "no",
      sp.profileCompleteness,
      sp.readinessIndex,
      mentorIds.length > 0 ? "yes" : "no",
      goals.length,
      goals.filter((g) => g.status === "COMPLETED").length,
      sessions,
    ].map(csvEscape).join(",");
  });
  return [header, ...lines].join("\n");
}
