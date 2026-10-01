import { describe, expect, it } from "vitest";
import { computeReadiness, defaultReadinessConfig } from "./readiness";
import { getStore } from "@/lib/db/client";

describe("Career Readiness Index", () => {
  it("computes accurate composite readiness score with breakdown", () => {
    const db = getStore();
    const student = db.studentProfiles.find((s) => s.userId === "u_student")!;
    expect(student).toBeDefined();

    const result = computeReadiness({
      profile: student,
      skillsScore: 78,
      projectsScore: 68,
      mentorshipEngagement: 86,
      goalsProgress: 60,
      interviewScore: 64,
      hasInternship: false,
      profileCompleteness: 100,
    }, defaultReadinessConfig());

    expect(result.index).toBeGreaterThan(60);
    expect(result.index).toBeLessThanOrEqual(100);
    expect(result.breakdown.skills).toBe(78);
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});
