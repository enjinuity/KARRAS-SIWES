import { useMemo, useState } from 'react';
import { CheckCheck, Download, MessageSquareMore, PencilLine } from 'lucide-react';

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
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Grading Console</p>
          <h2 className="mt-3 font-display text-4xl text-zinc-50">One workflow for reviewing and publishing marks.</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-300">
            The grading side is built for staff handling several practical courses in the same term. Review state,
            scoring, feedback, and export should live together instead of being scattered across ad hoc tools.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <PencilLine className="h-5 w-5 text-cyan-200" />
                <p className="text-sm text-zinc-200">Score and comment on each submission</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCheck className="h-5 w-5 text-emerald-200" />
                <p className="text-sm text-zinc-200">Track grading completion for the course</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <MessageSquareMore className="h-5 w-5 text-amber-200" />
                <p className="text-sm text-zinc-200">Keep feedback tied to the academic record</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-cyan-200" />
                <p className="text-sm text-zinc-200">Export grades for faculty and registry workflows</p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{primaryCourse?.code ?? 'Course'}</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">{primaryAssignment?.title ?? 'Assignment queue'}</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            {primaryAssignment?.prompt ?? 'Open submissions will appear here once the Virtual Lab data loads.'}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Course</p>
              <p className="mt-3 text-lg text-zinc-50">{primaryCourse?.title ?? 'Loading'}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Submissions</p>
              <p className="mt-3 text-lg text-zinc-50">{primaryAssignment?.submissionCount ?? 0}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Pending Review</p>
              <p className="mt-3 text-lg text-amber-200">
                {primarySubmissions.filter((submission) => submission.status === 'submitted').length}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Submission Review</p>
            <h2 className="mt-3 font-display text-3xl text-zinc-50">Course grading queue.</h2>
          </div>
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200"
          >
            <Download className="h-4 w-4" />
            Export Grade Sheet
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-zinc-500">
                <th className="px-4 py-2 font-medium">Student</th>
                <th className="px-4 py-2 font-medium">Matric</th>
                <th className="px-4 py-2 font-medium">Submitted</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Score</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {primarySubmissions.map((submission) => (
                <tr key={submission.id} className="rounded-[20px] border border-white/10 bg-white/[0.03] text-sm text-zinc-300">
                  <td className="rounded-l-[20px] px-4 py-4 text-zinc-100">{submission.studentName}</td>
                  <td className="px-4 py-4 text-zinc-400">{submission.matricNumber}</td>
                  <td className="px-4 py-4 text-zinc-400">{submission.submittedAt}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-100">{submission.score ?? 'Pending'}</td>
                  <td className="rounded-r-[20px] px-4 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubmissionId(submission.id);
                        setScore(submission.score?.toString() ?? '75');
                        setFeedback(submission.feedback || 'Solid structure. Tighten explanation quality and edge-case handling.');
                      }}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Review Panel</p>
          <h3 className="mt-3 text-lg text-zinc-50">{selectedSubmission?.studentName ?? 'Select a submission'}</h3>
          <p className="mt-2 text-sm text-zinc-500">{selectedSubmission?.matricNumber ?? 'No student selected'}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[0.3fr_0.7fr]">
            <input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              placeholder="Score"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              placeholder="Instructor feedback"
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleGrade()}
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-xs uppercase tracking-[0.16em] text-cyan-100"
            >
              Save Grade
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-500">{gradingState}</p>
        </div>
      </section>
    </VirtualLabShell>
  );
}
