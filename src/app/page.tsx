"use client";

import { useArceStore } from "@/store/arceStore";
import ArceInputPhase from "@/components/ArceInputPhase";
import CrisisModal from "@/components/CrisisModal";
import MasteryCanvas from "@/components/MasteryCanvas";
import ResultsPhase from "@/components/ResultsPhase";

export default function Home() {
  const { gameSession, currentPhase, currentScenario, resetGame, testMode, toggleTestMode } =
    useArceStore();

  return (
    <div className="min-h-screen-gradient bg-gradient-blue-white flex flex-col items-center justify-center transition-all duration-300">
      {/* Test Mode Toggle - Top Right Corner */}
      <button
        onClick={toggleTestMode}
        className={`fixed top-4 right-4 z-50 px-3 sm:px-4 py-2 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 ${
          testMode
            ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-lg"
            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
        }`}
      >
        {testMode ? "🧪 TEST ON" : "🧪 TEST OFF"}
      </button>

      {/* No more decorative blobs - gradient is the background */}

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
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
