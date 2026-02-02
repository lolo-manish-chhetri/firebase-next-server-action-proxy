import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SessionGuard, RequestWithUser } from "../auth/session.guard";

/**
 * GET /profile: protected by SessionGuard. Returns user profile from session claims.
 * Next.js calls this via Server Action, forwarding the session cookie as Bearer.
 */
@Controller("profile")
@UseGuards(SessionGuard)
export class ProfileController {
  @Get()
  getProfile(@Req() req: RequestWithUser) {
    const user = req.user;
    if (!user) {
      return { error: "User not found" };
    }
    // Mock profile; in production build from user.uid and DB/custom claims.
    const claims = user as { otp_verified_at?: number; db_user_id?: string };
    return {
      uid: user.uid,
      email: user.email ?? null,
      email_verified: user.email_verified ?? false,
      name: (user as { name?: string }).name ?? null,
      picture: (user as { picture?: string }).picture ?? null,
      otp_verified_at: claims.otp_verified_at ?? null,
      db_user_id: claims.db_user_id ?? null,
    };
  }
}
