"use client";

import { useState } from "react";
import type { Node } from "@/types/thermal";
import { useThermalStore } from "@/store/thermalStore";
import { StatusColors } from "@/types/thermal";
import { motion, AnimatePresence } from "framer-motion";

interface TopicGridViewProps {
  onNodeClick?: (unitId: string, nodeId: string) => void;
}

export default function TopicGridView({ onNodeClick }: TopicGridViewProps) {
  const { units, currentUnitId, selectNode } = useThermalStore();
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const currentUnit = units.find((u) => u.id === currentUnitId);

  if (!currentUnit) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
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
    const colors = StatusColors[status as keyof typeof StatusColors];
    return colors || StatusColors.neutral;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ignition": return "IGNITED";
      case "warning": return "UNSTABLE";
      case "frost": return "FROST";
      default: return "NEUTRAL";
    }
  };

  const toggleAccordion = (nodeId: string) => {
    setExpandedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  return (
    <div style={{ padding: "24px", width: "100%" }}>
      {topicsArray.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "rgba(255,255,255,0.5)" }}>
          <p>No nodes yet. Start an extraction to populate your mastery map.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {topicsArray.map(([topic, nodes]) => {
            const masteredCount = nodes.filter((n) => n.status === "ignition").length;

            return (
              <div key={topic}>
                <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", fontFamily: "Georgia, serif" }}>{topic}</h3>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{masteredCount} / {nodes.length} MASTERED</span>
                </div>

                {/* Accordion List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {nodes.map((node, index) => {
                    const statusConfig = getStatusColor(node.status);
                    const isExpanded = expandedNodeId === node.id;
                    const hasIntel = !!node.intel_card;

                    return (
                      <div
                        key={node.id}
                        style={{
                          backgroundColor: isExpanded ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isExpanded ? statusConfig.text : "rgba(255,255,255,0.08)"}`,
                          borderRadius: "12px",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {/* Header Row */}
                        <button
                          onClick={() => toggleAccordion(node.id)}
                          style={{
                            width: "100%",
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            color: "#fff",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{
                              width: "28px", height: "28px", borderRadius: "50%",
                              backgroundColor: statusConfig.bg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: statusConfig.text, fontSize: "11px", fontFamily: "monospace", fontWeight: 700,
                            }}>
                              {String(index + 1).padStart(2, "0")}
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: 500, fontFamily: "Georgia, serif" }}>
                              {node.title}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            {/* Heat bar */}
                            <div style={{ width: "60px", height: "4px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${node.heat}%`, backgroundColor: statusConfig.text, transition: "width 0.5s ease-out" }} />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: statusConfig.text, textTransform: "uppercase", letterSpacing: "1px", minWidth: "70px", textAlign: "right" }}>
                              {getStatusLabel(node.status)}
                            </span>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.3)" }}>
                              ▼
                            </motion.div>
                          </div>
                        </button>

                        {/* Expandable Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              style={{ overflow: "hidden" }}
                            >
                              <div style={{
                                padding: "20px", paddingTop: 0,
                                borderTop: "1px solid rgba(255,255,255,0.05)",
                                marginTop: "4px",
                                display: "flex", flexDirection: "column", gap: "20px",
                              }}>
                                {hasIntel ? (
                                  <>
                                    {/* Formal Mechanism */}
                                    <div>
                                      <span style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                                        Formal Mechanism
                                      </span>
                                      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>
                                        {node.intel_card!.formal_mechanism}
                                      </p>
                                    </div>

                                    {/* So What? */}
                                    <div>
                                      <span style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                                        &quot;So What?&quot;
                                      </span>
                                      <div style={{
                                        padding: "16px",
                                        backgroundColor: `${statusConfig.text}10`,
                                        borderLeft: `2px solid ${statusConfig.text}`,
                                        color: "#f0f2ec", fontSize: "15px", lineHeight: 1.6,
                                        fontFamily: "Georgia, serif", fontStyle: "italic",
                                      }}>
                                        {node.intel_card!.so_what}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ padding: "20px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                                      Complete the Challenge Zone for this node to forge the Intel Card.
                                    </p>
                                  </div>
                                )}

                                {/* View History Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onNodeClick) onNodeClick(currentUnit.id, node.id);
                                  }}
                                  style={{
                                    padding: "10px 16px",
                                    backgroundColor: "transparent",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "rgba(255,255,255,0.7)",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    letterSpacing: "1px",
                                    textTransform: "uppercase",
                                    alignSelf: "flex-start",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = statusConfig.text; e.currentTarget.style.color = statusConfig.text; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                >
                                  View Core History →
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
