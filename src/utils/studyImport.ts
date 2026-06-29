import type { ImportedArtifact, ScenarioInput, StudyAssumption, StudySourceReference } from '@/simulation/types';

type ImportedStudyPayload = {
  name?: string;
  patch: Partial<ScenarioInput>;
  message: string;
};

const fieldAliases: Record<string, keyof ScenarioInput> = {
  span: 'spanDistanceM',
  spanDistanceM: 'spanDistanceM',
  span_distance_m: 'spanDistanceM',
  channelWidthM: 'channelWidthM',
  channel_width_m: 'channelWidthM',
  waterDepthM: 'waterDepthM',
  water_depth_m: 'waterDepthM',
  navigationClearanceM: 'navigationClearanceM',
  navigation_clearance_m: 'navigationClearanceM',
  currentVelocity: 'currentVelocity',
  current_velocity: 'currentVelocity',
  vesselTraffic: 'vesselTraffic',
  vessel_traffic: 'vesselTraffic',
  bankStability: 'bankStability',
  bank_stability: 'bankStability',
  scourRisk: 'scourRisk',
  scour_risk: 'scourRisk',
  floodExposure: 'floodExposure',
  flood_exposure: 'floodExposure',
  loadLevel: 'loadLevel',
  load_level: 'loadLevel',
  supportCount: 'supportCount',
  support_count: 'supportCount',
  supportSpacingBias: 'supportSpacingBias',
  support_spacing_bias: 'supportSpacingBias',
  materialClass: 'materialClass',
  material_class: 'materialClass',
  bridgeSystem: 'bridgeSystem',
  bridge_system: 'bridgeSystem',
  foundationStrategy: 'foundationStrategy',
  foundation_strategy: 'foundationStrategy',
  alignmentStrategy: 'alignmentStrategy',
  alignment_strategy: 'alignmentStrategy',
  windExposure: 'windExposure',
  wind_exposure: 'windExposure',
  seismicDemand: 'seismicDemand',
  seismic_demand: 'seismicDemand',
  liveLoadPosition: 'liveLoadPosition',
  live_load_position: 'liveLoadPosition',
  safetyPreference: 'safetyPreference',
  safety_preference: 'safetyPreference',
  waterwayType: 'waterwayType',
  waterway_type: 'waterwayType',
  siteContext: 'siteContext',
  site_context: 'siteContext',
  sourceSummary: 'sourceSummary',
  source_summary: 'sourceSummary',
};

function normalizeValue(key: keyof ScenarioInput, value: string | number | boolean | null | undefined) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const numericKeys = new Set<keyof ScenarioInput>([
    'spanDistanceM',
    'channelWidthM',
    'waterDepthM',
    'navigationClearanceM',
    'currentVelocity',
    'vesselTraffic',
    'bankStability',
    'scourRisk',
    'floodExposure',
    'loadLevel',
    'supportCount',
    'supportSpacingBias',
    'windExposure',
    'seismicDemand',
    'liveLoadPosition',
    'safetyPreference',
  ]);

  if (numericKeys.has(key)) {
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  return trimmed;
}

function buildImportMetadata(fileName: string, format: ImportedArtifact['format'], note: string) {
  const importedArtifacts: ImportedArtifact[] = [
    {
      fileName,
      format,
      importedAt: new Date().toISOString(),
      note,
    },
  ];

  const sourceReferences: StudySourceReference[] = [
    {
      id: `${format}-import`,
      label: `${format.toUpperCase()} import`,
      owner: 'User supplied',
      type: 'imported-file',
      note,
    },
  ];

  const studyAssumptions: StudyAssumption[] = [
    {
      id: 'import-origin',
      label: 'Primary data origin',
      value: fileName,
      basis: 'Imported by the user and treated as the controlling study package until edited in the workspace.',
    },
  ];

  return {
    dataOrigin: 'user-import' as const,
    sourceConfidence: 'imported-user-data' as const,
    importedArtifacts,
    sourceReferences,
    studyAssumptions,
  };
}

function parseObjectToPatch(data: Record<string, unknown>) {
  const patch: Partial<ScenarioInput> = {};

  for (const [rawKey, rawValue] of Object.entries(data)) {
    const mappedKey = fieldAliases[rawKey];
    if (!mappedKey) {
      continue;
    }

    const normalized = normalizeValue(mappedKey, rawValue as string | number | boolean | null | undefined);
    if (normalized !== undefined) {
      (patch as Record<string, unknown>)[mappedKey] = normalized;
    }
  }

  return patch;
}

function parseCsv(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error('CSV file is empty.');
  }

  if (lines[0].toLowerCase() === 'field,value') {
    return parseObjectToPatch(
      Object.fromEntries(
        lines.slice(1).map((line) => {
          const [field, ...rest] = line.split(',');
          return [field.trim(), rest.join(',').trim()];
        }),
      ),
    );
  }

  if (lines.length >= 2) {
    const headers = lines[0].split(',').map((item) => item.trim());
    const values = lines[1].split(',').map((item) => item.trim());
    return parseObjectToPatch(
      headers.reduce<Record<string, string>>((accumulator, header, index) => {
        accumulator[header] = values[index] ?? '';
        return accumulator;
      }, {}),
    );
  }

  throw new Error('CSV import expects either a field/value table or a header row plus one data row.');
}

function parseGeoJson(content: string) {
  const parsed = JSON.parse(content) as {
    type?: string;
    properties?: Record<string, unknown>;
    features?: Array<{ properties?: Record<string, unknown> }>;
  };

  const properties =
    parsed.type === 'FeatureCollection'
      ? parsed.features?.[0]?.properties ?? {}
      : parsed.type === 'Feature'
        ? parsed.properties ?? {}
        : {};

  return parseObjectToPatch(properties);
}

export function parseImportedStudyFile(fileName: string, content: string): ImportedStudyPayload {
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.json')) {
    const parsed = JSON.parse(content) as Partial<ScenarioInput> & {
      scenario?: Partial<ScenarioInput>;
      patch?: Partial<ScenarioInput>;
      name?: string;
    };
    const patch = parseObjectToPatch(parsed.scenario ?? parsed.patch ?? parsed);
    const metadata = buildImportMetadata(fileName, 'json', 'Imported JSON study package.');

    return {
      name: parsed.name,
      patch: {
        ...patch,
        ...metadata,
        siteContext: (parsed.siteContext as string | undefined) ?? 'Imported study package',
        sourceSummary:
          (parsed.sourceSummary as string | undefined) ??
          'Study values were imported from a JSON package supplied by the user.',
      },
      message: `Imported JSON study package: ${fileName}`,
    };
  }

  if (lower.endsWith('.csv')) {
    const patch = parseCsv(content);
    const metadata = buildImportMetadata(fileName, 'csv', 'Imported CSV assumptions table.');

    return {
      patch: {
        ...patch,
        ...metadata,
        siteContext: 'Imported CSV corridor assumptions',
        sourceSummary: 'Study values were imported from a CSV assumptions table supplied by the user.',
      },
      message: `Imported CSV assumptions: ${fileName}`,
    };
  }

  if (lower.endsWith('.geojson') || lower.endsWith('.json.geojson')) {
    const patch = parseGeoJson(content);
    const metadata = buildImportMetadata(fileName, 'geojson', 'Imported GeoJSON corridor package.');

    return {
      patch: {
        ...patch,
        ...metadata,
        siteContext: 'Imported GeoJSON corridor package',
        sourceSummary:
          'Study values were imported from GeoJSON properties. Geometry ingestion is scaffolded now and can be upgraded into full spatial overlays next.',
      },
      message: `Imported GeoJSON corridor package: ${fileName}`,
    };
  }

  throw new Error('Unsupported file type. Use JSON, CSV, or GeoJSON.');
}
