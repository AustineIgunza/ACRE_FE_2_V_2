"use client";

import { ConceptNode, NodeState } from "@/types";
import { useState } from "react";

interface HeatNodeProps {
  node: ConceptNode;
  nodeIndex: number;
}

export default function HeatNode({ node, nodeIndex }: HeatNodeProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStateColor = (state: NodeState) => {
    switch (state) {
      case NodeState.COLD:
        return "bg-slate-600 border-slate-500 text-slate-300";
      case NodeState.WARMING:
        return "bg-blue-900 border-blue-500 text-blue-100";
      case NodeState.HOT:
        return "bg-orange-900 border-orange-500 text-orange-100";
      case NodeState.IGNITED:
        return "bg-red-900 border-red-500 text-red-100";
    }
  };

  const getHeatGradient = (heat: number) => {
    if (heat === 0) return "from-slate-700 to-slate-800";
    if (heat < 25) return "from-blue-700 to-blue-900";
    if (heat < 50) return "from-orange-700 to-orange-900";
    if (heat < 75) return "from-orange-600 to-orange-800";
    return "from-red-600 to-red-900";
  };

  return (
    <div className={`rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-orange-500/30 bg-gradient-to-br ${getStateColor(node.state)} ${getHeatGradient(node.heat)}`}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Node Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest opacity-75 mb-1">
            Node {nodeIndex + 1}
          </div>
          <h3 className="text-xl font-bold">{node.label}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{node.heat.toFixed(0)}°</div>
          <div className="text-xs opacity-75">Heat</div>
        </div>
      </div>

      {/* State Indicator */}
      <div className="mb-4 inline-block px-2 py-1 bg-black/30 rounded text-xs font-semibold uppercase tracking-wide">
        {node.state.toUpperCase()}
      </div>

      {/* Description */}
      <p className="text-sm opacity-90 mb-4">{node.description}</p>

      {/* Iterations Counter */}
      <div className="mb-4 py-2 px-3 bg-black/30 rounded-lg">
        <div className="text-xs opacity-75">Attempts</div>
        <div className="text-lg font-bold">{node.iterations.length}</div>
      </div>

      {/* Status */}
      <div className="py-2 px-3 rounded-lg bg-black/20">
        {node.state === NodeState.IGNITED ? (
          <p className="text-sm font-semibold text-green-300">✅ Mastery Confirmed</p>
        ) : node.state === NodeState.HOT ? (
          <p className="text-sm font-semibold text-orange-300">🔥 Getting Close</p>
        ) : node.state === NodeState.WARMING ? (
          <p className="text-sm font-semibold text-blue-300">🌡️ Building Heat</p>
        ) : (
          <p className="text-sm font-semibold text-slate-300">❄️ Cold Start</p>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <h4 className="font-semibold mb-3">Iteration History</h4>
          {node.iterations.length === 0 ? (
            <p className="text-sm opacity-75">No attempts yet. Click to start a challenge!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {node.iterations.map((iteration, idx) => (
                <div key={iteration.id} className="p-2 bg-black/30 rounded text-xs">
                  <div className="font-semibold">Attempt {idx + 1}</div>
                  <div className="opacity-75">
                    <strong>Answer:</strong> {iteration.userAnswer.substring(0, 50)}...
                  </div>
                  <div className={`font-semibold mt-1 ${iteration.passedMastery ? 'text-green-300' : 'text-yellow-300'}`}>
                    Heat Gained: +{iteration.heat}°
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-semibold">
            Start Challenge
          </button>
        </div>
      )}
    </div>
  );
}
