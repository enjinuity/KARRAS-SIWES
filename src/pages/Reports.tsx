import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Printer } from 'lucide-react';

import { rankScenarios } from '@/utils/analytics';
import { buildScenarioReport } from '@/utils/report';
import { useKarrasStore } from '@/store/useKarrasStore';

export default function Reports() {
  const { scenarios, resultsByScenarioId, selectedScenarioId, selectScenario, comparisonScenarioIds } = useKarrasStore();
  if (scenarios.length === 0) {
    return (
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Decision Reports</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.94] text-zinc-50">No reports yet.</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400">
            Launch a study from the workspace first. Reports become available after you create or open a simulation scenario.
          </p>
          <Link
            to="/workspace"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
          >
            Back to workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];
  const selectedResult = resultsByScenarioId[selectedScenario.id];
  const ranked = rankScenarios(scenarios, resultsByScenarioId);
  const comparisonScenarios = scenarios.filter((scenario) => comparisonScenarioIds.includes(scenario.id));
  const report = buildScenarioReport(selectedScenario, selectedResult);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Decision Reports</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.94] text-zinc-50">
          Turn saved scenarios into decision-ready review artifacts.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400">
          This page reframes the active workspace state into a review surface with explicit provenance, assumptions,
          and export-ready decision context.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Scenario Library</p>
            <h2 className="mt-2 font-display text-3xl text-zinc-50">Review Set</h2>
          </div>
          {scenarios.map((scenario) => {
            const result = resultsByScenarioId[scenario.id];
            const isSelected = scenario.id === selectedScenario.id;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => selectScenario(scenario.id)}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  isSelected
                    ? 'border-cyan-300/40 bg-cyan-300/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{result.confidenceLabel}</p>
                <h3 className="mt-2 font-display text-2xl text-zinc-50">{scenario.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {Math.round(result.feasibilityScore)}/100 feasibility · {Math.round(result.stabilityScore)}/100 stability
                </p>
              </button>
            );
          })}
        </aside>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(103,232,249,0.10),rgba(255,255,255,0.03))] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Primary Report</p>
                <h2 className="mt-2 font-display text-4xl text-zinc-50">{selectedScenario.name}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">{selectedResult.explanation}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-100">{selectedResult.decisionSignal}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {selectedScenario.siteContext} · {selectedScenario.dataOrigin.replace(/-/g, ' ')} · {selectedScenario.sourceConfidence.replace(/-/g, ' ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/workspace"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-100"
                >
                  Back to workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
                >
                  <Printer className="h-4 w-4" />
                  Print View
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                ['Feasibility', Math.round(selectedResult.feasibilityScore)],
                ['Stability', Math.round(selectedResult.stabilityScore)],
                ['Cost Band', Math.round(selectedResult.costScore)],
                ['Complexity', Math.round(selectedResult.complexityScore)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                  <p className="mt-3 font-display text-3xl text-zinc-50">{value}/100</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <article className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-cyan-200" />
                <h3 className="font-display text-3xl text-zinc-50">Report Narrative</h3>
              </div>
              <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-300">
                <p>
                  <span className="text-zinc-100">Decision framing.</span> {report.summary.title} is currently rated{' '}
                  {report.summary.status.toLowerCase()} within the concept-stage screening model, with explicit site
                  context, source provenance, and assumption tracking carried into the review.
                </p>
                <p>
                  <span className="text-zinc-100">Study basis.</span> {selectedResult.confidenceLabel}. {selectedResult.basisNote}
                </p>
                <p>
                  <span className="text-zinc-100">Action.</span> {selectedResult.decisionSignal}. Use the recommendations below as the next iteration path, then compare this option against at least one alternative with different source basis or user-imported data.
                </p>
              </div>
            </article>

            <article className="space-y-4 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Portfolio Ranking</p>
                <h3 className="mt-2 font-display text-3xl text-zinc-50">Current Leaders</h3>
              </div>
              {ranked.slice(0, 3).map((scenario, index) => (
                <div key={scenario.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Rank {index + 1}</p>
                  <h4 className="mt-2 font-display text-2xl text-zinc-50">{scenario.name}</h4>
                  <p className="mt-2 text-sm text-zinc-400">
                    {Math.round(resultsByScenarioId[scenario.id].feasibilityScore)}/100 feasibility ·{' '}
                    {Math.round(resultsByScenarioId[scenario.id].stabilityScore)}/100 stability · {scenario.navigationClearanceM}m clearance
                  </p>
                </div>
              ))}
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <article className="space-y-3 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
              <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Concept Checks</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {selectedResult.screeningChecks.map((check) => (
                  <div key={check.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-zinc-100">{check.label}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                          check.status === 'pass'
                            ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                            : check.status === 'watch'
                              ? 'border border-amber-300/20 bg-amber-300/10 text-amber-100'
                              : 'border border-rose-300/20 bg-rose-300/10 text-rose-100'
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-2xl text-zinc-50">{check.value}</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{check.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="space-y-3 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
              <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Assumptions</h3>
              {selectedScenario.studyAssumptions.map((assumption) => (
                <div key={assumption.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-zinc-100">{assumption.label}</p>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                      {assumption.value}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{assumption.basis}</p>
                </div>
              ))}
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <article className="space-y-3 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
              <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Source References</h3>
              {selectedScenario.sourceReferences.length > 0 ? (
                selectedScenario.sourceReferences.map((source) => (
                  <div key={source.id} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-zinc-100">{source.label}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      {source.owner} · {source.type.replace(/-/g, ' ')}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{source.note}</p>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-cyan-200">
                        {source.url}
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-400">
                  No explicit source references are attached to this study yet.
                </div>
              )}
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <article className="space-y-3 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
              <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Dominant Risks</h3>
              {selectedResult.dominantRisks.map((risk) => (
                <div key={risk} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300">
                  {risk}
                </div>
              ))}
            </article>

            <article className="space-y-3 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
              <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Recommended Moves</h3>
              {selectedResult.recommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="rounded-[22px] border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50"
                >
                  {recommendation}
                </div>
              ))}
            </article>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Imported Artifacts</p>
            <h3 className="mt-2 font-display text-3xl text-zinc-50">Study package traceability</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {selectedScenario.importedArtifacts.length > 0 ? (
                selectedScenario.importedArtifacts.map((artifact) => (
                  <div key={`${artifact.fileName}-${artifact.importedAt}`} className="rounded-[24px] border border-white/10 bg-zinc-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{artifact.format.toUpperCase()}</p>
                    <p className="mt-2 font-display text-2xl text-zinc-50">{artifact.fileName}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{artifact.note}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-zinc-950/60 p-4 text-sm leading-6 text-zinc-400">
                  No user-imported files are attached to this study. This is currently a preset or manually estimated workspace package.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Comparison Context</p>
            <h3 className="mt-2 font-display text-3xl text-zinc-50">Scenarios currently flagged for comparison</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {comparisonScenarios.map((scenario) => (
                <div key={scenario.id} className="rounded-[24px] border border-white/10 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{scenario.name}</p>
                  <p className="mt-3 text-sm text-zinc-300">
                    {Math.round(resultsByScenarioId[scenario.id].feasibilityScore)}/100 feasibility
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                    {resultsByScenarioId[scenario.id].confidenceLabel}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {scenario.dataOrigin.replace(/-/g, ' ')} · {scenario.sourceConfidence.replace(/-/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
