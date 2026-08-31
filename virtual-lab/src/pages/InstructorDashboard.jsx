import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function InstructorDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expectedOutput, setExpectedOutput] = useState('')
  const [deadline, setDeadline] = useState('')
  const [manualPdfFile, setManualPdfFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [refreshing, setRefreshing] = useState(true)

  const supabaseStorageUrl = `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/manuals`

  const refreshAssignments = async () => {
    if (!profile) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id, title, description, deadline, created_at, manual_pdf_url,
          instructor_id,
          submissions (id)
        `)
        .eq('instructor_id', profile.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setAssignments((data || []).map(a => ({
        ...a,
        submission_count: a.submissions ? a.submissions.length : 0
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (profile) refreshAssignments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!profile) return
    setFormError(null)
    setFormSuccess(false)
    setLoading(true)
    setUploadingPdf(false)
    try {
      if (!title.trim()) throw new Error('Title is required')
      if (!deadline) throw new Error('Deadline is required')

      let manualPdfUrl = null
      if (manualPdfFile) {
        if (manualPdfFile.type && manualPdfFile.type !== 'application/pdf') {
          throw new Error('Manual must be a PDF file.')
        }
        if (manualPdfFile.size > 10 * 1024 * 1024) {
          throw new Error('Manual PDF must be under 10MB.')
        }
        setUploadingPdf(true)
        const safeSlug = (title.trim() || 'assignment').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'manual'
        const path = `${Date.now()}-${safeSlug}-${Math.random().toString(36).slice(2, 8)}.pdf`
        const { error: upErr } = await supabase.storage
          .from('manuals')
          .upload(path, manualPdfFile, { cacheControl: '3600', upsert: false, contentType: 'application/pdf' })
        if (upErr) throw new Error(`PDF upload failed: ${upErr.message || String(upErr)}`)
        manualPdfUrl = `${supabaseStorageUrl}/${path}`
      }

      const { error } = await supabase
        .from('assignments')
        .insert({
          instructor_id: profile.id,
          title: title.trim(),
          description: description.trim(),
          expected_output: expectedOutput.trim() || null,
          manual_pdf_url: manualPdfUrl,
          deadline: new Date(deadline).toISOString()
        })
      if (error) throw error
      setTitle(''); setDescription(''); setExpectedOutput(''); setDeadline(''); setManualPdfFile(null)
      if (document.getElementById('manual_pdf')) document.getElementById('manual_pdf').value = ''
      setFormSuccess(true)
      setTimeout(() => setFormSuccess(false), 3000)
      refreshAssignments()
    } catch (err) {
      setFormError(err.message || 'Could not create assignment')
    } finally {
      setUploadingPdf(false)
      setLoading(false)
    }
  }

  const doSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const [deletingId, setDeletingId] = useState(null)
  const handleDelete = async (e, a) => {
    if (e) e.preventDefault()
    if (e) e.stopPropagation()
    if (!a) return
    const ok = window.confirm(
      `Delete assignment "${a.title}"?\n\n` +
      `All ${a.submission_count} submission${a.submission_count === 1 ? '' : 's'} will be deleted.` +
      (a.manual_pdf_url ? '\nThe attached manual PDF will also be removed from storage.' : '') +
      `\n\nThis cannot be undone.`
    )
    if (!ok) return
    setDeletingId(a.id)
    try {
      if (a.manual_pdf_url) {
        const path = a.manual_pdf_url.split('/object/public/manuals/').pop() || a.manual_pdf_url
        if (path) {
          try {
            await supabase.storage.from('manuals').remove([path])
          } catch (storageErr) {
            console.warn('storage remove failed (non-fatal, proceeding):', storageErr)
          }
        }
      }
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', a.id)
      if (error) throw error
      await refreshAssignments()
    } catch (err) {
      console.error(err)
      alert(`Delete failed: ${err.message || String(err)}`)
    } finally {
      setDeletingId(null)
    }
  }

  const fmtDeadline = (iso) => {
    try {
      return new Date(iso).toLocaleString()
    } catch { return iso }
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
          <h1>Instructor Dashboard</h1>
          <div className="subtitle">{profile?.full_name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {karrasChip}
          <button className="btn btn-secondary btn-sm" onClick={doSignOut}>Sign out</button>
        </div>
      </div>
      <div className="page">
        <div className="card">
          <h2>Create new assignment</h2>
          {formError && <div className="error">{formError}</div>}
          {formSuccess && <div className="success">Assignment created.</div>}
          <form onSubmit={handleCreate}>
            <div className="field">
              <label className="label" htmlFor="title">Title</label>
              <input
                id="title" className="input" value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Arrays"
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="description">Description</label>
              <textarea
                id="description" className="textarea" value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the assignment, starter code, expected output…"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="expected_output">Expected Output <span className="muted small">(optional)</span></label>
              <textarea
                id="expected_output" className="textarea" value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                style={{ minHeight: 84, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.95rem' }}
                placeholder="e.g.&#10;Hello, World!"
              />
              <div className="small muted" style={{ marginTop: 4 }}>
                Used for auto-checking when the student clicks Run.
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="manual_pdf">Manual PDF <span className="muted small">(optional)</span></label>
              <input
                id="manual_pdf"
                type="file"
                accept="application/pdf,.pdf"
                className="input"
                style={{ paddingInline: 10, lineHeight: 1.2, paddingBlock: 10 }}
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0]
                  setManualPdfFile(f || null)
                }}
              />
              <div className="small muted" style={{ marginTop: 4 }}>
                Upload a reference manual (PDF only, max 10 MB). Students see it embedded above the code editor.
              </div>
              {manualPdfFile && (
                <div className="small" style={{ marginTop: 6 }}>
                  <span className="muted">Selected:</span> {manualPdfFile.name}
                  <span className="muted">&nbsp; ({Math.round(manualPdfFile.size / 1024)} KB)</span>
                </div>
              )}
            </div>
            <div className="field">
              <label className="label" htmlFor="deadline">Deadline</label>
              <input
                id="deadline" type="datetime-local" className="input" value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-block" disabled={loading}>
              {loading ? 'Creating…' : 'Create assignment'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="row">
            <h2 className="mb-0">Your assignments</h2>
            <button className="btn btn-secondary btn-sm" onClick={refreshAssignments}>
              Refresh
            </button>
          </div>
          <div style={{ height: 16 }} />
          {refreshing && assignments.length === 0 ? (
            <p className="muted text-center">Loading…</p>
          ) : assignments.length === 0 ? (
            <div className="empty">No assignments yet. Create one above.</div>
          ) : (
            assignments.map((a) => (
              <Link key={a.id} to={`/instructor/assignment/${a.id}`} className="list-item">
                <div className="row" style={{ width: '100%', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="list-item-title">{a.title}</div>
                    <div className="list-item-meta">
                      <span>Due: {fmtDeadline(a.deadline)}</span>
                      <span className="badge badge-submitted" style={{ marginLeft: 'auto' }}>
                        {a.submission_count} submission{a.submission_count === 1 ? '' : 's'}
                      </span>
                    </div>
                    {a.description && (
                      <p className="small muted mt-lg mb-0" style={{ marginTop: 8 }}>
                        {a.description.length > 140 ? a.description.slice(0, 140) + '…' : a.description}
                      </p>
                    )}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)', flexShrink: 0, minWidth: 0, padding: '6px 10px' }}
                    onClick={(e) => handleDelete(e, a)}
                    disabled={deletingId === a.id}
                    title="Delete assignment"
                  >
                    {deletingId === a.id ? '…' : 'Delete'}
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
