import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createScenario, normalizeScenario } from '@/simulation/defaultScenario';
import { simulateScenario } from '@/simulation/engine';
import type { ScenarioInput, SimulationResult } from '@/simulation/types';

type ScenarioStore = {
  scenarios: ScenarioInput[];
  resultsByScenarioId: Record<string, SimulationResult>;
  selectedScenarioId: string;
  comparisonScenarioIds: string[];
  syncState: 'local-only' | 'syncing' | 'synced';
  createScenarioFromPreset: (name?: string, patch?: Partial<ScenarioInput>) => string;
  createScenarioFromCurrent: () => void;
  selectScenario: (scenarioId: string) => void;
  updateScenario: (patch: Partial<ScenarioInput>) => void;
  renameScenario: (scenarioId: string, name: string) => void;
  duplicateScenario: (scenarioId: string) => void;
  deleteScenario: (scenarioId: string) => void;
  toggleScenarioComparison: (scenarioId: string) => void;
  replaceScenarios: (scenarios: ScenarioInput[]) => void;
  setSyncState: (syncState: ScenarioStore['syncState']) => void;
};

const ensureResultMap = (scenarios: ScenarioInput[]) =>
  scenarios.reduce<Record<string, SimulationResult>>((map, scenario) => {
    const normalizedScenario = normalizeScenario(scenario);
    map[normalizedScenario.id] = simulateScenario(normalizedScenario);
    return map;
  }, {});

export const useKarrasStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: [],
      resultsByScenarioId: {},
      selectedScenarioId: '',
      comparisonScenarioIds: [],
      syncState: 'local-only',
      createScenarioFromPreset: (name, patch = {}) => {
        const nextScenario = normalizeScenario({
          ...createScenario(name),
          ...patch,
          id: crypto.randomUUID(),
          name: name?.trim() || patch.name?.trim() || createScenario().name,
        });

        set((state) => ({
          scenarios: [...state.scenarios, nextScenario],
          resultsByScenarioId: {
            ...state.resultsByScenarioId,
            [nextScenario.id]: simulateScenario(nextScenario),
          },
          selectedScenarioId: nextScenario.id,
          comparisonScenarioIds:
            state.comparisonScenarioIds.length > 0 ? [...state.comparisonScenarioIds.slice(-2), nextScenario.id] : [nextScenario.id],
        }));

        return nextScenario.id;
      },
      createScenarioFromCurrent: () => {
        const { scenarios, selectedScenarioId } = get();
        const currentScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];
        if (!currentScenario) {
          get().createScenarioFromPreset();
          return;
        }
        const duplicate = normalizeScenario({
          ...currentScenario,
          id: crypto.randomUUID(),
          name: `${currentScenario.name} Variant`,
        });

        set((state) => ({
          scenarios: [...state.scenarios, duplicate],
          resultsByScenarioId: {
            ...state.resultsByScenarioId,
            [duplicate.id]: simulateScenario(duplicate),
          },
          selectedScenarioId: duplicate.id,
        }));
      },
      selectScenario: (scenarioId) => {
        set({ selectedScenarioId: scenarioId });
      },
      updateScenario: (patch) => {
        const { selectedScenarioId } = get();
        if (!selectedScenarioId) {
          return;
        }

        set((state) => {
          const scenarios = state.scenarios.map((scenario) =>
            scenario.id === selectedScenarioId ? normalizeScenario({ ...scenario, ...patch }) : normalizeScenario(scenario),
          );

          const updatedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId);
          if (!updatedScenario) {
            return state;
          }

          return {
            scenarios,
            resultsByScenarioId: {
              ...state.resultsByScenarioId,
              [selectedScenarioId]: simulateScenario(updatedScenario),
            },
          };
        });
      },
      renameScenario: (scenarioId, name) => {
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === scenarioId ? { ...scenario, name: name.trim() || scenario.name } : scenario,
          ),
        }));
      },
      duplicateScenario: (scenarioId) => {
        const scenario = get().scenarios.find((item) => item.id === scenarioId);
        if (!scenario) {
          return;
        }

        const clone = {
          ...normalizeScenario(scenario),
          id: crypto.randomUUID(),
          name: `${scenario.name} Copy`,
        };

        set((state) => ({
          scenarios: [...state.scenarios, clone],
          resultsByScenarioId: {
            ...state.resultsByScenarioId,
            [clone.id]: simulateScenario(clone),
          },
        }));
      },
      deleteScenario: (scenarioId) => {
        const { scenarios, selectedScenarioId } = get();
        if (scenarios.length === 1) {
          return;
        }

        const nextScenarios = scenarios.filter((scenario) => scenario.id !== scenarioId);
        const nextSelectedId =
          selectedScenarioId === scenarioId ? nextScenarios[0]?.id ?? '' : selectedScenarioId;

        set((state) => {
          const { [scenarioId]: deletedResult, ...restResults } = state.resultsByScenarioId;
          void deletedResult;

          return {
            scenarios: nextScenarios,
            resultsByScenarioId: restResults,
            selectedScenarioId: nextSelectedId,
            comparisonScenarioIds: state.comparisonScenarioIds.filter((id) => id !== scenarioId),
          };
        });
      },
      toggleScenarioComparison: (scenarioId) => {
        set((state) => {
          const comparisonScenarioIds = state.comparisonScenarioIds.includes(scenarioId)
            ? state.comparisonScenarioIds.filter((id) => id !== scenarioId)
            : [...state.comparisonScenarioIds.slice(-2), scenarioId];

          return {
            comparisonScenarioIds:
              comparisonScenarioIds.length > 0 ? comparisonScenarioIds : state.selectedScenarioId ? [state.selectedScenarioId] : [],
          };
        });
      },
      replaceScenarios: (scenarios) => {
        const nextScenarios = scenarios.length > 0 ? scenarios.map((scenario) => normalizeScenario(scenario)) : [];
        set({
          scenarios: nextScenarios,
          resultsByScenarioId: ensureResultMap(nextScenarios),
          selectedScenarioId: nextScenarios[0]?.id ?? '',
          comparisonScenarioIds: nextScenarios[0] ? [nextScenarios[0].id] : [],
        });
      },
      setSyncState: (syncState) => {
        set({ syncState });
      },
    }),
    {
      name: 'karras-mvp-store-v4',
      partialize: (state) => ({
        scenarios: state.scenarios.map((scenario) => normalizeScenario(scenario)),
        resultsByScenarioId: ensureResultMap(state.scenarios),
        selectedScenarioId: state.selectedScenarioId,
        comparisonScenarioIds: state.comparisonScenarioIds,
        syncState: state.syncState,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ScenarioStore>;
        const scenarios =
          persisted.scenarios && persisted.scenarios.length > 0
            ? persisted.scenarios.map((scenario) => normalizeScenario(scenario))
            : currentState.scenarios;
        const selectedScenarioId =
          persisted.selectedScenarioId && scenarios.some((scenario) => scenario.id === persisted.selectedScenarioId)
            ? persisted.selectedScenarioId
            : scenarios[0]?.id ?? '';

        return {
          ...currentState,
          ...persisted,
          scenarios,
          resultsByScenarioId: ensureResultMap(scenarios),
          selectedScenarioId,
          comparisonScenarioIds:
            persisted.comparisonScenarioIds?.filter((scenarioId) =>
              scenarios.some((scenario) => scenario.id === scenarioId),
            ) ?? (selectedScenarioId ? [selectedScenarioId] : []),
        };
      },
    },
  ),
);

export const useSelectedScenario = () =>
  {
    const selectedScenarioId = useKarrasStore((state) => state.selectedScenarioId);
    const scenario = useKarrasStore(
      (state) => state.scenarios.find((item) => item.id === selectedScenarioId) ?? state.scenarios[0],
    );
    const result = useKarrasStore(
      (state) => (selectedScenarioId ? state.resultsByScenarioId[selectedScenarioId] : undefined) ?? (scenario ? state.resultsByScenarioId[scenario.id] : undefined),
    );

    return {
      scenario,
      result,
    };
  };
