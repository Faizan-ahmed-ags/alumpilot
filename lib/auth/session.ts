import type { Role } from "@/lib/db/types";

export type SessionPayload = {
  sub: string;
  role: Role;
  exp: number;
};

export const SESSION_COOKIE = "ab_session";

export function sessionDuration(): number {
  return 60 * 60 * 24 * 7; // 7 days
}

/**
 * Signed session token. The HMAC signature prevents tampering so the
 * middleware/routes can safely read role claims, but every privileged
 * action is re-authorized server-side from the database (never trust
 * client-supplied role claims alone).
 */
export async function signSession(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const secret = getSecret();
  const enc = new TextEncoder();
  const exp = Math.floor(Date.now() / 1000) + sessionDuration();
  const body = btoa(JSON.stringify({ sub: payload.sub, role: payload.role, exp }));
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const sig = bytesToBase64(new Uint8Array(sigBuf));
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const secret = getSecret();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const valid = await crypto.subtle.verify("HMAC", key, base64ToBytes(sig), enc.encode(body));
  if (!valid) return null;
  try {
    const payload = JSON.parse(atob(body)) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set it in .env (see .env.example)."
    );
  }
  return secret;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=+$/, "");
}

function base64ToBytes(base64: string): ArrayBuffer {
  const bin = atob(base64);
  const bytes = Uint8Array.from(bin, (char) => char.charCodeAt(0));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
} 