import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  const sitePassword = process.env.SITE_PASSWORD;
  const url = new URL(request.url);
  const isHttps = request.headers.get("x-forwarded-proto") === "https" || url.protocol === "https:";

  if (!sitePassword) {
    return NextResponse.json({ error: "SITE_PASSWORD is not configured." }, { status: 500 });
  }

  if (!password || password !== sitePassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken(sitePassword);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
