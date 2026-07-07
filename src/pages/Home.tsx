import { ArrowRight, BookOpenText, FileText, LayoutGrid, MonitorSmartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const entryPoints = [
  {
    label: 'Workspace',
    description: 'Studies, modules, and saved work.',
    to: '/workspace',
    Icon: LayoutGrid,
  },
  {
    label: 'Virtual Lab',
    description: 'Courses, assignments, grading, and student access.',
    to: '/virtual-lab',
    Icon: MonitorSmartphone,
  },
  {
    label: 'Reports',
    description: 'Exports and generated output.',
    to: '/reports',
    Icon: FileText,
  },
  {
    label: 'Methodology',
    description: 'References and model notes.',
    to: '/methodology',
    Icon: BookOpenText,
  },
];

export default function Home() {
  return (
    <div className="space-y-5">
      <section className="rounded-[36px] border border-white/10 bg-black/60 p-8 lg:p-10">
        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.03]">
              <span className="font-display text-5xl text-white">K</span>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.28em] text-zinc-600">KARRAS</p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.94] text-zinc-50 lg:text-7xl">KARRAS</h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-5 py-3 text-xs uppercase tracking-[0.18em] text-black"
              >
                Open Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/virtual-lab"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-xs uppercase tracking-[0.18em] text-zinc-200"
              >
                Open Virtual Lab
              </Link>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10">
            {entryPoints.map(({ label, description, to, Icon }) => (
              <Link
                key={label}
                to={to}
                className="grid gap-4 bg-black/80 p-5 transition hover:bg-black/65 lg:grid-cols-[auto_1fr_auto] lg:items-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                  <Icon className="h-4 w-4 text-zinc-200" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-zinc-300">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
