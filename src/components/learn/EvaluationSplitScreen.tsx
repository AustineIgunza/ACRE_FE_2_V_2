"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import "katex/dist/katex.min.css";
import katex from "katex";

function renderLatex(formula: string): string {
  try {
    return katex.renderToString(formula, { throwOnError: false, displayMode: true, output: "html" });
  } catch {
    return formula;
  }
}

export default function EvaluationSplitScreen() {
  const { currentScenario, isLoading, submitDefense } = useArceStore();
  const [stressResponse, setStressResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  if (!currentScenario) return null;

  const latexHtml = renderLatex(currentScenario.latexFormula || "");

  const handleStressSubmit = async () => {
    setSubmitted(true);
    console.log("Stress test submitted, validating response...");
    
    try {
      // Call submitDefense to validate the user's answer
      const result = await submitDefense(stressResponse);
      
      if (result) {
        setValidationFeedback(result.feedback);
        setIsCorrect(result.thermalState === "ignition" || result.thermalState === "warning");
        console.log("Validation result:", { thermalState: result.thermalState, feedback: result.feedback });
      }
      
      // After showing feedback, advance to synchronization
      setTimeout(() => {
        console.log("Advancing to synchronization phase");
        useArceStore.setState({ currentPhase: "synchronization" });
      }, 2500);
    } catch (error) {
      console.error("Error during answer validation:", error);
      setValidationFeedback("⚠️ Error validating response. Please try again.");
      setIsCorrect(false);
      
      setTimeout(() => {
        useArceStore.setState({ currentPhase: "synchronization" });
      }, 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
      }}
    >
      {/* LEFT PANEL: Stress Test Scenario */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: 1,
          backgroundColor: "#0a0a0c",
          color: "#e8e6e0",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        {/* Ambient */}
        <div style={{
          position: "absolute", bottom: "-100px", left: "-100px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <span style={{
          fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
          fontWeight: 700, color: "#ef4444", marginBottom: "24px",
        }}>
          ⚡ STRESS TEST
        </span>

        {/* Updated Dashboard Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            backgroundColor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.15)",
            marginBottom: "24px",
            display: "flex", alignItems: "center", gap: "10px",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }}
          />
          <span style={{ fontSize: "13px", color: "#f87171", fontWeight: 600, fontFamily: "monospace" }}>
            STRESS TEST: Can this logic survive counter-evidence?
          </span>
        </motion.div>

        {/* Counter Variable */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.5)",
            marginBottom: "24px",
          }}
        >
          <strong style={{ color: "#f59e0b" }}>Counter-Variable:</strong> What if the initial assumptions change?
        </motion.p>

        {/* Stress Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "24px",
          }}
        >
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: "17px",
            fontWeight: 500,
            color: "#f0f2ec",
            lineHeight: 1.7,
            margin: 0,
          }}>
            How does your Domino Effect chain hold up when variables change? Where is the weakest link?
          </p>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.3)",
            fontStyle: "italic",
            marginBottom: "24px",
          }}
        >
          💡 Consider what assumptions your logic depends on. What if one changes?
        </motion.p>

        {/* Response Input or Submitted State */}
        {!submitted ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <textarea
              value={stressResponse}
              onChange={(e) => setStressResponse(e.target.value)}
              placeholder="Iterate on the logic... What breaks? What's the trade-off?"
              style={{
                width: "100%", minHeight: "100px", padding: "16px",
                fontSize: "14px", lineHeight: 1.7, color: "#f0f2ec",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", resize: "vertical", fontFamily: "inherit", outline: "none",
              }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStressSubmit}
              disabled={isLoading || stressResponse.trim().length === 0}
              style={{
                marginTop: "16px", width: "100%",
                padding: "14px 32px", fontSize: "13px", fontWeight: 700,
                letterSpacing: "1px", textTransform: "uppercase",
                color: "#fff", backgroundColor: "#ff5c35",
                border: "none", borderRadius: "10px", cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "VALIDATING..." : "COMPLETE NODE"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: isCorrect 
                ? "rgba(34,197,94,0.1)" 
                : isCorrect === false 
                ? "rgba(239,68,68,0.1)"
                : "rgba(34,197,94,0.1)",
              border: isCorrect
                ? "1px solid rgba(34,197,94,0.2)"
                : isCorrect === false
                ? "1px solid rgba(239,68,68,0.2)"
                : "1px solid rgba(34,197,94,0.2)",
              textAlign: "center",
            }}
          >
            {validationFeedback ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p style={{
                  color: isCorrect ? "#22c55e" : isCorrect === false ? "#ef4444" : "#22c55e",
                  fontWeight: 700,
                  fontSize: "14px",
                  margin: "0 0 8px 0",
                  whiteSpace: "pre-wrap",
                }}>
                  {validationFeedback}
                </p>
                <p style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "12px",
                  margin: 0,
                  fontStyle: "italic",
                }}>
                  Advancing to next phase...
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "3px solid rgba(34,197,94,0.3)",
                    borderTopColor: "#22c55e",
                    margin: "0 auto 12px",
                  }}
                />
                <p style={{ color: "#22c55e", fontWeight: 700, fontSize: "14px", margin: 0 }}>
                  ✓ Validating Response...
                </p>
              </>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* RIGHT PANEL: Intel Card Reference (Anchored) */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "420px",
          backgroundColor: "var(--p-white)",
          borderLeft: "1px solid var(--p-border)",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          overflow: "auto",
          maxHeight: "100vh",
        }}
      >
        <span style={{
          fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase",
          color: "var(--t-muted)", fontWeight: 600, marginBottom: "16px",
        }}>
          REFERENCE CARD
        </span>

        {/* Mini Intel Card */}
        <div style={{
          borderRadius: "10px",
          border: "1px solid var(--p-border)",
          backgroundColor: "var(--p-sheet)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--p-border)" }}>
            <h4 style={{
              fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: 400,
              letterSpacing: "-0.2px", color: "var(--t-primary)", margin: 0,
            }}>
              Logic Reference
            </h4>
          </div>

          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--p-border)", maxHeight: "110px", overflow: "auto" }}>
            <p style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--t-mid)", margin: 0 }}>
              {currentScenario.formalMechanism}
            </p>
          </div>

          <div style={{
            padding: "14px 16px",
            backgroundColor: "var(--p-surface)",
            display: "flex",
            justifyContent: "center",
            borderBottom: "1px solid var(--p-border)",
            maxHeight: "100px",
            overflow: "auto",
          }}>
            <div dangerouslySetInnerHTML={{ __html: latexHtml }} style={{ fontSize: "14px" }} />
          </div>

          <div style={{ padding: "14px 16px", maxHeight: "120px", overflow: "auto" }}>
            <p style={{
              fontSize: "13px", lineHeight: 1.7, color: "var(--t-deep)", margin: 0,
              fontStyle: "italic", fontFamily: "Georgia, serif",
            }}>
              {currentScenario.soWhat}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
