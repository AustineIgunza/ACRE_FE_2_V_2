"use client";

import { useState, useRef, useEffect } from "react";
import { useArceStore } from "@/store/arceStore";
import { CrisisScenario, ThermalState } from "@/types/arce";
import MiniLoadingOverlay from "./MiniLoadingOverlay";
import FeedbackModal from "./FeedbackModal";

interface CrisisModalProps {
  scenario: CrisisScenario;
  onFeedback?: (thermalState: ThermalState) => void;
}

export default function CrisisModal({ scenario }: CrisisModalProps) {
  const {
    gameSession,
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

  // Lesson progress based on responses (assuming 3 is total length)
  const currentStep = (gameSession?.responses.length || 0) + 1;
  const totalSteps = 3;
  const progressPercent = ((currentStep - 1) / totalSteps) * 100;

  useEffect(() => {
    if (showDefenseTextbox && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showDefenseTextbox]);

  const handleActionClick = (buttonId: string) => {
    selectAction(buttonId);
    if (scenario.questionType === "multiple-choice") {
      setTimeout(() => showDefense(), 300);
    }
  };

  const handleDefenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testMode && defenseText.trim().length < 20) {
      alert("Please provide a more detailed defense (at least 20 characters).");
      return;
    }

    setIsEvaluating(true);
    const result = await submitDefense(defenseText);
    setIsEvaluating(false);

    if (result) {
      setThermalState(result.thermalState);
      setFeedback(result.feedback);
      setKeywords(result.keywords || []);
      setFormalDef(result.formalDefinition || "");
      setDefenseSubmitted(true);
    }
  };

  return (
    <>
      {isEvaluating && <MiniLoadingOverlay />}

      <div style={{
        minHeight: "100vh",
        backgroundColor: "var(--p-white)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "48px 24px 80px",
      }}>
        <div style={{ width: "100%", maxWidth: "640px", display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Progress Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span className="question-eyebrow">Scenario {currentStep} of {totalSteps}</span>
              <span className="points-badge">+10 XP</span>
            </div>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Question Card */}
          <div className="question-card" style={{ animation: "slideUp 0.4s ease-out" }}>
            <p className="question-text" style={{ marginBottom: "0" }}>
              {scenario.crisisText}
            </p>
          </div>

          {/* Action Buttons */}
          {scenario.questionType === "multiple-choice" && scenario.actionButtons && !showDefenseTextbox && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slideUp 0.5s ease-out" }}>
              {scenario.actionButtons.map((button) => {
                const isSelected = selectedActionButton === button.id;
                return (
                  <button
                    key={button.id}
                    onClick={() => handleActionClick(button.id)}
                    disabled={isLoading}
                    className={`answer-option ${isSelected ? "selected" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      width: "100%",
                      textAlign: "left",
                      opacity: isLoading ? 0.5 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      borderColor: isSelected ? "var(--snap)" : undefined,
                      borderWidth: isSelected ? "1.5px" : undefined,
                      background: isSelected ? "var(--snap-tint)" : undefined,
                      color: isSelected ? "var(--t-deep)" : undefined,
                      fontWeight: isSelected ? 600 : undefined,
                    }}
                  >
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: isSelected ? "var(--snap)" : "var(--p-surface)",
                      color: isSelected ? "var(--p-white)" : "var(--t-secondary)",
                      fontWeight: 700,
                      fontSize: "14px",
                      flexShrink: 0,
                    }}>
                      {String.fromCharCode(65 + (button.order - 1))}
                    </span>
                    <span style={{ flex: 1, fontSize: "15px", lineHeight: 1.5 }}>
                      {button.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Defense Textbox */}
          {showDefenseTextbox && !defenseSubmitted && (
            <div className="folio-card" style={{ animation: "slideUp 0.3s ease-out" }}>
              <form onSubmit={handleDefenseSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ textAlign: "center" }}>
                  <label className="eyebrow" style={{ color: "var(--t-deep)", fontSize: "12px" }}>
                    Defend Your Logic
                    {testMode && <span style={{ marginLeft: "8px", background: "var(--xp)", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>TEST MODE</span>}
                  </label>
                </div>
                <textarea
                  ref={textareaRef}
                  value={defenseText}
                  onChange={(e) => setDefenseText(e.target.value)}
                  placeholder={testMode ? "TEST MODE: Type anything..." : "Explain your reasoning... (min 20 chars)"}
                  className="folio-input"
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                  disabled={isLoading || isEvaluating}
                />
                <div style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, color: defenseText.length >= 20 ? "var(--success)" : "var(--t-secondary)" }}>
                  {defenseText.length} / {testMode ? "optional" : "20"} characters {!testMode && "min"}
                </div>
                <button
                  type="submit"
                  disabled={isLoading || (!testMode && defenseText.trim().length < 20) || isEvaluating}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  {isEvaluating ? "Evaluating..." : testMode ? "Submit Defense (TEST)" : "Submit Defense"}
                </button>
              </form>
            </div>
          )}

          <div style={{ height: "32px" }} />
        </div>
      </div>

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
          
          const { nextNode, gameSession } = useArceStore.getState();
          if (gameSession && gameSession.responses.length >= totalSteps) {
            useArceStore.getState().endGame();
          } else {
            nextNode();
          }
        }}
        autoCloseSeconds={4.5}
      />
    </>
  );
}
