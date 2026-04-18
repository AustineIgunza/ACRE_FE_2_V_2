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

  return (
    <div style={{
      backgroundColor: getBackgroundColor(),
      minHeight: "100vh",
      transition: "background-color 0.6s ease",
    }}>
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
  );
}
