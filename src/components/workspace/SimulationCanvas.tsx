import { type PointerEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import type { ScenarioInput, SimulationResult } from '@/simulation/types';
import { formatLabel } from '@/utils/format';

type SimulationCanvasProps = {
  scenario: ScenarioInput;
  result: SimulationResult;
  onScenarioChange?: (patch: Partial<ScenarioInput>) => void;
};

const statusColorMap = {
  viable: '#67e8f9',
  borderline: '#fbbf24',
  'high-risk': '#fb923c',
  failed: '#f87171',
};

type DragMode = null | { type: 'load' } | { type: 'support' } | { type: 'clearance' };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const canvas = {
  width: 1200,
  height: 680,
  startX: 140,
  endX: 1060,
  waterTopY: 360,
  waterBottomY: 620,
};

export function SimulationCanvas({ scenario, result, onScenarioChange }: SimulationCanvasProps) {
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const isBlankCanvas = scenario.studyState === 'blank-canvas';
  const corridorWidth = canvas.endX - canvas.startX;
  const normalizedChannelWidth = clamp((scenario.channelWidthM - 70) / (320 - 70), 0, 1);
  const channelVisualWidth = 420 + normalizedChannelWidth * 360;
  const channelLeft = canvas.width / 2 - channelVisualWidth / 2;
  const channelRight = canvas.width / 2 + channelVisualWidth / 2;
  const supportSpacing = corridorWidth / (scenario.supportCount + 1);
  const supportBiasOffset = (scenario.supportSpacingBias - 5) * 16;
  const alignmentOffset =
    scenario.alignmentStrategy === 'direct' ? 0 : scenario.alignmentStrategy === 'offset' ? 26 : 44;
  const waterSurfaceY = canvas.waterTopY + Math.max(0, 26 - scenario.waterDepthM * 0.6);
  const deckY = clamp(waterSurfaceY - scenario.navigationClearanceM * 5.1, 120, 310);
  const loadX = canvas.startX + (scenario.liveLoadPosition / 100) * corridorWidth;
  const clearanceHandleX = canvas.width / 2 + 84;
  const foundationGlow =
    scenario.foundationStrategy === 'shallow'
      ? 'rgba(248, 113, 113, 0.28)'
      : scenario.foundationStrategy === 'deep-pile'
        ? 'rgba(103, 232, 249, 0.24)'
        : 'rgba(251, 191, 36, 0.24)';
  const vesselScale = 0.82 + scenario.vesselTraffic * 0.06;

  const supports = Array.from({ length: scenario.supportCount }, (_, index) => {
    const centerPull = index - (scenario.supportCount - 1) / 2;
    return clamp(canvas.startX + supportSpacing * (index + 1) + centerPull * supportBiasOffset * 0.45, canvas.startX + 40, canvas.endX - 40);
  });
  const riskColor = statusColorMap[result.status];
  const currentField = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => ({
        y: waterSurfaceY + 28 + index * 34,
        drift: 16 + scenario.currentVelocity * 10 + index * 2,
      })),
    [scenario.currentVelocity, waterSurfaceY],
  );

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragMode || !onScenarioChange) {
      return;
    }

    const svg = event.currentTarget;
    const bounds = svg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * canvas.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * canvas.height;

    if (dragMode.type === 'load') {
      const liveLoadPosition = clamp(Math.round(((x - canvas.startX) / corridorWidth) * 100), 0, 100);
      onScenarioChange({ liveLoadPosition });
      return;
    }

    if (dragMode.type === 'support') {
      const supportSpacingBias = clamp(Math.round(((x - canvas.width / 2) / 44) + 5), 1, 10);
      onScenarioChange({ supportSpacingBias });
      return;
    }

    const navigationClearanceM = clamp(Math.round((waterSurfaceY - y) / 5.1), 12, 65);
    onScenarioChange({ navigationClearanceM });
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,14,31,0.96),rgba(4,8,18,0.96))] shadow-[0_18px_80px_rgba(0,0,0,0.36)]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Crossing Canvas</p>
          <h2 className="mt-2 font-display text-2xl text-zinc-50">
            {isBlankCanvas ? 'Blank Setup Canvas' : 'Live Corridor Envelope'}
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300">
          {isBlankCanvas ? 'Blank study · define corridor to activate' : `${formatLabel(scenario.waterwayType)} corridor · drag handles enabled`}
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 xl:p-6">
          <svg
            viewBox={`0 0 ${canvas.width} ${canvas.height}`}
            className="h-[clamp(380px,calc(100vh-15rem),1080px)] w-full cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragMode(null)}
            onPointerLeave={() => setDragMode(null)}
          >
            <defs>
              <linearGradient id="deckGlow" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.24" />
                <stop offset="50%" stopColor={riskColor} stopOpacity="0.92" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="waterGlow" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
                <stop offset="100%" stopColor="rgba(15,23,42,0.92)" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width={canvas.width} height={canvas.height} fill="#07111f" />
            {Array.from({ length: 11 }).map((_, index) => (
              <line
                key={`grid-x-${index}`}
                x1={0}
                x2={canvas.width}
                y1={72 + index * 46}
                y2={72 + index * 46}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 8"
              />
            ))}
            {Array.from({ length: 13 }).map((_, index) => (
              <line
                key={`grid-y-${index}`}
                x1={72 + index * 88}
                x2={72 + index * 88}
                y1={20}
                y2={canvas.height - 30}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 10"
              />
            ))}

            {isBlankCanvas ? (
              <>
                <rect
                  x="150"
                  y="120"
                  width="900"
                  height="420"
                  rx="32"
                  fill="rgba(8,17,33,0.52)"
                  stroke="rgba(103,232,249,0.24)"
                  strokeWidth="2"
                  strokeDasharray="12 12"
                />
                <line x1="240" x2="960" y1="280" y2="280" stroke="rgba(255,255,255,0.14)" strokeDasharray="10 10" />
                <line x1="240" x2="960" y1="390" y2="390" stroke="rgba(255,255,255,0.14)" strokeDasharray="10 10" />
                <line x1="360" x2="360" y1="170" y2="500" stroke="rgba(255,255,255,0.12)" strokeDasharray="10 10" />
                <line x1="600" x2="600" y1="170" y2="500" stroke="rgba(255,255,255,0.12)" strokeDasharray="10 10" />
                <line x1="840" x2="840" y1="170" y2="500" stroke="rgba(255,255,255,0.12)" strokeDasharray="10 10" />

                <text x="600" y="210" fill="rgba(255,255,255,0.86)" fontSize="44" textAnchor="middle">
                  Blank corridor setup
                </text>
                <text x="600" y="252" fill="rgba(161,161,170,0.9)" fontSize="18" textAnchor="middle">
                  Define the waterway, span, clearance, and support strategy before the bridge is drawn.
                </text>

                <text x="225" y="320" fill="rgba(103,232,249,0.92)" fontSize="16" letterSpacing="2">
                  01 WATERWAY TYPE
                </text>
                <text x="225" y="348" fill="rgba(161,161,170,0.9)" fontSize="15">
                  Choose river, estuary, harbor, or tidal inlet.
                </text>

                <text x="225" y="410" fill="rgba(103,232,249,0.92)" fontSize="16" letterSpacing="2">
                  02 CORRIDOR GEOMETRY
                </text>
                <text x="225" y="438" fill="rgba(161,161,170,0.9)" fontSize="15">
                  Set span distance, channel width, depth, and navigation clearance.
                </text>

                <text x="225" y="500" fill="rgba(103,232,249,0.92)" fontSize="16" letterSpacing="2">
                  03 STRUCTURAL STRATEGY
                </text>
                <text x="225" y="528" fill="rgba(161,161,170,0.9)" fontSize="15">
                  Pick system, supports, and foundations to activate the live study view.
                </text>

                <text x="42" y="40" fill="rgba(255,255,255,0.52)" fontSize="12" letterSpacing="3">
                  SETUP MODE
                </text>
                <text x="42" y="650" fill="rgba(255,255,255,0.4)" fontSize="11" letterSpacing="2">
                  OPEN CONTROLS AND DEFINE THE CORRIDOR TO MATERIALIZE THE CROSSING
                </text>
              </>
            ) : (
              <>
                <path
                  d={`M 0 ${canvas.height} L 0 ${waterSurfaceY - 46} L ${channelLeft - 120} ${waterSurfaceY - 70} L ${channelLeft} ${waterSurfaceY} L ${channelLeft + 48} ${canvas.waterBottomY} L 0 ${canvas.height} Z`}
                  fill="rgba(64,74,86,0.84)"
                />
                <path
                  d={`M ${canvas.width} ${canvas.height} L ${canvas.width} ${waterSurfaceY - 62} L ${channelRight + 120} ${waterSurfaceY - 82} L ${channelRight} ${waterSurfaceY} L ${channelRight - 48} ${canvas.waterBottomY} L ${canvas.width} ${canvas.height} Z`}
                  fill="rgba(64,74,86,0.84)"
                />

                <rect
                  x={channelLeft}
                  y={waterSurfaceY}
                  width={channelVisualWidth}
                  height={canvas.waterBottomY - waterSurfaceY}
                  rx="28"
                  fill="url(#waterGlow)"
                  stroke="rgba(103,232,249,0.24)"
                  strokeWidth="2"
                />

                {currentField.map((flow, index) => (
                  <path
                    key={`flow-${index}`}
                    d={`M ${channelLeft + 22} ${flow.y} C ${channelLeft + 140} ${flow.y - 12}, ${channelLeft + 230} ${flow.y + 12}, ${channelLeft + flow.drift * 12} ${flow.y} S ${channelRight - 120} ${flow.y - 14}, ${channelRight - 18} ${flow.y}`}
                    fill="none"
                    stroke="rgba(125,211,252,0.35)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                ))}

                <line
                  x1={channelLeft}
                  x2={channelRight}
                  y1={waterSurfaceY - 34}
                  y2={waterSurfaceY - 34}
                  stroke="rgba(255,255,255,0.36)"
                  strokeDasharray="8 8"
                />
                <text x={canvas.width / 2} y={waterSurfaceY - 42} fill="rgba(255,255,255,0.68)" fontSize="13" textAnchor="middle" letterSpacing="3">
                  CHANNEL WIDTH {scenario.channelWidthM}M
                </text>

                <motion.line
                  x1={canvas.startX}
                  y1={deckY + alignmentOffset}
                  x2={canvas.endX}
                  y2={deckY - alignmentOffset}
                  stroke="url(#deckGlow)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  animate={{ y1: deckY + alignmentOffset, y2: deckY - alignmentOffset }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />

                {supports.map((position, index) => (
                  <motion.g
                    key={`${position}-${index}`}
                    animate={{ x: position - 12 }}
                    initial={false}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <rect x="-18" y={canvas.waterBottomY - 10} width="52" height="16" rx="8" fill={foundationGlow} />
                    <rect
                      x="0"
                      y={deckY - Math.abs(alignmentOffset) * 0.15}
                      width="22"
                      height={canvas.waterBottomY - deckY + Math.abs(alignmentOffset) * 0.15}
                      rx="8"
                      fill="rgba(103,232,249,0.16)"
                    />
                    <rect
                      x="6"
                      y={deckY + 8 - Math.abs(alignmentOffset) * 0.15}
                      width="10"
                      height={canvas.waterBottomY - deckY - 8 + Math.abs(alignmentOffset) * 0.15}
                      rx="5"
                      fill={riskColor}
                    />
                    <circle
                      cx="11"
                      cy={deckY - Math.abs(alignmentOffset) * 0.15}
                      r="9"
                      fill="rgba(255,255,255,0.05)"
                      stroke="rgba(255,255,255,0.35)"
                      onPointerDown={() => setDragMode({ type: 'support' })}
                    />
                  </motion.g>
                ))}

                <motion.circle
                  cx={loadX}
                  cy={deckY - 14}
                  r={38 + result.derived.environmentalStress * 0.18}
                  fill={riskColor}
                  opacity="0.09"
                  animate={{ cx: loadX, cy: deckY - 14 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
                <motion.circle
                  cx={loadX}
                  cy={deckY - 18}
                  r={20 + scenario.loadLevel}
                  fill="rgba(251, 191, 36, 0.12)"
                  stroke="rgba(251, 191, 36, 0.85)"
                  strokeWidth="2"
                  animate={{ cx: loadX, cy: deckY - 18 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onPointerDown={() => setDragMode({ type: 'load' })}
                />

                <motion.path
                  d={`M ${canvas.startX} ${deckY + alignmentOffset} Q ${loadX} ${deckY + result.derived.navigationRisk * 0.28} ${canvas.endX} ${deckY - alignmentOffset}`}
                  fill="none"
                  stroke={riskColor}
                  strokeOpacity="0.45"
                  strokeWidth="2.5"
                  strokeDasharray="7 8"
                  animate={{
                    d: `M ${canvas.startX} ${deckY + alignmentOffset} Q ${loadX} ${deckY + result.derived.navigationRisk * 0.28} ${canvas.endX} ${deckY - alignmentOffset}`,
                  }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />

                <line
                  x1={clearanceHandleX}
                  x2={clearanceHandleX}
                  y1={deckY}
                  y2={waterSurfaceY}
                  stroke="rgba(255,255,255,0.45)"
                  strokeDasharray="8 8"
                />
                <circle
                  cx={clearanceHandleX}
                  cy={deckY}
                  r="11"
                  fill="rgba(34,211,238,0.16)"
                  stroke="rgba(103,232,249,0.9)"
                  strokeWidth="2"
                  onPointerDown={() => setDragMode({ type: 'clearance' })}
                />
                <text x={clearanceHandleX + 20} y={(deckY + waterSurfaceY) / 2 - 6} fill="rgba(255,255,255,0.72)" fontSize="12" letterSpacing="2">
                  CLEARANCE {scenario.navigationClearanceM}M
                </text>

                <g transform={`translate(${canvas.width / 2 - 56 * vesselScale}, ${waterSurfaceY + 76}) scale(${vesselScale})`}>
                  <path d="M 0 36 L 22 20 H 112 L 130 36 L 112 52 H 22 Z" fill="rgba(15,23,42,0.88)" stroke="rgba(255,255,255,0.18)" />
                  <rect x="38" y="4" width="36" height="18" rx="4" fill="rgba(148,163,184,0.7)" />
                  <rect x="78" y="10" width="18" height="12" rx="3" fill="rgba(148,163,184,0.7)" />
                </g>

                <text x="42" y="34" fill="rgba(255,255,255,0.52)" fontSize="12" letterSpacing="3">
                  LIVE LOAD FIELD
                </text>
                <text x="860" y="40" fill="rgba(255,255,255,0.52)" fontSize="12" letterSpacing="3">
                  FEASIBILITY {Math.round(result.feasibilityScore)}
                </text>
                <text x="42" y="650" fill="rgba(255,255,255,0.44)" fontSize="11" letterSpacing="2">
                  FOUNDATION {formatLabel(scenario.foundationStrategy)}
                </text>
                <text x="920" y="650" fill="rgba(255,255,255,0.44)" fontSize="11" letterSpacing="2">
                  ALIGNMENT {formatLabel(scenario.alignmentStrategy)}
                </text>
                <text x="42" y="60" fill="rgba(255,255,255,0.35)" fontSize="11" letterSpacing="2">
                  DRAG LOAD MARKER, PIER NODE, OR CLEARANCE HANDLE
                </text>
              </>
            )}
          </svg>
        </div>

        {isBlankCanvas ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['Waterway', 'Select the corridor type and start shaping the crossing environment.'],
              ['Geometry', 'Set span, channel width, water depth, and clearance to generate the live study.'],
              ['Structure', 'Choose the bridge system and support concept once the corridor is defined.'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Span demand', result.derived.spanDemand],
              ['Hydraulic demand', result.derived.hydraulicDemand],
              ['Clearance adequacy', result.derived.clearanceAdequacy],
              ['Scour exposure', result.derived.scourExposure],
              ['Support coverage', result.derived.supportCoverage],
              ['Material capacity', result.derived.materialCapacity],
              ['Load stress', result.derived.loadStress],
              ['Foundation demand', result.derived.foundationDemand],
              ['Environmental stress', result.derived.environmentalStress],
              ['Navigation risk', result.derived.navigationRisk],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</span>
                  <span className="font-display text-2xl text-zinc-100">{value}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-zinc-900">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ background: `linear-gradient(90deg, rgba(103,232,249,0.85), ${riskColor})` }}
                    initial={false}
                    animate={{ width: `${Math.min(Number(value), 100)}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
