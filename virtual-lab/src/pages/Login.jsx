import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const DEMO_ACCOUNTS = [
  {
    role: 'instructor',
    accent: 'amber',
    label: 'LECTURER · CSC & ENGINEERING',
    name: 'Dr. Chukwuemeka Chukwu',
    subline: 'Faculty of Technology · Dept. of Computer Science & Engineering',
    email: 'instructor.chukwu@oau.edu.ng',
    password: 'demo1234',
    fallback: 'instructor@demo.com / demo1234',
  },
  {
    role: 'student',
    accent: 'blue',
    label: 'STUDENT · 200 LEVEL',
    name: 'Olaoluwa Adeyemi',
    subline: 'Matric CSC/2020/048 · Faculty of Technology · CS & Engineering',
    email: 'ola.adeyemi.200489@oau.edu.ng',
    password: 'demo1234',
    fallback: 'student@demo.com / demo1234',
  },
  {
    role: 'student',
    accent: 'green',
    label: 'STUDENT · 300 LEVEL',
    name: 'Precious Okafor',
    subline: 'Matric CSC/2019/012 · Faculty of Technology · CS & Engineering',
    email: 'precious.okafor.200512@oau.edu.ng',
    password: 'demo1234',
    fallback: null,
  },
]

const ACCENTS = {
  amber: 'rgba(164, 124, 58, 0.22)',
  blue:  'rgba(96, 165, 250, 0.22)',
  green: 'rgba(74, 222, 128, 0.20)',
}

const ACCENTS_BG = {
  amber: 'rgba(164, 124, 58, 0.06)',
  blue:  'rgba(96, 165, 250, 0.05)',
  green: 'rgba(74, 222, 128, 0.05)',
}

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

  const useDemo = (acc) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setTimeout(() => document.getElementById('password')?.focus(), 0)
  }

  const showSpinner = submitting || loading

  return (
    <div className="login-wrap">
      <div className="page" style={{ width: '100%', maxWidth: 520 }}>
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

          <div style={{ marginTop: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="small muted mt-0 mb-0" style={{ fontSize: 11.5 }}>
                Obafemi Awolowo University — prototype demo accounts<br />
                (seeded via <code>012_seed_realistic_nigerian_profiles.sql</code>)
              </p>
            </div>

            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <div
                  key={acc.email}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid ' + ACCENTS[acc.accent],
                    borderRadius: 16,
                    background: ACCENTS_BG[acc.accent],
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="small muted" style={{ fontSize: 10.5, letterSpacing: '0.06em' }}>{acc.label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem' }}>{acc.name}</div>
                      <div className="small muted" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{acc.subline}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, marginTop: 6 }}>
                        {acc.email} / demo1234
                      </div>
                      {acc.fallback && (
                        <div className="small muted" style={{ marginTop: 3 }}>
                          fallback: {acc.fallback}
                        </div>
                      )}
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => useDemo(acc)}>
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
