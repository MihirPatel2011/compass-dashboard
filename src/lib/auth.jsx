import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'
import { setRoot } from './store'

const AuthCtx = createContext(null)

/**
 * Email/password auth.
 *
 * With Firebase configured, nothing renders until we know whether someone is
 * signed in, and the data root is pinned to that account's `users/<uid>`.
 * Without Firebase the app runs unauthenticated against localStorage so local
 * development needs no account.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setRoot(null)
      return undefined
    }
    // Keep the session across reloads and tabs.
    setPersistence(auth, browserLocalPersistence).catch(() => {})
    return onAuthStateChanged(auth, (u) => {
      setRoot(u?.uid || null)
      setUser(u)
      setReady(true)
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      // Local mode has no accounts, so treat it as always signed in.
      signedIn: !isFirebaseConfigured || !!user,
      needsAuth: isFirebaseConfigured,
      email: user?.email || '',
      signIn: (email, password) => signInWithEmailAndPassword(auth, email.trim(), password),
      signOut: () => fbSignOut(auth),
      resetPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
    }),
    [user, ready],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Firebase error codes are not for humans. */
export function authMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That does not look like an email address.'
    case 'auth/missing-password':
      return 'Enter your password.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is not right.'
    case 'auth/user-disabled':
      return 'That account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.'
    case 'auth/network-request-failed':
      return 'No connection to Firebase. Check your network.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in the Firebase console yet.'
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
    case 'auth/configuration-not-found':
      return 'Firebase keys look wrong — check the values in .env.local.'
    default:
      return 'Could not sign in. Try again.'
  }
}
