"use client";

import { useState, useRef, useEffect } from "react";
import { useArceStore } from "@/store/arceStore";
import { CrisisScenario, ThermalState } from "@/types/arce";
import { getDefenseEvaluation } from "@/utils/mockTestData";
import MiniLoadingOverlay from "./MiniLoadingOverlay";
import FeedbackModal from "./FeedbackModal";

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
    testMode,
  } = useArceStore();

  const [defenseText, setDefenseText] = useState("");
  const [defenseSubmitted, setDefenseSubmitted] = useState(false);
  const [thermalState, setThermalState] = useState<ThermalState>("neutral");
  const [feedback, setFeedback] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [formalDef, setFormalDef] = useState("");
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

    // In test mode, allow empty defense; otherwise require 20 chars
    if (!testMode && defenseText.trim().length < 20) {
      alert("Please provide a more detailed defense (at least 20 characters).");
      return;
    }

    setIsEvaluating(true);

    // Get evaluation based on actual button + defense
    const evaluation = getDefenseEvaluation(
      scenario.id,
      selectedActionButton || "",
      defenseText.length
    );

    setThermalState(evaluation.thermalState);
    setFeedback(evaluation.feedback);
    setKeywords(evaluation.keywords);
    setFormalDef(evaluation.formalDefinition);

    // Simulate API delay (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsEvaluating(false);
    setDefenseSubmitted(true);

    // Submit to store
    await submitDefense(defenseText);

    // Show feedback for 3.5 seconds, then move to next
    setTimeout(() => {
      setDefenseSubmitted(false);
      setDefenseText("");
      setThermalState("neutral");
      setFeedback("");
      setKeywords([]);
      setFormalDef("");
      
      // Move to next scenario
      const { nextNode, gameSession, currentPhase } = useArceStore.getState();
      
      // Check if we should end game (5 scenarios completed)
      if (gameSession && gameSession.responses.length >= 5) {
        useArceStore.getState().endGame();
      } else {
        nextNode();
      }
    }, 3500);
  };

  return (
    <>
      {/* Mini Loading Overlay during evaluation */}
      {isEvaluating && <MiniLoadingOverlay />}

      <div className="min-h-screen-gradient bg-gradient-blue-white text-slate-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex flex-col items-center justify-start relative">
        {/* Content Container - Fully Centered and Scrollable */}
        <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-8 sm:gap-12">
          {/* Crisis Section - Centered */}
          <div className="w-full text-center">
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
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-slate-800 bg-white/80 backdrop-blur-lg border-1.5 border-blue-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300">
                {scenario.crisisText}
              </p>
            </div>

            {/* Action Buttons for Multiple Choice - Centered */}
            {scenario.questionType === "multiple-choice" &&
              scenario.actionButtons &&
              !showDefenseTextbox && (
              <div className="w-full space-y-3 sm:space-y-4">
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

          {/* Defense Textbox - Inline, not fixed position */}
          {showDefenseTextbox && !defenseSubmitted && (
            <div className="defense-box-inline w-full animate-slideDown">
              <form onSubmit={handleDefenseSubmit} className="flex flex-col gap-3 sm:gap-4">
                <label className="defense-label text-center text-base sm:text-lg font-bold text-slate-900">
                  Defend Your Logic {testMode && <span className="text-xs bg-yellow-200 px-2 py-1 rounded ml-2">🧪 TEST MODE</span>}
                </label>
                <textarea
                  ref={textareaRef}
                  value={defenseText}
                  onChange={(e) => setDefenseText(e.target.value)}
                  placeholder={testMode ? "TEST MODE: Type anything or leave blank (will auto-pass)..." : "Explain your reasoning... (min 20 chars)"}
                  className="defense-textarea w-full p-3 sm:p-4 border-1.5 border-blue-200 rounded-xl text-slate-800 bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 transition-all duration-250"
                  disabled={isLoading || isEvaluating}
                  autoFocus
                />
                <div className="text-center text-xs sm:text-sm text-slate-500 font-medium">
                  {defenseText.length} / {testMode ? "optional" : "20"} characters {!testMode && "minimum"}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || (!testMode && defenseText.trim().length < 20) || isEvaluating}
                  className="button-primary w-full py-3 sm:py-4 px-4 sm:px-6 font-bold text-sm sm:text-base rounded-xl hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250"
                >
                  {isEvaluating ? "Evaluating..." : testMode ? "Submit (TEST MODE)" : "Submit Defense"}
                </button>
              </form>
            </div>
          )}

          {/* Feedback is now in modal - removed inline display */}

          {/* Spacer to allow scrolling room */}
          <div className="h-4 sm:h-8" />
        </div>
      </div>

      {/* Feedback Modal - Popup instead of inline */}
      <FeedbackModal
        isOpen={defenseSubmitted}
        thermalState={thermalState}
        feedback={feedback}
        keywords={keywords}
        formalDefinition={formalDef}
        onClose={() => {
          setDefenseSubmitted(false);
          setDefenseText("");
          setThermalState("neutral");
          setFeedback("");
          setKeywords([]);
          setFormalDef("");
          
          // Move to next scenario
          const { nextNode, gameSession } = useArceStore.getState();
          
          // Check if we should end game (5 scenarios completed)
          if (gameSession && gameSession.responses.length >= 5) {
            useArceStore.getState().endGame();
          } else {
            nextNode();
          }
        }}
        autoCloseSeconds={3.5}
      />
    </>
  );
}
