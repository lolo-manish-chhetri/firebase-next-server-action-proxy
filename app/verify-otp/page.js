"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { invokeSecure } from "@/lib/server-action-wrapper";
import { proxyApiRequest } from "@/actions/proxy-client";

/**
 * OTP verification page.
 *
 * - When a protected API call returns OTP_REQUIRED, invokeSecure will redirect
 *   the browser here with ?next=<original-url>.
 * - User enters the code (demo: 123456), which is sent via Server Action proxy
 *   to the /api/verify-otp endpoint.
 * - On success, we redirect back to the "next" URL.
 */
export default function VerifyOtpPage() {
  const { user, loading: authLoading } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/sa-dashboard";

  if (authLoading) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Loading auth state…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Verify OTP</h1>
        <p>You must be signed in before verifying an OTP.</p>
      </main>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const result = await invokeSecure(proxyApiRequest, "verify-otp", "POST", {
        code,
      });

      if (result && result.success) {
        // After successful OTP verification, refresh the Firebase ID token
        // so downstream Server Actions immediately see updated claims/session.
        try {
          // Instead of logging the whole token, log its expiry time
          await user.getIdToken(false); // Ensures user.stsTokenManager.expirationTime is up-to-date
          const oldExpiry = user.stsTokenManager?.expirationTime;
          await user.getIdToken(true); // Force refresh
          const newExpiry = user.stsTokenManager?.expirationTime;
          console.log("[VerifyOtpPage] Old ID token expiry:", oldExpiry ? new Date(oldExpiry).toLocaleString() : "unknown");
          console.log("[VerifyOtpPage] New ID token expiry:", newExpiry ? new Date(newExpiry).toLocaleString() : "unknown");
        } catch (refreshErr) {
          console.error("[VerifyOtpPage] Failed to refresh ID token after OTP:", refreshErr);
        }

        router.push(next);
      } else {
        setError(result?.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "OTP verification failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Verify OTP</h1>
      <p>
        Enter the one-time code you received. For this demo, the valid code is{" "}
        <code>123456</code>.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter OTP code"
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            border: "1px solid #d1d5db",
            width: "200px",
          }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{
            marginLeft: "0.75rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: busy ? "default" : "pointer",
          }}
        >
          {busy ? "Verifying…" : "Verify"}
        </button>
      </form>
      {error && (
        <p style={{ marginTop: "1rem", color: "red" }}>
          {error}
        </p>
      )}
    </main>
  );
}

