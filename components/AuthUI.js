"use client";

import { useState } from "react";
import { signInAnonymously, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Small auth UI: sign in anonymously (demo) and sign out.
 *
 * - When user is null: show "Sign in anonymously (demo)".
 * - When user is set: show "Signed in (anonymous)" and "Sign out".
 * - Errors (e.g. Anonymous sign-in disabled in Firebase Console) are shown below the button.
 */
export default function AuthUI({ user }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message || "Sign out failed");
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <div className="auth-ui">
        <span className="auth-label">Signed in (anonymous)</span>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={busy}
          className="auth-btn auth-btn-out"
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
        {error && <p className="auth-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="auth-ui">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={busy}
        className="auth-btn"
      >
        {busy ? "Signing in…" : "Sign in anonymously (demo)"}
      </button>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
