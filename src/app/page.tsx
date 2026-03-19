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
    <div className="min-h-screen bg-gradient-subtle text-slate-900 transition-all duration-300">
      {/* Premium Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
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
