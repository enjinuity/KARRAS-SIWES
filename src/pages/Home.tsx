import { motion } from 'framer-motion';
import { ArrowRight, Binary, GitCompareArrows, Radar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="grid gap-8 rounded-[36px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.24)] xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Simulation-Based Decision Support</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.92] text-zinc-50 xl:text-7xl">
            Understand what changes, what breaks, and what becomes feasible before expensive planning begins.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400">
            KARRAS is a modular simulation platform for real-world decision modeling. Start with infrastructure
            feasibility, move into a dedicated workspace, and test how constraints ripple across stability, cost,
            complexity, and risk in real time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100"
            >
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.18em] text-zinc-200"
            >
              Read Methodology
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {[
            {
              title: 'Separate workspace',
              description:
                'The simulator now belongs on its own route so the desktop experience can breathe and expand properly.',
              Icon: Binary,
            },
            {
              title: 'Visual cause and effect',
              description:
                'Live corridor response, clearance adjustment, support movement, and outcome changes are tied together.',
              Icon: Radar,
            },
            {
              title: 'Scenario comparison',
              description:
                'Save options, compare trade-offs, export reports, and sync authenticated work to the backend.',
              Icon: GitCompareArrows,
            },
          ].map(({ title, description, Icon }) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-[28px] border border-white/10 bg-zinc-950/60 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Platform Value</p>
                <Icon className="h-4 w-4 text-cyan-200" />
              </div>
              <h2 className="mt-3 font-display text-2xl text-zinc-50">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
