import { useMemo } from 'react';
import { Download, ExternalLink, FileJson, FolderKanban, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useKarrasStore } from '@/store/useKarrasStore';

export default function Library() {
  const scenarios = useKarrasStore((state) => state.scenarios);

  const studies = useMemo(() => scenarios, [scenarios]);

  const vlShortcuts = [
    {
      id: 'vl-instructor',
      label: 'Virtual Lab Instructor',
      description: 'Assignment authoring and grading.',
      to: '/vl/login',
      external: true,
    },
    {
      id: 'vl-student',
      label: 'Virtual Lab Student',
      description: 'Coding assignments and submission.',
      to: '/vl/student',
      external: true,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[32px] border border-white/10 bg-black/60 p-7 lg:flex-row lg:items-start lg:justify-between lg:p-9">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-600">
            <FolderKanban className="h-4 w-4" />
            Library
          </div>
          <h1 className="mt-4 font-display text-4xl leading-[0.95] text-zinc-50 lg:text-5xl">
            Saved work and module surfaces
          </h1>
          <p className="mt-5 text-sm leading-7 text-zinc-500">
            Access saved studies from Infrastructure Systems or open the Virtual Lab operational surfaces.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="uppercase tracking-[0.18em] text-zinc-600">Saved studies</p>
            <p className="mt-2 font-display text-2xl text-zinc-100">{studies.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="uppercase tracking-[0.18em] text-zinc-600">Categories</p>
            <p className="mt-2 font-display text-2xl text-zinc-100">2</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <p className="uppercase tracking-[0.18em] text-zinc-600">Modules</p>
            <p className="mt-2 font-display text-2xl text-zinc-100">2</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-600">Infrastructure Systems</p>
              <h2 className="mt-2 font-display text-2xl text-zinc-100">Saved studies</h2>
            </div>
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-4 py-2 text-xs uppercase tracking-[0.18em] text-black"
            >
              <Plus className="h-4 w-4" />
              New study
            </Link>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/55">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3">
              <Search className="h-4 w-4 text-zinc-500" />
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {studies.length === 0 ? 'No studies saved yet.' : `${studies.length} studies.`}
              </span>
            </div>
            <div className="divide-y divide-white/8">
              {studies.length === 0 ? (
                <Link
                  to="/workspace"
                  className="block px-5 py-6 text-sm leading-7 text-zinc-400 transition hover:bg-white/[0.02]"
                >
                  Open Workspace to start a Bridge Feasibility study. Studies appear here once saved.
                </Link>
              ) : (
                studies.map((scenario) => (
                  <Link
                    key={scenario.id}
                    to="/workspace"
                    className="grid items-start gap-4 px-5 py-5 transition hover:bg-white/[0.02] lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          Bridge Feasibility
                        </span>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          {scenario.dataOrigin}
                        </span>
                      </div>
                      <p className="mt-3 font-display text-xl text-zinc-100">{scenario.name}</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {scenario.waterwayType} / {scenario.bridgeSystem} / {scenario.foundationStrategy}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <FileJson className="h-4 w-4 text-zinc-400" />
                      Saved scenario
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                      Open
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="px-2">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-600">Technical Learning Systems</p>
            <h2 className="mt-2 font-display text-2xl text-zinc-100">Virtual Lab access</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/8">
            {vlShortcuts.map((entry) => {
              const content = (
                <div className="flex items-start justify-between gap-4 bg-black/70 px-5 py-5 transition hover:bg-black/60">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-200">{entry.label}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">{entry.description}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] p-2">
                    <Download className="h-4 w-4 text-zinc-400" />
                  </div>
                </div>
              );
              return (
                <a key={entry.id} href={entry.to}>
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
