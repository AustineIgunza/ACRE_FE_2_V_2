"use client";

import { useState } from "react";
import type { Node } from "@/types/thermal";
import { useThermalStore } from "@/store/thermalStore";

interface TopicGridViewProps {
  onNodeClick?: (unitId: string, nodeId: string) => void;
}

export default function TopicGridView({ onNodeClick }: TopicGridViewProps) {
  const { units, currentUnitId, selectNode } = useThermalStore();
  const currentUnit = units.find((u) => u.id === currentUnitId);

  if (!currentUnit) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--t-secondary)",
        }}
      >
        <p>Select a unit to view topics</p>
      </div>
    );
  }

  // Group nodes by topic
  const topicGroups: Map<string, Node[]> = new Map();
  currentUnit.nodes.forEach((node) => {
    if (!topicGroups.has(node.topic)) {
      topicGroups.set(node.topic, []);
    }
    topicGroups.get(node.topic)!.push(node);
  });

  const topicsArray = Array.from(topicGroups.entries());

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      grey: { bg: "var(--p-surface)", text: "var(--t-secondary)", icon: "◯" },
      frost: { bg: "var(--info-bg, #dbeafe)", text: "var(--info, #1e40af)", icon: "❄️" },
      glow: { bg: "var(--warning-bg)", text: "var(--warning)", icon: "🕯️" },
      ignition: { bg: "var(--snap-tint)", text: "var(--snap)", icon: "🔥" },
    };
    return colors[status] || colors.grey;
  };

  const getHeatColor = (heat: number) => {
    if (heat >= 100) return "var(--snap)";
    if (heat >= 60) return "var(--warning)";
    if (heat >= 25) return "var(--info)";
    return "var(--p-border)";
  };

  return (
    <div style={{ padding: "24px", width: "100%" }}>
      {topicsArray.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "var(--t-secondary)",
          }}
        >
          <p>No nodes yet. Create one to start!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {topicsArray.map(([topic, nodes]) => {
            // Calculate topic metrics
            const avgHeat = Math.round(
              nodes.reduce((sum, n) => sum + n.heat, 0) / nodes.length
            );
            const avgIntegrity = Math.round(
              nodes.reduce((sum, n) => sum + n.integrity, 0) / nodes.length
            );
            const masteredCount = nodes.filter(
              (n) => n.status === "ignition"
            ).length;

            return (
              <div key={topic}>
                {/* Topic Header */}
                <div
                  style={{
                    marginBottom: "20px",
                    paddingBottom: "12px",
                    borderBottom: "2px solid var(--p-border)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "var(--t-primary)",
                      marginBottom: "8px",
                    }}
                  >
                    {topic}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "24px",
                      fontSize: "12px",
                      color: "var(--t-secondary)",
                    }}
                  >
                    <span>
                      <strong style={{ color: "var(--snap)" }}>{nodes.length}</strong> concepts
                    </span>
                    <span>
                      <strong style={{ color: "var(--xp)" }}>{masteredCount}</strong> mastered
                    </span>
                    <span>
                      Avg Heat:{" "}
                      <strong
                        style={{
                          color: getHeatColor(avgHeat),
                          fontSize: "13px",
                        }}
                      >
                        {avgHeat}%
                      </strong>
                    </span>
                    <span>
                      Avg Integrity:{" "}
                      <strong
                        style={{
                          color: "var(--success)",
                          fontSize: "13px",
                        }}
                      >
                        {avgIntegrity}%
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Topic Grid - Responsive (Auto-fit to grid) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      nodes.length <= 3
                        ? "repeat(auto-fit, minmax(160px, 1fr))"
                        : nodes.length <= 6
                          ? "repeat(3, 1fr)"
                          : "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  {nodes.map((node) => {
                    const statusColor = getStatusColor(node.status);
                    const heatColor = getHeatColor(node.heat);

                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          if (onNodeClick && currentUnit?.id) {
                            onNodeClick(currentUnit.id, node.id);
                          }
                          selectNode(currentUnit?.id || '', node.id);
                        }}
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          backgroundColor: statusColor.bg,
                          border: "1.5px solid rgba(0,0,0,0.05)",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          transform: "scale(1)",
                          boxShadow: node.status === 'glow' 
                            ? "0 0 20px rgba(255, 193, 7, 0.6), 0 0 40px rgba(255, 193, 7, 0.3)" 
                            : "0 1px 3px rgba(0,0,0,0.08)",
                          animation: node.status === 'glow' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = node.status === 'glow'
                            ? "0 0 30px rgba(255, 193, 7, 0.8), 0 0 50px rgba(255, 193, 7, 0.4)"
                            : "0 8px 16px rgba(0,0,0,0.12)";
                          e.currentTarget.style.backgroundColor =
                            statusColor.bg;
                          const opacity =
                            parseFloat(statusColor.bg.split(",")[3] || "1") *
                            0.9;
                          e.currentTarget.style.borderColor =
                            statusColor.text;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = node.status === 'glow'
                            ? "0 0 20px rgba(255, 193, 7, 0.6), 0 0 40px rgba(255, 193, 7, 0.3)"
                            : "0 1px 3px rgba(0,0,0,0.08)";
                          e.currentTarget.style.backgroundColor =
                            statusColor.bg;
                          e.currentTarget.style.borderColor =
                            "rgba(0,0,0,0.05)";
                        }}
                      >
                        {/* Status Icon + Title */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>
                            {statusColor.icon}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: statusColor.text,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {node.status}
                          </span>
                        </div>

                        {/* Node Title */}
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--t-primary)",
                            marginBottom: "8px",
                            minHeight: "24px",
                            lineHeight: 1.2,
                          }}
                        >
                          {node.title}
                        </div>

                        {/* Heat Bar */}
                        <div
                          style={{
                            marginBottom: "4px",
                            height: "4px",
                            backgroundColor: "rgba(0,0,0,0.1)",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${node.heat}%`,
                              backgroundColor: heatColor,
                              transition: "all 0.3s ease",
                            }}
                          />
                        </div>

                        {/* Stats Row */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "9px",
                            color: "var(--t-secondary)",
                          }}
                        >
                          <span>
                            <strong style={{ color: heatColor }}>
                              {node.heat}%
                            </strong>{" "}
                            heat
                          </span>
                          <span>
                            <strong style={{ color: "var(--success)" }}>
                              {node.integrity}%
                            </strong>
                          </span>
                        </div>

                        {/* Attempts Counter */}
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "9px",
                            color: "var(--t-muted)",
                            textAlign: "center",
                          }}
                        >
                          {node.totalAttempts} attempts
                          {node.thermalLeak && (
                            <>
                              {" "}
                              <span
                                style={{
                                  color: "var(--error)",
                                  fontWeight: 600,
                              }}
                              >
                                ⚠️
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
