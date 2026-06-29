import { AlertTriangle, BadgeCheck, CircleDollarSign, MoveRight, Wrench } from 'lucide-react';

import type { ScreeningCheckStatus, SimulationResult } from '@/simulation/types';
import { formatScore, formatStatus } from '@/utils/format';

type DecisionPanelProps = {
  result: SimulationResult;
};

const statusTone = {
  viable: 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100',
  borderline: 'border-amber-300/40 bg-amber-300/10 text-amber-100',
  'high-risk': 'border-orange-300/40 bg-orange-300/10 text-orange-100',
  failed: 'border-rose-300/40 bg-rose-300/10 text-rose-100',
};

const screeningTone: Record<ScreeningCheckStatus, string> = {
  pass: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
  watch: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  fail: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
};

const metricCards = (result: SimulationResult) => [
  {
    label: 'Feasibility',
    value: formatScore(result.feasibilityScore),
    icon: BadgeCheck,
  },
  {
    label: 'Stability',
    value: formatScore(result.stabilityScore),
    icon: Wrench,
  },
  {
    label: 'Cost Band',
    value: formatScore(result.costScore),
    icon: CircleDollarSign,
  },
  {
    label: 'Complexity',
    value: formatScore(result.complexityScore),
    icon: AlertTriangle,
  },
];

export function DecisionPanel({ result }: DecisionPanelProps) {
  return (
    <section className="space-y-5 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.32)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Decision Panel</p>
          <h2 className="mt-2 font-display text-2xl text-zinc-50">Outcome Readout</h2>
        </div>
        <div className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${statusTone[result.status]}`}>
          {formatStatus(result.status)}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {metricCards(result).map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</span>
              <Icon className="h-4 w-4 text-cyan-200" />
            </div>
            <p className="mt-4 font-display text-3xl text-zinc-50">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(103,232,249,0.10),rgba(255,255,255,0.03))] p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Model Reading</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-zinc-50">{result.decisionSignal}</h3>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-100">{result.confidenceLabel}</p>
          </div>
          <MoveRight className="h-5 w-5 text-cyan-200" />
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{result.explanation}</p>
        <p className="mt-3 text-xs leading-6 text-zinc-500">{result.basisNote}</p>
      </div>

      <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Concept Checks</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {result.screeningChecks.map((check) => (
            <div key={check.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{check.label}</p>
                  <p className="mt-2 font-display text-2xl text-zinc-50">{check.value}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${screeningTone[check.status]}`}>
                  {check.status}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500">{check.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Dominant Risks</h3>
        {result.dominantRisks.map((risk) => (
          <div key={risk} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300">
            {risk}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Recommended Moves</h3>
        {result.recommendations.map((recommendation) => (
          <div
            key={recommendation}
            className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50"
          >
            {recommendation}
          </div>
        ))}
      </div>
    </section>
  );
}
