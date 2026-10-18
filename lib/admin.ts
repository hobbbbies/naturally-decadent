import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function isAdmin() {
  const user = await getChatGPTUser();
  const emails = (env.ADMIN_EMAILS || "").split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
  return Boolean(user?.userId && emails.includes(user.email.toLowerCase()));
}
