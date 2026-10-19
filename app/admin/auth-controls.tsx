"use client";

import { useState, type FormEvent } from "react";

export default function AdminLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const password = String(new FormData(event.currentTarget).get("password") || "");
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not sign in. Please try again.");
      window.location.assign("/admin");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not sign in. Please try again."); setBusy(false); }
  }
  return <section className="access-panel"><h2>Administrator login</h2><p>Enter your password to manage preorders.</p><form onSubmit={login}>{error && <p className="form-error" role="alert">{error}</p>}<label htmlFor="admin-password">Password<input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={128} disabled={busy}/></label><button className="primary-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form></section>;
}

export function AdminLogout() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      window.location.assign("/admin");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not sign out."); setBusy(false); }
  }
  return <div className="admin-signout"><button className="secondary-button" type="button" onClick={logout} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>{error && <p role="alert">{error}</p>}</div>;
}
