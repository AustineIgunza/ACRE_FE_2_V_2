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
import { saveNodeProgress, initNodeSRS, loadAllProgress } from "@/utils/progressStorage";

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
  nodeResults: Record<string, { accuracy: string; heatScore: number; feedback?: string }>; // Track eval results per node
  nodeAttemptCounts: Record<string, number>; // nodeId -> total attempts (for mastery gate)
  clarificationHistory: Record<string, Array<{ role: "user" | "ai"; content: string }>>; // nodeId -> chat messages
  meshResult: {
    synthesisScore: number;
    synthesisFeedback: string;
    collapseQuestion: string;
    collapseResponse: string;
    collapseFeedback: string;
  } | null;

  // Auth State
  user: User | null;
  sessionToken: string | null;
  authInitialized: boolean;

  // Hierarchy labels for current session
  currentUnitName: string;
  currentTopicName: string;

  // UI state
  showLogo: boolean; // Logo only at start and end
  currentPhase: "input" | "playing" | "results" | "extracting" | "clarification" | "challenge" | "transition" | "sanctuary" | "evaluation" | "interleaving" | "synchronization" | "mesh" | "debrief"; // input = textarea, playing = action/defense, results = mastery cards
  selectedActionButton: string | null;
  showDefenseTextbox: boolean;
  testMode: boolean; // Enable test mode to skip defenses
  correctButton: string | null; // Which button is correct in test mode

  // Actions
  startGame: (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string) => Promise<void>;
  extractLogic: (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string, unitName?: string) => Promise<void>;
  incrementAttempt: (nodeId: string) => void;
  addClarificationMessage: (nodeId: string, role: "user" | "ai", content: string) => void;
  clearClarificationHistory: (nodeId: string) => void;
  saveMeshResult: (result: NonNullable<ArceStore["meshResult"]>) => void;
  selectAction: (buttonId: string) => void;
  showDefense: () => void;
  submitDefense: (defense: string) => Promise<{ thermalState: ThermalState, feedback: string, keywords: string[], formalDefinition: string } | undefined>;
  submitDominoPrediction: (prediction: string) => Promise<void>;
  saveHeatmapData: () => Promise<void>;
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
  saveProgressToDatabase: (nodeId: string, heatScore: number, thermalState: ThermalState) => Promise<void>;
  saveUnitData: (unitId: string, unitData: any) => Promise<void>;
  loadUserUnits: () => Promise<any[]>;
  loadUserTopics: (unitId: string) => Promise<any[]>;
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
  nodeResults: {},
  nodeAttemptCounts: {},
  clarificationHistory: {},
  meshResult: null,
  currentUnitName: "",
  currentTopicName: "",
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
    const localAll = loadAllProgress();

    // If logged in, fetch from Supabase and merge (Supabase wins on conflict)
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (!error && data && data.length > 0) {
          // Merge Supabase records into localStorage, Supabase takes priority
          const merged = { ...localAll };
          for (const row of data) {
            const nodeId = row.node_id;
            merged[nodeId] = {
              ...(localAll[nodeId] || {}),
              nodeId,
              heatScore: row.heat_score ?? localAll[nodeId]?.heatScore ?? 0,
              thermalState: row.thermal_state ?? localAll[nodeId]?.thermalState ?? 'neutral',
              isIgnited: row.is_ignited ?? localAll[nodeId]?.isIgnited ?? false,
              lastAttempt: row.last_attempt ?? localAll[nodeId]?.lastAttempt ?? '',
            } as import('@/utils/progressStorage').NodeProgressData;
          }
          // Persist merged result back to localStorage
          try {
            localStorage.setItem('arce_node_progress', JSON.stringify(merged));
          } catch {}

          const progressMap: Record<string, number> = {};
          const details = Object.values(merged).map((node) => {
            progressMap[node.nodeId] = node.heatScore;
            return {
              nodeId: node.nodeId,
              heatScore: node.heatScore,
              isIgnited: node.isIgnited,
              lastAttempt: node.lastAttempt,
            };
          });
          set({ userProgress: progressMap, progressDetails: details });
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch progress from Supabase, falling back to localStorage:', err);
      }
    }

    // Fallback: load from localStorage only
    const progressMap: Record<string, number> = {};
    const details = Object.values(localAll).map((node) => {
      progressMap[node.nodeId] = node.heatScore;
      return {
        nodeId: node.nodeId,
        heatScore: node.heatScore,
        isIgnited: node.isIgnited,
        lastAttempt: node.lastAttempt,
      };
    });
    set({ userProgress: progressMap, progressDetails: details });
  },

  // New: Extract logic for Arcé iteration engine
  extractLogic: async (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string, unitName?: string) => {
    set({ isLoading: true, error: null, currentPhase: "extracting" });

    try {
      const formData = new FormData();
      if (payload.text) formData.append("text_material", payload.text);
      if (payload.url) formData.append("url", payload.url);
      if (payload.file) formData.append("file", payload.file);
      if (sourceTitle) formData.append("title", sourceTitle);

      const res = await fetch("/api/generate-scenarios", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Failed to extract logic. Status: ${res.status}`);
      const data = await res.json();
      
      // Map Logic Nodes to Arcé Phase 1 structure (free-text domino questions)
      const mappedScenarios: CrisisScenario[] = data.logic_nodes.map((node: any, index: number) => ({
        id: node.id || `node-${index}`,
        nodeId: node.id,
        crisisText: node.crisis_scenario,
        questionType: 'free-text', // Phase 1: Predictive Question, no multiple choice
        dominoQuestion: node.domino_question,
        formalMechanism: node.formal_mechanism,
        latexFormula: node.latex_formula,
        soWhat: node.so_what,
        stressTest: node.stress_test,
        actionButtons: [], // No buttons for Phase 1
        difficulty: 'level-1',
        // Include multiple choice data from API
        multiple_choice_question: node.multiple_choice_question,
        multiple_choice_options: node.multiple_choice_options,
      }));

      const aiClusterNodes: CausalAnchor[] = data.logic_nodes.map((node: any, index: number) => ({
        id: node.id || `node-${index}`,
        title: node.title || `Concept ${index + 1}`,
        description: node.invariant || "",
        thermalState: "neutral" as const,
        heat: 0,
        integrity: 0,
      }));

      const aiCluster: Cluster = {
        id: `cluster-${Date.now()}`,
        clusterIndex: 0,
        title: sourceTitle || "Learning Session",
        description: `${data.logic_nodes.length} logic nodes extracted from your study material`,
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
        currentPhase: "clarification",
        showLogo: false,
        currentTopicName: sourceTitle || data.inferred_topic || "",
        currentUnitName: unitName || data.inferred_unit || "",
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to extract logic", isLoading: false, currentPhase: "input" });
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

      const legacyResponse: any = {
        id: `response-${Date.now()}`,
        scenarioId: currentScenario.id,
        defense: defense || "[TEST MODE - NO DEFENSE]",
        timestamp: Date.now(),
        thermalResult: evaluation.thermalState,
        feedback: evaluation.feedback,
      };

      const updatedSession = { ...gameSession };
      updatedSession.responses.push(legacyResponse);

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

  // Phase 1: Submit domino effect prediction
  submitDominoPrediction: async (prediction: string) => {
    const state = useArceStore.getState();
    if (!state.currentScenario) return;

    set({ isLoading: true });
    
    try {
      // Call evaluate endpoint to score the prediction
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: state.currentScenario.nodeId,
          prediction: prediction,
          question: state.currentScenario.dominoQuestion,
          formalMechanism: state.currentScenario.formalMechanism,
          soWhat: state.currentScenario.soWhat,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate prediction");
      const result = await response.json();

      console.log("Evaluation result:", result);

      // Store evaluation result for this node (for heatmap generation)
      const nodeId = state.currentScenario.nodeId || state.currentScenario.id;
      // Use the actual score from evaluation (0-100), not fixed accuracy mapping
      const heatScore = result.score || (result.accuracy === "ignition" ? 100 : result.accuracy === "warning" ? 50 : 25);

      const updatedNodeResults = {
        ...state.nodeResults,
        [nodeId]: { accuracy: result.accuracy, heatScore, feedback: result.feedback, thermalState: result.thermalState }
      };

      // Save to localStorage (primary persistence — survives page refresh)
      {
        const cluster = state.gameSession?.clusters[state.gameSession.currentClusterIndex];
        const clusterNode = cluster?.nodes.find((n: any) => n.id === nodeId);
        const title = clusterNode?.title || nodeId;
        const thermalStateVal = result.accuracy === "ignition" ? "ignition"
          : result.accuracy === "warning" ? "warning" : "frost";
        saveNodeProgress(nodeId, {
          nodeId,
          title,
          heatScore,
          thermalState: thermalStateVal,
          isIgnited: result.accuracy === "ignition",
          lastAttempt: new Date().toISOString(),
          unitName: state.currentUnitName || undefined,
          unitId: state.currentUnitName ? state.currentUnitName.toLowerCase().replace(/\s+/g, '-') : undefined,
          topicName: state.currentTopicName || undefined,
          topicId: state.currentTopicName ? state.currentTopicName.toLowerCase().replace(/\s+/g, '-') : nodeId.split('-').slice(0, 2).join('-'),
          crisisText: state.currentScenario.crisisText,
          formalMechanism: state.currentScenario.formalMechanism,
          latexFormula: state.currentScenario.latexFormula,
          soWhat: state.currentScenario.soWhat,
          stressTest: state.currentScenario.stressTest,
          dominoQuestion: state.currentScenario.dominoQuestion,
          multiple_choice_question: state.currentScenario.multiple_choice_question,
          multiple_choice_options: state.currentScenario.multiple_choice_options,
        });
        initNodeSRS(nodeId, heatScore);
      }

      // Advance to Phase 2: Breakthrough Transition
      set({
        isLoading: false,
        currentPhase: "transition",
        nodeResults: updatedNodeResults,
      });
    } catch (error) {
      console.error("Error evaluating prediction:", error);
      // Still advance even if evaluation fails
      set({
        isLoading: false,
        currentPhase: "transition",
      });
    }
  },

  // Save heatmap data when all nodes are complete
  saveHeatmapData: async () => {
    const state = useArceStore.getState();
    if (!state.gameSession) return;

    // Persist all node results to localStorage
    const sessionTitle = state.gameSession.sourceTitle || "Learning Session";
    const unitName = state.currentUnitName || "Uncategorized";
    const topicName = state.currentTopicName || sessionTitle;
    Object.entries(state.nodeResults).forEach(([nodeId, result]) => {
      const cluster = state.gameSession?.clusters[state.gameSession.currentClusterIndex];
      const clusterNode = cluster?.nodes.find((n: any) => n.id === nodeId);
      const title = clusterNode?.title || nodeId;
      saveNodeProgress(nodeId, {
        nodeId,
        title,
        heatScore: result.heatScore,
        thermalState: result.accuracy === "ignition" ? "ignition" : result.accuracy === "warning" ? "warning" : "frost",
        isIgnited: result.accuracy === "ignition",
        lastAttempt: new Date().toISOString(),
        unitName,
        unitId: unitName.toLowerCase().replace(/\s+/g, '-'),
        topicName,
        topicId: topicName.toLowerCase().replace(/\s+/g, '-'),
      });
    });
  },

  // Save user progress to Supabase (persistent across sessions)
  saveProgressToDatabase: async (nodeId: string, heatScore: number, thermalState: ThermalState) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          node_id: nodeId,
          heat_score: heatScore,
          is_ignited: thermalState === 'ignition',
          thermal_state: thermalState,
          last_attempt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error && Object.keys(error).length > 0) {
        console.warn("Progress sync error (localStorage is primary):", error);
      }
    } catch {
      // localStorage is primary — Supabase sync is best-effort
    }
  },

  // Save unit data (topic collection)
  saveUnitData: async (unitId: string, unitData: any) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_units')
        .upsert({
          id: unitId,
          user_id: user.id,
          title: unitData.title,
          description: unitData.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data: unitData,
        }, { onConflict: 'id,user_id' });

      if (error) {
        console.error("Error saving unit:", error);
      } else {
        console.log("Unit saved:", unitId);
      }
    } catch (err) {
      console.warn("Failed to save unit:", err);
    }
  },

  // Load all user units
  loadUserUnits: async () => {
    const { user } = get();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_units')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        if (error.code !== 'PGRST205') {
          console.error("Error loading units:", error);
        }
        return [];
      }

      return data || [];
    } catch (err) {
      console.warn("Failed to load units:", err);
      return [];
    }
  },

  // Mastery gate: track attempt count per node
  incrementAttempt: (nodeId: string) => {
    set((state) => ({
      nodeAttemptCounts: {
        ...state.nodeAttemptCounts,
        [nodeId]: (state.nodeAttemptCounts[nodeId] || 0) + 1,
      },
    }));
  },

  // Clarification chat: add a message to a node's history
  addClarificationMessage: (nodeId: string, role: "user" | "ai", content: string) => {
    set((state) => ({
      clarificationHistory: {
        ...state.clarificationHistory,
        [nodeId]: [...(state.clarificationHistory[nodeId] || []), { role, content }],
      },
    }));
  },

  // Clear clarification history for a node (e.g. on retry)
  clearClarificationHistory: (nodeId: string) => {
    set((state) => ({
      clarificationHistory: {
        ...state.clarificationHistory,
        [nodeId]: [],
      },
    }));
  },

  // Save logic mesh synthesis result
  saveMeshResult: (result) => {
    set({ meshResult: result });
  },

  // Load all topics for a unit
  loadUserTopics: async (unitId: string) => {
    const { user } = get();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_topics')
        .select('*')
        .eq('user_id', user.id)
        .eq('unit_id', unitId);

      if (error) {
        if (error.code !== 'PGRST205') {
          console.error("Error loading topics:", error);
        }
        return [];
      }

      return data || [];
    } catch (err) {
      console.warn("Failed to load topics:", err);
      return [];
    }
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
