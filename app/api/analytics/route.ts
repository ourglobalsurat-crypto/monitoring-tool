import { NextResponse } from "next/server";
import { normalizeRange } from "@/lib/date-ranges";
import { getAnalyticsData } from "@/lib/google/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = normalizeRange(searchParams.get("range"));

  try {
    const analytics = await getAnalyticsData(range);
    return NextResponse.json({ range, analytics, generatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Google Analytics data.";
    return NextResponse.json({ range, analytics: null, error: message }, { status: 502 });
  }
}
