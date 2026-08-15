import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// ---------------------------------------------------------------------------
// Firebase config.
//
// These values are NOT secret — they identify your project to Firebase and are
// expected to ship in client code. Your data is protected by Realtime Database
// Security Rules.
//
// Configure by creating a `.env.local` in the project root (see `.env.example`).
// Until you do, the app runs on a localStorage-backed store with the exact same
// API, so everything works offline and nothing is lost when you plug Firebase in.
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.databaseURL

let database = null
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  database = getDatabase(app)
}

export const db = database

// Everything lives under one root so a future multi-user setup can swap this
// for `users/${uid}`.
export const ROOT = import.meta.env.VITE_FIREBASE_ROOT || 'compass'
