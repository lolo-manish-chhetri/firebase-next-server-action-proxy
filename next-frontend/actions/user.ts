"use server";

import { cookies } from "next/headers";

const NEST_BACKEND_URL =
  process.env.NEST_BACKEND_URL || "http://localhost:4000";
const SESSION_COOKIE_NAME = "session";

export type GetUserProfileResult =
  | { success: true; profile: Record<string, unknown> }
  | { success: false; code: "SESSION_EXPIRED" }
  | { success: false; error: string };

/**
 * Server Action: fetch user profile from NestJS.
 * Reads session cookie from the request and forwards as Authorization: Bearer <cookie>.
 * On 401 from NestJS, returns { code: "SESSION_EXPIRED" } for client boomerang recovery.
 */
export async function getUserProfile(): Promise<GetUserProfileResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return { success: false, code: "SESSION_EXPIRED" };
  }

  let res: Response;
  try {
    res = await fetch(`${NEST_BACKEND_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionCookie}`,
      },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[getUserProfile] Network error:", err);
    return { success: false, error: "Network error" };
  }

  if (res.status === 401) {
    return { success: false, code: "SESSION_EXPIRED" };
  }

  if (!res.ok) {
    const text = await res.text();
    let message = "Failed to fetch profile";
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      message = text || message;
    }
    return { success: false, error: message };
  }

  const profile = (await res.json()) as Record<string, unknown>;
  return { success: true, profile };
}
