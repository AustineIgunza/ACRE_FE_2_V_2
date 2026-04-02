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
 * Now connected to the backend AI for real encounter generation
 */

export const useCombatStore = create<CombatStore>((set, get) => ({
  // Initial state
  battle_session_id: null,
  battle_state: null,
  is_loading: false,
  error: null,

  // Start a new battle — calls backend AI to generate encounters
  startBattle: async (payload: { text?: string; url?: string; file?: File }, sourceTitle?: string) => {
    set({ is_loading: true, error: null });

    try {
      // Get auth token from supabase (read from localStorage to avoid importing arceStore)
      let authToken: string | null = null;
      try {
        const storageKey = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (storageKey) {
          const authData = JSON.parse(localStorage.getItem(storageKey) || "{}");
          authToken = authData?.access_token || null;
        }
      } catch { /* ignore */ }

      const formData = new FormData();
      if (payload.text) formData.append("text_material", payload.text);
      if (payload.url) formData.append("url", payload.url);
      if (payload.file) formData.append("file", payload.file);
      if (sourceTitle) formData.append("title", sourceTitle);

      // Call the NEW dedicated battle scenario endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-battle-scenarios`, {
        method: 'POST',
        headers: {
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || errData.error || "Failed to generate battle scenarios.");
      }
      
      const data = await res.json();

      // Map AI scenarios with 4 options (A, B, C, D)
      const encounters: CombatEncounter[] = data.scenarios.map((s: any, index: number) => {
        const optMap: Record<string, string> = {};
        s.options.forEach((o: any) => {
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
          win_feedback: `Masterful! Your thermal logic solved the crisis in "${s.title}".`,
          loss_feedback: `Critical Insight Missing: ${s.title}. ${s.context}`,
        };
      });

      const boss: CombatBoss = {
        boss_name: sourceTitle || "The Knowledge Guardian",
        intro_narrative: `You are about to face a boss forged from your study material. It has ${encounters.length} encounters designed to test your deep understanding. Prove your mastery!`,
        encounters,
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
    });
  },


}));
