import { useMemo, useState } from 'react';
import { CalendarClock, Download, FileCode2, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { VirtualLabShell } from '@/components/virtual-lab/VirtualLabShell';
import { useVirtualLabStore } from '@/store/useVirtualLabStore';

function formatDueLabel(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VirtualLabCourse() {
  const { courseId } = useParams();
  const courses = useVirtualLabStore((state) => state.courses);
  const assignments = useVirtualLabStore((state) => state.assignments);
  const createAssignment = useVirtualLabStore((state) => state.createAssignment);
  const exportCourseGrades = useVirtualLabStore((state) => state.exportCourseGrades);

  const course = useMemo(
    () => courses.find((item) => item.id === courseId) ?? courses[0],
    [courseId, courses],
  );
  const courseAssignments = assignments.filter((assignment) => assignment.courseId === course?.id);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [formState, setFormState] = useState<string>('Drafting a new course assignment');

  if (!course) {
    return (
      <VirtualLabShell>
        <section className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6 text-sm text-zinc-300">
          No course workspace is available yet.
        </section>
      </VirtualLabShell>
    );
  }

  const handleCreateAssignment = async () => {
    if (!title.trim() || !prompt.trim() || !dueAt) {
      setFormState('Title, prompt, and due date are required.');
      return;
    }

    try {
      await createAssignment(course.id, {
        title,
        prompt,
        dueAt: new Date(dueAt).toISOString(),
        status: 'published',
      });
      setTitle('');
      setPrompt('');
      setDueAt('');
      setFormState('Assignment published to the course workspace.');
    } catch (error) {
      setFormState(error instanceof Error ? error.message : 'Failed to publish assignment.');
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportCourseGrades(course.id);
      const blob = new Blob([result.content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setFormState('Grade export downloaded.');
    } catch (error) {
      setFormState(error instanceof Error ? error.message : 'Failed to export course grades.');
    }
  };

  return (
    <VirtualLabShell>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{course.code}</p>
          <h2 className="mt-3 font-display text-4xl text-zinc-50">{course.title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            This course workspace keeps assignments, roster context, and grading progress together so staff can run a
            practical coding course from one operational surface.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Instructor</p>
                <Users className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="mt-4 text-lg text-zinc-50">{course.instructorName}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Students</p>
                <Users className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="mt-4 text-lg text-zinc-50">{course.studentCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Schedule</p>
                <CalendarClock className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="mt-4 text-lg text-zinc-50">{course.schedule}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Course Actions</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">Staff-side course management.</h2>
          <div className="mt-6 space-y-3 text-sm leading-6 text-zinc-300">
            <p>Create and publish practical assignments.</p>
            <p>Track the live submission state of the course.</p>
            <p>Export grades and outcomes once marking is complete.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/virtual-lab/grading"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100"
            >
              Open Grading
            </Link>
            <button
              type="button"
              onClick={() => void handleExport()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200"
            >
              <Download className="h-4 w-4" />
              Export Course Grades
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Assignment Builder</p>
              <h2 className="mt-3 font-display text-3xl text-zinc-50">Published and draft practical tasks.</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300">
              {courseAssignments.length} items
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {courseAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Due {formatDueLabel(assignment.dueAt)}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-zinc-50">{assignment.title}</h3>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                    {assignment.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{assignment.prompt}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  {assignment.submissionCount} submissions in the current term
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Builder Direction</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">Assignment creation should feel academic, not generic.</h2>
          <div className="mt-6 space-y-4">
            {[
              'Course-scoped assignment prompt with rich instructions',
              'Deadline and publishing state management',
              'Submission mode controls for phone or laptop learners',
              'Clear grading expectations for staff review',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <FileCode2 className="mt-1 h-4 w-4 shrink-0 text-cyan-200" />
                <p className="text-sm leading-6 text-zinc-300">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Create Assignment</p>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Assignment title"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Assignment prompt and instructions"
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none"
              />
              <button
                type="button"
                onClick={() => void handleCreateAssignment()}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-xs uppercase tracking-[0.16em] text-cyan-100"
              >
                Publish Assignment
              </button>
            </div>
            <p className="mt-4 text-sm text-zinc-500">{formState}</p>
          </div>
        </article>
      </section>
    </VirtualLabShell>
  );
}
