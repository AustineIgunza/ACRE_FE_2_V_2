"use client";

import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";
import "katex/dist/katex.min.css";
import katex from "katex";

// Safely render LaTeX to HTML string
function renderLatex(formula: string): string {
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true,
      output: "html",
    });
  } catch {
    return formula;
  }
}

export default function IntelCardSanctuary() {
  const { currentScenario, scenarios, isLoading, nodeResults } = useArceStore();

  if (!currentScenario || !scenarios) return null;

  // Get current Logic Node title from scenario
  const nodeTitle = currentScenario.nodeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Read thermal state from actual evaluation result
  const nodeResult = nodeResults?.[currentScenario.nodeId];
  const thermalState = nodeResult?.accuracy || "neutral";
  const isIgnition = thermalState === "ignition";
  const isWarning = thermalState === "warning";
  const isFrost = thermalState === "frost";

  const accuracyColor = isIgnition ? "#22c55e" : isWarning ? "#f59e0b" : "#ef4444";
  const accuracyLabel = isIgnition ? "IGNITION" : isWarning ? "WARNING" : "FROST";
  const accuracyEmoji = isIgnition ? "🔥" : isWarning ? "⚠️" : "❄️";

  const latexHtml = renderLatex(currentScenario.latexFormula || "A \\implies B");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--p-white)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        position: "relative",
      }}
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: "32px", textAlign: "center" }}
      >
        <span style={{
          fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase",
          color: "var(--t-muted)", fontWeight: 600,
        }}>
          KNOWLEDGE VAULT
        </span>
      </motion.div>

      {/* Intel Card - drops in with flip */}
      <motion.div
        initial={{ y: -80, rotateX: 90, opacity: 0 }}
        animate={{ y: 0, rotateX: 0, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.4,
        }}
        style={{
          width: "100%",
          maxWidth: "560px",
          borderRadius: "16px",
          border: `1.5px solid ${accuracyColor}30`,
          backgroundColor: "var(--p-sheet)",
          boxShadow: `0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px ${accuracyColor}10`,
          overflow: "hidden",
        }}
      >
        {/* Card Header */}
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--p-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <span style={{
              fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
              color: accuracyColor, fontWeight: 700,
            }}>
              {accuracyEmoji} {accuracyLabel}
            </span>
            <h3 style={{
              fontFamily: "Georgia, serif",
              fontSize: "22px",
              fontWeight: 400,
              letterSpacing: "-0.5px",
              color: "var(--t-primary)",
              marginTop: "4px",
            }}>
              {nodeTitle}
            </h3>
          </div>
          <div style={{
            width: "48px", height: "48px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${accuracyColor}20, ${accuracyColor}05)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px",
          }}>
            🎴
          </div>
        </div>

        {/* Invariant Logic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--p-border)",
          }}
        >
          <span style={{
            fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase",
            color: "var(--t-muted)", fontWeight: 600, display: "block", marginBottom: "8px",
          }}>
            THE INVARIANT
          </span>
          <p style={{
            fontSize: "14px", lineHeight: 1.7, color: "var(--t-mid)", margin: 0,
          }}>
            {currentScenario.formalMechanism}
          </p>
        </motion.div>

        {/* The Core Logic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--p-border)",
          }}
        >
          <span style={{
            fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase",
            color: "var(--t-muted)", fontWeight: 600, display: "block", marginBottom: "8px",
          }}>
            THE FORMAL MECHANISM
          </span>
          <p style={{
            fontSize: "15px", lineHeight: 1.7, color: "var(--t-primary)", margin: 0, fontWeight: 500,
          }}>
            {currentScenario.formalMechanism}
          </p>
        </motion.div>

        {/* LaTeX Formula */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid var(--p-border)",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "var(--p-surface)",
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: latexHtml }}
            style={{ fontSize: "18px" }}
          />
        </motion.div>

        {/* The "So What?" */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--p-border)",
          }}
        >
          <span style={{
            fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase",
            color: "var(--snap)", fontWeight: 700, display: "block", marginBottom: "8px",
          }}>
            THE &ldquo;SO WHAT?&rdquo;
          </span>
          <p style={{
            fontSize: "15px", lineHeight: 1.8, color: "var(--t-deep)", margin: 0,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          }}>
            {currentScenario.soWhat}
          </p>
        </motion.div>

        {/* Tags from title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          style={{
            padding: "16px 28px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {nodeTitle.split(" ").map((word: string, i: number) => (
            <span key={i} style={{
              padding: "4px 12px",
              borderRadius: "6px",
              backgroundColor: "var(--focus-tint)",
              color: "var(--focus)",
              fontSize: "12px",
              fontWeight: 600,
            }}>
              {word}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Action: Proceed to Stress Test */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          useArceStore.setState({ currentPhase: "evaluation" });
        }}
        disabled={isLoading}
        style={{
          marginTop: "32px",
          padding: "14px 40px",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--p-white)",
          backgroundColor: "var(--snap)",
          border: "none",
          borderRadius: "10px",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? "GENERATING STRESS TEST..." : "STRESS TEST THIS LOGIC →"}
      </motion.button>

      {/* Skip to next node */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        onClick={() => {
          useArceStore.setState({ currentPhase: "synchronization" });
        }}
        style={{
          marginTop: "12px",
          background: "none",
          border: "none",
          color: "var(--t-muted)",
          fontSize: "13px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Skip to next node →
      </motion.button>
    </motion.div>
  );
}
