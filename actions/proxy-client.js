"use server";

/**
 * Server Action: proxy API request to the external backend.
 *
 * Acts as a "proxy" that:
 * - Forwards the request to BACKEND_API_URL with the provided bearer token.
 * - Does NOT throw on auth-related failures, but returns structured flags
 *   so the client can handle token refresh / OTP redirect.
 *
 * @param {string} token - Firebase ID token for the current user.
 * @param {string} endpoint - Relative endpoint to append to BACKEND_API_URL.
 * @param {string} method - HTTP method (GET, POST, etc.).
 * @param {any} [body] - Optional JSON-serializable request body.
 * @returns {Promise<any>} - JSON response data or a structured error object.
 */
export async function proxyApiRequest(token, endpoint, method, body) {
  const baseUrl = "http://localhost:3000/api";

  if (!baseUrl) {
    console.error("[proxyApiRequest] BACKEND_API_URL is not configured.");
    return { error: "Api Error", success: false };
  }

  const url =
    baseUrl.replace(/\/$/, "") + "/" + String(endpoint || "").replace(/^\//, "");

  let response;
  try {
    response = await fetch(url, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error("[proxyApiRequest] Network or fetch error:", err);
    return { error: "Api Error", success: false };
  }

  let parsedBody = null;
  try {
    const text = await response.text();
    parsedBody = text ? JSON.parse(text) : null;
  } catch {
    parsedBody = null;
  }

  // Auth-related handling must not throw; return flags instead.
  if (response.status === 401) {
    // Token invalid/expired – let client trigger silent refresh.
    return { status: "TOKEN_EXPIRED", success: false };
  }

  if (response.status === 403 && parsedBody && parsedBody.code === "OTP_REQUIRED") {
    // Backend explicitly signals that OTP verification is required.
    return { status: "OTP_REQUIRED", success: false };
  }

  // Any other non-OK status is treated as a generic API error.
  if (!response.ok) {
    console.error(
      "[proxyApiRequest] Backend responded with error status:",
      response.status,
      parsedBody,
    );
    return { error: "Api Error", success: false };
  }

  // Success: return the backend JSON payload as-is.
  return parsedBody;
}

