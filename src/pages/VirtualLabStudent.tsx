import { CheckCircle2, Clock3, Smartphone, UploadCloud } from 'lucide-react';

import { VirtualLabShell } from '@/components/virtual-lab/VirtualLabShell';
import {
  getAssignmentsForCourse,
  sampleStudentCode,
  virtualLabStudentProfile,
  virtualLabCourses,
} from '@/virtual-lab/mockData';

const enrolledCourses = virtualLabCourses.filter((course) => virtualLabStudentProfile.enrolledCourseIds.includes(course.id));
const currentCourse = enrolledCourses[0];
const currentAssignment = getAssignmentsForCourse(currentCourse.id)[0];

export default function VirtualLabStudent() {
  return (
    <VirtualLabShell>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Student Access</p>
          <h2 className="mt-3 font-display text-4xl text-zinc-50">{virtualLabStudentProfile.name}</h2>
          <p className="mt-2 text-sm uppercase tracking-[0.16em] text-cyan-100/80">
            {virtualLabStudentProfile.matricNumber} . {virtualLabStudentProfile.institutionShortName}
          </p>
          <p className="mt-5 text-sm leading-7 text-zinc-300">
            The student side is intentionally mobile-first. The hardest constraint is phone access, so the layout keeps
            prompts, status, and submission controls touch-friendly without blocking laptop use.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-cyan-200" />
                <p className="text-sm text-zinc-200">Phone-ready assignment access and submission</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-amber-200" />
                <p className="text-sm text-zinc-200">Deadlines and submission state remain visible at every step</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                <p className="text-sm text-zinc-200">Grades and feedback return through the same student surface</p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{currentCourse.code}</p>
              <h2 className="mt-3 font-display text-3xl text-zinc-50">{currentAssignment.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{currentAssignment.prompt}</p>
            </div>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-amber-100">
              {currentAssignment.dueLabel}
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Assignment Feed</p>
              <div className="mt-4 space-y-3">
                {enrolledCourses.map((course) =>
                  getAssignmentsForCourse(course.id).map((assignment) => (
                    <div key={assignment.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">{course.code}</p>
                      <h3 className="mt-2 text-sm text-zinc-100">{assignment.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">{assignment.dueLabel}</p>
                    </div>
                  )),
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Coding Workspace</p>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100">
                  Draft Saved
                </span>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-[22px] border border-white/10 bg-[#02040d] p-4 text-xs leading-6 text-cyan-100">
                <code>{sampleStudentCode}</code>
              </pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100"
                >
                  <UploadCloud className="h-4 w-4" />
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>
    </VirtualLabShell>
  );
}
