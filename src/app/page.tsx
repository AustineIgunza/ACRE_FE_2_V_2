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
    <div className="min-h-screen-gradient bg-gradient-blue-white flex flex-col items-center justify-center transition-all duration-300">
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
