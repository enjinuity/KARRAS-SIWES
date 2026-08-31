import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function StudentDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      setLoading(true)
      try {
        const { data: subs, error: subsErr } = await supabase
          .from('submissions')
          .select('assignment_id, status')
          .eq('student_id', profile.id)
        if (subsErr) throw subsErr

        const { data: asgns, error: asgnErr } = await supabase
          .from('assignments')
          .select('id, title, description, deadline, created_at, users!assignments_instructor_id_fkey(full_name)')
          .order('deadline', { ascending: false })
        if (asgnErr) throw asgnErr

        const subMap = {}
        for (const s of subs || []) subMap[s.assignment_id] = s.status

        const now = new Date()
        const enriched = (asgns || []).map(a => {
          const status = subMap[a.id] || 'not_started'
          const past = new Date(a.deadline) < now
          return { ...a, status, past }
        })
        setAssignments(enriched)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  const doSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const badgeFor = (status) => {
    if (status === 'graded') return <span className="badge badge-graded">Graded</span>
    if (status === 'submitted') return <span className="badge badge-submitted">Submitted</span>
    return <span className="badge badge-notstarted">Not started</span>
  }

  const fmtDeadline = (iso) => {
    try { return new Date(iso).toLocaleString() } catch { return iso }
  }

  const karrasChip = (
    <a href="/" className="karras-chip" title="Back to KARRAS platform">
      <img src="/vl/k-logo.svg" alt="" width="14" height="14" style={{ display: 'block' }} />
      KARRAS
    </a>
  )

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Assignments</h1>
          <div className="subtitle">{profile?.full_name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {karrasChip}
          <button className="btn btn-secondary btn-sm" onClick={doSignOut}>Sign out</button>
        </div>
      </div>
      <div className="page">
        {loading ? (
          <div className="card"><p className="muted text-center mb-0">Loading…</p></div>
        ) : assignments.length === 0 ? (
          <div className="empty">No assignments yet.</div>
        ) : (
          assignments.map(a => (
            <Link key={a.id} to={`/student/assignment/${a.id}`} className="list-item">
              <div className="row">
                <div className="list-item-title grow">{a.title}</div>
                {badgeFor(a.status)}
              </div>
              <div className="list-item-meta" style={{ marginTop: 4 }}>
                <span>Instructor: {a.users?.full_name || '—'}</span>
              </div>
              <div className="list-item-meta">
                <span className={a.past ? 'deadline-past' : ''}>
                  {a.past ? 'Closed · ' : 'Due: '}{fmtDeadline(a.deadline)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
