import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/guard";
import { getStore } from "@/lib/db/client";
import { engagementCsv, outcomesCsv } from "@/lib/analytics/reports";

/**
 * CSV export — server-side authorization: only ADMIN and CAREER_TEAM.
 * Exports contain operational, non-sensitive columns (no contact details,
 * no salary data) in line with the privacy principles.
 */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CAREER_TEAM")) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const type = new URL(request.url).searchParams.get("type") ?? "outcomes";
  const db = getStore();

  let csv: string;
  let filename: string;
  if (type === "engagement") {
    csv = engagementCsv(db);
    filename = "alumnibridge-engagement.csv";
  } else {
    csv = outcomesCsv(db);
    filename = "alumnibridge-career-outcomes.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
