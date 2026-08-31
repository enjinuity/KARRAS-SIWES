import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn, profile, loading, supabaseMissing, hasClient, initError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (profile) {
      const to = profile.role === 'instructor' ? '/instructor' : '/student'
      navigate(to, { replace: true })
    }
  }, [profile, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasClient) {
      setError('Configure Supabase first — see banner above.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err.message || 'Sign in failed')
      setSubmitting(false)
    }
  }

  const showSpinner = submitting || loading

  return (
    <div className="login-wrap">
      <div className="page" style={{ width: '100%', maxWidth: 440 }}>
        <div className="brand">
          <div className="brand-mark">
            <img src="/vl/k-logo.svg" alt="KARRAS" width="46" height="46" style={{ display: 'block' }} />
          </div>
          <h2>KARRAS</h2>
          <h1>Virtual Lab</h1>
          <p>Coding assignments, submissions, grading.</p>
        </div>
        <div className="card">
          <h2>Sign in</h2>
          {supabaseMissing && (
            <div className="error">
              Supabase not configured yet. Add your project env vars to <code>.env</code> and restart the dev server before you can sign in.
              {initError && <div style={{ marginTop: 6, fontSize: '0.85rem' }}>{initError}</div>}
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                autoComplete="email"
                autoCapitalize="none"
                required
                disabled={!hasClient}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.ng"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                autoComplete="current-password"
                required
                disabled={!hasClient}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-block" disabled={showSpinner || !hasClient}>
              {!hasClient ? 'Waiting for Supabase…' : showSpinner ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div style={{ marginTop: 18, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
            <p className="small muted mt-0 mb-0">
              Demo accounts (after seeding Supabase):<br />
              <strong>instructor@demo.com</strong> / demo1234<br />
              <strong>student@demo.com</strong> / demo1234
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
