"use client";

import { getAuth } from "firebase/auth";

/**
 * Generic client-side wrapper for invoking secure Server Actions that
 * call your protected backend API via Firebase Auth.
 *
 * Implements the "boomerang" pattern:
 * - Uses the current Firebase user + ID token.
 * - Interprets special flags from the Server Action:
 *   - TOKEN_EXPIRED → silently refresh token and retry once.
 *   - OTP_REQUIRED → redirect to /verify-otp and stop further processing.
 *
 * @template T
 * @param {Function} action - The Server Action (e.g. proxyApiRequest) to invoke.
 *   It must accept (token, ...args).
 * @param {...any} args - Remaining arguments to pass after the token.
 * @returns {Promise<T | null>} - The action result, or null when OTP redirect occurs.
 */
export async function invokeSecure(action, ...args) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("[invokeSecure] No authenticated user. Did you wrap your app in AuthProvider?");
  }

  // First attempt with the current token.
  const initialToken = await user.getIdToken();
  let result = await action("", ...args);

  // Handle token expiry: refresh ID token on the client and retry once.
  if (result && result.status === "TOKEN_EXPIRED") {
    const previousToken = initialToken;
    const refreshedToken = await user.getIdToken(true);

    if (previousToken === refreshedToken) {
      console.warn("[invokeSecure] Token was not actually refreshed: previous and refreshed tokens are identical.");
    } else {
      console.info("[invokeSecure] Token was refreshed successfully.");
    }

    result = await action(refreshedToken, ...args);
  }

  // Handle OTP requirement: redirect and stop.
  if (result && result.status === "OTP_REQUIRED") {
    try {
      const current =
        (typeof window !== "undefined" &&
          (window.location.pathname +
            window.location.search +
            window.location.hash)) ||
        "/";
      const nextParam = encodeURIComponent(current);
      window.location.href = `/verify-otp?next=${nextParam}`;
    } catch (err) {
      console.error("[invokeSecure] Failed to redirect for OTP:", err);
    }

    // Returning null signals to callers that execution should stop.
    return null;
  }

  // For success (or other non-flag responses), just pass the result through.
  return result;
}

