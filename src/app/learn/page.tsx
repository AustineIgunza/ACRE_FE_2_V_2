"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import Navbar from "@/components/Navbar";
import InputPhase from "@/components/learn/InputPhase";
import ClarificationChat from "@/components/learn/ClarificationChat";
import ChallengeZone from "@/components/learn/ChallengeZone";
import BreakthroughTransition from "@/components/learn/BreakthroughTransition";
import IntelCardSanctuary from "@/components/learn/IntelCardSanctuary";
import EvaluationSplitScreen from "@/components/learn/EvaluationSplitScreen";
import InterleavingPhase from "@/components/learn/InterleavingPhase";
import Synchronization from "@/components/learn/Synchronization";
import LogicMeshPhase from "@/components/learn/LogicMeshPhase";
import MissionDebrief from "@/components/learn/MissionDebrief";
import { useRouter } from "next/navigation";

export default function LearnPage() {
  const {
    currentPhase,
    user,
    authInitialized,
    initAuth,
  } = useArceStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/signin");
    }
  }, [authInitialized, user, router]);

  if (!authInitialized) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--p-surface)",
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          style={{
            width: "40px", height: "40px", borderRadius: "50%",
            border: "3px solid var(--p-border)",
            borderTopColor: "var(--snap)",
          }}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (currentPhase) {
      case "input":
      case "extracting":
        return "var(--p-surface)";
      case "clarification":
      case "challenge":
      case "transition":
        return "#0a0a0c";
      case "sanctuary":
        return "var(--p-white)";
      case "evaluation":
      case "interleaving":
      case "synchronization":
      case "mesh":
      case "debrief":
        return "#0a0a0c";
      default:
        return "var(--p-surface)";
    }
  };

  const isDark = !["input", "extracting", "sanctuary"].includes(currentPhase);

  return (
    <div style={{
      backgroundColor: getBackgroundColor(),
      minHeight: "100vh",
      transition: "background-color 0.6s ease",
      position: "relative",
    }}>
      {/* Animated background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <style>{`
          @keyframes ln-orb1 { 0%,100%{transform:translate(0,0)scale(1)} 35%{transform:translate(60px,-42px)scale(1.07)} 68%{transform:translate(-28px,52px)scale(0.95)} }
          @keyframes ln-orb2 { 0%,100%{transform:translate(0,0)scale(1)} 42%{transform:translate(-68px,32px)scale(1.05)} 72%{transform:translate(42px,-58px)scale(0.93)} }
          @keyframes ln-orb3 { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(48px,68px)scale(1.09)} 82%{transform:translate(-22px,-32px)scale(0.96)} }
          @keyframes ln-dot  { 0%,100%{opacity:.1;transform:translateY(0)scale(1)} 50%{opacity:.22;transform:translateY(-18px)scale(1.2)} }
        `}</style>
        <div style={{ position: "absolute", top: "8%", left: "6%", width: "480px", height: "480px", borderRadius: "50%", background: `radial-gradient(circle, ${isDark ? "rgba(255,92,53,0.06)" : "rgba(255,92,53,0.04)"} 0%, transparent 70%)`, animation: "ln-orb1 26s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "6%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${isDark ? "rgba(88,120,248,0.05)" : "rgba(88,120,248,0.03)"} 0%, transparent 70%)`, animation: "ln-orb2 32s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "340px", height: "340px", borderRadius: "50%", background: `radial-gradient(circle, ${isDark ? "rgba(139,92,246,0.04)" : "rgba(139,92,246,0.025)"} 0%, transparent 70%)`, animation: "ln-orb3 40s ease-in-out infinite" }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ position: "absolute", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: isDark ? "rgba(255,92,53,0.2)" : "rgba(255,92,53,0.12)", left: `${10+i*15}%`, top: `${15+(i%3)*28}%`, animation: `ln-dot ${4+i*0.8}s ease-in-out infinite`, animationDelay: `${i*0.55}s` }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
      {(currentPhase === "input" || currentPhase === "extracting") && <Navbar />}

      <AnimatePresence mode="wait">
        {(currentPhase === "input" || currentPhase === "extracting") && (
          <motion.div key="input" exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <InputPhase />
          </motion.div>
        )}

        {currentPhase === "clarification" && (
          <motion.div key="clarification" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ClarificationChat />
          </motion.div>
        )}

        {currentPhase === "challenge" && (
          <motion.div key="challenge" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ChallengeZone />
          </motion.div>
        )}

        {currentPhase === "transition" && (
          <motion.div key="transition">
            <BreakthroughTransition />
          </motion.div>
        )}

        {currentPhase === "sanctuary" && (
          <motion.div key="sanctuary">
            <IntelCardSanctuary />
          </motion.div>
        )}

        {currentPhase === "evaluation" && (
          <motion.div key="evaluation">
            <EvaluationSplitScreen />
          </motion.div>
        )}

        {currentPhase === "interleaving" && (
          <motion.div key="interleaving" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <InterleavingPhase />
          </motion.div>
        )}

        {currentPhase === "synchronization" && (
          <motion.div key="synchronization">
            <Synchronization />
          </motion.div>
        )}

        {currentPhase === "mesh" && (
          <motion.div key="mesh" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LogicMeshPhase />
          </motion.div>
        )}

        {currentPhase === "debrief" && (
          <motion.div key="debrief">
            <MissionDebrief />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
