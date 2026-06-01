import { google } from "googleapis";
import { Buffer } from "node:buffer";
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

type ServiceAccountCredentials = {
  client_email?: string;
  private_key?: string;
};

function parseServiceAccountJson(value: string, variableName: string) {
  try {
    return JSON.parse(value) as ServiceAccountCredentials;
  } catch {
    throw new Error(`${variableName} could not be parsed. Use the complete Google service account JSON file.`);
  }
}

function getServiceAccountFromBase64() {
  const encodedJson = cleanEnvValue(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64);

  if (!encodedJson) return null;

  try {
    const decodedJson = Buffer.from(encodedJson, "base64").toString("utf8");
    return parseServiceAccountJson(decodedJson, "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not valid base64.");
  }
}

function getPrivateKeyFromEnv() {
  const rawPrivateKey = cleanEnvValue(process.env.GOOGLE_PRIVATE_KEY);

  if (!rawPrivateKey) return "";

  if (rawPrivateKey.startsWith("{")) {
    const parsed = parseServiceAccountJson(rawPrivateKey, "GOOGLE_PRIVATE_KEY");
    return parsed.private_key?.replace(/\\n/g, "\n").trim() ?? "";
  }

  return rawPrivateKey.replace(/\\n/g, "\n").trim();
}

function assertValidPrivateKey(privateKey: string) {
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    throw new Error("Google private key is incomplete. Use GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 or paste the full private_key including BEGIN and END PRIVATE KEY lines.");
  }

  try {
    createPrivateKey(privateKey);
  } catch {
    throw new Error("Google private key is not valid. Use GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 to avoid Vercel newline formatting issues, then redeploy.");
  }
}

export function getGoogleAuth() {
  const serviceAccount = getServiceAccountFromBase64();
  const clientEmail = cleanEnvValue(serviceAccount?.client_email ?? process.env.GOOGLE_CLIENT_EMAIL);
  const privateKey = (serviceAccount?.private_key?.replace(/\\n/g, "\n").trim() ?? getPrivateKeyFromEnv());

  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, or set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in Vercel.");
  }

  assertValidPrivateKey(privateKey);

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes,
  });
}
