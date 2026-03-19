"use client";

import { useState, useRef, useEffect } from "react";
import { useArceStore } from "@/store/arceStore";
import { CrisisScenario, ThermalState } from "@/types/arce";

interface CrisisModalProps {
  scenario: CrisisScenario;
  onFeedback?: (thermalState: ThermalState) => void;
}

export default function CrisisModal({ scenario }: CrisisModalProps) {
  const {
    selectAction,
    showDefense,
    submitDefense,
    selectedActionButton,
    showDefenseTextbox,
    isLoading,
  } = useArceStore();

  const [defenseText, setDefenseText] = useState("");
  const [defenseSubmitted, setDefenseSubmitted] = useState(false);
  const [thermalState, setThermalState] = useState<ThermalState>("neutral");
  const [feedback, setFeedback] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when it appears
  useEffect(() => {
    if (showDefenseTextbox && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showDefenseTextbox]);

  const handleActionClick = (buttonId: string) => {
    selectAction(buttonId);
    // For multiple choice, immediately show defense
    if (scenario.questionType === "multiple-choice") {
      setTimeout(() => showDefense(), 300);
    }
  };

  const handleDefenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (defenseText.trim().length < 20) {
      alert("Please provide a more detailed defense (at least 20 characters).");
      return;
    }

    setDefenseSubmitted(true);

    // Simulate thermal feedback
    const thermalResults: ThermalState[] = ["frost", "warning", "ignition"];
    const randomThermal =
      thermalResults[Math.floor(Math.random() * thermalResults.length)];
    setThermalState(randomThermal);

    const feedbackMap: Record<ThermalState, string> = {
      frost: "❄️ Your logic is shallow. This exposes a critical gap. Try again with deeper causality.",
      warning:
        "⚠️ You are on the right track, but your defense is incomplete. Why does this truly work?",
      ignition:
        "🔥 Deep causality detected! You have grasped the leverage point. This node is Ignited.",
      neutral: "Evaluating...",
    };

    setFeedback(feedbackMap[randomThermal]);

    // Submit to store
    await submitDefense(defenseText);

    // Show feedback for 2 seconds, then move to next
    setTimeout(() => {
      setDefenseSubmitted(false);
      setDefenseText("");
      setThermalState("neutral");
      setFeedback("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white text-black px-4 py-8 flex flex-col">
      {/* Crisis Text */}
      <div className="max-w-3xl mx-auto w-full mb-12">
        <div className="mb-8">
          <h2 className="text-4xl font-black mb-6 text-black">CRISIS</h2>
          <p className="text-2xl font-light leading-relaxed text-black bg-gray-50 p-8 rounded-lg border-2 border-black">
            {scenario.crisisText}
          </p>
        </div>

        {/* Action Buttons for Multiple Choice */}
        {scenario.questionType === "multiple-choice" &&
          scenario.actionButtons &&
          !showDefenseTextbox && (
            <div className="space-y-4 mb-8">
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Choose your move:
              </p>
              {scenario.actionButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleActionClick(button.id)}
                  disabled={isLoading}
                  className={`action-button ${
                    selectedActionButton === button.id ? "selected" : ""
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-xl font-bold mr-4">
                    {String.fromCharCode(65 + (button.order - 1))}
                  </span>
                  <span className="flex-1 text-left">{button.label}</span>
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Defense Textbox - Slides up from bottom */}
      {showDefenseTextbox && !defenseSubmitted && (
        <div className="defense-container">
          <form onSubmit={handleDefenseSubmit} className="flex flex-col gap-4">
            <label className="defense-label">
              Defend your logic. Why does this move work?
            </label>
            <textarea
              ref={textareaRef}
              value={defenseText}
              onChange={(e) => setDefenseText(e.target.value)}
              placeholder="Explain the causal chain. Why is this your best move? Think deeply about the consequences..."
              className="defense-textarea"
              disabled={isLoading}
              autoFocus
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading || defenseText.trim().length < 20}
                className="button-rainbow flex-1 py-3 px-6 font-bold rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "Evaluating..." : "Submit Defense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback Display - Shows thermal result */}
      {defenseSubmitted && (
        <div className={`feedback-container max-w-3xl mx-auto w-full state-${thermalState}`}>
          <div className="text-3xl font-black mb-4">{feedback}</div>
          <div className="text-sm text-gray-600">Advancing to next scenario...</div>
        </div>
      )}
    </div>
  );
}
