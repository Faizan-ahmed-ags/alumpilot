import { requireRole } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Avatar, Card, LinkButton, PageHead, Progress, StatusBadge } from "@/components/ui";

export const metadata = { title: "Students" };

export default async function AdminStudentsPage() {
  const user = await requireRole("ADMIN", "CAREER_TEAM");
  const db = getStore();

  const rows = db.studentProfiles
    .map((sp) => {
      const u = db.users.find((x) => x.id === sp.userId)!;
      const mentorship = db.mentorships.find((m) => m.studentUserId === sp.userId && m.status === "ACTIVE");
      const mentor = mentorship ? db.users.find((x) => x.id === mentorship.mentorUserId) : undefined;
      const outcome = db.careerOutcomes.find((c) => c.studentUserId === sp.userId);
      const goals = db.goals.filter((g) => g.studentUserId === sp.userId);
      return { u, sp, mentorship, mentor, outcome, goalCount: goals.length, dept: db.departments.find((d) => d.id === sp.departmentId) };
    })
    .sort((a, b) => a.sp.readinessIndex - b.sp.readinessIndex);

  return (
    <AppShell user={user} title="Students">
      <PageHead
        eyebrow={user.role === "ADMIN" ? "Administrator" : "Career team"}
        title="Students"
        lede="Operational directory for mentorship coordination and placement support. Readiness is informational — never a public ranking."
        action={<LinkButton href="/admin/analytics" variant="secondary" size="sm">Analytics</LinkButton>}
      />

      <Card title={`All students (${rows.length})`} flush>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Profile</th>
                <th>Readiness</th>
                <th>Mentor</th>
                <th>Goals</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ u, sp, mentor, mentorship, outcome, goalCount, dept }) => (
                <tr key={sp.id}>
                  <td>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <strong style={{ display: "block", color: "var(--ink)" }}>{u.name}</strong>
                        <small style={{ color: "var(--ink-mute)" }}>{sp.headline || u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{dept?.code ?? "—"}</td>
                  <td style={{ minWidth: 120 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Progress value={sp.profileCompleteness} />
                      <small>{sp.profileCompleteness}%</small>
                    </div>
                  </td>
                  <td><strong>{sp.readinessIndex}%</strong></td>
                  <td>{mentor ? mentor.name : <span className="badge badge-warning">none</span>}</td>
                  <td>{goalCount}</td>
                  <td>{outcome ? <StatusBadge status={outcome.status} /> : <span style={{ color: "var(--ink-mute)" }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
