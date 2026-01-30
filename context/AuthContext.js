"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Default context value: no user, still loading.
 * Used when a component is rendered outside AuthProvider (should not happen if tree is correct).
 */
const AuthContext = createContext({
  user: null,
  loading: true,
});

/**
 * Auth provider: subscribes to Firebase Auth token changes and exposes user + loading.
 *
 * - We use onIdTokenChanged (not onAuthStateChanged) so we get updates when the ID token
 *   is refreshed (e.g. after expiry). That keeps auth state in sync with the token
 *   used by apiClient.
 *
 * - loading is true until the first callback runs (e.g. on mount or after reload).
 *   During that time the app can show "Loading..." and avoid firing protected API
 *   calls with a not-yet-restored user, which prevents "accidental logout" flicker
 *   and failed requests right after a page reload.
 *
 * - Children should use useAuth() to read user and loading.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hadUserRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        //******* this is just for testing purpose to see the token expiry */
        try {
          const result = await firebaseUser.getIdTokenResult();
          const exp =
            result.expirationTime ??
            (result.claims?.exp
              ? new Date(result.claims.exp * 1000).toISOString()
              : "unknown");
          if (hadUserRef.current) {
            console.log(
              "[AuthContext] Refresh token created new access token (onIdTokenChanged). Access token expires at:",
              exp,
            );
          } else {
            console.log(
              "[AuthContext] ID token set (initial). Access token expires at:",
              exp,
            );
          }
          hadUserRef.current = true;
        } catch (err) {
          console.error("[AuthContext] getIdTokenResult failed:", err);
        }

        //*******
        //
        //
        // end of testing purpose
        //
        //
        //
      } else {
        hadUserRef.current = false;
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to read auth state from AuthContext.
 * Must be used inside a component tree wrapped by AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
