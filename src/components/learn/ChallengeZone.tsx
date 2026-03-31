"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useArceStore } from "@/store/arceStore";

export default function ChallengeZone() {
  const {
    currentNode,
    document,
    currentNodeIndex,
    userDominoChain,
    setUserDominoChain,
    submitDominoChain,
    isLoading,
    error,
    completedNodeIds,
  } = useArceStore();

  const [showPulse, setShowPulse] = useState(true);

  if (!currentNode) return null;

  const totalNodes = document?.nodes.length || 0;
  const progress = totalNodes > 0 ? ((currentNodeIndex) / totalNodes) * 100 : 0;

  const handleSubmit = async () => {
    await submitDominoChain();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0c",
        color: "#e8e6e0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Glow */}
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(255,92,53,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top Bar: Progress + Node Counter */}
      <div style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: "#ff5c35",
            boxShadow: "0 0 12px rgba(255,92,53,0.6)",
          }} />
          <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            CHALLENGE ZONE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            NODE {currentNodeIndex + 1} / {totalNodes}
          </span>
          <div style={{ width: "120px", height: "3px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              style={{ height: "100%", backgroundColor: "#ff5c35", borderRadius: "2px" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        maxWidth: "800px",
        margin: "0 auto",
        width: "100%",
      }}>
        {/* Dashboard Indicator */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,92,53,0.08)",
            border: "1px solid rgba(255,92,53,0.15)",
            marginBottom: "32px",
            display: "flex", alignItems: "center", gap: "10px",
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }}
          />
          <span style={{ fontSize: "13px", color: "#ff8860", fontWeight: 600, fontFamily: "monospace" }}>
            {currentNode.dashboard_indicator || "SYSTEM ALERT"}
          </span>
        </motion.div>

        {/* Node Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 400,
            letterSpacing: "-0.8px",
            color: "#f0f2ec",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {currentNode.title}
        </motion.h2>

        {/* Crisis Context */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: "15px",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            marginBottom: "32px",
            maxWidth: "650px",
          }}
        >
          {currentNode.crisis_context}
        </motion.p>

        {/* Domino Question */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            width: "100%",
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "24px",
          }}
        >
          <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#ff5c35", fontWeight: 600, display: "block", marginBottom: "12px" }}>
            PREDICTIVE QUESTION
          </span>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: "17px",
            fontWeight: 500,
            color: "#f0f2ec",
            lineHeight: 1.7,
            margin: 0,
          }}>
            {currentNode.domino_question}
          </p>
        </motion.div>

        {/* Domino Chain Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ width: "100%" }}
        >
          <textarea
            value={userDominoChain}
            onChange={(e) => setUserDominoChain(e.target.value)}
            placeholder="Trace the Domino Effect... What happens first? Then what? Follow the chain."
            disabled={isLoading}
            style={{
              width: "100%",
              minHeight: "140px",
              padding: "20px",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#f0f2ec",
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(255,92,53,0.4)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          />

          {/* Character Counter */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontSize: "12px", color: userDominoChain.length < 20 ? "rgba(255,92,53,0.6)" : "rgba(255,255,255,0.2)" }}>
              {userDominoChain.length < 20 ? `${20 - userDominoChain.length} more characters needed` : "✓ Ready"}
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              {userDominoChain.length} chars
            </span>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ marginTop: "16px", padding: "12px 20px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "14px", width: "100%", textAlign: "center" }}>
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,92,53,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isLoading || userDominoChain.trim().length < 20}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "16px 32px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#fff",
            backgroundColor: userDominoChain.trim().length >= 20 ? "#ff5c35" : "rgba(255,92,53,0.3)",
            border: "none",
            borderRadius: "10px",
            cursor: isLoading || userDominoChain.trim().length < 20 ? "not-allowed" : "pointer",
            transition: "all 0.3s",
          }}
        >
          {isLoading ? "ANALYZING CHAIN..." : "SUBMIT DOMINO CHAIN"}
        </motion.button>
      </div>
    </motion.div>
  );
}
