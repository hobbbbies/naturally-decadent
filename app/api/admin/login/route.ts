import { env } from "cloudflare:workers";
import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { adminLoginAttempts, adminSessions } from "@/db/schema";
import { hashToken, sessionCookie, sessionToken, SESSION_SECONDS } from "@/lib/admin";
import { json, readMutation } from "@/lib/http";

export async function POST(request: Request) {
  const body = await readMutation(request);
  if (body.error) return body.error;
  const password = typeof body.data === "object" && body.data !== null && "password" in body.data ? body.data.password : null;
  if (typeof password !== "string" || password.length > 128) return json({ error: "Enter your administrator password." }, 400);
  if (!env.ADMIN_PASSWORD) return json({ error: "Administrator login is not configured." }, 503);
  try {
    const db = getDb();
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const bucket = Math.floor(now / windowMs);
    const ip = request.headers.get("cf-connecting-ip") || "local";
    const key = `${await hashToken(ip)}:${bucket}`;
    await db.delete(adminLoginAttempts).where(lt(adminLoginAttempts.resetAt, now));
    const attempt = await db.insert(adminLoginAttempts).values({ key, attempts: 1, resetAt: (bucket + 1) * windowMs })
      .onConflictDoUpdate({ target: adminLoginAttempts.key, set: { attempts: sql`${adminLoginAttempts.attempts} + 1` } }).returning().get();
    if (!attempt || attempt.attempts > 10) {
      const response = json({ error: "Too many login attempts. Please try again in 15 minutes." }, 429);
      response.headers.set("Retry-After", String(Math.max(1, Math.ceil(((bucket + 1) * windowMs - now) / 1000))));
      return response;
    }
    const entered = await hashToken(password);
    const expected = await hashToken(env.ADMIN_PASSWORD);
    let difference = 0;
    for (let i = 0; i < entered.length; i++) difference |= entered.charCodeAt(i) ^ expected.charCodeAt(i);
    if (difference !== 0) return json({ error: "Incorrect password. Please try again." }, 401);
    const previous = await sessionToken();
    if (previous) await db.delete(adminSessions).where(eq(adminSessions.tokenHash, await hashToken(previous)));
    await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, "0")).join("");
    await db.insert(adminSessions).values({ tokenHash: await hashToken(token), expiresAt: now + SESSION_SECONDS * 1000 });
    await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.key, key));
    const response = json({ ok: true });
    response.headers.set("Set-Cookie", sessionCookie(request, token));
    return response;
  } catch { return json({ error: "Could not sign in. Please try again." }, 503); }
}
