import Link from "next/link";
import { getUserProfile } from "@/actions/user";

export default async function ProfilePage() {
  const result = await getUserProfile();

  return (
    <main style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Profile</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Fetched on the server via <code>use server</code> in{" "}
        <code>actions/user.ts</code>. Session cookie is sent to NestJS.
      </p>

      {result.success ? (
        <>
          <p
            style={{
              padding: 12,
              borderRadius: 6,
              background: "#efe",
              color: "#060",
              marginBottom: "1rem",
            }}
          >
            Profile loaded.
          </p>
          <pre
            style={{
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 6,
              overflow: "auto",
              fontSize: 13,
            }}
          >
            {JSON.stringify(result.profile, null, 2)}
          </pre>
        </>
      ) : "code" in result && result.code === "SESSION_EXPIRED" ? (
        <p
          style={{
            padding: 12,
            borderRadius: 6,
            background: "#fee",
            color: "#c00",
          }}
        >
          Session expired. Please <Link href="/login">log in again</Link>.
        </p>
      ) : (
        <p
          style={{
            padding: 12,
            borderRadius: 6,
            background: "#fee",
            color: "#c00",
          }}
        >
          {"error" in result ? result.error : "Failed to load profile"}
        </p>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">Home</Link>
        {" · "}
        <Link href="/login">Login</Link>
      </p>
    </main>
  );
}
