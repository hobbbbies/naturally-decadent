import type { Metadata } from "next";
import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { isAdmin } from "@/lib/admin";
import AdminOrders from "./admin-orders";

export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"Manage Mock Preorders | Naturally Decadent"};

export default async function AdminPage() {
  const user=await getChatGPTUser();const authorized=await isAdmin();
  return <div className="simple-page"><header className="simple-header"><a className="simple-brand" href="/">Naturally Decadent</a><a href="/order">Order page ↗</a></header><main className="admin-shell"><h1>Mock preorders</h1>{authorized?<><p className="field-help">Review and edit saved responses, or download a spreadsheet-friendly CSV.</p><AdminOrders/><p className="admin-signout"><a href={chatGPTSignOutPath("/admin")} target="_top">Sign out</a></p></>:<div className="access-panel"><h2>{user?"Administrator access required":"Sign in to manage preorders"}</h2><p>{user?"This account isn’t on the administrator list. Use the site owner’s account.":"The order list is only available to the site administrator."}</p><a className="primary-button" href={user?chatGPTSignOutPath("/admin"):chatGPTSignInPath("/admin")} target="_top">{user?"Sign out and switch account":"Sign in with ChatGPT"}</a></div>}</main></div>;
}
