"use client";

import { Cluster, CausalAnchor } from "@/types/arce";

interface MasteryCanvasProps {
  clusters: Cluster[];
  onNodeClick?: (nodeId: string) => void;
}

export default function MasteryCanvas({
  clusters,
  onNodeClick,
}: MasteryCanvasProps) {
  const getThermalColor = (thermalState: string): string => {
    const colors: Record<string, string> = {
      frost: "rgb(255, 0, 0)",
      warning: "rgb(255, 165, 0)",
      ignition: "rgb(0, 204, 0)",
      neutral: "rgb(0, 0, 0)",
    };
    return colors[thermalState] || colors.neutral;
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen px-4 py-8 relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {clusters.map((cluster, clusterIdx) => (
          <div key={cluster.id} className="mb-16">
            {/* Cluster Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                Cluster {clusterIdx + 1}: {cluster.title}
              </h2>
              <p className="text-lg text-slate-600">{cluster.description}</p>
              <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            </div>

            {/* Elastic Grid */}
            <div className="mastery-canvas">
              {cluster.nodes.map((node: CausalAnchor) => (
                <div
                  key={node.id}
                  onClick={() =>
                    cluster.status === "unlocked" && onNodeClick?.(node.id)
                  }
                  className={`node-card ${cluster.status} ${
                    cluster.status === "unlocked" ? "cursor-pointer" : ""
                  }`}
                  style={
                    cluster.status === "unlocked"
                      ? {
                          borderColor: getThermalColor(node.thermalState),
                          boxShadow: `0 0 16px ${getThermalColor(node.thermalState)}60, inset 0 0 1px rgba(255,255,255,0.8)`,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          backdropFilter: "blur(8px)",
                        }
                      : {
                          backgroundColor: "rgba(203, 213, 225, 0.5)",
                          backdropFilter: "blur(8px)",
                        }
                  }
                >
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">
                      {node.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {node.description}
                    </p>
                  </div>

                  {/* Thermal Indicator with Heat Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                    <div className="flex gap-2 flex-1">
                      {node.thermalState === "neutral" && (
                        <span className="text-sm font-bold text-slate-600">[NEUTRAL]</span>
                      )}
                      {node.thermalState === "frost" && (
                        <span className="text-sm font-bold text-orange-600 animate-pulse">[FROST]</span>
                      )}
                      {node.thermalState === "warning" && (
                        <span className="text-sm font-bold text-yellow-600 animate-bounce">[WARNING]</span>
                      )}
                      {node.thermalState === "ignition" && (
                        <span className="text-sm font-bold text-emerald-600 animate-pulse">[IGNITION]</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-500 mb-1">Heat</div>
                      {/* Heat Bar with Color */}
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            node.heat <= 35
                              ? "bg-blue-500"
                              : node.heat <= 65
                                ? "bg-orange-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${node.heat}%` }}
                        ></div>
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        {node.heat}%
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {cluster.status === "locked" && (
                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-slate-400 to-slate-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Locked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
