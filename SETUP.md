# Setting up Firebase

Follow these in order. Steps 1–5 get you a working private dashboard on your own
machine; steps 6–7 put it live on GitHub Pages.

Budget about 20 minutes. Everything here is on Firebase's free Spark plan.

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and sign in with your Google account.
2. Click **Create a project** (or **Add project**).
3. Name it `compass-dashboard`. The project ID underneath will become something like
   `compass-dashboard-4f2a1` — note it, you'll need it.
4. Google Analytics: turn it **off**. You don't need it and it adds consent obligations.
5. Click **Create project**, wait for it, then **Continue**.

## 2. Register the web app and copy the keys

1. On the project home screen, click the **web icon** `</>` ("Add an app").
2. App nickname: `Compass`. Leave **Firebase Hosting unchecked**.
3. Click **Register app**.
4. You'll see a `firebaseConfig` block. Keep this tab open — you need these values in step 5.

```js
const firebaseConfig = {
  apiKey: "AIza…",                                   // → VITE_FIREBASE_API_KEY
  authDomain: "compass-dashboard-4f2a1.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "compass-dashboard-4f2a1",              // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "compass-dashboard-4f2a1.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789012",                 // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789012:web:abc123"                 // → VITE_FIREBASE_APP_ID
};
```

These keys are **not secrets**. They identify your project to Firebase and are meant to
ship in browser code. What protects your data is the security rules in step 4 plus
sign-in. Do not let anyone tell you a leaked `apiKey` is the emergency — an open
database rule is.

You can find this again later at **⚙️ Project settings → General → Your apps → SDK setup
and configuration → Config**.

## 3. Create the Realtime Database

1. Left sidebar → **Build → Realtime Database** → **Create Database**.
2. Location: **United States (us-central1)** unless you have a reason to pick otherwise.
   You cannot change this later without recreating the database.
3. Security rules: choose **Start in locked mode**. Click **Enable**.
4. At the top of the Data tab you'll see the database URL:
   `https://compass-dashboard-4f2a1-default-rtdb.firebaseio.com`
   → this is `VITE_FIREBASE_DATABASE_URL`.

   If your region is not us-central1 the URL looks like
   `https://…-default-rtdb.asia-southeast1.firebasedatabase.app` — copy whatever is shown,
   exactly, including `https://`.

**Make sure it is Realtime Database, not Firestore.** They are different products and this
app uses Realtime Database.

## 4. Lock the rules down

1. Realtime Database → **Rules** tab.
2. Replace everything with the contents of [`database.rules.json`](database.rules.json):

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

3. Click **Publish**.

What this does: the database is closed by default, and each signed-in account can read and
write **only** `users/<their own uid>` — the exact branch this app stores your data in.
Nobody can read your data without being signed in as you, and a signed-in stranger can
only touch their own empty branch.

Two rules to never break:
- Never publish `".read": true` or `".write": true` at the root, not even "just for testing."
  A public GitHub Pages site pointed at an open database means anyone can read and wipe it.
- If the console shows a banner saying your rules are public, treat it as an incident,
  not a warning.

You can test rules before publishing with the **Rules Playground** link on that page.

## 5. Turn on email/password sign-in and create your account

1. Left sidebar → **Build → Authentication** → **Get started**.
2. **Sign-in method** tab → **Email/Password** → toggle **Enable** (leave *Email link
   / passwordless* off) → **Save**.
3. **Users** tab → **Add user**.
4. Enter your email and a password (use your password manager; 16+ characters).
   Click **Add user**.

That account is now the only way in. The app has **no sign-up form on purpose** — if it
had one, anyone who found the URL could create an account. To add another person later,
add them here in the console.

The "Forgot password" link on the login screen works as soon as email/password is enabled;
Firebase sends the reset email for you.

## 6. Run it locally

In the project folder:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your values in:

```
VITE_FIREBASE_API_KEY=AIza…
VITE_FIREBASE_AUTH_DOMAIN=compass-dashboard-4f2a1.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://compass-dashboard-4f2a1-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=compass-dashboard-4f2a1
VITE_FIREBASE_STORAGE_BUCKET=compass-dashboard-4f2a1.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

No quotes, no spaces around the `=`. Then:

```bash
npm run dev
```

Restart the dev server if it was already running — Vite only reads env files at startup.

You should now get the **login screen**. Sign in with the account from step 5. The
"local storage mode" line at the bottom of the page will be gone, which is how you know
it is talking to Firebase.

`.env.local` is gitignored and will never be committed.

## 7. Put your keys on the live site

The GitHub Pages build gets its values from repository secrets.

1. Go to <https://github.com/MihirPatel2011/compass-dashboard/settings/secrets/actions>.
2. **New repository secret**, once for each of these names, pasting the matching value:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Authorise the Pages domain in Firebase: **Authentication → Settings → Authorized
   domains → Add domain** → `mihirpatel2011.github.io`. Sign-in is rejected from
   unlisted domains.
4. Trigger a rebuild — push any commit, or go to the **Actions** tab → *Deploy to GitHub
   Pages* → **Run workflow**.
5. Open <https://mihirpatel2011.github.io/compass-dashboard/> and sign in.

---

## Checking it actually worked

- The login screen appears instead of going straight to the dashboard.
- The "local storage mode" footer line is gone.
- Add a client, then look at **Realtime Database → Data** in the console: you should see
  `users/<your uid>/clients/…` appear live.
- Open the site in a private window — you should get the login screen, not your data.

## When something is wrong

| What you see | What it means |
|---|---|
| "Firebase keys look wrong" | A value in `.env.local` is mistyped, or the dev server wasn't restarted. |
| "Email/password sign-in is not enabled…" | Step 5.2 was skipped. |
| Login works, but the dashboard stays empty and the console shows `PERMISSION_DENIED` | The rules in step 4 weren't published, or they don't match the `users/$uid` shape. |
| `auth/unauthorized-domain` on the live site | Step 7.3 — add `mihirpatel2011.github.io` to authorised domains. |
| Still shows "local storage mode" | `.env.local` is missing, misnamed, or in the wrong folder (it belongs next to `package.json`). |
| Data appears under `compass/` instead of `users/…` | That's the local-mode leftover. Once signed in, everything writes under `users/<uid>`. |

## Moving data you already entered

If you added real records while in local storage mode, they live in your browser, not
Firebase. To move them: open the dashboard, press F12 → Console, and run
`copy(localStorage.getItem('compass-dashboard'))`. That puts the JSON on your clipboard.
In the Firebase console, go to Realtime Database → Data → your `users/<uid>` node → the
⋮ menu → **Import JSON**. Paste into a file and import it there.

If it was only test data, ignore this and start fresh.
