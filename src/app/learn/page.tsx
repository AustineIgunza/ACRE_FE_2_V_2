"use client";

import { useEffect } from "react";
import { useArceStore } from "@/store/arceStore";
import { useRouter } from "next/navigation";
import ArceInputPhase from "@/components/ArceInputPhase";
import CrisisModal from "@/components/CrisisModal";
import ResultsPhase from "@/components/ResultsPhase";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { 
    gameSession, currentPhase, currentScenario, resetGame, 
    testMode, toggleTestMode,
    user, authInitialized, initAuth
  } = useArceStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Loading state while checking auth
  if (!authInitialized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--p-surface)" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid var(--p-border)", borderTopColor: "var(--snap)",
          animation: "spin 0.6s linear infinite"
        }} />
      </div>
    );
  }

  // Require Auth
  if (!user) {
    router.push("/signin");
    return null;
  }

  return (
    <div style={{ backgroundColor: "var(--p-surface)", minHeight: "100vh" }}>
      <Navbar />

      {/* Test Mode Toggle - Small Floating Button */}
      <div style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 50,
      }}>
        <button
          onClick={toggleTestMode}
          type="button"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "12px",
            transition: "all 0.2s",
            background: testMode ? "var(--xp)" : "var(--p-surface)",
            color: testMode ? "var(--p-white)" : "var(--t-secondary)",
            border: "1px solid var(--p-border)",
            cursor: "pointer",
          }}
        >
          {testMode ? "TEST ON" : "TEST OFF"}
        </button>
      </div>

      {/* Content */}
      <div style={{ position: "relative", width: "100%", minHeight: "calc(100vh - 56px)" }}>
        {/* Input Phase: Logo + Textarea */}
        {currentPhase === "input" && <ArceInputPhase />}

        {/* Playing Phase: Crisis Modal + Defense */}
        {currentPhase === "playing" && currentScenario && gameSession && (
          <CrisisModal scenario={currentScenario} />
        )}

        {/* Results Phase: Mastery Cards + Stats */}
        {currentPhase === "results" && gameSession && (
          <ResultsPhase session={gameSession} onNewGame={resetGame} />
        )}
      </div>
    </div>
  );
}
