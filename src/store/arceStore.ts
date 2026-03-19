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
  MOCK_CRISIS_SCENARIOS,
  getDefenseEvaluation,
  generateMockMasteryCard,
} from "@/utils/mockTestData";

interface ArceStore {
  // Session state
  gameSession: GameSession | null;
  currentScenario: CrisisScenario | null;
  isLoading: boolean;
  loadingProgress: number; // 0-100 for progress bars
  error: string | null;

  // UI state
  showLogo: boolean; // Logo only at start and end
  currentPhase: "input" | "playing" | "results"; // input = textarea, playing = action/defense, results = mastery cards
  selectedActionButton: string | null;
  showDefenseTextbox: boolean;

  // Actions
  startGame: (sourceContent: string, sourceTitle?: string) => Promise<void>;
  selectAction: (buttonId: string) => void;
  showDefense: () => void;
  submitDefense: (defense: string) => Promise<void>;
  nextNode: () => void;
  nextCluster: () => void;
  resetGame: () => void;
  endGame: () => void;
}

export const useArceStore = create<ArceStore>((set, get) => ({
  // Initial state
  gameSession: null,
  currentScenario: null,
  isLoading: false,
  loadingProgress: 0,
  error: null,
  showLogo: true, // Show logo at start
  currentPhase: "input",
  selectedActionButton: null,
  showDefenseTextbox: false,

  // Start a new game
  startGame: async (sourceContent: string, sourceTitle?: string) => {
    set({ isLoading: true, error: null, showLogo: true });

    try {
      // Mock API call for extraction
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Use mock clusters and get first scenario
      const firstScenario = MOCK_CRISIS_SCENARIOS[0];

      // Generate mock game session with FULL test data
      const mockSession: GameSession = {
        id: `session-${Date.now()}`,
        sourceContent,
        sourceTitle: sourceTitle || "Learning Session",
        clusters: MOCK_CLUSTERS,
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

      // Save to localStorage
      localStorage.setItem(
        `arce-session-${mockSession.id}`,
        JSON.stringify(mockSession)
      );

      set({
        gameSession: mockSession,
        currentScenario: firstScenario,
        isLoading: false,
        currentPhase: "playing",
        showLogo: false, // Hide logo after start
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to start game",
        isLoading: false,
      });
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

  // Submit the defense text
  submitDefense: async (defense: string) => {
    const { gameSession, currentScenario, selectedActionButton } = get();
    if (!gameSession || !currentScenario) return;

    set({ isLoading: true });

    try {
      // Mock API call for evaluation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get evaluation based on scenario + button + defense
      const evaluation = getDefenseEvaluation(
        currentScenario.id,
        selectedActionButton || "",
        defense.length
      );

      // Create response record
      const response: UserResponse = {
        id: `response-${Date.now()}`,
        scenarioId: currentScenario.id,
        defense,
        timestamp: Date.now(),
        thermalResult: evaluation.thermalState,
        feedback: evaluation.feedback,
        actionChoice: selectedActionButton || undefined,
      };

      // Update game session
      const updatedSession = { ...gameSession };
      updatedSession.responses.push(response);

      // Generate mastery card if ignition
      if (evaluation.thermalState === "ignition") {
        const masteryCard = generateMockMasteryCard(
          currentScenario.nodeId,
          defense,
          evaluation.thermalState
        );
        updatedSession.masteryCards.push(masteryCard);
      }

      // Update thermal values based on result
      if (evaluation.thermalState === "frost") {
        updatedSession.globalHeat = Math.max(0, updatedSession.globalHeat - 10);
        updatedSession.globalIntegrity = Math.max(
          0,
          updatedSession.globalIntegrity - 5
        );
      } else if (evaluation.thermalState === "warning") {
        updatedSession.globalHeat += 5;
        updatedSession.globalIntegrity += 3;
      } else if (evaluation.thermalState === "ignition") {
        updatedSession.globalHeat = Math.min(100, updatedSession.globalHeat + 25);
        updatedSession.globalIntegrity = Math.min(
          100,
          updatedSession.globalIntegrity + 15
        );
      }

      updatedSession.updatedAt = Date.now();
      localStorage.setItem(
        `arce-session-${updatedSession.id}`,
        JSON.stringify(updatedSession)
      );

      set({
        gameSession: updatedSession,
        isLoading: false,
        showDefenseTextbox: false,
        selectedActionButton: null,
        currentPhase: "playing", // Stay in playing for next scenario
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to submit defense",
        isLoading: false,
      });
    }
  },

  // Move to next node in cluster
  nextNode: () => {
    const { gameSession, currentScenario } = get();
    if (!gameSession || !currentScenario) return;

    // Find next scenario based on current response count
    const responseCount = gameSession.responses.length;
    const nextScenarioIndex = Math.min(
      responseCount,
      MOCK_CRISIS_SCENARIOS.length - 1
    );

    const nextScenario = MOCK_CRISIS_SCENARIOS[nextScenarioIndex];

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

  // Move to next cluster
  nextCluster: () => {
    const { gameSession } = get();
    if (!gameSession) return;

    if (gameSession.currentClusterIndex < gameSession.clusters.length - 1) {
      // Get next scenario
      const responseCount = gameSession.responses.length;
      const nextScenarioIndex = Math.min(
        responseCount,
        MOCK_CRISIS_SCENARIOS.length - 1
      );

      set((state) => ({
        gameSession: {
          ...state.gameSession!,
          currentClusterIndex: state.gameSession!.currentClusterIndex + 1,
          currentNodeIndex: 0,
        },
        currentScenario: MOCK_CRISIS_SCENARIOS[nextScenarioIndex],
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
