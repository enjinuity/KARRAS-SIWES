import Papa from 'papaparse'

export const downloadCsv = (rows, filename = 'export.csv') => {
  if (!rows || !rows.length) {
    const blob = new Blob([Papa.unparse([['(no data)']])], { type: 'text/csv;charset=utf-8;' })
    triggerBlob(blob, filename)
    return
  }
  const csv = Papa.unparse(rows, { quotes: true, newline: '\r\n' })
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  triggerBlob(blob, filename)
}

const triggerBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', filename)
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 500)
}

export const buildManualGradeCsv = ({ manual, tasks, rows }) => {
  const header = [
    'Matric No.',
    'Level',
    'Faculty',
    'Department',
    'Student Email',
    'Student Name',
    'Student ID (UUID)',
    ...tasks.map((t) => `Task ${t.order_index}: ${t.title || ''} (${t.points || 0})`),
    'Total Earned',
    'Total Possible',
    'Score %',
    'Status',
  ]
  const totalPossible = tasks.reduce((a, t) => a + (Number(t.points) || 0), 0)
  const data = rows.map((r) => {
    const earned = tasks.reduce((sum, t) => {
      const cell = r.taskGrades[t.id]
      const grade = typeof cell?.grade === 'number' ? cell.grade : 0
      return sum + grade
    }, 0)
    const pct = totalPossible ? Number(((earned / totalPossible) * 100).toFixed(2)) : 0
    return [
      r.matricNo || '',
      r.level || '',
      r.faculty || '',
      r.department || '',
      r.email,
      r.fullName,
      r.studentId,
      ...tasks.map((t) => {
        const cell = r.taskGrades[t.id]
        if (!cell) return ''
        const g = typeof cell.grade === 'number' ? cell.grade : ''
        const s = cell.status || ''
        return typeof g === 'number' ? `${g}${s ? ` (${s})` : ''}` : s
      }),
      earned,
      totalPossible,
      pct,
      r.statusLabel,
    ]
  })
  return { header, data, rows: [header, ...data] }
}

export const buildAssignmentGradeCsv = ({ assignment, rows }) => {
  const header = [
    'Matric No.',
    'Level',
    'Faculty',
    'Department',
    'Student Email',
    'Student Name',
    'Student ID (UUID)',
    'Auto Passed',
    'Submission Status',
    'Submitted At',
    'Grade Earned',
    'Total Possible',
    'Score %',
  ]
  const totalPossible = 100
  const data = rows.map((r) => {
    const earned = typeof r.grade === 'number' ? r.grade : 0
    const pct = totalPossible ? Number(((earned / totalPossible) * 100).toFixed(2)) : 0
    return [
      r.matricNo || '',
      r.level || '',
      r.faculty || '',
      r.department || '',
      r.email || '',
      r.fullName || '',
      r.studentId || '',
      r.autoPassed === true ? 'Yes' : r.autoPassed === false ? 'No' : '',
      r.statusLabel || r.status || '',
      r.submittedAt || '',
      typeof r.grade === 'number' ? r.grade : '',
      totalPossible,
      pct,
    ]
  })
  return { header, data, rows: [header, ...data] }
}
