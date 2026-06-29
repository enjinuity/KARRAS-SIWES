type TerrainType = 'flat' | 'rocky' | 'wetland' | 'valley';

const terrainShapeMap: Record<TerrainType, [number, number, number, number, number]> = {
  flat: [208, 208, 208, 208, 208],
  rocky: [214, 196, 210, 184, 208],
  wetland: [220, 226, 222, 230, 224],
  valley: [180, 220, 246, 220, 180],
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function getTerrainProfilePreset(
  terrainType: TerrainType,
  terrainSeverity: number,
): [number, number, number, number, number] {
  const base = terrainShapeMap[terrainType];
  const severityOffset = (terrainSeverity - 5) * 4;

  return base.map((value, index) => {
    const centerWeight = Math.abs(index - 2) === 0 ? 1 : Math.abs(index - 2) === 1 ? 0.65 : 0.4;
    return clamp(Math.round(value + severityOffset * centerWeight), 150, 260);
  }) as [number, number, number, number, number];
}

export function normalizeTerrainProfile(
  terrainType: TerrainType,
  terrainSeverity: number,
  terrainProfile?: number[],
): [number, number, number, number, number] {
  const fallback = getTerrainProfilePreset(terrainType, terrainSeverity);

  if (!terrainProfile || terrainProfile.length !== 5) {
    return fallback;
  }

  return terrainProfile.map((value, index) => clamp(Math.round(value ?? fallback[index]), 150, 260)) as [
    number,
    number,
    number,
    number,
    number,
  ];
}

export function deriveTerrainSeverity(terrainProfile: number[]) {
  const relief = Math.max(...terrainProfile) - Math.min(...terrainProfile);
  return clamp(Math.round(relief / 10), 1, 10);
}
