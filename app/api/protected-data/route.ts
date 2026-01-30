import { NextResponse } from "next/server";

/**
 * Simulated protected API route (GET).
 *
 * In production you would verify the Firebase ID token with the Admin SDK
 * (e.g. admin.auth().verifyIdToken(token)) and use the decoded claims.
 *
 * Here we only simulate validation: we check that the Authorization header
 * is present, starts with "Bearer ", and has a non-empty token. We do not
 * verify the signature or expiry.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    authHeader.length <= 7
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Missing or invalid Authorization header",
      },
      { status: 401 },
    );
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Token is empty" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    message: "This is protected data",
    user: "Authorized",
  });
}
