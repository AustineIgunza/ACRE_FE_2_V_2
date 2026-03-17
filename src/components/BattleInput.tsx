"use client";

import { useState } from "react";
import { useCombatStore } from "@/store/combatStore";

export default function BattleInput() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const { startBattle, is_loading, error } = useCombatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    await startBattle(content, title || "Untitled Battle");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2">Prepare for Battle</h2>
        <p className="text-slate-400 mb-6">
          Paste your study notes, video transcript, or learning material. The Dungeon Master will forge a boss fight to test your mastery.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Battle Name (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Volume Negates Luck by Alex Hormozi"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:outline-none transition"
              disabled={is_loading}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Paste Your Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your notes, transcript, article, or any learning material here..."
              className="w-full h-80 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:outline-none transition resize-none"
              disabled={is_loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              {content.length} characters
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={is_loading || !content.trim()}
            className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-all ${
              is_loading || !content.trim()
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:shadow-red-500/50 hover:from-red-500 hover:to-orange-500"
            }`}
          >
            {is_loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin mr-2">⚔️</div>
                Summoning the Boss...
              </div>
            ) : (
              "⚔️ Enter the Arena"
            )}
          </button>
        </form>

        {/* Info Boxes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>💡 How it works:</strong> The AI extracts key concepts and creates scenario-based challenges. No definitions—only real-world applications.
            </p>
          </div>
          <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg">
            <p className="text-sm text-green-300">
              <strong>🎯 Win condition:</strong> Answer each scenario correctly to damage the boss. Reach victory when the boss HP hits 0.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
