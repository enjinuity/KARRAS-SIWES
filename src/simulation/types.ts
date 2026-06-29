export type WaterwayType = 'river' | 'estuary' | 'harbor' | 'tidal-inlet';

export type MaterialClass = 'steel' | 'reinforced-concrete' | 'composite';

export type BridgeSystem = 'girder' | 'box' | 'cable-stayed';

export type FoundationStrategy = 'shallow' | 'deep-pile' | 'caisson';

export type AlignmentStrategy = 'direct' | 'offset' | 'stepped';

export type StudyState = 'blank-canvas' | 'configured';

export type StudyDataOrigin = 'curated-preset' | 'manual-estimate' | 'user-import';

export type StudyConfidence = 'sample-curated' | 'manual-estimate' | 'imported-user-data';

export type SourceReferenceType = 'standard' | 'hydrography' | 'navigation' | 'flood' | 'topography' | 'imported-file';

export type StudySourceReference = {
  id: string;
  label: string;
  owner: string;
  type: SourceReferenceType;
  url?: string;
  note: string;
};

export type StudyAssumption = {
  id: string;
  label: string;
  value: string;
  basis: string;
};

export type ImportedArtifact = {
  fileName: string;
  format: 'json' | 'csv' | 'geojson';
  importedAt: string;
  note: string;
};

export type ScenarioInput = {
  id: string;
  name: string;
  studyState: StudyState;
  dataOrigin: StudyDataOrigin;
  sourceConfidence: StudyConfidence;
  presetId?: string;
  siteContext: string;
  sourceSummary: string;
  studyAssumptions: StudyAssumption[];
  sourceReferences: StudySourceReference[];
  importedArtifacts: ImportedArtifact[];
  spanDistanceM: number;
  waterwayType: WaterwayType;
  channelWidthM: number;
  waterDepthM: number;
  navigationClearanceM: number;
  currentVelocity: number;
  vesselTraffic: number;
  bankStability: number;
  scourRisk: number;
  floodExposure: number;
  loadLevel: number;
  supportCount: number;
  supportSpacingBias: number;
  materialClass: MaterialClass;
  bridgeSystem: BridgeSystem;
  foundationStrategy: FoundationStrategy;
  alignmentStrategy: AlignmentStrategy;
  windExposure: number;
  seismicDemand: number;
  liveLoadPosition: number;
  safetyPreference: number;
};

export type ScenarioStatus = 'viable' | 'borderline' | 'high-risk' | 'failed';

export type DerivedMetrics = {
  spanDemand: number;
  hydraulicDemand: number;
  clearanceAdequacy: number;
  scourExposure: number;
  supportCoverage: number;
  materialCapacity: number;
  loadStress: number;
  foundationDemand: number;
  environmentalStress: number;
  navigationRisk: number;
};

export type ScreeningCheckStatus = 'pass' | 'watch' | 'fail';

export type ScreeningCheck = {
  id: string;
  label: string;
  status: ScreeningCheckStatus;
  value: string;
  detail: string;
};

export type SimulationResult = {
  feasibilityScore: number;
  stabilityScore: number;
  costScore: number;
  complexityScore: number;
  confidenceLabel: string;
  decisionSignal: string;
  basisNote: string;
  status: ScenarioStatus;
  dominantRisks: string[];
  recommendations: string[];
  explanation: string;
  derived: DerivedMetrics;
  screeningChecks: ScreeningCheck[];
};
