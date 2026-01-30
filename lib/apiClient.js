import axios from "axios";
import { auth } from "./firebase";

/**
 * Authenticated Axios instance for calling protected APIs.
 *
 * - baseURL: empty in the browser so requests go to the same origin (Next.js);
 *   in SSR or tests you can set NEXT_PUBLIC_APP_URL.
 *
 * - Every request runs through the request interceptor, which attaches a
 *   Firebase ID token as Authorization: Bearer <token>. That solves token
 *   expiry: getIdToken() returns the cached token if still valid, or refreshes
 *   using the refresh token and returns the new one, so no extra cost or
 *   slowness on most requests.
 *
 * - If the backend returns 401, the response interceptor retries the request
 *   once after forcing a token refresh, to handle edge cases (e.g. clock skew).
 */
const apiClient = axios.create({
  baseURL:
    typeof window !== "undefined"
      ? ""
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Request interceptor: attach Firebase ID token to every outgoing request.
 *
 * - Uses auth.currentUser (set by AuthContext / onIdTokenChanged).
 * - getIdToken(false): returns cached token if valid; if expired, Firebase
 *   refreshes via refresh token and returns the new token. No network call
 *   when token is still valid, so no meaningful latency or cost.
 * - getIdToken(true) is used only on 401 retry (see response interceptor).
 * - On failure we log and continue without Authorization; the backend will
 *   typically respond with 401.
 */
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const forceRefresh = config._retryDueTo401 === true;
        const token = await user.getIdToken(forceRefresh);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error("[apiClient] getIdToken failed:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor: on 401, retry the request once with a fresh token.
 *
 * - When the backend returns 401 (e.g. token expired or rejected), we set
 *   _retryDueTo401 on the request and call getIdToken(true) to force a refresh,
 *   then re-send the same request with the new token.
 * - We only retry once per request to avoid infinite loops if the user is
 *   actually unauthorized (e.g. signed out elsewhere).
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retryDueTo401) {
      originalRequest._retryDueTo401 = true;
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;

          //******* this is just for testing purpose to see the token expiry */
          try {
            const result = await user.getIdTokenResult();
            const exp =
              result.expirationTime ??
              (result.claims?.exp
                ? new Date(result.claims.exp * 1000).toISOString()
                : "unknown");
            console.log(
              "[apiClient] Refresh token created new access token (401 retry). Access token expires at:",
              exp,
            );
          } catch (logErr) {
            // non-fatal: we already have the token
          }

          //*******
          //
          //
          //
          //
          // end of testing purpose
          //
          //
          //
          // */
          return apiClient(originalRequest);
        } catch (refreshErr) {
          console.error("[apiClient] 401 retry refresh failed:", refreshErr);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
