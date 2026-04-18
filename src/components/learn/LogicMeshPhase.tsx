"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

type MeshStage = "synthesis" | "synthesis_feedback" | "collapse" | "collapse_feedback";

const thermalColor = (acc: string) =>
  acc === "ignition" ? "#22c55e" : acc === "warning" ? "#f59e0b" : "#ef4444";
const thermalLabel = (acc: string) =>
  acc === "ignition" ? "SYSTEM ARCHITECT" : acc === "warning" ? "PARTIAL MESH" : "MESH INCOMPLETE";

export default function LogicMeshPhase() {
  const { scenarios, nodeResults, saveMeshResult } = useArceStore();

  const [meshStage, setMeshStage] = useState<MeshStage>("synthesis");
  const [synthesisText, setSynthesisText] = useState("");
  const [collapseText, setCollapseText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [synthesisScore, setSynthesisScore] = useState(0);
  const [synthesisFeedback, setSynthesisFeedback] = useState("");
  const [collapseQuestion, setCollapseQuestion] = useState("");
  const [collapseScore, setCollapseScore] = useState(0);
  const [collapseFeedback, setCollapseFeedback] = useState("");

  const nodes = scenarios.map((s) => ({
    nodeId: s.nodeId || s.id,
    formalMechanism: s.formalMechanism || "",
    soWhat: (s as any).soWhat || "",
  }));

  const handleSynthesisSubmit = async () => {
    if (!synthesisText.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/mesh-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "synthesis", nodes, userSynthesis: synthesisText }),
      });
      const data = res.ok ? await res.json() : { score: 50, feedback: "Synthesis recorded.", collapseQuestion: "Trace how removing one node affects the system." };
      setSynthesisScore(data.score ?? 50);
      setSynthesisFeedback(data.feedback ?? "Synthesis evaluated.");
      setCollapseQuestion(data.collapseQuestion ?? "If one core mechanism failed, which other nodes would be most affected and why?");
      setMeshStage("synthesis_feedback");
    } catch {
      setSynthesisScore(50);
      setSynthesisFeedback("Your synthesis was recorded. The connections you identified show system-level thinking.");
      setCollapseQuestion("If one core mechanism in this system failed entirely, trace the cascade through at least two other nodes you mastered.");
      setMeshStage("synthesis_feedback");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCollapseSubmit = async () => {
    if (!collapseText.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/mesh-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "collapse", nodes, collapseQuestion, userCollapseResponse: collapseText }),
      });
      const data = res.ok ? await res.json() : { score: 50, feedback: "Collapse analysis recorded.", accuracy: "warning" };
      setCollapseScore(data.score ?? 50);
      setCollapseFeedback(data.feedback ?? "Cascade analysis evaluated.");
      setMeshStage("collapse_feedback");
    } catch {
      setCollapseScore(50);
      setCollapseFeedback("Your cascade analysis was recorded. The ripple effects you identified show system-level reasoning.");
      setMeshStage("collapse_feedback");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleComplete = () => {
    saveMeshResult({
      synthesisScore,
      synthesisFeedback,
      collapseQuestion,
      collapseResponse: collapseText,
      collapseFeedback,
    });
    useArceStore.setState({ currentPhase: "debrief" });
  };

  const blendedMeshScore = Math.round(synthesisScore * 0.5 + collapseScore * 0.5);
  const meshAccuracy = blendedMeshScore >= 75 ? "ignition" : blendedMeshScore >= 45 ? "warning" : "frost";

  const nodePills = nodes.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0c",
        color: "#e8e6e0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(255,92,53,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "800px", position: "relative" }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "10px 20px", borderRadius: "8px",
            backgroundColor: "rgba(255,92,53,0.08)",
            border: "1px solid rgba(255,92,53,0.15)",
            marginBottom: "28px",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ff5c35" }}
          />
          <span style={{ fontSize: "12px", color: "#ff8860", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
            LOGIC MESH — FINAL SYNTHESIS
          </span>
        </motion.div>

        {/* Node pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}
        >
          {nodePills.map((n, i) => {
            const result = nodeResults[n.nodeId];
            const color = result?.accuracy === "ignition" ? "#22c55e" : result?.accuracy === "warning" ? "#f59e0b" : "rgba(255,255,255,0.3)";
            const label = n.nodeId.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            return (
              <div key={i} style={{
                padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                backgroundColor: `${color}15`,
                border: `1px solid ${color}40`,
                color,
              }}>
                {label}
              </div>
            );
          })}
          {nodes.length > 8 && (
            <div style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
            }}>
              +{nodes.length - 8} more
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Synthesis stage ── */}
          {meshStage === "synthesis" && (
            <motion.div key="synthesis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(22px, 3vw, 34px)",
                fontWeight: 400, letterSpacing: "-0.8px",
                color: "#f0f2ec", marginBottom: "12px",
              }}>
                You&apos;ve mastered {nodes.length} node{nodes.length !== 1 ? "s" : ""}. Now connect them.
              </h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "28px" }}>
                These nodes don't exist in isolation — they form a system. Choose any two where failure in one creates cascading consequences in the other. Describe the dependency chain: what breaks first, what it triggers, and the system-level outcome.
              </p>
              <div style={{
                padding: "16px 20px", borderRadius: "10px", marginBottom: "20px",
                backgroundColor: "rgba(255,92,53,0.06)",
                border: "1px solid rgba(255,92,53,0.15)",
              }}>
                <p style={{ fontSize: "12px", color: "#ff8860", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                  CROSS-NODE SYNTHESIS CHALLENGE
                </p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0 }}>
                  Explain how a failure or change in one node propagates through the system. Be specific — name the nodes, trace the mechanism, identify the consequence.
                </p>
              </div>
              <textarea
                value={synthesisText}
                onChange={(e) => setSynthesisText(e.target.value)}
                placeholder="e.g. A failure in Node A breaks the feedback loop because... which then causes Node C to... ultimately resulting in..."
                style={{
                  width: "100%", minHeight: "150px", padding: "18px 20px",
                  fontSize: "14px", lineHeight: 1.7, fontFamily: "inherit",
                  borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)", color: "#f0f2ec",
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,92,53,0.35)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                <span>{synthesisText.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(255,92,53,0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSynthesisSubmit}
                disabled={isEvaluating || synthesisText.trim().split(/\s+/).filter(Boolean).length < 10}
                style={{
                  marginTop: "24px", width: "100%",
                  padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase", color: "#fff",
                  backgroundColor: synthesisText.trim() ? "#ff5c35" : "rgba(255,92,53,0.3)",
                  border: "none", borderRadius: "10px", cursor: isEvaluating ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                }}
              >
                {isEvaluating ? "EVALUATING MESH..." : "SUBMIT SYNTHESIS →"}
              </motion.button>
            </motion.div>
          )}

          {/* ── Synthesis feedback ── */}
          {meshStage === "synthesis_feedback" && (
            <motion.div key="synthesis_feedback" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                padding: "24px 28px", borderRadius: "14px", marginBottom: "28px",
                backgroundColor: `${thermalColor(synthesisScore >= 75 ? "ignition" : synthesisScore >= 45 ? "warning" : "frost")}10`,
                border: `1px solid ${thermalColor(synthesisScore >= 75 ? "ignition" : synthesisScore >= 45 ? "warning" : "frost")}30`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: thermalColor(synthesisScore >= 75 ? "ignition" : synthesisScore >= 45 ? "warning" : "frost"), margin: 0 }}>
                    SYNTHESIS SCORE
                  </p>
                  <span style={{ fontSize: "24px", fontWeight: 700, color: thermalColor(synthesisScore >= 75 ? "ignition" : synthesisScore >= 45 ? "warning" : "frost") }}>
                    {synthesisScore}/100
                  </span>
                </div>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", lineHeight: 1.75, margin: 0, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                  {synthesisFeedback}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMeshStage("collapse")}
                style={{
                  width: "100%", padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase", color: "#fff",
                  backgroundColor: "#ff5c35", border: "none", borderRadius: "10px", cursor: "pointer",
                }}
              >
                CONTINUE TO COLLAPSE TEST →
              </motion.button>
            </motion.div>
          )}

          {/* ── Collapse stage ── */}
          {meshStage === "collapse" && (
            <motion.div key="collapse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{
                padding: "6px 14px", borderRadius: "6px", display: "inline-block",
                backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                marginBottom: "20px",
              }}>
                <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                  ⚡ SYSTEM COLLAPSE SCENARIO
                </span>
              </div>
              <div style={{
                padding: "24px 28px", borderRadius: "14px", marginBottom: "28px",
                backgroundColor: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.18)",
              }}>
                <p style={{
                  fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: 500,
                  color: "#f0f2ec", lineHeight: 1.75, margin: 0,
                }}>
                  {collapseQuestion}
                </p>
              </div>
              <textarea
                value={collapseText}
                onChange={(e) => setCollapseText(e.target.value)}
                placeholder="Trace the ripple effects: what breaks first, what adapts, what's the new stable state..."
                style={{
                  width: "100%", minHeight: "150px", padding: "18px 20px",
                  fontSize: "14px", lineHeight: 1.7, fontFamily: "inherit",
                  borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)", color: "#f0f2ec",
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(239,68,68,0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCollapseSubmit}
                disabled={isEvaluating || collapseText.trim().split(/\s+/).filter(Boolean).length < 10}
                style={{
                  marginTop: "24px", width: "100%",
                  padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase", color: "#fff",
                  backgroundColor: collapseText.trim() ? "#ef4444" : "rgba(239,68,68,0.3)",
                  border: "none", borderRadius: "10px", cursor: isEvaluating ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                }}
              >
                {isEvaluating ? "ANALYZING CASCADE..." : "SUBMIT CASCADE ANALYSIS →"}
              </motion.button>
            </motion.div>
          )}

          {/* ── Collapse feedback + complete ── */}
          {meshStage === "collapse_feedback" && (
            <motion.div key="collapse_feedback" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {/* Score cards */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "SYNTHESIS", score: synthesisScore },
                  { label: "CASCADE", score: collapseScore },
                  { label: "MESH SCORE", score: blendedMeshScore },
                ].map(({ label, score }) => {
                  const acc = score >= 75 ? "ignition" : score >= 45 ? "warning" : "frost";
                  return (
                    <div key={label} style={{
                      flex: 1, padding: "16px", borderRadius: "10px", textAlign: "center",
                      backgroundColor: `${thermalColor(acc)}10`,
                      border: `1px solid ${thermalColor(acc)}30`,
                    }}>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px", marginBottom: "6px" }}>{label}</div>
                      <div style={{ fontSize: "24px", fontWeight: 700, color: thermalColor(acc) }}>{score}</div>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>/ 100</div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                padding: "24px 28px", borderRadius: "14px", marginBottom: "28px",
                backgroundColor: `${thermalColor(meshAccuracy)}08`,
                border: `1px solid ${thermalColor(meshAccuracy)}25`,
              }}>
                <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: thermalColor(meshAccuracy), marginBottom: "8px" }}>
                  {thermalLabel(meshAccuracy)}
                </p>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", lineHeight: 1.75, margin: 0, fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                  {collapseFeedback}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 32px rgba(34,197,94,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                style={{
                  width: "100%", padding: "18px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase", color: "#fff",
                  backgroundColor: "#22c55e", border: "none", borderRadius: "12px", cursor: "pointer",
                }}
              >
                COMPLETE SESSION — VIEW MISSION DEBRIEF →
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
