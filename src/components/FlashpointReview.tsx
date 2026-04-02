import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FlashpointReview.module.css";

interface FlashpointReviewProps {
  phase: "phase-1" | "phase-2" | "phase-3";
  difficulty: "multiple-choice" | "text-input" | "blindspot";
  crisisAlert: string;
  options?: Array<{ id: string; text: string }>;
  flawedProposal?: { speaker: string; quote: string };
  uiPrompt?: string;
  onSubmit: (response: string | number) => Promise<{ success: boolean; feedback: string; score: number }>;
  onClose: () => void;
}

export default function FlashpointReview({
  phase,
  difficulty,
  crisisAlert,
  options,
  flawedProposal,
  uiPrompt,
  onSubmit,
  onClose,
}: FlashpointReviewProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    feedback: string;
    score: number;
  } | null>(null);
  const [showingFeedback, setShowingFeedback] = useState(false);

  const handlePhase1Submit = async () => {
    if (!selectedOption) return;
    setIsSubmitting(true);
    try {
      const response = await onSubmit(selectedOption);
      setResult(response);
      setShowingFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhase2Or3Submit = async () => {
    const responseText = difficulty === "text-input" ? textInput : textInput;
    if (!responseText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await onSubmit(responseText);
      setResult(response);
      setShowingFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.header}>
        <div className={styles.phase}>{phase.replace("-", " ").toUpperCase()}</div>
        <div className={styles.difficulty}>{difficulty.replace("-", " ")}</div>
      </div>

      {/* Crisis Alert */}
      <motion.div
        className={styles.crisisAlert}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.alertIcon}>⚠️</div>
        <div className={styles.alertText}>{crisisAlert}</div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showingFeedback ? (
          <motion.div
            key="input"
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Phase 1: Multiple Choice */}
            {difficulty === "multiple-choice" && options && (
              <div className={styles.multipleChoice}>
                <h2>Select the most appropriate action:</h2>
                <div className={styles.optionsList}>
                  {options.map((option) => (
                    <motion.button
                      key={option.id}
                      className={`${styles.option} ${
                        selectedOption === option.id ? styles.selected : ""
                      }`}
                      onClick={() => setSelectedOption(option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={styles.optionCircle}>
                        {selectedOption === option.id && <div className={styles.optionDot} />}
                      </span>
                      <span className={styles.optionText}>{option.text}</span>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  className={styles.submitButton}
                  onClick={handlePhase1Submit}
                  disabled={!selectedOption || isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? "Evaluating..." : "Submit Answer"}
                </motion.button>
              </div>
            )}

            {/* Phase 2: Text Input with Flawed Proposal */}
            {difficulty === "text-input" && flawedProposal && (
              <div className={styles.textInput}>
                <div className={styles.flawedProposal}>
                  <h3>Flawed Proposal:</h3>
                  <div className={styles.proposalBox}>
                    <p>
                      <strong>{flawedProposal.speaker}:</strong> "{flawedProposal.quote}"
                    </p>
                  </div>
                </div>
                <p className={styles.prompt}>{uiPrompt}</p>
                <textarea
                  className={styles.textarea}
                  placeholder="Explain the flaw and what should be done instead..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={5}
                />
                <motion.button
                  className={styles.submitButton}
                  onClick={handlePhase2Or3Submit}
                  disabled={!textInput.trim() || isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? "Evaluating..." : "Submit Answer"}
                </motion.button>
              </div>
            )}

            {/* Phase 3: Blindspot - Critical Question */}
            {difficulty === "blindspot" && (
              <div className={styles.blindspot}>
                <p className={styles.prompt}>{uiPrompt || "What critical information do you need?"}</p>
                <input
                  type="text"
                  className={styles.questionInput}
                  placeholder="Ask a single critical question..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && textInput.trim()) {
                      handlePhase2Or3Submit();
                    }
                  }}
                />
                <motion.button
                  className={styles.submitButton}
                  onClick={handlePhase2Or3Submit}
                  disabled={!textInput.trim() || isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? "Evaluating..." : "Ask Question"}
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Feedback Display */
          <motion.div
            key="feedback"
            className={styles.feedback}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className={`${styles.feedbackContent} ${
                result?.success ? styles.success : styles.failure
              }`}
              animate={{
                boxShadow: result?.success
                  ? ["0 0 20px rgba(76, 175, 80, 0.5)", "0 0 40px rgba(76, 175, 80, 0.8)", "0 0 20px rgba(76, 175, 80, 0.5)"]
                  : ["0 0 20px rgba(244, 67, 54, 0.5)", "0 0 40px rgba(244, 67, 54, 0.8)", "0 0 20px rgba(244, 67, 54, 0.5)"]
              }}
              transition={{
                duration: 2,
                repeat: result?.success ? 0 : Infinity,
              }}
            >
              <div className={styles.resultIcon}>
                {result?.success ? "✓" : "✗"}
              </div>
              <div className={styles.resultTitle}>
                {result?.success ? "Excellent!" : "Not quite right"}
              </div>
              <div className={styles.resultScore}>
                Score: <strong>{result?.score}%</strong>
              </div>
              <div className={styles.resultFeedback}>{result?.feedback}</div>

              <div className={styles.feedbackActions}>
                {result?.success ? (
                  <motion.button
                    className={styles.nextButton}
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next Review
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      className={styles.retryButton}
                      onClick={() => {
                        setShowingFeedback(false);
                        setSelectedOption(null);
                        setTextInput("");
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Again
                    </motion.button>
                    <motion.button
                      className={styles.skipButton}
                      onClick={onClose}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button */}
      <motion.button
        className={styles.closeButton}
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
