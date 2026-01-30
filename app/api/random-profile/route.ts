import { NextRequest, NextResponse } from "next/server";

/**
 * Simulated protected API route that returns a random "profile".
 *
 * Behaviour:
 * - Requires a non-empty Bearer token in Authorization header.
 * - When the query parameter ?otp=1 is present, we simulate that the user
 *   has not completed OTP verification yet and return 403 + code OTP_REQUIRED.
 * - Otherwise, returns a random name payload.
 *
 * This route represents the external backend / API gateway that the
 * Server Action proxy talks to.
 */
export async function GET(request: NextRequest) {
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

  const otpParam = request.nextUrl.searchParams.get("otp");
  if (otpParam === "1") {
    // Simulate "OTP required" for this token/resource.
    return NextResponse.json(
      {
        error: "Forbidden",
        code: "OTP_REQUIRED",
        message: "One-time passcode verification is required.",
      },
      { status: 403 },
    );
  }

  const names = [
    "Ada Lovelace",
    "Alan Turing",
    "Grace Hopper",
    "Linus Torvalds",
    "Margaret Hamilton",
    "Donald Knuth",
  ];
  const random = names[Math.floor(Math.random() * names.length)];

  return NextResponse.json({
    success: true,
    data: {
      name: random,
      id: Math.floor(Math.random() * 1000000),
      role: "Demo User",
    },
  });
}

