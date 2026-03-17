"use client";

import { useEffect } from "react";
import { useCombatStore } from "@/store/combatStore";
import BattleInput from "@/components/BattleInput";
import BattleArena from "@/components/BattleArena";
import BattleResult from "@/components/BattleResult";

export default function Home() {
  const { battle_state, is_battle_active, resetBattle } = useCombatStore();

  // Reset on unmount
  useEffect(() => {
    return () => {
      // Optionally persist state to localStorage on unmount
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-900 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-900 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black mb-2 tracking-wider">
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              ACRE
            </span>
          </h1>
          <p className="text-xl text-slate-300">
            ⚔️ The Iteration Engine • Face Your Boss Fight
          </p>
        </div>

        {/* Main Content */}
        {!battle_state ? (
          <BattleInput />
        ) : is_battle_active ? (
          <BattleArena />
        ) : (
          <BattleResult onReset={resetBattle} />
        )}
      </div>
    </div>
  );
}
