import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "./engine";
import { getStore } from "@/lib/db/client";

describe("Deterministic Mentor Matching Engine", () => {
  it("calculates high match percentage for aligned student and mentor", () => {
    const db = getStore();
    const student = db.studentProfiles.find((s) => s.userId === "u_student")!;
    const mentor = db.alumniProfiles.find((a) => a.userId === "u_alumni")!;

    expect(student).toBeDefined();
    expect(mentor).toBeDefined();

    const result = calculateMatchScore(student, mentor);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.percentage).toBe(result.score);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.breakdown.roleScore).toBeGreaterThan(0);
  });

  it("produces explainable criteria in plain English", () => {
    const db = getStore();
    const student = db.studentProfiles.find((s) => s.userId === "u_student")!;
    const mentor = db.alumniProfiles.find((a) => a.userId === "u_alumni")!;

    const result = calculateMatchScore(student, mentor);
    expect(result.reasons.some((r) => r.toLowerCase().includes("role") || r.toLowerCase().includes("industry"))).toBe(true);
  });
});
