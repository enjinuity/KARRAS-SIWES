import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function InstructorAssignmentDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState(null)

  useEffect(() => {
    if (!id || !profile) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadErr(null)
      try {
        const { data: asgn, error: aErr } = await supabase
          .from('assignments')
          .select('id, title, description, expected_output, manual_pdf_url, deadline, created_at, instructor_id')
          .eq('id', id)
          .single()
        if (aErr) throw aErr
        if (asgn.instructor_id !== profile.id) throw new Error('Not authorized')
        if (!cancelled) setAssignment(asgn)

        const { data: subs, error: sErr } = await supabase
          .from('submissions')
          .select(`
            id, submitted_at, grade, status, auto_passed,
            users!submissions_student_id_fkey(full_name, email)
          `)
          .eq('assignment_id', id)
          .order('submitted_at', { ascending: true })
        if (sErr) throw sErr
        if (!cancelled) setSubmissions(subs || [])
      } catch (err) {
        console.error(err)
        if (!cancelled) setLoadErr(err.message || 'Could not load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, profile])

  const fmt = (iso) => {
    try { return new Date(iso).toLocaleString() } catch { return iso }
  }

  if (loading && !assignment) {
    return <div className="page"><div className="card"><p className="text-center muted">Loading…</p></div></div>
  }

  if (loadErr) {
    return (
      <div className="page">
        <div className="card">
          <div className="error">{loadErr}</div>
          <Link to="/instructor" className="back-link">← Back to dashboard</Link>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="page">
        <div className="card">
          <p className="text-center mb-0">Assignment not found.</p>
          <div style={{ height: 12 }} />
          <Link to="/instructor" className="back-link">← Back</Link>
        </div>
      </div>
    )
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
          <Link to="/instructor" className="back-link">← Back</Link>
        </div>
        {karrasChip}
      </div>
      <div className="page">
        <div className="card">
          <h2 className="mb-0">{assignment.title}</h2>
          <div className="list-item-meta" style={{ marginTop: 8 }}>
            <span>Due: {fmt(assignment.deadline)}</span>
            <span className="badge badge-submitted" style={{ marginLeft: 'auto' }}>
              {submissions.length} submission{submissions.length === 1 ? '' : 's'}
            </span>
          </div>
          {assignment.description && (
            <div style={{ marginTop: 14, whiteSpace: 'pre-wrap' }}>
              {assignment.description}
            </div>
          )}
          {assignment.expected_output && (
            <div className="expected-output" style={{ marginTop: 14 }}>
              <div className="small muted" style={{ marginBottom: 6, fontWeight: 600 }}>
                Expected output
              </div>
              <pre className="code-block" style={{ margin: 0 }}>{assignment.expected_output}</pre>
            </div>
          )}
          {assignment.manual_pdf_url && (
            <div style={{ marginTop: 14 }}>
              <div className="small muted" style={{ marginBottom: 6, fontWeight: 600 }}>
                Manual
              </div>
              <a
                href={assignment.manual_pdf_url}
                target="_blank"
                rel="noreferrer noopener"
                className="small"
              >
                Open attached PDF manual in new tab ↗
              </a>
            </div>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="empty">No submissions yet.</div>
        ) : (
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              Submissions
            </h3>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Result</th>
                    <th>Grade</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => {
                    const statusBadge = s.auto_passed === true
                      ? <span className="badge badge-pass">PASS</span>
                      : <span className="badge badge-fail">FAIL</span>
                    return (
                      <tr key={s.id}>
                        <td data-label="Student">
                          <div style={{ fontWeight: 600 }}>
                            {s.users?.full_name || 'Unknown student'}
                          </div>
                          <div className="small muted">{s.users?.email || ''}</div>
                        </td>
                        <td data-label="Result">
                          {statusBadge}
                        </td>
                        <td data-label="Grade" style={{ fontWeight: 700 }}>
                          {s.grade == null ? '—' : s.grade}
                        </td>
                        <td data-label="Submitted" style={{ whiteSpace: 'nowrap' }}>
                          <span className="small muted">{fmt(s.submitted_at)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
