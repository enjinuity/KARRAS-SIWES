import type { WaterwayType } from '@/simulation/types';

export const waterwayPresets: Record<
  WaterwayType,
  {
    channelWidthM: number;
    waterDepthM: number;
    navigationClearanceM: number;
    currentVelocity: number;
    vesselTraffic: number;
    bankStability: number;
    scourRisk: number;
    floodExposure: number;
  }
> = {
  river: {
    channelWidthM: 100,
    waterDepthM: 14,
    navigationClearanceM: 24,
    currentVelocity: 1.8,
    vesselTraffic: 3,
    bankStability: 8,
    scourRisk: 4,
    floodExposure: 5,
  },
  estuary: {
    channelWidthM: 165,
    waterDepthM: 22,
    navigationClearanceM: 28,
    currentVelocity: 2.7,
    vesselTraffic: 6,
    bankStability: 5,
    scourRisk: 7,
    floodExposure: 8,
  },
  harbor: {
    channelWidthM: 140,
    waterDepthM: 24,
    navigationClearanceM: 32,
    currentVelocity: 1.5,
    vesselTraffic: 8,
    bankStability: 8,
    scourRisk: 4,
    floodExposure: 4,
  },
  'tidal-inlet': {
    channelWidthM: 185,
    waterDepthM: 20,
    navigationClearanceM: 26,
    currentVelocity: 3.4,
    vesselTraffic: 5,
    bankStability: 4,
    scourRisk: 8,
    floodExposure: 9,
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const waterwayRanges = {
  channelWidthM: [70, 320] as const,
  waterDepthM: [6, 42] as const,
  navigationClearanceM: [12, 65] as const,
  currentVelocity: [0.8, 5.2] as const,
  vesselTraffic: [1, 10] as const,
  bankStability: [1, 10] as const,
  scourRisk: [1, 10] as const,
  floodExposure: [1, 10] as const,
};

export function normalizeWaterwayValue(value: number | undefined, fallback: number, min: number, max: number) {
  return clamp(Math.round((value ?? fallback) * 10) / 10, min, max);
}

export function getWaterwayPreset(type: WaterwayType) {
  return waterwayPresets[type];
}
