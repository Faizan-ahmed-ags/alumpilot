import { revalidatePath } from "next/cache";
import { Bell, CheckCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/guard";
import { getStore, persist } from "@/lib/db/client";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, EmptyState, PageHead, timeAgo } from "@/components/ui";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const db = getStore();
  const all = db.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function markAllRead() {
    "use server";
    const u = await requireUser();
    const d = getStore();
    for (const n of d.notifications) {
      if (n.userId === u.id) n.read = true;
    }
    persist();
    revalidatePath("/notifications");
    revalidatePath("/student/dashboard");
    revalidatePath("/alumni/dashboard");
  }

  const groups: Record<string, typeof all> = { Today: [], Yesterday: [], Earlier: [] };
  const now = new Date();
  for (const n of all) {
    const d = new Date(n.createdAt);
    const days = Math.floor((now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
    if (days <= 0) groups.Today.push(n);
    else if (days === 1) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  }
  const unread = all.filter((n) => !n.read).length;

  return (
    <AppShell user={user} title="Notifications">
      <PageHead
        eyebrow="Activity"
        title="Notifications"
        lede="Requests, sessions, feedback and goal updates — everything that needs your attention."
        action={
          unread > 0 ? (
            <form action={markAllRead}>
              <button type="submit" className="btn btn-secondary btn-sm"><CheckCheck size={14} /> Mark all read</button>
            </form>
          ) : undefined
        }
      />

      {all.length === 0 ? (
        <Card>
          <EmptyState icon={<Bell size={28} />} title="You're all caught up" hint="Mentorship updates will land here the moment they happen." />
        </Card>
      ) : (
        <div className="stack-16">
          {Object.entries(groups).map(([label, items]) =>
            items.length === 0 ? null : (
              <Card key={label} title={label} subtitle={label === "Today" ? `${items.filter((n) => !n.read).length} unread` : undefined} flush>
                <div className="row-list">
                  {items.map((n) => (
                    <div key={n.id} className="row-item" style={{ alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ marginTop: 2 }}>
                          {!n.read ? <Badge tone="brand" dot>new</Badge> : <span style={{ width: 8, display: "inline-block" }} />}
                        </span>
                        <div>
                          <div className="row-title">{n.title}</div>
                          <div className="row-sub" style={{ maxWidth: "70ch" }}>{n.body}</div>
                          <div className="row-sub">{timeAgo(n.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </AppShell>
  );
}
