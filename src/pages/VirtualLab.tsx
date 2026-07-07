import { ArrowRight, Building2, Files, GraduationCap, LibraryBig } from 'lucide-react';
import { Link } from 'react-router-dom';

import { VirtualLabShell } from '@/components/virtual-lab/VirtualLabShell';
import { useVirtualLabStore } from '@/store/useVirtualLabStore';

function formatDueLabel(isoDate: string) {
  const dueDate = new Date(isoDate);
  return dueDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VirtualLab() {
  const institution = useVirtualLabStore((state) => state.institution);
  const courses = useVirtualLabStore((state) => state.courses);
  const assignments = useVirtualLabStore((state) => state.assignments);
  const submissions = useVirtualLabStore((state) => state.submissions);
  const status = useVirtualLabStore((state) => state.status);

  const institutionStats = [
    { label: 'Departments', value: institution?.departmentCount ?? '-', Icon: Building2 },
    { label: 'Active Courses', value: institution?.activeCourseCount ?? '-', Icon: LibraryBig },
    { label: 'Students In Term', value: institution?.activeStudentCount ?? '-', Icon: GraduationCap },
    { label: 'Open Submissions', value: submissions.filter((item) => item.status === 'submitted').length, Icon: Files },
  ];

  return (
    <VirtualLabShell>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Institution</p>
              <h2 className="mt-3 font-display text-3xl text-zinc-50">Overview</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-400">
              {institution?.currentTermLabel ?? 'Loading term'}
            </span>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-2">
            {institutionStats.map(({ label, value, Icon }) => (
              <div key={label} className="bg-black/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                  <Icon className="h-4 w-4 text-zinc-400" />
                </div>
                <p className="mt-4 font-display text-4xl text-zinc-50">{value}</p>
              </div>
            ))}
          </div>

          {status === 'loading' ? (
            <p className="mt-4 text-sm text-zinc-500">Loading...</p>
          ) : null}
        </article>

        <article className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Queue</p>
              <h2 className="mt-3 font-display text-3xl text-zinc-50">Actions</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10">
            {[
              ['Staff review', `${submissions.filter((item) => item.status === 'submitted').length} pending`],
              ['Published work', `${assignments.filter((item) => item.status === 'published').length} active`],
              ['Student access', 'Student view available'],
            ].map(([title, body]) => (
              <div key={title} className="bg-black/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{title}</p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/virtual-lab/grading"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-5 py-3 text-xs uppercase tracking-[0.18em] text-black"
            >
              Open Grading
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/virtual-lab/student"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-xs uppercase tracking-[0.18em] text-zinc-200"
            >
              Open Student View
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Courses</p>
              <h2 className="mt-3 font-display text-3xl text-zinc-50">Course list</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300">
              {institution?.currentTermLabel ?? 'Loading term'}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
            <div className="hidden grid-cols-[1.1fr_0.8fr_0.7fr_0.7fr_auto] gap-4 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.16em] text-zinc-500 lg:grid">
              <p>Course</p>
              <p>Instructor</p>
              <p>Students</p>
              <p>Queue</p>
              <p />
            </div>
            {courses.map((course) => {
              const courseAssignments = assignments.filter((assignment) => assignment.courseId === course.id);
              const courseBacklog = courseAssignments.reduce(
                (total, assignment) =>
                  total + submissions.filter((submission) => submission.assignmentId === assignment.id && submission.status === 'submitted').length,
                0,
              );
              const assignmentLabel = `${courseAssignments.length} assignment${courseAssignments.length === 1 ? '' : 's'}`;
              const gradingLabel = `${courseBacklog} to grade`;

              return (
              <div key={course.id} className="border-t border-white/10 bg-black/50 px-4 py-4 first:border-t-0">
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.8fr_0.7fr_0.7fr_auto] lg:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">{course.code}</p>
                    <h3 className="mt-2 text-base text-zinc-50">{course.title}</h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-500">{course.schedule}</p>
                  </div>
                  <div className="text-sm text-zinc-300">{course.instructorName}</div>
                  <div className="text-sm text-zinc-100">{course.studentCount}</div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-300">{assignmentLabel}</span>
                    <span className="text-amber-200">{gradingLabel}</span>
                  </div>
                  <Link
                    to={`/virtual-lab/course/${course.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Recent Activity</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">Assignments</h2>
          <div className="mt-6 space-y-3">
            {assignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Due {formatDueLabel(assignment.dueAt)}</p>
                    <h3 className="mt-2 text-base text-zinc-50">{assignment.title}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                    {assignment.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{assignment.prompt}</p>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <span>{assignment.submissionCount} submissions recorded</span>
                  <span>{courses.find((course) => course.id === assignment.courseId)?.code ?? 'Course'}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </VirtualLabShell>
  );
}
