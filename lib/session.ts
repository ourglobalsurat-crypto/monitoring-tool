export const SESSION_COOKIE = "medallion_session";

const encoder = new TextEncoder();

function base64UrlEncode(input: string) {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function createSessionToken(secret?: string) {
  if (!secret) throw new Error("SITE_PASSWORD is not configured.");

  const payload = base64UrlEncode(
    JSON.stringify({
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      iat: Date.now(),
    }),
  );
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token?: string, secret?: string) {
  if (!token || !secret || !token.includes(".")) return false;

  const [payload, signature] = token.split(".");
  const expected = await hmac(payload, secret);
  if (signature !== expected) return false;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}
