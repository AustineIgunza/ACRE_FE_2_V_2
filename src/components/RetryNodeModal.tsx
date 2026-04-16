"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadAllProgress, advanceSRS, getFlashpointPhase, NodeProgressData } from "@/utils/progressStorage";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReviewStage = "info" | "loading_next" | "question" | "evaluating" | "feedback" | "summary";

interface ReviewRound {
  roundNum: number;
  question: string;
  type: "mc" | "free_text";
  options?: Array<{ id: string; text: string; is_correct?: boolean }>;
  userAnswer: string;
  correct: boolean;
  score: number;
  feedback: string;
}

interface ActiveQuestion {
  question: string;
  type: "mc" | "free_text";
  options?: Array<{ id: string; text: string; is_correct?: boolean }>;
}

interface RetryNodeModalProps {
  nodeId: string;
  nodeName: string;
  heatScore: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}

function scoreEmoji(score: number) {
  if (score >= 75) return "🔥";
  if (score >= 45) return "⚠️";
  return "❄️";
}

function getHeatColor(heat: number) {
  if (heat >= 70) return "#22c55e";
  if (heat > 45) return "#f59e0b";
  if (heat > 0) return "#3b82f6";
  return "#9ca3af";
}

function getFallbackQuestion(nodeData: NodeProgressData, phase: number): ActiveQuestion {
  if (phase === 1 && (nodeData.multiple_choice_options?.length ?? 0) > 0) {
    return {
      question: nodeData.multiple_choice_question || nodeData.dominoQuestion || "Which best describes the core mechanism?",
      type: "mc",
      options: nodeData.multiple_choice_options,
    };
  }
  if (phase === 2) {
    return {
      question: nodeData.dominoQuestion || "Trace the domino effect. What happens first — and what does it trigger?",
      type: "free_text",
    };
  }
  return {
    question: nodeData.soWhat
      ? `The leverage insight is: "${nodeData.soWhat}". Identify the one variable that could invert this chain and walk through why.`
      : "Identify the critical variable that would break this causal chain and explain the mechanism.",
    type: "free_text",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RetryNodeModal({
  nodeId,
  nodeName,
  heatScore,
  isOpen,
  onClose,
  onSuccess,
}: RetryNodeModalProps) {
  const [stage, setStage] = useState<ReviewStage>("info");
  const [nodeData, setNodeData] = useState<NodeProgressData | null>(null);
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [currentQ, setCurrentQ] = useState<ActiveQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [lastEval, setLastEval] = useState<{ score: number; correct: boolean; feedback: string } | null>(null);
  const [nextQ, setNextQ] = useState<ActiveQuestion | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [srsSaved, setSrsSaved] = useState(false);
  const [finalHeat, setFinalHeat] = useState(heatScore);

  const MAX_ROUNDS = 3;
  const roundNumber = rounds.length + 1;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const all = loadAllProgress();
      const nd = all[nodeId] || null;
      setNodeData(nd);
      setStage("info");
      setRounds([]);
      setCurrentQ(null);
      setSelectedOption(null);
      setTextInput("");
      setLastEval(null);
      setNextQ(null);
      setSessionComplete(false);
      setSrsSaved(false);
      setFinalHeat(heatScore);
    }
  }, [isOpen, nodeId, heatScore]);

  const phase = nodeData ? getFlashpointPhase(nodeData.currentInterval) : 1;
  const phaseColor = phase === 1 ? "#f59e0b" : phase === 2 ? "#ef4444" : "#8b5cf6";
  const phaseLabel = phase === 1 ? "Phase 1 · Foundation" : phase === 2 ? "Phase 2 · Application" : "Phase 3 · Mastery";

  // Generate first question from Gemini when entering review
  const startReview = async () => {
    if (!nodeData) return;
    setStage("loading_next");

    try {
      const res = await fetch("/api/flashpoint/adaptive-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          nodeContent: {
            title: nodeData.title,
            formalMechanism: nodeData.formalMechanism,
            crisisText: nodeData.crisisText,
            dominoQuestion: nodeData.dominoQuestion,
            soWhat: nodeData.soWhat,
            stressTest: nodeData.stressTest,
            latexFormula: nodeData.latexFormula,
          },
          phase,
        }),
      });
      const data = await res.json();
      if (data.question?.question) {
        setCurrentQ({
          question: data.question.question,
          type: data.question.type || "free_text",
          options: data.question.options?.length ? data.question.options : undefined,
        });
      } else {
        setCurrentQ(getFallbackQuestion(nodeData, phase));
      }
    } catch {
      setCurrentQ(getFallbackQuestion(nodeData, phase));
    }
    setStage("question");
  };

  const handleSubmit = async () => {
    if (!currentQ || !nodeData) return;
    let answer = "";
    let mcCorrect: boolean | null = null;

    if (currentQ.type === "mc") {
      if (!selectedOption) return;
      const correctOpt = currentQ.options?.find((o) => o.is_correct);
      mcCorrect = selectedOption === correctOpt?.id;
      answer = currentQ.options?.find((o) => o.id === selectedOption)?.text || selectedOption;
    } else {
      if (textInput.trim().length < 10) return;
      answer = textInput;
    }

    setStage("evaluating");

    try {
      const res = await fetch("/api/flashpoint/adaptive-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeContent: {
            title: nodeData.title,
            formalMechanism: nodeData.formalMechanism,
            crisisText: nodeData.crisisText,
            dominoQuestion: nodeData.dominoQuestion,
            soWhat: nodeData.soWhat,
            stressTest: nodeData.stressTest,
            latexFormula: nodeData.latexFormula,
          },
          phase,
          roundNumber,
          currentQuestion: currentQ.question,
          userAnswer: answer,
          questionType: currentQ.type,
          mcCorrect,
          previousRounds: rounds.map((r) => ({
            question: r.question,
            userAnswer: r.userAnswer,
            score: r.score,
            correct: r.correct,
          })),
        }),
      });

      const data = await res.json();
      const ev = data.evaluation || { score: 50, correct: false, feedback: "Response recorded." };

      const newRound: ReviewRound = {
        roundNum: roundNumber,
        question: currentQ.question,
        type: currentQ.type,
        options: currentQ.options,
        userAnswer: answer,
        correct: ev.correct,
        score: ev.score,
        feedback: ev.feedback,
      };

      const updatedRounds = [...rounds, newRound];
      setRounds(updatedRounds);
      setLastEval({ score: ev.score, correct: ev.correct, feedback: ev.feedback });

      if (data.sessionComplete) {
        const avg = Math.round(updatedRounds.reduce((s, r) => s + r.score, 0) / updatedRounds.length);
        const updated = advanceSRS(nodeId, avg >= 60);
        setFinalHeat(updated.heatScore ?? heatScore);
        setSrsSaved(true);
        setSessionComplete(true);
        setNextQ(null);
        if (onSuccess) onSuccess({ avg, success: avg >= 60, newHeatScore: updated.heatScore });
      } else if (data.nextQuestion?.question) {
        setNextQ({
          question: data.nextQuestion.question,
          type: data.nextQuestion.type || "free_text",
          options: data.nextQuestion.options?.length ? data.nextQuestion.options : undefined,
        });
      } else {
        // No nextQuestion returned but session shouldn't end — use local fallback
        const fallback = nodeData.stressTest
          ? `Stress test: ${nodeData.stressTest}`
          : nodeData.soWhat
          ? `Apply the insight: "${nodeData.soWhat}". Give a concrete example.`
          : `What single variable would break the mechanism of "${nodeData.title}"? Explain why.`;
        setNextQ({ question: fallback, type: "free_text", options: undefined });
      }

      setStage("feedback");
    } catch {
      const fallbackCorrect = mcCorrect ?? false;
      const newRound: ReviewRound = {
        roundNum: roundNumber,
        question: currentQ.question,
        type: currentQ.type,
        options: currentQ.options,
        userAnswer: answer,
        correct: fallbackCorrect,
        score: fallbackCorrect ? 80 : 25,
        feedback: fallbackCorrect ? "Correct." : "Not quite — review the core mechanism.",
      };
      const updatedRounds = [...rounds, newRound];
      setRounds(updatedRounds);
      setLastEval({ score: newRound.score, correct: newRound.correct, feedback: newRound.feedback });
      const updated = advanceSRS(nodeId, fallbackCorrect);
      setFinalHeat(updated.heatScore ?? heatScore);
      setSrsSaved(true);
      setSessionComplete(true);
      if (onSuccess) onSuccess({ success: fallbackCorrect, newHeatScore: updated.heatScore });
      setStage("feedback");
    }
  };

  const handleContinue = () => {
    if (sessionComplete || !nextQ) {
      if (!srsSaved) {
        const avg = rounds.length ? Math.round(rounds.reduce((s, r) => s + r.score, 0) / rounds.length) : 0;
        const updated = advanceSRS(nodeId, avg >= 60);
        setFinalHeat(updated.heatScore ?? heatScore);
        setSrsSaved(true);
        if (onSuccess) onSuccess({ avg, success: avg >= 60, newHeatScore: updated.heatScore });
      }
      setStage("summary");
      return;
    }
    setCurrentQ(nextQ);
    setSelectedOption(null);
    setTextInput("");
    setNextQ(null);
    setLastEval(null);
    setStage("question");
  };

  const overallAvg = rounds.length
    ? Math.round(rounds.reduce((s, r) => s + r.score, 0) / rounds.length)
    : 0;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => (stage === "summary" || srsSaved) ? onClose() : onClose()}
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "580px",
              backgroundColor: "var(--p-white, #ffffff)",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
              overflow: "hidden", maxHeight: "92vh", overflowY: "auto",
            }}
          >

            {/* ── INFO STAGE ── */}
            {stage === "info" && (
              <div style={{ padding: "36px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: phaseColor, margin: "0 0 4px" }}>
                      {phaseLabel}
                    </p>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--t-primary)", margin: 0 }}>
                      {nodeName}
                    </h2>
                  </div>
                  <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--t-muted)", padding: "4px" }}>✕</button>
                </div>

                <div style={{
                  padding: "16px 20px", borderRadius: "12px",
                  border: `2px solid ${getHeatColor(heatScore)}`,
                  marginBottom: "20px",
                  display: "flex", alignItems: "center", gap: "12px",
                }}>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: getHeatColor(heatScore) }}>{heatScore}%</div>
                  <div style={{ fontSize: "22px" }}>{heatScore >= 70 ? "🔥" : heatScore > 45 ? "⚠️" : "❄️"}</div>
                  <span style={{ fontSize: "13px", color: "var(--t-muted)" }}>
                    {heatScore >= 70 ? "Mastered" : heatScore > 45 ? "In Progress" : "Needs Work"}
                  </span>
                </div>

                {nodeData?.crisisText && (
                  <div style={{
                    padding: "14px 16px", borderRadius: "8px",
                    border: "1px solid var(--p-border)",
                    marginBottom: "20px",
                    fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6,
                  }}>
                    {nodeData.crisisText}
                  </div>
                )}

                <div style={{ fontSize: "13px", color: "var(--t-muted)", marginBottom: "20px", lineHeight: 1.5 }}>
                  This is a <strong>3-round adaptive review</strong>. Each question adapts to your answers.
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "10px",
                      border: "1px solid var(--p-border)", backgroundColor: "transparent",
                      color: "var(--t-primary)", fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startReview}
                    style={{
                      flex: 2, padding: "12px", borderRadius: "10px",
                      border: "none", backgroundColor: phaseColor,
                      color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "14px",
                    }}
                  >
                    {heatScore >= 70 ? "Refresh Memory" : "Review Now"}
                  </button>
                </div>
              </div>
            )}

            {/* ── LOADING STAGE ── */}
            {stage === "loading_next" && (
              <div style={{ padding: "60px 32px", textAlign: "center" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  border: `3px solid ${phaseColor}30`,
                  borderTopColor: phaseColor,
                  animation: "spin 0.9s linear infinite",
                  margin: "0 auto 16px",
                }} />
                <p style={{ fontSize: "14px", color: "var(--t-secondary)", fontWeight: 600 }}>Generating your question...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* ── QUESTION STAGE ── */}
            {stage === "question" && currentQ && (
              <div style={{ padding: "28px 32px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "1px", color: phaseColor,
                      backgroundColor: phaseColor + "20", borderRadius: "4px", padding: "3px 8px",
                    }}>{phaseLabel}</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
                        const done = i < rounds.length;
                        const current = i === rounds.length;
                        return (
                          <div key={i} style={{
                            width: "7px", height: "7px", borderRadius: "50%",
                            backgroundColor: done
                              ? (rounds[i]?.correct ? "#22c55e" : "#ef4444")
                              : current ? phaseColor : "#d1d5db",
                          }} />
                        );
                      })}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--t-muted)", fontWeight: 600 }}>
                      Round {Math.min(roundNumber, MAX_ROUNDS)} / {MAX_ROUNDS}
                    </span>
                  </div>
                  <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--t-muted)" }}>✕</button>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "16px" }}>{nodeName}</h3>

                {nodeData?.crisisText && (
                  <div style={{
                    padding: "12px 14px", borderRadius: "8px",
                    borderLeft: `3px solid ${phaseColor}`,
                    backgroundColor: phaseColor + "0d",
                    marginBottom: "14px",
                    fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6,
                  }}>
                    {nodeData.crisisText}
                  </div>
                )}

                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--t-primary)", marginBottom: "16px", lineHeight: 1.5 }}>
                  {currentQ.question}
                </p>

                {/* MC options */}
                {currentQ.type === "mc" && currentQ.options && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                      {currentQ.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedOption(opt.id)}
                          style={{
                            textAlign: "left", padding: "12px 14px", borderRadius: "10px",
                            border: `2px solid ${selectedOption === opt.id ? phaseColor : "#e5e7eb"}`,
                            backgroundColor: selectedOption === opt.id ? phaseColor + "15" : "transparent",
                            color: "var(--t-primary)", cursor: "pointer", fontSize: "14px",
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: "8px", color: phaseColor }}>{opt.id}.</span>
                          {opt.text}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      style={{
                        width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                        cursor: selectedOption ? "pointer" : "not-allowed",
                        backgroundColor: selectedOption ? phaseColor : "#e5e7eb",
                        color: "#fff", fontWeight: 700, fontSize: "15px",
                      }}
                    >
                      Submit Answer
                    </button>
                  </>
                )}

                {/* Free text */}
                {currentQ.type === "free_text" && (
                  <>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Trace the causal chain — be specific about mechanism and consequence..."
                      style={{
                        width: "100%", minHeight: "110px", padding: "13px", borderRadius: "10px",
                        border: "2px solid #e5e7eb", backgroundColor: "transparent",
                        color: "var(--t-primary)", fontSize: "14px", resize: "vertical",
                        outline: "none", lineHeight: 1.6, boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = phaseColor)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 10px" }}>
                      <span style={{ fontSize: "12px", color: "var(--t-muted)" }}>{textInput.length} chars</span>
                      <span style={{ fontSize: "12px", color: textInput.trim().length >= 10 ? "#22c55e" : "var(--t-muted)" }}>
                        {textInput.trim().length >= 10 ? "Ready" : `${10 - textInput.trim().length} more`}
                      </span>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={textInput.trim().length < 10}
                      style={{
                        width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                        cursor: textInput.trim().length >= 10 ? "pointer" : "not-allowed",
                        backgroundColor: textInput.trim().length >= 10 ? phaseColor : "#e5e7eb",
                        color: "#fff", fontWeight: 700, fontSize: "15px",
                      }}
                    >
                      Submit Answer
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── EVALUATING STAGE ── */}
            {stage === "evaluating" && (
              <div style={{ padding: "60px 32px", textAlign: "center" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  border: `3px solid ${phaseColor}30`,
                  borderTopColor: phaseColor,
                  animation: "spin 0.9s linear infinite",
                  margin: "0 auto 16px",
                }} />
                <p style={{ fontSize: "14px", color: "var(--t-secondary)", fontWeight: 600 }}>Analysing your response...</p>
                <p style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "4px" }}>Generating next challenge</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* ── FEEDBACK STAGE ── */}
            {stage === "feedback" && lastEval && (
              <div style={{ padding: "28px 32px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 18px", borderRadius: "12px",
                  backgroundColor: scoreColor(lastEval.score) + "14",
                  border: `2px solid ${scoreColor(lastEval.score)}50`,
                  marginBottom: "14px",
                }}>
                  <span style={{ fontSize: "26px" }}>{scoreEmoji(lastEval.score)}</span>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: scoreColor(lastEval.score), lineHeight: 1 }}>
                      {lastEval.score}<span style={{ fontSize: "12px" }}>/100</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "2px" }}>
                      {lastEval.correct ? "Correct" : "Needs work"}
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                    {lastEval.feedback}
                  </p>
                </div>

                {!lastEval.correct && nodeData?.formalMechanism && (
                  <div style={{
                    padding: "12px 14px", borderRadius: "8px",
                    backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
                    marginBottom: "12px",
                  }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-muted)", marginBottom: "4px" }}>
                      Core Mechanism
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0 }}>
                      {nodeData.formalMechanism}
                    </p>
                  </div>
                )}

                {!sessionComplete && nextQ && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "8px",
                    backgroundColor: phaseColor + "10",
                    border: `1px solid ${phaseColor}30`,
                    marginBottom: "12px",
                  }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: phaseColor, marginBottom: "4px" }}>
                      Next challenge
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--t-secondary)", margin: 0, lineHeight: 1.5 }}>
                      {nextQ.question.length > 120 ? nextQ.question.slice(0, 120) + "..." : nextQ.question}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                    cursor: "pointer",
                    backgroundColor: sessionComplete || !nextQ ? "#374151" : phaseColor,
                    color: "#fff", fontWeight: 700, fontSize: "15px",
                  }}
                >
                  {sessionComplete || !nextQ ? "See Results →" : "Next Challenge →"}
                </button>
              </div>
            )}

            {/* ── SUMMARY STAGE ── */}
            {stage === "summary" && (
              <div style={{ padding: "36px 32px" }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>{scoreEmoji(overallAvg)}</div>
                  <div style={{ fontSize: "30px", fontWeight: 700, color: scoreColor(overallAvg), lineHeight: 1 }}>
                    {overallAvg}<span style={{ fontSize: "15px", fontWeight: 600, color: "var(--t-muted)" }}>/100</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--t-secondary)", marginTop: "6px" }}>
                    {overallAvg >= 75 ? "Excellent mastery — interval extended." : overallAvg >= 50 ? "Solid attempt — keep building on this." : "Needs more work — interval reset for reinforcement."}
                  </p>

                  {/* Heat change */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    padding: "10px 18px", borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    marginTop: "12px",
                  }}>
                    <span style={{ fontSize: "13px", color: "var(--t-muted)" }}>Heat</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: getHeatColor(heatScore) }}>{heatScore}%</span>
                    <span style={{ color: "var(--t-muted)" }}>→</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: getHeatColor(finalHeat) }}>{finalHeat}%</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                  {rounds.map((r) => (
                    <div key={r.roundNum} style={{
                      display: "flex", alignItems: "flex-start", gap: "10px",
                      padding: "12px 14px", borderRadius: "10px",
                      border: `1px solid ${r.correct ? "#22c55e30" : "#ef444430"}`,
                      backgroundColor: r.correct ? "#f0fdf4" : "#fef2f2",
                    }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                        backgroundColor: scoreColor(r.score) + "20",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, color: scoreColor(r.score),
                      }}>
                        {r.roundNum}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "12px", color: "var(--t-muted)", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.question}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--t-secondary)", margin: 0, lineHeight: 1.4 }}>
                          {r.feedback.length > 100 ? r.feedback.slice(0, 100) + "..." : r.feedback}
                        </p>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: scoreColor(r.score), flexShrink: 0 }}>
                        {r.score}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                    cursor: "pointer",
                    backgroundColor: overallAvg >= 60 ? "#22c55e" : "#ef4444",
                    color: "#fff", fontWeight: 700, fontSize: "15px",
                  }}
                >
                  Done
                </button>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
