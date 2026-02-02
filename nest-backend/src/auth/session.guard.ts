import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { DecodedIdToken } from "firebase-admin/auth";

export type RequestWithUser = Request & { user: DecodedIdToken };

/**
 * Global guard: validates the Bearer Session Cookie and attaches decoded user to request.
 * On 401, Nest returns Unauthorized so Next.js can map to SESSION_EXPIRED.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid Authorization header",
      );
    }

    const sessionCookie = authHeader.slice(7).trim();
    if (!sessionCookie) {
      throw new UnauthorizedException("Session cookie is empty");
    }

    let decoded: DecodedIdToken;
    try {
      decoded = await this.authService.verifySessionCookie(sessionCookie);
      console.log("decoded in session guard", decoded);
    } catch {
      throw new UnauthorizedException("Invalid or expired session cookie");
    }

    // Mock: check otp_verified_at (optional custom claim). If you use custom claims,
    // require e.g. decoded.otp_verified_at and throw OTP_REQUIRED otherwise.
    const otpVerifiedAt = (
      decoded as DecodedIdToken & { otp_verified_at?: number }
    ).otp_verified_at;
    if (otpVerifiedAt === undefined) {
      // PoC: allow without OTP; in production you might throw OTP_REQUIRED here.
    }

    (request as RequestWithUser).user = decoded;
    return true;
  }
}
