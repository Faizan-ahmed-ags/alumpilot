import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { OnboardingWizard } from "./wizard";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { step?: string };
}) {
  const user = await requireRole("STUDENT");
  const db = getStore();
  const profile = db.studentProfiles.find((p) => p.userId === user.id)!;
  const step = Math.min(8, Math.max(1, parseInt(searchParams.step ?? String(profile.onboardingStep ?? 1), 10) || 1));

  return (
    <AppShell user={user} title="Profile & Onboarding">
      <OnboardingWizard
        step={step}
        departments={db.departments.map((d) => ({ id: d.id, name: d.name }))}
        skills={db.skills.map((s) => ({ id: s.id, name: s.name, category: s.category }))}
        industries={db.industries}
        topics={[
          "Product Management", "Software engineering", "System design interviews", "Interview preparation",
          "Portfolio projects", "Career planning", "Data science", "Machine learning", "UX design",
          "Personal branding", "Resume review", "Entrepreneurship",
        ]}
        initial={{
          headline: profile.headline,
          bio: profile.bio,
          degree: profile.degree,
          graduationYear: profile.graduationYear,
          location: profile.location,
          departmentId: profile.departmentId,
          visibility: profile.visibility,
          targetRoles: profile.targetRoles.join(", "),
          targetIndustries: profile.targetIndustries.join(", "),
          mentorshipTopics: profile.mentorshipTopics.join(", "),
          preferredMode: profile.mentorshipPreferences.mode,
          frequency: profile.mentorshipPreferences.frequency,
        }}
        completed={profile.onboardingCompleted}
        completeness={profile.profileCompleteness}
      />
    </AppShell>
  );
}
