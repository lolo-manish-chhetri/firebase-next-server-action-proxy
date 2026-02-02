import * as admin from "firebase-admin";
import * as path from "path";

/**
 * Initialize Firebase Admin SDK once.
 * Credentials from file: GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CREDENTIALS_PATH
 * (default: credentials.json in project root).
 */
function initializeFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const credentialsPath = path.resolve(process.cwd(), "credentials.json");

  return admin.initializeApp({
    credential: admin.credential.cert(credentialsPath),
  });
}

export const firebaseApp = initializeFirebaseAdmin();
export const auth = admin.auth(firebaseApp);
