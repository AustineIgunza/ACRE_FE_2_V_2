"use client";

import { useState } from "react";
import type { Node } from "@/types/thermal";
import { useThermalStore } from "@/store/thermalStore";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';

interface TopicGridViewProps {
  onNodeClick?: (unitId: string, nodeId: string) => void;
}

export default function TopicGridView({ onNodeClick }: TopicGridViewProps) {
  const { units, currentUnitId, selectNode } = useThermalStore();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const currentUnit = units.find((u) => u.id === currentUnitId);

  if (!currentUnit) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "var(--t-secondary)" }}>
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
    const colors: Record<string, { bg: string; text: string; icon: string; shadow: string }> = {
      grey: { bg: "var(--p-surface)", text: "var(--t-secondary)", icon: "◯", shadow: "none" },
      frost: { bg: "#f1f5f9", text: "var(--info)", icon: "❄️", shadow: "0 4px 12px rgba(14, 165, 233, 0.1)" },
      glow: { bg: "#fffbeb", text: "var(--warning)", icon: "🕯️", shadow: "0 4px 12px rgba(255, 149, 0, 0.2)" },
      ignition: { bg: "#fef2f2", text: "var(--snap)", icon: "🔥", shadow: "0 4px 20px rgba(255, 59, 48, 0.2)" },
    };
    return colors[status] || colors.grey;
  };

  return (
    <div style={{ padding: "24px", width: "100%" }}>
      <style>{`
        @keyframes ignitionPulse {
          0% { transform: scale(1); box-shadow: 0 4px 20px rgba(255, 59, 48, 0.2); }
          50% { transform: scale(1.02); box-shadow: 0 8px 30px rgba(255, 59, 48, 0.4); }
          100% { transform: scale(1); box-shadow: 0 4px 20px rgba(255, 59, 48, 0.2); }
        }
      `}</style>
      
      {topicsArray.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--t-secondary)" }}>
          <p>No nodes yet. Create one to start!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {topicsArray.map(([topic, nodes]) => {
            const masteredCount = nodes.filter((n) => n.status === "ignition").length;

            return (
              <div key={topic}>
                <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: '1px solid var(--p-border)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--t-primary)" }}>{topic}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--t-muted)' }}>{masteredCount} / {nodes.length} MASTERED</span>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "12px",
                }}>
                  {nodes.map((node) => {
                    const statusConfig = getStatusColor(node.status);
                    const isHovered = hoveredNodeId === node.id;
                    const hasIntel = !!node.intel_card;

                    return (
                      <div
                        key={node.id}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => selectNode(currentUnit.id, node.id)}
                        style={{
                          padding: "16px",
                          borderRadius: "12px",
                          backgroundColor: statusConfig.bg,
                          border: `1.5px solid ${isHovered ? statusConfig.text : 'transparent'}`,
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: statusConfig.shadow,
                          animation: node.status === 'ignition' ? 'ignitionPulse 3s infinite ease-in-out' : 'none',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "14px" }}>{statusConfig.icon}</span>
                          <span style={{ fontSize: "9px", fontWeight: 700, color: statusConfig.text, textTransform: "uppercase", letterSpacing: '0.05em' }}>{node.status}</span>
                        </div>

                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--t-primary)", lineHeight: 1.3, marginBottom: '4px' }}>
                          {node.title}
                        </div>

                        {/* Hover Preview: LaTeX formula if available */}
                        {isHovered && hasIntel ? (
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '8px', 
                            backgroundColor: 'white', 
                            borderRadius: '6px', 
                            border: '1px solid var(--p-border)',
                            fontSize: '0.85em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'fadeIn 0.2s ease-out'
                          }}>
                            <InlineMath math={node.intel_card!.formal_mechanism} />
                          </div>
                        ) : (
                          <div style={{ fontSize: '10px', color: 'var(--t-muted)', marginTop: '8px' }}>
                            {node.totalAttempts} attempts
                          </div>
                        )}
                        
                        {/* Thermal Progress Sub-bar */}
                        <div style={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0, 
                          height: '3px', 
                          backgroundColor: 'rgba(0,0,0,0.05)' 
                        }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${node.heat}%`, 
                            backgroundColor: node.status === 'ignition' ? 'var(--snap)' : 'var(--info)',
                            transition: 'width 0.5s ease-out'
                          }} />
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
