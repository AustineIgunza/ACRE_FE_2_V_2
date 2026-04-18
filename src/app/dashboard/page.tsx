"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// ── Animation variants ────────────────────────────────────────────────────────

const spring = { type: "spring" as const, stiffness: 500, damping: 42 };
const smoothSpring = { type: "spring" as const, stiffness: 320, damping: 32 };
const gentleSpring = { type: "spring" as const, stiffness: 260, damping: 28 };

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: smoothSpring },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 420, damping: 36 } },
};

const statItem = {
  hidden: { opacity: 0, scale: 0.88, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 480, damping: 34 } },
};

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
        const fallback = node.stressTest
          ? `Stress test: ${node.stressTest}`
          : node.soWhat
          ? `Apply the insight: "${node.soWhat}". Give a concrete example.`
          : `What single variable would break the mechanism of "${node.title}"? Explain why.`;
        setNextQ({ question: fallback, type: "free_text", options: undefined });
      }

      setStage("feedback");
    } catch {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={smoothSpring}
        style={{
          backgroundColor: "var(--p-surface)",
          borderRadius: "20px",
          border: "1px solid var(--p-border)",
          maxWidth: "640px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "28px 32px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
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
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
                  const done = i < rounds.length;
                  const current = i === rounds.length && stage !== "summary";
                  const roundResult = rounds[i];
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor: done
                          ? (roundResult?.correct ? "#16a34a" : "#dc2626")
                          : current ? phaseColor : "var(--p-border)",
                        scale: current ? 1.2 : 1,
                      }}
                      transition={spring}
                      style={{ width: "8px", height: "8px", borderRadius: "50%" }}
                    />
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
          <motion.button
            onClick={() => (stage === "summary" || srsSaved) ? handleFinish() : onClose()}
            whileHover={{ scale: 1.12, backgroundColor: "var(--p-frost)" }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--t-muted)", fontSize: "18px", padding: "6px 8px",
              marginLeft: "12px", flexShrink: 0, borderRadius: "8px",
            }}
          >✕</motion.button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── QUESTION STAGE ── */}
          {stage === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={smoothSpring}
            >
              {node.crisisText && (
                <div style={{
                  backgroundColor: "var(--p-frost)", borderRadius: "12px",
                  padding: "14px 16px", marginBottom: "18px",
                  borderLeft: `3px solid ${phaseColor}`,
                }}>
                  <p style={{ fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0 }}>
                    {node.crisisText}
                  </p>
                </div>
              )}
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--t-primary)", marginBottom: "16px", lineHeight: 1.5 }}>
                {currentQ?.question}
              </p>
              {currentQ?.type === "mc" && currentQ.options && (
                <>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}
                  >
                    {currentQ.options.map((opt) => (
                      <motion.button
                        key={opt.id}
                        variants={staggerItem}
                        onClick={() => setSelectedOption(opt.id)}
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        animate={{
                          borderColor: selectedOption === opt.id ? phaseColor : "var(--p-border)",
                          backgroundColor: selectedOption === opt.id ? phaseColor + "18" : "var(--p-frost)",
                        }}
                        transition={spring}
                        style={{
                          textAlign: "left", padding: "13px 16px", borderRadius: "12px",
                          border: `2px solid ${selectedOption === opt.id ? phaseColor : "var(--p-border)"}`,
                          backgroundColor: selectedOption === opt.id ? phaseColor + "18" : "var(--p-frost)",
                          color: "var(--t-primary)", cursor: "pointer", fontSize: "14px",
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: "8px", color: phaseColor }}>{opt.id}.</span>
                        {opt.text}
                      </motion.button>
                    ))}
                  </motion.div>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    whileHover={selectedOption ? { scale: 1.02, y: -1 } : {}}
                    whileTap={selectedOption ? { scale: 0.97 } : {}}
                    transition={spring}
                    style={{
                      width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                      cursor: selectedOption ? "pointer" : "not-allowed",
                      backgroundColor: selectedOption ? phaseColor : "var(--p-border)",
                      color: "#fff", fontWeight: 700, fontSize: "15px",
                    }}
                  >
                    Submit Answer
                  </motion.button>
                </>
              )}
              {currentQ?.type === "free_text" && (
                <>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Trace the causal chain — be specific about mechanism and consequence..."
                    style={{
                      width: "100%", minHeight: "120px", padding: "14px", borderRadius: "12px",
                      border: "2px solid var(--p-border)", backgroundColor: "var(--p-frost)",
                      color: "var(--t-primary)", fontSize: "14px", resize: "vertical",
                      outline: "none", lineHeight: 1.6, boxSizing: "border-box",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = phaseColor)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--p-border)")}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "var(--t-muted)" }}>{textInput.length} chars</span>
                    <motion.span
                      animate={{ color: textInput.trim().length >= 10 ? "#16a34a" : "var(--t-muted)" }}
                      transition={{ duration: 0.2 }}
                      style={{ fontSize: "12px" }}
                    >
                      {textInput.trim().length >= 10 ? "Ready to submit" : `${Math.max(0, 10 - textInput.trim().length)} more chars`}
                    </motion.span>
                  </div>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={textInput.trim().length < 10}
                    whileHover={textInput.trim().length >= 10 ? { scale: 1.02, y: -1 } : {}}
                    whileTap={textInput.trim().length >= 10 ? { scale: 0.97 } : {}}
                    animate={{ backgroundColor: textInput.trim().length >= 10 ? phaseColor : "var(--p-border)" }}
                    transition={spring}
                    style={{
                      marginTop: "8px", width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                      cursor: textInput.trim().length >= 10 ? "pointer" : "not-allowed",
                      color: "#fff", fontWeight: 700, fontSize: "15px",
                    }}
                  >
                    Submit Answer
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {/* ── EVALUATING STAGE ── */}
          {stage === "evaluating" && (
            <motion.div
              key="evaluating"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={smoothSpring}
              style={{ textAlign: "center", padding: "40px 0" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  border: `3px solid ${phaseColor}28`,
                  borderTopColor: phaseColor,
                  margin: "0 auto 20px",
                }}
              />
              <p style={{ fontSize: "14px", color: "var(--t-secondary)", fontWeight: 600 }}>Analysing your response...</p>
              <p style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "6px" }}>Generating your next challenge</p>
            </motion.div>
          )}

          {/* ── FEEDBACK STAGE ── */}
          {stage === "feedback" && lastEval && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={smoothSpring}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.05 }}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 20px", borderRadius: "14px",
                  backgroundColor: scoreColor(lastEval.score) + "14",
                  border: `2px solid ${scoreColor(lastEval.score)}50`,
                  marginBottom: "16px",
                }}
              >
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
              </motion.div>

              {!lastEval.correct && node.formalMechanism && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smoothSpring, delay: 0.1 }}
                  style={{
                    backgroundColor: "var(--p-frost)", borderRadius: "10px",
                    padding: "12px 16px", marginBottom: "14px",
                    borderLeft: "3px solid var(--p-border)",
                  }}
                >
                  <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--t-muted)", marginBottom: "6px" }}>
                    Core Mechanism
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--t-secondary)", lineHeight: 1.6, margin: 0 }}>
                    {node.formalMechanism}
                  </p>
                </motion.div>
              )}

              {!sessionComplete && nextQ && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smoothSpring, delay: 0.14 }}
                  style={{
                    backgroundColor: phaseColor + "10", borderRadius: "10px",
                    padding: "10px 14px", marginBottom: "14px",
                    border: `1px solid ${phaseColor}30`,
                  }}
                >
                  <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: phaseColor, marginBottom: "4px" }}>
                    Next challenge
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--t-secondary)", margin: 0, lineHeight: 1.5 }}>
                    {nextQ.question.length > 120 ? nextQ.question.slice(0, 120) + "..." : nextQ.question}
                  </p>
                </motion.div>
              )}

              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                style={{
                  width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                  cursor: "pointer",
                  backgroundColor: sessionComplete || !nextQ ? "#374151" : phaseColor,
                  color: "#fff", fontWeight: 700, fontSize: "15px",
                }}
              >
                {sessionComplete || !nextQ ? "See Results →" : "Next Challenge →"}
              </motion.button>
            </motion.div>
          )}

          {/* ── SUMMARY STAGE ── */}
          {stage === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={smoothSpring}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.05 }}
                style={{ textAlign: "center", marginBottom: "24px" }}
              >
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>{scoreEmoji(overallAvg)}</div>
                <div style={{ fontSize: "32px", fontWeight: 700, color: scoreColor(overallAvg), lineHeight: 1 }}>
                  {overallAvg}<span style={{ fontSize: "16px", fontWeight: 600, color: "var(--t-muted)" }}>/100</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--t-secondary)", marginTop: "6px" }}>
                  {overallAvg >= 75 ? "Excellent mastery — interval extended." : overallAvg >= 50 ? "Solid attempt — keep building on this." : "Needs more work — interval reset for reinforcement."}
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}
              >
                {rounds.map((r) => (
                  <motion.div
                    key={r.roundNum}
                    variants={staggerItem}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      padding: "12px 14px", borderRadius: "12px",
                      backgroundColor: "var(--p-frost)",
                      border: `1px solid ${r.correct ? "#16a34a30" : "#dc262630"}`,
                    }}
                  >
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
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                onClick={handleFinish}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                style={{
                  width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                  cursor: "pointer",
                  backgroundColor: overallAvg >= 60 ? "#16a34a" : "#dc2626",
                  color: "#fff", fontWeight: 700, fontSize: "15px",
                }}
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Node Detail Panel ─────────────────────────────────────────────────────────

function ContentSection({
  label, text, accent, index = 0,
}: {
  label: string; text: string; accent?: string; index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...smoothSpring, delay: 0.08 + index * 0.05 }}
      style={{ marginBottom: "20px" }}
    >
      <div style={{
        fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "1.2px", color: accent || "var(--t-muted)",
        marginBottom: "7px",
      }}>
        {label}
      </div>
      <p style={{
        fontSize: "14px", color: "var(--t-secondary)", lineHeight: 1.7,
        margin: 0, borderLeft: `2px solid ${accent || "var(--p-border)"}`,
        paddingLeft: "12px",
      }}>
        {text}
      </p>
    </motion.div>
  );
}

function NodeDetailPanel({
  node,
  onClose,
  onStartReview,
}: {
  node: NodeProgressData;
  onClose: () => void;
  onStartReview: () => void;
}) {
  const phase = getFlashpointPhase(node.currentInterval);
  const dueInfo = getDueLabel(node.nextDueTimestamp);
  const phaseColors = ["", "#f59e0b", "#ef4444", "#8b5cf6"];
  const phaseColor = phaseColors[phase];
  const phaseLabels = ["", "Phase 1 · Foundation", "Phase 2 · Application", "Phase 3 · Mastery"];
  const thermalColors: Record<string, string> = {
    ignition: "#ef4444",
    warning: "#f59e0b",
    frost: "#3b82f6",
    neutral: "#6b7280",
  };
  const thermalColor = thermalColors[node.thermalState] || "#6b7280";

  // Build content sections
  const sections: Array<{ label: string; text: string; accent: string }> = [];
  if (node.formalMechanism) sections.push({ label: "Core Mechanism", text: node.formalMechanism, accent: phaseColor });
  if (node.crisisText) sections.push({ label: "Crisis Scenario", text: node.crisisText, accent: "#ef4444" });
  if (node.soWhat) sections.push({ label: "The Leverage Insight", text: node.soWhat, accent: "#16a34a" });
  if (node.stressTest) sections.push({ label: "Stress Test", text: node.stressTest, accent: "#8b5cf6" });
  if (node.dominoQuestion) sections.push({ label: "Key Question", text: node.dominoQuestion, accent: "#3b82f6" });

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 900,
          backgroundColor: "rgba(0,0,0,0.48)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%", opacity: 0.6 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={gentleSpring}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(520px, 100vw)", zIndex: 910,
          backgroundColor: "var(--p-surface)",
          borderLeft: "1px solid var(--p-border)",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.3)",
        }}
      >
        {/* Sticky header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--p-border)",
          position: "sticky", top: 0,
          backgroundColor: "var(--p-surface)",
          zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.06 }}
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}
              >
                <span style={{
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1px", color: phaseColor,
                  backgroundColor: phaseColor + "20", borderRadius: "4px", padding: "3px 8px",
                }}>
                  {phaseLabels[phase]}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "1px", color: thermalColor,
                  backgroundColor: thermalColor + "18", borderRadius: "4px", padding: "3px 8px",
                }}>
                  {node.thermalState}
                </span>
                {dueInfo.overdue && (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{
                      fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "1px", color: "#ef4444",
                      backgroundColor: "#ef444418", borderRadius: "4px", padding: "3px 8px",
                    }}
                  >
                    {dueInfo.label}
                  </motion.span>
                )}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.08 }}
                style={{ fontSize: "20px", fontWeight: 700, color: "var(--t-primary)", lineHeight: 1.3, margin: 0 }}
              >
                {node.title}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.3 }}
                style={{ fontSize: "12px", color: "var(--t-muted)", marginTop: "6px" }}
              >
                {node.heatScore ?? 0}% heat · {node.totalReviews || 0} reviews · {node.currentInterval}d interval · next {formatDate(node.nextDueTimestamp)}
              </motion.div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.12, backgroundColor: "var(--p-frost)" }}
              whileTap={{ scale: 0.9 }}
              transition={spring}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--t-muted)", fontSize: "18px", padding: "6px 8px",
                marginLeft: "12px", flexShrink: 0, borderRadius: "8px",
              }}
            >✕</motion.button>
          </div>

          <motion.button
            onClick={onStartReview}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -1, boxShadow: `0 8px 24px ${phaseColor}50` }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: "14px", width: "100%", padding: "12px",
              borderRadius: "12px", border: "none", cursor: "pointer",
              backgroundColor: phaseColor, color: "#fff",
              fontWeight: 700, fontSize: "15px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: `0 4px 16px ${phaseColor}40`,
            }}
          >
            <span>Start Review</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ opacity: 0.85, fontSize: "13px" }}
            >
              →
            </motion.span>
          </motion.button>
        </div>

        {/* Content sections */}
        <div style={{ padding: "24px", flex: 1 }}>
          {sections.map((s, i) => (
            <ContentSection key={s.label} label={s.label} text={s.text} accent={s.accent} index={i} />
          ))}

          {/* Formula */}
          {node.latexFormula && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...smoothSpring, delay: 0.08 + sections.length * 0.05 }}
              style={{ marginBottom: "20px" }}
            >
              <div style={{
                fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.2px", color: "var(--t-muted)", marginBottom: "7px",
              }}>
                Formula
              </div>
              <div style={{
                fontFamily: "monospace", fontSize: "13px",
                color: "var(--t-secondary)",
                backgroundColor: "var(--p-frost)",
                borderRadius: "10px", padding: "12px 14px",
                border: "1px solid var(--p-border)",
                overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
              }}>
                {node.latexFormula}
              </div>
            </motion.div>
          )}

          {/* Multiple choice preview */}
          {node.multiple_choice_question && node.multiple_choice_options && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...smoothSpring, delay: 0.1 + sections.length * 0.05 }}
              style={{ marginBottom: "20px" }}
            >
              <div style={{
                fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "1.2px", color: "var(--t-muted)", marginBottom: "7px",
              }}>
                Multiple Choice
              </div>
              <p style={{
                fontSize: "14px", color: "var(--t-secondary)", lineHeight: 1.6, margin: "0 0 10px",
                borderLeft: "2px solid #f59e0b", paddingLeft: "12px",
              }}>
                {node.multiple_choice_question}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {node.multiple_choice_options.map((opt, oi) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...smoothSpring, delay: 0.15 + oi * 0.04 }}
                    style={{
                      padding: "9px 12px", borderRadius: "9px",
                      backgroundColor: opt.is_correct ? "#16a34a12" : "var(--p-frost)",
                      border: `1px solid ${opt.is_correct ? "#16a34a40" : "var(--p-border)"}`,
                      fontSize: "13px", color: "var(--t-secondary)",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: opt.is_correct ? "#16a34a" : "var(--t-muted)", marginRight: "8px" }}>
                      {opt.id}.
                    </span>
                    {opt.text}
                    {opt.is_correct && (
                      <span style={{ marginLeft: "8px", fontSize: "11px", color: "#16a34a", fontWeight: 700 }}>✓ correct</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom review CTA */}
          <motion.button
            onClick={onStartReview}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.22 }}
            whileHover={{ scale: 1.02, y: -1, boxShadow: `0 8px 24px ${phaseColor}45` }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: "12px", width: "100%", padding: "14px",
              borderRadius: "12px", border: "none", cursor: "pointer",
              backgroundColor: phaseColor, color: "#fff",
              fontWeight: 700, fontSize: "15px",
              boxShadow: `0 4px 16px ${phaseColor}35`,
            }}
          >
            Start Review Session
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Node Card ─────────────────────────────────────────────────────────────────

function NodeCard({
  node,
  onClick,
  showDueLabel = true,
  isDue = true,
}: {
  node: NodeProgressData;
  onClick: () => void;
  showDueLabel?: boolean;
  isDue?: boolean;
}) {
  const phase = getFlashpointPhase(node.currentInterval);
  const dueInfo = getDueLabel(node.nextDueTimestamp);
  const phaseColors = ["", "#f59e0b", "#ef4444", "#8b5cf6"];
  const phaseColor = phaseColors[phase];

  return (
    <motion.button
      onClick={onClick}
      variants={staggerItem}
      whileHover={{
        scale: 1.012,
        y: -2,
        borderColor: phaseColor,
        backgroundColor: phaseColor + "0e",
        boxShadow: `0 6px 24px ${phaseColor}22`,
      }}
      whileTap={{ scale: 0.987, y: 0 }}
      transition={spring}
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "16px 20px", borderRadius: "14px",
        border: `1px solid ${dueInfo.overdue ? "#ef444440" : "var(--p-border)"}`,
        backgroundColor: dueInfo.overdue ? "#ef444408" : "var(--p-frost)",
        cursor: "pointer", width: "100%", textAlign: "left",
      }}
    >
      {/* Heat badge */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={spring}
        style={{
          width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
          backgroundColor: phaseColor + "20", color: phaseColor,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "13px", gap: "2px",
        }}
      >
        <span style={{ fontSize: "15px", lineHeight: 1 }}>
          {(node.heatScore ?? 0) >= 70 ? "🔥" : (node.heatScore ?? 0) >= 45 ? "⚠️" : "❄️"}
        </span>
        <span style={{ fontSize: "11px" }}>{node.heatScore ?? 0}%</span>
      </motion.div>

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

      {/* Due label + chevron */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
        {showDueLabel && (
          <div style={{
            fontSize: "12px", fontWeight: 700,
            color: dueInfo.overdue ? "#ef4444" : "var(--t-muted)",
          }}>
            {dueInfo.label}
          </div>
        )}
        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontSize: "11px", color: isDue ? phaseColor : "var(--t-muted)",
            fontWeight: 600, display: "flex", alignItems: "center", gap: "3px",
            opacity: 0.75,
          }}
        >
          {isDue ? "Review" : "View"} ›
        </motion.div>
      </div>
    </motion.button>
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
  const [selectedNode, setSelectedNode] = useState<NodeProgressData | null>(null);
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
    setActiveReview(null);
    setSelectedNode(null);
    loadData();
  };

  if (!authInitialized || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "36px", height: "36px", borderRadius: "50%",
            border: "3px solid var(--p-border)", borderTopColor: "var(--snap)",
          }}
        />
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

  const statItems = [
    { label: "Overdue", value: overdue.length, color: "#dc2626" },
    { label: "Today", value: today.length, color: "#ef4444" },
    { label: "3 Days", value: d1_3.length, color: "#f59e0b" },
    { label: "7 Days", value: d4_7.length, color: "#f59e0b" },
    { label: "14 Days", value: d8_14.length, color: "#3b82f6" },
    { label: "30 Days", value: d15_30.length, color: "#8b5cf6" },
    { label: "90+ Days", value: d30plus.length, color: "#6b7280" },
    { label: "Total", value: totalCount, color: "var(--snap)" },
  ];

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh", color: "var(--t-mid)" }}>
      <Navbar />

      <main style={{ padding: "48px 24px 80px", maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{ marginBottom: "32px" }}
        >
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.05 }}
            className="eyebrow"
            style={{ marginBottom: "12px", display: "inline-block" }}
          >
            FLASHPOINT TRIAGE
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.1 }}
            style={{ fontSize: "34px", letterSpacing: "-1px", color: "var(--t-primary)", marginBottom: "8px" }}
          >
            Review Queue
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            style={{ fontSize: "15px", color: "var(--t-secondary)" }}
          >
            {totalCount === 0
              ? "No concepts yet. Complete a learning session to build your review queue."
              : `${dueTotal} due now · ${upcomingTotal} upcoming · ${totalCount} total tracked`}
          </motion.p>
        </motion.div>

        {/* Stats grid */}
        {totalCount > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "36px" }}
          >
            {statItems.map((s) => (
              <motion.div
                key={s.label}
                variants={statItem}
                whileHover={{ scale: 1.04, y: -2, boxShadow: `0 8px 24px ${s.color}20` }}
                transition={spring}
                className="folio-card"
                style={{ padding: "16px", textAlign: "center", cursor: "default" }}
              >
                <div style={{ fontSize: "22px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, color: "var(--t-muted)", letterSpacing: "1px", marginTop: "6px" }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* All-clear banner */}
        <AnimatePresence>
          {totalCount > 0 && dueTotal === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={smoothSpring}
              className="folio-card"
              style={{ padding: "28px", textAlign: "center", marginBottom: "32px", border: "1px solid #16a34a40", backgroundColor: "#16a34a08" }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.1 }}
                style={{ fontSize: "28px", marginBottom: "8px" }}
              >
                ✓
              </motion.div>
              <p style={{ fontWeight: 700, color: "#16a34a", marginBottom: "4px" }}>All caught up</p>
              <p style={{ fontSize: "13px", color: "var(--t-muted)" }}>
                {upcomingTotal > 0 ? `Next review in ${d1_3.length ? "1–3" : d4_7.length ? "4–7" : "8+"} days` : "No reviews scheduled."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interval sections */}
        {intervals.map(({ label, nodes, color, emoji, clickable }, si) => (
          <motion.section
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.12 + si * 0.06 }}
            style={{ marginBottom: "32px" }}
          >
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...smoothSpring, delay: 0.16 + si * 0.06 }}
              style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}
            >
              <span style={{ fontSize: "16px" }}>{emoji}</span>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--t-primary)" }}>{label}</h2>
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.2 + si * 0.06 }}
                style={{
                  fontSize: "11px", fontWeight: 700, padding: "2px 8px",
                  borderRadius: "12px", backgroundColor: color + "20", color,
                }}
              >
                {nodes.length}
              </motion.span>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {nodes.map(node => (
                <NodeCard
                  key={node.nodeId}
                  node={node}
                  onClick={() => setSelectedNode(node)}
                  showDueLabel
                  isDue={clickable}
                />
              ))}
            </motion.div>
          </motion.section>
        ))}

        {/* Recently studied */}
        {totalCount > 0 && intervals.length === 0 && recentNodes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.2 }}
          >
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "14px" }}>Recently Studied</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {recentNodes.map(node => (
                <NodeCard key={node.nodeId} node={node} onClick={() => setSelectedNode(node)} showDueLabel isDue />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.15 }}
            className="folio-card"
            style={{ padding: "56px 32px", textAlign: "center" }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "48px", marginBottom: "16px" }}
            >
              ⚡
            </motion.div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--t-primary)", marginBottom: "8px" }}>No review queue yet</h3>
            <p style={{ fontSize: "15px", color: "var(--t-secondary)", maxWidth: "400px", margin: "0 auto 28px" }}>
              Complete a learning session to start building your spaced repetition queue.
            </p>
            <motion.a
              href="/learn"
              whileHover={{ scale: 1.04, y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              style={{
                display: "inline-block", padding: "12px 28px", borderRadius: "12px",
                backgroundColor: "var(--snap)", color: "#fff",
                fontWeight: 700, fontSize: "15px", textDecoration: "none",
              }}
            >
              Start Learning
            </motion.a>
          </motion.div>
        )}
      </main>

      {/* Detail panel + review modal with AnimatePresence for smooth entry/exit */}
      <AnimatePresence mode="wait">
        {selectedNode && !activeReview && (
          <NodeDetailPanel
            key="detail"
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onStartReview={() => setActiveReview(selectedNode)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeReview && (
          <FlashpointModal
            key="review"
            node={activeReview}
            onClose={() => setActiveReview(null)}
            onResult={(success) => handleResult(activeReview, success)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
