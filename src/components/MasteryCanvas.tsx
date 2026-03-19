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
    <div className="w-full bg-white min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {clusters.map((cluster, clusterIdx) => (
          <div key={cluster.id} className="mb-16">
            {/* Cluster Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-black mb-2">
                Cluster {clusterIdx + 1}: {cluster.title}
              </h2>
              <p className="text-lg text-gray-600">{cluster.description}</p>
              <div className="mt-4 h-1 w-24 bg-black"></div>
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
                          boxShadow: `0 0 12px ${getThermalColor(node.thermalState)}40`,
                        }
                      : {}
                  }
                >
                  <div>
                    <h3 className="text-xl font-black text-black mb-3">
                      {node.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {node.description}
                    </p>
                  </div>

                  {/* Thermal Indicator */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                    <div className="flex gap-2">
                      {node.thermalState === "neutral" && (
                        <span className="text-2xl">❄️</span>
                      )}
                      {node.thermalState === "frost" && (
                        <span className="text-2xl animate-pulse">❄️❄️</span>
                      )}
                      {node.thermalState === "warning" && (
                        <span className="text-2xl animate-bounce">⚠️</span>
                      )}
                      {node.thermalState === "ignition" && (
                        <span className="text-2xl animate-pulse">🔥🔥</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-500">Heat</div>
                      <div className="text-lg font-black text-black">
                        {node.heat}%
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {cluster.status === "locked" && (
                    <div className="absolute bottom-4 right-4 bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
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
