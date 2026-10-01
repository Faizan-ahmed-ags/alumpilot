import type { AlumniProfile, StudentProfile } from "@/lib/db/types";

export interface MatchScoreResult {
  score: number; // 0-100
  percentage: number; // 0-100
  reasons: string[];
  breakdown: {
    roleScore: number;
    industryScore: number;
    skillScore: number;
    topicScore: number;
    availabilityScore: number;
    modeScore: number;
  };
}

/**
 * Deterministic Mentor Matching Engine.
 *
 * Evaluates the alignment between a student and an alumni mentor:
 * 1. Target Role & Career Goals (25%)
 * 2. Industry Alignment (20%)
 * 3. Technical & Professional Skills / Skill Gaps (20%)
 * 4. Mentorship Topics (15%)
 * 5. Availability & Responsiveness (10%)
 * 6. Mentorship Mode & Language (10%)
 *
 * Operates 100% deterministically with transparent explanation factors.
 */
export function calculateMatchScore(
  student: StudentProfile,
  mentor: AlumniProfile
): MatchScoreResult {
  const reasons: string[] = [];

  // 1. Role alignment (Weight: 25)
  let roleScore = 0;
  const targetRoles = (student.targetRoles || []).map((r) => r.toLowerCase());
  const mentorRole = (mentor.role || "").toLowerCase();
  const mentorHeadline = (mentor.headline || "").toLowerCase();

  const roleMatch = targetRoles.some(
    (role) =>
      mentorRole.includes(role) ||
      role.includes(mentorRole) ||
      mentorHeadline.includes(role)
  );

  if (roleMatch) {
    roleScore = 25;
    reasons.push(`Target role alignment: ${mentor.role}`);
  } else if (targetRoles.length > 0) {
    // Partial word overlap
    const studentWords = targetRoles.flatMap((r) => r.split(/\s+/));
    const mentorWords = `${mentorRole} ${mentorHeadline}`.split(/\s+/);
    const hasOverlap = studentWords.some(
      (w) => w.length > 3 && mentorWords.some((mw) => mw.includes(w))
    );
    if (hasOverlap) {
      roleScore = 15;
      reasons.push(`Related domain experience in ${mentor.role}`);
    }
  }

  // 2. Industry alignment (Weight: 20)
  let industryScore = 0;
  const targetIndustries = (student.targetIndustries || []).map((i) => i.toLowerCase());
  const mentorIndustry = (mentor.industry || "").toLowerCase();

  if (targetIndustries.some((ind) => ind === mentorIndustry || mentorIndustry.includes(ind))) {
    industryScore = 20;
    reasons.push(`Direct industry match in ${mentor.industry}`);
  } else if (targetIndustries.length > 0) {
    industryScore = 8;
  }

  // 3. Skills overlap & gap targeting (Weight: 20)
  let skillScore = 0;
  const mentorSkills = (mentor.skills || []).map((s) => s.toLowerCase());
  // Find skills where student has targetLevel > level or is developing
  const developingSkills = (student.skills || [])
    .filter((s) => s.targetLevel > s.level)
    .map((s) => s.skillId.replace("sk_", "").toLowerCase());

  const matchedSkills: string[] = [];
  mentorSkills.forEach((ms) => {
    const cleanMs = ms.toLowerCase();
    if (developingSkills.some((ds) => cleanMs.includes(ds) || ds.includes(cleanMs))) {
      matchedSkills.push(ms);
    }
  });

  if (matchedSkills.length >= 2) {
    skillScore = 20;
    reasons.push(`Mentors your target growth skills: ${matchedSkills.slice(0, 3).join(", ")}`);
  } else if (matchedSkills.length === 1 || mentorSkills.length >= 3) {
    skillScore = 14;
    reasons.push(`Relevant technical and professional skills`);
  } else {
    skillScore = 8;
  }

  // 4. Mentorship topics overlap (Weight: 15)
  let topicScore = 0;
  const studentTopics = (student.mentorshipTopics || []).map((t) => t.toLowerCase());
  const mentorTopics = (mentor.mentorshipTopics || []).map((t) => t.toLowerCase());
  const commonTopics = mentorTopics.filter((mt) =>
    studentTopics.some((st) => mt.includes(st) || st.includes(mt))
  );

  if (commonTopics.length >= 2) {
    topicScore = 15;
    reasons.push(`Shared focus on ${commonTopics.slice(0, 2).join(" & ")}`);
  } else if (commonTopics.length === 1) {
    topicScore = 10;
    reasons.push(`Focus area: ${commonTopics[0]}`);
  } else {
    topicScore = 5;
  }

  // 5. Availability & responsiveness (Weight: 10)
  let availabilityScore = 5;
  if (mentor.availability === "High") {
    availabilityScore = 10;
    reasons.push(`High mentor availability (${mentor.responseRate}% response rate)`);
  } else if (mentor.availability === "Medium") {
    availabilityScore = 7;
  }

  // 6. Meeting mode & language (Weight: 10)
  let modeScore = 6;
  const studentMode = student.mentorshipPreferences?.mode;
  if (studentMode && (mentor.preferredMode === studentMode || mentor.preferredMode === "Hybrid")) {
    modeScore = 10;
    reasons.push(`Preferred meeting format: ${mentor.preferredMode}`);
  }

  const rawTotal = roleScore + industryScore + skillScore + topicScore + availabilityScore + modeScore;
  const score = Math.min(99, Math.max(35, rawTotal)); // Keep within realistic bounded range

  return {
    score,
    percentage: score,
    reasons: reasons.slice(0, 4),
    breakdown: {
      roleScore,
      industryScore,
      skillScore,
      topicScore,
      availabilityScore,
      modeScore,
    },
  };
}
