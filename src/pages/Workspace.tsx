import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightLeft,
  BarChart3,
  Cloud,
  CloudDownload,
  CloudUpload,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Home,
  LayoutGrid,
  Plus,
  Send,
  SlidersHorizontal,
  Split,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { fetchScenarios, syncScenarios } from '@/auth/api';
import { ControlPanel } from '@/components/workspace/ControlPanel';
import { DecisionPanel } from '@/components/workspace/DecisionPanel';
import { SimulationCanvas } from '@/components/workspace/SimulationCanvas';
import { bridgeStudyPresets } from '@/simulation/presetLibrary';
import type { ScenarioInput } from '@/simulation/types';
import { getWaterwayPreset } from '@/simulation/waterway';
import { useAuthStore } from '@/store/useAuthStore';
import { useKarrasStore, useSelectedScenario } from '@/store/useKarrasStore';
import { formatLabel, formatScore, formatStatus } from '@/utils/format';
import { buildScenarioShareText, downloadScenarioReport } from '@/utils/report';
import { parseImportedStudyFile } from '@/utils/studyImport';

type WorkspaceApplet = 'modules' | 'library' | 'controls' | 'analysis' | 'cloud' | null;
type WorkspaceSurface = 'launcher' | 'study';
type WorkspaceModule = {
  id: string;
  label: string;
  status: 'available' | 'coming-soon';
  description: string;
};
type WorkspaceCategory = {
  id: string;
  label: string;
  description: string;
  modules: WorkspaceModule[];
};

const blankBridgeStudy = {
  label: 'Blank Canvas',
  description: 'Start from a neutral bridge study and define the crossing yourself.',
  defaultName: 'Untitled Bridge Study',
  patch: {
    studyState: 'blank-canvas' as const,
    dataOrigin: 'manual-estimate' as const,
    sourceConfidence: 'manual-estimate' as const,
    siteContext: 'Unspecified bridge corridor',
    sourceSummary: 'Blank setup study created without imported site data. All corridor values remain manual until defined by the user.',
    studyAssumptions: [
      {
        id: 'blank-origin',
        label: 'Study origin',
        value: 'Blank setup canvas',
        basis: 'No preset geometry or imported corridor package has been applied yet.',
      },
    ],
    sourceReferences: [],
    importedArtifacts: [],
    waterwayType: 'river' as const,
    spanDistanceM: 140,
    channelWidthM: 88,
    waterDepthM: 12,
    navigationClearanceM: 18,
    currentVelocity: 1.2,
    vesselTraffic: 1,
    bankStability: 7,
    scourRisk: 3,
    floodExposure: 3,
    loadLevel: 3,
    supportCount: 3,
    bridgeSystem: 'girder' as const,
    foundationStrategy: 'deep-pile' as const,
  },
};

const moduleCategories: WorkspaceCategory[] = [
  {
    id: 'transport',
    label: 'Transport Infrastructure',
    description: 'Route-level structure and corridor feasibility studies.',
    modules: [
      {
        id: 'bridge-corridor',
        label: 'Bridge Corridor Study',
        status: 'available' as const,
        description: 'Plan a bridge crossing over water with presets for hydraulic, navigation, and support conditions.',
      },
    ],
  },
  {
    id: 'urban',
    label: 'Urban Systems',
    description: 'Network, flow, and public-space simulations.',
    modules: [
      {
        id: 'urban-flow',
        label: 'Urban Flow Model',
        status: 'coming-soon' as const,
        description: 'Reserved for future traffic and movement studies.',
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resource Planning',
    description: 'Capacity, allocation, and resilience scenarios.',
    modules: [
      {
        id: 'capacity-balance',
        label: 'Capacity Balance Model',
        status: 'coming-soon' as const,
        description: 'Reserved for future allocation and systems planning.',
      },
    ],
  },
];

export default function Workspace() {
  const { scenario, result } = useSelectedScenario();
  const [surface, setSurface] = useState<WorkspaceSurface>('launcher');
  const [activeApplet, setActiveApplet] = useState<WorkspaceApplet>(null);
  const [shareState, setShareState] = useState<string>('Workspace local-only');
  const [importState, setImportState] = useState<string>('No study package imported');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(bridgeStudyPresets[0].id);
  const [studyName, setStudyName] = useState<string>(bridgeStudyPresets[0].defaultName);
  const { user, token } = useAuthStore();
  const {
    scenarios,
    resultsByScenarioId,
    selectedScenarioId,
    comparisonScenarioIds,
    syncState,
    createScenarioFromPreset,
    updateScenario,
    createScenarioFromCurrent,
    selectScenario,
    duplicateScenario,
    deleteScenario,
    toggleScenarioComparison,
    replaceScenarios,
    setSyncState,
  } = useKarrasStore();

  useEffect(() => {
    const activePreset = bridgeStudyPresets.find((preset) => preset.id === selectedPresetId);
    if (activePreset) {
      setStudyName(activePreset.defaultName);
    }
  }, [selectedPresetId]);

  const activeComparisonCount = comparisonScenarioIds.length;
  const activePreset = bridgeStudyPresets.find((preset) => preset.id === selectedPresetId) ?? bridgeStudyPresets[0];
  const activeCategory = selectedCategory
    ? moduleCategories.find((category) => category.id === selectedCategory)
    : undefined;

  const workspaceInsights = useMemo(
    () =>
      surface === 'study' && scenario
        ? [
            ['Module', 'Bridge Corridor Study'],
            ['Active preset', `${formatLabel(scenario.waterwayType)} crossing with ${scenario.channelWidthM}m channel width and ${scenario.navigationClearanceM}m clearance.`],
            ['Scenario workflow', `${activeComparisonCount} scenario${activeComparisonCount === 1 ? '' : 's'} currently in the comparison set.`],
          ]
        : !activeCategory
          ? [
              ['Modules', 'Select a simulation category before choosing a study setup.'],
              ['Presets', 'Preset and blank-start options stay hidden until a category is selected.'],
              ['Scenario workflow', `${scenarios.length} saved scenario${scenarios.length === 1 ? '' : 's'} currently available in the workspace library.`],
            ]
        : [
            ['Modules', `Category selected: ${activeCategory.label}.`],
            ['Presets', `${activePreset.label} starts with a ${formatLabel(activePreset.patch.waterwayType ?? 'river').toLowerCase()} crossing configuration.`],
            ['Scenario workflow', `${scenarios.length} saved scenario${scenarios.length === 1 ? '' : 's'} currently available in the workspace library.`],
          ],
    [activeCategory, activeComparisonCount, activePreset.label, activePreset.patch.waterwayType, scenario, scenarios.length, surface],
  );

  const handleScenarioChange = (patch: Partial<ScenarioInput>) => {
    if (!scenario) {
      return;
    }

    const shouldActivateStudy =
      scenario.studyState === 'blank-canvas' &&
      Object.keys(patch).some((key) => key !== 'name' && key !== 'studyState');

    const patchWithState = shouldActivateStudy ? { ...patch, studyState: 'configured' as const } : patch;

    if (patch.waterwayType) {
      const preset = getWaterwayPreset(patch.waterwayType);
      updateScenario({
        channelWidthM: preset.channelWidthM,
        waterDepthM: preset.waterDepthM,
        navigationClearanceM: preset.navigationClearanceM,
        currentVelocity: preset.currentVelocity,
        vesselTraffic: preset.vesselTraffic,
        bankStability: preset.bankStability,
        scourRisk: preset.scourRisk,
        floodExposure: preset.floodExposure,
        ...patchWithState,
      });
      return;
    }

    updateScenario(patchWithState);
  };

  const handleLaunchScenario = (patch?: Partial<ScenarioInput>, fallbackName?: string) => {
    createScenarioFromPreset(studyName.trim() || fallbackName, patch);
    setSurface('study');
    setActiveApplet(null);
    setShareState(`${studyName.trim() || fallbackName || 'Study'} created`);
  };

  const handleLaunchPreset = () => {
    handleLaunchScenario(activePreset.patch, activePreset.defaultName);
  };

  const handleLaunchBlankStudy = () => {
    handleLaunchScenario(blankBridgeStudy.patch, blankBridgeStudy.defaultName);
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const imported = parseImportedStudyFile(file.name, content);
      createScenarioFromPreset(imported.name ?? file.name.replace(/\.[^.]+$/, ''), imported.patch);
      setSurface('study');
      setActiveApplet(null);
      setImportState(imported.message);
      setShareState(imported.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      setImportState(message);
      setShareState(message);
    } finally {
      event.target.value = '';
    }
  };

  const openScenario = (scenarioId: string) => {
    selectScenario(scenarioId);
    setSurface('study');
    setActiveApplet(null);
  };

  const handleSyncToCloud = async () => {
    if (!token) {
      setShareState('Sign in to enable cloud sync');
      return;
    }

    setSyncState('syncing');
    setShareState('Syncing scenarios to cloud');

    try {
      await syncScenarios(token, scenarios);
      setSyncState('synced');
      setShareState(`Synced ${scenarios.length} scenario${scenarios.length === 1 ? '' : 's'} to cloud`);
    } catch (error) {
      setSyncState('local-only');
      setShareState(error instanceof Error ? error.message : 'Cloud sync failed');
    }
  };

  const handleLoadFromCloud = async () => {
    if (!token) {
      setShareState('Sign in to load cloud scenarios');
      return;
    }

    setSyncState('syncing');
    setShareState('Loading cloud scenarios');

    try {
      const response = await fetchScenarios(token);
      const cloudScenarios = response.scenarios;
      if (cloudScenarios.length > 0) {
        replaceScenarios(cloudScenarios);
      }
      setSyncState('synced');
      setShareState(
        cloudScenarios.length > 0
          ? `Loaded ${cloudScenarios.length} scenario${cloudScenarios.length === 1 ? '' : 's'} from cloud`
          : 'Cloud account has no saved scenarios yet',
      );
    } catch (error) {
      setSyncState('local-only');
      setShareState(error instanceof Error ? error.message : 'Cloud load failed');
    }
  };

  const handleExport = (scenarioId: string) => {
    const targetScenario = scenarios.find((item) => item.id === scenarioId);
    const targetResult = targetScenario ? resultsByScenarioId[targetScenario.id] : undefined;
    if (!targetScenario || !targetResult) {
      return;
    }

    downloadScenarioReport(targetScenario, targetResult);
    setShareState(`Exported ${targetScenario.name}`);
  };

  const handleShare = async (scenarioId: string) => {
    const targetScenario = scenarios.find((item) => item.id === scenarioId);
    const targetResult = targetScenario ? resultsByScenarioId[targetScenario.id] : undefined;
    if (!targetScenario || !targetResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildScenarioShareText(targetScenario, targetResult));
      setShareState(`Copied ${targetScenario.name} summary`);
    } catch {
      setShareState(`Share failed for ${targetScenario.name}`);
    }
  };

  const renderEmptyApplet = (title: string, description: string) => (
    <section className="space-y-4 rounded-[28px] border border-white/10 bg-zinc-950/92 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.44)]">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Workspace Applet</p>
        <h2 className="mt-2 font-display text-2xl text-zinc-50">{title}</h2>
      </div>
      <p className="text-sm leading-7 text-zinc-400">{description}</p>
      <button
        type="button"
        onClick={() => setActiveApplet('modules')}
        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
      >
        <Plus className="h-4 w-4" />
        Launch Study
      </button>
    </section>
  );

  const renderAppletContent = () => {
    if (activeApplet === 'modules') {
      return (
        <section className="space-y-5 rounded-[28px] border border-white/10 bg-zinc-950/94 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.44)]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Workspace Modules</p>
            <h2 className="mt-2 font-display text-2xl text-zinc-50">Start a new study</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              The workspace is product-level, not bridge-only. This release ships the bridge corridor study first.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {moduleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                  selectedCategory === category.id
                    ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {!activeCategory ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm leading-7 text-zinc-400">
              Select a category first. The module setup and preset builder appear only after that choice is made.
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {activeCategory.modules.map((module) => (
                  <article
                    key={module.id}
                    className={`rounded-[24px] border p-4 ${
                      module.status === 'available'
                        ? 'border-cyan-300/25 bg-cyan-300/10'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {module.status === 'available' ? 'Available Now' : 'Coming Soon'}
                        </p>
                        <h3 className="mt-2 font-display text-2xl text-zinc-50">{module.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{module.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Study Setup</p>
                  <h3 className="mt-2 font-display text-2xl text-zinc-50">Bridge corridor builder</h3>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchBlankStudy}
                  className="w-full rounded-[22px] border border-white/10 bg-zinc-950/60 p-4 text-left transition hover:border-white/20"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Clean Start</p>
                  <h4 className="mt-2 font-display text-xl text-zinc-50">{blankBridgeStudy.label}</h4>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{blankBridgeStudy.description}</p>
                </button>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Preset Library</p>
                </div>

                <div className="grid gap-3">
                  {bridgeStudyPresets.map((preset) => {
                    const active = preset.id === selectedPresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`rounded-[22px] border p-4 text-left transition ${
                          active
                            ? 'border-cyan-300/40 bg-cyan-300/10'
                            : 'border-white/10 bg-zinc-950/60 hover:border-white/20'
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{formatLabel(preset.patch.waterwayType ?? 'river')}</p>
                        <h4 className="mt-2 font-display text-xl text-zinc-50">{preset.label}</h4>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{preset.description}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-zinc-500">
                          {(preset.patch.sourceConfidence ?? 'sample-curated').replace('-', ' ')} · {preset.patch.siteContext}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">Study Name</span>
                  <input
                    value={studyName}
                    onChange={(event) => setStudyName(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/60"
                    placeholder="Name this study"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleLaunchPreset}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
                >
                  <Plus className="h-4 w-4" />
                  Start From Preset
                </button>

                <label className="block rounded-[22px] border border-dashed border-white/10 bg-zinc-950/40 p-4">
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">Import Study Data</span>
                  <span className="block text-sm leading-6 text-zinc-400">
                    Accepts JSON study packages, CSV assumptions tables, and GeoJSON corridor packages.
                  </span>
                  <input
                    type="file"
                    accept=".json,.csv,.geojson"
                    onChange={(event) => void handleImportFile(event)}
                    className="mt-4 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-cyan-100"
                  />
                  <p className="mt-3 text-xs leading-5 text-zinc-500">{importState}</p>
                </label>
              </div>
            </>
          )}
        </section>
      );
    }

    if (activeApplet === 'library') {
      return (
        <section className="space-y-5 rounded-[28px] border border-white/10 bg-zinc-950/94 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.44)]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Workspace Library</p>
            <h2 className="mt-2 font-display text-2xl text-zinc-50">Saved studies</h2>
          </div>

          {scenarios.length === 0 ? (
            <p className="text-sm leading-7 text-zinc-400">No saved studies yet. Start from the module applet to build the first simulation.</p>
          ) : (
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {scenarios.map((item) => {
                const itemResult = resultsByScenarioId[item.id];
                const isActive = item.id === selectedScenarioId;
                const inComparison = comparisonScenarioIds.includes(item.id);

                return (
                  <article
                    key={item.id}
                    className={`rounded-[24px] border p-4 ${
                      isActive ? 'border-cyan-300/35 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <button type="button" onClick={() => openScenario(item.id)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-xl text-zinc-50">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {formatLabel(item.waterwayType)} · {item.spanDistanceM}m span · {item.navigationClearanceM}m clearance
                          </p>
                          <p className="mt-2 text-xs leading-5 text-zinc-500">
                            {item.siteContext} · {item.sourceConfidence.replace(/-/g, ' ')}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-zinc-300">
                          {itemResult ? formatStatus(itemResult.status) : 'Draft'}
                        </span>
                      </div>
                      {itemResult ? (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Feasibility</p>
                            <p className="mt-1 text-sm text-zinc-100">{formatScore(itemResult.feasibilityScore)}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Stability</p>
                            <p className="mt-1 text-sm text-zinc-100">{formatScore(itemResult.stabilityScore)}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Supports</p>
                            <p className="mt-1 text-sm text-zinc-100">{item.supportCount}</p>
                          </div>
                        </div>
                      ) : null}
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openScenario(item.id)}
                        className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateScenario(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleScenarioComparison(item.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                          inComparison
                            ? 'border-amber-300/30 bg-amber-400/10 text-amber-100'
                            : 'border-white/10 bg-white/[0.04] text-zinc-300'
                        }`}
                      >
                        <Split className="h-4 w-4" />
                        Compare
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleShare(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100"
                      >
                        <Send className="h-4 w-4" />
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteScenario(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      );
    }

    if (activeApplet === 'controls') {
      return scenario ? (
        <ControlPanel
          scenario={scenario}
          onScenarioChange={handleScenarioChange}
          onCreateVariant={createScenarioFromCurrent}
        />
      ) : (
        renderEmptyApplet('No active study', 'Launch a module preset or open a saved study from the library before tuning controls.')
      );
    }

    if (activeApplet === 'analysis') {
      return scenario?.studyState === 'blank-canvas'
        ? renderEmptyApplet(
            'Analysis unavailable',
            'This study is still blank. Define waterway geometry and structural assumptions first, then open analysis once the crossing has been formed.',
          )
        : result
          ? <DecisionPanel result={result} />
          : renderEmptyApplet('No active analysis', 'The decision applet becomes available once a study has been started or opened.');
    }

    if (activeApplet === 'cloud') {
      return (
        <section className="space-y-5 rounded-[28px] border border-white/10 bg-zinc-950/94 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.44)]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Workspace Services</p>
            <h2 className="mt-2 font-display text-2xl text-zinc-50">Cloud and review</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Keep sync, reports, and comparison outside the central work surface until you need them.
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Sync State</p>
            <p className="mt-2 font-display text-2xl text-zinc-50">{syncState}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{shareState}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSyncToCloud()}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
            >
              <CloudUpload className="h-4 w-4" />
              {user ? 'Sync To Cloud' : 'Sign In To Sync'}
            </button>
            <button
              type="button"
              onClick={() => void handleLoadFromCloud()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200"
            >
              <CloudDownload className="h-4 w-4" />
              Load Cloud
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200"
            >
              <FileText className="h-4 w-4" />
              Reports
            </Link>
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Compare
            </Link>
          </div>

          <label className="block rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-4">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">Import Study Data</span>
            <span className="block text-sm leading-6 text-zinc-400">
              Replace presets with your own JSON, CSV, or GeoJSON package when you have real corridor data.
            </span>
            <input
              type="file"
              accept=".json,.csv,.geojson"
              onChange={(event) => void handleImportFile(event)}
              className="mt-4 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-cyan-100"
            />
            <p className="mt-3 text-xs leading-5 text-zinc-500">{importState}</p>
          </label>
        </section>
      );
    }

    return null;
  };

  const appletSide = activeApplet === 'modules' || activeApplet === 'library' ? 'left-4 lg:left-6' : 'right-4 lg:right-6';

  return (
    <div className="relative min-h-[100dvh] bg-[#040916] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_32%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="absolute left-4 top-4 z-30 flex items-start gap-3 lg:left-6 lg:top-6">
        <Link
          to="/"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#081121]/88 text-zinc-200 backdrop-blur-xl transition hover:border-white/20"
        >
          <Home className="h-4 w-4" />
        </Link>
        <div className="hidden rounded-2xl border border-white/10 bg-[#081121]/88 px-4 py-3 backdrop-blur-xl lg:block">
          <p className="font-display text-sm uppercase tracking-[0.34em] text-zinc-50">KARRAS</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-zinc-500">Workspace Surface</p>
        </div>
      </div>

      <div className="absolute left-4 top-16 z-30 flex flex-col gap-2 lg:left-6 lg:top-20">
        {[
          { id: 'modules' as WorkspaceApplet, icon: LayoutGrid, label: 'Modules' },
          { id: 'library' as WorkspaceApplet, icon: FolderOpen, label: 'Library' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveApplet((current) => (current === id ? null : id))}
            className={`inline-flex h-11 items-center gap-3 rounded-2xl border px-4 backdrop-blur-xl transition ${
              activeApplet === id
                ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-100'
                : 'border-white/10 bg-[#081121]/88 text-zinc-300 hover:border-white/20'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden text-xs uppercase tracking-[0.18em] lg:block">{label}</span>
          </button>
        ))}
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 lg:right-6 lg:top-6">
        <Link
          to="/reports"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#081121]/88 text-zinc-300 backdrop-blur-xl transition hover:border-white/20"
        >
          <FileText className="h-4 w-4" />
        </Link>
        <Link
          to="/compare"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#081121]/88 text-zinc-300 backdrop-blur-xl transition hover:border-white/20"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="absolute right-4 top-16 z-30 flex flex-col items-end gap-2 lg:right-6 lg:top-20">
        {[
          { id: 'controls' as WorkspaceApplet, icon: SlidersHorizontal, label: 'Controls' },
          { id: 'analysis' as WorkspaceApplet, icon: BarChart3, label: 'Analysis' },
          { id: 'cloud' as WorkspaceApplet, icon: Cloud, label: 'Services' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveApplet((current) => (current === id ? null : id))}
            className={`inline-flex h-11 items-center gap-3 rounded-2xl border px-4 backdrop-blur-xl transition ${
              activeApplet === id
                ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-100'
                : 'border-white/10 bg-[#081121]/88 text-zinc-300 hover:border-white/20'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden text-xs uppercase tracking-[0.18em] lg:block">{label}</span>
          </button>
        ))}
      </div>

      <main className="relative z-10 px-[4.75rem] pb-6 pt-32 sm:px-24 sm:pt-36 lg:px-32 lg:pt-32 xl:px-40">
        {surface === 'launcher' ? (
          <section className="mx-auto grid min-h-[calc(100dvh-9rem)] max-w-[1280px] place-items-center">
            <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1.1fr)_400px]">
              <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,33,0.94),rgba(5,9,22,0.94))] p-8 shadow-[0_24px_100px_rgba(0,0,0,0.34)]">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Workspace Launcher</p>
                <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.94] text-zinc-50 xl:text-7xl">
                  Build the simulation before you enter it.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400">
                  KARRAS ships the bridge corridor study first, but this workspace is the operating surface for multiple simulation modules. Pick the category, choose a preset, and launch the study you want to work on.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {moduleCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`rounded-[28px] border p-5 text-left transition ${
                        selectedCategory === category.id
                          ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                          : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Simulation Category</p>
                      <h2 className="mt-3 font-display text-2xl text-zinc-50">{category.label}</h2>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{category.description}</p>
                    </button>
                  ))}
                </div>

                {activeCategory ? (
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {activeCategory.modules.map((module) => (
                      <article
                        key={module.id}
                        className={`rounded-[28px] border p-5 ${
                          module.status === 'available'
                            ? 'border-cyan-300/25 bg-cyan-300/10'
                            : 'border-white/10 bg-white/[0.03]'
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {module.status === 'available' ? 'Shipping Now' : 'Future Module'}
                        </p>
                        <h2 className="mt-3 font-display text-3xl text-zinc-50">{module.label}</h2>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">{module.description}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Next Step</p>
                    <h2 className="mt-3 font-display text-3xl text-zinc-50">Select a category first.</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                      The study setup stays hidden until you choose which simulation area you want to work in.
                    </p>
                  </div>
                )}
              </div>

              {activeCategory ? (
                <div className="space-y-4 rounded-[36px] border border-white/10 bg-zinc-950/84 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.34)] backdrop-blur-xl">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Study Builder</p>
                    <h2 className="mt-3 font-display text-3xl text-zinc-50">Bridge corridor study</h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleLaunchBlankStudy}
                    className="w-full rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Clean Start</p>
                    <h3 className="mt-2 font-display text-2xl text-zinc-50">{blankBridgeStudy.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{blankBridgeStudy.description}</p>
                  </button>

                  <div className="space-y-3">
                    {bridgeStudyPresets.map((preset) => {
                      const active = preset.id === selectedPresetId;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedPresetId(preset.id)}
                          className={`w-full rounded-[24px] border p-4 text-left transition ${
                            active
                              ? 'border-cyan-300/40 bg-cyan-300/10'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                          }`}
                        >
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            {formatLabel(preset.patch.waterwayType ?? 'river')}
                          </p>
                          <h3 className="mt-2 font-display text-2xl text-zinc-50">{preset.label}</h3>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{preset.description}</p>
                          <p className="mt-3 text-xs leading-5 text-zinc-500">{preset.patch.sourceSummary}</p>
                        </button>
                      );
                    })}
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">Study Name</span>
                    <input
                      value={studyName}
                      onChange={(event) => setStudyName(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/50"
                      placeholder="Name this study"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleLaunchPreset}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100"
                  >
                    <Plus className="h-4 w-4" />
                    Launch Preset Study
                  </button>

                  <label className="block rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-4">
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">Import User Data</span>
                    <span className="block text-sm leading-6 text-zinc-400">
                      Start from your own JSON, CSV, or GeoJSON package instead of using a preset.
                    </span>
                    <input
                      type="file"
                      accept=".json,.csv,.geojson"
                      onChange={(event) => void handleImportFile(event)}
                      className="mt-4 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-cyan-100"
                    />
                    <p className="mt-3 text-xs leading-5 text-zinc-500">{importState}</p>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {workspaceInsights.map(([title, description]) => (
                      <div key={title} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{title}</p>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">{description}</p>
                      </div>
                    ))}
                  </div>

                  {scenarios.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveApplet('library')}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-400 transition hover:text-zinc-100"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Open saved study
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[36px] border border-dashed border-white/10 bg-zinc-950/60 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Study Builder</p>
                  <h2 className="mt-3 font-display text-3xl text-zinc-50">Waiting for category selection.</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Choose a simulation category first. After that, you can either start from a preset or open a blank canvas for the bridge module shipping now.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : scenario && result ? (
          <section className="mx-auto max-w-[1840px] min-h-[calc(100dvh-8rem)]">
            <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,33,0.88),rgba(5,9,22,0.88))] p-4 shadow-[0_24px_100px_rgba(0,0,0,0.32)]">
              <SimulationCanvas scenario={scenario} result={result} onScenarioChange={handleScenarioChange} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-[#081121]/88 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300">
                Module: Bridge Corridor Study
              </div>
              <div className="rounded-full border border-white/10 bg-[#081121]/88 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300">
                Active Study: {scenario.name}
              </div>
              <div className="rounded-full border border-white/10 bg-[#081121]/88 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300">
                Mode: {scenario.studyState === 'blank-canvas' ? 'Blank Setup' : 'Configured Study'}
              </div>
              <div className="rounded-full border border-white/10 bg-[#081121]/88 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300">
                Origin: {scenario.dataOrigin.replace(/-/g, ' ')}
              </div>
              <div className="rounded-full border border-white/10 bg-[#081121]/88 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300">
                Status: {formatStatus(result.status)}
              </div>
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100">
                Feasibility {formatScore(result.feasibilityScore)}
              </div>
              <button
                type="button"
                onClick={() => setSurface('launcher')}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300"
              >
                Back To Launcher
              </button>
            </div>
          </section>
        ) : (
          <section className="mx-auto grid min-h-[calc(100dvh-9rem)] max-w-[960px] place-items-center">
            <div className="rounded-[36px] border border-white/10 bg-zinc-950/84 p-8 text-center shadow-[0_24px_100px_rgba(0,0,0,0.34)]">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">No Active Study</p>
              <h1 className="mt-4 font-display text-5xl text-zinc-50">Open a study or launch a new one.</h1>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveApplet('modules')}
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
                >
                  Modules
                </button>
                <button
                  type="button"
                  onClick={() => setActiveApplet('library')}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300"
                >
                  Library
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <AnimatePresence>
        {activeApplet ? (
          <>
            <motion.button
              type="button"
              aria-label="Close applet"
              className="fixed inset-0 z-30 bg-black/46 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveApplet(null)}
            />
            <motion.aside
              initial={{ opacity: 0, x: activeApplet === 'modules' || activeApplet === 'library' ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeApplet === 'modules' || activeApplet === 'library' ? -24 : 24 }}
              transition={{ duration: 0.2 }}
              className={`fixed ${appletSide} top-32 z-40 max-h-[calc(100dvh-9rem)] w-[min(92vw,460px)] overflow-y-auto`}
            >
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveApplet(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#081121]/90 text-zinc-300 backdrop-blur-xl"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {renderAppletContent()}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
