"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useArceStore } from "@/store/arceStore";

export default function ReviewPhase() {
  const { currentScenario, nodeResults } = useArceStore();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!currentScenario) {
    return null;
  }

  const nodeId = currentScenario.nodeId || currentScenario.id;
  const result = nodeResults[nodeId];

  if (!result) {
    return null;
  }

  // Only show if accuracy is frost or warning (not ignition)
  if (result.accuracy === "ignition") {
    return null;
  }

  const handleRetry = () => {
    setIsRetrying(true);
    // Reset to challenge phase for this node
    useArceStore.setState({
      currentPhase: "challenge",
    });
    setIsRetrying(false);
  };

  const handleContinue = () => {
    // Accept the answer and move forward despite lower score
    useArceStore.setState({
      currentPhase: "transition",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(10, 10, 12, 0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        padding: "24px",
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          style={{
            fontSize: "64px",
            marginBottom: "16px",
          }}
        >
          {result.accuracy === "frost" ? "❄️" : "⚠️"}
        </motion.div>

        <h2 style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "#f0f2ec",
          marginBottom: "12px",
          fontFamily: "Georgia, serif",
        }}>
          {result.accuracy === "frost" ? "Concept Not Yet Mastered" : "Partial Understanding"}
        </h2>

        <p style={{
          fontSize: "16px",
          color: "rgba(240, 242, 236, 0.7)",
          lineHeight: 1.6,
          marginBottom: "24px",
        }}>
          {result.feedback}
        </p>
      </div>

      {/* Guidance Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          backgroundColor: "rgba(255, 92, 53, 0.1)",
          border: "1px solid rgba(255, 92, 53, 0.3)",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
        }}
      >
        <h3 style={{
          fontSize: "14px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "#ff5c35",
          marginBottom: "12px",
        }}>
          What to Review
        </h3>
        <div style={{
          fontSize: "14px",
          color: "rgba(240, 242, 236, 0.8)",
          lineHeight: 1.8,
        }}>
          <div><strong>Formal Mechanism:</strong></div>
          <p style={{ margin: "8px 0 16px 0", fontFamily: "monospace", fontSize: "12px", color: "#22c55e" }}>
            {currentScenario.formalMechanism}
          </p>

          <div><strong>Key Question:</strong></div>
          <p style={{ margin: "8px 0", fontSize: "13px" }}>
            {currentScenario.dominoQuestion}
          </p>

          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255, 92, 53, 0.2)" }}>
            <strong>Why This Matters:</strong>
            <p style={{ margin: "8px 0 0 0", fontSize: "13px" }}>
              {currentScenario.soWhat}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          style={{
            flex: 1,
            padding: "14px 24px",
            backgroundColor: "#ff5c35",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            cursor: isRetrying ? "not-allowed" : "pointer",
            opacity: isRetrying ? 0.6 : 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => !isRetrying && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {isRetrying ? "Retrying..." : "🔄 TRY AGAIN"}
        </button>

        <button
          onClick={handleContinue}
          style={{
            flex: 1,
            padding: "14px 24px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Continue Anyway
        </button>
      </motion.div>

      {/* Hint Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.4)",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        💡 Remember: The domino effect traces HOW one change cascades into others. Focus on cause → effect chains.
      </motion.p>
    </motion.div>
  );
}
