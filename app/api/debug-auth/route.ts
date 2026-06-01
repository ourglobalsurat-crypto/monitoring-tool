import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, string> = {};

  // 1. Check which env vars are present
  result.has_base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 ? "yes" : "no";
  result.has_email = process.env.GOOGLE_CLIENT_EMAIL ? "yes" : "no";
  result.has_key = process.env.GOOGLE_PRIVATE_KEY ? "yes" : "no";
  result.has_property_id = process.env.GA4_PROPERTY_ID ? "yes" : "no";

  // 2. If base64 is set, try to decode and parse it
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
    try {
      const decoded = Buffer.from(
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64.trim(),
        "base64"
      ).toString("utf8");
      const parsed = JSON.parse(decoded);
      result.base64_email = parsed.client_email ?? "missing";
      result.base64_key_id = parsed.private_key_id ?? "missing";
      result.base64_key_starts = parsed.private_key?.slice(0, 27) ?? "missing";
      result.base64_key_ends = parsed.private_key?.slice(-25).replace(/\n/g, "\\n") ?? "missing";
    } catch (e) {
      result.base64_parse_error = String(e);
    }
  }

  // 3. Try to actually authenticate with Google
  try {
    const sa = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
      ? JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64.trim(), "base64").toString("utf8"))
      : null;

    const email = sa?.client_email ?? process.env.GOOGLE_CLIENT_EMAIL ?? "";
    const rawKey = sa?.private_key ?? process.env.GOOGLE_PRIVATE_KEY ?? "";
    const key = rawKey.replace(/\\n/g, "\n").trim();

    result.using_email = email;
    result.key_has_begin = key.includes("-----BEGIN PRIVATE KEY-----") ? "yes" : "no";
    result.key_has_end = key.includes("-----END PRIVATE KEY-----") ? "yes" : "no";
    result.key_line_count = String(key.split("\n").length);

    const keyId = sa?.private_key_id;
    const auth = new google.auth.JWT({ email, key, keyId, scopes: ["https://www.googleapis.com/auth/analytics.readonly"] });
    const token = await auth.getAccessToken();
    result.auth_status = token.token ? "SUCCESS" : "no token";
  } catch (e: unknown) {
    result.auth_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(result);
}
