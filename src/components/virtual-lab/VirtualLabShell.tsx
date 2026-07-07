import type { PropsWithChildren } from 'react';
import { BookMarked, Building2, FileSpreadsheet, GraduationCap, LayoutDashboard } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { virtualLabInstitution } from '@/virtual-lab/mockData';

const labNavigation = [
  { to: '/virtual-lab', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/virtual-lab/course/csc-201', label: 'Course', icon: BookMarked },
  { to: '/virtual-lab/student', label: 'Student', icon: GraduationCap },
  { to: '/virtual-lab/grading', label: 'Grading', icon: FileSpreadsheet },
];

export function VirtualLabShell({ children }: PropsWithChildren) {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_120px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Operational Module</p>
            <h1 className="mt-4 font-display text-4xl leading-[0.95] text-zinc-50 xl:text-6xl">KARRAS Virtual Lab</h1>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              A mobile-first practical coding delivery system for institutions that need assignments, submission
              handling, grading, and academic export without relying on a working physical computer lab.
            </p>
          </div>

          <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm text-cyan-50 lg:max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-black/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Institution Workspace</p>
                <p className="mt-1 font-medium">{virtualLabInstitution.name}</p>
              </div>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-cyan-100/70">
              {virtualLabInstitution.currentTerm}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200"
          >
            Back To Modules
          </Link>
          {labNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition',
                  isActive
                    ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-zinc-100',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </section>

      {children}
    </div>
  );
}
