import { describe, expect, it } from 'vitest';

import { createScenario } from '@/simulation/defaultScenario';
import { simulateScenario } from '@/simulation/engine';
import type { ScenarioInput } from '@/simulation/types';

const viableScenario: ScenarioInput = {
  ...createScenario('Balanced River Crossing'),
  id: 'viable',
  spanDistanceM: 160,
  waterwayType: 'river',
  channelWidthM: 105,
  waterDepthM: 14,
  navigationClearanceM: 24,
  currentVelocity: 2.1,
  vesselTraffic: 4,
  bankStability: 8,
  scourRisk: 4,
  floodExposure: 5,
  loadLevel: 4,
  supportCount: 3,
  supportSpacingBias: 5,
  materialClass: 'composite',
  bridgeSystem: 'box',
  foundationStrategy: 'deep-pile',
  alignmentStrategy: 'direct',
  windExposure: 3,
  seismicDemand: 2,
  liveLoadPosition: 50,
  safetyPreference: 8,
};

describe('simulateScenario', () => {
  it('returns a viable outcome for a balanced concept', () => {
    const result = simulateScenario(viableScenario);

    expect(result.status).toBe('viable');
    expect(result.feasibilityScore).toBeGreaterThan(70);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.decisionSignal).toMatch(/advance/i);
    expect(result.screeningChecks).toHaveLength(6);
    expect(result.screeningChecks.some((check) => check.id === 'clearance-margin' && /m$/.test(check.value))).toBe(true);
  });

  it('flags hydraulically demanding crossings as risky or failed', () => {
    const result = simulateScenario({
      ...viableScenario,
      id: 'tidal-risk',
      waterwayType: 'tidal-inlet',
      spanDistanceM: 310,
      channelWidthM: 250,
      waterDepthM: 28,
      navigationClearanceM: 18,
      currentVelocity: 4.4,
      vesselTraffic: 8,
      bankStability: 3,
      scourRisk: 9,
      floodExposure: 9,
      loadLevel: 8,
      supportCount: 1,
      supportSpacingBias: 9,
      materialClass: 'reinforced-concrete',
      bridgeSystem: 'girder',
      foundationStrategy: 'shallow',
      alignmentStrategy: 'stepped',
      windExposure: 9,
      seismicDemand: 8,
      liveLoadPosition: 88,
      safetyPreference: 3,
    });

    expect(['high-risk', 'failed']).toContain(result.status);
    expect(result.dominantRisks.some((risk) => /scour|clearance|foundation|traffic/i.test(risk))).toBe(true);
    expect(result.screeningChecks.some((check) => check.id === 'hydraulic-severity' && check.status === 'fail')).toBe(true);
  });

  it('rewards extra support coverage for demanding spans', () => {
    const withoutSupport = simulateScenario({
      ...viableScenario,
      id: 'low-support',
      spanDistanceM: 220,
      supportCount: 2,
      supportSpacingBias: 7,
    });

    const withSupport = simulateScenario({
      ...viableScenario,
      id: 'high-support',
      spanDistanceM: 220,
      supportCount: 5,
      supportSpacingBias: 5,
    });

    expect(withSupport.feasibilityScore).toBeGreaterThan(withoutSupport.feasibilityScore);
    expect(withSupport.stabilityScore).toBeGreaterThan(withoutSupport.stabilityScore);
  });

  it('penalizes weak foundations under high hydraulic stress', () => {
    const shallow = simulateScenario({
      ...viableScenario,
      id: 'shallow',
      scourRisk: 8,
      currentVelocity: 3.7,
      seismicDemand: 8,
      foundationStrategy: 'shallow',
    });

    const deepPile = simulateScenario({
      ...viableScenario,
      id: 'deep-pile',
      scourRisk: 8,
      currentVelocity: 3.7,
      seismicDemand: 8,
      foundationStrategy: 'deep-pile',
    });

    expect(deepPile.feasibilityScore).toBeGreaterThan(shallow.feasibilityScore);
    expect(deepPile.derived.foundationDemand).toBeLessThan(shallow.derived.foundationDemand);
  });

  it('rewards added navigation clearance for busy channels', () => {
    const lowClearance = simulateScenario({
      ...viableScenario,
      id: 'low-clearance',
      waterwayType: 'harbor',
      vesselTraffic: 9,
      navigationClearanceM: 18,
    });

    const raisedDeck = simulateScenario({
      ...viableScenario,
      id: 'raised-deck',
      waterwayType: 'harbor',
      vesselTraffic: 9,
      navigationClearanceM: 34,
    });

    expect(raisedDeck.derived.clearanceAdequacy).toBeGreaterThan(lowClearance.derived.clearanceAdequacy);
    expect(raisedDeck.feasibilityScore).toBeGreaterThan(lowClearance.feasibilityScore);
  });

  it('changes basis messaging according to study provenance', () => {
    const manual = simulateScenario({
      ...viableScenario,
      id: 'manual-basis',
      dataOrigin: 'manual-estimate',
      sourceConfidence: 'manual-estimate',
    });

    const imported = simulateScenario({
      ...viableScenario,
      id: 'imported-basis',
      dataOrigin: 'user-import',
      sourceConfidence: 'imported-user-data',
    });

    expect(manual.confidenceLabel).toBe('Manual estimate basis');
    expect(imported.confidenceLabel).toBe('Imported study basis');
    expect(manual.basisNote).toMatch(/without an imported corridor package/i);
    expect(imported.recommendations.some((item) => /units|datum|source quality/i.test(item))).toBe(true);
    expect(manual.screeningChecks.find((check) => check.id === 'study-basis')?.status).toBe('fail');
    expect(imported.screeningChecks.find((check) => check.id === 'study-basis')?.status).toBe('pass');
  });
});
