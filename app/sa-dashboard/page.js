"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthUI from "@/components/AuthUI";
import { invokeSecure } from "@/lib/server-action-wrapper";
import { proxyApiRequest } from "@/actions/proxy-client";

/**
 * Dashboard page that uses the Server Action proxy + invokeSecure wrapper
 * to fetch a random profile from the backend without crashing the page
 * on token expiry or OTP requirement.
 */
export default function SaDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
        <h1>Server Action Dashboard (Protected)</h1>
        <p>You must sign in (e.g. via the home page) before accessing this dashboard.</p>
      </main>
    );
  }

  const handleFetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invokeSecure(proxyApiRequest, "random-profile", "GET");
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProfileOtpRequired = async () => {
    setLoading(true);
    setError(null);
    try {
      // Adding ?otp=1 makes the backend respond with 403 + code OTP_REQUIRED.
      // invokeSecure will see status OTP_REQUIRED from proxyApiRequest and redirect
      // to /verify-otp without throwing.
      await invokeSecure(proxyApiRequest, "random-profile?otp=1", "GET");
      // When OTP_REQUIRED, invokeSecure returns null; we deliberately do not update
      // state here because the browser is navigating away.
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to call profile API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1>Server Action Dashboard</h1>
        <AuthUI user={user} />
      </header>
      <p>
        This dashboard fetches a random profile through a Server Action proxy. Token
        expiry and OTP requirements are handled on the client without crashing the
        page.
      </p>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
        <button type="button" onClick={handleFetchProfile} disabled={loading}>
          {loading ? "Loading…" : "Fetch random profile"}
        </button>
        <button
          type="button"
          onClick={handleFetchProfileOtpRequired}
          disabled={loading}
          style={{ background: "#b91c1c", color: "#fff" }}
        >
          {loading ? "Calling…" : "Call (OTP required)"}
        </button>
      </div>
      {error && (
        <p style={{ marginTop: "1rem", color: "red" }}>
          {error}
        </p>
      )}
      {data && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}

