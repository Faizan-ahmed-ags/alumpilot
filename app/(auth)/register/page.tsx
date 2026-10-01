import Link from "next/link";
import { redirect } from "next/navigation";
import { demoLoginAction, registerAction, type ActionState } from "@/lib/auth/actions";
import { getSessionUser, homeFor } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";

export const metadata = { title: "Create your account" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.role));
  const departments = getStore().departments;

  async function handleSubmit(prev: ActionState, formData: FormData) {
    "use server";
    return registerAction(prev, formData);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-pane">
        <div className="auth-card">
          <Link href="/" className="sidenav-brand" style={{ padding: 0 }}>
            <span className="brand-mark" aria-hidden>AB</span>
            <span>
              <strong>AlumniBridge</strong>
              <small>Career Development OS</small>
            </span>
          </Link>

          <div>
            <h1>Create your account</h1>
            <p className="sub">Students get matched with alumni mentors. Alumni become mentors.</p>
          </div>

          <form action={handleSubmit} className="stack-16">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" required minLength={2} className="input" placeholder="e.g. Priya Sharma" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input" placeholder="you@college.edu" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" />
            </div>
            <div className="field">
              <label htmlFor="role">I am a…</label>
              <select id="role" name="role" className="select" defaultValue="STUDENT">
                <option value="STUDENT">Student — find a mentor</option>
                <option value="ALUMNI">Alumni — become a mentor</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="departmentId">Department</label>
                <select id="departmentId" name="departmentId" className="select">
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="graduationYear">Graduation year</label>
                <input id="graduationYear" name="graduationYear" type="number" min={2000} max={2100} className="input" placeholder="2026" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block">Create account</button>
          </form>

          <p style={{ margin: 0, fontSize: "0.8438rem", color: "var(--ink-mute)" }}>
            Already registered?{" "}
            <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-visual" aria-hidden>
        <div className="sidenav-brand" style={{ padding: 0 }}>
          <span className="brand-mark">AB</span>
        </div>
        <blockquote>
          Students set career goals. Alumni verify milestones. Institutions see real outcomes.
        </blockquote>
        <cite>— The AlumniBridge loop</cite>
      </div>
    </div>
  );
}
