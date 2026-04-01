"use client";

import { create } from "zustand";
import {
  LearnPhase,
  ExtractedDocument,
  LogicNode,
  IntelCard,
  StressTest,
  LearnSession,
  UserResponse,
  ThermalState,
} from "@/types/arce";
import { authClient } from "@/lib/authClient";

// Lightweight user type matching Better Auth's session.user
interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface ArceStore {
  // ── AUTH STATE ──
  user: AuthUser | null;
  authInitialized: boolean;
  initAuth: () => void;
  logout: () => Promise<void>;

  // ── PHASE STATE MACHINE ──
  currentPhase: LearnPhase;
  setPhase: (phase: LearnPhase) => void;

  // ── SESSION ──
  session: LearnSession | null;
  isLoading: boolean;
  error: string | null;

  // ── DOCUMENT & NODES ──
  document: ExtractedDocument | null;
  currentNodeIndex: number;
  currentNode: LogicNode | null;

  // ── CHALLENGE ZONE (Phase 1) ──
  userDominoChain: string;
  setUserDominoChain: (chain: string) => void;

  // ── INTEL CARD (Phase 3) ──
  currentIntelCard: IntelCard | null;

  // ── STRESS TEST (Phase 4) ──
  currentStressTest: StressTest | null;

  // ── PROGRESS ──
  completedNodeIds: string[];
  userProgress: Record<string, number>;
  progressDetails: { nodeId: string; heatScore: number; isIgnited: boolean; lastAttempt: string }[];

  // ── TEST MODE ──
  testMode: boolean;
  toggleTestMode: () => void;

  // ── ACTIONS ──
  // Phase 0: Extract Logic from source material
  extractLogic: (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string) => Promise<void>;

  // Phase 1→2→3: Submit domino chain → evaluate → produce Intel Card
  submitDominoChain: () => Promise<void>;

  // Phase 4: Generate stress test
  generateStressTest: () => Promise<void>;

  // Phase 5: Synchronize and advance to next node
  synchronizeAndAdvance: () => void;

  // Navigation
  resetGame: () => void;
  fetchProgress: () => Promise<void>;
}

export const useArceStore = create<ArceStore>((set, get) => ({
  // ── AUTH ──
  user: null,
  authInitialized: false,

  initAuth: () => {
    authClient.getSession().then(({ data }) => {
      const user = data?.user ?? null;
      set({
        user: user ? { id: user.id, name: user.name, email: user.email, image: user.image } : null,
        authInitialized: true
      });
      if (user) get().fetchProgress();
    });
  },

  logout: async () => {
    await authClient.signOut();
    set({ user: null, session: null, userProgress: {} });
  },

  // ── PHASE STATE ──
  currentPhase: "input",
  setPhase: (phase) => set({ currentPhase: phase }),

  // ── SESSION ──
  session: null,
  isLoading: false,
  error: null,

  // ── DOCUMENT & NODES ──
  document: null,
  currentNodeIndex: 0,
  currentNode: null,

  // ── CHALLENGE (Phase 1) ──
  userDominoChain: "",
  setUserDominoChain: (chain) => set({ userDominoChain: chain }),

  // ── INTEL CARD (Phase 3) ──
  currentIntelCard: null,

  // ── STRESS TEST (Phase 4) ──
  currentStressTest: null,

  // ── PROGRESS ──
  completedNodeIds: [],
  userProgress: {},
  progressDetails: [],

  // ── TEST MODE ──
  testMode: false,
  toggleTestMode: () => set((s) => ({ testMode: !s.testMode })),

  // ═════════════════════════════════════════════
  // PHASE 0: ATOMIC LOGIC EXTRACTION
  // ═════════════════════════════════════════════
  extractLogic: async (payload, sourceTitle) => {
    set({ isLoading: true, error: null, currentPhase: "extracting" });

    try {
      // If text is provided, use the extract endpoint first for chunking
      // Then use generate-scenarios as fallback for multimodal
      let extractedDoc: ExtractedDocument | null = null;

      if (payload.text && payload.text.length >= 50) {
        // Direct text extraction via extract endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sourceText: payload.text })
        });

        if (!res.ok) throw new Error("Extraction failed");
        const data = await res.json();

        extractedDoc = {
          total_nodes: data.total_nodes || data.nodes?.length || 0,
          topic_title: data.topic_title || sourceTitle || "Learning Session",
          nodes: data.nodes || []
        };
      } else {
        // For files/URLs, use the generate-scenarios endpoint with FormData
        const formData = new FormData();
        if (payload.text) formData.append("text_material", payload.text);
        if (payload.url) formData.append("url", payload.url);
        if (payload.file) formData.append("file", payload.file);
        if (sourceTitle) formData.append("title", sourceTitle);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-scenarios`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!res.ok) throw new Error("Scenario generation failed");
        const data = await res.json();

        // Map the legacy scenario format to new LogicNode format
        extractedDoc = {
          total_nodes: data.scenarios?.length || 0,
          topic_title: data.unitTitle || sourceTitle || "Learning Session",
          nodes: (data.scenarios || []).map((s: any, i: number) => ({
            id: s.id || `node-${i}`,
            title: s.title || `Concept ${i + 1}`,
            core_logic: s.context || "",
            latex_formula: "",
            so_what: "",
            crisis_context: `${s.context}\n${s.question}`,
            domino_question: s.question || "Walk through the Domino Effect of this scenario.",
            dashboard_indicator: "Metric Loading..."
          }))
        };
      }

      if (!extractedDoc || extractedDoc.nodes.length === 0) {
        throw new Error("No logic nodes extracted");
      }

      const newSession: LearnSession = {
        id: `session-${Date.now()}`,
        sourceContent: payload.text || payload.url || payload.file?.name || "",
        sourceTitle: sourceTitle || extractedDoc.topic_title,
        document: extractedDoc,
        currentNodeIndex: 0,
        completedNodeIds: [],
        responses: [],
        globalHeat: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set({
        document: extractedDoc,
        session: newSession,
        currentNodeIndex: 0,
        currentNode: extractedDoc.nodes[0],
        isLoading: false,
        currentPhase: "challenge", // Move to Phase 1
        userDominoChain: "",
        currentIntelCard: null,
        currentStressTest: null,
        completedNodeIds: [],
      });

    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to extract logic",
        isLoading: false,
        currentPhase: "input"
      });
    }
  },

  // ═════════════════════════════════════════════
  // PHASE 1→2→3: SUBMIT DOMINO CHAIN → EVALUATE
  // ═════════════════════════════════════════════
  submitDominoChain: async () => {
    const { currentNode, userDominoChain, testMode } = get();
    if (!currentNode) return;

    if (!testMode && userDominoChain.trim().length < 20) {
      set({ error: "Your domino chain must be at least 20 characters. Trace the full logic." });
      return;
    }

    set({ isLoading: true, error: null, currentPhase: "transition" });

    try {
      let intelCard: IntelCard;

      if (testMode) {
        // Test mode: skip real eval
        await new Promise((r) => setTimeout(r, 1500));
        intelCard = {
          nodeId: currentNode.id,
          title: currentNode.title,
          formalMechanism: currentNode.core_logic,
          latexFormula: currentNode.latex_formula,
          soWhat: currentNode.so_what || "🔥 TEST MODE: Logic chain accepted.",
          keywords: ["test", "mode"],
          accuracy: "ignition",
          chainAnalysis: "Test mode — auto-approved.",
          heatDelta: 30,
        };
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluate-logic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nodeId: currentNode.id,
            userDominoChain,
            crisisContext: currentNode.crisis_context,
            dominoQuestion: currentNode.domino_question,
            coreLogic: currentNode.core_logic,
            latexFormula: currentNode.latex_formula,
            soWhat: currentNode.so_what,
          })
        });

        if (!res.ok) throw new Error("Evaluation failed");
        const data = await res.json();
        const ev = data.evaluation;

        intelCard = {
          nodeId: currentNode.id,
          title: ev.intel_card_title || currentNode.title,
          formalMechanism: ev.formal_mechanism,
          latexFormula: ev.latex_formula || currentNode.latex_formula,
          soWhat: ev.so_what,
          keywords: ev.keywords || [],
          accuracy: ev.accuracy.toLowerCase() as ThermalState,
          chainAnalysis: ev.chain_analysis,
          heatDelta: ev.heat_score_delta || 0,
        };
      }

      // Brief pause for transition animation
      await new Promise((r) => setTimeout(r, 800));

      set({
        currentIntelCard: intelCard,
        isLoading: false,
        currentPhase: "sanctuary", // Move to Phase 3
      });

    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Evaluation failed",
        isLoading: false,
        currentPhase: "challenge", // Go back to challenge
      });
    }
  },

  // ═════════════════════════════════════════════
  // PHASE 4: GENERATE STRESS TEST
  // ═════════════════════════════════════════════
  generateStressTest: async () => {
    const { currentNode, currentIntelCard, userDominoChain, testMode } = get();
    if (!currentNode || !currentIntelCard) return;

    set({ isLoading: true, error: null });

    try {
      let stressTest: StressTest;

      if (testMode) {
        await new Promise((r) => setTimeout(r, 1000));
        stressTest = {
          counterVariable: "Test Counter-Variable",
          updatedDashboardIndicator: "Test Metric: 99% ↑",
          stressQuestion: "🧪 TEST MODE: If this logic breaks under pressure, what's the failure mode?",
          hint: "Think about the edge case.",
        };
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stress-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            crisisContext: currentNode.crisis_context,
            intelCardTitle: currentIntelCard.title,
            formalMechanism: currentIntelCard.formalMechanism,
            latexFormula: currentIntelCard.latexFormula,
            soWhat: currentIntelCard.soWhat,
            userDominoChain,
          })
        });

        if (!res.ok) throw new Error("Stress test generation failed");
        const data = await res.json();
        const st = data.stressTest;

        stressTest = {
          counterVariable: st.counter_variable,
          updatedDashboardIndicator: st.updated_dashboard_indicator,
          stressQuestion: st.stress_question,
          hint: st.hint,
        };
      }

      set({
        currentStressTest: stressTest,
        isLoading: false,
        currentPhase: "evaluation", // Move to Phase 4
      });

    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Stress test failed",
        isLoading: false,
      });
    }
  },

  // ═════════════════════════════════════════════
  // PHASE 5: SYNCHRONIZE AND ADVANCE
  // ═════════════════════════════════════════════
  synchronizeAndAdvance: () => {
    const { document, currentNodeIndex, currentIntelCard, session, completedNodeIds, currentNode, userDominoChain } = get();
    if (!document || !session || !currentNode) return;

    const newCompleted = [...completedNodeIds, currentNode.id];
    const nextIndex = currentNodeIndex + 1;
    const hasMoreNodes = nextIndex < document.nodes.length;

    // Update responses
    const newResponse: UserResponse = {
      id: `resp-${Date.now()}`,
      nodeId: currentNode.id,
      userDominoChain,
      timestamp: Date.now(),
      accuracy: currentIntelCard?.accuracy || "neutral",
      intelCard: currentIntelCard,
    };
    const newResponses = [...session.responses, newResponse];

    // Update heat
    const heatDelta = currentIntelCard?.heatDelta || 0;
    const newGlobalHeat = Math.min(100, Math.max(0, session.globalHeat + heatDelta));

    set({ currentPhase: "synchronization" });

    // Brief sync animation, then advance
    setTimeout(() => {
      if (hasMoreNodes) {
        set({
          currentNodeIndex: nextIndex,
          currentNode: document.nodes[nextIndex],
          currentIntelCard: null,
          currentStressTest: null,
          userDominoChain: "",
          completedNodeIds: newCompleted,
          currentPhase: "challenge", // Back to Phase 1 for next node
          session: {
            ...session,
            currentNodeIndex: nextIndex,
            completedNodeIds: newCompleted,
            responses: newResponses,
            globalHeat: newGlobalHeat,
            updatedAt: Date.now(),
          },
        });
      } else {
        // All nodes complete
        set({
          completedNodeIds: newCompleted,
          currentPhase: "debrief", // Move to Debrief summary
          session: {
            ...session,
            completedNodeIds: newCompleted,
            responses: newResponses,
            globalHeat: newGlobalHeat,
            updatedAt: Date.now(),
          },
        });
      }
    }, 2000);

    get().fetchProgress();
  },

  // ═════════════════════════════════════════════
  // NAVIGATION
  // ═════════════════════════════════════════════
  resetGame: () => {
    set({
      session: null,
      document: null,
      currentNode: null,
      currentNodeIndex: 0,
      currentIntelCard: null,
      currentStressTest: null,
      userDominoChain: "",
      completedNodeIds: [],
      isLoading: false,
      error: null,
      currentPhase: "input",
    });
  },

  fetchProgress: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-progress`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data?.nodes) {
        const progressMap: Record<string, number> = {};
        const details = data.nodes.map((row: any) => {
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
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
  },
}));
