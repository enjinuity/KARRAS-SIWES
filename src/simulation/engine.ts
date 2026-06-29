import type {
  AlignmentStrategy,
  BridgeSystem,
  FoundationStrategy,
  MaterialClass,
  ScenarioInput,
  ScreeningCheck,
  ScreeningCheckStatus,
  ScenarioStatus,
  SimulationResult,
  StudyDataOrigin,
  WaterwayType,
} from '@/simulation/types';

const materialCapacityMap: Record<MaterialClass, number> = {
  steel: 84,
  'reinforced-concrete': 76,
  composite: 90,
};

const materialCostMap: Record<MaterialClass, number> = {
  steel: 30,
  'reinforced-concrete': 24,
  composite: 38,
};

const bridgeSystemMap: Record<BridgeSystem, { spanFactor: number; capacityBonus: number; cost: number; complexity: number; clearanceBonus: number }> = {
  girder: { spanFactor: 0.34, capacityBonus: 0, cost: 10, complexity: 8, clearanceBonus: 0 },
  box: { spanFactor: 0.3, capacityBonus: 6, cost: 14, complexity: 12, clearanceBonus: 2 },
  'cable-stayed': { spanFactor: 0.22, capacityBonus: 14, cost: 22, complexity: 24, clearanceBonus: 8 },
};

const foundationMap: Record<FoundationStrategy, { capacity: number; scourResistance: number; cost: number; complexity: number }> = {
  shallow: { capacity: 10, scourResistance: 8, cost: 6, complexity: 5 },
  'deep-pile': { capacity: 22, scourResistance: 20, cost: 14, complexity: 13 },
  caisson: { capacity: 26, scourResistance: 25, cost: 19, complexity: 17 },
};

const alignmentMap: Record<AlignmentStrategy, { navigationPenalty: number; complexity: number }> = {
  direct: { navigationPenalty: 0, complexity: 2 },
  offset: { navigationPenalty: 6, complexity: 8 },
  stepped: { navigationPenalty: 10, complexity: 12 },
};

const waterwayPenaltyMap: Record<WaterwayType, { hydraulic: number; navigation: number }> = {
  river: { hydraulic: 6, navigation: 4 },
  estuary: { hydraulic: 10, navigation: 8 },
  harbor: { hydraulic: 4, navigation: 12 },
  'tidal-inlet': { hydraulic: 13, navigation: 7 },
};

const studyBasisMap: Record<StudyDataOrigin, { label: string; note: string; recommendation: string; risk: string }> = {
  'curated-preset': {
    label: 'Curated sample basis',
    note: 'Inputs are grounded in published reference material, but the study is still a converted sample package rather than a surveyed corridor model.',
    recommendation: 'Replace sample assumptions with corridor-specific geometry, navigation, and hydraulic data before using this as a lead decision package.',
    risk: 'The study basis is still a curated sample package, so the current ranking should be treated as illustrative until site-specific data replaces the reference assumptions.',
  },
  'manual-estimate': {
    label: 'Manual estimate basis',
    note: 'Inputs were entered manually in the workspace without an imported corridor package, so the screen is useful for option shaping but not for site-backed decisions.',
    recommendation: 'Import corridor, hydrographic, or survey data before using this option in a real shortlist review.',
    risk: 'The study remains driven by manual estimates, which limits how much confidence the team should place in the numerical ranking.',
  },
  'user-import': {
    label: 'Imported study basis',
    note: 'Scores are being driven by a user-supplied study package, which improves contextual grounding but still requires unit, datum, and source verification.',
    recommendation: 'Verify the uploaded package units, datum, and source quality before carrying this option into any formal recommendation.',
    risk: 'Imported data improves context, but the result is only as defensible as the uploaded package and its source controls.',
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const round = (value: number) => Math.round(value * 10) / 10;
const formatSigned = (value: number) => `${value > 0 ? '+' : ''}${round(value)}`;

const getStatus = (feasibilityScore: number): ScenarioStatus => {
  if (feasibilityScore >= 72) return 'viable';
  if (feasibilityScore >= 55) return 'borderline';
  if (feasibilityScore >= 35) return 'high-risk';
  return 'failed';
};

const describeSignal = (status: ScenarioStatus) => {
  if (status === 'viable') return 'Advance to the next screening pass';
  if (status === 'borderline') return 'Validate key assumptions before advancing';
  if (status === 'high-risk') return 'Rework the concept before treating it as a lead option';
  return 'Reset the concept before further comparison';
};

const getCheckStatus = (value: number, passThreshold: number, watchThreshold: number, direction: 'high-good' | 'low-good') => {
  if (direction === 'high-good') {
    if (value >= passThreshold) return 'pass';
    if (value >= watchThreshold) return 'watch';
    return 'fail';
  }

  if (value <= passThreshold) return 'pass';
  if (value <= watchThreshold) return 'watch';
  return 'fail';
};

const basisCheckMap: Record<StudyDataOrigin, { status: ScreeningCheckStatus; value: string; detail: string }> = {
  'user-import': {
    status: 'pass',
    value: 'Imported package',
    detail: 'A user-supplied study package is attached, so the screen has a stronger site basis than a manual estimate or sample preset.',
  },
  'curated-preset': {
    status: 'watch',
    value: 'Curated sample',
    detail: 'Published references inform the preset, but this is still a converted sample study rather than a corridor-specific package.',
  },
  'manual-estimate': {
    status: 'fail',
    value: 'Manual estimate',
    detail: 'No imported corridor package is attached, so the study should be treated as a concept-shaping estimate only.',
  },
};

export function simulateScenario(input: ScenarioInput): SimulationResult {
  const system = bridgeSystemMap[input.bridgeSystem];
  const foundation = foundationMap[input.foundationStrategy];
  const alignment = alignmentMap[input.alignmentStrategy];
  const waterwayPenalty = waterwayPenaltyMap[input.waterwayType];

  const spanDemand = clamp(input.spanDistanceM * system.spanFactor + input.channelWidthM * 0.08, 0, 100);
  const hydraulicDemand = clamp(
    waterwayPenalty.hydraulic +
      input.currentVelocity * 12 +
      input.waterDepthM * 1.2 +
      input.channelWidthM * 0.11 +
      input.floodExposure * 3.2,
    0,
    100,
  );

  const navigationRequirement =
    12 + input.vesselTraffic * 1.8 + input.waterDepthM * 0.22 + waterwayPenalty.navigation;
  const clearanceAdequacy = clamp(
    75 + input.navigationClearanceM * 2.1 + system.clearanceBonus * 2.5 - navigationRequirement * 2.1,
    0,
    100,
  );

  const scourExposure = clamp(
    input.scourRisk * 7 +
      input.currentVelocity * 8 +
      input.waterDepthM * 0.8 +
      Math.max(0, 10 - input.bankStability) * 3.6 -
      foundation.scourResistance,
    0,
    100,
  );

  const supportCoverage = clamp(
    input.supportCount * 16 +
      foundation.capacity * 0.7 -
      Math.abs(input.supportSpacingBias - 5) * 4.8 -
      input.channelWidthM * 0.035,
    0,
    100,
  );

  const materialCapacity = clamp(
    materialCapacityMap[input.materialClass] +
      system.capacityBonus +
      foundation.capacity * 0.9 +
      input.safetyPreference * 3 -
      input.windExposure * 1.3,
    0,
    100,
  );

  const loadStress = clamp(
    input.loadLevel * 6.7 + Math.abs(input.liveLoadPosition - 50) * 0.28 + input.spanDistanceM * 0.055,
    0,
    100,
  );

  const environmentalStress = clamp(
    input.windExposure * 4.4 + input.seismicDemand * 4.9 + input.floodExposure * 3.1,
    0,
    100,
  );

  const foundationDemand = clamp(
    hydraulicDemand * 0.34 +
      scourExposure * 0.52 +
      environmentalStress * 0.24 +
      Math.max(0, 10 - input.bankStability) * 3.8 -
      foundation.capacity,
    0,
    100,
  );

  const navigationRisk = clamp(
    input.vesselTraffic * 6.1 +
      Math.max(0, navigationRequirement - input.navigationClearanceM) * 4.6 +
      alignment.navigationPenalty +
      Math.max(0, input.supportCount - 2) * 4,
    0,
    100,
  );

  const stabilityScore = clamp(
    100 -
      spanDemand * 0.52 -
      hydraulicDemand * 0.22 -
      scourExposure * 0.3 -
      loadStress * 0.36 -
      environmentalStress * 0.24 -
      foundationDemand * 0.18 -
      navigationRisk * 0.12 +
      supportCoverage * 0.36 +
      materialCapacity * 0.24 +
      clearanceAdequacy * 0.08,
    0,
    100,
  );

  const feasibilityScore = clamp(
    stabilityScore +
      materialCapacity * 0.22 +
      clearanceAdequacy * 0.14 -
      hydraulicDemand * 0.14 -
      navigationRisk * 0.18 -
      foundationDemand * 0.16 +
      input.safetyPreference * 0.8,
    0,
    100,
  );

  const costScore = clamp(
    materialCostMap[input.materialClass] +
      system.cost +
      foundation.cost +
      alignment.complexity * 0.8 +
      input.supportCount * 4.6 +
      input.spanDistanceM * 0.095 +
      input.navigationClearanceM * 0.32,
    0,
    100,
  );

  const complexityScore = clamp(
    system.complexity +
      foundation.complexity +
      alignment.complexity +
      hydraulicDemand * 0.3 +
      scourExposure * 0.28 +
      navigationRisk * 0.32 +
      environmentalStress * 0.2 +
      input.spanDistanceM * 0.06,
    0,
    100,
  );

  const dominantRisks: string[] = [];
  const recommendations: string[] = [];
  const studyBasis = studyBasisMap[input.dataOrigin];

  if (input.channelWidthM > 200 || input.spanDistanceM > 260) {
    dominantRisks.push('The crossing corridor is wide enough to push the concept beyond a comfortable early-stage span strategy.');
    recommendations.push('Test a longer-span system or reduce the effective channel crossing length before advancing this option.');
  }

  if (clearanceAdequacy < 45) {
    dominantRisks.push('Navigation clearance is tight for the modeled vessel mix and channel depth.');
    recommendations.push('Raise the deck or shift to a system that can deliver more clearance without adding many in-channel supports.');
  }

  if (scourExposure >= 58 || foundationDemand >= 60) {
    dominantRisks.push('Scour and foundation demand are high enough to make substructure performance a leading concern.');
    recommendations.push('Move toward deep-pile or caisson foundations and improve bank protection assumptions.');
  }

  if (input.vesselTraffic >= 7 && navigationRisk >= 52) {
    dominantRisks.push('Heavy vessel traffic makes pier placement and clearance shortfalls especially sensitive.');
    recommendations.push('Reduce obstructions in the navigation envelope by limiting in-channel supports or straightening the crossing alignment.');
  }

  if (input.bankStability <= 4) {
    dominantRisks.push('Bank stability is weak, which raises approach and foundation uncertainty on both edges of the crossing.');
    recommendations.push('Treat embankment stabilization and approach treatment as part of the concept, not an afterthought.');
  }

  if (input.supportCount <= 2 && input.spanDistanceM >= 200) {
    dominantRisks.push('Support coverage is thin relative to the current span and live loading assumptions.');
    recommendations.push('Add support coverage or move to a more long-span-oriented bridge system.');
  }

  if (Math.abs(input.supportSpacingBias - 5) >= 4) {
    dominantRisks.push('Pier spacing is pulled too far off-center, increasing uneven demand across the crossing.');
    recommendations.push('Re-center the pier layout to balance demand unless a navigation channel constraint forces the offset.');
  }

  if (input.foundationStrategy === 'shallow' && (input.scourRisk >= 7 || input.currentVelocity >= 3.2)) {
    dominantRisks.push('A shallow foundation concept is mismatched with the current scour and hydraulic assumptions.');
    recommendations.push('Upgrade the substructure strategy before treating this as a credible lead option.');
  }

  if (input.materialClass === 'reinforced-concrete' && input.spanDistanceM >= 230) {
    dominantRisks.push('The selected material is working against the current long-span concept envelope.');
    recommendations.push('Compare this option against steel or composite alternatives before carrying it forward.');
  }

  dominantRisks.push(studyBasis.risk);
  recommendations.push(studyBasis.recommendation);

  if (dominantRisks.length === 0) {
    dominantRisks.push('No single failure mode dominates this concept, but it still requires formal hydraulic and structural design review.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Use this crossing as the baseline and compare it against one lower-cost and one higher-clearance variant.');
  }

  const status = getStatus(feasibilityScore);
  const confidenceLabel = studyBasis.label;
  const decisionSignal = describeSignal(status);
  const clearanceMargin = input.navigationClearanceM - navigationRequirement;
  const structuralReserveBalance = materialCapacity + supportCoverage * 0.55 - spanDemand - loadStress * 0.35;
  const foundationSuitability = 100 - foundationDemand;
  const basisCheck = basisCheckMap[input.dataOrigin];
  const pressureDrivers: Array<[string, number]> = [
    ['hydraulic loading', hydraulicDemand] as [string, number],
    ['foundation demand', foundationDemand] as [string, number],
    ['navigation risk', navigationRisk] as [string, number],
    ['scour exposure', scourExposure] as [string, number],
    ['environmental stress', environmentalStress] as [string, number],
    ['span and live-load demand', spanDemand * 0.55 + loadStress * 0.45] as [string, number],
  ].sort((left, right) => right[1] - left[1]);
  const reserveDrivers: Array<[string, number]> = [
    ['substructure coverage', supportCoverage] as [string, number],
    ['material and system capacity', materialCapacity] as [string, number],
    ['navigation clearance headroom', clearanceAdequacy] as [string, number],
  ].sort((left, right) => right[1] - left[1]);
  const explanationLead =
    status === 'viable'
      ? 'This concept clears the current concept-stage screen.'
      : status === 'borderline'
        ? 'This concept remains plausible, but the margin is thin.'
        : status === 'high-risk'
          ? 'This concept is still useful for comparison, but it is not ready to lead.'
          : 'This concept fails the current concept-stage screen.';
  const explanation = `${explanationLead} The main pressure is ${pressureDrivers[0][0]}, while the strongest reserve comes from ${reserveDrivers[0][0]}. ${studyBasis.note}`;
  const screeningChecks: ScreeningCheck[] = [
    {
      id: 'clearance-margin',
      label: 'Navigation clearance margin',
      status: getCheckStatus(clearanceMargin, 8, 3, 'high-good'),
      value: `${formatSigned(clearanceMargin)}m`,
      detail:
        clearanceMargin >= 0
          ? 'Available vertical clearance exceeds the modeled navigation requirement by this margin.'
          : 'Modeled navigation requirement exceeds the available vertical clearance for the current deck concept.',
    },
    {
      id: 'hydraulic-severity',
      label: 'Hydraulic severity',
      status: getCheckStatus(hydraulicDemand, 38, 58, 'low-good'),
      value: `${round(hydraulicDemand)}/100`,
      detail: 'Combines waterway type, depth, channel width, velocity, and flood exposure into a concept-stage hydraulic pressure reading.',
    },
    {
      id: 'foundation-suitability',
      label: 'Foundation suitability',
      status: getCheckStatus(foundationSuitability, 65, 45, 'high-good'),
      value: `${round(foundationSuitability)}/100`,
      detail: 'Reflects how well the selected foundation strategy absorbs scour, hydraulic, and environmental pressure in the current corridor.',
    },
    {
      id: 'support-sufficiency',
      label: 'Support sufficiency',
      status: getCheckStatus(supportCoverage, 60, 42, 'high-good'),
      value: `${round(supportCoverage)}/100`,
      detail: 'Checks whether the current support count and spacing are credible for the span and channel width being screened.',
    },
    {
      id: 'structural-reserve',
      label: 'Structural reserve balance',
      status: getCheckStatus(structuralReserveBalance, 8, -4, 'high-good'),
      value: `${formatSigned(structuralReserveBalance)}`,
      detail: 'Compares material and support reserve against span and live-load demand to show whether the concept still has structural headroom.',
    },
    {
      id: 'study-basis',
      label: 'Study basis readiness',
      status: basisCheck.status,
      value: basisCheck.value,
      detail: basisCheck.detail,
    },
  ];

  return {
    feasibilityScore: round(feasibilityScore),
    stabilityScore: round(stabilityScore),
    costScore: round(costScore),
    complexityScore: round(complexityScore),
    confidenceLabel,
    decisionSignal,
    basisNote: studyBasis.note,
    status,
    dominantRisks,
    recommendations,
    explanation,
    derived: {
      spanDemand: round(spanDemand),
      hydraulicDemand: round(hydraulicDemand),
      clearanceAdequacy: round(clearanceAdequacy),
      scourExposure: round(scourExposure),
      supportCoverage: round(supportCoverage),
      materialCapacity: round(materialCapacity),
      loadStress: round(loadStress),
      foundationDemand: round(foundationDemand),
      environmentalStress: round(environmentalStress),
      navigationRisk: round(navigationRisk),
    },
    screeningChecks,
  };
}
