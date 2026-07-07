import { motion } from 'framer-motion';
import { ArrowRight, Binary, Building2, GitCompareArrows, GraduationCap, Radar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const modules = [
    {
      title: 'Bridge Feasibility',
      type: 'Simulation / Decision-Support',
      description:
        'Concept-stage bridge corridor screening with planner controls, concept checks, provenance-aware reporting, and comparison.',
      to: '/workspace',
      cta: 'Open Bridge Module',
      Icon: Binary,
    },
    {
      title: 'Virtual Lab',
      type: 'Operational / Workflow',
      description:
        'A mobile-first coding delivery system for institutions that need assignment, submission, grading, and export workflows without a functioning computer lab.',
      to: '/virtual-lab',
      cta: 'Open Virtual Lab',
      Icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-8 rounded-[36px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.24)] xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Modular Technical Platform</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.92] text-zinc-50 xl:text-7xl">
            One platform for simulation tools and operational systems that solve real technical constraints.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400">
            KARRAS now carries two clear module classes: simulation and decision-support products like Bridge
            Feasibility, and operational workflow products like Virtual Lab for low-infrastructure practical coding
            delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100"
            >
              Open Bridge Module
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/virtual-lab"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.18em] text-zinc-200"
            >
              Open Virtual Lab
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
              title: 'Multi-module framing',
              description:
                'KARRAS no longer reads like a single-purpose simulator. It now accommodates both simulation and workflow tools.',
              Icon: Building2,
            },
            {
              title: 'Credible bridge analysis',
              description:
                'The bridge module remains the simulation backbone with concept checks, study basis, and comparison.',
              Icon: Radar,
            },
            {
              title: 'Operational virtual lab',
              description:
                'The virtual lab module adds institution workflows for coding assignments, grading, and exports.',
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

      <section className="grid gap-6 xl:grid-cols-2">
        {modules.map(({ title, type, description, to, cta, Icon }) => (
          <article key={title} className="rounded-[32px] border border-white/10 bg-zinc-950/70 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{type}</p>
                <h2 className="mt-3 font-display text-4xl text-zinc-50">{title}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10">
                <Icon className="h-5 w-5 text-cyan-100" />
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-zinc-400">{description}</p>
            <div className="mt-6">
              <Link
                to={to}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.18em] text-zinc-100"
              >
                {cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
