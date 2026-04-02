"use client";

import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HeatmapPage() {
  const { user, authInitialized, initAuth, fetchProgress, userProgress, progressDetails, nodeResults, scenarios } = useArceStore();
  const router = useRouter();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    } else if (authInitialized && user) {
      fetchProgress();
    }
  }, [user, authInitialized, router, fetchProgress]);

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--p-surface)" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid var(--p-border)", borderTopColor: "var(--snap)",
          animation: "spin 0.6s linear infinite"
        }} />
      </div>
    );
  }

  // Convert nodeResults from current session to display format
  const sessionNodes = Object.entries(nodeResults || {}).map(([nodeId, result]) => {
    const scenario = scenarios.find(s => s.nodeId === nodeId);
    return {
      nodeId: nodeId,
      title: scenario?.nodeId || nodeId,
      heatScore: result.heatScore,
      isIgnited: result.accuracy === "ignition",
      lastAttempt: new Date().toISOString(),
      accuracy: result.accuracy,
      feedback: result.feedback,
    };
  });

  // Use session data if available, otherwise fall back to database data
  const displayNodes = sessionNodes.length > 0 ? sessionNodes : progressDetails;
  const totalConcepts = displayNodes.length;
  const masteredCount = displayNodes.filter(n => n.isIgnited).length;
  const averageHeat = totalConcepts > 0
    ? Math.round(displayNodes.reduce((sum, n) => sum + n.heatScore, 0) / totalConcepts)
    : 0;

  const getHeatColor = (heat: number) => {
    if (heat >= 70) return "#22c55e"; // Green - Ignition
    if (heat > 45) return "#f59e0b"; // Orange - Warning
    if (heat > 0) return "#3b82f6"; // Blue - Frost
    return "#9ca3af"; // Gray - Inactive
  };

  const getThermalState = (heat: number) => {
    if (heat >= 70) return "ignition";
    if (heat > 45) return "warning";
    if (heat > 0) return "frost";
    return "inactive";
  };

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 16px currentColor40; }
          50% { box-shadow: 0 0 24px currentColor60; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Navbar />

      <main role="main" style={{ padding: "48px 24px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "40px", animation: "slideUp 0.4s ease-out" }}>
          <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>
            HEATMAP
          </span>
          <h1 style={{ fontSize: "36px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>
            Your Mastery Heatmap
          </h1>
          <p style={{ fontSize: "17px", color: "var(--t-secondary)" }}>
            Visualize your progress across every concept you have studied.
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px", animation: "slideUp 0.5s ease-out" }}>
          <div className="folio-card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--snap)", lineHeight: 1 }}>{totalConcepts}</div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>Concepts</p>
          </div>
          <div className="folio-card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>{masteredCount}</div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>Mastered</p>
          </div>
          <div className="folio-card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--xp)", lineHeight: 1 }}>{averageHeat}%</div>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", margin: "8px 0 0 0" }}>Avg Heat</p>
          </div>
        </div>

        {/* Node Grid Heatmap with Dynamic Grid Size */}
        {displayNodes.length > 0 ? (
          <div style={{ animation: "slideUp 0.6s ease-out" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "16px" }}>Mastery Heatmap Grid</h3>
            
            {/* Calculate optimal grid size (2x2, 3x3, 4x4, etc.) */}
            {(() => {
              const nodeCount = displayNodes.length;
              // Determine optimal grid columns: sqrt(nodeCount) rounded appropriately
              let cols = Math.ceil(Math.sqrt(nodeCount));
              // Ensure at least 2x2 and cap at reasonable size (6x6)
              cols = Math.min(Math.max(cols, 2), 6);
              
              return (
                <div 
                  className="folio-card"
                  style={{ 
                    padding: "24px", 
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: "16px",
                    marginBottom: "32px",
                  }}
                >
                  {displayNodes
                    .sort((a: any, b: any) => b.heatScore - a.heatScore)
                    .map((node: any) => {
                      const thermalState = getThermalState(node.heatScore);
                      const nodeColor = getHeatColor(node.heatScore);
                      const needsGlow = thermalState === "frost" || thermalState === "warning";
                      
                      return (
                        <div
                          key={node.nodeId}
                          onClick={() => needsGlow && setSelectedNode(node.nodeId)}
                          style={{
                            padding: "16px",
                            borderRadius: "12px",
                            backgroundColor: selectedNode === node.nodeId ? "rgba(255, 92, 53, 0.15)" : "var(--p-frost)",
                            border: `2px solid ${selectedNode === node.nodeId ? nodeColor : "var(--p-border)"}`,
                            cursor: needsGlow ? "pointer" : "default",
                            transition: "all 0.3s ease",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            minHeight: "140px",
                          }}
                          onMouseEnter={(e) => {
                            if (needsGlow) {
                              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 92, 53, 0.1)";
                              (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${nodeColor}40`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = selectedNode === node.nodeId ? "rgba(255, 92, 53, 0.15)" : "var(--p-frost)";
                            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                          }}
                        >
                          {/* Background glow effect */}
                          {needsGlow && (
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              background: `radial-gradient(circle, ${nodeColor}10, transparent 70%)`,
                              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                              pointerEvents: "none",
                            }} />
                          )}

                          {/* Content */}
                          <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            {/* Icon */}
                            <div style={{
                              width: "52px", height: "52px", borderRadius: "10px",
                              backgroundColor: needsGlow ? nodeColor + "15" : "transparent",
                              color: nodeColor,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "24px", fontWeight: 700,
                              border: `2px solid ${nodeColor}`,
                              boxShadow: needsGlow ? `0 0 16px ${nodeColor}40` : "none",
                              animation: needsGlow ? `glow 2s ease-in-out infinite` : "none",
                            }}>
                              {node.isIgnited ? "🔥" : needsGlow ? "⚡" : "○"}
                            </div>

                            {/* Title */}
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--t-deep)", lineHeight: 1.3 }}>
                              {node.nodeId
                                .replace(/^(node|scenario|concept)[-_]?/i, "")
                                .replace(/[-_]/g, " ")
                                .replace(/\b\w/g, (c: string) => c.toUpperCase())
                                .substring(0, 20) + (node.nodeId.length > 20 ? "..." : "")
                                || `Concept`}
                            </span>

                            {/* Heat Score */}
                            <div style={{ 
                              fontSize: "18px", 
                              fontWeight: 700, 
                              color: nodeColor,
                              marginTop: "4px"
                            }}>
                              {node.heatScore}%
                            </div>

                            {/* State Badge */}
                            <div style={{ 
                              fontSize: "10px", 
                              color: nodeColor, 
                              textTransform: "uppercase",
                              fontWeight: 600,
                              letterSpacing: "0.5px"
                            }}>
                              {thermalState}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })()}

            {/* List view below grid */}
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "16px", marginTop: "32px" }}>Detailed View</h3>
            <div className="folio-card" style={{ padding: "0", overflow: "hidden" }}>
              {displayNodes
                .sort((a: any, b: any) => b.heatScore - a.heatScore)
                .map((node: any, i: number) => {
                  const thermalState = getThermalState(node.heatScore);
                  const nodeColor = getHeatColor(node.heatScore);
                  const needsGlow = thermalState === "frost" || thermalState === "warning";
                  
                  return (
                    <div
                      key={node.nodeId}
                      onClick={() => needsGlow && setSelectedNode(node.nodeId)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 24px",
                        borderBottom: i < displayNodes.length - 1 ? "1px solid var(--p-border)" : "none",
                        backgroundColor: selectedNode === node.nodeId ? "rgba(255, 92, 53, 0.05)" : "transparent",
                        cursor: needsGlow ? "pointer" : "default",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        if (needsGlow) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 92, 53, 0.05)";
                          (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = selectedNode === node.nodeId ? "rgba(255, 92, 53, 0.05)" : "transparent";
                        (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                      }}
                    >
                      {/* Glow effect for nodes needing work */}
                      {needsGlow && (
                        <div style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(90deg, ${nodeColor}20 0%, transparent 100%)`,
                          animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                          pointerEvents: "none",
                        }} />
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: 1 }}>
                        <div style={{
                          width: "48px", height: "48px", borderRadius: "8px",
                          backgroundColor: needsGlow ? nodeColor + "20" : "var(--p-surface)",
                          color: nodeColor,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "20px", fontWeight: 700,
                          flexShrink: 0,
                          border: `2px solid ${nodeColor}`,
                          boxShadow: needsGlow ? `0 0 16px ${nodeColor}40` : "none",
                          animation: needsGlow ? `glow 2s ease-in-out infinite` : "none",
                        }}>
                          {node.isIgnited ? "🔥" : needsGlow ? "⚡" : "○"}
                        </div>
                        <div>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-deep)" }}>
                            {node.nodeId
                              .replace(/^(node|scenario|concept)[-_]?/i, "")
                              .replace(/[-_]/g, " ")
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())
                              || `Concept ${node.nodeId}`}
                          </span>
                          <div style={{ fontSize: "11px", color: nodeColor, marginTop: "4px", fontWeight: 600 }}>
                            {thermalState.toUpperCase()} • {node.feedback && node.feedback.split(".")[0]}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "2px" }}>
                            Last attempt: {new Date(node.lastAttempt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
                        <div style={{ width: "120px", height: "8px", borderRadius: "4px", backgroundColor: "var(--p-border)", overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.min(node.heatScore, 100)}%`, height: "100%", borderRadius: "4px",
                            backgroundColor: nodeColor,
                            transition: "width 0.5s ease",
                            boxShadow: needsGlow ? `0 0 8px ${nodeColor}80` : "none",
                          }} />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: nodeColor, width: "50px", textAlign: "right" }}>
                          {node.heatScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Info text */}
            <div style={{ marginTop: "20px", fontSize: "12px", color: "var(--t-muted)", lineHeight: 1.6 }}>
              <p>🔥 <strong>Ignition (70%+):</strong> Mastered - locked in permanent neural architecture</p>
              <p>⚡ <strong>Warning (45-70%):</strong> In Progress - click to retry and reinforce understanding</p>
              <p>❄️ <strong>Frost (&lt;45%):</strong> Needs Work - click to review and attempt again</p>
            </div>
          </div>
        ) : (
          <div className="folio-card" style={{ padding: "48px", textAlign: "center", animation: "slideUp 0.6s ease-out" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "8px" }}>No data yet</h3>
            <p style={{ fontSize: "15px", color: "var(--t-secondary)", marginBottom: "24px" }}>
              Complete learning sessions to start populating your heatmap with mastery data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
