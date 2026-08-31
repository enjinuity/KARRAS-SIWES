import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, requiredRole }) {
  const { profile, loading, supabaseMissing } = useAuth()
  const location = useLocation()

  if (supabaseMissing) {
    return (
      <div className="page">
        <div className="card">
          <h2>Configure Supabase first</h2>
          <p className="muted">
            Edit <code>.env</code> with your <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p className="text-center muted mb-0">Loading…</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRole && profile.role !== requiredRole) {
    const redirectTo = profile.role === 'instructor' ? '/instructor' : '/student'
    return <Navigate to={redirectTo} replace />
  }

  return children
}
