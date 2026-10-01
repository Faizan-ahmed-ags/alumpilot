import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { demoLoginAction, loginAction, type ActionState } from "@/lib/auth/actions";
import { getSessionUser, homeFor } from "@/lib/auth/guard";

export const metadata = { title: "Sign in" };

const DEMO_ACCOUNTS = [
  { role: "STUDENT", label: "Student — Riya Sharma", email: "student@demo.com" },
  { role: "ALUMNI", label: "Alumni Mentor — Ananya Iyer", email: "alumni@demo.com" },
  { role: "ADMIN", label: "Administrator — Aditi Rao", email: "admin@demo.com" },
  { role: "CAREER_TEAM", label: "Career Team — Maya Krishnan", email: "career@demo.com" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.role));

  async function handleSubmit(_prev: ActionState, formData: FormData) {
    "use server";
    return loginAction(_prev, formData);
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
            <h1>Welcome back</h1>
            <p className="sub">Sign in to continue your mentorship journey.</p>
          </div>

          <form action={handleSubmit} className="stack-16">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@college.edu" className="input" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="input" />
            </div>
            <input type="hidden" name="next" value={searchParams.next ?? ""} />
            <button type="submit" className="btn btn-primary btn-lg btn-block">Sign in</button>
          </form>

          <p style={{ margin: 0, fontSize: "0.8438rem", color: "var(--ink-mute)" }}>
            New here?{" "}
            <Link href="/register" style={{ color: "var(--brand)", fontWeight: 600 }}>
              Create an account
            </Link>
          </p>

          <Suspense fallback={null}>
            <div className="demo-accounts">
              <span className="da-title">Judge mode — instant demo access</span>
              {DEMO_ACCOUNTS.map((acc) => (
                <form key={acc.role} action={demoLoginAction} className="demo-row">
                  <span>{acc.label}</span>
                  <button type="submit" name="role" value={acc.role} className="btn btn-secondary btn-sm">
                    Open
                  </button>
                </form>
              ))}
              <small style={{ color: "var(--ink-mute)" }}>
                Password for all demo accounts: <code>demo1234</code>
              </small>
            </div>
          </Suspense>
        </div>
      </div>

      <div className="auth-visual" aria-hidden>
        <div className="sidenav-brand" style={{ padding: 0 }}>
          <span className="brand-mark">AB</span>
        </div>
        <blockquote>
          “My mentor didn't just review my resume — she verified my milestones and referred me.
          That structure is why I had an offer before graduation.”
        </blockquote>
        <cite>— Aarav Patel, CSE '26, SDE Intern at Google</cite>
      </div>
    </div>
  );
}
