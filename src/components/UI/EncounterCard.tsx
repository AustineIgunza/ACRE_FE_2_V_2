"use client";

import { useState } from "react";
import { useCombatStore } from "@/store/combatStore";
import { CombatEncounter } from "@/types/combat";

interface EncounterCardProps {
  encounter: CombatEncounter;
  is_loading: boolean;
}

export default function EncounterCard({
  encounter,
  is_loading,
}: EncounterCardProps) {
  const [feedback, setFeedback] = useState<{
    choice: string;
    message: string;
    isCorrect: boolean;
  } | null>(null);
  const { submitAnswer } = useCombatStore();

  const handleChoice = async (choice: "A" | "B" | "C" | "D") => {
    const isCorrect = choice === encounter.correct_option;
    setFeedback({
      choice,
      message: isCorrect ? encounter.win_feedback : encounter.loss_feedback,
      isCorrect,
    });

    // Wait 2 seconds then submit
    setTimeout(() => {
      submitAnswer(encounter.id, choice);
      setFeedback(null);
    }, 2000);
  };

  const options: Array<{ key: "A" | "B" | "C" | "D"; label: string }> = [
    { key: "A", label: encounter.options.A },
    { key: "B", label: encounter.options.B },
    { key: "C", label: encounter.options.C },
    { key: "D", label: encounter.options.D },
  ];

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg p-8 shadow-2xl">
      {/* Scenario */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-red-400 mb-4">⚡ Scenario</h3>
        <p className="text-lg text-slate-300 leading-relaxed">
          {encounter.scenario}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleChoice(key)}
            disabled={is_loading || !!feedback}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all transform hover:scale-102 ${
              feedback?.choice === key
                ? feedback.isCorrect
                  ? "bg-green-900 border-green-500 text-green-100"
                  : "bg-red-900 border-red-500 text-red-100"
                : "bg-slate-700 border-slate-600 text-slate-200 hover:border-slate-500 hover:bg-slate-600"
            } ${
              is_loading || !!feedback ? "cursor-not-allowed opacity-75" : ""
            }`}
          >
            <span className="font-bold">{key}.</span> {label}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg border-2 ${
            feedback.isCorrect
              ? "bg-green-900/30 border-green-500 text-green-300"
              : "bg-red-900/30 border-red-500 text-red-300"
          }`}
        >
          <p className="font-bold mb-2">
            {feedback.isCorrect ? "✅ CORRECT!" : "❌ INCORRECT"}
          </p>
          <p>{feedback.message}</p>
        </div>
      )}

      {/* Loading State */}
      {is_loading && (
        <div className="text-center text-slate-400">
          <p className="animate-pulse">Evaluating your answer...</p>
        </div>
      )}
    </div>
  );
}
