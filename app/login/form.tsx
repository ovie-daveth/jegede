"use client";
import { useState } from "react";
export default function LoginForm() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Sign-in failed.");
      window.location.assign("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <label>
        Email address
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="alert error">
          {error}
        </p>
      )}
      <button className="button" disabled={busy}>
        {busy ? "Signing in…" : "Sign in to studio"}
      </button>
      <p className="subtle">
        Access is restricted to authorised administrators. Contact the site
        owner if you need a password reset.
      </p>
    </form>
  );
}
