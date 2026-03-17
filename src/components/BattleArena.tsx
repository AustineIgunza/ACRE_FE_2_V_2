"use client";

import { useCombatStore } from "@/store/combatStore";
import HealthBar from "./UI/HealthBar";
import EncounterCard from "./UI/EncounterCard";

export default function BattleArena() {
  const {
    battle_state,
    current_encounter,
    player_hp_percent,
    boss_hp_percent,
    is_loading,
  } = useCombatStore();

  if (!battle_state || !current_encounter) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Boss Introduction */}
      {battle_state.current_encounter_index === 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-2 text-purple-300">
            {battle_state.boss.boss_name}
          </h2>
          <p className="text-lg text-slate-300">{battle_state.boss.intro_narrative}</p>
          <p className="text-sm text-slate-400 mt-4">
            Encounter {battle_state.current_encounter_index + 1} of{" "}
            {battle_state.boss.encounters.length}
          </p>
        </div>
      )}

      {/* Health Bars */}
      <div className="mb-8 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm">YOUR HP</span>
            <span className="text-sm">
              {battle_state.player_hp} / {battle_state.max_player_hp}
            </span>
          </div>
          <HealthBar percentage={player_hp_percent} color="blue" />
        </div>

        <div className="text-center text-slate-500 font-bold text-xl">VS</div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm">{battle_state.boss.boss_name}</span>
            <span className="text-sm">
              {battle_state.boss_hp} / {battle_state.max_boss_hp}
            </span>
          </div>
          <HealthBar percentage={boss_hp_percent} color="red" />
        </div>
      </div>

      {/* Encounter Card */}
      <EncounterCard
        encounter={current_encounter}
        is_loading={is_loading}
      />

      {/* Battle Log */}
      {battle_state.battle_log.length > 0 && (
        <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700 rounded-lg max-h-40 overflow-y-auto">
          <h3 className="font-bold mb-3 text-slate-300">⚔️ Battle Log</h3>
          <div className="space-y-2 text-sm">
            {[...battle_state.battle_log].reverse().map((log, idx) => (
              <div key={idx} className={`p-2 rounded ${log.was_correct ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}>
                <span className="font-bold">Turn {battle_state.battle_log.length - idx}:</span> {" "}
                {log.was_correct ? "✅ Critical Hit!" : "❌ Miss"} ({log.damage_dealt} dmg to boss, {log.damage_taken} dmg to you)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
