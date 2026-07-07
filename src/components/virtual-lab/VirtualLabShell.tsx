import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { BookMarked, Building2, FileSpreadsheet, GraduationCap, LayoutDashboard } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useVirtualLabStore } from '@/store/useVirtualLabStore';

const labNavigation = [
  { to: '/virtual-lab', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/virtual-lab/course/csc-201', label: 'Course', icon: BookMarked },
  { to: '/virtual-lab/student', label: 'Student', icon: GraduationCap },
  { to: '/virtual-lab/grading', label: 'Grading', icon: FileSpreadsheet },
];

export function VirtualLabShell({ children }: PropsWithChildren) {
  const institution = useVirtualLabStore((state) => state.institution);
  const status = useVirtualLabStore((state) => state.status);
  const error = useVirtualLabStore((state) => state.error);
  const ensureLoaded = useVirtualLabStore((state) => state.ensureLoaded);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-black/65 p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03]">
                <Building2 className="h-4 w-4 text-zinc-200" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-600">Virtual Lab</p>
                <h1 className="mt-1 font-display text-3xl text-zinc-50">
                  {institution?.shortName ?? 'Institution'}
                </h1>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-zinc-500">
              <span>{institution?.name ?? 'Institution'}</span>
              <span>{institution?.currentTermLabel ?? 'Loading term'}</span>
              <span>{status === 'loading' ? 'Loading' : 'Ready'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300"
            >
              Workspace
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/8 pt-5">
          {labNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/virtual-lab'}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition',
                  isActive
                    ? 'border-white/14 bg-white/10 text-zinc-100'
                    : 'border-white/10 bg-white/[0.02] text-zinc-500 hover:text-zinc-100',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </section>

      {status === 'error' ? (
        <section className="rounded-[24px] border border-rose-300/20 bg-rose-300/10 p-5 text-sm text-rose-100">
          {error ?? 'Virtual Lab data could not be loaded.'}
        </section>
      ) : null}

      {status !== 'ready' && !error ? (
        <section className="rounded-[28px] border border-white/10 bg-black/60 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Loading</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">Virtual Lab</h2>
        </section>
      ) : (
        children
      )}
    </div>
  );
}
