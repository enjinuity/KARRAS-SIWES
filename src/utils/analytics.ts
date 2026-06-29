import type { ScenarioInput, SimulationResult } from '@/simulation/types';

export function getCompositeScore(result: SimulationResult) {
  return Math.round(
    result.feasibilityScore * 0.38 +
      result.stabilityScore * 0.32 +
      (100 - result.costScore) * 0.16 +
      (100 - result.complexityScore) * 0.14,
  );
}

export function rankScenarios(
  scenarios: ScenarioInput[],
  resultsByScenarioId: Record<string, SimulationResult>,
) {
  return [...scenarios].sort(
    (left, right) => getCompositeScore(resultsByScenarioId[right.id]) - getCompositeScore(resultsByScenarioId[left.id]),
  );
}

export function describeScenarioDelta(base: SimulationResult, comparison: SimulationResult) {
  const feasibilityDelta = Math.round(comparison.feasibilityScore - base.feasibilityScore);
  const stabilityDelta = Math.round(comparison.stabilityScore - base.stabilityScore);
  const costDelta = Math.round(comparison.costScore - base.costScore);
  const complexityDelta = Math.round(comparison.complexityScore - base.complexityScore);

  return {
    feasibilityDelta,
    stabilityDelta,
    costDelta,
    complexityDelta,
  };
}
