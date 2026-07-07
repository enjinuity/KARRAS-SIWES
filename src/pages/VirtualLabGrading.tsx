import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';

import { VirtualLabShell } from '@/components/virtual-lab/VirtualLabShell';
import { useVirtualLabStore } from '@/store/useVirtualLabStore';

export default function VirtualLabGrading() {
  const courses = useVirtualLabStore((state) => state.courses);
  const assignments = useVirtualLabStore((state) => state.assignments);
  const submissions = useVirtualLabStore((state) => state.submissions);
  const gradeSubmission = useVirtualLabStore((state) => state.gradeSubmission);
  const exportCourseGrades = useVirtualLabStore((state) => state.exportCourseGrades);

  const primaryCourse = courses[0];
  const primaryAssignment = assignments.find((assignment) => assignment.courseId === primaryCourse?.id) ?? assignments[0];
  const primarySubmissions = useMemo(
    () => submissions.filter((submission) => submission.assignmentId === primaryAssignment?.id),
    [primaryAssignment, submissions],
  );
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [score, setScore] = useState('75');
  const [feedback, setFeedback] = useState('Solid structure. Tighten explanation quality and edge-case handling.');
  const [gradingState, setGradingState] = useState('Ready to review submissions');

  const selectedSubmission =
    primarySubmissions.find((submission) => submission.id === selectedSubmissionId) ?? primarySubmissions[0];

  const handleGrade = async () => {
    if (!selectedSubmission) {
      return;
    }

    const numericScore = Number(score);
    if (Number.isNaN(numericScore)) {
      setGradingState('Score must be numeric.');
      return;
    }

    try {
      await gradeSubmission(selectedSubmission.id, { score: numericScore, feedback });
      setGradingState('Submission graded and stored.');
    } catch (error) {
      setGradingState(error instanceof Error ? error.message : 'Failed to grade submission.');
    }
  };

  const handleExport = async () => {
    if (!primaryCourse) {
      return;
    }

    try {
      const result = await exportCourseGrades(primaryCourse.id);
      const blob = new Blob([result.content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setGradingState('Grade sheet exported.');
    } catch (error) {
      setGradingState(error instanceof Error ? error.message : 'Failed to export grade sheet.');
    }
  };

  return (
    <VirtualLabShell>
      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Grading Console</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">Review state.</h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10">
            {[
              ['Course', primaryCourse?.title ?? 'Loading'],
              ['Assignment', primaryAssignment?.title ?? 'Loading'],
              ['Submissions', String(primaryAssignment?.submissionCount ?? 0)],
              ['Pending', String(primarySubmissions.filter((submission) => submission.status === 'submitted').length)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-black/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <p className="text-sm text-zinc-200">{value}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void handleExport()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-4 py-3 text-xs uppercase tracking-[0.16em] text-black"
          >
            <Download className="h-4 w-4" />
            Export Grade Sheet
          </button>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Assignment Context</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">{primaryAssignment?.title ?? 'Assignment queue'}</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{primaryAssignment?.prompt ?? 'No assignment selected.'}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[28px] border border-white/10 bg-black/60 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Submission Review</p>
            <h2 className="mt-3 font-display text-3xl text-zinc-50">Queue.</h2>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.16em] text-zinc-500">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Matric</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {primarySubmissions.map((submission) => (
                <tr key={submission.id} className="border-b border-white/10 text-sm text-zinc-300 last:border-b-0">
                  <td className="px-4 py-4 text-zinc-100">{submission.studentName}</td>
                  <td className="px-4 py-4 text-zinc-400">{submission.matricNumber}</td>
                  <td className="px-4 py-4 text-zinc-400">{submission.submittedAt}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-100">{submission.score ?? 'Pending'}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubmissionId(submission.id);
                        setScore(submission.score?.toString() ?? '75');
                        setFeedback(submission.feedback || 'Solid structure. Tighten explanation quality and edge-case handling.');
                      }}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </article>

        <aside className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Review Panel</p>
          <h3 className="mt-3 text-lg text-zinc-50">{selectedSubmission?.studentName ?? 'Select a submission'}</h3>
          <p className="mt-2 text-sm text-zinc-500">{selectedSubmission?.matricNumber ?? 'No student selected'}</p>
          <div className="mt-5 grid gap-3">
            <input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              placeholder="Score"
              className="rounded-[18px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={8}
              placeholder="Instructor feedback"
              className="rounded-[18px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleGrade()}
              className="rounded-full border border-white/12 bg-white px-4 py-3 text-xs uppercase tracking-[0.16em] text-black"
            >
              Save Grade
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-500">{gradingState}</p>
        </aside>
      </section>
    </VirtualLabShell>
  );
}
