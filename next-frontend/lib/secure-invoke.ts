"use client";

import { getAuth } from "firebase/auth";
import { createSession } from "@/actions/auth";
import type { GetUserProfileResult } from "@/actions/user";
import { getUserProfile } from "@/actions/user";

/**
 * Client wrapper for secure Server Actions with "Boomerang" recovery.
 * - Detects SESSION_EXPIRED from the Server Action result.
 * - Gets a fresh ID token via Firebase (silent refresh), calls createSession(newToken), then retries the action.
 * - Never calls NestJS directly; all traffic goes through Next.js Server Actions.
 */
export async function secureGetUserProfile(): Promise<GetUserProfileResult> {
  const result = await getUserProfile();

  if (result.success) return result;
  if (!("code" in result) || result.code !== "SESSION_EXPIRED") return result;

  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    return { success: false, code: "SESSION_EXPIRED" };
  }

  const newToken = await user.getIdToken(true);
  const sessionResult = await createSession(newToken);
  if (!sessionResult.success) {
    return { success: false, code: "SESSION_EXPIRED" };
  }

  return getUserProfile();
}
