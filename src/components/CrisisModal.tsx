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

      <div className="min-h-screen bg-gradient-subtle text-slate-900 px-4 sm:px-6 py-8 sm:py-12 flex flex-col relative overflow-hidden">
        {/* Premium Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
          <div className="absolute -bottom-8 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center justify-center flex-1">
          {/* Crisis Section - Centered */}
          <div className="w-full mb-8 sm:mb-12 text-center">
            {/* Crisis Heading */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                CRISIS
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-600">
                Make your critical decision
              </p>
            </div>

            {/* Crisis Text Box - Premium styling */}
            <div className="mb-8 sm:mb-12 text-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-slate-800 bg-white/80 backdrop-blur-lg border-1.5 border-blue-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300">
                {scenario.crisisText}
              </p>
            </div>

            {/* Action Buttons for Multiple Choice - Centered */}
            {scenario.questionType === "multiple-choice" &&
              scenario.actionButtons &&
              !showDefenseTextbox && (
              <div className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-widest text-center mb-4 sm:mb-6">
                  Select Your Response:
                </p>
                {scenario.actionButtons.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => handleActionClick(button.id)}
                    disabled={isLoading}
                    className={`action-button w-full transition-all duration-300 ${
                      selectedActionButton === button.id ? "selected ring-2 ring-blue-500 scale-105" : "hover:scale-102"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                  >
                    <span className="action-button-index text-lg sm:text-xl font-bold">
                      {String.fromCharCode(65 + (button.order - 1))}
                    </span>
                    <span className="action-button-label flex-1 text-left text-sm sm:text-base">{button.label}</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">Click to select</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Defense Textbox - Centered slide-up */}
        {showDefenseTextbox && !defenseSubmitted && (
          <div className="defense-container relative z-20">
            <form onSubmit={handleDefenseSubmit} className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
              <label className="defense-label text-center text-lg sm:text-xl font-bold text-slate-900">
                Defend Your Logic
              </label>
              <p className="text-center text-sm sm:text-base text-slate-600 font-medium">
                Why does this move work? Explain the causal chain and consequences...
              </p>
              <textarea
                ref={textareaRef}
                value={defenseText}
                onChange={(e) => setDefenseText(e.target.value)}
                placeholder="Explain your reasoning in detail... (minimum 20 characters)"
                className="defense-textarea w-full h-40 sm:h-48 p-4 sm:p-5 border-1.5 border-blue-200 rounded-2xl text-slate-800 bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 transition-all duration-250"
                disabled={isLoading || isEvaluating}
                autoFocus
              />
              <div className="text-center text-xs sm:text-sm text-slate-500 font-medium">
                {defenseText.length} / 20 characters minimum
              </div>
              <button
                type="submit"
                disabled={isLoading || defenseText.trim().length < 20 || isEvaluating}
                className="button-primary w-full py-4 sm:py-5 px-6 font-bold text-base sm:text-lg rounded-2xl hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250"
              >
                {isEvaluating ? "Evaluating..." : "Submit Defense"}
              </button>
            </form>
          </div>
        )}

        {/* Feedback Display - Centered with thermal styling */}
        {defenseSubmitted && (
          <div className={`feedback-container max-w-2xl mx-auto w-full text-center relative z-20 ${thermalState ? `state-${thermalState}` : ""}`}>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 text-slate-900">{feedback}</div>
            <div className="text-sm sm:text-base text-slate-600 font-medium">Advancing to next scenario...</div>
          </div>
        )}
      </div>
    </>
  );
}
