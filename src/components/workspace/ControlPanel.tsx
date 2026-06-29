import type { ScenarioInput } from '@/simulation/types';
import { SliderField } from '@/components/workspace/SliderField';
import { formatLabel } from '@/utils/format';

type ControlPanelProps = {
  scenario: ScenarioInput;
  onScenarioChange: (patch: Partial<ScenarioInput>) => void;
  onCreateVariant: () => void;
};

const waterwayOptions = ['river', 'estuary', 'harbor', 'tidal-inlet'] as const;
const materialOptions = ['steel', 'reinforced-concrete', 'composite'] as const;
const bridgeSystemOptions = ['girder', 'box', 'cable-stayed'] as const;
const foundationOptions = ['shallow', 'deep-pile', 'caisson'] as const;
const alignmentOptions = ['direct', 'offset', 'stepped'] as const;

const formatNumber = (value: number, digits = 0) =>
  digits === 0 ? `${Math.round(value)}` : value.toFixed(digits);

type FramingGuidance = {
  fit: string;
  driver: string;
  caution: string;
  confidence: 'standard' | 'watch';
};

const waterwayGuidance: Record<ScenarioInput['waterwayType'], FramingGuidance> = {
  river: {
    fit: 'Best for inland crossings where hydraulic behavior matters more than full maritime navigation envelopes.',
    driver: 'Usually favors balanced span/support concepts with moderate navigation allowances.',
    caution: 'Do not use a river framing if the corridor is really harbor-fed, tidal, or navigation-controlled.',
    confidence: 'standard',
  },
  estuary: {
    fit: 'Useful where mixed river and tidal behavior creates wider environmental and foundation uncertainty.',
    driver: 'Pushes the screen toward resilience, scour awareness, and stronger substructure assumptions.',
    caution: 'Expect flood, tidal, and approach-condition assumptions to dominate faster than in a simple river corridor.',
    confidence: 'watch',
  },
  harbor: {
    fit: 'Best for navigation-led crossings where clearance and pier obstruction discipline are major decision drivers.',
    driver: 'Rewards cleaner navigation envelopes, better clearance, and lower in-channel interference.',
    caution: 'Harbor framing can make short, support-heavy concepts look worse quickly because navigation rules the corridor.',
    confidence: 'standard',
  },
  'tidal-inlet': {
    fit: 'Useful for coastal crossings where water movement, flood exposure, and resilience posture dominate early screening.',
    driver: 'Pushes the concept toward stronger hydraulic margins and more conservative foundation choices.',
    caution: 'This is usually the most punishing framing; use it only when the site actually behaves like a tidal inlet.',
    confidence: 'watch',
  },
};

const bridgeSystemGuidance: Record<ScenarioInput['bridgeSystem'], FramingGuidance> = {
  girder: {
    fit: 'Best for straightforward crossings where construction simplicity and familiar detailing matter most.',
    driver: 'Works well when spans stay moderate and the corridor does not demand extreme clearance or visual slenderness.',
    caution: 'Starts to lose credibility when the span stretches too far or when navigation constraints push for fewer supports.',
    confidence: 'standard',
  },
  box: {
    fit: 'Useful when torsional stiffness, deck cleanliness, and a more controlled long deck form matter.',
    driver: 'Usually supports cleaner geometry and better stiffness for more demanding crossing envelopes.',
    caution: 'Can look efficient in the screen, but fabrication and construction complexity still need to be respected.',
    confidence: 'standard',
  },
  'cable-stayed': {
    fit: 'Best when the concept needs long clear spans with fewer in-water supports and strong visual structure.',
    driver: 'Rewards high-clearance, navigation-sensitive corridors where the deck needs major span support without many piers.',
    caution: 'Do not default to this as a prestige choice; it raises system complexity, staging burden, and design discipline quickly.',
    confidence: 'watch',
  },
};

const materialGuidance: Record<ScenarioInput['materialClass'], FramingGuidance> = {
  steel: {
    fit: 'Useful where span efficiency and lighter superstructure weight help the corridor.',
    driver: 'Supports longer spans and cleaner structural reserve for demanding navigation or support-limited concepts.',
    caution: 'Expect durability, detailing, and lifecycle considerations to stay in view, especially in aggressive water environments.',
    confidence: 'standard',
  },
  'reinforced-concrete': {
    fit: 'Best for robust, familiar systems where mass and durability are acceptable trade-offs.',
    driver: 'Often fits shorter to moderate spans and concepts where simplicity matters more than maximum span efficiency.',
    caution: 'The screen should treat this cautiously once span demand climbs because weight and system demand increase quickly.',
    confidence: 'watch',
  },
  composite: {
    fit: 'Useful when the concept needs a balance between span efficiency, stiffness, and practical constructability.',
    driver: 'Often supports strong screening performance across mixed corridor conditions without going fully exotic.',
    caution: 'Composite systems can mask detailing and staging complexity if the team reads only the score and not the construction posture.',
    confidence: 'standard',
  },
};

const foundationGuidance: Record<ScenarioInput['foundationStrategy'], FramingGuidance> = {
  shallow: {
    fit: 'Best where water depth, scour exposure, and bank condition are all relatively forgiving.',
    driver: 'Can keep the concept simple and efficient when the corridor is stable and not hydraulically punishing.',
    caution: 'Be careful using this in deeper or higher-scour water because the screen may become optimistic faster than the site would allow.',
    confidence: 'watch',
  },
  'deep-pile': {
    fit: 'Useful as the workhorse concept when the site needs dependable vertical support without the heaviest foundation posture.',
    driver: 'Balances hydraulic resilience with constructability across many medium-demand corridors.',
    caution: 'Still needs scrutiny when scour, seismic, or water depth rise together; it is not a universal safe answer.',
    confidence: 'standard',
  },
  caisson: {
    fit: 'Best for heavier demands where depth, loading, or navigation pressure justify a stronger foundation concept.',
    driver: 'Supports more severe hydraulic and structural envelopes with higher base robustness.',
    caution: 'This should be a deliberate choice, not a default; it raises construction burden and can hide cost escalation in an early screen.',
    confidence: 'watch',
  },
};

const alignmentGuidance: Record<ScenarioInput['alignmentStrategy'], FramingGuidance> = {
  direct: {
    fit: 'Best when the site can support the clearest crossing path with minimal geometric compromise.',
    driver: 'Usually simplifies loads, support layout, and approach logic, which helps the concept stay legible.',
    caution: 'Only use this if the corridor really allows it; forcing direct alignment through a constrained channel can make the rest of the concept unrealistic.',
    confidence: 'standard',
  },
  offset: {
    fit: 'Useful when the corridor needs to negotiate bank conditions, approach limitations, or channel protection zones.',
    driver: 'Can preserve site practicality when a direct crossing would create worse foundation or right-of-way problems.',
    caution: 'Offset geometry can quietly add structural and load complexity, so it should not be treated as a free move.',
    confidence: 'watch',
  },
  stepped: {
    fit: 'Best when the corridor cannot be resolved with a simple straight move and requires staged or segmented logic.',
    driver: 'Helps model awkward site constraints that break the crossing into more managed directional decisions.',
    caution: 'This is usually the most complexity-heavy alignment posture and should be justified by real corridor constraints.',
    confidence: 'watch',
  },
};

const studyBasisMessage = {
  'curated-preset':
    'This study starts from a curated sample package. Keep the screening direction, but replace sample assumptions with corridor-specific data before trusting the option as a lead recommendation.',
  'manual-estimate':
    'This study is still being driven by manual estimates. Use these controls to shape the option, then import corridor or survey data before treating the screen as decision-grade.',
  'user-import':
    'This study is being driven by an imported package. Keep checking units, datum, and source quality as you adjust the concept around the uploaded basis.',
} as const;

export function ControlPanel({
  scenario,
  onScenarioChange,
  onCreateVariant,
}: ControlPanelProps) {
  const selectedWaterwayGuidance = waterwayGuidance[scenario.waterwayType];
  const selectedBridgeSystemGuidance = bridgeSystemGuidance[scenario.bridgeSystem];
  const selectedMaterialGuidance = materialGuidance[scenario.materialClass];
  const selectedFoundationGuidance = foundationGuidance[scenario.foundationStrategy];
  const selectedAlignmentGuidance = alignmentGuidance[scenario.alignmentStrategy];

  return (
    <section className="space-y-5 rounded-[28px] border border-white/10 bg-zinc-950/70 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.32)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Planner Controls</p>
          <h2 className="mt-2 font-display text-2xl text-zinc-50">{scenario.name}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            {scenario.studyState === 'blank-canvas'
              ? 'This study is still a blank setup canvas. Define corridor geometry and waterway assumptions to materialize the crossing.'
              : 'Tune the crossing corridor, navigation envelope, water behavior, and structural strategy the way an early-stage bridge planner would.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateVariant}
          className="rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-400/20"
        >
          Save Variant
        </button>
      </div>

      <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Data Basis</p>
        <h3 className="mt-2 font-display text-2xl text-zinc-50">{scenario.siteContext}</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{scenario.sourceSummary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
            Origin: {scenario.dataOrigin.replace(/-/g, ' ')}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
            Confidence: {scenario.sourceConfidence.replace(/-/g, ' ')}
          </span>
          {scenario.presetId ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
              Preset: {scenario.presetId}
            </span>
          ) : null}
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Editing posture</p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{studyBasisMessage[scenario.dataOrigin]}</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Assumptions And Sources</p>
        <div className="space-y-3">
          {scenario.studyAssumptions.map((assumption) => (
            <div key={assumption.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-100">{assumption.label}</span>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
                  {assumption.value}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500">{assumption.basis}</p>
            </div>
          ))}
          {scenario.sourceReferences.length > 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Source References</p>
              <div className="mt-3 space-y-3">
                {scenario.sourceReferences.map((source) => (
                  <div key={source.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-sm text-zinc-100">{source.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {source.owner} · {source.type.replace(/-/g, ' ')}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{source.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Scenario Name</span>
        <input
          value={scenario.name}
          onChange={(event) => onScenarioChange({ name: event.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60"
          placeholder="Name this option"
        />
      </label>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Project Framing</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Waterway Type</span>
            <select
              value={scenario.waterwayType}
              onChange={(event) => onScenarioChange({ waterwayType: event.target.value as ScenarioInput['waterwayType'] })}
              className="w-full bg-transparent text-sm text-zinc-100 outline-none"
            >
              {waterwayOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-950">
                  {formatLabel(option)}
                </option>
              ))}
            </select>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Current Framing</p>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    selectedWaterwayGuidance.confidence === 'standard'
                      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                      : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                  }`}
                >
                  {selectedWaterwayGuidance.confidence === 'standard' ? 'Typical' : 'Needs care'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{selectedWaterwayGuidance.fit}</p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">Driver: {selectedWaterwayGuidance.driver}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Caution: {selectedWaterwayGuidance.caution}</p>
            </div>
          </label>

          <label className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Bridge System</span>
            <select
              value={scenario.bridgeSystem}
              onChange={(event) => onScenarioChange({ bridgeSystem: event.target.value as ScenarioInput['bridgeSystem'] })}
              className="w-full bg-transparent text-sm text-zinc-100 outline-none"
            >
              {bridgeSystemOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-950">
                  {formatLabel(option)}
                </option>
              ))}
            </select>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">System Posture</p>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    selectedBridgeSystemGuidance.confidence === 'standard'
                      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                      : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                  }`}
                >
                  {selectedBridgeSystemGuidance.confidence === 'standard' ? 'Typical' : 'Needs care'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{selectedBridgeSystemGuidance.fit}</p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">Driver: {selectedBridgeSystemGuidance.driver}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Caution: {selectedBridgeSystemGuidance.caution}</p>
            </div>
          </label>

          <label className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Material Class</span>
            <select
              value={scenario.materialClass}
              onChange={(event) =>
                onScenarioChange({ materialClass: event.target.value as ScenarioInput['materialClass'] })
              }
              className="w-full bg-transparent text-sm text-zinc-100 outline-none"
            >
              {materialOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-950">
                  {formatLabel(option)}
                </option>
              ))}
            </select>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Material Posture</p>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    selectedMaterialGuidance.confidence === 'standard'
                      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                      : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                  }`}
                >
                  {selectedMaterialGuidance.confidence === 'standard' ? 'Typical' : 'Needs care'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{selectedMaterialGuidance.fit}</p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">Driver: {selectedMaterialGuidance.driver}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Caution: {selectedMaterialGuidance.caution}</p>
            </div>
          </label>

          <label className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Foundation</span>
            <select
              value={scenario.foundationStrategy}
              onChange={(event) =>
                onScenarioChange({ foundationStrategy: event.target.value as ScenarioInput['foundationStrategy'] })
              }
              className="w-full bg-transparent text-sm text-zinc-100 outline-none"
            >
              {foundationOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-950">
                  {formatLabel(option)}
                </option>
              ))}
            </select>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Foundation Posture</p>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    selectedFoundationGuidance.confidence === 'standard'
                      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                      : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                  }`}
                >
                  {selectedFoundationGuidance.confidence === 'standard' ? 'Typical' : 'Needs care'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{selectedFoundationGuidance.fit}</p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">Driver: {selectedFoundationGuidance.driver}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Caution: {selectedFoundationGuidance.caution}</p>
            </div>
          </label>

          <label className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Alignment</span>
            <select
              value={scenario.alignmentStrategy}
              onChange={(event) =>
                onScenarioChange({ alignmentStrategy: event.target.value as ScenarioInput['alignmentStrategy'] })
              }
              className="w-full bg-transparent text-sm text-zinc-100 outline-none"
            >
              {alignmentOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-950">
                  {formatLabel(option)}
                </option>
              ))}
            </select>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Alignment Posture</p>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    selectedAlignmentGuidance.confidence === 'standard'
                      ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
                      : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                  }`}
                >
                  {selectedAlignmentGuidance.confidence === 'standard' ? 'Typical' : 'Needs care'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{selectedAlignmentGuidance.fit}</p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">Driver: {selectedAlignmentGuidance.driver}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Caution: {selectedAlignmentGuidance.caution}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Corridor Geometry</p>
        <div className="space-y-3">
          <SliderField
            label="Crossing Span (m)"
            min={90}
            max={420}
            step={5}
            value={scenario.spanDistanceM}
            displayValue={`${formatNumber(scenario.spanDistanceM)} m`}
            hint="Longer spans reduce the number of in-water supports you need, but they raise structural demand quickly."
            recommendedMin={120}
            recommendedMax={260}
            bandLabel="120-260 m typical concept screen"
            bandHint="Below this band, the crossing may be over-supported for the corridor. Above it, the concept starts demanding longer-span systems and tighter structural justification."
            onChange={(value) => onScenarioChange({ spanDistanceM: value })}
          />
          <SliderField
            label="Navigation Channel Width (m)"
            min={70}
            max={320}
            step={5}
            value={scenario.channelWidthM}
            displayValue={`${formatNumber(scenario.channelWidthM)} m`}
            hint="Wider channels increase crossing length and often make pier placement more sensitive."
            recommendedMin={90}
            recommendedMax={180}
            bandLabel="90-180 m planning corridor"
            bandHint="Outside this band, check whether the study is still representing a single crossing corridor or a more complex channel condition."
            onChange={(value) => onScenarioChange({ channelWidthM: value })}
          />
          <SliderField
            label="Water Depth (m)"
            min={6}
            max={42}
            step={1}
            value={scenario.waterDepthM}
            displayValue={`${formatNumber(scenario.waterDepthM)} m`}
            hint="Deeper water raises foundation difficulty, construction effort, and navigation expectations."
            recommendedMin={8}
            recommendedMax={20}
            bandLabel="8-20 m common concept depth band"
            bandHint="Above this band, shallow foundations and simple staging assumptions usually become much less credible."
            onChange={(value) => onScenarioChange({ waterDepthM: value })}
          />
          <SliderField
            label="Navigation Clearance (m)"
            min={12}
            max={65}
            step={1}
            value={scenario.navigationClearanceM}
            displayValue={`${formatNumber(scenario.navigationClearanceM)} m`}
            hint="Clearance is the vertical envelope available above water for vessel passage beneath the bridge."
            recommendedMin={20}
            recommendedMax={50}
            bandLabel="20-50 m concept navigation range"
            bandHint="Push this higher only when vessel profile or channel policy actually demands it, because clearance climbs quickly into structural cost and approach geometry."
            onChange={(value) => onScenarioChange({ navigationClearanceM: value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Hydraulic Conditions</p>
        <div className="space-y-3">
          <SliderField
            label="Current Velocity (m/s)"
            min={0.8}
            max={5.2}
            step={0.1}
            value={scenario.currentVelocity}
            displayValue={`${formatNumber(scenario.currentVelocity, 1)} m/s`}
            hint="Current speed drives scour, construction exposure, and substructure demand."
            recommendedMin={1.0}
            recommendedMax={2.8}
            bandLabel="1.0-2.8 m/s screening flow"
            bandHint="Higher velocities usually need stronger scour assumptions and more conservative foundation choices."
            onChange={(value) => onScenarioChange({ currentVelocity: value })}
          />
          <SliderField
            label="Vessel Traffic"
            min={1}
            max={10}
            value={scenario.vesselTraffic}
            displayValue={`${formatNumber(scenario.vesselTraffic)}/10`}
            hint="Higher traffic means tighter tolerance for pier obstruction and inadequate clearance."
            recommendedMin={2}
            recommendedMax={7}
            bandLabel="2-7 routine movement band"
            bandHint="Values near the top of the scale imply a corridor where navigation protection and clearance discipline become first-order drivers."
            onChange={(value) => onScenarioChange({ vesselTraffic: value })}
          />
          <SliderField
            label="Bank Stability"
            min={1}
            max={10}
            value={scenario.bankStability}
            displayValue={`${formatNumber(scenario.bankStability)}/10`}
            hint="This acts as a concept-stage proxy for how reliable the banks and approaches are under load and erosion."
            recommendedMin={5}
            recommendedMax={9}
            bandLabel="5-9 preferred approach condition"
            bandHint="Below this band, the banks are weak enough that alignment, abutment, and foundation assumptions need extra scrutiny."
            onChange={(value) => onScenarioChange({ bankStability: value })}
          />
          <SliderField
            label="Scour Risk"
            min={1}
            max={10}
            value={scenario.scourRisk}
            displayValue={`${formatNumber(scenario.scourRisk)}/10`}
            hint="Higher scour risk raises the burden on the foundation concept and long-term durability."
            recommendedMin={1}
            recommendedMax={5}
            bandLabel="1-5 manageable scour band"
            bandHint="Once the study moves above this band, deep foundations and more conservative durability assumptions should start dominating the concept."
            onChange={(value) => onScenarioChange({ scourRisk: value })}
          />
          <SliderField
            label="Flood Exposure"
            min={1}
            max={10}
            value={scenario.floodExposure}
            displayValue={`${formatNumber(scenario.floodExposure)}/10`}
            hint="Flood exposure reflects seasonal and extreme-event water level variability across the corridor."
            recommendedMin={2}
            recommendedMax={6}
            bandLabel="2-6 manageable flood band"
            bandHint="Higher exposure is a signal to review freeboard, resilience posture, and whether this concept is still suitable for a fast screen."
            onChange={(value) => onScenarioChange({ floodExposure: value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Structural Strategy</p>
        <div className="space-y-3">
          <SliderField
            label="Design Load Level"
            min={1}
            max={10}
            value={scenario.loadLevel}
            displayValue={`${formatNumber(scenario.loadLevel)}/10`}
            hint="This represents the expected traffic and freight demand the crossing needs to carry at concept stage."
            recommendedMin={3}
            recommendedMax={7}
            bandLabel="3-7 concept demand band"
            bandHint="Top-end values imply a heavier freight or traffic brief and can quickly invalidate lighter bridge systems or sparse support layouts."
            onChange={(value) => onScenarioChange({ loadLevel: value })}
          />
          <SliderField
            label="Support Count"
            min={1}
            max={6}
            value={scenario.supportCount}
            displayValue={`${formatNumber(scenario.supportCount)} supports`}
            hint="More supports usually improve structural behavior, but they can create navigation and construction penalties."
            recommendedMin={2}
            recommendedMax={4}
            bandLabel="2-4 supports in most screens"
            bandHint="Too few supports can overextend the span system; too many can turn the waterway itself into the constraint."
            onChange={(value) => onScenarioChange({ supportCount: value })}
          />
          <SliderField
            label="Pier Spacing Bias"
            min={1}
            max={10}
            value={scenario.supportSpacingBias}
            displayValue={`${formatNumber(scenario.supportSpacingBias)}/10`}
            hint="Centered pier spacing is usually safer. Strong bias often reflects a channel-avoidance move that adds imbalance."
            recommendedMin={4}
            recommendedMax={6}
            bandLabel="4-6 balanced spacing bias"
            bandHint="Move well outside this band only when navigation or bank constraints are forcing the support layout away from balance."
            onChange={(value) => onScenarioChange({ supportSpacingBias: value })}
          />
          <SliderField
            label="Wind Exposure"
            min={1}
            max={10}
            value={scenario.windExposure}
            displayValue={`${formatNumber(scenario.windExposure)}/10`}
            hint="Wind exposure acts as a proxy for aerodynamic demand, oscillation, and cross-loading."
            recommendedMin={2}
            recommendedMax={6}
            bandLabel="2-6 common exposure band"
            bandHint="High exposure pushes the concept toward stiffer systems, stronger detailing, and more conservative structural reserve."
            onChange={(value) => onScenarioChange({ windExposure: value })}
          />
          <SliderField
            label="Seismic Demand"
            min={1}
            max={10}
            value={scenario.seismicDemand}
            displayValue={`${formatNumber(scenario.seismicDemand)}/10`}
            hint="Seismic demand increases foundation pressure and can force stronger material and support decisions."
            recommendedMin={2}
            recommendedMax={6}
            bandLabel="2-6 typical screening band"
            bandHint="Once this rises, foundation strategy and support redundancy start becoming design-defining instead of secondary."
            onChange={(value) => onScenarioChange({ seismicDemand: value })}
          />
          <SliderField
            label="Load Position"
            min={0}
            max={100}
            value={scenario.liveLoadPosition}
            displayValue={`${formatNumber(scenario.liveLoadPosition)}%`}
            hint="Moves the current live-load concentration across the deck to show how sensitive the concept is to uneven demand."
            recommendedMin={35}
            recommendedMax={65}
            bandLabel="35%-65% balanced load window"
            bandHint="More extreme positions imply lane loading or demand concentration that can reveal torsion or support imbalance."
            onChange={(value) => onScenarioChange({ liveLoadPosition: value })}
          />
          <SliderField
            label="Safety Preference"
            min={1}
            max={10}
            value={scenario.safetyPreference}
            displayValue={`${formatNumber(scenario.safetyPreference)}/10`}
            hint="This biases the concept toward extra reserve capacity and raises material expectations."
            recommendedMin={5}
            recommendedMax={8}
            bandLabel="5-8 typical reserve posture"
            bandHint="Pushing this low can make the option look artificially efficient; pushing it high usually increases cost and system conservatism."
            onChange={(value) => onScenarioChange({ safetyPreference: value })}
          />
        </div>
      </div>
    </section>
  );
}
