import type { ScenarioInput, SimulationResult } from '@/simulation/types';
import { describeScenarioDelta, getCompositeScore, rankScenarios } from '@/utils/analytics';
import { formatLabel, formatScore, formatStatus } from '@/utils/format';

type ComparisonBoardProps = {
  scenarios: ScenarioInput[];
  resultsByScenarioId: Record<string, SimulationResult>;
};

const colors = ['#67e8f9', '#fbbf24', '#fb7185'];

export function ComparisonBoard({ scenarios, resultsByScenarioId }: ComparisonBoardProps) {
  const metrics = [
    {
      label: 'Feasibility',
      values: scenarios.map((scenario) => ({ id: scenario.id, value: resultsByScenarioId[scenario.id].feasibilityScore })),
    },
    {
      label: 'Stability',
      values: scenarios.map((scenario) => ({ id: scenario.id, value: resultsByScenarioId[scenario.id].stabilityScore })),
    },
    {
      label: 'Cost Efficiency',
      values: scenarios.map((scenario) => ({ id: scenario.id, value: 100 - resultsByScenarioId[scenario.id].costScore })),
    },
    {
      label: 'Simplicity',
      values: scenarios.map((scenario) => ({ id: scenario.id, value: 100 - resultsByScenarioId[scenario.id].complexityScore })),
    },
  ];

  const ranked = rankScenarios(scenarios, resultsByScenarioId);
  const leadScenario = ranked[0];
  const leadResult = resultsByScenarioId[leadScenario.id];
  const evidenceMix = Array.from(new Set(scenarios.map((scenario) => scenario.dataOrigin)));
  const confidenceMix = Array.from(new Set(scenarios.map((scenario) => scenario.sourceConfidence)));
  const hasMixedBasis = evidenceMix.length > 1 || confidenceMix.length > 1;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Comparison Leader</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">{leadScenario.name}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Composite score {getCompositeScore(leadResult)} · {formatLabel(leadScenario.waterwayType)} crossing · {leadScenario.spanDistanceM}m span
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-cyan-100">{leadResult.confidenceLabel}</p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Feasibility Spread</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">
            {Math.round(Math.max(...scenarios.map((scenario) => resultsByScenarioId[scenario.id].feasibilityScore)))} /{' '}
            {Math.round(Math.min(...scenarios.map((scenario) => resultsByScenarioId[scenario.id].feasibilityScore)))}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Best versus weakest feasibility across the current set.</p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Evidence Mix</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">{evidenceMix.length}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {hasMixedBasis
              ? 'The board is mixing different study bases. Read provenance before trusting rank order.'
              : `All active studies share the same basis: ${formatLabel(evidenceMix[0])}.`}
          </p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Decision Count</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-50">{scenarios.length}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Active scenarios contributing to the current comparison board.</p>
        </article>
      </section>

      {hasMixedBasis ? (
        <section className="rounded-[28px] border border-amber-300/20 bg-amber-300/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-100">Comparison Caution</p>
          <h2 className="mt-2 font-display text-2xl text-zinc-50">The active set is not evidence-homogeneous.</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-300">
            Manual estimates, curated samples, and imported studies should not be treated as equally grounded options.
            Use the rank order as a screen of structural and hydraulic trade-offs, then judge each option against its study basis.
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[32px] border border-white/10 bg-zinc-950/70 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Comparative Matrix</p>
            <h2 className="mt-2 font-display text-3xl text-zinc-50">Trade-Off Shape</h2>
          </div>
          <div className="mt-6 space-y-5">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.18em] text-zinc-300">{metric.label}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Higher is better</p>
                </div>
                <div className="mt-4 space-y-3">
                  {metric.values.map((entry, index) => {
                    const scenario = scenarios.find((item) => item.id === entry.id);
                    if (!scenario) {
                      return null;
                    }

                    return (
                      <div key={entry.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-zinc-400">
                          <span>{scenario.name}</span>
                          <span>{Math.round(entry.value)}</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          {formatLabel(scenario.dataOrigin)} · {formatLabel(scenario.sourceConfidence)}
                        </p>
                        <div className="h-3 rounded-full bg-black/30">
                          <div
                            className="h-3 rounded-full transition-[width]"
                            style={{
                              width: `${Math.max(6, Math.min(entry.value, 100))}%`,
                              background: `linear-gradient(90deg, ${colors[index % colors.length]}, rgba(255,255,255,0.78))`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[32px] border border-white/10 bg-zinc-950/70 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Decision Ranking</p>
            <h2 className="mt-2 font-display text-3xl text-zinc-50">Leading Concepts</h2>
          </div>
          {ranked.map((scenario, index) => {
            const result = resultsByScenarioId[scenario.id];
            const deltas = describeScenarioDelta(leadResult, result);

            return (
              <article key={scenario.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Rank {index + 1}</p>
                    <h3 className="mt-2 font-display text-2xl text-zinc-50">{scenario.name}</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      {formatLabel(scenario.waterwayType)} · {scenario.spanDistanceM}m span · {scenario.supportCount} supports
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200">
                    {formatStatus(result.status)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                    {result.confidenceLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                    {formatLabel(scenario.dataOrigin)}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                    {formatLabel(scenario.sourceConfidence)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Feasibility</p>
                    <p className="mt-2 text-lg text-zinc-100">{formatScore(result.feasibilityScore)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Cost Band</p>
                    <p className="mt-2 text-lg text-zinc-100">{formatScore(result.costScore)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Composite Score</p>
                    <p className="mt-2 text-lg text-zinc-100">{getCompositeScore(result)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Delta Vs Leader</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-200">
                      {index === 0
                        ? 'Current leader'
                        : `F ${deltas.feasibilityDelta}, S ${deltas.stabilityDelta}, C ${deltas.costDelta}, X ${deltas.complexityDelta}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Study Context</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{scenario.siteContext}</p>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-300">{result.explanation}</p>
                <p className="mt-3 text-xs leading-6 text-zinc-500">{result.basisNote}</p>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
