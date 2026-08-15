import { useState } from 'react'
import { useAuth, authMessage } from '../lib/auth'
import { C, serif, mono, sans, labelSm } from '../lib/theme'

const field = {
  padding: '12px 14px',
  border: `1px solid ${C.field}`,
  borderRadius: 9,
  background: C.cardTint,
  fontFamily: sans,
  fontSize: 14,
  color: C.ink,
  width: '100%',
}

export default function Login() {
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(authMessage(err.code))
    } finally {
      setBusy(false)
    }
  }

  const forgot = async () => {
    setError('')
    setNotice('')
    if (!email.trim()) {
      setError('Type your email above first, then hit reset.')
      return
    }
    try {
      await resetPassword(email)
      setNotice('Reset link sent — check your inbox.')
    } catch (err) {
      setError(authMessage(err.code))
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.paper,
        color: C.ink,
        fontFamily: sans,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontFamily: serif, fontSize: 40, lineHeight: 1 }}>Compass</div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: C.muted,
            }}
          >
            Personal HQ
          </div>
        </div>

        <form
          onSubmit={submit}
          style={{
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7, ...labelSm }}>
            Email
            <input
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={field}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 7, ...labelSm }}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={field}
            />
          </label>

          {error ? (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f6e3e0', color: C.red, fontSize: 12.5, lineHeight: 1.5 }}>
              {error}
            </div>
          ) : null}
          {notice ? (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: '#e3eee4', color: C.green, fontSize: 12.5, lineHeight: 1.5 }}>
              {notice}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: 9,
              background: C.ink,
              color: '#f4efe4',
              fontSize: 13.5,
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div
            role="button"
            tabIndex={0}
            onClick={forgot}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && forgot()}
            style={{
              alignSelf: 'center',
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.accent,
              cursor: 'pointer',
            }}
          >
            Forgot password
          </div>
        </form>

        <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6, textAlign: 'center' }}>
          Accounts are created in the Firebase console, not here — there is no public sign-up.
        </div>
      </div>
    </div>
  )
}
