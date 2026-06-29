import type { ScenarioInput, StudyAssumption, StudySourceReference } from '@/simulation/types';

export type BridgeStudyPreset = {
  id: string;
  label: string;
  description: string;
  defaultName: string;
  patch: Partial<ScenarioInput>;
};

const standardsSources: StudySourceReference[] = [
  {
    id: 'aashto-lrfd',
    label: 'AASHTO LRFD Bridge Design Specifications',
    owner: 'AASHTO',
    type: 'standard',
    url: 'https://store.transportation.org/Item/PublicationDetail?ID=5377',
    note: 'Used as the screening reference for bridge system suitability, load framing, and concept-stage design checks.',
  },
  {
    id: 'fema-nfhl',
    label: 'National Flood Hazard Layer',
    owner: 'FEMA',
    type: 'flood',
    url: 'https://hazards.fema.gov/femaportal/wps/portal/NFHLWMS',
    note: 'Used as the flood-risk reference for flood exposure assumptions and resilience screening.',
  },
];

const hydrographySources: StudySourceReference[] = [
  {
    id: 'usgs-nhd',
    label: 'National Hydrography Dataset',
    owner: 'USGS',
    type: 'hydrography',
    url: 'https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer',
    note: 'Used as the corridor hydrography reference for channel extent, flowline context, and screening geometry.',
  },
  {
    id: 'noaa-enc',
    label: 'NOAA Electronic Navigational Charts',
    owner: 'NOAA Office of Coast Survey',
    type: 'navigation',
    url: 'https://nauticalcharts.noaa.gov/charts/noaa-enc.html',
    note: 'Used as the navigation and clearance reference for vessel envelopes and channel operations.',
  },
];

export const bridgeStudyPresets: BridgeStudyPreset[] = [
  {
    id: 'coos-bay-harbor-access',
    label: 'Coos Bay Harbor Access',
    description: 'Harbor crossing sample grounded in published channel width, depth, clearance, and tidal data.',
    defaultName: 'Coos Bay Harbor Access Study',
    patch: {
      presetId: 'coos-bay-harbor-access',
      dataOrigin: 'curated-preset',
      sourceConfidence: 'sample-curated',
      siteContext: 'Coos Bay, Oregon harbor access corridor',
      sourceSummary:
        'Preset geometry is based on the published Coos Bay channel description, then converted into a concept-stage bridge screening package.',
      studyAssumptions: [
        {
          id: 'coos-width',
          label: 'Authorized channel width',
          value: '91.5m to 122m',
          basis: 'Taken from the published Coos Bay channel widths and used to set the navigation corridor.',
        },
        {
          id: 'coos-depth',
          label: 'Channel depth',
          value: '11.3m',
          basis: 'Taken from the published channel depth and rounded for concept-stage use.',
        },
        {
          id: 'coos-clearance',
          label: 'Navigation clearance target',
          value: '45m',
          basis: 'Set from the published McCullough Highway Bridge vertical restriction at zero tide.',
        },
      ] satisfies StudyAssumption[],
      sourceReferences: [
        {
          id: 'coos-bay-channel',
          label: 'Channel Description',
          owner: 'Port of Coos Bay',
          type: 'navigation',
          url: 'https://www.portofcoosbay.com/channel-description',
          note: 'Provides channel width, depth, tidal range, current conditions, and bridge clearance notes.',
        },
        ...standardsSources,
      ],
      importedArtifacts: [],
      waterwayType: 'harbor',
      spanDistanceM: 185,
      channelWidthM: 122,
      waterDepthM: 11,
      navigationClearanceM: 45,
      currentVelocity: 1.5,
      vesselTraffic: 7,
      bankStability: 8,
      scourRisk: 4,
      floodExposure: 4,
      loadLevel: 5,
      supportCount: 3,
      bridgeSystem: 'box',
      foundationStrategy: 'caisson',
    },
  },
  {
    id: 'lower-mississippi-freight',
    label: 'Lower Mississippi Freight',
    description: 'Freight corridor sample anchored to NOAA bridge-clearance updates and inland navigation references.',
    defaultName: 'Lower Mississippi Freight Study',
    patch: {
      presetId: 'lower-mississippi-freight',
      dataOrigin: 'curated-preset',
      sourceConfidence: 'sample-curated',
      siteContext: 'Lower Mississippi inland navigation corridor sample',
      sourceSummary:
        'Preset clearance and vessel envelope are informed by NOAA bridge-clearance updates; span and channel geometry remain screening assumptions until imported site data is supplied.',
      studyAssumptions: [
        {
          id: 'mississippi-clearance',
          label: 'Navigation clearance target',
          value: '47m',
          basis: 'Centered between NOAA-updated Lower Mississippi bridge clearances to represent a freight-compatible concept target.',
        },
        {
          id: 'mississippi-width',
          label: 'Channel width',
          value: '160m',
          basis: 'Held as a screening assumption until a user imports surveyed corridor geometry or chart data.',
        },
        {
          id: 'mississippi-depth',
          label: 'Water depth',
          value: '18m',
          basis: 'Held as a screening assumption to keep the preset usable before user-supplied bathymetry.',
        },
      ] satisfies StudyAssumption[],
      sourceReferences: [
        {
          id: 'lower-mississippi-clearance',
          label: 'NOAA Bridge Clearance Update',
          owner: 'NOAA Office of Coast Survey',
          type: 'navigation',
          url: 'https://nauticalcharts.noaa.gov/updates/noaa-updates-bridge-clearances-crossing-one-of-the-most-important-waterways-in-the-united-states/',
          note: 'Provides updated bridge clearance values for the Lower Mississippi between New Orleans and Baton Rouge.',
        },
        {
          id: 'noaa-enc-data',
          label: 'NOAA ENC Program',
          owner: 'NOAA Office of Coast Survey',
          type: 'navigation',
          url: 'https://nauticalcharts.noaa.gov/charts/noaa-enc.html',
          note: 'Used as the navigation chart source for channel, bridge clearance, and vessel envelope framing.',
        },
        ...standardsSources,
      ],
      importedArtifacts: [],
      waterwayType: 'river',
      spanDistanceM: 235,
      channelWidthM: 160,
      waterDepthM: 18,
      navigationClearanceM: 47,
      currentVelocity: 2.4,
      vesselTraffic: 7,
      bankStability: 6,
      scourRisk: 7,
      floodExposure: 8,
      loadLevel: 7,
      supportCount: 3,
      bridgeSystem: 'cable-stayed',
      foundationStrategy: 'caisson',
    },
  },
  {
    id: 'nhd-river-screening',
    label: 'USGS River Screening',
    description: 'River screening sample built from public hydrography, flood mapping, and standards references.',
    defaultName: 'USGS River Screening Study',
    patch: {
      presetId: 'nhd-river-screening',
      dataOrigin: 'curated-preset',
      sourceConfidence: 'sample-curated',
      siteContext: 'Generic U.S. river corridor sample',
      sourceSummary:
        'Preset corridor values are a curated sample built from public hydrography and flood references, intended for screening before importing corridor-specific data.',
      studyAssumptions: [
        {
          id: 'river-hydrography',
          label: 'Hydrography base',
          value: 'USGS NHD / NHDPlus HR',
          basis: 'Used as the baseline for generalized river corridor extents and flowline structure.',
        },
        {
          id: 'river-flood',
          label: 'Flood framing',
          value: '1% annual-chance flood context',
          basis: 'Used as the screening basis for flood exposure and resilience planning assumptions.',
        },
        {
          id: 'river-structure',
          label: 'Bridge system suitability',
          value: 'Steel / composite girder or box',
          basis: 'Framed against concept-stage system suitability ranges under AASHTO LRFD screening logic.',
        },
      ] satisfies StudyAssumption[],
      sourceReferences: [...hydrographySources, ...standardsSources],
      importedArtifacts: [],
      waterwayType: 'river',
      spanDistanceM: 165,
      channelWidthM: 110,
      waterDepthM: 14,
      navigationClearanceM: 23,
      currentVelocity: 2.0,
      vesselTraffic: 3,
      bankStability: 7,
      scourRisk: 5,
      floodExposure: 6,
      loadLevel: 4,
      supportCount: 4,
      bridgeSystem: 'box',
      foundationStrategy: 'deep-pile',
    },
  },
  {
    id: 'tidal-inlet-resilience',
    label: 'Tidal Inlet Resilience',
    description: 'Coastal screening sample combining navigation charts, flood hazard context, and resilience-driven assumptions.',
    defaultName: 'Tidal Inlet Resilience Study',
    patch: {
      presetId: 'tidal-inlet-resilience',
      dataOrigin: 'curated-preset',
      sourceConfidence: 'sample-curated',
      siteContext: 'Coastal tidal inlet sample corridor',
      sourceSummary:
        'Preset coastal values are framed as resilience-first screening assumptions built from NOAA navigation data types and FEMA flood-hazard references.',
      studyAssumptions: [
        {
          id: 'tidal-flood',
          label: 'Flood exposure framing',
          value: 'High coastal flood exposure',
          basis: 'Set high to reflect the NFHL-first screening posture expected in a coastal inlet environment.',
        },
        {
          id: 'tidal-navigation',
          label: 'Navigation envelope',
          value: 'Moderate vessel clearance requirement',
          basis: 'Derived from NOAA ENC-style navigation screening, not from a surveyed site package.',
        },
        {
          id: 'tidal-foundation',
          label: 'Foundation concept',
          value: 'Deep-pile',
          basis: 'Chosen as the resilience-biased screening response to scour and unstable banks.',
        },
      ] satisfies StudyAssumption[],
      sourceReferences: [...hydrographySources, ...standardsSources],
      importedArtifacts: [],
      waterwayType: 'tidal-inlet',
      spanDistanceM: 245,
      channelWidthM: 190,
      waterDepthM: 20,
      navigationClearanceM: 28,
      currentVelocity: 3.4,
      vesselTraffic: 5,
      bankStability: 4,
      scourRisk: 8,
      floodExposure: 9,
      loadLevel: 5,
      supportCount: 2,
      bridgeSystem: 'cable-stayed',
      foundationStrategy: 'deep-pile',
    },
  },
];

export function getBridgeStudyPreset(presetId: string) {
  return bridgeStudyPresets.find((preset) => preset.id === presetId) ?? bridgeStudyPresets[0];
}
