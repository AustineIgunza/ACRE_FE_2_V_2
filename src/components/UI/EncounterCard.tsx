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
    <div style={{
      backgroundColor: "var(--p-white)",
      border: "1px solid var(--p-border)",
      borderRadius: "12px",
      padding: "32px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    }}>
      {/* Scenario */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--snap)", marginBottom: "16px" }}>
          ⚡ Scenario
        </h3>
        <p style={{ fontSize: "16px", color: "var(--t-mid)", lineHeight: 1.7 }}>
          {encounter.scenario}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleChoice(key)}
            disabled={is_loading || !!feedback}
            style={{
              width: "100%",
              padding: "16px",
              textAlign: "left",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: feedback?.choice === key
                ? feedback.isCorrect
                  ? "var(--success)"
                  : "var(--error)"
                : "var(--p-border)",
              backgroundColor: feedback?.choice === key
                ? feedback.isCorrect
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)"
                : "var(--p-surface)",
              color: feedback?.choice === key
                ? feedback.isCorrect
                  ? "var(--success)"
                  : "var(--error)"
                : "var(--t-mid)",
              cursor: is_loading || !!feedback ? "not-allowed" : "pointer",
              opacity: is_loading || !!feedback ? 0.75 : 1,
              transition: "all 0.2s ease",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              if (!is_loading && !feedback) {
                e.currentTarget.style.borderColor = "var(--snap)";
                e.currentTarget.style.backgroundColor = "var(--snap-tint)";
              }
            }}
            onMouseLeave={(e) => {
              if (!is_loading && !feedback) {
                e.currentTarget.style.borderColor = "var(--p-border)";
                e.currentTarget.style.backgroundColor = "var(--p-surface)";
              }
            }}
          >
            <span style={{ fontWeight: 700 }}>{key}.</span> {label}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: feedback.isCorrect ? "var(--success)" : "var(--error)",
            backgroundColor: feedback.isCorrect ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: feedback.isCorrect ? "var(--success)" : "var(--error)",
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: "8px" }}>
            {feedback.isCorrect ? "✅ CORRECT!" : "❌ INCORRECT"}
          </p>
          <p>{feedback.message}</p>
        </div>
      )}

      {/* Loading State */}
      {is_loading && (
        <div style={{ textAlign: "center", color: "var(--t-secondary)" }}>
          <p style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
            Evaluating your answer...
          </p>
        </div>
      )}
    </div>
  );
}
