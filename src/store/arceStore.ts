"use client";

import { create } from "zustand";
import {
  GameSession,
  Cluster,
  CausalAnchor,
  CrisisScenario,
  UserResponse,
  ThermalState,
  MasteryCard,
} from "@/types/arce";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface ArceStore {
  // Session state
  gameSession: GameSession | null;
  scenarios: CrisisScenario[];
  currentScenario: CrisisScenario | null;
  pendingNextScenario: CrisisScenario | null; // For holding on-the-fly generated variations
  isLoading: boolean;
  loadingProgress: number; // 0-100 for progress bars
  error: string | null;

  // Progress State
  userProgress: Record<string, number>; // Maps nodeId -> heatScore
  progressDetails: { nodeId: string; heatScore: number; isIgnited: boolean; lastAttempt: string }[]; // Full rows

  // Auth State
  user: User | null;
  sessionToken: string | null;
  authInitialized: boolean;

  // UI state
  showLogo: boolean; // Logo only at start and end
  currentPhase: "input" | "playing" | "results"; // input = textarea, playing = action/defense, results = mastery cards
  selectedActionButton: string | null;
  showDefenseTextbox: boolean;
  testMode: boolean; // Enable test mode to skip defenses
  correctButton: string | null; // Which button is correct in test mode

  // Actions
  startGame: (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string) => Promise<void>;
  selectAction: (buttonId: string) => void;
  showDefense: () => void;
  submitDefense: (defense: string) => Promise<{ thermalState: ThermalState, feedback: string, keywords: string[], formalDefinition: string } | undefined>;
  nextNode: () => void;
  nextCluster: () => void;
  resetGame: () => void;
  endGame: () => void;
  toggleTestMode: () => void;
  
  // Auth Actions
  initAuth: () => void;
  logout: () => Promise<void>;
  
  // Progress Actions
  fetchProgress: () => Promise<void>;
}

export const useArceStore = create<ArceStore>((set, get) => ({
  // Initial state
  gameSession: null,
  scenarios: [],
  currentScenario: null,
  pendingNextScenario: null,
  isLoading: false,
  loadingProgress: 0,
  error: null,
  userProgress: {},
  progressDetails: [],
  showLogo: true, // Show logo at start
  currentPhase: "input",
  selectedActionButton: null,
  showDefenseTextbox: false,
  testMode: false,
  correctButton: null,

  // Auth initial state
  user: null,
  sessionToken: null,
  authInitialized: false,

  // Initialize auth listener
  initAuth: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ 
        user: session?.user ?? null, 
        sessionToken: session?.access_token ?? null,
        authInitialized: true
      });
      if (session?.user) get().fetchProgress();
    });

    // Listen for changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        user: session?.user ?? null, 
        sessionToken: session?.access_token ?? null,
        authInitialized: true
      });
      if (session?.user) get().fetchProgress();
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, sessionToken: null, gameSession: null, userProgress: {} });
  },

  fetchProgress: async () => {
    const { user } = get();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('node_id, heat_score, is_ignited, last_attempt');
      
    if (error) {
      console.error("Failed to fetch progress. Supabase explicitly says:", error.message, "Code:", error.code, "Details:", error.details);
      return;
    }
    
    if (data) {
      const progressMap: Record<string, number> = {};
      const details = data.map(row => {
        progressMap[row.node_id] = row.heat_score;
        return {
          nodeId: row.node_id,
          heatScore: row.heat_score,
          isIgnited: row.is_ignited,
          lastAttempt: row.last_attempt,
        };
      });
      set({ userProgress: progressMap, progressDetails: details });
    }
  },

  startGame: async (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string) => {
    set({ isLoading: true, error: null, showLogo: true });

    try {
      const { sessionToken } = get();

      const formData = new FormData();
      if (payload.text) formData.append("text_material", payload.text);
      if (payload.url) formData.append("url", payload.url);
      if (payload.file) formData.append("file", payload.file);
      if (sourceTitle) formData.append("title", sourceTitle);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-scenarios`, {
         method: 'POST',
         headers: { 
           ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
         },
         body: formData
      });
      if (!res.ok) throw new Error("Failed to generate scenarios from backend.");
      const data = await res.json();
      
      const mappedScenarios: CrisisScenario[] = data.scenarios.map((s: any, index: number) => {
        const slug = (s.title || `concept-${index}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return {
          id: s.id || `scenario-${index}`,
          nodeId: slug,
          crisisText: `${s.title}\n\n${s.context}\n${s.question}`,
          questionType: 'multiple-choice',
          actionButtons: s.options?.map((opt: any, i: number) => ({
            id: opt.id || `btn-${i}`,
            label: opt.text || opt.action,
            order: i + 1
          })) || [],
          difficulty: 'level-2'
        };
      });

      // Build clusters dynamically from the AI-generated scenarios
      const aiClusterNodes: CausalAnchor[] = data.scenarios.map((s: any, index: number) => ({
        id: s.id || `node-${index}`,
        title: s.title || `Concept ${index + 1}`,
        description: s.context || "",
        thermalState: "neutral" as const,
        heat: 0,
        integrity: 0,
      }));

      const aiCluster: Cluster = {
        id: `cluster-${Date.now()}`,
        clusterIndex: 0,
        title: sourceTitle || "Learning Session",
        description: `${data.scenarios.length} concepts extracted from your study material`,
        status: "unlocked",
        nodes: aiClusterNodes,
      };

      const gameSession: GameSession = {
        id: `session-${Date.now()}`,
        sourceContent: payload.text || payload.url || payload.file?.name || "Multimodal Document",
        sourceTitle: sourceTitle || "Learning Session",
        clusters: [aiCluster],
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

      localStorage.setItem(`arce-session-${gameSession.id}`, JSON.stringify(gameSession));

      set({
        gameSession,
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

    if (!testMode && defense !== "[Tactical Strike - No Defense Required]" && defense.length < 20) {
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
        const { sessionToken, user } = get();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluate`, {
           method: 'POST',
           headers: { 
             'Content-Type': 'application/json',
             ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
           },
           body: JSON.stringify({ 
             scenarioId: currentScenario.id, 
             userChoice: selectedActionButton, 
             userDefense: defense,
             userId: user?.id || "" 
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

      // If Frost, trigger Parallel Variation logic
      let generatedVariation = null;
      if (evaluation.thermalState === "frost") {
        try {
          const { sessionToken } = get();
          const varRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-variation`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}) },
             body: JSON.stringify({ 
               originalContext: currentScenario.crisisText, 
               originalQuestion: currentScenario.questionType, 
               variationType: 'parallel' 
             })
          });
          if (varRes.ok) {
            const varData = await varRes.json();
            generatedVariation = {
              id: varData.scenario.id || `scenario-var-${Date.now()}`,
              nodeId: currentScenario.nodeId,
              crisisText: `❄️ PARALLEL VARIATION\n\n${varData.scenario.title}\n\n${varData.scenario.context}\n${varData.scenario.question}`,
              questionType: "multiple-choice" as const,
              actionButtons: varData.scenario.options?.map((opt: any, i: number) => ({ id: opt.id || `btn-${i}`, label: opt.text || opt.action, order: i + 1 })) || [],
              difficulty: "level-2" as const
            };
          }
        } catch (err) {
          console.warn("Failed to generate parallel variation", err);
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
        const masteryCard: MasteryCard = {
          id: `mastery-${currentScenario.nodeId}-${Date.now()}`,
          nodeId: currentScenario.nodeId,
          formalDefinition: evaluation.formalDefinition || evaluation.feedback,
          keywords: evaluation.keywords || [],
          createdAt: Date.now(),
        };
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
        pendingNextScenario: generatedVariation || null,
      });

      // Refresh progress from DB so dashboard stays in sync
      get().fetchProgress();

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

  nextNode: async () => {
    const { gameSession, currentScenario, scenarios, pendingNextScenario, sessionToken, testMode } = get();
    if (!gameSession || !currentScenario) return;

    if (pendingNextScenario) {
       scenarios.push(pendingNextScenario);
       set((state) => ({
         scenarios: [...scenarios],
         gameSession: { ...state.gameSession! },
         currentScenario: pendingNextScenario,
         showDefenseTextbox: false,
         selectedActionButton: null,
         pendingNextScenario: null,
       }));
       return;
    }

    // Black Swan Integration
    const recentResponses = gameSession.responses.slice(-3);
    const hasThreeIgnitions = recentResponses.length >= 3 && recentResponses.every(r => r.thermalResult === 'ignition');
    
    set({ isLoading: true });

    let nextScenario = null;
    if (hasThreeIgnitions) {
       try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-variation`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}) },
             body: JSON.stringify({ 
               originalContext: currentScenario.crisisText, 
               originalQuestion: currentScenario.questionType, 
               variationType: 'black-swan' 
             })
         });
         if (res.ok) {
           const data = await res.json();
           nextScenario = {
             id: data.scenario.id || `scenario-bs-${Date.now()}`,
             nodeId: currentScenario.nodeId,
             crisisText: `🚨 BLACK SWAN EVENT\n\n${data.scenario.title}\n\n${data.scenario.context}\n${data.scenario.question}`,
             questionType: 'multiple-choice' as const,
             actionButtons: data.scenario.options?.map((opt: any, i: number) => ({ id: opt.id || `btn-${i}`, label: opt.text || opt.action, order: i + 1 })) || [],
             difficulty: 'level-3' as const
           };
           scenarios.push(nextScenario);
           set({ scenarios });
         }
       } catch (err) {
         console.warn("Black Swan failed:", err);
       }
    }

    if (!nextScenario) {
      const responseCount = gameSession.responses.length;
      const nextScenarioIndex = Math.min(responseCount, scenarios.length - 1);
      nextScenario = scenarios[nextScenarioIndex] || scenarios[scenarios.length - 1]; // fallback to last
    }

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
      isLoading: false,
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
