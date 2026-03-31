"use client";

import { create } from "zustand";
import {
  CombatStore,
  BattleState,
  CombatEncounter,
  CombatBoss,
} from "@/types/combat";

/**
 * ACRE Combat Store - Zustand
 * Manages all battle state across the app
 * MVP: Uses mock scenarios (Phase 2 will connect to backend AI)
 */

export const useCombatStore = create<CombatStore>((set, get) => ({
  // Initial state
  battle_session_id: null,
  battle_state: null,
  is_loading: false,
  error: null,
  nodeContext: null,

  // Start a new battle — generates encounters from backend AI
  startBattle: async (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string) => {
    set({ is_loading: true, error: null });

    try {
      const formData = new FormData();
      if (payload.text) formData.append("text_material", payload.text);
      if (payload.url) formData.append("url", payload.url);
      if (payload.file) formData.append("file", payload.file);
      if (sourceTitle) formData.append("title", sourceTitle);

      // Better Auth uses cookies — no manual token needed
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-battle-scenarios`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate battle scenarios.");
      }

      const data = await res.json();

      // Map AI scenarios with 4 options (A, B, C, D)
      const mockEncounters: CombatEncounter[] = data.scenarios?.map((s: any, index: number) => {
        const optMap: Record<string, string> = {};
        s.options?.forEach((o: any) => {
          optMap[o.id] = o.text || o.action || "Option";
        });

        return {
          id: index + 1,
          scenario: `${s.title}\n\n${s.context}\n${s.question}`,
          options: {
            A: optMap["A"] || "Option A",
            B: optMap["B"] || "Option B",
            C: optMap["C"] || "Option C",
            D: optMap["D"] || "Option D",
          },
          correct_option: (s.correct_option || "A") as "A" | "B" | "C" | "D",
          win_feedback: `Masterful! Your understanding solved the crisis in "${s.title}".`,
          loss_feedback: `Critical Insight Missing: ${s.title}. ${s.context}`,
        };
      }) || [
        {
          id: 1,
          scenario: `Crisis: ${sourceTitle || "Challenge"}\n\nBased on your study material, you face a critical decision that tests your understanding of the core concepts.`,
          options: {
            A: "Focus on the root cause of the problem",
            B: "Apply a quick surface-level fix",
            C: "Ignore the problem and move forward",
            D: "Ask for help without analyzing first",
          },
          correct_option: "A",
          win_feedback: "🔥 CRITICAL HIT! You identified the root cause. Mastery confirmed.",
          loss_feedback: "The boss smiles. You missed the core principle. Understanding depth matters more than speed.",
        },
        {
          id: 2,
          scenario: `The next challenge arises: How do you approach this problem systematically?`,
          options: {
            A: "Build 10 quick versions and iterate",
            B: "Spend weeks perfecting one version",
            C: "Guess based on intuition",
            D: "Copy what others did",
          },
          correct_option: "A",
          win_feedback: "🔥 DEVASTATING BLOW! You understand that volume negates luck. The person after 10 reps is different.",
          loss_feedback: "The boss laughs. You're still optimizing for the wrong variable. Volume is the real variable.",
        },
        {
          id: 3,
          scenario: `Final test: Can you explain WHY your solution works?`,
          options: {
            A: "I understand the causal chain of events",
            B: "It worked for someone else",
            C: "I'm not sure but it seemed right",
            D: "I memorized the answer",
          },
          correct_option: "A",
          win_feedback: "🔥 FINISHING BLOW! You've transcended shallow learning. You own this concept.",
          loss_feedback: "The boss nods. You can apply but don't understand. Mastery requires causal depth.",
        },
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const boss: CombatBoss = {
        boss_name: "The Knowledge Guardian",
        intro_narrative: `You face a boss forged from your study material. It has ${mockEncounters.length} encounters designed to test your deep understanding. Prove your mastery by answering correctly!`,
        encounters: mockEncounters,
      };

      const battleState: BattleState = {
        boss,
        current_encounter_index: 0,
        player_hp: 100,
        boss_hp: 100,
        max_player_hp: 100,
        max_boss_hp: 100,
        battle_log: [],
        is_victory: false,
        is_defeat: false,
      };

      const sessionId = `battle-${Date.now()}`;
      localStorage.setItem(`acre-battle-${sessionId}`, JSON.stringify(battleState));

      set({
        battle_session_id: sessionId,
        battle_state: battleState,
        is_loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to start battle",
        is_loading: false,
      });
    }
  },

  // Submit an answer to an encounter
  submitAnswer: async (encounterId: number, choice: "A" | "B" | "C" | "D") => {
    const state = get();
    if (!state.battle_state) return;

    set({ is_loading: true, error: null });

    try {
      // Evaluate locally since the encounter already has the correct_option
      await new Promise((resolve) => setTimeout(resolve, 600));

      const encounter = state.battle_state.boss.encounters.find(
        (e) => e.id === encounterId
      );
      if (!encounter) throw new Error("Encounter not found");

      const isCorrect = choice === encounter.correct_option;
      
      // Scale damage so that a perfect run always kills the boss (total 100 dmg)
      const numEncounters = state.battle_state.boss.encounters.length;
      const damageDealt = isCorrect ? Math.ceil(100 / numEncounters) : 0;
      const damageTaken = isCorrect ? 0 : 20;

      const newPlayerHp = Math.max(0, state.battle_state.player_hp - damageTaken);
      const newBossHp = Math.max(0, state.battle_state.boss_hp - damageDealt);
      const newIndex = state.battle_state.current_encounter_index + 1;

      const newBattleState: BattleState = {
        ...state.battle_state,
        player_hp: newPlayerHp,
        boss_hp: newBossHp,
        current_encounter_index: newIndex,
        battle_log: [
          ...state.battle_state.battle_log,
          {
            timestamp: Date.now(),
            encounter_id: encounterId,
            player_choice: choice,
            was_correct: isCorrect,
            damage_dealt: damageDealt,
            damage_taken: damageTaken,
            feedback: isCorrect
              ? encounter.win_feedback
              : encounter.loss_feedback,
          },
        ],
        // Victory if boss HP hits 0 OR if all encounters are finished and player survived
        is_victory: newBossHp <= 0 || (newIndex >= numEncounters && newPlayerHp > 0),
        is_defeat: newPlayerHp <= 0,
      };

      if (state.battle_session_id) {
        localStorage.setItem(
          `acre-battle-${state.battle_session_id}`,
          JSON.stringify(newBattleState)
        );
      }

      set({
        battle_state: newBattleState,
        is_loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to submit answer",
        is_loading: false,
      });
    }
  },

  // Reset battle
  resetBattle: () => {
    set({
      battle_session_id: null,
      battle_state: null,
      is_loading: false,
      error: null,
      nodeContext: null,
    });
  },

  // Set node context for targeted quiz
  setNodeContext: (context) => {
    set({ nodeContext: context });
  },
}));
