"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOutSession } from "@/actions/auth";
import type { User } from "firebase/auth";

type AuthUIProps = {
  user: User | null;
};

export default function AuthUI({ user }: AuthUIProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOut(auth);
      await signOutSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <span style={{ marginRight: "0.5rem" }}>{user.email ?? "Signed in"}</span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        style={{ padding: "4px 12px" }}
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && <p style={{ color: "#c00", marginTop: 4 }}>{error}</p>}
    </div>
  );
}
