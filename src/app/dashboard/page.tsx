"use client";

import { useEffect, useState, useCallback } from "react";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  loadAllProgress,
  getRecentNodes,
  advanceSRS,
  getFlashpointPhase,
  getDueLabel,
  formatDate,
  NodeProgressData,
} from "@/utils/progressStorage";

// ── Adaptive Flashpoint Review Modal ─────────────────────────────────────────

type ReviewStage = "question" | "evaluating" | "feedback" | "loading_next" | "summary";

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

function getInitialQuestion(node: NodeProgressData, phase: number): ActiveQuestion {
  if (phase === 1 && (node.multiple_choice_options?.length ?? 0) > 0) {
    return {
      question: node.multiple_choice_question || node.dominoQuestion || "Which best describes the core mechanism?",
      type: "mc",
      options: node.multiple_choice_options,
    };
  }
  if (phase === 2) {
    return {
      question: node.dominoQuestion || "Trace the domino effect. What happens first — and what does it trigger?",
      type: "free_text",
    };
  }
  return {
    question: node.soWhat
      ? `The leverage insight is: "${node.soWhat}". Identify the one variable that could invert this chain and walk through why.`
      : "Identify the critical variable that would break this causal chain and explain the mechanism.",
    type: "free_text",
  };
}

function scoreColor(score: number) {
  if (score >= 75) return "#16a34a";
  if (score >= 45) return "#f59e0b";
  return "#dc2626";
}

function scoreEmoji(score: number) {
  if (score >= 75) return "🔥";
  if (score >= 45) return "⚠️";
  return "❄️";
}

function FlashpointModal({
  node,
  onClose,
  onResult,
}: {
  node: NodeProgressData;
  onClose: () => void;
  onResult: (success: boolean) => void;
}) {
  const phase = getFlashpointPhase(node.currentInterval);
  const phaseColor = phase === 1 ? "#f59e0b" : phase === 2 ? "#ef4444" : "#8b5cf6";
  const phaseLabel = phase === 1 ? "Phase 1 · Foundation" : phase === 2 ? "Phase 2 · Application" : "Phase 3 · Mastery";

  const [stage, setStage] = useState<ReviewStage>("loading_next");
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [currentQ, setCurrentQ] = useState<ActiveQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [lastEval, setLastEval] = useState<{ score: number; correct: boolean; feedback: string } | null>(null);
  const [nextQ, setNextQ] = useState<ActiveQuestion | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [srsSaved, setSrsSaved] = useState(false);

  const roundNumber = rounds.length + 1;
  const MAX_ROUNDS = 3;

  // Generate first question from Gemini on mount — ensures every session is unique
  useEffect(() => {
    let cancelled = false;
    const loadFirstQuestion = async () => {
      try {
        const res = await fetch("/api/flashpoint/adaptive-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "generate",
            nodeContent: {
              title: node.title,
              formalMechanism: node.formalMechanism,
              crisisText: node.crisisText,
              dominoQuestion: node.dominoQuestion,
              soWhat: node.soWhat,
              stressTest: node.stressTest,
              latexFormula: node.latexFormula,
            },
            phase,
          }),
        });
        const data = await res.json();
        if (!cancelled && data.question?.question) {
          setCurrentQ({
            question: data.question.question,
            type: data.question.type || "free_text",
            options: data.question.options?.length ? data.question.options : undefined,
          });
          setStage("question");
        } else if (!cancelled) {
          // Fallback to cached question
          setCurrentQ(getInitialQuestion(node, phase));
          setStage("question");
        }
      } catch {
        if (!cancelled) {
          setCurrentQ(getInitialQuestion(node, phase));
          setStage("question");
        }
      }
    };
    loadFirstQuestion();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!currentQ) return;
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
            title: node.title,
            formalMechanism: node.formalMechanism,
            crisisText: node.crisisText,
            dominoQuestion: node.dominoQuestion,
            soWhat: node.soWhat,
            stressTest: node.stressTest,
            latexFormula: node.latexFormula,
          },
          phase,
          roundNumber,
          currentQuestion: currentQ!.question,
          userAnswer: answer,
          questionType: currentQ!.type,
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
        question: currentQ!.question,
        type: currentQ!.type,
        options: currentQ!.options,
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
        advanceSRS(node.nodeId, avg >= 60);
        setSrsSaved(true);
        setSessionComplete(true);
        setNextQ(null);
      } else if (data.nextQuestion?.question) {
        setNextQ({
          question: data.nextQuestion.question,
          type: data.nextQuestion.type || "free_text",
          options: data.nextQuestion.options?.length ? data.nextQuestion.options : undefined,
        });
      } else {
        // No nextQuestion returned — use local fallback to keep session going
        const fallback = node.stressTest
          ? `Stress test: ${node.stressTest}`
          : node.soWhat
          ? `Apply the insight: "${node.soWhat}". Give a concrete example.`
          : `What single variable would break the mechanism of "${node.title}"? Explain why.`;
        setNextQ({ question: fallback, type: "free_text", options: undefined });
      }

      setStage("feedback");
    } catch {
      // Fallback on error
      const fallbackCorrect = mcCorrect ?? false;
      const newRound: ReviewRound = {
        roundNum: roundNumber,
        question: currentQ!.question,
        type: currentQ!.type,
        options: currentQ!.options,
        userAnswer: answer,
        correct: fallbackCorrect,
        score: fallbackCorrect ? 80 : 25,
        feedback: fallbackCorrect ? "Correct." : "Not quite — review the core mechanism.",
      };
      const updatedRounds = [...rounds, newRound];
      setRounds(updatedRounds);
      setLastEval({ score: newRound.score, correct: newRound.correct, feedback: newRound.feedback });
      advanceSRS(node.nodeId, fallbackCorrect);
      setSrsSaved(true);
      setSessionComplete(true);
      setStage("feedback");
    }
  };

  const handleContinue = () => {
    if (sessionComplete || !nextQ) {
      if (!srsSaved) {
        const avg = rounds.length
          ? Math.round(rounds.reduce((s, r) => s + r.score, 0) / rounds.length)
          : 0;
        advanceSRS(node.nodeId, avg >= 60);
        setSrsSaved(true);
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

  const handleFinish = () => {
    const avg = rounds.length
      ? Math.round(rounds.reduce((s, r) => s + r.score, 0) / rounds.length)
      : 0;
    onResult(avg >= 60);
  };

  const overallAvg = rounds.length
    ? Math.round(rounds.reduce((s, r) => s + r.score, 0) / rounds.length)
    : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      backgroundColor: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        backgroundColor: "var(--p-surface)",
        borderRadius: "16px",
        border: "1px solid var(--p-border)",
        maxWidth: "640px",
        width: "100%",
        maxHeight: "92vh",
        overflowY: "auto",
        padding: "28px 32px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1px", color: phaseColor,
                backgroundColor: phaseColor + "20", borderRadius: "4px",
                padding: "3px 8px",
              }}>{phaseLabel}</span>
              {/* Round dots */}
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
                  const done = i < rounds.length;
                  const current = i === rounds.length && stage !== "summary";
                  const roundResult = rounds[i];
                  return (
                    <div key={i} style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      backgroundColor: done
                        ? (roundResult?.correct ? "#16a34a" : "#dc2626")
                        : current ? phaseColor : "var(--p-border)",
                      transition: "all 0.2s",
                    }} />
                  );
                })}
              </div>
              {stage !== "summary" && (
                <span style={{ fontSize: "11px", color: "var(--t-muted)", fontWeight: 600 }}>
                  Round {Math.min(roundNumber, MAX_ROUNDS)} / {MAX_ROUNDS}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--t-primary)", lineHeight: 1.3, margin: 0 }}>
              {node.title}
            </h2>
          </div>
          <button
            onClick={() => (stage === "summary" || srsSaved) ? handleFinish() : onClose()}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t-muted)", fontSize: "20px", padding: "4px", marginLeft: "12px", flexShrink: 0 }}
          >✕</button>
        </div>

        {/* ── QUESTION STAGE ── */}
        {stage === "question" && (
          <div>
            {/* Crisis context */}
            {node.crisisText && (
              <div style={{
                backgroundColor: "var(--p-frost)", borderRadius: "10px",
                padding: "14px 16px", marginBottom: "18px",
                borderLeft: `3px solid ${phaseColor}`,
              }}>
                <p style={{ fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {node.crisisText}
                </p>
              </div>
            )}

            {/* Question */}
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--t-primary)", marginBottom: "16px", lineHeight: 1.5 }}>
              {currentQ?.question}
            </p>

            {/* MC options */}
            {currentQ?.type === "mc" && currentQ.options && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      style={{
                        textAlign: "left", padding: "13px 16px", borderRadius: "10px",
                        border: `2px solid ${selectedOption === opt.id ? phaseColor : "var(--p-border)"}`,
                        backgroundColor: selectedOption === opt.id ? phaseColor + "15" : "var(--p-frost)",
                        color: "var(--t-primary)", cursor: "pointer", fontSize: "14px",
                        transition: "all 0.15s ease",
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
                    backgroundColor: selectedOption ? phaseColor : "var(--p-border)",
                    color: "#fff", fontWeight: 700, fontSize: "15px",
                    transition: "opacity 0.15s",
                  }}
                >
                  Submit Answer
                </button>
              </>
            )}

            {/* Free text */}
            {currentQ?.type === "free_text" && (
              <>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Trace the causal chain — be specific about mechanism and consequence..."
                  style={{
                    width: "100%", minHeight: "120px", padding: "14px", borderRadius: "10px",
                    border: "2px solid var(--p-border)", backgroundColor: "var(--p-frost)",
                    color: "var(--t-primary)", fontSize: "14px", resize: "vertical",
                    outline: "none", lineHeight: 1.6, boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = phaseColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--p-border)")}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "var(--t-muted)" }}>{textInput.length} chars</span>
                  <span style={{ fontSize: "12px", color: textInput.trim().length >= 10 ? "#16a34a" : "var(--t-muted)" }}>
                    {textInput.trim().length >= 10 ? "Ready to submit" : `${Math.max(0, 10 - textInput.trim().length)} more chars`}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={textInput.trim().length < 10}
                  style={{
                    marginTop: "8px", width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                    cursor: textInput.trim().length >= 10 ? "pointer" : "not-allowed",
                    backgroundColor: textInput.trim().length >= 10 ? phaseColor : "var(--p-border)",
                    color: "#fff", fontWeight: 700, fontSize: "15px",
                    transition: "background-color 0.15s",
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
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: `3px solid ${phaseColor}30`,
              borderTopColor: phaseColor,
              animation: "spin 0.9s linear infinite",
              margin: "0 auto 20px",
            }} />
            <p style={{ fontSize: "14px", color: "var(--t-secondary)", fontWeight: 600 }}>Analysing your response...</p>
            <p style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "6px" }}>
              Generating your next challenge
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── FEEDBACK STAGE ── */}
        {stage === "feedback" && lastEval && (
          <div>
            {/* Score badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "16px 20px", borderRadius: "12px",
              backgroundColor: scoreColor(lastEval.score) + "14",
              border: `2px solid ${scoreColor(lastEval.score)}50`,
              marginBottom: "16px",
            }}>
              <span style={{ fontSize: "28px" }}>{scoreEmoji(lastEval.score)}</span>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: scoreColor(lastEval.score), lineHeight: 1 }}>
                  {lastEval.score}<span style={{ fontSize: "13px", fontWeight: 600 }}>/100</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "2px" }}>
                  {lastEval.correct ? "Correct" : "Needs work"}
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                {lastEval.feedback}
              </p>
            </div>

            {/* Show mechanism hint on wrong answer */}
            {!lastEval.correct && node.formalMechanism && (
              <div style={{
                backgroundColor: "var(--p-frost)", borderRadius: "8px",
                padding: "12px 16px", marginBottom: "14px",
                borderLeft: "3px solid var(--p-border)",
              }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-muted)", marginBottom: "6px" }}>
                  Core Mechanism
                </p>
                <p style={{ fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {node.formalMechanism}
                </p>
              </div>
            )}

            {/* Next question preview if available */}
            {!sessionComplete && nextQ && (
              <div style={{
                backgroundColor: phaseColor + "10", borderRadius: "8px",
                padding: "10px 14px", marginBottom: "14px",
                border: `1px solid ${phaseColor}30`,
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
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>{scoreEmoji(overallAvg)}</div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: scoreColor(overallAvg), lineHeight: 1 }}>
                {overallAvg}<span style={{ fontSize: "16px", fontWeight: 600, color: "var(--t-muted)" }}>/100</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--t-secondary)", marginTop: "6px" }}>
                {overallAvg >= 75 ? "Excellent mastery — interval extended." : overallAvg >= 50 ? "Solid attempt — keep building on this." : "Needs more work — interval reset for reinforcement."}
              </p>
            </div>

            {/* Round breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {rounds.map((r) => (
                <div key={r.roundNum} style={{
                  display: "flex", alignItems: "flex-start", gap: "12px",
                  padding: "12px 14px", borderRadius: "10px",
                  backgroundColor: "var(--p-frost)",
                  border: `1px solid ${r.correct ? "#16a34a30" : "#dc262630"}`,
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    backgroundColor: scoreColor(r.score) + "20",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: scoreColor(r.score),
                  }}>
                    {r.roundNum}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", color: "var(--t-muted)", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
              onClick={handleFinish}
              style={{
                width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                cursor: "pointer",
                backgroundColor: overallAvg >= 60 ? "#16a34a" : "#dc2626",
                color: "#fff", fontWeight: 700, fontSize: "15px",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Node Card ─────────────────────────────────────────────────────────────────

function NodeCard({
  node,
  onClick,
  showDueLabel = true,
}: {
  node: NodeProgressData;
  onClick: () => void;
  showDueLabel?: boolean;
}) {
  const phase = getFlashpointPhase(node.currentInterval);
  const dueInfo = getDueLabel(node.nextDueTimestamp);
  const phaseColors = ["", "#f59e0b", "#ef4444", "#8b5cf6"];
  const phaseColor = phaseColors[phase];

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "16px 20px", borderRadius: "12px",
        border: `1px solid ${dueInfo.overdue ? "#ef444440" : "var(--p-border)"}`,
        backgroundColor: dueInfo.overdue ? "#ef444408" : "var(--p-frost)",
        cursor: "pointer", width: "100%", textAlign: "left",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = phaseColor;
        (e.currentTarget as HTMLElement).style.backgroundColor = phaseColor + "10";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = dueInfo.overdue ? "#ef444440" : "var(--p-border)";
        (e.currentTarget as HTMLElement).style.backgroundColor = dueInfo.overdue ? "#ef444408" : "var(--p-frost)";
      }}
    >
      {/* Heat badge */}
      <div style={{
        width: "48px", height: "48px", borderRadius: "10px", flexShrink: 0,
        backgroundColor: phaseColor + "20", color: phaseColor,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: "13px", gap: "2px",
      }}>
        <span style={{ fontSize: "15px", lineHeight: 1 }}>
          {(node.heatScore ?? 0) >= 70 ? "🔥" : (node.heatScore ?? 0) >= 45 ? "⚠️" : "❄️"}
        </span>
        <span style={{ fontSize: "11px" }}>{node.heatScore ?? 0}%</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "14px", fontWeight: 600, color: "var(--t-primary)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {node.title}
        </div>
        <div style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "2px" }}>
          {node.totalReviews || 0} reviews · {node.currentInterval}d interval · next {formatDate(node.nextDueTimestamp)}
        </div>
      </div>

      {/* Due label */}
      {showDueLabel && (
        <div style={{
          fontSize: "12px", fontWeight: 700,
          color: dueInfo.overdue ? "#ef4444" : "var(--t-muted)",
          flexShrink: 0,
        }}>
          {dueInfo.label}
        </div>
      )}
    </button>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

function bucketNodes(allNodes: NodeProgressData[]) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const overdue: NodeProgressData[] = [];
  const today: NodeProgressData[] = [];
  const d1_3: NodeProgressData[] = [];
  const d4_7: NodeProgressData[] = [];
  const d8_14: NodeProgressData[] = [];
  const d15_30: NodeProgressData[] = [];
  const d30plus: NodeProgressData[] = [];

  for (const n of allNodes) {
    if (!n.nextDueTimestamp) continue;
    const diff = n.nextDueTimestamp - now;
    const days = diff / DAY;
    if (diff < -DAY) overdue.push(n);
    else if (diff < 0 || days <= 1) today.push(n);
    else if (days <= 3) d1_3.push(n);
    else if (days <= 7) d4_7.push(n);
    else if (days <= 14) d8_14.push(n);
    else if (days <= 30) d15_30.push(n);
    else d30plus.push(n);
  }
  return { overdue, today, d1_3, d4_7, d8_14, d15_30, d30plus };
}

export default function DashboardPage() {
  const { user, authInitialized, initAuth } = useArceStore();
  const router = useRouter();
  const [allNodes, setAllNodes] = useState<NodeProgressData[]>([]);
  const [recentNodes, setRecentNodes] = useState<NodeProgressData[]>([]);
  const [activeReview, setActiveReview] = useState<NodeProgressData | null>(null);

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) router.push("/signin");
  }, [user, authInitialized, router]);

  const loadData = useCallback(() => {
    const all = loadAllProgress();
    setAllNodes(Object.values(all));
    setRecentNodes(getRecentNodes(10));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleResult = (_node: NodeProgressData, _success: boolean) => {
    // advanceSRS already called inside FlashpointModal on evaluation
    setActiveReview(null);
    loadData();
  };

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--p-border)", borderTopColor: "var(--snap)", animation: "spin 0.6s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalCount = allNodes.length;
  const { overdue, today, d1_3, d4_7, d8_14, d15_30, d30plus } = bucketNodes(allNodes);
  const dueTotal = overdue.length + today.length;
  const upcomingTotal = d1_3.length + d4_7.length + d8_14.length + d15_30.length + d30plus.length;

  const intervals = [
    { label: "Overdue", nodes: overdue, color: "#dc2626", emoji: "🚨", clickable: true },
    { label: "Due Today", nodes: today, color: "#ef4444", emoji: "⚡", clickable: true },
    { label: "Next 1–3 Days", nodes: d1_3, color: "#f59e0b", emoji: "🔔", clickable: true },
    { label: "Next 4–7 Days", nodes: d4_7, color: "#f59e0b", emoji: "📅", clickable: true },
    { label: "Next 8–14 Days", nodes: d8_14, color: "#3b82f6", emoji: "📆", clickable: true },
    { label: "Next 15–30 Days", nodes: d15_30, color: "#8b5cf6", emoji: "🗓️", clickable: true },
    { label: "30+ Days", nodes: d30plus, color: "#6b7280", emoji: "🌙", clickable: false },
  ].filter(b => b.nodes.length > 0);

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <Navbar />

      <main style={{ padding: "48px 24px 80px", maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px", animation: "slideUp 0.4s ease-out" }}>
          <span className="eyebrow" style={{ marginBottom: "12px", display: "inline-block" }}>FLASHPOINT TRIAGE</span>
          <h1 style={{ fontSize: "34px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}>Review Queue</h1>
          <p style={{ fontSize: "15px", color: "var(--t-secondary)" }}>
            {totalCount === 0
              ? "No concepts yet. Complete a learning session to build your review queue."
              : `${dueTotal} due now · ${upcomingTotal} upcoming · ${totalCount} total tracked`}
          </p>
        </div>

        {/* Stats grid — all intervals */}
        {totalCount > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "36px" }}>
            {[
              { label: "Overdue", value: overdue.length, color: "#dc2626" },
              { label: "Today", value: today.length, color: "#ef4444" },
              { label: "3 Days", value: d1_3.length, color: "#f59e0b" },
              { label: "7 Days", value: d4_7.length, color: "#f59e0b" },
              { label: "14 Days", value: d8_14.length, color: "#3b82f6" },
              { label: "30 Days", value: d15_30.length, color: "#8b5cf6" },
              { label: "90+ Days", value: d30plus.length, color: "#6b7280" },
              { label: "Total", value: totalCount, color: "var(--snap)" },
            ].map(s => (
              <div key={s.label} className="folio-card" style={{ padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", marginTop: "6px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* All-clear banner */}
        {totalCount > 0 && dueTotal === 0 && (
          <div className="folio-card" style={{ padding: "28px", textAlign: "center", marginBottom: "32px", border: "1px solid #16a34a40", backgroundColor: "#16a34a08" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
            <p style={{ fontWeight: 700, color: "#16a34a", marginBottom: "4px" }}>All caught up</p>
            <p style={{ fontSize: "13px", color: "var(--t-muted)" }}>
              {upcomingTotal > 0 ? `Next review in ${d1_3.length ? "1–3" : d4_7.length ? "4–7" : "8+"} days` : "No reviews scheduled."}
            </p>
          </div>
        )}

        {/* Interval sections */}
        {intervals.map(({ label, nodes, color, emoji, clickable }, si) => (
          <section key={label} style={{ marginBottom: "32px", animation: `slideUp ${0.4 + si * 0.05}s ease-out` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ fontSize: "16px" }}>{emoji}</span>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--t-primary)" }}>{label}</h2>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", backgroundColor: color + "20", color }}>
                {nodes.length}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {nodes.map(node => (
                <NodeCard
                  key={node.nodeId}
                  node={node}
                  onClick={() => { if (clickable) setActiveReview(node); }}
                  showDueLabel
                />
              ))}
            </div>
          </section>
        ))}

        {/* Recently studied (if no SRS data yet) */}
        {totalCount > 0 && intervals.length === 0 && recentNodes.length > 0 && (
          <section style={{ animation: "slideUp 0.5s ease-out" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "14px" }}>Recently Studied</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentNodes.map(node => (
                <NodeCard key={node.nodeId} node={node} onClick={() => setActiveReview(node)} showDueLabel />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="folio-card" style={{ padding: "56px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚡</div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "8px" }}>No review queue yet</h3>
            <p style={{ fontSize: "15px", color: "var(--t-secondary)", maxWidth: "400px", margin: "0 auto 28px" }}>
              Complete a learning session to start building your spaced repetition queue.
            </p>
            <a href="/learn" style={{ display: "inline-block", padding: "12px 28px", borderRadius: "10px", backgroundColor: "var(--snap)", color: "#fff", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}>
              Start Learning
            </a>
          </div>
        )}
      </main>

      {activeReview && (
        <FlashpointModal
          node={activeReview}
          onClose={() => setActiveReview(null)}
          onResult={(success) => handleResult(activeReview, success)}
        />
      )}
    </div>
  );
}
