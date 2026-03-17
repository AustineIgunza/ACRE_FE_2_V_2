"use client";

import { useCombatStore } from "@/store/combatStore";

interface BattleResultProps {
  onReset: () => void;
}

export default function BattleResult({ onReset }: BattleResultProps) {
  const { battle_state } = useCombatStore();

  if (!battle_state) return null;

  const isVictory = battle_state.is_victory;
  const correctAnswers = battle_state.battle_log.filter(
    (log) => log.was_correct
  ).length;
  const totalEncounters = battle_state.boss.encounters.length;
  const accuracy = Math.round((correctAnswers / totalEncounters) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={`rounded-lg border-2 p-12 text-center shadow-2xl ${
          isVictory
            ? "bg-gradient-to-br from-green-900 to-emerald-900 border-green-500"
            : "bg-gradient-to-br from-red-900 to-orange-900 border-red-500"
        }`}
      >
        {/* Title */}
        <h1 className="text-5xl font-black mb-4">
          {isVictory ? "🏆 VICTORY!" : "💀 DEFEAT"}
        </h1>

        {/* Boss Name */}
        <p className="text-2xl mb-6 opacity-90">
          {isVictory ? "You defeated" : "Vanquished by"}{" "}
          <strong>{battle_state.boss.boss_name}</strong>
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 bg-black/30 p-6 rounded-lg">
          <div>
            <p className="text-slate-400 text-sm mb-1">Encounters</p>
            <p className="text-2xl font-bold">
              {correctAnswers}/{totalEncounters}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Accuracy</p>
            <p className="text-2xl font-bold">{accuracy}%</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Final HP</p>
            <p className="text-2xl font-bold">{battle_state.player_hp}</p>
          </div>
        </div>

        {/* Battle Log Summary */}
        <div className="bg-black/30 p-6 rounded-lg mb-8 text-left max-h-48 overflow-y-auto">
          <p className="font-bold mb-3 text-slate-300">Battle Summary</p>
          <div className="space-y-2 text-sm">
            {battle_state.battle_log.map((log, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  Turn {idx + 1}:{" "}
                  <span className={log.was_correct ? "text-green-400" : "text-red-400"}>
                    {log.was_correct ? "✅ Correct" : "❌ Wrong"}
                  </span>
                </span>
                <span className="text-slate-400">
                  +{log.damage_dealt} dmg -{log.damage_taken} hp
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <p className="text-lg mb-8 opacity-90">
          {isVictory
            ? "You've proven your mastery! Share your victory."
            : "Learn from this defeat. Return stronger."}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={onReset}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
              isVictory
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white"
            }`}
          >
            {isVictory ? "🎉 Share Victory" : "⚔️ Try Again"}
          </button>
          <button
            onClick={onReset}
            className="px-8 py-3 rounded-lg font-bold text-lg bg-slate-700 hover:bg-slate-600 text-white transition-all"
          >
            ← New Battle
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-sm text-slate-300">
            <strong>💡 Note:</strong> Each battle tests your deep understanding,
            not surface knowledge. Incorrect answers show you where to focus.
          </p>
        </div>
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-sm text-slate-300">
            <strong>🎯 Next:</strong> Review the scenarios you missed and try a new battle with fresh content.
          </p>
        </div>
      </div>
    </div>
  );
}
