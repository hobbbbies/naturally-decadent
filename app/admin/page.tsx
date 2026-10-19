import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import AdminOrders from "./admin-orders";
import AdminLogin, { AdminLogout } from "./auth-controls";

export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"Manage Preorders | Naturally Decadent"};

export default async function AdminPage() {
  const authorized=await isAdmin();
  return <div className="simple-page"><header className="simple-header"><a className="simple-brand" href="/">Naturally Decadent</a><a href="/order">Order page ↗</a></header><main className="admin-shell"><h1>Preorders</h1>{authorized?<><p className="field-help">Review and edit preorders, or download a spreadsheet-friendly CSV.</p><AdminOrders/><AdminLogout/></>:<AdminLogin/>}</main></div>;
}
