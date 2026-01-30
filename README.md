# Firebase Auth + SWR Demo (Next.js App Router)

Production-grade integration of **Firebase Authentication** with **SWR** and **Axios**, handling **Accidental Logout** and **Token Expiry** scenarios.

## Tech Stack

- **Next.js 14+** (App Router)
- **Firebase Client SDK**
- **Axios** (authenticated API client)
- **SWR** (data fetching)

## File Structure

```
firebase/
├── app/
│   ├── api/
│   │   └── protected-data/
│   │       └── route.ts      # Simulated protected API (Bearer check)
│   ├── globals.css
│   ├── layout.js             # Root layout; wraps app in AuthProvider
│   └── page.js               # Home page (renders Dashboard)
├── components/
│   ├── AuthUI.js             # Sign in anonymously / Sign out (demo)
│   └── Dashboard.js          # SWR + apiClient; loading state; Force Refresh
├── context/
│   └── AuthContext.js        # Watcher: onIdTokenChanged, user + loading
├── lib/
│   ├── apiClient.js          # Carrier: Axios + Bearer token interceptor
│   └── firebase.js           # Firebase config (placeholder)
├── next.config.js
├── package.json
└── jsconfig.json
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Firebase config**
   - Create a Firebase project and enable **Anonymous** (or Email/Password) sign-in.
   - Copy your web app config into `.env.local`:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

   Or edit the placeholder values in `lib/firebase.js`.

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## How It Works

### 1. Watcher (Auth Persistence)

- **`context/AuthContext.js`** uses `onIdTokenChanged` (not `onAuthStateChanged`) so token refresh events update the app.
- Exposes `user` and `loading`. While `loading` is true (e.g. after reload), the UI shows "Loading..." and does not fire protected requests until the session is restored → avoids **Accidental Logout** flicker and failed calls.

### 2. Carrier (Token Expiry)

- **`lib/apiClient.js`** is an Axios instance with a **request interceptor** that:
  - Reads `auth.currentUser`.
  - Calls `user.getIdToken()` (returns cached or refreshes if expired).
  - Sets `Authorization: Bearer <token>`.
- Every request gets a valid token → **Token Expiry** is handled transparently.

### 3. Dummy Backend

- **`app/api/protected-data/route.ts`** simulates a gateway: it only checks that the header is `Bearer <non-empty>`. In production you would verify the Firebase ID token (e.g. Admin SDK).

### 4. Frontend Simulation

- **`components/Dashboard.js`** uses `useSWR` with `apiClient` to fetch `/api/protected-data`.
- Shows "Loading..." while `AuthContext.loading` is true (session restore).
- **"Force Refresh Page"** triggers `window.location.reload()`; after reload, the session is restored by the watcher and the API call succeeds again.

## Demo Flow

1. Sign in (e.g. "Sign in anonymously").
2. See protected data from `/api/protected-data`.
3. Click **Force Refresh Page** → page reloads → brief "Loading..." → protected data loads again without re-sign-in.
