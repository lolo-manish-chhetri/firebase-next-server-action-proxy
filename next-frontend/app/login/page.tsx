"use client";

import { useState } from "react";
import {
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
} from "firebase/auth";
import { createSession } from "@/actions/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

type Message = { type: "success" | "error"; text: string };

export default function LoginPage() {
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<"google" | "anonymous" | null>(null);

  async function createSessionFromUser() {
    const user = auth.currentUser;
    if (!user) return { success: false as const, error: "No user" };
    let idToken = await user.getIdToken();
    let result = await createSession(idToken);
    if (result.success) return result;
    if ("requiresTokenRefresh" in result && result.requiresTokenRefresh) {
      idToken = await user.getIdToken(true);
      return createSession(idToken);
    }
    return result;
  }

  async function handleGoogleSignIn() {
    setMessage(null);
    setLoading("google");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const result = await createSessionFromUser();
      if (result.success) {
        setMessage({
          type: "success",
          text: "Signed in with Google. Session created. Go to Profile.",
        });
      } else {
        setMessage({
          type: "error",
          text: "error" in result ? result.error : "Session creation failed",
        });
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Google sign-in failed";
      setMessage({ type: "error", text });
    } finally {
      setLoading(null);
    }
  }

  async function handleAnonymousSignIn() {
    setMessage(null);
    setLoading("anonymous");
    try {
      await signInAnonymously(auth);
      const result = await createSessionFromUser();
      if (result.success) {
        setMessage({
          type: "success",
          text: "Signed in anonymously. Session created. Go to Profile.",
        });
      } else {
        setMessage({
          type: "error",
          text: "error" in result ? result.error : "Session creation failed",
        });
      }
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Anonymous sign-in failed";
      setMessage({ type: "error", text });
    } finally {
      setLoading(null);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Login</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Sign in with Google or anonymously. Session is created via Server Action
        and stored in an HttpOnly cookie.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading !== null}
          style={{
            padding: "12px 20px",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading === "google" ? "Signing in…" : "Sign in with Google"}
        </button>
        <button
          type="button"
          onClick={handleAnonymousSignIn}
          disabled={loading !== null}
          style={{
            padding: "12px 20px",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading === "anonymous" ? "Signing in…" : "Sign in anonymously"}
        </button>
      </div>

      {message && (
        <p
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            background: message.type === "error" ? "#fee" : "#efe",
            color: message.type === "error" ? "#c00" : "#060",
          }}
        >
          {message.text}
        </p>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">Home</Link>
        {" · "}
        <Link href="/profile">Profile</Link>
      </p>
    </main>
  );
}
