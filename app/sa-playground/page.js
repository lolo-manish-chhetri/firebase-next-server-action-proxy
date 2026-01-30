"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthUI from "@/components/AuthUI";

/**
 * Simple landing page for the Server Action proxy / OTP demo.
 *
 * - Shows current auth state + logout via AuthUI.
 * - Provides links into the dashboard and OTP pages.
 */
export default function SaPlaygroundPage() {
  const { user } = useAuth();

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
        <h1>Server Action Proxy / OTP Demo</h1>
        <AuthUI user={user} />
      </header>
      <p style={{ marginTop: "0.75rem" }}>
        Use these links to exercise the "Server Action Proxy" pattern with
        silent token refresh and OTP redirect.
      </p>
      <ul style={{ marginTop: "1rem", paddingLeft: "1.25rem" }}>
        <li>
          <Link href="/sa-dashboard">Open Server Action Dashboard</Link>
        </li>
        <li>
          <Link href="/verify-otp">Go directly to OTP verification</Link>
        </li>
      </ul>
      <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
        Make sure you are signed in before using these protected flows.
      </p>
    </main>
  );
}

