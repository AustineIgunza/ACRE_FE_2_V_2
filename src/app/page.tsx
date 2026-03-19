"use client";

import { useArceStore } from "@/store/arceStore";
import ArceInputPhase from "@/components/ArceInputPhase";
import CrisisModal from "@/components/CrisisModal";
import MasteryCanvas from "@/components/MasteryCanvas";
import ResultsPhase from "@/components/ResultsPhase";

export default function Home() {
  const { gameSession, currentPhase, currentScenario, resetGame } =
    useArceStore();

  return (
    <div className="min-h-screen bg-white text-black">
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
  );
}
