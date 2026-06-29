import type { BridgeSystem, ScenarioInput, WaterwayType } from '@/simulation/types';
import { getWaterwayPreset, normalizeWaterwayValue, waterwayRanges } from '@/simulation/waterway';

type LegacyScenarioInput = Partial<ScenarioInput> & {
  id: string;
  terrainType?: 'flat' | 'rocky' | 'wetland' | 'valley';
  terrainSeverity?: number;
  deckProfile?: 'light' | 'standard' | 'heavy-duty';
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const legacyTerrainToWaterway: Record<NonNullable<LegacyScenarioInput['terrainType']>, WaterwayType> = {
  flat: 'river',
  rocky: 'harbor',
  wetland: 'estuary',
  valley: 'river',
};

const legacyDeckToSystem: Record<NonNullable<LegacyScenarioInput['deckProfile']>, BridgeSystem> = {
  light: 'girder',
  standard: 'box',
  'heavy-duty': 'cable-stayed',
};

export const createScenario = (name = 'South Channel Crossing'): ScenarioInput => {
  const baseWaterway = getWaterwayPreset('river');

  return {
    id: crypto.randomUUID(),
    name,
    studyState: 'configured',
    dataOrigin: 'manual-estimate',
    sourceConfidence: 'manual-estimate',
    presetId: undefined,
    siteContext: 'Unspecified crossing corridor',
    sourceSummary: 'Study was created manually inside KARRAS without imported site data or a curated preset package.',
    studyAssumptions: [
      {
        id: 'manual-origin',
        label: 'Data origin',
        value: 'Manual estimate',
        basis: 'User-defined concept inputs entered directly in the workspace.',
      },
    ],
    sourceReferences: [],
    importedArtifacts: [],
    spanDistanceM: 160,
    waterwayType: 'river',
    channelWidthM: baseWaterway.channelWidthM,
    waterDepthM: baseWaterway.waterDepthM,
    navigationClearanceM: baseWaterway.navigationClearanceM,
    currentVelocity: baseWaterway.currentVelocity,
    vesselTraffic: baseWaterway.vesselTraffic,
    bankStability: baseWaterway.bankStability,
    scourRisk: baseWaterway.scourRisk,
    floodExposure: baseWaterway.floodExposure,
    loadLevel: 4,
    supportCount: 4,
    supportSpacingBias: 5,
    materialClass: 'composite',
    bridgeSystem: 'box',
    foundationStrategy: 'deep-pile',
    alignmentStrategy: 'direct',
    windExposure: 5,
    seismicDemand: 3,
    liveLoadPosition: 50,
    safetyPreference: 7,
  };
};

export const normalizeScenario = (input: LegacyScenarioInput): ScenarioInput => {
  const inferredWaterwayType =
    input.waterwayType ?? (input.terrainType ? legacyTerrainToWaterway[input.terrainType] : undefined) ?? 'river';
  const preset = getWaterwayPreset(inferredWaterwayType);
  const fallback = createScenario(input.name ?? 'Recovered Crossing');
  const severity = clamp(Math.round(input.terrainSeverity ?? 5), 1, 10);

  return {
    ...fallback,
    ...input,
    id: input.id,
    name: input.name?.trim() || fallback.name,
    studyState: input.studyState ?? fallback.studyState,
    dataOrigin: input.dataOrigin ?? fallback.dataOrigin,
    sourceConfidence: input.sourceConfidence ?? fallback.sourceConfidence,
    presetId: input.presetId ?? fallback.presetId,
    siteContext: input.siteContext?.trim() || fallback.siteContext,
    sourceSummary: input.sourceSummary?.trim() || fallback.sourceSummary,
    studyAssumptions:
      input.studyAssumptions?.length && Array.isArray(input.studyAssumptions)
        ? input.studyAssumptions
        : fallback.studyAssumptions,
    sourceReferences:
      input.sourceReferences?.length && Array.isArray(input.sourceReferences)
        ? input.sourceReferences
        : fallback.sourceReferences,
    importedArtifacts:
      input.importedArtifacts?.length && Array.isArray(input.importedArtifacts)
        ? input.importedArtifacts
        : fallback.importedArtifacts,
    waterwayType: inferredWaterwayType,
    channelWidthM: normalizeWaterwayValue(
      input.channelWidthM ?? preset.channelWidthM + (severity - 5) * 8,
      preset.channelWidthM,
      waterwayRanges.channelWidthM[0],
      waterwayRanges.channelWidthM[1],
    ),
    waterDepthM: normalizeWaterwayValue(
      input.waterDepthM ?? preset.waterDepthM + (severity - 5) * 1.1,
      preset.waterDepthM,
      waterwayRanges.waterDepthM[0],
      waterwayRanges.waterDepthM[1],
    ),
    navigationClearanceM: normalizeWaterwayValue(
      input.navigationClearanceM ?? preset.navigationClearanceM + Math.max(0, severity - 5),
      preset.navigationClearanceM,
      waterwayRanges.navigationClearanceM[0],
      waterwayRanges.navigationClearanceM[1],
    ),
    currentVelocity: normalizeWaterwayValue(
      input.currentVelocity ?? preset.currentVelocity + Math.max(0, severity - 5) * 0.15,
      preset.currentVelocity,
      waterwayRanges.currentVelocity[0],
      waterwayRanges.currentVelocity[1],
    ),
    vesselTraffic: clamp(Math.round(input.vesselTraffic ?? preset.vesselTraffic), 1, 10),
    bankStability: clamp(Math.round(input.bankStability ?? preset.bankStability - Math.max(0, severity - 6) * 0.5), 1, 10),
    scourRisk: clamp(Math.round(input.scourRisk ?? preset.scourRisk + Math.max(0, severity - 5) * 0.7), 1, 10),
    floodExposure: clamp(Math.round(input.floodExposure ?? preset.floodExposure + Math.max(0, severity - 5) * 0.7), 1, 10),
    spanDistanceM: clamp(Math.round(input.spanDistanceM ?? fallback.spanDistanceM), 90, 420),
    loadLevel: clamp(Math.round(input.loadLevel ?? fallback.loadLevel), 1, 10),
    supportCount: clamp(Math.round(input.supportCount ?? fallback.supportCount), 1, 6),
    supportSpacingBias: clamp(Math.round(input.supportSpacingBias ?? fallback.supportSpacingBias), 1, 10),
    materialClass: input.materialClass ?? fallback.materialClass,
    bridgeSystem: input.bridgeSystem ?? (input.deckProfile ? legacyDeckToSystem[input.deckProfile] : fallback.bridgeSystem),
    foundationStrategy: input.foundationStrategy ?? fallback.foundationStrategy,
    alignmentStrategy: input.alignmentStrategy ?? fallback.alignmentStrategy,
    windExposure: clamp(Math.round(input.windExposure ?? fallback.windExposure), 1, 10),
    seismicDemand: clamp(Math.round(input.seismicDemand ?? fallback.seismicDemand), 1, 10),
    liveLoadPosition: clamp(Math.round(input.liveLoadPosition ?? fallback.liveLoadPosition), 0, 100),
    safetyPreference: clamp(Math.round(input.safetyPreference ?? fallback.safetyPreference), 1, 10),
  };
};
