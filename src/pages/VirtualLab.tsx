import { ArrowRight, BookCheck, Building2, Files, GraduationCap, LibraryBig } from 'lucide-react';
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
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Platform Framing</p>
          <h2 className="mt-4 font-display text-4xl text-zinc-50">Operational infrastructure for practical coding education.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            This module is not a simulation. It is the operational side of KARRAS: a structured institutional workflow
            for assignment delivery, student coding access, grading, and result export when physical lab capacity is weak
            or missing.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {institutionStats.map(({ label, value, Icon }) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                  <Icon className="h-4 w-4 text-cyan-200" />
                </div>
                <p className="mt-4 font-display text-4xl text-zinc-50">{value}</p>
              </div>
            ))}
          </div>

          {status === 'loading' ? (
            <p className="mt-4 text-sm text-zinc-500">Loading institution activity from the API...</p>
          ) : null}
        </article>

        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Why It Matters</p>
          <h2 className="mt-4 font-display text-4xl text-zinc-50">Institutions can run practicals without waiting for a lab upgrade.</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-300">
            <p>Students work from phones or laptops through the same assignment system.</p>
            <p>Staff publish tasks, review submissions, grade work, and export results by course or term.</p>
            <p>Each institution gets a branded workspace instead of a generic consumer learning app.</p>
          </div>
          <Link
            to="/virtual-lab/grading"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100"
          >
            Open Grading Console
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Active Courses</p>
              <h2 className="mt-3 font-display text-3xl text-zinc-50">Institution workspaces by course.</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300">
              {institution?.currentTermLabel ?? 'Loading term'}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {courses.map((course) => {
              const courseAssignments = assignments.filter((assignment) => assignment.courseId === course.id);
              const courseBacklog = courseAssignments.reduce(
                (total, assignment) =>
                  total + submissions.filter((submission) => submission.assignmentId === assignment.id && submission.status === 'submitted').length,
                0,
              );

              return (
              <div key={course.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">{course.code}</p>
                    <h3 className="mt-2 font-display text-2xl text-zinc-50">{course.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {course.instructorName} . {course.schedule}
                    </p>
                  </div>
                  <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Students</p>
                      <p className="mt-2 text-lg text-zinc-50">{course.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Assignments</p>
                      <p className="mt-2 text-lg text-zinc-50">{courseAssignments.length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">To Grade</p>
                      <p className="mt-2 text-lg text-amber-200">{courseBacklog}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/virtual-lab/course/${course.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200"
                  >
                    Open Course Workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Current Delivery State</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">Assignments moving through one operational loop.</h2>
          <div className="mt-6 space-y-4">
            {assignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Due {formatDueLabel(assignment.dueAt)}</p>
                    <h3 className="mt-2 text-lg text-zinc-50">{assignment.title}</h3>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                    {assignment.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{assignment.prompt}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  {assignment.submissionCount} submissions recorded
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-4">
            <div className="flex items-center gap-3">
              <BookCheck className="h-5 w-5 text-emerald-100" />
              <p className="text-sm text-emerald-50">
                The module now reads from persisted Virtual Lab data instead of static page-only mock cards.
              </p>
            </div>
          </div>
        </article>
      </section>
    </VirtualLabShell>
  );
}
