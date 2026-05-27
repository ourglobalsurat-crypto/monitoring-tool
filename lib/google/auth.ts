import { google } from "googleapis";
import { createPrivateKey } from "node:crypto";

const scopes = [
  "https://www.googleapis.com/auth/analytics.readonly",
];

function cleanEnvValue(value?: string) {
  if (!value) return "";

  let cleaned = value.trim();

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned;
}

function getPrivateKeyFromEnv() {
  const rawPrivateKey = cleanEnvValue(process.env.GOOGLE_PRIVATE_KEY);

  if (!rawPrivateKey) return "";

  if (rawPrivateKey.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawPrivateKey) as { private_key?: string };
      return parsed.private_key?.replace(/\\n/g, "\n").trim() ?? "";
    } catch {
      throw new Error("GOOGLE_PRIVATE_KEY looks like JSON but could not be parsed. Use the private_key value from the service account JSON.");
    }
  }

  return rawPrivateKey.replace(/\\n/g, "\n").trim();
}

function assertValidPrivateKey(privateKey: string) {
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error("GOOGLE_PRIVATE_KEY must be the full service account private_key, including BEGIN and END PRIVATE KEY lines.");
  }

  try {
    createPrivateKey(privateKey);
  } catch {
    throw new Error("GOOGLE_PRIVATE_KEY is not a valid PEM private key. In Vercel, paste the service account private_key value with \\n line breaks and redeploy.");
  }
}

export function getGoogleAuth() {
  const clientEmail = cleanEnvValue(process.env.GOOGLE_CLIENT_EMAIL);
  const privateKey = getPrivateKeyFromEnv();

  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credentials are not configured. Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in Vercel.");
  }

  assertValidPrivateKey(privateKey);

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes,
  });
}
