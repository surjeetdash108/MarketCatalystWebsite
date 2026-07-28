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

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function exchangeForSession(credential: UserCredential) {
    const idToken = await credential.user.getIdToken();

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      setError("You don't have access to the admin panel.");
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
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-6 text-xl font-semibold">Admin sign in</h1>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="mb-4 rounded border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        Sign in with Google
      </button>

      <div className="mb-4 flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        or
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
