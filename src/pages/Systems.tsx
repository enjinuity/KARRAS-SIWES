import { BookOpenCheck, GraduationCap, Layers, MonitorPlay, NotebookPen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

type ModuleEntry = {
  id: string;
  label: string;
  descriptor: string;
  moduleType: 'Simulation' | 'Operational';
  summary: string;
  actions: Array<{ label: string; to: string; primary?: boolean; external?: boolean }>;
};

type CategoryEntry = {
  id: string;
  label: string;
  tagline: string;
  icon: typeof Layers;
  accent: string;
  modules: ModuleEntry[];
};

const categories: CategoryEntry[] = [
  {
    id: 'infrastructure',
    label: 'Infrastructure Systems',
    tagline: 'Simulation and decision support for physical systems planning.',
    icon: Layers,
    accent: 'from-cyan-500/10 via-white/0 to-white/0',
    modules: [
      {
        id: 'bridge-feasibility',
        label: 'Bridge Feasibility',
        descriptor: 'Concept-stage screening for waterway crossing geometry, hydraulics, foundations, and cost envelope.',
        moduleType: 'Simulation',
        summary: 'Scenario-based study environment with constraint controls, screening checks, and cross-case comparison.',
        actions: [
          { label: 'Open Study Workspace', to: '/workspace', primary: true },
          { label: 'Browse Presets', to: '/workspace' },
          { label: 'Compare Studies', to: '/compare' },
        ],
      },
    ],
  },
  {
    id: 'technical-learning',
    label: 'Technical Learning Systems',
    tagline: 'Operational platforms for coding education delivery, grading, and lab access.',
    icon: GraduationCap,
    accent: 'from-fuchsia-500/10 via-white/0 to-white/0',
    modules: [
      {
        id: 'virtual-lab',
        label: 'Virtual Lab',
        descriptor: 'Mobile-first coding environment for assignments, submission workflow, and grading in low-infrastructure settings.',
        moduleType: 'Operational',
        summary: 'Supabase-backed platform with instructor dashboards, student assignment workspace, and code execution with auto-check.',
        actions: [
          { label: 'Open Virtual Lab', to: '/vl/', primary: true, external: true },
          { label: 'Instructor Login', to: '/vl/login', external: true },
          { label: 'Student Dashboard', to: '/vl/student', external: true },
        ],
      },
    ],
  },
];

export default function Systems() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[32px] border border-white/10 bg-black/60 p-7 lg:p-9">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-600">
              <Layers className="h-4 w-4" />
              Systems
            </div>
            <h1 className="mt-4 font-display text-4xl leading-[0.95] text-zinc-50 lg:text-5xl">
              Category index
            </h1>
            <p className="mt-5 text-sm leading-7 text-zinc-500">
              Launch a simulation study or open an operational module. Saved work is accessible from Library and Reports.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <p className="uppercase tracking-[0.18em] text-zinc-600">Categories</p>
              <p className="mt-2 font-display text-2xl text-zinc-100">{categories.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <p className="uppercase tracking-[0.18em] text-zinc-600">Modules</p>
              <p className="mt-2 font-display text-2xl text-zinc-100">
                {categories.reduce((acc, c) => acc + c.modules.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const CategoryIcon = category.icon;
        return (
          <section
            key={category.id}
            className="overflow-hidden rounded-[32px] border border-white/10 bg-black/55"
          >
            <div
              className={`relative flex flex-col gap-4 border-b border-white/8 p-7 lg:flex-row lg:items-start lg:justify-between lg:p-8`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.accent} pointer-events-none`}
              />
              <div className="relative flex flex-col gap-4 lg:max-w-2xl lg:flex-row lg:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/50">
                  <CategoryIcon className="h-5 w-5 text-zinc-100" />
                </div>
                <div>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
                    <span>Category</span>
                    <span className="h-[1px] w-8 bg-white/10" />
                    <span>{category.modules.length} module</span>
                  </div>
                  <h2 className="mt-3 font-display text-3xl leading-[0.96] text-zinc-50">{category.label}</h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-500">{category.tagline}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/8">
              {category.modules.map((moduleEntry) => (
                <article
                  key={moduleEntry.id}
                  className="grid gap-6 bg-black/70 p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start lg:p-8"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {moduleEntry.moduleType}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {category.label}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl text-zinc-50">{moduleEntry.label}</h3>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">{moduleEntry.descriptor}</p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-600">
                      <BookOpenCheck className="h-4 w-4" />
                      Module footprint
                    </div>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">{moduleEntry.summary}</p>
                    <div className="mt-5 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-xl border border-white/8 bg-black/30 px-3 py-2 text-zinc-500">
                        <MonitorPlay className="mb-1 h-4 w-4 text-zinc-300" />
                        {moduleEntry.moduleType === 'Simulation' ? 'Study canvas' : 'Operational dashboard'}
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/30 px-3 py-2 text-zinc-500">
                        <NotebookPen className="mb-1 h-4 w-4 text-zinc-300" />
                        {moduleEntry.moduleType === 'Simulation' ? 'Scenario outputs' : 'Assignment outputs'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-2">
                    {moduleEntry.actions.map((action) => {
                      const content = (
                        <span className="inline-flex items-center justify-center gap-2">
                          {action.primary && <Plus className="h-4 w-4" />}
                          {action.label}
                        </span>
                      );
                      const className =
                        'inline-flex items-center justify-center rounded-full px-4 py-3 text-xs uppercase tracking-[0.16em] transition ' +
                        (action.primary
                          ? 'border border-white/12 bg-white text-black hover:bg-zinc-200'
                          : 'border border-white/10 bg-white/[0.03] text-zinc-200 hover:text-zinc-100');
                      if (action.external) {
                        return (
                          <a key={action.label} href={action.to} className={className}>
                            {content}
                          </a>
                        );
                      }
                      return (
                        <Link key={action.label} to={action.to} className={className}>
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
