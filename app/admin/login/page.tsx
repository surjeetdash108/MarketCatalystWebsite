"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, signInWithPopup, type UserCredential } from "firebase/auth";

function describeAuthError(err: unknown): string {
  if (err instanceof FirebaseError) return `${err.code}: ${err.message}`;
  return err instanceof Error ? err.message : "Unknown error";
}
import { firebaseAuth, googleAuthProvider } from "@/lib/firebase/client";
import { BrandLogo } from "@/components/admin/BrandLogo";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function exchangeForSession(credential: UserCredential) {
    const idToken = await credential.user.getIdToken();
    const signedInAs = credential.user.email ?? "this account";

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const { error: code } = (await response.json().catch(() => ({}))) as { error?: string };
      // Surface the actual reason instead of a blanket message, so a wrong-account
      // sign-in or a rate-limit is self-evident rather than looking like a bug.
      const reason =
        code === "forbidden"
          ? `${signedInAs} isn't an authorized admin or editor. Sign in with an account that has been granted access.`
          : code === "rate_limited"
            ? "Too many sign-in attempts. Wait a few minutes and try again."
            : code === "stale_token"
              ? "Your sign-in expired before it completed. Please try again."
              : code === "invalid_token"
                ? "Could not verify your sign-in. Try again, or sign out of Google and back in."
                : code === "invalid_origin"
                  ? "Sign-in was blocked (origin mismatch). Use the official admin URL."
                  : `Sign-in failed (${code ?? response.status}).`;
      setError(reason);
      await firebaseAuth.signOut();
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await exchangeForSession(credential);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);

    try {
      const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
      await exchangeForSession(credential);
    } catch (err) {
      setError(`Google sign-in failed: ${describeAuthError(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="iq-root"
      data-theme="dark"
      style={{ height: "100vh", overflow: "hidden", display: "grid", placeItems: "center", padding: 24 }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1, padding: 28 }}>
        <BrandLogo height={26} />
        <h1 style={{ margin: "16px 0 4px", fontSize: 20, fontWeight: 700, color: "var(--text-hi)" }}>Admin sign in</h1>
        <p className="a-muted" style={{ margin: "0 0 20px" }}>Restricted to authorized editors and admins.</p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="btn"
          style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.5 : 1 }}
        >
          Sign in with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0", fontSize: 11, color: "var(--text-dim-solid)" }}>
          <span style={{ height: 1, flex: 1, background: "var(--border)" }} />
          or
          <span style={{ height: 1, flex: 1, background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="a-label">
            Email
            <input className="a-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="a-label">
            Password
            <input className="a-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="a-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn primary"
            style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
