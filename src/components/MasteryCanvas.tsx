"use client";

import { Cluster, CausalAnchor } from "@/types/arce";
import { useArceStore } from "@/store/arceStore";

interface MasteryCanvasProps {
  clusters: Cluster[];
  onNodeClick?: (nodeId: string) => void;
}

export default function MasteryCanvas({
  clusters,
  onNodeClick,
}: MasteryCanvasProps) {
  const userProgress = useArceStore((state) => state.userProgress);

  const getThermalClass = (thermalState: string): string => {
    const classes: Record<string, string> = {
      frost: "border-color: var(--error)",
      warning: "border-color: var(--warning)",
      ignition: "border-color: var(--success)",
      neutral: "border-color: var(--p-border)",
    };
    return classes[thermalState] || classes.neutral;
  };

  return (
    <div style={{ padding: "32px 0", width: "100%" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {clusters.map((cluster, clusterIdx) => (
          <div key={cluster.id} style={{ marginBottom: "64px" }}>
            {/* Cluster Header */}
            <div style={{ marginBottom: "32px" }}>
              <span className="eyebrow" style={{ marginBottom: "8px", display: "inline-block" }}>
                CLUSTER {clusterIdx + 1}
              </span>
              <h2 style={{
                fontFamily: "Georgia, serif",
                fontSize: "28px",
                color: "var(--t-primary)",
                fontWeight: 400,
                letterSpacing: "-0.5px",
                marginBottom: "8px"
              }}>
                {cluster.title}
              </h2>
              <p style={{ fontSize: "16px", color: "var(--t-secondary)", lineHeight: 1.6 }}>
                {cluster.description}
              </p>
            </div>

            {/* Elastic Grid */}
            <div style={{ display: "grid", gap: "24px" }}>
              {cluster.nodes.map((node: CausalAnchor) => {
                const heat = typeof userProgress[node.id] === 'number' ? userProgress[node.id] : node.heat;
                const thermalState = heat >= 100 ? "ignition" : heat > 50 ? "warning" : heat > 0 ? "frost" : "neutral";

                return (
                  <div
                    key={node.id}
                    onClick={() =>
                      cluster.status === "unlocked" && onNodeClick?.(node.id)
                    }
                    className="folio-card"
                    style={{
                      cursor: cluster.status === "unlocked" ? "pointer" : "default",
                      opacity: cluster.status === "locked" ? 0.6 : 1,
                      position: "relative",
                      transition: "all 0.3s ease",
                      borderLeftWidth: "4px",
                      borderLeftColor: 
                        thermalState === "ignition" ? "var(--success)" :
                        thermalState === "warning" ? "var(--warning)" :
                        thermalState === "frost" ? "var(--error)" : "var(--p-border)",
                    }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "8px" }}>
                        {node.title}
                      </h3>
                      <p style={{ fontSize: "14px", color: "var(--t-mid)", lineHeight: 1.6, margin: 0 }}>
                        {node.description}
                      </p>
                    </div>

                    {/* Node State Display */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--p-border)"
                    }}>
                      <div style={{ display: "flex", gap: "8px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                        {thermalState === "neutral" && <span style={{ color: "var(--t-secondary)" }}>Needs Review</span>}
                        {thermalState === "frost" && <span style={{ color: "var(--error)" }}>Superficial Logic</span>}
                        {thermalState === "warning" && <span style={{ color: "var(--warning)" }}>Partial Mastery</span>}
                        {thermalState === "ignition" && <span style={{ color: "var(--success)" }}>Mastered</span>}
                      </div>
                      <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--t-muted)", letterSpacing: "1px" }}>
                          Heat
                        </span>
                        <div className="progress-container" style={{ width: "64px", height: "6px" }}>
                          <div className="progress-fill" style={{ 
                            width: `${heat}%`,
                            backgroundColor: thermalState === "ignition" ? "var(--success)" : "var(--snap)" 
                          }} />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--t-deep)", width: "36px", textAlign: "right" }}>
                          {heat}%
                        </span>
                      </div>
                    </div>

                  {/* Status Badge */}
                  {cluster.status === "locked" && (
                    <div style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "var(--p-border)",
                      color: "var(--t-deep)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase"
                    }}>
                      Locked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}
