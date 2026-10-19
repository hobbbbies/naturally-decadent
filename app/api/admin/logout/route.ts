import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";
import { hashToken, sessionCookie, sessionToken } from "@/lib/admin";
import { json, readMutation } from "@/lib/http";

export async function POST(request: Request) {
  const body = await readMutation(request);
  if (body.error) return body.error;
  try {
    const token = await sessionToken();
    if (token) await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, await hashToken(token)));
    const response = json({ ok: true });
    response.headers.set("Set-Cookie", sessionCookie(request, "", 0));
    return response;
  } catch { return json({ error: "Could not sign out. Please try again." }, 503); }
}
