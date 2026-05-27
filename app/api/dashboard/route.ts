import { NextResponse } from "next/server";
import { normalizeRange } from "@/lib/date-ranges";
import { getAnalyticsData } from "@/lib/google/analytics";
import type { DashboardPayload } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = normalizeRange(searchParams.get("range"));

  const analyticsResult = await Promise.allSettled([getAnalyticsData(range)]).then((results) => results[0]);

  const errors: string[] = [];

  if (analyticsResult.status === "rejected") {
    errors.push(analyticsResult.reason instanceof Error ? analyticsResult.reason.message : "Google Analytics failed.");
  }

  const payload: DashboardPayload = {
    range,
    generatedAt: new Date().toISOString(),
    analytics: analyticsResult.status === "fulfilled" ? analyticsResult.value : null,
    errors,
  };

  return NextResponse.json(payload, { status: errors.length ? 502 : 200 });
}
