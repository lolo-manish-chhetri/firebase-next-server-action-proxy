"use server";

import { cookies } from "next/headers";

const NEST_BACKEND_URL =
  process.env.NEST_BACKEND_URL || "http://localhost:4000";
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 5 * 24 * 60 * 60; // 5 days in seconds

export type CreateSessionResult =
  | { success: true }
  | { success: false; error: string }
  | { success: false; requiresTokenRefresh: true };

/**
 * Server Action: create session from Firebase ID token.
 * Proxies to NestJS POST /auth/session, then sets the returned session cookie.
 * Next.js does NOT use firebase-admin; it only proxies and sets the cookie.
 */
export async function createSession(
  idToken: string,
): Promise<CreateSessionResult> {
  if (!idToken?.trim()) {
    return { success: false, error: "idToken is required" };
  }

  let res: Response;
  try {
    res = await fetch(`${NEST_BACKEND_URL}/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch (err) {
    console.error("[createSession] Network error:", err);
    return { success: false, error: "Network error" };
  }

  if (!res.ok) {
    const text = await res.text();
    let message = "Failed to create session";
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      message = text || message;
    }
    return { success: false, error: message };
  }

  const data = (await res.json()) as {
    sessionCookie?: string;
    expiresIn?: number;
    requiresTokenRefresh?: boolean;
  };
  if (data?.requiresTokenRefresh) {
    return { success: false, requiresTokenRefresh: true };
  }
  const sessionCookie = data?.sessionCookie;
  if (!sessionCookie) {
    return { success: false, error: "No session cookie returned" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return { success: true };
}

/**
 * Server Action: clear session cookie (e.g. on sign out).
 */
export async function signOutSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
