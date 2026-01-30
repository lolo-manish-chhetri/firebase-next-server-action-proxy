"use client";

import { useAuth } from "@/context/AuthContext";
import AuthUI from "@/components/AuthUI";

export default function Home() {
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
        <h1>Welcome</h1>
        <AuthUI user={user} />
      </header>
      <p>
        Use the{" "}
        <a href="/sa-playground">
          Server Action Proxy / OTP demo
        </a>{" "}
        to try the secure patterns.
      </p>
    </main>
  );
}
