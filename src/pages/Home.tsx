import { ArrowRight, BookOpenText, FileText, FolderKanban, GraduationCap, Layers, MonitorPlay } from 'lucide-react';
import { Link } from 'react-router-dom';

const systemTiles = [
  {
    id: 'infrastructure',
    label: 'Infrastructure Systems',
    summary: 'Simulation and decision-support modules for physical systems planning.',
    Icon: Layers,
    accent: 'from-cyan-500/15 via-transparent to-transparent',
    module: 'Bridge Feasibility',
    buttonLabel: 'Open Systems index',
    buttonTo: '/systems',
  },
  {
    id: 'technical-learning',
    label: 'Technical Learning Systems',
    summary: 'Operational platforms for coding education delivery, lab access, and grading.',
    Icon: GraduationCap,
    accent: 'from-fuchsia-500/15 via-transparent to-transparent',
    module: 'Virtual Lab',
    buttonLabel: 'Open Virtual Lab',
    buttonTo: '/vl/',
    external: true,
  },
];

const productTiles = [
  { label: 'Systems', to: '/systems', description: 'Category and module index.', Icon: Layers },
  { label: 'Library', to: '/library', description: 'Saved studies and module shortcuts.', Icon: FolderKanban },
  { label: 'Reports', to: '/reports', description: 'Generated exports and study output.', Icon: FileText },
  { label: 'Methodology', to: '/methodology', description: 'Model notes and references.', Icon: BookOpenText },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-black/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />
        <div className="relative grid gap-12 p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:p-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-zinc-600">
              <span className="h-[1px] w-10 bg-white/15" />
              KARRAS
              <span className="h-[1px] w-10 bg-white/15" />
            </div>
            <h1 className="mt-7 font-display text-5xl leading-[0.92] text-zinc-50 lg:text-7xl">
              Modular systems platform.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-500">
              KARRAS hosts simulation modules for physical-system screening and operational modules for
              technical delivery workflows. Open a category or launch a module directly.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/systems"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-5 py-3 text-xs uppercase tracking-[0.18em] text-black"
              >
                Browse Systems
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/vl/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-xs uppercase tracking-[0.18em] text-zinc-200"
              >
                Open Virtual Lab
              </Link>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-5 py-3 text-xs uppercase tracking-[0.18em] text-zinc-400"
              >
                Library
              </Link>
            </div>
          </div>

          <div className="grid gap-px self-start overflow-hidden rounded-[28px] border border-white/10 bg-white/8">
            {productTiles.map(({ label, to, description, Icon }) => (
              <Link
                key={label}
                to={to}
                className="grid items-center gap-4 bg-black/80 p-5 transition hover:bg-black/65 lg:grid-cols-[auto_1fr_auto]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                  <Icon className="h-4 w-4 text-zinc-200" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-200">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {systemTiles.map((tile) => {
          const TileIcon = tile.Icon;
          const content = (
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/55 h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.accent} pointer-events-none`} />
              <div className="relative flex h-full flex-col gap-6 p-7 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/60">
                    <TileIcon className="h-5 w-5 text-zinc-100" />
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {tile.module}
                  </div>
                </div>
                <div className="max-w-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Category</p>
                  <h2 className="mt-3 font-display text-3xl leading-[0.98] text-zinc-50">{tile.label}</h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-500">{tile.summary}</p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/8 pt-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    <MonitorPlay className="h-4 w-4 text-zinc-400" />
                    1 module
                  </div>
                  <div
                    className={
                      'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs uppercase tracking-[0.18em] ' +
                      (tile.id === 'infrastructure'
                        ? 'border border-white/12 bg-white text-black'
                        : 'border border-white/10 bg-white/[0.03] text-zinc-200')
                    }
                  >
                    {tile.buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          );
          if (tile.external) return <a key={tile.id} href={tile.buttonTo}>{content}</a>;
          return <Link key={tile.id} to={tile.buttonTo}>{content}</Link>;
        })}
      </section>
    </div>
  );
}
