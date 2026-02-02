"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthUI from "@/components/AuthUI";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Session Cookie + Proxy</h1>
        <AuthUI user={user} />
      </header>

      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Login with Firebase → Next.js creates session via Server Action. Profile
        is fetched via Server Action (<code>use server</code>).
      </p>

      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link
          href="/login"
          style={{
            padding: "10px 20px",
            background: "#333",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Login
        </Link>
        <Link
          href="/profile"
          style={{
            padding: "10px 20px",
            background: "#333",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Get profile
        </Link>
      </nav>
    </main>
  );
}
