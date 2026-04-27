"use client";

import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RetryNodeModal from "@/components/RetryNodeModal";
import { loadAllProgress, NodeProgressData } from "@/utils/progressStorage";
import ParticleBg from "@/components/ParticleBg";

type ViewLevel = "units" | "topics" | "nodes";

function getHeatColor(heat: number) {
  if (heat >= 85) return "#b91c1c"; // deep crimson — peak ignition
  if (heat >= 70) return "#ef4444"; // standard red — ignition
  if (heat > 45) return "#f59e0b";
  if (heat > 0) return "#3b82f6";
  return "#6b7280";
}

function getThermalEmoji(heat: number) {
  if (heat >= 70) return "🔥";
  if (heat > 45) return "⚠️";
  if (heat > 0) return "❄️";
  return "○";
}

function getThermalLabel(heat: number) {
  if (heat >= 85) return "CRITICAL MASS";
  if (heat >= 70) return "IGNITION";
  if (heat > 45) return "WARNING";
  if (heat > 0) return "FROST";
  return "INACTIVE";
}

/** Which glow animation class to apply based on heat */
function getGlowClass(heat: number) {
  if (heat >= 85) return "glow-critical";   // deep crimson, more aggressive
  if (heat >= 70) return "glow-ignition";   // standard red pulse
  if (heat > 45) return "glow-warning";
  if (heat > 0) return "glow-frost";
  return "";
}

function avg(scores: number[]) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
}

const GLOW_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  /* Critical Mass (85+): deep crimson, fast and intense */
  @keyframes pulse-critical {
    0%, 100% { box-shadow: 0 0 12px 4px rgba(185,28,28,0.5),  0 0 32px 8px rgba(185,28,28,0.28), 0 0 64px 16px rgba(185,28,28,0.1), inset 0 0 14px rgba(185,28,28,0.12); }
    50%       { box-shadow: 0 0 28px 10px rgba(185,28,28,0.75), 0 0 60px 18px rgba(185,28,28,0.42), 0 0 100px 28px rgba(185,28,28,0.16), inset 0 0 24px rgba(185,28,28,0.2); }
  }
  /* Ignition (70–84): standard red pulse */
  @keyframes pulse-ignition {
    0%, 100% { box-shadow: 0 0 8px 2px rgba(239,68,68,0.35), 0 0 24px 4px rgba(239,68,68,0.18), inset 0 0 10px rgba(239,68,68,0.08); }
    50%       { box-shadow: 0 0 20px 6px rgba(239,68,68,0.6),  0 0 48px 12px rgba(239,68,68,0.28), inset 0 0 18px rgba(239,68,68,0.14); }
  }
  /* Warning: amber flicker */
  @keyframes pulse-warning {
    0%, 100% { box-shadow: 0 0 6px 2px rgba(245,158,11,0.3), 0 0 20px 4px rgba(245,158,11,0.14), inset 0 0 8px rgba(245,158,11,0.06); }
    50%       { box-shadow: 0 0 16px 5px rgba(245,158,11,0.55), 0 0 40px 10px rgba(245,158,11,0.22), inset 0 0 14px rgba(245,158,11,0.1); }
  }
  /* Frost: cool blue shimmer */
  @keyframes pulse-frost {
    0%, 100% { box-shadow: 0 0 6px 2px rgba(59,130,246,0.25), 0 0 18px 3px rgba(59,130,246,0.1), inset 0 0 6px rgba(59,130,246,0.05); }
    50%       { box-shadow: 0 0 14px 4px rgba(59,130,246,0.45), 0 0 32px 8px rgba(59,130,246,0.18), inset 0 0 12px rgba(59,130,246,0.08); }
  }

  .glow-critical  { animation: pulse-critical  1.4s ease-in-out infinite; }
  .glow-ignition  { animation: pulse-ignition  2s   ease-in-out infinite; }
  .glow-warning   { animation: pulse-warning   2.5s ease-in-out infinite; }
  .glow-frost     { animation: pulse-frost     3.2s ease-in-out infinite; }

  /* Mini bar inside TopicCard */
  @keyframes pulse-bar-critical {
    0%, 100% { opacity: 0.8;  filter: drop-shadow(0 0 5px rgba(185,28,28,0.9)); }
    50%       { opacity: 1;   filter: drop-shadow(0 0 9px rgba(185,28,28,1)); }
  }
  @keyframes pulse-bar-ignition {
    0%, 100% { opacity: 0.75; }
    50%       { opacity: 1; filter: drop-shadow(0 0 4px rgba(239,68,68,0.8)); }
  }
  @keyframes pulse-bar-warning {
    0%, 100% { opacity: 0.7; }
    50%       { opacity: 1; filter: drop-shadow(0 0 3px rgba(245,158,11,0.7)); }
  }
  @keyframes pulse-bar-frost {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 0.9; filter: drop-shadow(0 0 3px rgba(59,130,246,0.6)); }
  }

  .bar-critical { animation: pulse-bar-critical 1.4s ease-in-out infinite; }
  .bar-ignition { animation: pulse-bar-ignition 2s   ease-in-out infinite; }
  .bar-warning  { animation: pulse-bar-warning  2.5s ease-in-out infinite; }
  .bar-frost    { animation: pulse-bar-frost    3.2s ease-in-out infinite; }

  /* Node card hover lift */
  .node-card { transition: transform 0.18s ease, border-color 0.18s ease; }
  .node-card:hover { transform: scale(1.06); }

  /* Unit/topic card lift */
  .heat-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
`;

export default function HeatmapPage() {
  const { user, authInitialized, initAuth } = useArceStore();
  const router = useRouter();
  const [view, setView] = useState<ViewLevel>("units");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [allNodes, setAllNodes] = useState<NodeProgressData[]>([]);

  useEffect(() => { initAuth(); }, [initAuth]);
  useEffect(() => { if (authInitialized && !user) router.push("/signin"); }, [user, authInitialized, router]);
  // Load on mount and whenever modal closes (after a retry)
  useEffect(() => { const all = loadAllProgress(); setAllNodes(Object.values(all)); }, []);
  useEffect(() => { if (!isRetryModalOpen) { const all = loadAllProgress(); setAllNodes(Object.values(all)); } }, [isRetryModalOpen]);

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--p-border)", borderTopColor: "var(--snap)", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  // ── Build hierarchy ──────────────────────────────────────────────────────────
  const unitMap: Record<string, { unitName: string; nodes: NodeProgressData[] }> = {};
  for (const node of allNodes) {
    const uid = node.unitId || "uncategorized";
    if (!unitMap[uid]) unitMap[uid] = { unitName: node.unitName || "Uncategorized", nodes: [] };
    unitMap[uid].nodes.push(node);
  }

  const units = Object.entries(unitMap).map(([unitId, { unitName, nodes }]) => {
    const topicMap: Record<string, { topicName: string; nodes: NodeProgressData[] }> = {};
    for (const n of nodes) {
      const tid = n.topicId || "general";
      if (!topicMap[tid]) topicMap[tid] = { topicName: n.topicName || "General", nodes: [] };
      topicMap[tid].nodes.push(n);
    }
    const topics = Object.entries(topicMap).map(([topicId, { topicName, nodes: tnodes }]) => ({
      topicId, topicName, nodes: tnodes,
      avgHeat: avg(tnodes.map(n => n.heatScore)),
      masteredCount: tnodes.filter(n => n.isIgnited).length,
    }));
    return {
      unitId, unitName, topics,
      avgHeat: avg(nodes.map(n => n.heatScore)),
      masteredCount: nodes.filter(n => n.isIgnited).length,
      totalNodes: nodes.length,
    };
  });

  const selectedUnit = units.find(u => u.unitId === selectedUnitId);
  const selectedTopic = selectedUnit?.topics.find(t => t.topicId === selectedTopicId);

  const breadcrumb = [
    { label: "Units", onClick: () => { setView("units"); setSelectedUnitId(null); setSelectedTopicId(null); } },
    ...(selectedUnit ? [{ label: selectedUnit.unitName, onClick: () => { setView("topics"); setSelectedTopicId(null); } }] : []),
    ...(selectedTopic ? [{ label: selectedTopic.topicName, onClick: () => {} }] : []),
  ];

  const totalAll = allNodes.length;
  const ignitedAll = allNodes.filter(n => n.isIgnited).length;
  const avgAll = avg(allNodes.map(n => n.heatScore));

  // ── Sub-components ───────────────────────────────────────────────────────────
  const NodeCard = ({ node }: { node: NodeProgressData }) => {
    const color = getHeatColor(node.heatScore);
    const glowClass = getGlowClass(node.heatScore);
    const label = getThermalLabel(node.heatScore);
    const canReview = node.heatScore < 70;

    return (
      <div
        className={`node-card ${glowClass}`}
        onClick={() => { if (canReview) { setSelectedNode(node.nodeId); setSelectedNodeData(node); setIsRetryModalOpen(true); } }}
        style={{
          padding: "20px 16px",
          borderRadius: "14px",
          backgroundColor: node.heatScore >= 85
            ? `rgba(185,28,28,0.1)`
            : node.heatScore >= 70
            ? `rgba(239,68,68,0.07)`
            : node.heatScore > 45
            ? `rgba(245,158,11,0.06)`
            : node.heatScore > 0
            ? `rgba(59,130,246,0.06)`
            : "var(--p-sheet)",
          border: `2px solid ${color}50`,
          cursor: canReview ? "pointer" : "default",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "10px", textAlign: "center", minHeight: "150px",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Radial bg glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(circle at 50% 30%, ${color}18 0%, transparent 70%)`,
        }} />

        {/* Emoji */}
        <div style={{
          fontSize: "32px", lineHeight: 1,
          filter: node.heatScore >= 85
            ? "drop-shadow(0 0 10px rgba(185,28,28,1)) drop-shadow(0 0 20px rgba(185,28,28,0.6))"
            : node.heatScore >= 70
            ? "drop-shadow(0 0 8px rgba(239,68,68,0.8))"
            : node.heatScore > 45
            ? "drop-shadow(0 0 6px rgba(245,158,11,0.7))"
            : node.heatScore > 0
            ? "drop-shadow(0 0 5px rgba(59,130,246,0.6))"
            : "none",
        }}>
          {getThermalEmoji(node.heatScore)}
        </div>

        {/* Title */}
        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--t-primary)", lineHeight: 1.35, zIndex: 1, textAlign: "center", wordBreak: "break-word", overflowWrap: "break-word" }}>
          {(node.title || node.nodeId).replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
        </div>

        {/* Score */}
        <div style={{
          fontSize: "22px", fontWeight: 800, color,
          textShadow: node.heatScore > 0 ? `0 0 12px ${color}80` : "none",
          zIndex: 1,
        }}>
          {node.heatScore}%
        </div>

        {/* State badge */}
        <div style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
          color, backgroundColor: `${color}18`,
          padding: "3px 10px", borderRadius: "20px",
          border: `1px solid ${color}30`, zIndex: 1,
        }}>
          {label}
        </div>

        {/* Review hint */}
        {canReview && (
          <div style={{ fontSize: "10px", color: "var(--snap)", fontWeight: 600, zIndex: 1 }}>
            Tap to review →
          </div>
        )}
      </div>
    );
  };

  const UnitCard = ({ unit }: { unit: typeof units[0] }) => {
    const color = getHeatColor(unit.avgHeat);
    const glowClass = getGlowClass(unit.avgHeat);
    return (
      <div
        className={`heat-card ${glowClass}`}
        onClick={() => { setSelectedUnitId(unit.unitId); setView("topics"); }}
        style={{
          padding: "28px 24px", borderRadius: "16px",
          backgroundColor: unit.avgHeat >= 85
            ? "rgba(185,28,28,0.09)" : unit.avgHeat >= 70
            ? "rgba(239,68,68,0.06)" : unit.avgHeat > 45
            ? "rgba(245,158,11,0.05)" : unit.avgHeat > 0
            ? "rgba(59,130,246,0.05)" : "var(--p-sheet)",
          border: `1.5px solid ${color}45`,
          cursor: "pointer", position: "relative", overflow: "hidden",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.borderColor = color; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = `${color}45`; }}
      >
        {/* Ambient bg */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "160px", height: "160px", borderRadius: "50%",
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "var(--t-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>UNIT</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--t-primary)", letterSpacing: "-0.3px" }}>{unit.unitName}</div>
          </div>
          <div style={{
            fontSize: "34px", fontWeight: 800, color,
            textShadow: unit.avgHeat > 0 ? `0 0 16px ${color}90` : "none",
          }}>
            {unit.avgHeat}%
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--t-secondary)", marginBottom: "14px" }}>
          <span>{unit.topics.length} topics</span>
          <span>{unit.totalNodes} nodes</span>
          <span style={{ color: "#22c55e", fontWeight: 600 }}>{unit.masteredCount} 🔥</span>
        </div>

        {/* Heat bar */}
        <div style={{ height: "5px", borderRadius: "3px", backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div
            className={unit.avgHeat >= 85 ? "bar-critical" : unit.avgHeat >= 70 ? "bar-ignition" : unit.avgHeat > 45 ? "bar-warning" : unit.avgHeat > 0 ? "bar-frost" : ""}
            style={{ width: `${unit.avgHeat}%`, height: "100%", backgroundColor: color, borderRadius: "3px", transition: "width 0.6s ease" }}
          />
        </div>
        <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--t-muted)" }}>Click to explore topics →</div>
      </div>
    );
  };

  const TopicCard = ({ topic }: { topic: typeof units[0]["topics"][0] }) => {
    const color = getHeatColor(topic.avgHeat);
    const glowClass = getGlowClass(topic.avgHeat);
    const cols = Math.min(Math.max(Math.ceil(Math.sqrt(topic.nodes.length)), 2), 6);
    return (
      <div
        className={`heat-card ${glowClass}`}
        onClick={() => { setSelectedTopicId(topic.topicId); setView("nodes"); }}
        style={{
          padding: "24px", borderRadius: "16px",
          backgroundColor: topic.avgHeat >= 85
            ? "rgba(185,28,28,0.09)" : topic.avgHeat >= 70
            ? "rgba(239,68,68,0.06)" : topic.avgHeat > 45
            ? "rgba(245,158,11,0.05)" : topic.avgHeat > 0
            ? "rgba(59,130,246,0.05)" : "var(--p-sheet)",
          border: `1.5px solid ${color}45`,
          cursor: "pointer", position: "relative", overflow: "hidden",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = color; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = `${color}45`; }}
      >
        <div style={{
          position: "absolute", bottom: "-30px", left: "-30px",
          width: "120px", height: "120px", borderRadius: "50%",
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "var(--t-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>TOPIC</div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--t-primary)" }}>{topic.topicName}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: "24px", fontWeight: 800, color,
              textShadow: topic.avgHeat > 0 ? `0 0 12px ${color}80` : "none",
            }}>
              {topic.avgHeat}%
            </div>
            <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>{topic.masteredCount}/{topic.nodes.length} ignited</div>
          </div>
        </div>

        {/* Mini node grid preview */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "4px", marginBottom: "12px" }}>
          {topic.nodes.map(n => (
            <div
              key={n.nodeId}
              title={n.title}
              className={n.heatScore >= 85 ? "bar-critical" : n.heatScore >= 70 ? "bar-ignition" : n.heatScore > 45 ? "bar-warning" : n.heatScore > 0 ? "bar-frost" : ""}
              style={{
                height: "18px", borderRadius: "4px",
                backgroundColor: `${getHeatColor(n.heatScore)}70`,
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: "12px", color: "var(--t-muted)" }}>Click to see node heatmap →</div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)", position: "relative" }}>
      <style>{GLOW_CSS}</style>
      <ParticleBg theme="light" accent="#ef4444" secondary="#ff5c35" />
      <Navbar />
      <main style={{ padding: "48px 24px 80px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "32px", animation: "slideUp 0.4s ease-out" }}>
          <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>MASTERY HEATMAP</span>
          <h1 style={{ fontSize: "34px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>Knowledge Map</h1>
          <p style={{ fontSize: "16px", color: "var(--t-secondary)" }}>Navigate your mastery: Unit → Topic → Node</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Nodes", value: totalAll, color: "var(--snap)" },
            { label: "Ignited 🔥", value: ignitedAll, color: "#ef4444" },
            { label: "Units", value: units.length, color: "#a78bfa" },
            { label: "Avg Heat", value: `${avgAll}%`, color: getHeatColor(avgAll) },
          ].map(s => (
            <div
              key={s.label}
              className={`folio-card ${s.label === "Ignited 🔥" && ignitedAll > 0 ? "glow-ignition" : s.label === "Avg Heat" ? getGlowClass(avgAll) : ""}`}
              style={{ padding: "20px", textAlign: "center" }}
            >
              <div style={{
                fontSize: "28px", fontWeight: 700, color: s.color, lineHeight: 1,
                textShadow: s.label !== "Units" && s.label !== "Total Nodes" && avgAll > 0 ? `0 0 12px ${s.color}60` : "none",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", marginTop: "6px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Breadcrumb */}
        {view !== "units" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "13px" }}>
            {breadcrumb.map((b, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {i > 0 && <span style={{ color: "var(--p-border)" }}>›</span>}
                <button onClick={b.onClick} style={{
                  background: "none", border: "none", padding: 0, fontSize: "13px",
                  cursor: i < breadcrumb.length - 1 ? "pointer" : "default",
                  color: i < breadcrumb.length - 1 ? "var(--snap)" : "var(--t-primary)",
                  fontWeight: i === breadcrumb.length - 1 ? 700 : 500,
                }}>
                  {b.label}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Units View ── */}
        {view === "units" && (
          units.length === 0 ? (
            <div className="folio-card" style={{ padding: "56px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
              <p style={{ color: "var(--t-secondary)", fontSize: "16px" }}>No data yet. Complete a learning session to see your heatmap.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "20px" }}>
              {units.map(u => <UnitCard key={u.unitId} unit={u} />)}
            </div>
          )
        )}

        {/* ── Topics View ── */}
        {view === "topics" && selectedUnit && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "4px" }}>{selectedUnit.unitName}</h2>
              <p style={{ fontSize: "14px", color: "var(--t-secondary)" }}>{selectedUnit.topics.length} topics · {selectedUnit.totalNodes} nodes · {selectedUnit.avgHeat}% avg heat</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "20px" }}>
              {selectedUnit.topics.map(t => <TopicCard key={t.topicId} topic={t} />)}
            </div>
          </div>
        )}

        {/* ── Nodes View ── */}
        {view === "nodes" && selectedTopic && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "4px" }}>{selectedTopic.topicName}</h2>
              <p style={{ fontSize: "14px", color: "var(--t-secondary)" }}>{selectedTopic.nodes.length} nodes · {selectedTopic.avgHeat}% avg heat · {selectedTopic.masteredCount} ignited</p>
            </div>

            {/* Node grid */}
            {(() => {
              const cols = Math.min(Math.max(Math.ceil(Math.sqrt(selectedTopic.nodes.length)), 2), 5);
              return (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px", marginBottom: "36px" }}>
                  {selectedTopic.nodes
                    .slice()
                    .sort((a, b) => b.heatScore - a.heatScore)
                    .map(node => <NodeCard key={node.nodeId} node={node} />)}
                </div>
              );
            })()}

            {/* Detailed list */}
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--t-deep)", marginBottom: "12px" }}>Detailed View</h3>
            <div className="folio-card" style={{ padding: 0, overflow: "hidden" }}>
              {selectedTopic.nodes
                .slice()
                .sort((a, b) => b.heatScore - a.heatScore)
                .map((node, i) => {
                  const color = getHeatColor(node.heatScore);
                  const canReview = node.heatScore < 70;
                  return (
                    <div
                      key={node.nodeId}
                      onClick={() => { if (canReview) { setSelectedNode(node.nodeId); setSelectedNodeData(node); setIsRetryModalOpen(true); } }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 20px",
                        borderBottom: i < selectedTopic.nodes.length - 1 ? "1px solid var(--p-border)" : "none",
                        cursor: canReview ? "pointer" : "default",
                        transition: "background 0.2s",
                        position: "relative",
                      }}
                      onMouseEnter={e => { if (canReview) (e.currentTarget as HTMLElement).style.backgroundColor = `${color}08`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                    >
                      {/* Left accent line by thermal state */}
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
                        backgroundColor: color,
                        opacity: node.heatScore > 0 ? 0.7 : 0,
                        boxShadow: node.heatScore > 0 ? `2px 0 8px ${color}60` : "none",
                      }} />

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "8px" }}>
                        <span style={{
                          fontSize: "22px",
                          filter: node.heatScore >= 70
                            ? "drop-shadow(0 0 6px rgba(239,68,68,0.7))"
                            : node.heatScore > 45
                            ? "drop-shadow(0 0 5px rgba(245,158,11,0.6))"
                            : node.heatScore > 0
                            ? "drop-shadow(0 0 4px rgba(59,130,246,0.5))"
                            : "none",
                        }}>
                          {getThermalEmoji(node.heatScore)}
                        </span>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--t-primary)" }}>
                            {(node.title || node.nodeId).replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--t-muted)" }}>
                            Last studied: {node.lastAttempt ? new Date(node.lastAttempt).toLocaleDateString() : "Never"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          fontSize: "18px", fontWeight: 700, color,
                          textShadow: node.heatScore > 0 ? `0 0 10px ${color}70` : "none",
                        }}>
                          {node.heatScore}%
                        </div>
                        <div style={{
                          fontSize: "10px", fontWeight: 700, color,
                          letterSpacing: "1px",
                          backgroundColor: `${color}15`,
                          padding: "2px 8px", borderRadius: "12px",
                          border: `1px solid ${color}30`,
                        }}>
                          {getThermalLabel(node.heatScore)}
                        </div>
                        {canReview && (
                          <div style={{ fontSize: "11px", color: "var(--snap)", fontWeight: 600 }}>Review →</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {isRetryModalOpen && selectedNodeData && (
        <RetryNodeModal
          nodeId={selectedNode || ""}
          nodeName={selectedNodeData?.title || selectedNode || ""}
          heatScore={selectedNodeData?.heatScore || 0}
          isOpen={isRetryModalOpen}
          onClose={() => { setIsRetryModalOpen(false); setSelectedNode(null); setSelectedNodeData(null); }}
          onSuccess={() => { const all = loadAllProgress(); setAllNodes(Object.values(all)); }}
        />
      )}
    </div>
  );
}
