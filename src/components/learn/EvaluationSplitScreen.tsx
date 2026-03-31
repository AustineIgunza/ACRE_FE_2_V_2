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
  const { currentNode, currentIntelCard, currentStressTest, synchronizeAndAdvance, isLoading } = useArceStore();
  const [stressResponse, setStressResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!currentNode || !currentIntelCard || !currentStressTest) return null;

  const latexHtml = renderLatex(currentIntelCard.latexFormula || "");

  const handleStressSubmit = () => {
    setSubmitted(true);
    // After a brief moment, synchronize
    setTimeout(() => {
      synchronizeAndAdvance();
    }, 2000);
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
            {currentStressTest.updatedDashboardIndicator}
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
          <strong style={{ color: "#f59e0b" }}>Counter-Variable:</strong> {currentStressTest.counterVariable}
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
            {currentStressTest.stressQuestion}
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
          💡 {currentStressTest.hint}
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
              style={{
                marginTop: "16px", width: "100%",
                padding: "14px 32px", fontSize: "13px", fontWeight: 700,
                letterSpacing: "1px", textTransform: "uppercase",
                color: "#fff", backgroundColor: "#ff5c35",
                border: "none", borderRadius: "10px", cursor: "pointer",
              }}
            >
              COMPLETE NODE
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#22c55e", fontWeight: 700, fontSize: "14px", margin: 0 }}>
              ✓ Node Complete — Synchronizing...
            </p>
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
          padding: "40px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <span style={{
          fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
          color: "var(--t-muted)", fontWeight: 600, marginBottom: "20px",
        }}>
          INTEL CARD — REFERENCE
        </span>

        {/* Mini Intel Card */}
        <div style={{
          borderRadius: "12px",
          border: "1px solid var(--p-border)",
          backgroundColor: "var(--p-sheet)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--p-border)" }}>
            <h4 style={{
              fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 400,
              letterSpacing: "-0.3px", color: "var(--t-primary)", margin: 0,
            }}>
              {currentIntelCard.title}
            </h4>
          </div>

          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--p-border)" }}>
            <p style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--t-mid)", margin: 0 }}>
              {currentIntelCard.formalMechanism}
            </p>
          </div>

          <div style={{
            padding: "16px 20px",
            backgroundColor: "var(--p-surface)",
            display: "flex",
            justifyContent: "center",
            borderBottom: "1px solid var(--p-border)",
          }}>
            <div dangerouslySetInnerHTML={{ __html: latexHtml }} style={{ fontSize: "14px" }} />
          </div>

          <div style={{ padding: "16px 20px" }}>
            <p style={{
              fontSize: "13px", lineHeight: 1.7, color: "var(--t-deep)", margin: 0,
              fontStyle: "italic", fontFamily: "Georgia, serif",
            }}>
              {currentIntelCard.soWhat}
            </p>
          </div>
        </div>

        {/* Keywords */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "16px" }}>
          {currentIntelCard.keywords.map((kw, i) => (
            <span key={i} style={{
              padding: "3px 10px", borderRadius: "5px",
              backgroundColor: "var(--focus-tint)", color: "var(--focus)",
              fontSize: "11px", fontWeight: 600,
            }}>
              {kw}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
