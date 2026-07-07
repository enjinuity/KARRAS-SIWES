import { useEffect, useMemo, useState } from 'react';
import { UploadCloud } from 'lucide-react';

import { VirtualLabShell } from '@/components/virtual-lab/VirtualLabShell';
import { useVirtualLabStore } from '@/store/useVirtualLabStore';

const demoStudentProfile = {
  name: 'Ruth Afolabi',
  matricNumber: 'CSC/24/022',
  institutionShortName: 'DSSCIT',
  enrolledCourseIds: ['csc-201', 'csc-312'],
};

const defaultStudentCode = `#include <stdio.h>

int isBalanced(const char *expr) {
  int open = 0;

  for (int i = 0; expr[i] != '\0'; i += 1) {
    if (expr[i] == '(') {
      open += 1;
    } else if (expr[i] == ')') {
      if (open == 0) {
        return 0;
      }
      open -= 1;
    }
  }

  return open == 0;
}

int main(void) {
  const char *sample = "(a+b)*(c-d)";
  printf("%d\n", isBalanced(sample));
  return 0;
}`;

export default function VirtualLabStudent() {
  const courses = useVirtualLabStore((state) => state.courses);
  const assignments = useVirtualLabStore((state) => state.assignments);
  const submissions = useVirtualLabStore((state) => state.submissions);
  const saveSubmission = useVirtualLabStore((state) => state.saveSubmission);

  const enrolledCourses = useMemo(
    () => courses.filter((course) => demoStudentProfile.enrolledCourseIds.includes(course.id)),
    [courses],
  );
  const studentAssignments = useMemo(
    () =>
      assignments.filter((assignment) => demoStudentProfile.enrolledCourseIds.includes(assignment.courseId) && assignment.status !== 'closed'),
    [assignments],
  );

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [code, setCode] = useState(defaultStudentCode);
  const [notes, setNotes] = useState('Current draft covers bracket balance validation and a short reasoning note.');
  const [submissionState, setSubmissionState] = useState('Student workspace ready');

  useEffect(() => {
    if (!selectedAssignmentId && studentAssignments[0]) {
      setSelectedAssignmentId(studentAssignments[0].id);
    }
  }, [selectedAssignmentId, studentAssignments]);

  const currentAssignment = studentAssignments.find((assignment) => assignment.id === selectedAssignmentId) ?? studentAssignments[0];
  const currentCourse = enrolledCourses.find((course) => course.id === currentAssignment?.courseId) ?? enrolledCourses[0];
  const existingSubmission = submissions.find(
    (submission) =>
      submission.assignmentId === currentAssignment?.id && submission.matricNumber === demoStudentProfile.matricNumber,
  );

  useEffect(() => {
    if (!currentAssignment) {
      return;
    }

    if (existingSubmission) {
      setCode(existingSubmission.code || defaultStudentCode);
      setNotes(existingSubmission.notes || '');
      setSubmissionState(
        existingSubmission.status === 'graded'
          ? 'Graded submission loaded'
          : existingSubmission.status === 'submitted'
            ? 'Submitted work loaded'
            : 'Draft submission loaded',
      );
      return;
    }

    setCode(defaultStudentCode);
    setNotes('Current draft covers bracket balance validation and a short reasoning note.');
    setSubmissionState('Fresh assignment draft loaded');
  }, [currentAssignment, existingSubmission]);

  const handleSave = async (status: 'draft' | 'submitted') => {
    if (!currentAssignment) {
      return;
    }

    try {
      const result = await saveSubmission(currentAssignment.id, {
        studentName: demoStudentProfile.name,
        matricNumber: demoStudentProfile.matricNumber,
        code,
        notes,
        status,
      });
      setSubmissionState(
        result.status === 'submitted' ? 'Assignment submitted successfully.' : 'Draft saved to the Virtual Lab.',
      );
    } catch (error) {
      setSubmissionState(error instanceof Error ? error.message : 'Submission action failed.');
    }
  };

  return (
    <VirtualLabShell>
      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.15fr_0.78fr]">
        <article className="rounded-[28px] border border-white/10 bg-black/60 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Student</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">{demoStudentProfile.name}</h2>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
            {demoStudentProfile.matricNumber} · {demoStudentProfile.institutionShortName}
          </p>
          <div className="mt-6 border-t border-white/8 pt-5">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Assignments</p>
            <div className="mt-4 space-y-2">
              {studentAssignments.map((assignment) => {
                const course = enrolledCourses.find((item) => item.id === assignment.courseId);
                return (
                  <button
                    key={assignment.id}
                    type="button"
                    onClick={() => setSelectedAssignmentId(assignment.id)}
                    className={`w-full rounded-[20px] border p-4 text-left transition ${
                      assignment.id === currentAssignment?.id
                        ? 'border-white/14 bg-white/[0.08]'
                        : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{course?.code ?? 'Course'}</p>
                    <h3 className="mt-2 text-sm text-zinc-100">{assignment.title}</h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-600">
                      Due {new Date(assignment.dueAt).toLocaleDateString('en-NG')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-black/60 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{currentCourse?.code ?? 'No Course'}</p>
              <h2 className="mt-3 font-display text-3xl text-zinc-50">
                {currentAssignment?.title ?? 'No assignment available'}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                {currentAssignment?.prompt ?? 'Assignments for this student will appear here.'}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-400">
              {currentAssignment ? new Date(currentAssignment.dueAt).toLocaleString('en-NG') : 'No deadline'}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between border-y border-white/8 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Coding Workspace</p>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
              {existingSubmission?.status ?? 'draft'}
            </span>
          </div>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            rows={18}
            className="mt-5 w-full rounded-[24px] border border-white/10 bg-[#050505] p-5 font-mono text-xs leading-6 text-zinc-100 outline-none"
          />
        </article>

        <article className="rounded-[28px] border border-white/10 bg-black/60 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Submission</p>
          <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Notes</p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={7}
              placeholder="Short reasoning note or submission summary"
              className="mt-4 w-full rounded-[18px] border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave('draft')}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.16em] text-zinc-200"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => void handleSave('submitted')}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-4 py-3 text-xs uppercase tracking-[0.16em] text-black"
            >
              <UploadCloud className="h-4 w-4" />
              Submit
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-500">{submissionState}</p>
          {existingSubmission?.feedback ? (
            <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Feedback</p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{existingSubmission.feedback}</p>
            </div>
          ) : null}
        </article>
      </section>
    </VirtualLabShell>
  );
}
