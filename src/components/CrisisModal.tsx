"use client";

import { useState, useRef, useEffect } from "react";
import { useArceStore } from "@/store/arceStore";
import { CrisisScenario, ThermalState } from "@/types/arce";
import MiniLoadingOverlay from "./MiniLoadingOverlay";

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
  const [isEvaluating, setIsEvaluating] = useState(false);
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

    setIsEvaluating(true);

    // Simulate thermal feedback
    const thermalResults: ThermalState[] = ["frost", "warning", "ignition"];
    const randomThermal =
      thermalResults[Math.floor(Math.random() * thermalResults.length)];
    setThermalState(randomThermal);

    const feedbackMap: Record<ThermalState, string> = {
      frost: "Your logic is shallow. This exposes a critical gap. Try again with deeper causality.",
      warning:
        "You are on the right track, but your defense is incomplete. Why does this truly work?",
      ignition:
        "Deep causality detected! You have grasped the leverage point. This node is Ignited.",
      neutral: "Evaluating...",
    };

    setFeedback(feedbackMap[randomThermal]);

    // Simulate API delay (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsEvaluating(false);
    setDefenseSubmitted(true);

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
    <>
      {/* Mini Loading Overlay during evaluation */}
      {isEvaluating && <MiniLoadingOverlay />}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-black px-4 py-8 flex flex-col relative">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
          <div className="absolute -bottom-8 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          {/* Crisis Text */}
          <div className="mb-12">
            <div className="mb-8">
              <h2 className="text-4xl font-black mb-6 text-blue-900 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">CRISIS</h2>
              <p className="text-2xl font-light leading-relaxed text-slate-800 bg-white/60 backdrop-blur-md p-8 rounded-2xl border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all">
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
                disabled={isLoading || isEvaluating}
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || defenseText.trim().length < 20 || isEvaluating}
                  className="button-rainbow flex-1 py-3 px-6 font-bold rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isEvaluating ? "Evaluating..." : "Submit Defense"}
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
      </div>
    </>
  );
}
