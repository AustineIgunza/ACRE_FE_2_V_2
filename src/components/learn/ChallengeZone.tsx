"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import { saveNodeProgress, initNodeSRS } from "@/utils/progressStorage";

type Stage = "domino" | "domino_feedback" | "mc" | "mc_feedback";

export default function ChallengeZone() {
  const { currentScenario, scenarios, isLoading, error, incrementAttempt } = useArceStore();

  const [stage, setStage] = useState<Stage>("domino");
  const [dominoResponse, setDominoResponse] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [dominoResult, setDominoResult] = useState<{ score: number; feedback: string; accuracy: string } | null>(null);
  const [mcResult, setMcResult] = useState<{ score: number; feedback: string; accuracy: string } | null>(null);

  if (!currentScenario) return null;

  const scenarioIndex = scenarios.findIndex((s) => s.id === currentScenario.id);
  const totalScenarios = scenarios.length;
  const progress = totalScenarios > 0 ? ((scenarioIndex + 1) / totalScenarios) * 100 : 0;

  const mcOptions: Array<{ id: string; text: string; is_correct?: boolean }> =
    (currentScenario as any)?.multiple_choice_options || [];
  const mcQuestion: string = (currentScenario as any)?.multiple_choice_question || "";
  const hasMC = mcOptions.length > 0 && mcQuestion.trim().length > 0;

  // ── Round 1: Submit domino prediction ─────────────────────────────────────
  const handleDominoSubmit = async () => {
    if (!dominoResponse.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: currentScenario.nodeId,
          prediction: dominoResponse,
          question: currentScenario.dominoQuestion,
          formalMechanism: currentScenario.formalMechanism,
          soWhat: (currentScenario as any).soWhat,
        }),
      });
      const result = res.ok ? await res.json() : { score: 40, accuracy: "frost", feedback: "Response recorded." };
      setDominoResult({ score: result.score ?? 40, feedback: result.feedback ?? "", accuracy: result.accuracy ?? "frost" });
      setStage("domino_feedback");
    } catch {
      setDominoResult({ score: 40, feedback: "Response recorded.", accuracy: "frost" });
      setStage("domino_feedback");
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── Advance from domino feedback → MC or finish ────────────────────────────
  const handleAfterDomino = () => {
    if (hasMC) {
      setStage("mc");
    } else {
      finishNode(dominoResult!.score, dominoResult!.accuracy);
    }
  };

  // ── Round 2: Submit MC answer ──────────────────────────────────────────────
  const handleMCSubmit = async () => {
    if (!selectedChoice || isEvaluating) return;
    setIsEvaluating(true);
    const correctOption = mcOptions.find((o) => o.is_correct === true);
    const correctAnswer = correctOption?.id || "A";
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: currentScenario.nodeId,
          prediction: selectedChoice,
          isMultipleChoice: true,
          correctAnswer,
          question: mcQuestion,
        }),
      });
      const result = res.ok ? await res.json() : { score: 30, accuracy: "frost", feedback: "Response recorded." };
      setMcResult({ score: result.score ?? 30, feedback: result.feedback ?? "", accuracy: result.accuracy ?? "frost" });
      setStage("mc_feedback");

      // Blend: domino 60% + MC 40%
      const dominoScore = dominoResult?.score ?? 50;
      const mcScore = result.score ?? 30;
      const blended = Math.round(dominoScore * 0.6 + mcScore * 0.4);
      const blendedAccuracy = blended >= 75 ? "ignition" : blended >= 45 ? "warning" : "frost";

      // Advance after 2s
      setTimeout(() => finishNode(blended, blendedAccuracy), 2000);
    } catch {
      const fallback = { score: 30, feedback: "Response recorded.", accuracy: "frost" };
      setMcResult(fallback);
      setStage("mc_feedback");
      setTimeout(() => finishNode(dominoResult?.score ?? 40, dominoResult?.accuracy ?? "frost"), 2000);
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── Persist + advance phase (mastery-gated) ───────────────────────────────
  const finishNode = (heatScore: number, accuracy: string) => {
    const nodeId = currentScenario.nodeId || currentScenario.id;
    const thermalStateVal = accuracy === "ignition" ? "ignition" : accuracy === "warning" ? "warning" : "frost";
    const state = useArceStore.getState();
    const cluster = state.gameSession?.clusters[state.gameSession.currentClusterIndex];
    const clusterNode = cluster?.nodes.find((n: any) => n.id === nodeId);
    const title = clusterNode?.title || nodeId;

    // Increment attempt count in store
    incrementAttempt(nodeId);

    // Persist current attempt (always — tracks best)
    const sessionTitle = state.gameSession?.sourceTitle || "Learning Session";
    const unitName = state.currentUnitName || "Uncategorized";
    const topicName = state.currentTopicName || sessionTitle;
    saveNodeProgress(nodeId, {
      nodeId, title, heatScore, thermalState: thermalStateVal,
      isIgnited: accuracy === "ignition",
      lastAttempt: new Date().toISOString(),
      unitName,
      unitId: unitName.toLowerCase().replace(/\s+/g, "-"),
      topicName,
      topicId: topicName.toLowerCase().replace(/\s+/g, "-"),
      crisisText: currentScenario.crisisText,
      formalMechanism: currentScenario.formalMechanism,
      latexFormula: currentScenario.latexFormula,
      soWhat: (currentScenario as any).soWhat,
      stressTest: (currentScenario as any).stressTest,
      dominoQuestion: currentScenario.dominoQuestion,
      multiple_choice_question: (currentScenario as any).multiple_choice_question,
      multiple_choice_options: (currentScenario as any).multiple_choice_options,
    });
    initNodeSRS(nodeId, heatScore);

    const updatedNodeResults = {
      ...state.nodeResults,
      [nodeId]: { accuracy, heatScore, feedback: dominoResult?.feedback ?? "", thermalState: thermalStateVal },
    };

    // ── Advance to Breakthrough Transition ───────────────────────────────────
    useArceStore.setState({ isLoading: false, currentPhase: "transition", nodeResults: updatedNodeResults });
    state.saveProgressToDatabase(nodeId, heatScore, thermalStateVal as any);
  };

  // ── Thermal color helpers ──────────────────────────────────────────────────
  const thermalColor = (acc: string) =>
    acc === "ignition" ? "#22c55e" : acc === "warning" ? "#f59e0b" : "#ef4444";
  const thermalEmoji = (acc: string) =>
    acc === "ignition" ? "🔥" : acc === "warning" ? "⚠️" : "❄️";

  const roundLabel = stage === "domino" || stage === "domino_feedback" ? "ROUND 1 OF 2" : "ROUND 2 OF 2";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0c",
        color: "#e8e6e0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Glow */}
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(255,92,53,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top Bar */}
      <div style={{
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: "#ff5c35", boxShadow: "0 0 12px rgba(255,92,53,0.6)",
          }} />
          <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            CHALLENGE ZONE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            CONCEPT {scenarioIndex + 1} / {totalScenarios}
          </span>
          {/* Round dots */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {[1, 2].map((r) => {
              const done = (r === 1 && (stage === "domino_feedback" || stage === "mc" || stage === "mc_feedback")) ||
                           (r === 2 && stage === "mc_feedback");
              const active = (r === 1 && stage === "domino") || (r === 2 && (stage === "mc" || stage === "mc_feedback"));
              return (
                <div key={r} style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  backgroundColor: done ? "#22c55e" : active ? "#ff5c35" : "rgba(255,255,255,0.15)",
                  transition: "background-color 0.3s",
                }} />
              );
            })}
          </div>
          <div style={{ width: "120px", height: "3px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              style={{ height: "100%", backgroundColor: "#ff5c35", borderRadius: "2px" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 24px", maxWidth: "800px",
        margin: "0 auto", width: "100%",
      }}>
        {/* Round badge */}
        <motion.div
          key={roundLabel}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            padding: "12px 24px", borderRadius: "8px",
            backgroundColor: "rgba(255,92,53,0.08)",
            border: "1px solid rgba(255,92,53,0.15)",
            marginBottom: "32px",
            display: "flex", alignItems: "center", gap: "10px",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }}
          />
          <span style={{ fontSize: "13px", color: "#ff8860", fontWeight: 600, fontFamily: "monospace" }}>
            {roundLabel} — {stage === "domino" || stage === "domino_feedback" ? "DOMINO PREDICTION" : "SIGNAL CHECK"}
          </span>
        </motion.div>

        {/* Node title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 400, letterSpacing: "-0.8px",
            color: "#f0f2ec", textAlign: "center", marginBottom: "16px",
          }}
        >
          {currentScenario.nodeId.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        </motion.h2>

        {/* Crisis context */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: "15px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)",
            textAlign: "center", marginBottom: "32px", maxWidth: "650px",
          }}
        >
          {currentScenario.crisisText}
        </motion.p>

        <AnimatePresence mode="wait">

          {/* ── Stage: domino ── */}
          {stage === "domino" && (
            <motion.div key="domino" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ width: "100%" }}>
              <div style={{
                padding: "20px 24px", borderRadius: "12px",
                backgroundColor: "rgba(255,92,53,0.08)",
                border: "1px solid rgba(255,92,53,0.2)", marginBottom: "24px",
              }}>
                <p style={{ fontSize: "13px", color: "#ff8860", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  DOMINO EFFECT PREDICTION
                </p>
                <p style={{ fontSize: "15px", color: "#f0f2ec", fontWeight: 500, lineHeight: 1.6 }}>
                  {currentScenario.dominoQuestion || "Predict what happens next in this chain of events."}
                </p>
              </div>
              <textarea
                value={dominoResponse}
                onChange={(e) => setDominoResponse(e.target.value)}
                placeholder="Trace the chain of consequences... What happens first, and what does it trigger?"
                style={{
                  width: "100%", height: "140px", padding: "16px 20px",
                  fontSize: "14px", lineHeight: 1.6, fontFamily: "inherit",
                  borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.04)", color: "#f0f2ec",
                  resize: "vertical", boxSizing: "border-box", outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,92,53,0.4)"; e.currentTarget.style.backgroundColor = "rgba(255,92,53,0.06)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                <span>{dominoResponse.length} characters</span>
                <span>{dominoResponse.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
              {error && (
                <div style={{ marginTop: "12px", padding: "12px 20px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "14px", textAlign: "center" }}>
                  {error}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,92,53,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDominoSubmit}
                disabled={isEvaluating || isLoading || !dominoResponse.trim()}
                style={{
                  marginTop: "32px", width: "100%", maxWidth: "300px",
                  display: "block", margin: "32px auto 0",
                  padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase",
                  color: "#fff",
                  backgroundColor: dominoResponse.trim() ? "#ff5c35" : "rgba(255,92,53,0.3)",
                  border: "none", borderRadius: "10px",
                  cursor: isEvaluating || !dominoResponse.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                }}
              >
                {isEvaluating ? "ANALYZING..." : "SUBMIT PREDICTION →"}
              </motion.button>
            </motion.div>
          )}

          {/* ── Stage: domino feedback ── */}
          {stage === "domino_feedback" && dominoResult && (
            <motion.div key="domino_feedback" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ width: "100%" }}>
              <div style={{
                padding: "24px", borderRadius: "12px",
                backgroundColor: `${thermalColor(dominoResult.accuracy)}10`,
                border: `1px solid ${thermalColor(dominoResult.accuracy)}30`,
                marginBottom: "24px", textAlign: "center",
              }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{thermalEmoji(dominoResult.accuracy)}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: thermalColor(dominoResult.accuracy), marginBottom: "8px" }}>
                  Round 1 Score: {dominoResult.score}/100
                </div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>
                  {dominoResult.feedback}
                </p>
              </div>
              {hasMC ? (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAfterDomino}
                  style={{
                    width: "100%", maxWidth: "300px", display: "block", margin: "0 auto",
                    padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                    letterSpacing: "1px", textTransform: "uppercase",
                    color: "#fff", backgroundColor: "#ff5c35",
                    border: "none", borderRadius: "10px", cursor: "pointer",
                  }}
                >
                  ROUND 2: SIGNAL CHECK →
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => finishNode(dominoResult.score, dominoResult.accuracy)}
                  style={{
                    width: "100%", maxWidth: "300px", display: "block", margin: "0 auto",
                    padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                    letterSpacing: "1px", textTransform: "uppercase",
                    color: "#fff", backgroundColor: "#ff5c35",
                    border: "none", borderRadius: "10px", cursor: "pointer",
                  }}
                >
                  NEXT NODE →
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── Stage: mc ── */}
          {stage === "mc" && (
            <motion.div key="mc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ width: "100%" }}>
              <div style={{
                padding: "20px 24px", borderRadius: "12px",
                backgroundColor: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.2)", marginBottom: "24px",
              }}>
                <p style={{ fontSize: "13px", color: "#a78bfa", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  SIGNAL CHECK
                </p>
                <p style={{ fontSize: "15px", color: "#f0f2ec", fontWeight: 500, lineHeight: 1.6 }}>
                  {mcQuestion}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                {mcOptions.map((option, index) => (
                  <motion.button
                    key={option.id ?? index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => setSelectedChoice(option.id)}
                    style={{
                      padding: "16px 20px", borderRadius: "10px",
                      border: selectedChoice === option.id ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.15)",
                      backgroundColor: selectedChoice === option.id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                      color: "#f0f2ec", fontSize: "14px", textAlign: "left", cursor: "pointer",
                      transition: "all 0.2s",
                      fontWeight: selectedChoice === option.id ? 600 : 400,
                    }}
                  >
                    <span style={{ fontWeight: 700, marginRight: "12px", color: "#a78bfa" }}>{option.id}.</span>
                    {option.text}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleMCSubmit}
                disabled={isEvaluating || !selectedChoice}
                style={{
                  marginTop: "32px", width: "100%", maxWidth: "300px",
                  display: "block", margin: "32px auto 0",
                  padding: "16px 32px", fontSize: "14px", fontWeight: 700,
                  letterSpacing: "1px", textTransform: "uppercase", color: "#fff",
                  backgroundColor: selectedChoice ? "#8b5cf6" : "rgba(139,92,246,0.3)",
                  border: "none", borderRadius: "10px",
                  cursor: isEvaluating || !selectedChoice ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                }}
              >
                {isEvaluating ? "EVALUATING..." : "LOCK IN ANSWER →"}
              </motion.button>
            </motion.div>
          )}

          {/* ── Stage: mc feedback (auto-advances) ── */}
          {stage === "mc_feedback" && mcResult && dominoResult && (
            <motion.div key="mc_feedback" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                  flex: 1, padding: "16px", borderRadius: "10px",
                  backgroundColor: `${thermalColor(dominoResult.accuracy)}10`,
                  border: `1px solid ${thermalColor(dominoResult.accuracy)}30`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px", marginBottom: "4px" }}>ROUND 1</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: thermalColor(dominoResult.accuracy) }}>{dominoResult.score}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>/ 100</div>
                </div>
                <div style={{
                  flex: 1, padding: "16px", borderRadius: "10px",
                  backgroundColor: `${thermalColor(mcResult.accuracy)}10`,
                  border: `1px solid ${thermalColor(mcResult.accuracy)}30`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px", marginBottom: "4px" }}>ROUND 2</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: thermalColor(mcResult.accuracy) }}>{mcResult.score}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>/ 100</div>
                </div>
                <div style={{
                  flex: 1, padding: "16px", borderRadius: "10px",
                  backgroundColor: "rgba(255,92,53,0.08)",
                  border: "1px solid rgba(255,92,53,0.2)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px", marginBottom: "4px" }}>HEAT SCORE</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#ff5c35" }}>
                    {Math.round(dominoResult.score * 0.6 + mcResult.score * 0.4)}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>/ 100</div>
                </div>
              </div>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                Advancing to Intel Card...
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
