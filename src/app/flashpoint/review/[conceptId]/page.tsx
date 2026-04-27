"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import {
  loadAllProgress,
  advanceSRS,
  getFlashpointPhase,
  NodeProgressData,
} from "@/utils/progressStorage";

type Stage = "loading" | "question" | "evaluating" | "feedback" | "complete";

interface Round {
  question: string;
  type: "mc" | "free_text";
  options?: Array<{ id: string; text: string; is_correct?: boolean }>;
  userAnswer: string;
  score: number;
  correct: boolean;
  feedback: string;
}

interface ActiveQuestion {
  question: string;
  type: "mc" | "free_text";
  options?: Array<{ id: string; text: string; is_correct?: boolean }>;
}

const smooth = { type: "spring" as const, stiffness: 320, damping: 32 };
const snappy = { type: "spring" as const, stiffness: 480, damping: 36 };
const MAX_ROUNDS = 3;

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "IGNITED" : score >= 45 ? "WARNING" : "FROST";
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...snappy, delay: 0.1 }}
      style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", width: "150px", height: "150px", borderRadius: "50%",
        border: `3px solid ${color}40`, backgroundColor: `${color}0d`,
        boxShadow: `0 0 40px ${color}28, inset 0 0 20px ${color}10`,
        margin: "0 auto",
      }}
    >
      <div style={{ fontSize: "42px", fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: "10px", letterSpacing: "2px", color, fontWeight: 700, textTransform: "uppercase", marginTop: "4px" }}>{label}</div>
    </motion.div>
  );
}

export default function FlashpointReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authInitialized, initAuth } = useArceStore();
  const conceptId = params.conceptId as string;

  const [node, setNode] = useState<NodeProgressData | null>(null);
  const [phase, setPhase] = useState(1);
  const [phaseColor, setPhaseColor] = useState("#f59e0b");
  const [stage, setStage] = useState<Stage>("loading");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentQ, setCurrentQ] = useState<ActiveQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [lastFeedback, setLastFeedback] = useState<{ score: number; correct: boolean; feedback: string } | null>(null);
  const [nextQ, setNextQ] = useState<ActiveQuestion | null>(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [srsSaved, setSrsSaved] = useState(false);

  useEffect(() => { initAuth(); }, [initAuth]);
  useEffect(() => { if (authInitialized && !user) router.push("/signin"); }, [authInitialized, user, router]);

  useEffect(() => {
    if (!user) return;
    const all = loadAllProgress();
    const found = Object.values(all).find(
      n => n.nodeId === conceptId || n.nodeId === decodeURIComponent(conceptId)
    );
    if (!found) { router.push("/dashboard"); return; }

    const p = getFlashpointPhase(found.currentInterval || 1);
    const colors = ["", "#f59e0b", "#ef4444", "#8b5cf6"];
    setNode(found);
    setPhase(p);
    setPhaseColor(colors[p] || "#f59e0b");

    fetch("/api/flashpoint/adaptive-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "generate",
        nodeContent: {
          title: found.title,
          formalMechanism: found.formalMechanism,
          crisisText: found.crisisText,
          dominoQuestion: found.dominoQuestion,
          soWhat: found.soWhat,
          stressTest: found.stressTest,
          latexFormula: found.latexFormula,
        },
        phase: p,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.question?.question) {
          setCurrentQ({
            question: data.question.question,
            type: data.question.type || "free_text",
            options: data.question.options?.length ? data.question.options : undefined,
          });
        } else {
          setCurrentQ({
            question: found.dominoQuestion || "Trace the causal chain from this concept. What triggers first and what follows?",
            type: "free_text",
          });
        }
        setStage("question");
      })
      .catch(() => {
        setCurrentQ({
          question: found.dominoQuestion || "Trace the causal chain from this concept. What triggers first and what follows?",
          type: "free_text",
        });
        setStage("question");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, conceptId]);

  const handleSubmit = async () => {
    if (!currentQ || !node) return;
    let answer = "";
    let mcCorrect: boolean | null = null;

    if (currentQ.type === "mc") {
      if (!selectedOption) return;
      const correctOpt = currentQ.options?.find(o => o.is_correct);
      mcCorrect = selectedOption === correctOpt?.id;
      answer = currentQ.options?.find(o => o.id === selectedOption)?.text || selectedOption;
    } else {
      if (textInput.trim().length < 10) return;
      answer = textInput;
    }

    setStage("evaluating");
    const roundNum = rounds.length + 1;
    const sessionShouldEnd = roundNum >= MAX_ROUNDS;

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
          roundNumber: roundNum,
          currentQuestion: currentQ.question,
          userAnswer: answer,
          questionType: currentQ.type,
          mcCorrect,
          previousRounds: rounds.map(r => ({
            question: r.question, userAnswer: r.userAnswer, score: r.score, correct: r.correct,
          })),
        }),
      });

      const data = await res.json();
      const ev = data.evaluation || {
        score: mcCorrect === true ? 85 : mcCorrect === false ? 20 : 50,
        correct: mcCorrect ?? false,
        feedback: "Response recorded.",
      };

      const newRound: Round = {
        question: currentQ.question, type: currentQ.type, options: currentQ.options,
        userAnswer: answer, score: ev.score, correct: ev.correct, feedback: ev.feedback,
      };
      const updatedRounds = [...rounds, newRound];
      setRounds(updatedRounds);
      setLastFeedback({ score: ev.score, correct: ev.correct, feedback: ev.feedback });

      if (data.sessionComplete || sessionShouldEnd) {
        const avg = Math.round(updatedRounds.reduce((s, r) => s + r.score, 0) / updatedRounds.length);
        setOverallScore(avg);
        if (!srsSaved) { advanceSRS(node.nodeId, avg >= 60); setSrsSaved(true); }
        setSessionDone(true);
        setNextQ(null);
      } else if (data.nextQuestion?.question) {
        setNextQ({
          question: data.nextQuestion.question,
          type: data.nextQuestion.type || "free_text",
          options: data.nextQuestion.options?.length ? data.nextQuestion.options : undefined,
        });
      } else {
        setNextQ({
          question: node.stressTest
            ? `Stress test: ${node.stressTest}`
            : `What single variable would break the chain in "${node.title}"? Explain why.`,
          type: "free_text",
        });
      }
      setStage("feedback");
    } catch {
      const fallbackScore = mcCorrect === true ? 85 : mcCorrect === false ? 20 : 50;
      const newRound: Round = {
        question: currentQ.question, type: currentQ.type, options: currentQ.options,
        userAnswer: answer, score: fallbackScore, correct: mcCorrect ?? false,
        feedback: mcCorrect === true ? "Correct — the mechanism is clear." : "Review the core mechanism and retry.",
      };
      const updatedRounds = [...rounds, newRound];
      setRounds(updatedRounds);
      setLastFeedback({ score: fallbackScore, correct: newRound.correct, feedback: newRound.feedback });
      const avg = Math.round(updatedRounds.reduce((s, r) => s + r.score, 0) / updatedRounds.length);
      setOverallScore(avg);
      if (!srsSaved) { advanceSRS(node!.nodeId, avg >= 60); setSrsSaved(true); }
      setSessionDone(true);
      setStage("feedback");
    }
  };

  const handleContinue = () => {
    if (sessionDone || !nextQ) {
      if (!srsSaved && node) {
        const avg = rounds.length ? Math.round(rounds.reduce((s, r) => s + r.score, 0) / rounds.length) : 0;
        advanceSRS(node.nodeId, avg >= 60);
        setSrsSaved(true);
        setOverallScore(avg);
      }
      setStage("complete");
      return;
    }
    setCurrentQ(nextQ);
    setSelectedOption(null);
    setTextInput("");
    setNextQ(null);
    setLastFeedback(null);
    setStage("question");
  };

  const phaseLabel = phase === 1 ? "Phase 1 · Foundation" : phase === 2 ? "Phase 2 · Application" : "Phase 3 · Mastery";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0c", color: "#f0f2ec", position: "relative" }}>

      {/* Animated background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <style>{`
          @keyframes rv-orb1{0%,100%{transform:translate(0,0)scale(1)}40%{transform:translate(55px,-42px)scale(1.08)}70%{transform:translate(-30px,60px)scale(0.94)}}
          @keyframes rv-orb2{0%,100%{transform:translate(0,0)scale(1)}35%{transform:translate(-62px,32px)scale(1.06)}65%{transform:translate(42px,-52px)scale(0.96)}}
          @keyframes rv-dot{0%,100%{opacity:.1;transform:translateY(0)scale(1)}50%{opacity:.25;transform:translateY(-18px)scale(1.2)}}
        `}</style>
        <div style={{ position: "absolute", top: "5%", left: "10%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${phaseColor}09 0%, transparent 70%)`, animation: "rv-orb1 26s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,92,53,0.05) 0%, transparent 70%)", animation: "rv-orb2 32s ease-in-out infinite" }} />
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ position: "absolute", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: phaseColor, opacity: 0.15, left: `${18 + i * 22}%`, top: `${28 + (i % 2) * 36}%`, animation: `rv-dot ${5 + i}s ease-in-out infinite`, animationDelay: `${i * 0.7}s` }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Back nav */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/dashboard")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "36px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}
        >
          ← Dashboard
        </motion.button>

        {/* Node header */}
        {node && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: phaseColor, backgroundColor: phaseColor + "20", borderRadius: "6px", padding: "3px 10px" }}>
                {phaseLabel}
              </span>
              {/* Round dots */}
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
                  const done = i < rounds.length;
                  const cur = i === rounds.length && !["complete", "loading"].includes(stage);
                  const r = rounds[i];
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor: done
                          ? (r?.correct ? "#22c55e" : "#ef4444")
                          : cur ? phaseColor : "rgba(255,255,255,0.15)",
                        scale: cur ? 1.35 : 1,
                      }}
                      transition={snappy}
                      style={{ width: "8px", height: "8px", borderRadius: "50%" }}
                    />
                  );
                })}
              </div>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                {stage !== "complete" ? `Round ${Math.min(rounds.length + 1, MAX_ROUNDS)} / ${MAX_ROUNDS}` : "Complete"}
              </span>
            </div>
            <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#fff", marginBottom: "4px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              {node.title}
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
              {node.heatScore ?? 0}% heat · {node.totalReviews || 0} reviews · {node.currentInterval}d interval
            </p>
          </motion.div>
        )}

        {/* Crisis context */}
        {node?.crisisText && stage !== "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px", borderLeft: `3px solid ${phaseColor}` }}
          >
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: phaseColor, marginBottom: "8px" }}>
              Scenario Context
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0 }}>
              {node.crisisText}
            </p>
          </motion.div>
        )}

        {/* Main content */}
        <AnimatePresence mode="wait">

          {/* ── LOADING ── */}
          {stage === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "80px 0" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: "46px", height: "46px", borderRadius: "50%", border: `3px solid ${phaseColor}30`, borderTopColor: phaseColor, margin: "0 auto 24px" }}
              />
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>Generating your review...</p>
            </motion.div>
          )}

          {/* ── QUESTION ── */}
          {stage === "question" && currentQ && (
            <motion.div key="question" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={smooth}>
              {/* Question card */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.09)", padding: "28px", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: phaseColor, marginBottom: "14px" }}>
                  {currentQ.type === "mc" ? "Multiple Choice" : "Open Response"} · Round {rounds.length + 1}
                </div>
                <p style={{ fontSize: "17px", fontWeight: 600, color: "#f0f2ec", lineHeight: 1.65, margin: 0 }}>
                  {currentQ.question}
                </p>
              </div>

              {/* MC options */}
              {currentQ.type === "mc" && currentQ.options && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {currentQ.options.map(opt => {
                    const sel = selectedOption === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.id)}
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        animate={{
                          borderColor: sel ? phaseColor : "rgba(255,255,255,0.1)",
                          backgroundColor: sel ? phaseColor + "22" : "rgba(255,255,255,0.05)",
                        }}
                        transition={snappy}
                        style={{
                          textAlign: "left", padding: "15px 18px", borderRadius: "12px",
                          border: `2px solid ${sel ? phaseColor : "rgba(255,255,255,0.1)"}`,
                          backgroundColor: sel ? phaseColor + "22" : "rgba(255,255,255,0.05)",
                          color: "#f0f2ec", cursor: "pointer", fontSize: "15px", lineHeight: 1.5,
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: "10px", color: phaseColor }}>{opt.id}.</span>
                        {opt.text}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Free text */}
              {currentQ.type === "free_text" && (
                <div style={{ marginBottom: "20px" }}>
                  <textarea
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                    placeholder="Trace the causal chain — be specific about mechanism and consequence..."
                    style={{
                      width: "100%", minHeight: "150px", padding: "16px", borderRadius: "12px",
                      border: "2px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)",
                      color: "#f0f2ec", fontSize: "15px", resize: "vertical", outline: "none",
                      lineHeight: 1.65, boxSizing: "border-box", fontFamily: "inherit",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = phaseColor)}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
                      {textInput.length} chars · Ctrl+Enter to submit
                    </span>
                    <span style={{ fontSize: "12px", color: textInput.trim().length >= 10 ? "#22c55e" : "rgba(255,255,255,0.2)", fontWeight: 600 }}>
                      {textInput.trim().length >= 10 ? "Ready ✓" : `${10 - textInput.trim().length} more chars`}
                    </span>
                  </div>
                </div>
              )}

              <motion.button
                onClick={handleSubmit}
                disabled={currentQ.type === "mc" ? !selectedOption : textInput.trim().length < 10}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%", padding: "15px", borderRadius: "12px", border: "none",
                  cursor: "pointer", backgroundColor: phaseColor, color: "#fff",
                  fontWeight: 700, fontSize: "15px", letterSpacing: "0.3px",
                  opacity: (currentQ.type === "mc" ? !selectedOption : textInput.trim().length < 10) ? 0.35 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                Submit Answer →
              </motion.button>
            </motion.div>
          )}

          {/* ── EVALUATING ── */}
          {stage === "evaluating" && (
            <motion.div key="evaluating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "80px 0" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: "46px", height: "46px", borderRadius: "50%", border: `3px solid ${phaseColor}30`, borderTopColor: phaseColor, margin: "0 auto 24px" }}
              />
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
                Analysing response...
              </p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", marginTop: "8px" }}>
                Preparing your next challenge
              </p>
            </motion.div>
          )}

          {/* ── FEEDBACK ── */}
          {stage === "feedback" && lastFeedback && (
            <motion.div key="feedback" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={smooth}>
              {/* Score banner */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...snappy, delay: 0.04 }}
                style={{
                  display: "flex", alignItems: "center", gap: "18px",
                  padding: "18px 24px", borderRadius: "14px", marginBottom: "20px",
                  backgroundColor: lastFeedback.score >= 75 ? "rgba(34,197,94,0.1)" : lastFeedback.score >= 45 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                  border: `2px solid ${lastFeedback.score >= 75 ? "#22c55e" : lastFeedback.score >= 45 ? "#f59e0b" : "#ef4444"}35`,
                }}
              >
                <div style={{ textAlign: "center", minWidth: "68px", flexShrink: 0 }}>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: lastFeedback.score >= 75 ? "#22c55e" : lastFeedback.score >= 45 ? "#f59e0b" : "#ef4444", lineHeight: 1 }}>
                    {lastFeedback.score}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>/100</div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>
                    {lastFeedback.feedback}
                  </p>
                </div>
              </motion.div>

              {/* Core mechanism hint on wrong answer */}
              {!lastFeedback.correct && node?.formalMechanism && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smooth, delay: 0.1 }}
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", borderLeft: "3px solid rgba(255,255,255,0.12)" }}
                >
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>
                    Core Mechanism
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                    {node.formalMechanism}
                  </p>
                </motion.div>
              )}

              {/* Next challenge preview */}
              {!sessionDone && nextQ && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...smooth, delay: 0.15 }}
                  style={{ backgroundColor: phaseColor + "10", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", border: `1px solid ${phaseColor}25` }}
                >
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: phaseColor, marginBottom: "5px" }}>
                    Next Challenge
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                    {nextQ.question.length > 130 ? nextQ.question.slice(0, 130) + "..." : nextQ.question}
                  </p>
                </motion.div>
              )}

              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%", padding: "15px", borderRadius: "12px", border: "none",
                  cursor: "pointer", fontWeight: 700, fontSize: "15px", color: "#fff",
                  backgroundColor: sessionDone || !nextQ ? "rgba(255,255,255,0.1)" : phaseColor,
                }}
              >
                {sessionDone || !nextQ ? "See Results →" : "Next Challenge →"}
              </motion.button>
            </motion.div>
          )}

          {/* ── COMPLETE ── */}
          {stage === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={smooth}
              style={{ textAlign: "center" }}
            >
              <ScoreRing score={overallScore} />

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "20px 0 8px" }}>
                  {overallScore >= 75 ? "Excellent Recall" : overallScore >= 50 ? "Good Progress" : "Needs Reinforcement"}
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "32px", maxWidth: "440px", margin: "0 auto 32px" }}>
                  {overallScore >= 75 ? "Review interval extended — your mastery is growing." : overallScore >= 50 ? "Solid attempt — the next review will push you further." : "Interval shortened for quicker reinforcement — you'll see this soon."}
                </p>
              </motion.div>

              {/* Round breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", textAlign: "left" }}>
                {rounds.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    style={{
                      display: "flex", gap: "14px", padding: "14px 18px", borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: `1px solid ${r.correct ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)"}`,
                    }}
                  >
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                      backgroundColor: r.correct ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: r.correct ? "#22c55e" : "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "14px",
                    }}>
                      {r.score}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.question}
                      </p>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.45 }}>
                        {r.feedback.length > 110 ? r.feedback.slice(0, 110) + "..." : r.feedback}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/dashboard")}
                  style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", color: "#f0f2ec", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
                >
                  ← Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/heatmap")}
                  style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", backgroundColor: phaseColor, color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
                >
                  View Heatmap →
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
