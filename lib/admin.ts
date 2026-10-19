import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";

export const ADMIN_COOKIE = "nd_admin_session";
export const SESSION_SECONDS = 8 * 60 * 60;

export async function hashToken(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function sessionToken() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

export async function isAdmin() {
  const token = await sessionToken();
  if (!token) return false;
  try {
    const session = await getDb().select({ tokenHash: adminSessions.tokenHash }).from(adminSessions)
      .where(and(eq(adminSessions.tokenHash, await hashToken(token)), gt(adminSessions.expiresAt, Date.now()))).get();
    return Boolean(session);
  } catch { return false; }
}

export function sessionCookie(request: Request, token: string, maxAge = SESSION_SECONDS) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
