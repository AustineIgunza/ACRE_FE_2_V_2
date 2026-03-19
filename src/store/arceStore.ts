"use client";

import { create } from "zustand";
import {
  GameSession,
  Cluster,
  CausalAnchor,
  CrisisScenario,
  UserResponse,
  ThermalState,
  EXAMPLE_CLUSTER,
  EXAMPLE_CRISIS_SCENARIO,
  MasteryCard,
} from "@/types/arce";
import {
  MOCK_CLUSTERS,
  generateMockMasteryCard,
} from "@/utils/mockTestData";

interface ArceStore {
  // Session state
  gameSession: GameSession | null;
  scenarios: CrisisScenario[];
  currentScenario: CrisisScenario | null;
  isLoading: boolean;
  loadingProgress: number; // 0-100 for progress bars
  error: string | null;

  // UI state
  showLogo: boolean; // Logo only at start and end
  currentPhase: "input" | "playing" | "results"; // input = textarea, playing = action/defense, results = mastery cards
  selectedActionButton: string | null;
  showDefenseTextbox: boolean;
  testMode: boolean; // Enable test mode to skip defenses
  correctButton: string | null; // Which button is correct in test mode

  // Actions
  startGame: (sourceContent: string, sourceTitle?: string) => Promise<void>;
  selectAction: (buttonId: string) => void;
  showDefense: () => void;
  submitDefense: (defense: string) => Promise<{ thermalState: ThermalState, feedback: string, keywords: string[], formalDefinition: string } | undefined>;
  nextNode: () => void;
  nextCluster: () => void;
  resetGame: () => void;
  endGame: () => void;
  toggleTestMode: () => void;
}

export const useArceStore = create<ArceStore>((set, get) => ({
  // Initial state
  gameSession: null,
  scenarios: [],
  currentScenario: null,
  isLoading: false,
  loadingProgress: 0,
  error: null,
  showLogo: true, // Show logo at start
  currentPhase: "input",
  selectedActionButton: null,
  showDefenseTextbox: false,
  testMode: false,
  correctButton: null,

  startGame: async (sourceContent: string, sourceTitle?: string) => {
    set({ isLoading: true, error: null, showLogo: true });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-scenarios`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ text_material: sourceContent })
      });
      if (!res.ok) throw new Error("Failed to generate scenarios from backend.");
      const data = await res.json();
      
      const mappedScenarios: CrisisScenario[] = data.scenarios.map((s: any, index: number) => ({
        id: s.id || `scenario-${index}`,
        nodeId: `node-${index}`,
        crisisText: `${s.title}\n\n${s.context}\n${s.question}`,
        questionType: 'multiple-choice',
        actionButtons: s.options?.map((opt: any, i: number) => ({
          id: opt.id || `btn-${i}`,
          label: opt.text || opt.action,
          order: i + 1
        })) || [],
        difficulty: 'level-2'
      }));

      const mockSession: GameSession = {
        id: `session-${Date.now()}`,
        sourceContent,
        sourceTitle: sourceTitle || "Learning Session",
        clusters: MOCK_CLUSTERS, // We retain local MOCK_CLUSTERS for mapping requirements
        currentClusterIndex: 0,
        currentNodeIndex: 0,
        globalHeat: 0,
        globalIntegrity: 0,
        responses: [],
        masteryCards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        completed: false,
      };

      localStorage.setItem(`arce-session-${mockSession.id}`, JSON.stringify(mockSession));

      set({
        gameSession: mockSession,
        scenarios: mappedScenarios,
        currentScenario: mappedScenarios[0],
        isLoading: false,
        currentPhase: "playing",
        showLogo: false, 
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to start game", isLoading: false });
    }
  },

  // Select an action button (multiple choice)
  selectAction: (buttonId: string) => {
    set({ selectedActionButton: buttonId });
  },

  // Show the defense textbox (only if question type is multiple-choice)
  showDefense: () => {
    set({ showDefenseTextbox: true });
  },

  submitDefense: async (defense: string) => {
    const { gameSession, currentScenario, selectedActionButton, testMode, scenarios } = get();
    if (!gameSession || !currentScenario) return;

    if (!testMode && defense.length < 20) {
      set({ error: "Defense must be at least 20 characters" });
      return;
    }

    set({ isLoading: true });

    try {
      let evaluation;
      if (testMode) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        evaluation = {
          thermalState: "ignition" as ThermalState,
          feedback: "🔥 TEST MODE: This answer is marked correct for testing!",
          heatDelta: 25,
        };
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluate`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             scenarioId: currentScenario.id, 
             userChoice: selectedActionButton, 
             userDefense: defense,
             userId: "" // Can implement fully later
           })
         });
         if (!res.ok) throw new Error("Evaluation request failed.");
         const data = await res.json();
         evaluation = {
           thermalState: data.evaluation.state.toLowerCase() as ThermalState,
           feedback: data.evaluation.feedback,
           heatDelta: data.evaluation.heatScoreDelta || 0,
           keywords: data.evaluation.keywords || [],
           formalDefinition: data.evaluation.formalDefinition || ""
         }
      }

      const response: UserResponse = {
        id: `response-${Date.now()}`,
        scenarioId: currentScenario.id,
        defense: defense || "[TEST MODE - NO DEFENSE]",
        timestamp: Date.now(),
        thermalResult: evaluation.thermalState,
        feedback: evaluation.feedback,
        actionChoice: selectedActionButton || undefined,
      };

      const updatedSession = { ...gameSession };
      updatedSession.responses.push(response);

      if (evaluation.thermalState === "ignition") {
        const masteryCard = generateMockMasteryCard(
          currentScenario.nodeId,
          defense,
          evaluation.thermalState
        );
        updatedSession.masteryCards.push(masteryCard);
      }

      const delta = evaluation.heatDelta || 0;
      if (evaluation.thermalState === "frost") {
        updatedSession.globalHeat = Math.max(0, updatedSession.globalHeat - Math.abs(delta));
        updatedSession.globalIntegrity = Math.max(0, updatedSession.globalIntegrity - 5);
      } else if (evaluation.thermalState === "warning") {
        updatedSession.globalHeat = Math.min(100, updatedSession.globalHeat + Math.abs(delta));
        updatedSession.globalIntegrity += 3;
      } else if (evaluation.thermalState === "ignition") {
        updatedSession.globalHeat = Math.min(100, updatedSession.globalHeat + Math.abs(delta));
        updatedSession.globalIntegrity = Math.min(100, updatedSession.globalIntegrity + 15);
      }

      updatedSession.updatedAt = Date.now();
      localStorage.setItem(`arce-session-${updatedSession.id}`, JSON.stringify(updatedSession));

      set({
        gameSession: updatedSession,
        isLoading: false,
        showDefenseTextbox: false,
        selectedActionButton: null,
        currentPhase: "playing", 
      });

      return {
        thermalState: evaluation.thermalState,
        feedback: evaluation.feedback,
        keywords: evaluation.keywords || [],
        formalDefinition: evaluation.formalDefinition || "",
      };
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to submit defense", isLoading: false });
    }
  },

  nextNode: () => {
    const { gameSession, currentScenario, scenarios } = get();
    if (!gameSession || !currentScenario) return;

    const responseCount = gameSession.responses.length;
    const nextScenarioIndex = Math.min(responseCount, scenarios.length - 1);
    const nextScenario = scenarios[nextScenarioIndex];

    set((state) => ({
      gameSession: {
        ...state.gameSession!,
        currentNodeIndex: Math.min(
          state.gameSession!.currentNodeIndex + 1,
          state.gameSession!.clusters[state.gameSession!.currentClusterIndex]
            .nodes.length - 1
        ),
      },
      currentScenario: nextScenario,
      showDefenseTextbox: false,
      selectedActionButton: null,
    }));
  },

  nextCluster: () => {
    const { gameSession, scenarios } = get();
    if (!gameSession) return;

    if (gameSession.currentClusterIndex < gameSession.clusters.length - 1) {
      const responseCount = gameSession.responses.length;
      const nextScenarioIndex = Math.min(responseCount, scenarios.length - 1);

      set((state) => ({
        gameSession: {
          ...state.gameSession!,
          currentClusterIndex: state.gameSession!.currentClusterIndex + 1,
          currentNodeIndex: 0,
        },
        currentScenario: scenarios[nextScenarioIndex],
        showDefenseTextbox: false,
        selectedActionButton: null,
      }));
    } else {
      // All clusters complete
      get().endGame();
    }
  },

  // End the game and show results
  endGame: () => {
    const { gameSession } = get();
    if (!gameSession) return;

    const updatedSession = { ...gameSession, completed: true };
    localStorage.setItem(
      `arce-session-${updatedSession.id}`,
      JSON.stringify(updatedSession)
    );

    set({
      gameSession: updatedSession,
      currentPhase: "results",
      showLogo: true, // Show logo at end
    });
  },

  // Reset the game
  resetGame: () => {
    set({
      gameSession: null,
      currentScenario: null,
      isLoading: false,
      error: null,
      showLogo: true,
      currentPhase: "input",
      selectedActionButton: null,
      showDefenseTextbox: false,
    });
  },

  // Toggle test mode
  toggleTestMode: () => {
    set((state) => ({
      testMode: !state.testMode,
    }));
  },
}));

// Mock feedback for different thermal states
function getMockFeedback(thermalState: ThermalState): string {
  const feedbackMap: Record<ThermalState, string> = {
    frost: "❄️ Your logic is shallow. This exposes a critical gap. Try again with deeper causality.",
    warning: "⚠️ You are on the right track, but your defense is incomplete. Why does this truly work?",
    ignition: "🔥 Deep causality detected! You have grasped the leverage point. This node is Ignited.",
    neutral: "Analyzing your response...",
  };
  return feedbackMap[thermalState] || "Evaluating...";
}
