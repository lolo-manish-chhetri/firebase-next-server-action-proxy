import { NextRequest, NextResponse } from "next/server";

/**
 * Simulated OTP verification endpoint.
 *
 * Expects:
 * - Authorization: Bearer <idToken> (simulating a logged-in Firebase user).
 * - JSON body { code: string }.
 *
 * Behaviour:
 * - If Authorization header is missing/invalid → 401.
 * - If code === "123456" → success (pretend OTP is verified).
 * - Otherwise → 400 with error.
 */
export async function POST(request: NextRequest) {
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

  let body: { code?: string } = {};
  try {
    body = (await request.json()) ?? {};
  } catch {
    // ignore parse error, treat as empty body
  }

  const code = body.code;

  if (!code) {
    return NextResponse.json(
      { error: "Bad Request", message: "Missing OTP code" },
      { status: 400 },
    );
  }

  if (code !== "123456") {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid OTP code" },
      { status: 400 },
    );
  }

  // In a real system you'd mark the session as "OTP verified" here.
  return NextResponse.json({
    success: true,
    message: "OTP verified successfully.",
  });
}

