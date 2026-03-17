"use client";

import { create } from "zustand";
import {
  CombatStore,
  BattleState,
  CombatEncounter,
  EXAMPLE_COMBAT_BOSS,
} from "@/types/combat";

/**
 * ACRE Combat Store - Zustand
 * Manages all battle state across the app
 */

export const useCombatStore = create<CombatStore>((set, get) => ({
  // Initial state
  battle_session_id: null,
  battle_state: null,
  is_loading: false,
  error: null,

  // Start a new battle
  startBattle: async (sourceContent: string, sourceTitle?: string) => {
    set({ is_loading: true, error: null });

    try {
      // Mock API call for Day 1 - will connect to real backend on Day 2
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock battle state
      const mockBattleState: BattleState = {
        boss: EXAMPLE_COMBAT_BOSS,
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

      // Save to localStorage
      localStorage.setItem(
        `acre-battle-${sessionId}`,
        JSON.stringify(mockBattleState)
      );

      set({
        battle_session_id: sessionId,
        battle_state: mockBattleState,
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
      // Mock API call - will connect to real backend on Day 2
      await new Promise((resolve) => setTimeout(resolve, 600));

      const encounter = state.battle_state.boss.encounters.find(
        (e) => e.id === encounterId
      );
      if (!encounter) throw new Error("Encounter not found");

      const isCorrect = choice === encounter.correct_option;
      const damageDealt = isCorrect ? 25 : 0;
      const damageTaken = isCorrect ? 0 : 15;

      // Update battle state
      const newBattleState: BattleState = {
        ...state.battle_state,
        player_hp: Math.max(0, state.battle_state.player_hp - damageTaken),
        boss_hp: Math.max(0, state.battle_state.boss_hp - damageDealt),
        current_encounter_index:
          state.battle_state.current_encounter_index + 1,
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
        is_victory:
          state.battle_state.boss_hp - damageDealt <= 0 ||
          state.battle_state.current_encounter_index >=
            state.battle_state.boss.encounters.length,
        is_defeat: state.battle_state.player_hp - damageTaken <= 0,
      };

      // Save to localStorage
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

  // Derived state: current encounter
  get current_encounter(): CombatEncounter | null {
    const state = get();
    if (!state.battle_state) return null;
    return (
      state.battle_state.boss.encounters[
        state.battle_state.current_encounter_index
      ] || null
    );
  },

  // Derived state: is battle active
  get is_battle_active(): boolean {
    const state = get();
    return !!(state.battle_state &&
      !state.battle_state.is_victory &&
      !state.battle_state.is_defeat);
  },

  // Derived state: player HP percentage
  get player_hp_percent(): number {
    const state = get();
    if (!state.battle_state) return 100;
    return (
      (state.battle_state.player_hp /
        state.battle_state.max_player_hp) *
      100
    );
  },

  // Derived state: boss HP percentage
  get boss_hp_percent(): number {
    const state = get();
    if (!state.battle_state) return 100;
    return (
      (state.battle_state.boss_hp / state.battle_state.max_boss_hp) *
      100
    );
  },
}));
