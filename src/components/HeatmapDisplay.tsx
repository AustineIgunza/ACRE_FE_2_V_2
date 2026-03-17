"use client";

import { HeatmapSession, NodeState } from "@/types";
import HeatNode from "./HeatNode";

interface HeatmapDisplayProps {
  session: HeatmapSession;
  onReset: () => void;
}

export default function HeatmapDisplay({ session, onReset }: HeatmapDisplayProps) {
  const getHeatColor = (heat: number) => {
    if (heat === 0) return "text-slate-400"; // Cold
    if (heat < 25) return "text-blue-400"; // Warming
    if (heat < 50) return "text-orange-400"; // Hot
    if (heat < 75) return "text-orange-600"; // Very Hot
    return "text-red-600"; // Ignited
  };

  const totalMastered = session.nodes.filter(
    (n) => n.state === NodeState.IGNITED
  ).length;
  const winCondition = totalMastered === session.nodes.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Session Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">{session.sourceTitle}</h2>
        <div className="flex justify-center items-center gap-4 text-slate-400">
          <span>
            Heat: <span className={`font-bold ${getHeatColor(session.totalHeat)}`}>{session.totalHeat.toFixed(0)}°</span>
          </span>
          <span>•</span>
          <span>
            Mastered: <span className="font-bold text-green-400">{totalMastered}/{session.nodes.length}</span>
          </span>
        </div>
      </div>

      {/* Win State */}
      {winCondition && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-900 to-emerald-900 border border-green-500 rounded-lg">
          <h3 className="text-2xl font-bold text-green-300 mb-2">🔥 BOSS DEFEATED!</h3>
          <p className="text-green-200 mb-4">
            You've successfully stress-tested all logic nodes and earned your Mastery Card.
          </p>
          <button
            onClick={onReset}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Share Your Victory
          </button>
        </div>
      )}

      {/* Heatmap Grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {session.nodes.map((node, idx) => (
          <HeatNode key={node.id} node={node} nodeIndex={idx} />
        ))}
      </div>

      {/* Session Info */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Challenge Info</h3>
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            <strong className="text-slate-200">Session ID:</strong> {session.id}
          </p>
          <p>
            <strong className="text-slate-200">Created:</strong>{" "}
            {new Date(session.createdAt).toLocaleString()}
          </p>
          <p>
            <strong className="text-slate-200">Content Length:</strong>{" "}
            {session.sourceContent.length} characters
          </p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          ← Start New Challenge
        </button>
      </div>
    </div>
  );
}
