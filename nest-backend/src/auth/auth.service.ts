import { Injectable } from "@nestjs/common";
import { auth } from "../firebase-admin";

const SESSION_COOKIE_EXPIRY_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export type CreateSessionResult =
  | { sessionCookie: string; expiresIn: number }
  | { requiresTokenRefresh: true };

/**
 * Auth service: verifies Firebase ID tokens and mints session cookies.
 * Custom claims (otp_verified_at, db_user_id) are set on first call; client must
 * send a fresh token (getIdToken(true)) so the session cookie contains those claims.
 */
@Injectable()
export class AuthService {
  /**
   * Verify ID token. If custom claims are missing, set them and return requiresTokenRefresh.
   * Client should then getIdToken(true) and call createSession again. Second time we mint
   * the session cookie from the new token (which includes the claims).
   */
  async createSession(idToken: string): Promise<CreateSessionResult> {
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const claims = decoded as { otp_verified_at?: number; db_user_id?: string };

    if (claims.otp_verified_at != null && claims.db_user_id != null) {
      const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_COOKIE_EXPIRY_MS,
      });
      return { sessionCookie, expiresIn: SESSION_COOKIE_EXPIRY_MS };
    }

    await auth.setCustomUserClaims(uid, {
      otp_verified_at: Math.floor(Date.now() / 1000),
      db_user_id: uid,
    });

    return { requiresTokenRefresh: true };
  }

  /**
   * Verify a session cookie and return decoded claims (includes custom claims).
   */
  async verifySessionCookie(sessionCookie: string) {
    return auth.verifySessionCookie(sessionCookie, true);
  }
}
