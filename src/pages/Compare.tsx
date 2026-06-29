import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { ComparisonBoard } from '@/components/comparison/ComparisonBoard';
import { useKarrasStore } from '@/store/useKarrasStore';

export default function Compare() {
  const { scenarios, resultsByScenarioId, comparisonScenarioIds } = useKarrasStore();
  if (scenarios.length === 0) {
    return (
      <div className="space-y-6">
        <section className="rounded-[32px] border border-dashed border-white/10 bg-zinc-950/60 p-8">
          <h2 className="font-display text-3xl text-zinc-50">No studies available yet.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Start from the workspace launcher, build a study from a preset, and then return here once you have options worth comparing.
          </p>
          <Link
            to="/workspace"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20"
          >
            Return to workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  const comparisonScenarios = scenarios.filter((scenario) => comparisonScenarioIds.includes(scenario.id));

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Scenario Comparison</p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] text-zinc-50">Read the trade-offs, not just the scores.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400">
          Compare saved concepts across feasibility, stability, cost, and simplicity, but keep the study basis in view.
          Use the tray in the workspace to mark options for comparison, then return here to see which direction deserves
          the next iteration and which options still lack credible source grounding.
        </p>
      </section>

      {comparisonScenarios.length >= 1 ? (
        <ComparisonBoard scenarios={comparisonScenarios} resultsByScenarioId={resultsByScenarioId} />
      ) : (
        <section className="rounded-[32px] border border-dashed border-white/10 bg-zinc-950/60 p-8">
          <h2 className="font-display text-3xl text-zinc-50">No comparison set selected yet.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Go back to the workspace, save a few variants, and toggle them into the comparison set. The board becomes
            much more useful once at least two options are active.
          </p>
          <Link
            to="/workspace"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20"
          >
            Return to workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
