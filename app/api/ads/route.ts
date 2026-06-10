import { NextResponse } from "next/server";
import { normalizeRange } from "@/lib/date-ranges";
import { getAdsData } from "@/lib/google/ads";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = normalizeRange(searchParams.get("range"));

  try {
    const ads = await getAdsData(range);
    return NextResponse.json({ range, ads, generatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Google Ads data.";
    return NextResponse.json({ range, ads: null, error: message }, { status: 502 });
  }
}
