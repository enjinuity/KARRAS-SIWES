import { Copy, Download, Plus, Send, Split, Trash2 } from 'lucide-react';

import type { ScenarioInput, SimulationResult } from '@/simulation/types';
import { formatLabel, formatScore, formatStatus } from '@/utils/format';
import { cn } from '@/lib/utils';

type ScenarioTrayProps = {
  scenarios: ScenarioInput[];
  resultsByScenarioId: Record<string, SimulationResult>;
  selectedScenarioId: string;
  comparisonScenarioIds: string[];
  onSelect: (scenarioId: string) => void;
  onDuplicate: (scenarioId: string) => void;
  onDelete: (scenarioId: string) => void;
  onToggleCompare: (scenarioId: string) => void;
  onCreateVariant: () => void;
  onExport: (scenarioId: string) => void;
  onShare: (scenarioId: string) => void;
};

export function ScenarioTray({
  scenarios,
  resultsByScenarioId,
  selectedScenarioId,
  comparisonScenarioIds,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleCompare,
  onCreateVariant,
  onExport,
  onShare,
}: ScenarioTrayProps) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-zinc-950/65 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.32)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Scenario Tray</p>
          <h2 className="mt-2 font-display text-2xl text-zinc-50">Save, Fork, And Compare Crossings</h2>
        </div>
        <button
          type="button"
          onClick={onCreateVariant}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20"
        >
          <Plus className="h-4 w-4" />
          New Variant
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {scenarios.map((scenario) => {
          const result = resultsByScenarioId[scenario.id];
          const isActive = scenario.id === selectedScenarioId;
          const inComparison = comparisonScenarioIds.includes(scenario.id);

          return (
            <article
              key={scenario.id}
              className={cn(
                'rounded-[28px] border p-4 transition',
                isActive
                  ? 'border-cyan-300/40 bg-cyan-300/10 shadow-[0_18px_48px_rgba(34,211,238,0.12)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20',
              )}
            >
              <button type="button" onClick={() => onSelect(scenario.id)} className="w-full text-left">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-xl text-zinc-50">{scenario.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {formatLabel(scenario.waterwayType)} · {scenario.spanDistanceM}m span · {scenario.navigationClearanceM}m clearance
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-zinc-300">
                    {formatStatus(result.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Feasibility</p>
                    <p className="mt-1 text-sm text-zinc-100">{formatScore(result.feasibilityScore)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Cost</p>
                    <p className="mt-1 text-sm text-zinc-100">{formatScore(result.costScore)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Supports</p>
                    <p className="mt-1 text-sm text-zinc-100">{scenario.supportCount}</p>
                  </div>
                </div>
              </button>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleCompare(scenario.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] transition',
                    inComparison
                      ? 'border-amber-300/30 bg-amber-400/10 text-amber-100'
                      : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:text-zinc-100',
                  )}
                >
                  <Split className="h-4 w-4" />
                  Compare
                </button>
                <button
                  type="button"
                  onClick={() => onExport(scenario.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-400 transition hover:text-zinc-100"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => onShare(scenario.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/40"
                >
                  <Send className="h-4 w-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(scenario.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-400 transition hover:text-zinc-100"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(scenario.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-rose-100 transition hover:border-rose-300/40"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
