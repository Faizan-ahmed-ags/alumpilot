import Link from "next/link";
import { BookOpen, FileText, Library } from "lucide-react";
import { getSessionUser } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, EmptyState, PageHead } from "@/components/ui";

export const metadata = { title: "Resources" };

const CATEGORIES = ["All", "Interview", "Portfolio", "Resume", "Career Planning", "Mentorship"];

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const user = await getSessionUser();
  const db = getStore();
  const category = searchParams.category ?? "All";
  const resources = db.resources
    .filter((r) => category === "All" || r.category === category)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const authorName = (id: string) => db.users.find((u) => u.id === id)?.name ?? "AlumniBridge Team";

  const body = (
    <>
      <PageHead
        eyebrow="Resource library"
        title="Career resources"
        lede="Guides, templates and checklists contributed by alumni mentors and the career team."
      />

      <div className="filterbar" style={{ marginBottom: 20 }}>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/resources" : `/resources?category=${encodeURIComponent(c)}`}
            className={`btn btn-sm ${category === c ? "btn-primary" : "btn-secondary"}`}
          >
            {c}
          </Link>
        ))}
      </div>

      {resources.length === 0 ? (
        <Card>
          <EmptyState icon={<Library size={28} />} title="No resources in this category" hint="Try another category — mentors add new material regularly." />
        </Card>
      ) : (
        <div className="grid-3">
          {resources.map((r) => (
            <article key={r.id} className="card mentor-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge tone="brand">{r.category}</Badge>
                <span style={{ color: "var(--ink-faint)" }}>
                  {r.contentType === "template" ? <FileText size={16} /> : <BookOpen size={16} />}
                </span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.9375rem", lineHeight: 1.4 }}>{r.title}</strong>
                <small style={{ color: "var(--ink-mute)" }}>by {authorName(r.authorId)}</small>
              </div>
              <p style={{ margin: 0, fontSize: "0.8438rem", color: "var(--ink-soft)" }}>{r.description}</p>
              {r.body && (
                <details>
                  <summary style={{ cursor: "pointer", fontSize: "0.8125rem", color: "var(--brand)", fontWeight: 600 }}>
                    Read the guide
                  </summary>
                  <p style={{ margin: "8px 0 0", fontSize: "0.8438rem", lineHeight: 1.65 }}>{r.body}</p>
                </details>
              )}
              <div className="chip-row">
                {r.tags.slice(0, 3).map((t) => <span key={t} className="chip">#{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );

  if (!user) {
    return <div className="content" style={{ margin: "0 auto", maxWidth: 1100 }}>{body}</div>;
  }
  return (
    <AppShell user={user} title="Resources">
      {body}
    </AppShell>
  );
}
